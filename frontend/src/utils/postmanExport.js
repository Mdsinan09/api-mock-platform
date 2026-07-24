/**
 * Converts an OpenAPI specification object into a Postman Collection v2.1 JSON
 */
export function exportToPostmanCollection(schema, baseUrl) {
  const openapi = schema.openapi_json || {};
  const info = openapi.info || {};
  const paths = openapi.paths || {};

  const collection = {
    info: {
      name: `${schema.name} (Mock Collection)`,
      description: info.description || `Postman collection exported from API Mock Platform for ${schema.name}`,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: []
  };

  for (const [pathStr, methods] of Object.entries(paths)) {
    if (!methods || typeof methods !== 'object') continue;

    for (const [methodStr, operation] of Object.entries(methods)) {
      if (['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].indexOf(methodStr.toLowerCase()) === -1) continue;

      const methodUpper = methodStr.toUpperCase();
      const fullUrl = `${baseUrl}${pathStr}`;
      const urlParts = fullUrl.replace(/^https?:\/\//, '').split('/');
      const host = urlParts[0] ? [urlParts[0]] : [];
      const pathSegments = urlParts.slice(1);

      collection.item.push({
        name: operation.summary || `${methodUpper} ${pathStr}`,
        request: {
          method: methodUpper,
          header: [
            {
              key: 'Accept',
              value: 'application/json'
            }
          ],
          url: {
            raw: fullUrl,
            protocol: baseUrl.startsWith('https') ? 'https' : 'http',
            host: host,
            path: pathSegments
          },
          description: operation.description || operation.summary || ''
        },
        response: []
      });
    }
  }

  const jsonStr = JSON.stringify(collection, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${schema.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_postman_collection.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJsonFile(filename, data) {
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
