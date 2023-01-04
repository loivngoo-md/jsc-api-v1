export const DAYS = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  0: 'sunday',
};

export const compareHours = (h1: string, h2: string, h3?: string) => {
  console.log(h1, h2);
  if (h1.length === h2.length && h1.length === 8) {
    return h3 ? h1 >= h2 && h3 > h1 : h1 >= h2;
  } else {
    const fn = (pV: number, cV: string, i: number) => {
      if (i === 0) {
        return pV + +cV * 60 * 60;
      } else if (i === 1) {
        return pV + +cV * 60;
      } else {
        return pV + cV;
      }
    };
    const s1 = h1.split(':').reduce(fn, 0);
    const s2 = h2.split(':').reduce(fn, 0);
    const s3 = h3 ? h3.split(':').reduce(fn, 0) : 0;
    return h3 ? s1 >= s2 && s3 > s1 : s1 >= s2;
  }
};
