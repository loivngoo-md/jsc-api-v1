import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DAYS_IN_WEEK } from 'src/common/enums';
import {
  INewShares,
  ITradingHours,
  ITransactionsRate,
} from '../entities/system-configuration.interface';

class DepositsAndWithdrawalsDto {
  @IsNumber()
  @IsNotEmpty()
  deposit_min: number;

  @IsNumber()
  @IsNotEmpty()
  deposit_max: number;

  @IsNumber()
  @IsNotEmpty()
  withdrawal_min: number;

  @IsNumber()
  @IsNotEmpty()
  withdrawal_max: number;

  @IsBoolean()
  @IsNotEmpty()
  deposit_permission: boolean;

  @IsBoolean()
  @IsNotEmpty()
  withdrawal_permission: boolean;

  @IsNumber()
  @IsNotEmpty()
  insitutional_code: number;

  @IsString()
  @IsNotEmpty()
  deposit_prompt: string;

  @IsBoolean()
  @IsNotEmpty()
  upload_deposit_voucher: boolean;

  @IsBoolean()
  @IsNotEmpty()
  transfer_account_detail: boolean;

  @IsString()
  @IsNotEmpty()
  withdrawal_prompt: string;

  @IsArray()
  @IsEnum(DAYS_IN_WEEK)
  Withdrawal_data_available: string[];

  @IsDate()
  @IsNotEmpty()
  start_time: Date;

  @IsDate()
  @IsNotEmpty()
  end_time: Date;
}
export class CreateSystemConfigurationDto {
  @Type(() => DepositsAndWithdrawalsDto)
  deposits_and_withdrawals: DepositsAndWithdrawalsDto;

  @ValidateNested()
  transactions_rate: ITransactionsRate;

  @ValidateNested()
  tranding_hours: ITradingHours;

  @ValidateNested()
  new_shares: INewShares;

  @IsString()
  @IsNotEmpty()
  online_customer_service: string;
}
