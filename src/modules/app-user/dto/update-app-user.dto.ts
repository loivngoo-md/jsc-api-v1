import { ApiPropertyOptional } from '@nestjs/swagger';

export class AppUserUpdateDetail {
  @ApiPropertyOptional()
  agent_code: string;

  @ApiPropertyOptional()
  phone: string;

  @ApiPropertyOptional()
  real_name: string;

  @ApiPropertyOptional()
  is_active: boolean;

  @ApiPropertyOptional()
  is_freeze: boolean;
}

export class AppUserUpdateProfile {}

export class AppUserUpdateBalance {
  balance?: number;
  balance_avail?: number;
  balance_frozen?: number;
}
