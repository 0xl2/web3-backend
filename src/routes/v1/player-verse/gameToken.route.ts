import { Router } from 'express';
import { auth } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { GameTokenValidation } from '@/validations';
import { authApiKey } from '@/middlewares/auth-api-key';
import { GameTokenController } from '@/controllers/player-verse';
import { extractSortAndPagination } from '@/middlewares/sortAndPagination';

const router = Router();

router
  .route('/:gameId')
  .get(
    auth(),
    authApiKey,
    validate(GameTokenValidation.getAllPublicGameTokens),
    extractSortAndPagination,
    GameTokenController.getAllGameTokens
  )

// router
//   .route('/:gameId/:id')
//   .get(
//     auth(),
//     authApiKey,
//     validate(GameTokenValidation.getPublicGameToken),
//     GameTokenController.getGameToken
//   )

  export const GameTokenRoute = {
  router,
};

// /**
//  * @swagger
//  * /game-tokens/{gameId}:
//  *   get:
//  *     summary: Get all game tokens for game
//  *     tags: [GameTokens]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: gameId
//  *         schema:
//  *           type: string
//  *         description: Game Id
//  *     responses:
//  *       "200":
//  *         description: OK
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: "OK"
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     results:
//  *                       type: array
//  *                       items:
//  *                         oneOf:
//  *                           - $ref: '#/components/schemas/GameToken'
//  *                 meta:
//  *                   type: object
//  *                   properties:
//  *                     pagination:
//  *                       type: object
//  *                       properties:
//  *                         page:
//  *                           type: number
//  *                         limit:
//  *                           type: number
//  *                         totalPages:
//  *                           type: number
//  *                         totalResults:
//  *                           type: number
//  *                 error:
//  *                   type: string
//  *       "401":
//  *         $ref: '#/components/responses/Unauthorized'
//  *       "403":
//  *         $ref: '#/components/responses/Forbidden'
//  */

// /**
//  * @swagger
//  * /game-tokens/{gameId}/{id}:
//  *   get:
//  *     summary: Get game token by id and gameId
//  *     tags: [GameTokens]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         description: Game Token Id
//  *       - in: path
//  *         name: gameId
//  *         schema:
//  *           type: string
//  *         description: Game Id
//  *     responses:
//  *       "200":
//  *         description: OK
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: "OK"
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     token:
//  *                       $ref: '#/components/schemas/GameToken'
//  *                 meta:
//  *                   type: object
//  *                   properties:
//  *                     pagination:
//  *                       type: object
//  *                       properties:
//  *                         page:
//  *                           type: number
//  *                         limit:
//  *                           type: number
//  *                         totalPages:
//  *                           type: number
//  *                         totalResults:
//  *                           type: number
//  *                 error:
//  *                   type: string
//  *       "401":
//  *         $ref: '#/components/responses/Unauthorized'
//  *       "403":
//  *         $ref: '#/components/responses/Forbidden'
//  */
