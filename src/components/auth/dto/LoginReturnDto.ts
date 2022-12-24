import { ApiProperty } from '@nestjs/swagger';

export class LoginReturnDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  expiresIn: string;
}
