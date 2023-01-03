import { OmitType, PartialType } from '@nestjs/swagger';
import { BlockTransactionCreate } from './create-block-transaction.dto';

export class BlockTransactionUpdate extends PartialType(
  OmitType(BlockTransactionCreate, ['stock_code']),
) {}
