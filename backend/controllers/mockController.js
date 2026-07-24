import Schema from '../models/Schema.js';
import { generateFromSchema } from '../services/mockGenerator.js';
import { resolveRefs } from '../utils/resolveRefs.js';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

/**
 * Handle ALL incoming mock requests
 * Route pattern: /mock/:schemaId/*
 */
export const handleMockRequest = async (req, res, next) => {
  try {
    const { schemaId } = req.params;
    // Express wildcard captures everything after :schemaId (no leading slash)
    const incomingPath = req.params[0] || '';
    const method = req.method.toLowerCase();

    // ── 1. Load schema ──
    const schema = await Schema.findByPk(schemaId);
    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }

    const openapi = schema.openapi_json || {};
    const paths = openapi.paths || {};

    if (Object.keys(paths).length === 0) {
      return res.status(404).json({ error: 'No paths defined in this schema' });
    }

    // ── 2. Match path against OpenAPI paths ──
    const definedPaths = Object.keys(paths);
    const matchedPath = matchPath(incomingPath, definedPaths);

    if (!matchedPath) {
      return res.status(404).json({
        error: `Path /${incomingPath} not found in schema`,
        availablePaths: definedPaths
      });
    }

    const pathItem = paths[matchedPath];

    // ── 3. Check HTTP method ──
    if (!pathItem[method]) {
      const allowedMethods = Object.keys(pathItem)
        .filter((k) => HTTP_METHODS.includes(k))
        .map((k) => k.toUpperCase());

      res.setHeader('Allow', allowedMethods.join(', '));
      return res.status(405).json({
        error: `Method ${req.method} not allowed for ${matchedPath}`,
        allowedMethods
      });
    }

    // ── 4. Resolve response schema ──
    const operation = pathItem[method];
    const responses = operation.responses || {};

    if (Object.keys(responses).length === 0) {
      return res.status(500).json({ error: 'No responses defined for this endpoint' });
    }

    // Prefer a successful response with a schema, then fall back gracefully.
    let responseEntry = null;
    let responseCode = null;
    let inferred = false;
    const codes = Object.keys(responses);

    for (const code of ['200', '201']) {
      if (hasSchema(responses[code])) {
        responseEntry = responses[code];
        responseCode = code;
        break;
      }
    }

    if (!responseEntry) {
      for (const code of codes.filter((code) => code.startsWith('2'))) {
        if (hasSchema(responses[code])) {
          responseEntry = responses[code];
          responseCode = code;
          break;
        }
      }
    }

    if (!responseEntry) {
      for (const code of codes) {
        if (hasSchema(responses[code])) {
          responseEntry = responses[code];
          responseCode = code;
          break;
        }
      }
    }

    // Some specs define error responses but omit a success model. Infer a useful
    // resource schema from the operation/path before returning a schema-less note.
    if (!responseEntry) {
      const fallbackSchema = findFallbackSchema(operation, matchedPath, openapi);
      if (fallbackSchema) {
        responseEntry = { schema: fallbackSchema };
        responseCode = '200 (inferred)';
        inferred = true;
      }
    }

    if (!responseEntry) {
      responseCode = codes[0];
      responseEntry = responses[responseCode];
    }

    // Extract JSON schema from response (supports both OpenAPI 3.0 and Swagger 2.0)
    let responseSchema = null;
    if (responseEntry.content) {
      // OpenAPI 3.0
      const content = responseEntry.content || {};
      const jsonContent =
        content['application/json'] ||
        content['application/json; charset=utf-8'] ||
        content['*/*'] ||
        Object.values(content)[0];
      responseSchema = jsonContent?.schema || null;
    } else if (responseEntry.schema) {
      // Swagger 2.0 direct schema (Pet Store API)
      responseSchema = responseEntry.schema;
    }

    if (!responseSchema) {
      return res.status(200).json({
        _mockNote: `Response ${responseCode} has no schema defined in the OpenAPI spec`,
        _mockStatus: responseCode,
      });
    }

    // ── 5. Generate & return mock data ──
    const resolvedSchema = resolveRefs(responseSchema, openapi);
    const mockData = generateFromSchema(resolvedSchema);

    // Optional: add mock headers for realism
    res.setHeader('X-Mock-Generated', 'true');
    res.setHeader('X-Mock-Schema-Id', schemaId);
    res.setHeader('X-Mock-Response-Code', responseCode);
    if (inferred) res.setHeader('X-Mock-Inferred', 'true');

    return res.status(200).json(mockData);
  } catch (error) {
    next(error);
  }
};

