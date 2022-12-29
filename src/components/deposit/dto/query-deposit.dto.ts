import { ApiPropertyOptional } from '@nestjs/swagger';
import { DEPOSIT_WITHDRAWAL_STATUS } from '../../../common/enums';

export class DepositQuery {
  @ApiPropertyOptional()
  username?: string;

  @ApiPropertyOptional()
  is_virtual_deposit?: boolean;

  @ApiPropertyOptional()
  status?: DEPOSIT_WITHDRAWAL_STATUS;

  @ApiPropertyOptional()
  start_time?: Date;

  @ApiPropertyOptional()
  end_time?: Date;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  pageSize?: number;
}
