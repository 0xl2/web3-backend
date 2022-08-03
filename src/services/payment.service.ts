import axios from 'axios';
import httpStatus from 'http-status';
import { BigNumber } from '@ethersproject/bignumber';
import { entries, findIndex, forEach, groupBy } from 'lodash';
import { Logger } from '@/config/logger';
import { ApiError } from '@/utils/api';
import { Config } from '@/config/config';
import { IXgContext } from '@/types/global';
import { GameService } from './game.service';
import { PlayerService } from './player.service';
import { getWeb3Info } from '@/utils/web3Helpers';
import { GameTokenService } from './gameToken.service';
import { EVENT_ACTIONS, trackEntityEvent } from '@/utils/helpers';
import { IPaymentRequest, PaymentRequests, PAYMENT_REQUEST_STATUS } from '@/models/paymentRequest.model';

const getClient = () => {
  const client = axios.create({
    baseURL: Config.simplex.host,
  });

  client.defaults.headers['Content-Type'] = `application/json`;
  client.defaults.headers['Authorization'] = `ApiKey ${Config.simplex.apiKey}`;

  return client;
};

export interface IGetQuoteOptions {
  end_user_id: string;
  requested_amount: number;
  client_ip: string;
}

export interface IPaymentRequestOptions {
  account_details: {
    app_end_user_id: string;
    email: string;
    signup_login: {
      timestamp: string;
      ip: string;
    };
  };
  transaction_details: {
    payment_details: {
      quote_id: string;
      payment_id: string;
      order_id: string;
      original_http_ref_url: string;
    };
  };
}

export interface IPaymentRequestMetadata {
  meta: object;
}

