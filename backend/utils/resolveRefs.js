/**
 * Recursively resolve JSON Schema $ref pointers against a root document
 * Supports Swagger 2.0 (#/definitions/X) and OpenAPI 3.0 (#/components/schemas/X)
 */

export const resolveRefs = (obj, root) => {
  if (!obj || typeof obj !== 'object') return obj;

  // Handle $ref
  if (obj.$ref && typeof obj.$ref === 'string') {
    const path = obj.$ref.replace(/^#\//, '').split('/');
    let resolved = root;

    for (const key of path) {
      if (resolved && typeof resolved === 'object' && key in resolved) {
        resolved = resolved[key];
      } else {
        // Ref not found — return generic object fallback
        return { type: 'object' };
      }
    }

    // Recursively resolve refs inside the resolved object
    return resolveRefs(resolved, root);
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => resolveRefs(item, root));
  }

  // Handle objects
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = resolveRefs(value, root);
  }
  return result;
};