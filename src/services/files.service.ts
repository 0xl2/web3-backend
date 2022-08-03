import path from 'path';
import crypto from 'crypto';
import { IGame } from '@/models';
import { Logger } from '@/config/logger';
import { Config } from '@/config/config';
import { StorageService } from '@/services';
import { getGameTempUrl } from '@/utils/storage';

const uploadFile = (fileBuff: any, game: IGame) => {
  const guid = crypto.randomUUID();
  const extension = path.extname(fileBuff.name).slice(1);
  const fileLocation = StorageService.uploadFile({
    Bucket: Config.aws.bucket,
    Key: getGameTempUrl(game._id.toString(), `${guid}.${extension}`),
    Body: fileBuff.getData(),
  });

  Logger?.info('Upload File complete successfully', fileLocation);

  return fileLocation;
};

export const FilesService = {
  uploadFile,
};
