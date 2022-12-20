import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { DAYS_IN_WEEK } from "../../../common/enums";

export class DepositsAndWithdrawalsDto {
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
  deposit_permission: boolean;

  @IsBoolean()
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
  @IsEnum(DAYS_IN_WEEK, { each: true })
  Withdrawal_date_available: DAYS_IN_WEEK[];

  @IsString()
  @IsNotEmpty()
  start_time: string;

  @IsString()
  @IsNotEmpty()
  end_time: string;
}

export class TransactionRateDto {
  @IsNumber()
  @IsNotEmpty()
  transaction_fees: number;

  @IsNumber()
  @IsNotEmpty()
  withdrawal_fees: number;

  @IsNumber()
  @IsNotEmpty()
  min_trans_balance: number;
}

export class TradingHoursDto {
  @IsString()
  @IsNotEmpty()
  nor_start_mor: string;

  @IsString()
  @IsNotEmpty()
  nor_end_mor: string;

  @IsString()
  @IsNotEmpty()
  nor_start_aft: string;

  @IsString()
  @IsNotEmpty()
  nor_end_aft: string;

  @IsArray()
  @IsEnum(DAYS_IN_WEEK, { each: true })
  nor_trading: DAYS_IN_WEEK[];

  @IsString()
  @IsNotEmpty()
  large_start_mor: string;

  @IsString()
  @IsNotEmpty()
  large_end_mor: string;

  @IsString()
  @IsNotEmpty()
  large_start_aft: string;

  @IsString()
  @IsNotEmpty()
  large_end_aft: string;

  @IsArray()
  @IsEnum(DAYS_IN_WEEK, { each: true })
  large_trading: DAYS_IN_WEEK[];
}

export class NewSharesDto {
  @IsNumber()
  @IsNotEmpty()
  date_new_share: number;

  @IsNumber()
  @IsNotEmpty()
  ipo_signed_on_purchased: number;

  @IsNumber()
  @IsNotEmpty()
  ipo_shenzhen: number;

  @IsNumber()
  @IsNotEmpty()
  ipo_beijing: number;

  @IsNumber()
  @IsNotEmpty()
  ipo_app_min: number;

  @IsNumber()
  @IsNotEmpty()
  ipo_app_max: number;

  @IsBoolean()
  hit_new_min_deposit_require: boolean;

  @IsNumber()
  hit_new_min_deposit_amount: number;

  @IsBoolean()
  multi_app: boolean;

  @IsBoolean()
  sufficient_available: boolean;
}
