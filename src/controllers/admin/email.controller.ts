import { Request, Response } from 'express';
import { Config } from '@/config/config';
import { checkDocExists } from '@/utils/helpers';
import { defaultGameConfig } from '@/utils/defaults';
import { EmailService, PlayerService } from '@/services';
import { wrapRequestAsync, xgResponse } from '@/utils/api';

// POST
const sendEmail = wrapRequestAsync(async (req: Request, res: Response) => {
  const { body, game } = req;

  const { action, playerId } = body;
  const player = await PlayerService.getPlayerById(playerId);

  checkDocExists(player, `Player with Id ${playerId} not found`);
  req.logger?.info(`Sending an email to player ${player.email}, action ${action}`);

  // TODO: Implement action based email service with proper abstraction and OOP.
  // This is quick fix
  if (action === EmailService.ACTION_TYPES.LOGIN_INVITE) {
    if (!player.externalLoginToken) {
      await PlayerService.generatePlayerExternalToken(player);
    }

    const emailConfig = (game.gameConfig || defaultGameConfig).emails.web3link;
    const appLoginUrl = `${Config.xgAppUrl}/login?external=${player.externalLoginToken}`;

    await EmailService.sendTemplate(player.email, `${player.name}, ${emailConfig.subject}!`, emailConfig.templateName, [
      { name: 'LOGIN_URL', content: appLoginUrl },
      { name: 'IMAGE_URL', content: emailConfig.imageUrl },
      { name: 'GAME_TITLE', content: emailConfig.gameTitle },
      { name: 'GAME_SUBTITLE', content: emailConfig.gameSubTitle },
      { name: 'RARITY_BOXES', content: emailConfig.rarityBoxes.join(', ') },
    ]);
  }

  xgResponse(res, {});
});

export const EmailController = {
  sendEmail,
};
