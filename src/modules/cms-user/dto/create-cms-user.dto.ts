import { ApiProperty } from '@nestjs/swagger';

export class CreateCmsUserDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  real_name: string;

  @ApiProperty()
  is_active: boolean;
}
