import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BridgeService } from './bridge.service';
import { Transfer, TransferSchema } from './transfer.schema';
import { TransferService } from './transfer.service';
import { TransfersController } from './transfers.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transfer.name, schema: TransferSchema },
    ]),
  ],
  controllers: [TransfersController],
  providers: [TransferService, BridgeService],
  exports: [],
})
export class TransferModule {}
