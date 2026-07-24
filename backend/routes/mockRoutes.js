import { Router } from 'express';
import { handleMockRequest } from '../controllers/mockController.js';

const router = Router();

// Catch ALL HTTP methods for any sub-path under /mock/:schemaId
// Examples:
//   GET    /mock/abc-123/users
//   POST   /mock/abc-123/pets
//   DELETE /mock/abc-123/orders/456
router.all('/:schemaId/*', handleMockRequest);

export default router;
