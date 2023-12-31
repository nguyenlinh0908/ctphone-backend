import * as Joi from 'joi';
import * as dotenv from 'dotenv';

const envConfig = dotenv.config().parsed;

export { envConfig };

export interface IJWT {
  JWT_TOKEN_EXPIRE_IN: string;
  JWT_REFRESH_TOKEN_EXPIRE_IN: string;
  SALT_ROUNDS: number;
  AUTH_JWT_SECRET: string;
}

export interface IDatabase {
  MONGO_URL: string;
}

export interface IRedis {
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_USERNAME?: string;
  REDIS_PASSWORD?: string;
}

export interface IVnpay {
  TMN_CODE: string;
  SECURE_HASH: string;
  URL: string;
  URL_RETURN: string;
}

export interface IUpload {
  MULTER_DEST: string;
}

export interface IProductConfig {
  MINIMUM_PRODUCT_QUANTITY;
}

export interface IAppConfig {
  database: IDatabase;
  jwt: IJWT;
  redis: IRedis;
  vnpay: IVnpay;
  upload: IUpload;
  product: IProductConfig;
}

const env: IAppConfig = {
  database: {
    MONGO_URL: envConfig.MONGO_URI,
  },
  jwt: {
    JWT_TOKEN_EXPIRE_IN: envConfig.JWT_TOKEN_EXPIRE_IN,
    JWT_REFRESH_TOKEN_EXPIRE_IN: envConfig.JWT_REFRESH_TOKEN_EXPIRE_IN,
    SALT_ROUNDS: +envConfig.SALT_ROUNDS,
    AUTH_JWT_SECRET: envConfig.AUTH_JWT_SECRET,
  },
  redis: {
    REDIS_HOST: envConfig.REDIS_HOST,
    REDIS_PORT: +envConfig.REDIS_PORT,
  },
  vnpay: {
    TMN_CODE: envConfig.VNPAY_TMN_CODE,
    SECURE_HASH: envConfig.VNPAY_SECURE_HASH,
    URL: envConfig.VNPAY_URL,
    URL_RETURN: envConfig.VNPAY_URL_RETURN,
  },
  upload: {
    MULTER_DEST: envConfig.MULTER_DEST,
  },
  product: {
    MINIMUM_PRODUCT_QUANTITY: +envConfig.MINIMUM_PRODUCT_QUANTITY,
  },
};

export const validationSchema = Joi.object({
  database: {
    MONGO_URL: Joi.string().required(),
  },
  jwt: {
    JWT_TOKEN_EXPIRE_IN: Joi.string().required(),
    JWT_REFRESH_TOKEN_EXPIRE_IN: Joi.string().required(),
    SALT_ROUNDS: Joi.number().required(),
    AUTH_JWT_SECRET: Joi.string().required(),
  },
  redis: {
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().required(),
    REDIS_USERNAME: Joi.string().empty(),
    REDIS_PASSWORD: Joi.string().empty(),
  },
  vnpay: {
    TMN_CODE: Joi.string().required(),
    SECURE_HASH: Joi.string().required(),
    URL: Joi.string().required(),
    URL_RETURN: Joi.string().required(),
  },
  upload: {
    MULTER_DEST: Joi.string().required(),
  },
  product: {
    MINIMUM_PRODUCT_QUANTITY: Joi.number(),
  },
});

export default (): IAppConfig => {
  const { error } = validationSchema.validate(env);

  if (error) {
    throw new Error(error.message);
  }
  return env;
};
