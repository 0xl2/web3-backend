import setupTestDB from '../../utils/setupTestDB';
import { Config } from '@/config/config';
import { EmailService, SUBJECT_TYPES } from '@/services';

setupTestDB();

const emailSendFunctionTest = async () => {
  Config.mailchimp.apiKey = 'test key';
  Config.mailchimp.emailFrom = 'test email';
  const mailchimpSpy = jest.spyOn(EmailService.mailchimpInstance.messages, 'send').mockResolvedValue(null);

  await EmailService.sendEmail('test@gmail.com', 'test', 'test');

  expect(mailchimpSpy).toBeCalledWith({
    key: 'test key',
    message: {
      from_email: 'test email',
      from_name: 'Xternity Team',
      subject: 'test',
      text: 'test',
      to: [
        {
          email: 'test@gmail.com',
          type: 'to',
        },
      ],
    },
  });
};

describe('Email service', () => {
  describe('sendEmail', () => {
    test('should send an email', emailSendFunctionTest);
  });

  describe('sendEmail', () => {
    test('should send an email from Mailchimp', emailSendFunctionTest);
  });

  describe('sendResetPasswordEmail', () => {
    test('should send an email', async () => {
      Config.mailchimp.apiKey = 'test key';
      Config.mailchimp.emailFrom = 'test email';
      const mailchimpSpy = jest.spyOn(EmailService.mailchimpInstance.messages, 'send').mockResolvedValue(null);

      await EmailService.sendEmail('test@gmail.com', SUBJECT_TYPES.RESET_PASSWORD, '', 'test');

      expect(mailchimpSpy).toBeCalledWith({
        key: 'test key',
        message: {
          from_email: 'test email',
          from_name: 'Xternity Team',
          subject: 'Reset password',
          text: `Dear user,
                To reset your password, click on this link: http://link-to-app/reset-password?token=test
                If you did not request any password resets, then ignore this email.`,
          to: [
            {
              email: 'test@gmail.com',
              type: 'to',
            },
          ],
        },
      });
    });
  });

  describe('sendVerificationEmail', () => {
    test('should send an email', async () => {
      Config.mailchimp.apiKey = 'test key';
      Config.mailchimp.emailFrom = 'test email';
      const mailchimpSpy = jest.spyOn(EmailService.mailchimpInstance.messages, 'send').mockResolvedValue(null);

      await EmailService.sendEmail('test@gmail.com', SUBJECT_TYPES.EMAIL_VERIFICATION, '', 'test');

      expect(mailchimpSpy).toBeCalledWith({
        key: 'test key',
        message: {
          from_email: 'test email',
          from_name: 'Xternity Team',
          subject: 'Email Verification',
          text: `Dear user,
                To verify your email, click on this link: http://link-to-app/verify-email?token=test
                If you did not create an account, then ignore this email.`,
          to: [
            {
              email: 'test@gmail.com',
              type: 'to',
            },
          ],
        },
      });
    });
  });
});
