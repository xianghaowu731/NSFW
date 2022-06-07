import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { BridgeService } from './bridge.service';
import { CreateTransferRequest } from './requests';
import { TransferService } from './transfer.service';

@Controller('/transfers')
export class TransfersController {
  constructor(
    private transfers: TransferService,
    private bridge: BridgeService,
  ) {}

  @Post('/submit')
  async submitTransfer(@Body() req: CreateTransferRequest) {
    console.log('-- request');
    console.log(req);
    // --- TODO: Transfer should not exist in our database
    // const existingTransfer = await this.transfers.findOne(req.sourceTxnHash);
    // if (existingTransfer) {
    //   throw new BadRequestException(
    //     `Duplicate transfer detected [transfer#${existingTransfer._id}]`,
    //   );
    // }

    const transfer = await this.transfers.createTransfer(req);

    // Find transaction on the blockchain
    const populatedTxn = await this.bridge.populateSourceTxn(transfer);
    const relayerAddress = await this.bridge.getRelayerAddress();

    // ---
    if (
      populatedTxn.sourceAddress.toLowerCase() === relayerAddress.toLowerCase()
    ) {
      throw new BadRequestException(`Unable to bridge to this address`);
    }

    try {
      await this.bridge.startTransfer(populatedTxn);
      return this.transfers.findById(populatedTxn._id);
    } catch (err) {
      console.log(err);
      throw new BadRequestException({
        message: 'Unable to complete bridge',
        error: err,
      });
    }
  }

  @Get('/status/:id')
  async transferStatus(@Param('id') transferId) {
    console.log(transferId);
  }
}
