import { ApiPropertyOptional } from '@nestjs/swagger';

export class IpoApplicationUpdate {
  @ApiPropertyOptional()
  ipo_code: string;

  @ApiPropertyOptional()
  amount: string;
}
