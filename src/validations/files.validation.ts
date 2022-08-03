import Joi from 'joi';

const uploadFile = {
  file: Joi.object().required(),
};

export const FilesValidation = {
  uploadFile,
};