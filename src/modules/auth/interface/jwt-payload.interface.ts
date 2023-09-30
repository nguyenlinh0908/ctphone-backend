import { Types } from 'mongoose';
import { Role } from '../model';
import { AccountType } from '../enum';

export interface IJwtPayload {
  _id: Types.ObjectId;
  username: string;
  roles: Role[];
  type: AccountType;

  exp?: number;
  iat?: number;
}
