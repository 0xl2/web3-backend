import Joi from 'joi';
import { OAuth2Client } from 'google-auth-library';

export enum APP_TYPE {
  XG_CONSOLE = 'xg_console',
  XG_APP = 'xg_app',
}

export enum CHAIN_TYPE {
  POLYGON = 'polygon',
  SOLANA = 'solana',
  IMMUTABLE = 'immutable',
}

let envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    XG_APP_URL: Joi.string().description('game-zone base url'),
    CONTACT_EMAIL: Joi.string().required().description('contact email'),
    APP_TYPE: Joi.string()
      .valid(...Object.values(APP_TYPE))
      .required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    GCAPTCHA_SECRET: Joi.string().required().description('Google Captcha secret key'),
    AWS_ACCESS_KEY_ID: Joi.string().required().description('AWS key id'),
    AWS_SECRET_ACCESS_KEY: Joi.string().required().description('AWS secret'),
    AWS_BUCKET: Joi.string().required().description('AWS bucket name'),
    MORALIS_SERVER_URL: Joi.string().required().description('Moralis server url'),
    MORALIS_APP_ID: Joi.string().required().description('Moralis app id'),
    MORALIS_MASTER_KEY: Joi.string().required().description('Moralis master key'),
    MORALIS_SECRET: Joi.string().required().description('Moralis master secret'),
    MAILCHIMP_API_KEY: Joi.string().required().description('mailchimp api key'),
    MAILCHIMP_NAME_FROM: Joi.string().required().description('mailchimp name from'),
    MAILCHIMP_EMAIL_FROM: Joi.string().required().description('mailchimp email from'),
    MAILCHIMP_LOGIN_TEMPLATE: Joi.string().required().description('mailchimp login template name'),
    FIREBLOCKS_API_KEY: Joi.string().required().description('Fireblocks API Key'),
    IMX_MARKET_URL: Joi.string().required().description('IMX Market Url'),
    IMX_PUBLIC_API_URL: Joi.string().required().description('IMX Public api url'),
    IMX_STARK_CONTRACT_ADDRESS: Joi.string().required().description('IMX stark contract address'),
    IMX_REGISTRATION_CONTRACT_ADDRESS: Joi.string().required().description('IMX registration contract address'),
    IMX_MINTER_ENABLE_DEBUG: Joi.string().required().description('IMX enable debug mode'),
    OPENSEA_URL: Joi.string().required().description('Opensea market URL'),
    SIMPLEX_HOST: Joi.string().required().description('Simplex host address'),
    SIMPLEX_API_KEY: Joi.string().required().description('Simplex api key'),
    SIMPLEX_WALLET_ID: Joi.string().required().description('Simplex wallet id'),
    SIMPLEX_ETH_WALLET_ADDRESS: Joi.string().required().description('Simplex wallet address'),
    ETHEREUM_ROPSTEN_RPC_NODE: Joi.string().required().description('Ethereum ropsten rpc node'),
    POLYGON_MUMBAI_RPC_NODE: Joi.string().required().description('Polygon mumbai rpc node'),
    GOOGLE_CLIENT_ID: Joi.string().required().description('Google client id'),
    GOOGLE_CLIENT_SECRET: Joi.string().required().description('Google client secret'),
  })
  .unknown();

if (process.env.CI) {
  envVarsSchema = Joi.object().unknown(true);
}

export const chainToEnv = {
  networks: {
    polygon: 'polygon',
    solana: 'solana',
    immutable: 'ethereum',
  },
};

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

export const oAuth2Client = new OAuth2Client({
  clientId: envVars.GOOGLE_CLIENT_ID,
  clientSecret: envVars.GOOGLE_CLIENT_SECRET,
});

const defaultChain = ((chainName: string) => chainToEnv.networks[chainName])(CHAIN_TYPE.POLYGON);

export const MINT_FROM_ADDRESS = '0x0000000000000000000000000000000000000000';

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const Config = {
  env: envVars.NODE_ENV,
  xgAppUrl: envVars.XG_APP_URL,
  contactEmail: envVars.CONTACT_EMAIL,
  appType: envVars.APP_TYPE,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES || 10,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS || 10,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES || 10,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES || 10,
  },
  google: {
    clientId: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
  },
  googleCaptcha: {
    secretKey: envVars.GCAPTCHA_SECRET,
  },
  aws: {
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    bucket: envVars.AWS_BUCKET,
  },
  moralis: {
    serverUrl: envVars.MORALIS_SERVER_URL,
    appId: envVars.MORALIS_APP_ID,
    masterKey: envVars.MORALIS_MASTER_KEY,
    moralisSecret: envVars.MORALIS_SECRET,
  },
  fireblocks: {
    apiKey: envVars.FIREBLOCKS_API_KEY,
  },
  mailchimp: {
    apiKey: envVars.MAILCHIMP_API_KEY,
    nameFrom: envVars.MAILCHIMP_NAME_FROM,
    emailFrom: envVars.MAILCHIMP_EMAIL_FROM,
    loginTemplateName: envVars.MAILCHIMP_LOGIN_TEMPLATE,
  },
  chainInfo: {
    defaultChain,
    currentNetwork: envVars.NODE_ENV === 'production' ? envVars.NODE_ENV : '*',
  },
  immutableX: {
    config: envVars.IMX_MARKET_CONFIG,
    // https://market.ropsten.immutable.com/ for ropsten, https://market.immutable.com/ for mainnet
    marketUrl: envVars.IMX_MARKET_URL,
    // https://api.ropsten.x.immutable.com/v1 for ropsten, https://api.x.immutable.com/v1 for mainnet
    publicApiUrl: envVars.IMX_PUBLIC_API_URL,
    // 0x4527BE8f31E2ebFbEF4fCADDb5a17447B27d2aef for ropsten, 0x5FDCCA53617f4d2b9134B29090C87D01058e27e9 for mainnet
    starkAddress: envVars.IMX_STARK_CONTRACT_ADDRESS,
    // 0x6C21EC8DE44AE44D0992ec3e2d9f1aBb6207D864 for ropsten, 0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c for mainnet
    registrationAddress: envVars.IMX_REGISTRATION_CONTRACT_ADDRESS,
    enableDebug: envVars.IMX_MINTER_ENABLE_DEBUG,
  },
  opensea: {
    url: envVars.OPENSEA_URL,
  },
  simplex: {
    host: envVars.SIMPLEX_HOST,
    apiKey: envVars.SIMPLEX_API_KEY,
    walletAddress: envVars.SIMPLEX_ETH_WALLET_ADDRESS,
    walletId: envVars.SIMPLEX_WALLET_ID,
  },
  rpcNodes: {
    ethereumMainnet: envVars.ETHEREUM_MAINNET_RPC_NODE,
    ethereumRopsten: envVars.ETHEREUM_ROPSTEN_RPC_NODE,
    polygonMainnet: envVars.POLYGON_MAINNET_RPC_NODE,
    polygonMumbai: envVars.POLYGON_MUMBAI_RPC_NODE,
  },
};
