import { Module } from '@nestjs/common';
import { GlobalEventController } from './global-event.controller';
import { GlobalEventService } from './global-event.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalEvent, GlobalEventSchema } from './entities/global-event.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [GlobalEventController],
  providers: [GlobalEventService],
  imports: [
    MongooseModule.forFeature([
      {
        name: GlobalEvent.name,
        schema: GlobalEventSchema
      }
    ]),
    AuthModule
  ],
  exports: [GlobalEventService]
})
export class GlobalEventModule {}