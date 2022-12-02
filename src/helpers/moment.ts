import * as moment from 'moment-timezone'

moment.tz.setDefault(process.env.TIMEZONE)

export const dateFormatter = moment