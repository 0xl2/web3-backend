import { Model, model, Schema, Types, SchemaTypes } from 'mongoose';
import { PaginatedModel, IMintStatus, IEvent } from './types';
import { toJSON, paginate, transaction, excludeDeletedItems } from './plugins';

export enum PAYMENT_REQUEST_STATUS {
  PAYMENT_QUOTE_REQUESTED = 'payment_quote_requested',
  PAYMENT_REQUEST_SUBMITTED = 'payment_request_submitted',
  PAYMENT_REQUEST_APPROVED = 'payment_simplexcc_approved',
  PAYMENT_REQUEST_DECLINED = 'payment_simplexcc_declined',
}

export interface IPaymentRequest extends Document {
  _id: Types.ObjectId;
  issuer: Types.ObjectId;
  price: number;
  priceTotal: number;
  meta: {
    quoteId: string;
    paymentId: string;
  } & Object;
  status: PAYMENT_REQUEST_STATUS;
  events?: IEvent[];
}

export interface PaymentRequestsModel extends Model<IPaymentRequest>, PaginatedModel<IPaymentRequest> {
  transaction<T = unknown>(cb: (tx) => T): Promise<T>;
}

const paymentRequestsSchema = new Schema<any, PaymentRequestsModel>(
  {
    paymentId: {
      type: String,
    },
    issuer: {
      type: SchemaTypes.ObjectId,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    priceTotal: {
      type: Number,
      required: true,
    },
    meta: {
      type: Object,
      required: true,
    },
    status: {
      type: PAYMENT_REQUEST_STATUS,
      required: true,
    },
    events: {
      type: [Object],
      required: false,
      default: [],
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
paymentRequestsSchema.plugin(toJSON);
paymentRequestsSchema.plugin(paginate);
paymentRequestsSchema.plugin(transaction);
paymentRequestsSchema.plugin(excludeDeletedItems);

/**
 * @typedef mintedNFTS
 */
export const PaymentRequests = model<IPaymentRequest, PaymentRequestsModel>('PaymentRequests', paymentRequestsSchema);
