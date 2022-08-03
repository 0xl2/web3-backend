import { Router } from 'express';
import { useGame } from '@/middlewares/game';
import { ACCESS_RIGHTS } from '@/config/roles';
import { googleAuth } from '@/middlewares/auth';
import { TokenValidation } from '@/validations';
import { validate } from '@/middlewares/validate';
import { authApiKey } from '@/middlewares/auth-api-key';
import { TokenController } from '@/controllers/admin/token.controller';

const router = Router();

router.get('/', googleAuth(ACCESS_RIGHTS.GET_TOKENS), validate(TokenValidation.getToken), TokenController.getToken);

router.post(
  '/mint',
  googleAuth(ACCESS_RIGHTS.MANAGE_TOKENS),
  authApiKey,
  validate(TokenValidation.mintToken),
  useGame,
  TokenController.mintToken
);

router.post(
  '/burn',
  googleAuth(ACCESS_RIGHTS.MANAGE_TOKENS),
  authApiKey,
  validate(TokenValidation.burnToken),
  useGame,
  TokenController.burnToken
);

router.post(
  '/bulk-burn',
  googleAuth(ACCESS_RIGHTS.MANAGE_TOKENS),
  authApiKey,
  validate(TokenValidation.bulkBurnToken),
  useGame,
  TokenController.burnBatchToken
);

export const TokenRoute = {
  router,
};

/**
 * @swagger
 * /mint:
 *   post:
 *     summary: Mint a single token
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               amount:
 *                 type: number
 *               gameTokenId:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               attributes:
 *                 type: object
 *                 properties:
 *                   damage:
 *                     type: string
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
 *                     type: object
 *                     properties:
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
 * /burn:
 *   post:
 *     summary: burn token mappings
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               shortTokenId:
 *                 type: string
 *               amount:
 *                 type: number
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
 *                     type: object
 *                     properties:
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
 * /bulk-burn:
 *   post:
 *     summary: Bulk burn multiple token mappings
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               tokenIds:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     amount:
 *                       type: number
 *                     shortTokenId:
 *                       type: string
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
 *                     type: object
 *                     properties:
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
