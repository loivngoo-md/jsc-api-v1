import { DEPOSIT_WITHDRAWAL_STATUS } from '../../../common/enums';

export type WithdrawalQuery = {
  username?: string;
  status?: DEPOSIT_WITHDRAWAL_STATUS;
  start_time?: Date;
  end_time?: Date;
  page?: number;
  limit?: number;
};
