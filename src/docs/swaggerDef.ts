import { SwaggerDefinition } from 'swagger-jsdoc';

export const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'XternityGames Web3 API Documentation',
    version: '1.0.0',
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: `https://dev-api.xternity.games/v1`,
    },
  ],
};
