import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IpoApplicationUpdate {
  @ApiPropertyOptional()
  ipo_code: string;

  @ApiPropertyOptional()
  quantity: number;
}

export class IpoApplicationReview {
  @ApiProperty()
  is_accept: boolean;

  @ApiPropertyOptional()
  actual_quantity: number;
}
