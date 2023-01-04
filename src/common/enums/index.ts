export enum ORDER_TYPE {
  BUY = 0,
  SELL = 1,
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

export enum COMMON_STATUS {
  CLOSED = 'closed',
  PENDING = 'pending',
  OPENING = 'opening',
}

export enum TRX_TYPE {
  NOR = 'normal',
  LAR = 'large',
}

export enum DEPOSIT_WITHDRAWAL_STATUS {
  PENDING = 0,
  SUCCESS = 1,
  FAIL = 2,
}

export enum TRANSACTION_TYPE {
  DEPOSIT = 3,
  WITHDRAWAL = 2,
  BUY = 0,
  SELL = 1,
}

export enum ACCOUNT_TYPE {
  CMS = 'cms',
  AGENT = 'agent',
  APP = 'app',
}

export enum MODIFY_TYPE {
  DECREASE,
  INCREASE,
}

export enum IMAGE_TYPE {
  BACK,
  FRONT,
}

export enum IPO_STOCK_TYPE {
  沪,
  深,
  北,
  科,
  创,
}
