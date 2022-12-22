import * as moment from 'moment-timezone';

moment.tz.setDefault('Asia/Shanghai');

export const dateFormatter = moment;
