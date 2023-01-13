import { IPO_APP_STATUS } from './../../../common/enums/index';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../../helpers/dto-helper';

export class IpoApplicationListQuery extends PaginationQuery {
  @ApiPropertyOptional()
  code: string;

  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  username: string;

  @ApiPropertyOptional()
  phone: string;

  @ApiPropertyOptional()
  status: IPO_APP_STATUS
}
