import { Types } from 'mongoose';

export class CreateNotificationDto {
  userId?: Types.ObjectId;

  title: string;

  content: string;
}
