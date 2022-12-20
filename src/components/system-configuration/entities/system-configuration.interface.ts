export interface ISystemConfiguration {
  deposits_and_withdrawals: IDepositsAndWithdrawals;
  transactions_rate: ITransactionsRate;
  trading_hours: ITradingHours;
  new_shares: INewShares;
  online_customer_service: string;
}

export interface IDepositsAndWithdrawals {
  deposit_min: number;
  deposit_max: number;
  withdrawal_min: number;
  withdrawal_max: number;
  deposit_permission: boolean;
  withdrawal_permission: boolean;
  insitutional_code: number;
  deposit_prompt: string;
  upload_deposit_voucher: boolean;
  transfer_account_detail: boolean;
  withdrawal_prompt: string;
  Withdrawal_date_available: string[];
  start_time: string;
  end_time: string;
}

export interface ITransactionsRate {
  transaction_fees: number;
  withdrawal_fees: number;
  min_trans_balance: number;
}

export interface ITradingHours {
  nor_start_mor: string;
  nor_end_mor: string;
  nor_start_aft: string;
  nor_end_aft: string;
  nor_trading: string[];
  large_start_mor: string;
  large_end_mor: string;
  large_start_aft: string;
  large_end_aft: string;
  large_trading: string[];
}

export interface INewShares {
  date_new_share: number;
  ipo_signed_on_purchased: number;
  ipo_shenzhen: number;
  ipo_beijing: number;
  ipo_app_min: number;
  ipo_app_max: number;
  hit_new_min_deposit_require: boolean;
  hit_new_min_deposit_amount: number;
  multi_app: boolean;
  sufficient_available: boolean;
}
