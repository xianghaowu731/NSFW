import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TransferModule } from './transfers/transfer.module';
import { env } from './env';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [() => env],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(env.MONGO_URI),
    HttpModule,
    TransferModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
    // Disable Auth
    // consumer
    //   .apply(AuthMiddleware)
    //   .forRoutes(
    //     { path: 'transfer', method: RequestMethod.POST },
    //     { path: 'transfer/:id', method: RequestMethod.GET },
    //   );
  }
}
