import { Router } from 'express';
import { useGame } from '@/middlewares/game';
import { ACCESS_RIGHTS } from '@/config/roles';
import { googleAuth } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { MintedNftValidation } from '@/validations';
import { authApiKey } from '@/middlewares/auth-api-key';
import { MintedNftController } from '@/controllers/admin';
import { extractSortAndPagination } from '@/middlewares/sortAndPagination';

const router = Router();

router
  .route('/')
  .get(
    googleAuth(ACCESS_RIGHTS.GET_MINTED_NFTS),
    authApiKey,
    validate(MintedNftValidation.getMintedQueriedNfts),
    extractSortAndPagination,
    useGame,
    MintedNftController.getAllNfts
  );

router
  .route('/:id')
  .get(googleAuth(ACCESS_RIGHTS.GET_MINTED_NFTS), authApiKey, validate(MintedNftValidation.getMintedNftById), MintedNftController.getNftById);

export const MintedNftRoute = {
  router,
};

/**
 * @swagger
 * tags:
 *   name: MintedNft
 *   description: MintedNFTS API
 */

/**
 * @swagger
 * /nfts:
 *   get:
 *     summary: Get All minted nfts
 *     tags: [MintedNft]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: playerId
 *         schema:
 *           type: string
 *         description: Player Id
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
 *                           $ref: '#/components/schemas/MintedNFTS'
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
 * /nfts/{id}:
 *   get:
 *     summary: Get minted nft by id
 *     tags: [MintedNft]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: Minted Nft Id
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
 *                   $ref: '#/components/schemas/MintedNFTS'
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
