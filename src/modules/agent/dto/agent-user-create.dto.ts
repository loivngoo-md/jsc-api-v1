import { ApiProperty } from '@nestjs/swagger';

export class AgentUserCreateByAdmin {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  real_name: string;

  @ApiProperty()
  phone: string;
}

export class AgentUserCreateByAgent extends AgentUserCreateByAdmin {
  @ApiProperty()
  poundage_scale: number;

  @ApiProperty()
  deferred_fees_scale: number;

  @ApiProperty()
  receive_dividends_scale: number;
}
