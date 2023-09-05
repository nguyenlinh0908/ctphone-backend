import { Types } from 'mongoose';
import { Role } from 'src/modules/shared/enum';

export interface IJwtPayload {
  _id: Types.ObjectId;
  username: string;
  role: Role;
}
