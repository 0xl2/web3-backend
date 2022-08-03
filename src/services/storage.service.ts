import { S3 } from 'aws-sdk';
import { Config } from '@/config/config';

const s3 = new S3({
  accessKeyId: Config.aws.accessKeyId,
  secretAccessKey: Config.aws.secretAccessKey,
});

export type IUploadFileSettings = S3.Types.PutObjectRequest;
export type ICopyFileSettings = S3.Types.CopyObjectRequest;

const uploadFile = (params: IUploadFileSettings) =>
  s3
    .upload(params)
    .promise()
    .then((res) => res.Location);

const copyFile = (params: ICopyFileSettings) => s3.copyObject(params).promise();

export const StorageService = {
  uploadFile,
  copyFile,
};
