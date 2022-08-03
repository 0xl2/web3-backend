import multer from 'multer';
import { Router } from 'express';
import { useGame } from '@/middlewares/game';
import { ACCESS_RIGHTS } from '@/config/roles';
import { googleAuth } from '@/middlewares/auth';
import { FilesValidation } from '@/validations';
import { validate } from '@/middlewares/validate';
import { FilesController } from '@/controllers/admin';
import { authApiKey } from '@/middlewares/auth-api-key';

const router = Router();

const filesMaxSize = 26214400;

const fileUpload = multer({
  limits: {
    fileSize: filesMaxSize,
  },
});

router
  .route('/upload')
  .post(
    googleAuth(ACCESS_RIGHTS.MANAGE_FILES),
    authApiKey,
    fileUpload.single('file'),
    validate(FilesValidation.uploadFile),
    useGame,
    FilesController.uploadFile
  );

export const StorageRoute = {
  router,
};

/**
 * @swagger
 * tags:
 *   name: Storage
 *   description: Storage API
 */

/**
 * @swagger
 * /storage/upload:
 *   post:
 *     summary: Upload file
 *     tags: [Storage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             name: file
 *             type: file
 *             required: true
 *             format: binary
 *             description: The file to upload.
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
 *                       location:
 *                         type: string
 *                         example: 'https://xg-robo-media.s3.amazonaws.com/games/3/temp/5df1f6ad-d104-4322-a76a-f1b7aa35763e.txt'
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
