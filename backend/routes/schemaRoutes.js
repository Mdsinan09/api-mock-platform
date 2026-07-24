import { Router } from 'express';
import { body } from 'express-validator';
import {
  uploadSchema,
  getAllSchemas,
  getSchemaById,
  getEndpoints
} from '../controllers/schemaController.js';

const router = Router();

router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 255 })
      .withMessage('Name must be under 255 chars'),
    body('openapi_json')
      .isObject()
      .withMessage('openapi_json must be a valid JSON object')
  ],
  uploadSchema
);

router.get('/', getAllSchemas);
router.get('/:id', getSchemaById);
router.get('/:id/endpoints', getEndpoints);

export default router;
