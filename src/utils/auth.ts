import appEnv from '@configs/env.config';
import * as bcrypt from 'bcrypt';

export const hashString = (
  string: string,
  saltRounds = appEnv().jwt.SALT_ROUNDS,
): string => {
  const salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(string, salt);
};

export const comparePassword = (
  password: string,
  hashedPassword: string,
): boolean => {
  return bcrypt.compareSync(password, hashedPassword);
};
