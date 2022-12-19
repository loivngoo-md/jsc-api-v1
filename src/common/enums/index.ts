export enum ORDER_TYPE {
  BUY = 'B',
  SELL = 'S',
}

export enum POSITION_STATUS {
  CLOSED,
  OPEN,
}

export enum DAYS_IN_WEEK {
  MON = 'monday',
  TUE = 'tuesday',
  WED = 'wednesday',
  THU = 'thursday',
  FRI = 'friday',
  SAT = 'saturday',
  SUN = 'sunday',
}

export enum SESSION_STATUS {
  CLOSED = 'closed',
  PENDING = 'pending',
  OPENING = 'opening',
}

export enum DEPOSIT_WITHDRAWAL_STATUS {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAIL = 'fail',
}

export enum TRANSACTION_TYPE {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  BUY = 'buy',
  SELL = 'sell',
}
