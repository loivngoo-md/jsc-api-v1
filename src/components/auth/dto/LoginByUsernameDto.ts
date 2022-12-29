import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginByUsernameDto {
  @ApiProperty({ default: 'cmsusertest' })
  @IsString()
  username: string;

  @ApiProperty({ default: 'secret' })
  @IsString()
  password: string;
}
