import { Router } from 'express';
import { ACCESS_RIGHTS } from '@/config/roles';
import { googleAuth } from '@/middlewares/auth';
import { Web3Controller } from '@/controllers/admin';
import { authApiKey } from '@/middlewares/auth-api-key';

const router = Router();

router
  .route('/')
  .get(googleAuth(ACCESS_RIGHTS.GET_AVAILABLE_NETWORKS), authApiKey, Web3Controller.getAvailableNetworks);

export const Web3Route = {
  router,
};

/**
 * @swagger
 * tags:
 *   name: Web3
 *   description: Web3 API
 */

/**
 * @swagger
 * /networks:
 *   get:
 *     summary: Get web3 available networks
 *     tags: [Web3]
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
 *                     $ref: '#/components/schemas/Networks'
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
