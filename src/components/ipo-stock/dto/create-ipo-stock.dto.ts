import { ApiProperty } from '@nestjs/swagger';
import { IPO_STOCK_TYPE } from '../../../common/enums';

export class IpoStockCreate {
  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  supply_quantity: number;

  @ApiProperty()
  type: IPO_STOCK_TYPE;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  subscribe_time: number;

  @ApiProperty()
  time_on_market: number;

  @ApiProperty()
  payment_time: number;
}
