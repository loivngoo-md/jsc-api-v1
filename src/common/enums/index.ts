export enum ORDER_TYPE {
  BUY,
  SELL,
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

export enum IPO_APP_STATUS {
  PENDING = 'pending',
  FAIL = 'fail',
  SUCCESS = 'success',
  PAID = 'paid',
  TRANFER = 'tranfer',
}

export enum TRX_TYPE {
  NOR = 'normal',
  LAR = 'large',
  IPO = 'ipo',
}

export enum DEPOSIT_WITHDRAWAL_STATUS {
  PENDING,
  SUCCESS,
  FAIL,
}

export enum TRANSACTION_TYPE {
  BUY,
  SELL,
  WITHDRAWAL,
  DEPOSIT,
  BUY_IPO,
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
