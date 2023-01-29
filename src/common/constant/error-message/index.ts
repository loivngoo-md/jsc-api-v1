import * as cn from './cn.json';
import * as en from './en.json';

const STORE_LANGS = {
  en,
  cn,
};
const KEY_LANGS = Object.keys(STORE_LANGS);

export const replaceMess = (message: string, objectData: Object) => {
  Object.keys(objectData).forEach((key) => {
    if (objectData[key]) {
      message = message.replace(
        new RegExp(`{${key}}`, 'g'),
        objectData[key].toString(),
      );
    }
  });
  return message;
};

export const convertMessage = (
  key: string,
  lang?: string,
  valueObj?: Object,
) => {
  const langName = lang ? lang.toLowerCase() : 'cn';
  const langStore = KEY_LANGS.includes(langName)
    ? STORE_LANGS[langName]
    : STORE_LANGS['cn'];

  const value = key in langStore ? langStore[key] : key;
  return valueObj instanceof Object ? replaceMess(value, valueObj) : value;
};

export const convertMessageValidate = (message: string, lang?: string) => {
  if (message && message.includes(SEPARATOR)) {
    try {
      const [key, valueStr] = message.split(SEPARATOR);
      const valueObj = JSON.parse(valueStr);
      return convertMessage(key, lang, valueObj);
    } catch (err) {
      return convertMessage(message, lang);
    }
  }
  return convertMessage(message, lang);
};

const SEPARATOR = '!!@!!';
export const getValidateMess = {
  invalid: (field: string, type: string) => {
    return `${VALIDATE.INVALID_FIELD}${SEPARATOR}${JSON.stringify({
      field,
      type,
    })}`;
  },
  required: (field: string) => {
    return `${VALIDATE.REQUIRED_FIELD}${SEPARATOR}${JSON.stringify({ field })}`;
  },
  minLen: (field: string, len: number) => {
    return `${VALIDATE.MIN_LEN_FIELD}${SEPARATOR}${JSON.stringify({
      field,
      len,
    })}`;
  },
  maxLen: (field: string, len: number) => {
    return `${VALIDATE.MAX_LEN_FIELD}${SEPARATOR}${JSON.stringify({
      field,
      len,
    })}`;
  },
  minVal: (field: string, val: number) => {
    return `${VALIDATE.MIN_VAL_FIELD}${SEPARATOR}${JSON.stringify({
      field,
      val,
    })}`;
  },
  maxVal: (field: string, val: number) => {
    return `${VALIDATE.MAX_VAL_FIELD}${SEPARATOR}${JSON.stringify({
      field,
      val,
    })}`;
  },
};

export const VALIDATE = {
  REQUIRED_FIELD: 'field.required',
  INVALID_FIELD: 'field.invalid',
  MIN_LEN_FIELD: 'field.min.len',
  MAX_LEN_FIELD: 'field.max.len',
  MIN_VAL_FIELD: 'field.min.val',
  MAX_VAL_FIELD: 'field.max.val',
};

export const MESSAGES = {
  BAD_REQUEST: 'bad.request',
  UNAUTHORIZED: 'unauthorized',
  INVALID_TOKEN: 'invalid.token',
  WRONG_SINGIN: 'wrong.username.password',
  WRONG_OLD_PASSWORD: 'wrong.old.password',

  /** App user error message */
  APP_NOT_ACTIVE: 'app.is.not.active',
  APP_NOT_ENOUGH_MONEY: 'app.balance.avail.is.not.enough',
  APP_NOT_FOUND: 'app.is.not.found',
  APP_IS_VERIFIED: 'app.is.verified',
  APP_IS_EXIST: 'app.is.exist',

  /** Cms user error message */
  CMS_NOT_ACTIVE: 'cms.is.not.active',
  CMS_IS_EXIST: 'cms.is.exist',
  CMS_NOT_FOUND: 'cms.is.not.found',

  /** Agent user error message */
  AGENT_NOT_ACTIVE: 'agent.is.not.active',
  AGENT_IS_EXIST: 'agent.is.exist',
  AGENT_NOT_FOUND: 'agent.is.not.found',

  /** Block error message */
  BLOCK_TRX_NOT_FOUND: 'lar.trx.not.found',
  BLOCK_TRX_NOT_OPEN: 'lar.trx.is.not.opening',

  /** Deposit Account error message */
  DEPOSIT_ACCOUNT_NOT_FOUND: 'deposit.account.not.found',

  /** Deposit error message */
  DEPOSIT_NOT_FOUND: 'deposit.not.found',
  DEPOSIT_NOT_PENDING: 'deposit.is.not.pending',
  DEPOSIT_AMOUNT_OUT_OF_RANGE: 'deposit.amount.out.of.range',

  /** Favorit Stock error message */
  FAVORIT_IS_EXIST: 'favorit.is.exist',
  FAVORIT_NOT_FOUND: 'favorit.is.not.found',

  /** IPO Stock error message */
  IPO_STOCK_NOT_ENOUGH_QUANTITY: 'ipo.stock.quantity.is.not.enough',
  IPO_STOCK_NOT_ON_MARKET: 'ipo.stock.is.not.on.market',
  IPO_STOCK_NOT_FOUND: 'ipo.stock.is.not.found',
  IPO_STOCK_IS_EXIST: 'ipo.stock.is.exist',

  /** Ipo Application error message */
  IPO_APP_NOT_PAID: 'ipo.app.is.not.paid',
  IPO_APP_NOT_PENDING: 'ipo.app.is.not.pending',
  IPO_APP_CANT_REMOVE: 'ipo.app.cant.remove',

  /** Order error message */
  ORDER_NOT_FOUND: 'order.is.not.found',

  /** Stock Storage error message */
  POSITION_NOT_FOUND: 'position.is.not.found',
  POSITION_NOT_CLOSED: 'position.is.not.closed',
  POSITION_CANT_SELL: 'position.cant.sell',
  POSITION_NOT_FOUND_ENOUGH: 'positions.are.not.found.enough',

  /** Trading session error message */
  TRADING_SESSION_NOT_OPEN: 'trading.session.is.not.opening',

  /** Stock error message */
  STOCK_NOT_FOUND: 'stock.is.not.found',

  /** Withdrawal error message */
  WITHDRAWAL_WRONG_PASSWORD: 'withdrawal.wrong.password',
  WITHDRAWAL_NOT_PENDING: 'withdrawal.is.not.pending',
  WITHDRAWAL_NOT_FOUND: 'withdrawal.is.not.found',
};
