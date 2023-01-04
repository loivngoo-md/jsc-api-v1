import { ApiPropertyOptional } from '@nestjs/swagger';

export class AgentUserUpdate {
  @ApiPropertyOptional()
  is_active?: boolean;

  @ApiPropertyOptional()
  real_name?: string;

  @ApiPropertyOptional()
  phone?: string;
}
