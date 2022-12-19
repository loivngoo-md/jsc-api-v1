import { DEPOSIT_WITHDRAWAL_STATUS } from '../../../common/enums';

export type DepositQuery = {
  username?: string;
  is_virtual_deposit?: boolean;
  status?: DEPOSIT_WITHDRAWAL_STATUS;
  start_time?: Date;
  end_time?: Date;
  page?: number;
  limit?: number;
};
