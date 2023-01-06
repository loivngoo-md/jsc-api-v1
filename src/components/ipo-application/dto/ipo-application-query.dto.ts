import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../../helpers/dto-helper';

export class IpoApplicationListQuery extends PaginationQuery {
  @ApiPropertyOptional()
  key_words: string;
}
