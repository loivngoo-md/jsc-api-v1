export const convertC2FS = (C: string) => {
  switch (+C[0]) {
    case 0:
    case 2:
    case 3:
    case 9:
      return 'SZ' + C;
    case 4:
    case 8:
      return 'BJ' + C;
    case 6:
      return 'SH' + C;
    default:
      return C;
  }
};
