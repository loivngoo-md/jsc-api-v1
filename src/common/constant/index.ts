import { TOKEN_EXPIRES_IN } from './constants';

import {
  BAD_REQUEST,
  BALANCE_AVAILABLE_IS_NOT_ENOUGH,
  BLOCK_TRANSACTION_IS_NOT_OPEN,
  DEPOSIT_NOT_PENDING,
  DEPOSIT_RANGE_VALID_IS,
  isExistError,
  IS_LOGGED_IN,
  MINIMUM_QUANTITY_IS,
  notFoundError,
  NOT_ENOUGH_MONEY,
  NOT_FOUND,
  NOT_FOUND_POSITION,
  POSITION_CANT_SELL,
  POSITION_IS_CLOSED,
  TRADING_SESSION_IS_NOT_OPEN,
  UNAUTHORIZED,
  USER_MESSAGE,
  WITHDRAWAL_NOT_PENDING,
  WITHDRAWAL_RANGE_VALIS_IS,
  WITHDRAWAL_WRONG_PASSWORD,
} from './error-message';

export const MESSAGE = {
  TRADING_SESSION_IS_NOT_OPEN,
  BLOCK_TRANSACTION_IS_NOT_OPEN,
  MINIMUM_QUANTITY_IS,
  BALANCE_AVAILABLE_IS_NOT_ENOUGH,
  NOT_FOUND,
  BAD_REQUEST,
  NOT_FOUND_POSITION,
  IS_LOGGED_IN,
  UNAUTHORIZED,
  DEPOSIT_RANGE_VALID_IS,
  WITHDRAWAL_RANGE_VALIS_IS,
  NOT_ENOUGH_MONEY,
  DEPOSIT_NOT_PENDING,
  isExistError,
  notFoundError,
  POSITION_IS_CLOSED,
  POSITION_CANT_SELL,
  WITHDRAWAL_WRONG_PASSWORD,
  WITHDRAWAL_NOT_PENDING,
};

export { TOKEN_EXPIRES_IN, USER_MESSAGE };
