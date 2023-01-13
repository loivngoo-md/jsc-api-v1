/**
 * Common constant
 */

export const NOT_FOUND = '未找到。';
export const BAD_REQUEST = '错误的请求。';
export const UNAUTHORIZED = '未经授权。';
export const IS_LOGGED_IN = '已登录系统。';

export const NOT_FOUND_TEAM = '团队不存在';
export const NOT_FOUND_USER = '用户不存在';
export const NOT_FOUND_REQUEST = '请求不存在';
export const INTERNAL_SERVER_ERROR = '内部服务器错误';

export const EMPTY = '空的';

/**-------------------------------------------------------------------- */

/**
 * Error occur when user log in by email/password failed
 */
export const INVALID_USERNAME = '无效的用户名';
export const INVALID_ID = '无效的ID';
export const INVALID_PASSWORD = '无效的密码';
export const INVALID_TOKEN = '令牌无效';

/**
 * Error occur when user login via Google failed
 */
export const LOGIN_ERR = '当前用户未登录系统';
/**-------------------------------------------------------------------- */

/**
 * Error occur user request to API User
 */

export const USER_MESSAGE = {
  INVALID_USERNAME: '无效的用户名',
  INVALID_PASSWORD: '密码无效',
  INVALID_EMAIL: '电子邮件无效',
  INVALID_FIRSTNAME: '名字无效',
  INVALID_LASTNAME: '姓氏无效',
  INVALID_ROLE: '角色无效',
  INVALID_AVATAR_CODE: '头像无效',
  USER_EXITED: '电子邮件或用户名已经存在',
  WRONG_OLD_PASSWORD: '旧密码错误',
  WRONG_SINGIN: '用户名或密码错误',
  NOT_ACTIVE: '用户不活跃',
  LACK_WITHDRAWAL_PW: '缺少旧密码取款',
};
/**-------------------------------------------------------------------- */

/**
 * Error when user request to API Team
 */

export const TEAM_MESSAGE = {
  INVALID_NAME: '名称无效',
};
/**-------------------------------------------------------------------- */

/**
 * Error when user request to API Device
 */

export const DEVICE_MESSAGE = {
  INVALID_NAME: '无效名称',
  INVALID_DESCRIPTION: '无效描述',
  INVALID_GUARANTEE: '无效保证',
  INVALID_MANUFACTURER: '制造商无效',
  INVALID_QR_CODE: '二维码无效',
  INVALID_STATUS: '无效状态',
  INVALID_START_DATE: '无效的开始日期',
  NOT_FOUND_DEVICE: '未找到有效设备',
  USING_DEVICE: '无法使用设备删除',
};
/**-------------------------------------------------------------------- */

/**
 * Error when user request to API request
 */

/**-------------------------------------------------------------------- */

// export const REQUEST_ERROR = {};

export const ENUM_ERR = {
  INVALID_ROLE: '无效角色',
  INVALID_REQUEST_STATUS: '请求状态无效',
  INVALID_DEVICE_USAGE_STATUS: '无效的设备使用状态',
  INVALID_REQUEST_TYPE: '请求类型无效',
  INVALID_REQUEST_PRIORITY: '请求优先级无效',
};

/* Exception */
export const FORDBBIDEN_MESS = {
  FORBIDDEN_UPDATE_REQUEST: '您无权编辑此请求',
  APPROVED_EXCEP: `你不能编辑批准的请求`,
  MISSING_DEVICEID: `请更新设备`,
};

export const MISSING_PARAMS = `缺少必需的参数`;

export const UNAVAIL_DEVICE = `不可用的设备`;

export const FORBIDDEN = `禁止的资源。`;

export const NOT_ENOUGH_MONEY = '钱不够。';

/** Trading Session Message */
export const TRADING_SESSION_IS_NOT_OPEN = '交易时段未开放。';
export const BLOCK_TRANSACTION_IS_NOT_OPEN = '大宗交易未开启。';
export const MINIMUM_QUANTITY_IS = '最小数量是';
export const BALANCE_AVAILABLE_IS_NOT_ENOUGH = '可用余额不足。';

/**Position Message */
export const POSITION_IS_CLOSED = '头寸已平仓。';
export const NOT_FOUND_POSITION = '未找到打开会话。';
export const POSITION_CANT_SELL = '由于开盘交易，头寸无法卖出。';

/** Deposit Message */
export const DEPOSIT_RANGE_VALID_IS = '存款应在范围内';
export const DEPOSIT_NOT_PENDING = '押金已审核。';

/**Withdrawal Messagage */
export const WITHDRAWAL_RANGE_VALIS_IS = '取款应该在范围内';
export const WITHDRAWAL_WRONG_PASSWORD = '提现密码错误';
export const WITHDRAWAL_NOT_PENDING = '撤回审查。';

/**Large Transaction */
export const BLOCK_TRX_INVALID_ST_AND_ET = '开始时间必须小于结束时间';
/**Ipo Stock */
export const IPO_STOCK_QUANTITY = '购买数量不足。';
export const IPO_STOCK_MISSING_ACT_QUANTITY = '缺少实际数量';
export const IPO_STOCK_NOT_ON_MARKET = '首次公开募股不在市场上。 无法转移。';

/**Ipo Application */
export const IPO_APP_STATUS_PAID = '未支付 IPO 申请。';
export const IPO_APP_STATUS_NOT_PENDING = 'Ipo 应用程序未挂起。';
export const IPO_APP_QUANTITY_INCREASE = '不足以增加数量。';
export const IPO_APP_WRONG_STATUS = '首次公开募股申请的错误状态';

export const isExistError = (entity: string, addMess?: string) => {
  return addMess ? ` 存在 ${entity} ${addMess}` : `${entity} 存在`;
};

export const notFoundError = (entity: string, addMess?: string) => {
  return addMess ? `未找到 ${entity} ${addMess}` : `未找到 ${entity}`;
};
