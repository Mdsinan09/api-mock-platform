/**
 * Custom realistic mock data generator from JSON Schema.
 * Used as a fallback when OpenAI is unavailable or fails.
 */

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'
];

const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'example.org'];
const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const COUNTRIES = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia', 'Japan', 'Brazil'];
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'black', 'white'];
const COMPANIES = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Corp', 'Hooli', 'Massive Dynamic', 'Stark Industries'];
const STATUSES = ['active', 'inactive', 'pending', 'completed', 'archived'];
const ROLES = ['admin', 'user', 'editor', 'viewer', 'moderator'];
const TYPES = ['standard', 'premium', 'basic', 'enterprise', 'trial'];
const STREETS = ['Main', 'Oak', 'Pine', 'Cedar', 'Maple', 'Elm', 'Washington', 'Lake'];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

/**
 * Main entry: generate realistic mock data from a JSON Schema
 * @param {Object} schema - JSON Schema object
 * @returns {any} - Mock data matching the schema
 */
export const generateFallback = (schema) => {
  if (!schema) return null;
  return generateValue(schema, '');
};

const generateValue = (schema, keyHint = '') => {
  // Handle $ref if present (basic dereference — assumes inline refs)
  if (schema.$ref && typeof schema.$ref === 'string') {
    return generateValue({ type: 'object' }, keyHint);
  }

  // Handle anyOf / oneOf — pick first
  if (schema.anyOf && schema.anyOf.length > 0) {
    return generateValue(schema.anyOf[0], keyHint);
  }
  if (schema.oneOf && schema.oneOf.length > 0) {
    return generateValue(schema.oneOf[0], keyHint);
  }

  // Handle enum
  if (schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0) {
    return randomFrom(schema.enum);
  }

  const type = schema.type || inferType(schema);

  switch (type) {
    case 'string': return generateString(schema, keyHint);
    case 'number': return generateNumber(schema);
    case 'integer': return generateInteger(schema);
    case 'boolean': return Math.random() < 0.5;
    case 'array': return generateArray(schema);
    case 'object': return generateObject(schema);
    case 'null': return null;
    default: return null;
  }
};

const inferType = (schema) => {
  if (schema.properties) return 'object';
  if (schema.items) return 'array';
  if (schema.enum) return 'string';
  return 'string';
};

const generateString = (schema, keyHint) => {
  const hint = keyHint.toLowerCase();
  const format = schema.format;

  if (format === 'email' || hint.includes('email')) {
    const first = randomFrom(FIRST_NAMES).toLowerCase();
    const last = randomFrom(LAST_NAMES).toLowerCase();
    return `${first}.${last}@${randomFrom(DOMAINS)}`;
  }

  if (format === 'date' || hint.includes('date')) {
    const d = new Date(Date.now() - Math.random() * 1e10);
    return d.toISOString().split('T')[0];
  }

  if (format === 'date-time' || hint.includes('datetime')) {
    return new Date(Date.now() - Math.random() * 1e10).toISOString();
  }

  if (format === 'uuid' || hint.includes('uuid')) {
    return generateUUID();
  }

  if (hint.includes('name')) {
    if (hint.includes('first')) return randomFrom(FIRST_NAMES);
    if (hint.includes('last')) return randomFrom(LAST_NAMES);
    if (hint.includes('full') || hint.includes('display')) {
      return `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
    }
    return `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
  }

  if (hint.includes('phone') || hint.includes('mobile') || hint.includes('tel')) {
    return `+1 (${randomInt(100, 999)}) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
  }

  if (hint.includes('address') && !hint.includes('email')) {
    return `${randomInt(100, 9999)} ${randomFrom(STREETS)} St, ${randomFrom(CITIES)}`;
  }

  if (hint.includes('city')) return randomFrom(CITIES);
  if (hint.includes('country')) return randomFrom(COUNTRIES);
  if (hint.includes('zip') || hint.includes('postal')) return String(randomInt(10000, 99999));
  if (hint.includes('state')) return randomFrom(['CA', 'NY', 'TX', 'FL', 'IL']);

  if (hint.includes('url') || hint.includes('link') || hint.includes('href') || hint.includes('website')) {
    return `https://example.com/${Math.random().toString(36).substring(7)}`;
  }

  if (hint.includes('image') || hint.includes('avatar') || hint.includes('photo') || hint.includes('picture')) {
    return `https://picsum.photos/seed/${randomInt(1, 1000)}/200/200`;
  }

  if (hint.includes('color')) return randomFrom(COLORS);

  if (hint.includes('description') || hint.includes('bio') || hint.includes('comment') || hint.includes('note')) {
    return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.';
  }

  if (hint.includes('title') || hint.includes('subject') || hint.includes('headline')) {
    return `Sample ${randomFrom(['Title', 'Headline', 'Subject'])} ${randomInt(1, 100)}`;
  }

  if (hint.includes('status')) return randomFrom(STATUSES);
  if (hint.includes('role')) return randomFrom(ROLES);
  if (hint.includes('type')) return randomFrom(TYPES);

  if (hint.includes('company') || hint.includes('organization') || hint.includes('org')) {
    return randomFrom(COMPANIES);
  }

  if (hint.includes('id') || hint.includes('identifier') || hint.includes('sku') || hint.includes('code')) {
    return generateUUID().split('-')[0].toUpperCase();
  }

  if (hint.includes('password') || hint.includes('secret') || hint.includes('token')) {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  if (hint.includes('category') || hint.includes('tag') || hint.includes('label')) {
    return randomFrom(['general', 'tech', 'business', 'science', 'health', 'sports']);
  }

  if (hint.includes('currency') || hint.includes('price') || hint.includes('amount')) {
    return randomFrom(['USD', 'EUR', 'GBP', 'JPY', 'CAD']);
  }

  // Default realistic string
  const words = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'theta', 'kappa'];
  return `${randomFrom(words)}-${randomInt(100, 999)}`;
};

const generateNumber = (schema) => {
  const min = schema.minimum ?? 0;
  const max = schema.maximum ?? 1000;
  const value = Math.random() * (max - min) + min;
  return schema.multipleOf ? Math.round(value / schema.multipleOf) * schema.multipleOf : parseFloat(value.toFixed(2));
};

const generateInteger = (schema) => {
  const min = schema.minimum ?? 0;
  const max = schema.maximum ?? 100;
  return randomInt(min, max);
};

const generateArray = (schema) => {
  const count = schema.minItems ? randomInt(schema.minItems, schema.minItems + 2) : randomInt(2, 3);
  const items = schema.items || {};
  return Array.from({ length: count }, () => generateValue(items));
};

const generateObject = (schema) => {
  const result = {};
  const properties = schema.properties || {};
  const required = schema.required || [];

  for (const [key, propSchema] of Object.entries(properties)) {
    // 20% chance to omit non-required fields for realism
    if (!required.includes(key) && Math.random() < 0.2) continue;
    result[key] = generateValue(propSchema, key);
  }

  // Handle additionalProperties
  if (schema.additionalProperties === true) {
    result[randomFrom(['extra', 'meta', 'detail', 'info'])] = generateValue({ type: 'string' });
  }

  return result;
};
