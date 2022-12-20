import { Type } from 'class-transformer';
import {
  IsNotEmpty, IsString,
  ValidateNested
} from 'class-validator';
import {
  DepositsAndWithdrawalsDto,
  NewSharesDto,
  TradingHoursDto,
  TransactionRateDto
} from './system-configuration-element.dto';

export class CreateSystemConfigurationDto {
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

  @IsString()
  @IsNotEmpty()
  online_customer_service: string;
}
