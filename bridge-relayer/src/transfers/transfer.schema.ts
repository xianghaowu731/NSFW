import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TransferStatus } from 'src/transfers/types';

export type TransferDocument = Transfer & Document;

@Schema()
export class Transfer {
  @Prop({ type: String })
  sourceAddress: string;

  @Prop({ type: String })
  nonce: string;

  @Prop({ type: String })
  destAddress: string;

  @Prop({ type: String })
  amount: string;

  @Prop({ type: String, required: true })
  sourceNetwork: string;

  @Prop({ type: String, required: true })
  destNetwork: string;

  @Prop({ type: String, required: true, enum: TransferStatus })
  status: string;

  @Prop({ type: String, required: true })
  sourceTransactionHash: string;

  @Prop({ type: String })
  destTransactionHash: string;

  @Prop({ type: Date })
  createdAt: Date;
}

export const TransferSchema = SchemaFactory.createForClass(Transfer);
