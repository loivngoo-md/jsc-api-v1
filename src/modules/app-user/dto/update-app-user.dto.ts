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

export class AppUserUpdateProfile {
  @ApiPropertyOptional()
  real_name: string;

  @ApiPropertyOptional()
  phone: string;

  @ApiPropertyOptional()
  id_number: string;

  @ApiPropertyOptional()
  bank_name: string;

  @ApiPropertyOptional()
  bank_number: string;

  @ApiPropertyOptional()
  account_holder: string;

  @ApiPropertyOptional()
  bank_branch: string;
}

export class AppUserUpdateBalance {
  balance?: number;
  balance_avail?: number;
  balance_frozen?: number;
}
