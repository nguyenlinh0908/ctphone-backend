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

export interface IAppConfig {
  database: IDatabase;
  jwt: IJWT;
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
});

export default (): IAppConfig => {
  const { error } = validationSchema.validate(env);

  if (error) {
    throw new Error(error.message);
  }
  return env;
};