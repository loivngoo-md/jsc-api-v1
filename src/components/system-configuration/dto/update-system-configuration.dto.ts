import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import {
  DepositsAndWithdrawalsDto,
  NewSharesDto,
  TradingHoursDto,
  TransactionRateDto,
} from './system-configuration-element.dto';

export class UpdateSystemConfigurationDto {
  @ValidateNested({ each: true })
  @Type(() => DepositsAndWithdrawalsDto)
  deposits_and_withdrawals: DepositsAndWithdrawalsDto[];

  @ValidateNested({ each: true })
  @Type(() => TransactionRateDto)
  transactions_rate: TransactionRateDto[];

  @ValidateNested({ each: true })
  @Type(() => TradingHoursDto)
  tranding_hours: TradingHoursDto[];

  @ValidateNested({ each: true })
  @Type(() => NewSharesDto)
  new_shares: NewSharesDto[];

  @IsOptional()
  online_customer_service: string;
}
