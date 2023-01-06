import { ApiProperty } from '@nestjs/swagger';
import { IPO_APP_STATUS } from '../../../common/enums';

export class IpoApplicationAssign {
  user_id: number;
  ipo_id: number;

  @ApiProperty()
  quantity: number;
}

export class IpoAplicationCreate {
  @ApiProperty()
  username: string;

  @ApiProperty()
  ipo_code: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  actual_quantity?: number;

  @ApiProperty()
  status: IPO_APP_STATUS;
}
