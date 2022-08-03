import { Router } from 'express';
import { AuthValidation } from '@/validations';
import { validate } from '@/middlewares/validate';
import { AuthController } from '@/controllers/player-verse/auth.controller';

const router = Router();

router.post('/external', validate(AuthValidation.verifyLogin), AuthController.verifyLogin);

export const AuthRoute = {
  router,
};

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /auth/external:
 *   post:
 *     summary: verify login
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: ot
 *         required: true
 *         schema:
 *           type: string
 *         description: The Player external id
 *     responses:
 *       "204":
 *         description: No content
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
 *                     tokens:
 *                       $ref: '#/components/schemas/AuthTokens'
 *                 meta:
 *                   type: object
 *                   properties: null
 *                 error:
 *                   type: string
 *       "401":
 *         description: verify login failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               {
 *                  status: 'ERROR',
 *                  data: {},
 *                  meta: {},
 *                  error: [verify login failed]
 *               }
 */
