import { MEDIA_TYPE } from '@/models';
import { SUBJECT_TYPES } from '@/services';

export const defaultGameStyleConfig = {
  theme: {
    fonts: {
      body: 'system-ui, sans-serif',
      heading: 'Avenir Next", sans-serif',
      monospace: 'Menlo, monospace',
    },
    media: {
      logo: {
        mediaType: MEDIA_TYPE.IMAGE,
        mediaUrl:
          'https://images.pexels.com/photos/1052150/pexels-photo-1052150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        clickUrl:
          'https://images.pexels.com/photos/1052150/pexels-photo-1052150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
      hero: {
        mediaType: MEDIA_TYPE.VIDEO,
        mediaUrl:
          'https://images.pexels.com/photos/1052150/pexels-photo-1052150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        clickUrl:
          'https://images.pexels.com/photos/1052150/pexels-photo-1052150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
      banner: {
        mediaType: MEDIA_TYPE.IMAGE,
        mediaUrl:
          'https://images.pexels.com/photos/1052150/pexels-photo-1052150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        clickUrl:
          'https://images.pexels.com/photos/1052150/pexels-photo-1052150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
      timed_promo: {
        mediaType: MEDIA_TYPE.TEXT,
        mediaUrl:
          'https://images.pexels.com/photos/1052150/pexels-photo-1052150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        clickUrl:
          'https://images.pexels.com/photos/1052150/pexels-photo-1052150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
      lootbox: {
        mediaType: MEDIA_TYPE.IMAGE,
        mediaUrl:
          'https://images.pexels.com/photos/1052150/pexels-photo-1052150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        clickUrl:
          'https://images.pexels.com/photos/1052150/pexels-photo-1052150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      },
      extra: {},
    },
    colors: {
      'card-color': '#FFF',
      'text-color': '#000',
      'highlight-color': '#4B0082',
      'background-color': '#4B0082',
      'background-color2': '#4a4a4a',
    },
  },
};

export const defaultGameConfig = {
  emails: {
    web3link: {
      templateName: 'Login Template',
      subject: 'your VIP special loot is here',
      imageUrl:
        'https://media.istockphoto.com/photos/mountain-landscape-picture-id517188688?k=20&m=517188688&s=612x612&w=0&h=i38qBm2P-6V4vZVEaMy_TaTEaoCMkYhvLCysE7yJQ5Q=',
      gameTitle: 'Player!',
      gameSubTitle: 'Open the chest to reveal your lord badge and get premium benefits!',
      rarityBoxes: ['Gold', 'Silver', 'Bronze'],
    },
  },
};

export const defaultEmailMessages = (token: string) => ({
  [SUBJECT_TYPES.RESET_PASSWORD]: {
    url: `http://link-to-app/reset-password?token=${token}`,
    message: (url) => `Dear user,
                To reset your password, click on this link: ${url}
                If you did not request any password resets, then ignore this email.`,
  },
  [SUBJECT_TYPES.EMAIL_VERIFICATION]: {
    url: `http://link-to-app/verify-email?token=${token}`,
    message: (url) => `Dear user,
                To verify your email, click on this link: ${url}
                If you did not create an account, then ignore this email.`,
  },
});

export const emailMessageCreator = (subject: SUBJECT_TYPES, token: string) => {
  const options = defaultEmailMessages(token)[subject];
  return options.message(options.url);
};
