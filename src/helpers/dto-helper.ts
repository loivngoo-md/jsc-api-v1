import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class PaginationQuery {
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  pageSize?: number;
}

export class UpdatePassword {
  @ApiProperty()
  old_password: string;

  @ApiProperty()
  new_password: string;
}

export class SetPassword {
  @ApiProperty()
  password: string;
}
