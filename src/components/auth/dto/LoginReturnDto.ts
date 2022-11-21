import { ApiProperty } from '@nestjs/swagger';

export class LoginReturnDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  expiresIn: string;
}
