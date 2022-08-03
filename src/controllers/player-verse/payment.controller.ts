import crypto from 'crypto';
import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { typeOfUser } from '@/types/global';
import { GameTokenService } from '@/services';
import { checkDocExists } from '@/utils/helpers';
import { SALE_TYPE } from '@/models/gameToken.model';
import { ApiError, wrapRequestAsync, xgResponse } from '@/utils/api';
import { paymentManager, PaymentService } from '@/services/payment.service';

const getQuote = wrapRequestAsync(async (req: Request, res: Response) => {
  const { xgContext } = req;
  const gameTokenId = req.query['gt'] as string;
  const player: typeOfUser = req.user;
  const client_ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;

  checkDocExists(player, 'Player not found');

  const gameToken = await GameTokenService.getGameTokenById(gameTokenId);

  if (gameToken?.sale?.type !== SALE_TYPE.IN_GAME) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid gameTokenId or its not available for public sale.');
  }

  if (gameToken.isCapReached()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Maximum capacity has reached.');
  }

  req.logger?.info(`Sale pricing - ${gameToken.sale.price} quote pricing details`);
  const quote = await PaymentService.getQuote(
    {
      end_user_id: player._id.toString(),
      requested_amount: gameToken.sale.price,
      client_ip,
    },
    {
      meta: {
        game_id: req.game._id,
        game_token_id: gameTokenId,
        end_user_id: player._id.toString(),
        requested_amount: gameToken.sale.price,
      },
    },
    xgContext
  );

  xgResponse(res, quote);
});

const requestPayment = wrapRequestAsync(async (req: Request, res: Response) => {
  const { body } = req;
  const player: typeOfUser = req.user;
  const client_ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;

  const { quoteId } = body;

  checkDocExists(player, 'Player not found');

  const paymentId = crypto.randomUUID();

  const paymentDetails = {
    quote_id: quoteId,
    payment_id: paymentId,
    order_id: paymentId,
    original_http_ref_url: req.hostname,
  };

  req.logger?.info(`Payment request - ${paymentDetails} for player - ${player} payment details`);
  const paymentResult = await PaymentService.requestPayment({
    account_details: {
      app_end_user_id: player._id.toString(),
      email: player.email,
      signup_login: {
        ip: client_ip,
        timestamp: new Date().toISOString(),
      },
    },
    transaction_details: {
      payment_details: {
        ...paymentDetails,
      },
    },
  });

  xgResponse(res, {
    ...paymentDetails,
    ...paymentResult,
  });
});

const subscribe = wrapRequestAsync(async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  req.logger?.info(`Subscribe to payment by id - ${paymentId}`);
  paymentManager.subscribe(paymentId, PaymentService.paymentFinishedCallback);

  xgResponse(res, { isSubscribe: true });
});

export const PaymentController = {
  getQuote,
  requestPayment,
  subscribe,
};
