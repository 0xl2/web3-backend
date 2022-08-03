import { Router } from 'express';
import { useGame } from '@/middlewares/game';
import { ACCESS_RIGHTS } from '@/config/roles';
import { googleAuth } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { GameTokenValidation } from '@/validations';
import { authApiKey } from '@/middlewares/auth-api-key';
import { extractSortAndPagination } from '@/middlewares/sortAndPagination';
import { GameTokenController } from '@/controllers/admin/gameToken.controller';

const router = Router();

router
  .route('/')
  .get(
    googleAuth(ACCESS_RIGHTS.GET_GAME_TOKENS),
    authApiKey,
    validate(GameTokenValidation.getAllGameTokens),
    useGame,
    extractSortAndPagination,
    GameTokenController.getAllGameTokens
  )
  .post(
    googleAuth(ACCESS_RIGHTS.MANAGE_GAME_TOKENS),
    authApiKey,
    validate(GameTokenValidation.createGameToken),
    useGame,
    GameTokenController.createGameToken
  );

router
  .route('/count')
  .get(
    googleAuth(ACCESS_RIGHTS.GET_GAME_TOKENS),
    authApiKey,
    validate(GameTokenValidation.getGameTokenCount),
    useGame,
    GameTokenController.getGameTokenCount
  );

router
  .route('/:id')
  .get(googleAuth(ACCESS_RIGHTS.GET_GAME_TOKENS), authApiKey, validate(GameTokenValidation.getGameToken), GameTokenController.getGameToken)
  .delete(
    googleAuth(ACCESS_RIGHTS.MANAGE_GAME_TOKENS),
    authApiKey,
    validate(GameTokenValidation.removeGameToken),
    useGame,
    GameTokenController.deleteGameToken
  );

router
  .route('/:id/prop')
  .put(
    googleAuth(ACCESS_RIGHTS.MANAGE_GAME_TOKENS),
    authApiKey,
    validate(GameTokenValidation.mutateGameToken),
    useGame,
    GameTokenController.mutateGameToken
  )
  .delete(
    googleAuth(ACCESS_RIGHTS.MANAGE_GAME_TOKENS),
    authApiKey,
    validate(GameTokenValidation.removeGameTokenProperty),
    useGame,
    GameTokenController.removeGameTokenProperty
  );

export const GameTokenRoute = {
  router,
};

/**
 * @swagger
 * /game-tokens:
 *   get:
 *     summary: Get all game tokens for game
 *     tags: [GameTokens]
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
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         oneOf:
 *                           - $ref: '#/components/schemas/GameToken'
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
 *   post:
 *     summary: Create new game game token
 *     tags: [GameTokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               cap:
 *                 type: number
 *               type:
 *                 type: string
 *               sale:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   price:
 *                     type: number
 *               attributes:
 *                 type: object
 *                 properties:
 *                   damage:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [checkbox, text, range, enum]
 *                       values:
 *                         type: array
 *                         items:
 *                           type: string
 *                         default: null
 *                       autoSelected:
 *                         type: boolean
 *                         default: false
 *                       autoSelectedValue:
 *                         type: string
 *                         default: null
 *               imageUrl:
 *                 type: string
 *               symbol:
 *                 type: string
 *               chainName:
 *                 type: string
 *     responses:
 *       "200":
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
 *                     id:
 *                       type: string
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
 * /game-tokens/count:
 *   get:
 *     summary: Get all game tokens count
 *     tags: [GameTokens]
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
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
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
 * /game-tokens/{id}:
 *   get:
 *     summary: Get game token by id
 *     tags: [GameTokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: Game Token Id
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
 *                     token:
 *                       $ref: '#/components/schemas/GameToken'
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
 *   delete:
 *     summary: Delete Game Token By Id
 *     tags: [GameTokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: Game Token Id
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
 * /game-tokens/{id}/prop:
 *   put:
 *     summary: Add or update the prop
 *     tags: [GameTokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: Game Token Id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               damage:
 *                 type: string
 *
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
 *   delete:
 *     summary: Remove Game Token Prop
 *     tags: [GameTokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: Game Token Id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
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
