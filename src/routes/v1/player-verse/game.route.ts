import { Router } from 'express';
import { auth } from '@/middlewares/auth';
import { authApiKey } from '@/middlewares/auth-api-key';
import { GameController } from '@/controllers/player-verse';
import { extractFilters } from '@/middlewares/gameTokensFilter';
import { extractSortAndPagination } from '@/middlewares/sortAndPagination';

const router = Router();

router.route('/my').get(auth(), authApiKey, GameController.getGame);

router
  .route('/catalog')
  .get(auth(), authApiKey, extractSortAndPagination, extractFilters, GameController.getCatalog);

export const GameRoute = {
  router,
};

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: Games API
 */

/**
 * @swagger
 * /games/my:
 *   get:
 *     summary: Get a game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
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
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Game'
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
 * /games/catalog:
 *   get:
 *     summary: Get a game catalog
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
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
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           gameId:
 *                             type: string
 *                           cap:
 *                             type: string
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                           minted:
 *                             type: string
 *                           imageUrl:
 *                             type: string
 *                           sale:
 *                             type: object
 *                           chainName:
 *                             type: string
 *                           symbol:
 *                             type: string
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
