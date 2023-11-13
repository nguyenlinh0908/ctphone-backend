import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './model/notification.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  providers: [NotificationController, NotificationGateway, NotificationService],
})
export class NotificationModule {}
