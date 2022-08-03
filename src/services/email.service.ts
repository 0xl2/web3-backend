import { Config } from '@/config/config';
import { Logger } from '@/config/logger';
import { emailMessageCreator } from '@/utils/defaults';
import mailchimp from '@mailchimp/mailchimp_transactional';

const mailchimpInstance = mailchimp(Config.mailchimp.apiKey);

enum ACTION_TYPES {
  LOGIN_INVITE = 'login_invite',
}

export enum SUBJECT_TYPES {
  RESET_PASSWORD = 'Reset password',
  EMAIL_VERIFICATION = 'Email Verification',
}

const sendEmail = async (toEmail: string, subject: SUBJECT_TYPES | string, message?: string, token?: string) => {
  const options = {
    from_name: Config.mailchimp.nameFrom,
    from_email: Config.mailchimp.emailFrom,
    subject,
    text: message || emailMessageCreator(subject as SUBJECT_TYPES, token),
    to: [{ email: toEmail, type: 'to' }],
  };

  Logger.info(`Trying to send email to ${toEmail}`);
  return await mailchimpInstance.messages.send({
    key: Config.mailchimp.apiKey,
    message: options,
  });
};

const sendTemplate = async (toEmail: string, subject: string, templateName: string, variables: Array<Object>) => {
  Logger.info(`Sending email to ${toEmail} and template type: ${templateName}, and vars: ${JSON.stringify(variables)}`);
  return await mailchimpInstance.messages.sendTemplate({
    key: Config.mailchimp.apiKey,
    template_name: templateName,
    template_content: [],
    async: false,
    message: {
      from_name: Config.mailchimp.nameFrom,
      from_email: Config.mailchimp.emailFrom,
      subject,
      to: [{ email: toEmail, type: 'to' }],
      global_merge_vars: variables,
    },
  });
};

export const EmailService = {
  sendEmail,
  sendTemplate,
  ACTION_TYPES,
  mailchimpInstance,
};