const getQuote = async (options: IGetQuoteOptions, prMeta: IPaymentRequestMetadata, xgContext: IXgContext) => {
  const client = getClient();

  const response = await client.post('/wallet/merchant/v2/quote', {
    ...options,
    digital_currency: 'USD-DEPOSIT',
    requested_currency: 'USD-DEPOSIT',
    fiat_currency: 'USD',
    wallet_id: Config.simplex.walletId,
    payment_methods: ['credit_card'],
  });

  const { data } = response;

  const newPaymentRequest: Partial<IPaymentRequest> = {
    issuer: data.user_id,
    price: data.digital_money.amount,
    priceTotal: data.fiat_money.total_amount,
    meta: {
      quoteId: data.quote_id,
      paymentId: null,
      ...prMeta.meta,
    },
    status: PAYMENT_REQUEST_STATUS.PAYMENT_QUOTE_REQUESTED,
    events: [],
  };

  try {
    const pr = await PaymentRequests.create(newPaymentRequest);

    trackEntityEvent(pr, 'PAYMENTREQUEST', EVENT_ACTIONS.CREATE, xgContext, {
      status: PAYMENT_REQUEST_STATUS.PAYMENT_QUOTE_REQUESTED,
    });

    pr.save();

    return response.data;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getEvents = async () => {
  const client = getClient();

  try {
    const response = await client.get('/wallet/merchant/v2/events');

    return response.data.events;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const deleteEvent = async (eventId: string) => {
  const client = getClient();

  try {
    const response = await client.delete(`/wallet/merchant/v2/events/${eventId}`);

    return response.data;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const requestPayment = async (options: IPaymentRequestOptions) => {
  const client = getClient();

  try {
    const response = await client.post('/wallet/merchant/v2/payments/partner/data', {
      account_details: {
        ...options.account_details,
        app_version_id: '1',
        app_provider_id: Config.simplex.walletId,
      },
      transaction_details: {
        ...options.transaction_details,
        payment_details: {
          ...options.transaction_details.payment_details,
          destination_wallet: {
            currency: 'USD-DEPOSIT',
            address: Config.simplex.walletAddress,
            tag: '',
          },
        },
      },
    });

    await PaymentRequests.updateOne(
      {
        'meta.quoteId': options.transaction_details.payment_details.quote_id,
      },
      {
        $set: {
          'meta.paymentId': options.transaction_details.payment_details.payment_id,
          status: PAYMENT_REQUEST_STATUS.PAYMENT_REQUEST_SUBMITTED,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getPaymentRequestByPaymentId = (paymentId: string) =>
  PaymentRequests.findOne({
    'meta.paymentId': paymentId,
  });

const setPaymentStatus = async (paymentId: string, status: PAYMENT_REQUEST_STATUS) => {
  PaymentRequests.findOneAndUpdate(
    {
      'meta.paymentId': paymentId,
    },
    {
      $set: {
        status,
      },
    }
  );
};

const POLL_INTERVAL_MS = 5000;

const paymentFinishedCallback = async (event) => {
  const paymentId = event.payment.id;

  const paymentRequest = await PaymentService.getPaymentRequestByPaymentId(paymentId);

  if (!paymentRequest) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Payment with id - ${paymentId} not found`);
  }

  paymentRequest.status = event.name;
  await paymentRequest.save();

  if (event.name !== PAYMENT_REQUEST_STATUS.PAYMENT_REQUEST_APPROVED) {
    return;
  }

  const gameId = paymentRequest.meta['game_id'];
  const playerId = paymentRequest.meta['end_user_id'];
  const gameTokenId = paymentRequest.meta['game_token_id'];

  const game = await GameService.getGameById(gameId);
  const player = await PlayerService.getPlayerById(playerId);
  const gameToken = await GameTokenService.getGameTokenById(gameTokenId);

  Logger.info(`Mint with gameTokenId - ${gameTokenId} amount - ${1} contract details`);

  if (BigNumber.from(gameToken.minted).add(1).gt(BigNumber.from(gameToken.cap))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cap exceed.');
  }

  const { contract, web3Client } = await getWeb3Info({
    contractId: game.contracts[gameToken.chainName],
    chainName: gameToken.chainName,
  });

  const playerAddress = await PlayerService.getPlayerAddress({
    playerAddress: player.wallets[gameToken.chainName]?.address,
    email: player.email,
    externalId: player.externalPlayerId,
    contract,
    web3Client,
  });

  Logger.info(`contract - ${contract} chain - ${gameToken.chainName} player address - ${playerAddress} mint details`);
  await GameTokenService.mint(game, gameToken, {
    userId: playerId,
    contractId: game.contracts[gameToken.chainName],
    chainName: gameToken.chainName,
    address: playerAddress,
    amount: 1,
    playerId,
    playerEmail: player.email,
    imageUrl: gameToken.imageUrl,
    attributes: {},
  });
};

class PaymentManager {
  private interval: NodeJS.Timer | null = null;
  private listeners: Map<string, Function> = new Map();

  public async start() {
    const pendingPaymentRequests = await PaymentRequests.find({
      status: PAYMENT_REQUEST_STATUS.PAYMENT_REQUEST_SUBMITTED,
    });

    forEach(pendingPaymentRequests, (pr) => this.subscribe(pr.meta.paymentId, paymentFinishedCallback));
  }

  public subscribe(paymentId: string, cb: Function) {
    this.listeners.set(paymentId, cb);
    this.startPolling();
  }

  private startPolling() {
    if (this.interval) {
      return;
    }

    this.interval = setInterval(this.handleEvents.bind(this), POLL_INTERVAL_MS);
  }

  private async handleEvents() {
    const events = await getEvents();

    const paymentToEventMap = groupBy(events, (event) => event.payment.id);

    entries(paymentToEventMap).forEach(([paymentId, paymentEvents]) => {
      const paymentDoneIndex = findIndex(
        paymentEvents,
        (event) =>
          event.name === PAYMENT_REQUEST_STATUS.PAYMENT_REQUEST_APPROVED ||
          event.name === PAYMENT_REQUEST_STATUS.PAYMENT_REQUEST_DECLINED
      );

      if (paymentDoneIndex === -1) {
        return;
      }

      // Clean up events
      forEach(paymentEvents, (event) => deleteEvent(event.event_id));

      if (this.listeners.get(paymentId)) {
        this.listeners.get(paymentId)(paymentEvents[paymentDoneIndex]);
      }

      this.listeners.delete(paymentId);

      if (this.listeners.size === 0) {
        clearInterval(this.interval);
        this.interval = null;
      }
    });
  }
}

export const paymentManager = new PaymentManager();

export const PaymentService = {
  getQuote,
  requestPayment,
  setPaymentStatus,
  paymentFinishedCallback,
  getPaymentRequestByPaymentId,
};
