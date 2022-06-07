import { IsNotEmpty, IsPositive } from 'class-validator';

export class CreateTransferRequest {
  @IsNotEmpty()
  sourceTxnHash: string;

  @IsNotEmpty()
  fromNetwork: string;

  @IsNotEmpty()
  toNetwork: string;
}
