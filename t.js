const MESSAGES = {
  'field.required': '{field} is required.',
  'field.invalid': '{field} is invalid',
  'field.min.len': '{field} has min length: {len}.',
  'field.max.len': '{field} has max length: {len}.',
  'field.min.val': '{field} has min value: {val}.',
  'field.max.val': '{field} has max value: {val}.',
};

'field.requried!!@!!'

const keys = Object.keys(MESSAGES);
const values = Object.values(MESSAGES);
console.log(values);

// const r = require('./test.json');

// console.log(r);

// const values = [
//   '您无权使用此服务。',
//   '令牌无效。',
//   '用户名或密码错误',
//   '您的旧密码错误。',
//   '您的帐户未激活。',
//   '您的可用余额不足以购买。',
//   '找不到应用程序用户。',
//   '应用用户已经通过验证，不能更改信息。',
//   '应用程序用户已经存在。',
//   'CMS 用户未激活。',
//   'CMS 用户已经存在。',
//   '未找到 CMS 用户。',
//   '代理用户不活跃。',
//   '代理用户已经存在。',
//   '找不到代理用户。',
//   '未找到大交易。',
//   '大宗交易未开启。',
//   '找不到存款账户。',
//   '找不到存款。',
//   '存款状态不是待处理。',
//   '存款金额超出允许范围。',
//   '最喜欢的股票已经存在。',
//   '找不到最喜欢的股票。',
//   '新股数量不足，无法购买。',
//   '新股未上市，不可转让。',
//   '未找到 IPO 股票。',
//   'IPO 股票已经存在。',
//   'IPO申请状态未支付，无法转让。',
//   'IPO 申请状态不是待定。',
//   'IPO 申请无法删除。',
//   '找不到订单。',
//   '找不到位置。',
//   '仓位状态未平仓。',
//   '头寸不能卖出。',
//   '找不到某个位置。',
//   '交易时段未开启，无法购买。',
//   '找不到库存。',
//   '您的提现密码错误',
//   '提款状态不是待处理。',
//   '未找到取款。',
// ];
