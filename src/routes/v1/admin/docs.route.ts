import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import express, { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { Logger } from '@/config/logger';
import { Config } from '@/config/config';
import { ACCESS_RIGHTS } from '@/config/roles';
import { googleAuth } from '@/middlewares/auth';
import { swaggerDefinition } from '@/docs/swaggerDef';

const router = Router();

if (Config.env !== 'production') {
  const SPECS_FILE_NAME = 'openapi.json';
  const absoluteUrl = path.join(process.cwd(), SPECS_FILE_NAME);

  const specs = swaggerJsdoc({
    swaggerDefinition,
    apis: ['src/docs/*.yml', 'src/routes/v1/*/*.ts'],
  });

  router.use('/swagger', swaggerUi.serve);
  router.get(
    '/swagger',
    swaggerUi.setup(specs, {
      explorer: true,
    })
  );

  router.get('/', googleAuth(ACCESS_RIGHTS.GET_DOCS), express.static(absoluteUrl));

  const outputOpenApiSpecs = (specs: Object) => {
    try {
      const absoluteUrl = path.join(process.cwd(), SPECS_FILE_NAME);
      const json = JSON.stringify(specs, null, 2);

      fs.writeFile(absoluteUrl, json, 'utf8', () => {
        Logger.info('[outputOpenApiSpecs] Open API json spec outputted');
      });
    } catch (error) {
      Logger.warn('[outputOpenApiSpecs] Could not output Open API json spec', error.message);
    }
  };

  outputOpenApiSpecs(specs);
}

export const DocsRoute = {
  router,
};
