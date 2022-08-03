import path from 'path';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { Config } from '@/config/config';
import { StorageService } from '@/services';
import { getGameTempUrl } from '@/utils/storage';
import { wrapRequestAsync, xgResponse } from '@/utils/api';

// POST
const uploadFile = wrapRequestAsync(async (req: Request, res: Response) => {
  const { file, game } = req;
  const guid = crypto.randomUUID();
  const extension = path.extname(file.originalname).slice(1);

  const fileLocation = await StorageService.uploadFile({
    Bucket: Config.aws.bucket,
    Key: getGameTempUrl(game._id.toString(), `${guid}.${extension}`),
    Body: file.buffer,
  });

  req.logger?.info('Upload File complete successfully', fileLocation);
  xgResponse(res, {
    location: fileLocation,
  });
});

export const FilesController = {
  uploadFile,
};
