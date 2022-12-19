export interface ISystemConfiguration {
  deposits_and_withdrawals: IDepositsAndWithdrawals;
  transactions_rate: ITransactionsRate;
  trading_hours: ITradingHours;
  new_shares: INewShares;
  online_customer_service: String;
}

export interface IDepositsAndWithdrawals {
  deposit_min: Number;
  deposit_max: Number;
  withdrawal_min: Number;
  withdrawal_max: Number;
  deposit_permission: Boolean;
  withdrawal_permission: Boolean;
  insitutional_code: Number;
  deposit_prompt: String;
  upload_deposit_voucher: Boolean;
  transfer_account_detail: Boolean;
  withdrawal_prompt: String;
  Withdrawal_date_available: String[];
  start_time: Date;
  end_time: Date;
}

export interface ITransactionsRate {
  transaction_fees: Number;
  withdrawal_fees: Number;
  min_trans_balance: Number;
}

export interface ITradingHours {
  nor_start_mor: Date;
  nor_end_mor: Date;
  nor_start_aft: Date;
  nor_end_aft: Date;
  nor_trading: String[];
  large_start_mor: Date;
  large_end_mor: Date;
  large_start_aft: Date;
  large_end_aft: Date;
  large_trading: String[];
}

export interface INewShares {
  date_new_share: Number;
  ipo_signed_on_purchased: Number;
  ipo_shenzhen: Number;
  ipo_beijing: Number;
  ipo_app_min: Number;
  ipo_app_max: Number;
  hit_new_min_deposit_require: Boolean;
  hit_new_min_deposit_amount: Number;
  multi_app: Boolean;
  sufficient_available: Boolean;
}
