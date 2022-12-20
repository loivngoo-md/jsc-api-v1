export const getDates = (startDate: Date, days: number): Date[] => {
  const dateArray = new Array();
  let currentDate = new Date(startDate);
  const stopDate = new Date(startDate.setDate(startDate.getDate() + days));
  while (currentDate <= stopDate) {
    dateArray.push(new Date(currentDate));
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
  }
  return dateArray;
};

const dateIsValid = (date: any) => {
  return date instanceof Date && !isNaN(date as any);
};

export const chinaDate = (value?: any) => {
  const date = dateIsValid(new Date(value)) ? new Date(value) : new Date();
  return date.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' });
};

export const DAYS = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  0: 'sunday',
};