/**
 * Check whether a response entry defines a schema in Swagger 2.0 or OpenAPI 3.
 */
const hasSchema = (response) => {
  if (!response) return false;
  if (response.schema) return true;

  const content = response.content;
  return Boolean(
    content && (
      content['application/json']?.schema ||
      content['application/json; charset=utf-8']?.schema ||
      content['*/*']?.schema ||
      Object.values(content).some((entry) => entry?.schema)
    )
  );
};

/**
 * Infer a resource schema for incomplete specs, such as the Swagger Pet Store.
 */
const findFallbackSchema = (operation, path, openapi) => {
  const operationId = (operation.operationId || '').toLowerCase();
  const normalizedPath = path.toLowerCase();
  const models = {
    Pet: ['pet', 'addpet', 'updatepet', 'updatepetwithform', 'uploadfile', 'getpetbyid', 'findpetsbystatus', 'findpetsbytags', 'deletepet'],
    Order: ['order', 'placeorder', 'getorderbyid', 'deleteorder', 'inventory'],
    User: ['user', 'createuser', 'createuserswitharrayinput', 'createuserswithlistinput', 'updateuser', 'deleteuser', 'getuserbyname', 'loginuser', 'logoutuser'],
  };

  let modelName = Object.entries(models).find(([, keywords]) =>
    keywords.some((keyword) => operationId.includes(keyword))
  )?.[0];

  if (!modelName) {
    if (normalizedPath.includes('/pet')) modelName = 'Pet';
    else if (normalizedPath.includes('/store')) modelName = 'Order';
    else if (normalizedPath.includes('/user')) modelName = 'User';
  }

  if (!modelName) return null;

  if (openapi.definitions?.[modelName]) {
    return { $ref: `#/definitions/${modelName}` };
  }

  if (openapi.components?.schemas?.[modelName]) {
    return { $ref: `#/components/schemas/${modelName}` };
  }

  return null;
};

/**
 * Match an incoming URL path against OpenAPI path templates
 * Handles path params like /pets/{id} matching /pets/123
 * Static paths are checked before parameterized ones
 */
const matchPath = (incomingPath, definedPaths) => {
  // Root path match
  if (!incomingPath || incomingPath === '') {
    return definedPaths.find((p) => p === '/' || p === '') || null;
  }

  // Sort: static paths first (more specific), then parameterized
  const sortedPaths = [...definedPaths].sort((a, b) => {
    const aHasParam = /\{[^}]+\}/.test(a);
    const bHasParam = /\{[^}]+\}/.test(b);
    if (aHasParam && !bHasParam) return 1;
    if (!aHasParam && bHasParam) return -1;
    return b.length - a.length; // Longer = more specific
  });

  for (const defined of sortedPaths) {
    const cleanDefined = defined.replace(/^\/+/, '');

    if (!cleanDefined) continue;

    // Convert {param} to regex capture group, escape everything else
    let regexStr = cleanDefined.replace(/\{[^}]+\}/g, '###PARAM###');
    regexStr = regexStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    regexStr = regexStr.replace(/###PARAM###/g, '([^/]+)');

    const regex = new RegExp(`^${regexStr}$`);

    if (regex.test(incomingPath)) {
      return defined;
    }
  }

  return null;
};
