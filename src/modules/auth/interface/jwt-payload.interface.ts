import { Types } from 'mongoose';
import { Role } from '../model';

export interface IJwtPayload {
  _id: Types.ObjectId;
  username: string;
  role: Role[];
}
