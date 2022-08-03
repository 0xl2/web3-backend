import { Router } from 'express';
import { auth } from '@/middlewares/auth';
import { useGame } from '@/middlewares/game';
import { PaymentValidation } from '@/validations';
import { validate } from '@/middlewares/validate';
import { authApiKey } from '@/middlewares/auth-api-key';
import { PaymentController } from '@/controllers/player-verse/payment.controller';

const router = Router();

router.route('/quote').get(auth(), authApiKey, useGame, validate(PaymentValidation.getQuote), PaymentController.getQuote);
router.route('/').post(auth(), authApiKey, useGame, validate(PaymentValidation.requestPayment), PaymentController.requestPayment);
router.route('/:paymentId').post(auth(), authApiKey, validate(PaymentValidation.subscribe), PaymentController.subscribe);

export const PaymentRoute = {
  router,
};
