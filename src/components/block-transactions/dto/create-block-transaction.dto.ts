import { ApiProperty } from '@nestjs/swagger';

export class BlockTransactionCreate {
  @ApiProperty()
  stock_code: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  trx_key: string;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  start_time: number;

  @ApiProperty()
  end_time: number;
}
