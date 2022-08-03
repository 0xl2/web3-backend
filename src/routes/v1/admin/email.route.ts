import { Router } from 'express';
import { useGame } from '@/middlewares/game';
import { ACCESS_RIGHTS } from '@/config/roles';
import { googleAuth } from '@/middlewares/auth';
import { EmailValidation } from '@/validations';
import { validate } from '@/middlewares/validate';
import { authApiKey } from '@/middlewares/auth-api-key';
import { EmailController } from '@/controllers/admin/email.controller';

const router = Router();

router.post('/', googleAuth(), authApiKey, validate(EmailValidation.sendEmail), useGame, EmailController.sendEmail);

export const EmailRoute = {
  router,
};

/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Email Service
 */

/**
 * @swagger
 * /email:
 *   post:
 *     summary: Send email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - action
 *             properties:
 *               playerId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [LOGIN_INVITE]
 *                 description: action type
 *             example:
 *               playerId: 6295627f57ca108acfb3843b
 *               action: LOGIN_INVITE
 *     responses:
 *       "200":
 *         description: Sent
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
 *                 error:
 *                   type: string
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 */
