import { Router } from 'express';
import { useGame } from '@/middlewares/game';
import { ACCESS_RIGHTS } from '@/config/roles';
import { GameValidation } from '@/validations';
import { googleAuth } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { authApiKey } from '@/middlewares/auth-api-key';
import { GameController } from '@/controllers/admin/game.controller';

const router = Router();

router
  .route('/')
  .post(googleAuth(ACCESS_RIGHTS.MANAGE_GAMES), authApiKey, validate(GameValidation.createGame), GameController.createGame);

router
  .route('/contracts')
  .post(
    googleAuth(ACCESS_RIGHTS.MANAGE_GAMES),
    authApiKey,
    validate(GameValidation.deployGameContract),
    GameController.deployGameContract
  );

router
  .route('/my')
  .get(googleAuth(ACCESS_RIGHTS.GET_GAMES), authApiKey, validate(GameValidation.getGames), useGame, GameController.getMyGame)
  .put(
    googleAuth(ACCESS_RIGHTS.MANAGE_GAMES),
    authApiKey,
    validate(GameValidation.mutateGameStyleConfig),
    useGame,
    GameController.mutateGame
  );

//TODO: Only Admin (not a game owner) currently no user should have access to this endpoint
router
  .route('/:id')
  .get(googleAuth(ACCESS_RIGHTS.GET_GAMES), authApiKey, validate(GameValidation.getGame), GameController.getGame)
  .put(googleAuth(ACCESS_RIGHTS.MANAGE_GAMES), authApiKey, validate(GameValidation.mutateGame), useGame, GameController.mutateGame)
  .delete(googleAuth(ACCESS_RIGHTS.MANAGE_GAMES), authApiKey, validate(GameValidation.removeGame), GameController.removeGame);

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
 * /games:
 *   post:
 *     summary: Create a game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - mediaUrl
 *               - chainName
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               mediaUrl:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               chainName:
 *                 type: string
 *               config:
 *                 type: objectGameConfig
 *                 properties:
 *                   $ref: "#/components/schemas/GameConfig"
 *               gameConfig:
 *                 type: object
 *                 properties:
 *                   $ref: "#components/schemas/GameEmailConfig"
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
 * /games/my:
 *   get:
 *     summary: Get my game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACTIVE, INACTIVE, REMOVED]
 *         description: status for sorting
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by field name
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [DESC, ASC]
 *         description: order by ascending or descending
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: page limit for pagination
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: page number for pagination
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
 *                       results:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Game'
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
 * /games/my/{id}:
 *   put:
 *     summary: update a game style config
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: Game Id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               config:
 *                 type: object
 *                 properties:
 *                   $ref: '#/components/schemas/GameConfig'
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       results:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Game'
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
 * /games/{id}:
 *   get:
 *     summary: Get a game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: Game Id
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
 *
 *   put:
 *     summary: Update the game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: Game Id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               mediaUrl:
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
 *
 *   delete:
 *     summary: Delete the game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: Game Id
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
