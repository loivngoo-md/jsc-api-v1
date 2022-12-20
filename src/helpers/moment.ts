import * as moment from 'moment-timezone';

moment.tz.setDefault('Asia/Shanghai');
console.log(process.env.TIMEZONE);

export const dateFormatter = moment;
