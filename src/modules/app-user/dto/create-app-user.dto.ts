import { ApiProperty } from '@nestjs/swagger';

export class AppUserRegister {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  agent_code: string;
}

export class AppUserCreate extends AppUserRegister {
  @ApiProperty()
  is_real: boolean;

  @ApiProperty()
  amount: number;
}
