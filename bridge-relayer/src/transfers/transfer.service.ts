import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transfer, TransferDocument } from './transfer.schema';
import { CreateTransferRequest } from './requests';
import { DateTime } from 'luxon';
import { TransferStatus } from './types';
import { ContractTransaction } from 'ethers';

@Injectable()
export class TransferService {
  constructor(
    @InjectModel(Transfer.name) private transferModel: Model<TransferDocument>,
  ) {}

  async createTransfer(dto: CreateTransferRequest): Promise<TransferDocument> {
    const record = {
      sourceTransactionHash: dto.sourceTxnHash,
      sourceNetwork: dto.fromNetwork,
      destNetwork: dto.toNetwork,
      status: TransferStatus.PENDING,
      createdAt: DateTime.now().toUTC().toISO(),
    };
    const transfer = new this.transferModel(record);
    return transfer.save();
  }

  async updateSourceDetails(transfer, { sourceAddress, amount, nonce }) {
    const record = await this.findById(transfer._id);
    record.sourceAddress = sourceAddress;
    record.amount = amount;
    record.nonce = nonce;
    return record.save();
  }

  async updateDestDetails(transfer, { hash }) {
    const record = await this.findById(transfer._id);
    record.destTransactionHash = hash;
    return record.save();
  }

  async findOne(sourceTransactionHash): Promise<TransferDocument> {
    return this.transferModel.findOne({ sourceTransactionHash });
  }

  async findById(transferId): Promise<TransferDocument> {
    return this.transferModel.findOne({ _id: transferId });
  }
}
