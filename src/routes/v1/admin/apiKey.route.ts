import { Router } from 'express';
import { ACCESS_RIGHTS } from '@/config/roles';
import { googleAuth } from '@/middlewares/auth';
import { ApiKeyValidation } from '@/validations';
import { validate } from '@/middlewares/validate';
import { ApiKeyController } from '@/controllers/admin';
import { authApiKey } from '@/middlewares/auth-api-key';

const router = Router();

router
  .route('/my')
  .get(googleAuth(ACCESS_RIGHTS.GET_API_KEYS), validate(ApiKeyValidation.getApiKeysByGame), ApiKeyController.getKeysForGame);

router
  .route('/')
  .post(googleAuth(ACCESS_RIGHTS.MANAGE_API_KEYS), validate(ApiKeyValidation.createApiKey), ApiKeyController.createNewApiKey);

router.route('/:id').delete(googleAuth(ACCESS_RIGHTS.MANAGE_API_KEYS), authApiKey, ApiKeyController.revokeApiKey);

export const ApiKeyRoute = {
  router,
};

/**
 * @swagger
 * tags:
 *   name: ApiKey
 *   description: ApiKeys API
 */

/**
 * @swagger
 * /api-keys/my:
 *   get:
 *     summary: Get Api Keys for user
 *     tags: [ApiKey]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ApiKey'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalResults:
 *                           type: number
 *                 error:
 *                   type: string
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 */

/**
 * @swagger
 * /api-keys:
 *   post:
 *     summary: Create new api key for game
 *     tags: [ApiKey]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       "201":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 data:
 *                   $ref: '#/components/schemas/ApiKey'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalResults:
 *                           type: number
 *                 error:
 *                   type: string
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api-keys/{id}:
 *   delete:
 *     summary: Change status of Api Key
 *     tags: [ApiKey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: ApiKey Id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 data:
 *                   $ref: '#/components/schemas/ApiKey'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalResults:
 *                           type: number
 *                 error:
 *                   type: string
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
