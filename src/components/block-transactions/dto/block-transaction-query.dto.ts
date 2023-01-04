import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from '../../../helpers/dto-helper';

export class BlockTransactionQuery extends PaginationQuery {
  @ApiPropertyOptional()
  key_words: string;
}
