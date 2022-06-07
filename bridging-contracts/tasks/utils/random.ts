import seedrandom from 'seedrandom';

const _prng = seedrandom('nsfw-tests');

const range = (start, end) => {
  return [...Array(1 + end - start).keys()].map((v) => start + v);
};

export const randomProceduralRange = ({ size, minVal, maxVal }) => {
  const _vals = range(minVal, maxVal);
  return [...Array(size).keys()].map((v) => {
    const r = _prng() * _vals.length;
    return _vals[Math.floor(r) - 1];
  });
};
