import { ApiProperty, OmitType } from '@nestjs/swagger';

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

export class AppUserCreateByAgent extends OmitType(AppUserCreate, [
  'agent_code',
]) {}
