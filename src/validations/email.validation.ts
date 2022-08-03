import Joi from 'joi';
import { objectId } from './custom.validation';
import { EmailService } from '@/services/email.service';

const sendEmail = {
  body: Joi.object().keys({
    playerId: Joi.string().custom(objectId).required(),
    action: Joi.string()
      .valid(...Object.values(EmailService.ACTION_TYPES))
      .required(),
  }),
};

export const EmailValidation = {
  sendEmail,
};
