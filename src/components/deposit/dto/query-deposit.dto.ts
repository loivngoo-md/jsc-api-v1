import { ApiPropertyOptional } from '@nestjs/swagger';
import { DEPOSIT_WITHDRAWAL_STATUS } from '../../../common/enums';
import { PaginationQuery } from '../../../helpers/dto-helper';

export class DepositQuery extends PaginationQuery {
  @ApiPropertyOptional()
  username?: string;

  @ApiPropertyOptional()
  is_virtual_deposit?: boolean;

  @ApiPropertyOptional()
  status?: DEPOSIT_WITHDRAWAL_STATUS;

  @ApiPropertyOptional()
  start_time?: number;

  @ApiPropertyOptional()
  end_time?: number;
}
