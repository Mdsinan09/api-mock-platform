import { validationResult } from 'express-validator';
import Schema from '../models/Schema.js';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];

export const uploadSchema = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, openapi_json } = req.body;
    const schema = await Schema.create({ name, openapi_json });
    return res.status(201).json(schema);
  } catch (error) {
    next(error);
  }
};

export const getAllSchemas = async (req, res, next) => {
  try {
    const schemas = await Schema.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(schemas);
  } catch (error) {
    next(error);
  }
};

export const getSchemaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schema = await Schema.findByPk(id);

    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }

    return res.json(schema);
  } catch (error) {
    next(error);
  }
};

export const getEndpoints = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schema = await Schema.findByPk(id);

    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }

    const openapi = schema.openapi_json || {};
    const paths = openapi.paths || {};
    const endpoints = [];

    for (const [path, methods] of Object.entries(paths)) {
      if (!methods || typeof methods !== 'object') {
        continue;
      }

      for (const [method, details] of Object.entries(methods)) {
        if (!HTTP_METHODS.includes(method.toLowerCase())) {
          continue;
        }
        if (!details || typeof details !== 'object') {
          continue;
        }

        const responses = details.responses || {};
        const responseEntries = {};

        for (const [statusCode, response] of Object.entries(responses)) {
          const content = response.content || {};
          const jsonContent = content['application/json'] || {};
          responseEntries[statusCode] = {
            description: response.description || '',
            schema: jsonContent.schema || null
          };
        }

        endpoints.push({
          path,
          method: method.toUpperCase(),
          summary: details.summary || '',
          operationId: details.operationId || '',
          responses: responseEntries
        });
      }
    }

    return res.json(endpoints);
  } catch (error) {
    next(error);
  }
};
