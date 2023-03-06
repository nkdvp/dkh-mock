/* eslint-disable implicit-arrow-linebreak */
const matchingElemPosition = <T>(leftElem: T, rightElem: T) => (isEqual: (x: T, y: T) => boolean) =>
  (array: T[], from: number, to: number, visited: boolean[]) => {
    let sum = 0;
    for (let i = from; i < to; i += 1) {
      // eslint-disable-next-line no-continue
      if (visited[i]) continue;
      const equalsToLeftElem = isEqual(array[i], leftElem);
      const equalsToRightElem = isEqual(array[i], rightElem);
      // eslint-disable-next-line no-continue
      if (!equalsToLeftElem && !equalsToRightElem) continue;
      sum = equalsToLeftElem ? sum + 1 : sum - 1;
      if (sum < 0) return -1;
      if (sum === 0) return i;
    }
    return -1;
  };

const findFirst = <T>(...matchableElems: T[]) => (isEqual: (x: T, y: T) => boolean) =>
  (array: T[], from: number, to: number, visited: boolean[]) => {
    for (let i = from; i < to; i += 1) {
      // eslint-disable-next-line no-continue
      if (visited[i]) continue;
      const matched = matchableElems.some((elem) => isEqual(elem, array[i]));
      if (matched) return i;
    }
    return -1;
  };

const allTrue = (...conditions: boolean[]) =>
  conditions.every((cond) => cond === true);

const someTrue = (...conditions: boolean[]) =>
  conditions.some((cond) => cond === true);

export {
  matchingElemPosition,
  findFirst,
  allTrue,
  someTrue,
};
