import { SwaggerDefinition } from 'swagger-jsdoc';

export const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Web3 API Documentation',
    version: '1.0.0',
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: `https://dev-api.games/v1`,
    },
  ],
};
