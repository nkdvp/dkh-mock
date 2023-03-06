function queryStringReplace(qs: string, replaceWord: string, replaceTo = 'TRUE'): string {
  const fistIndex = qs.indexOf(replaceWord);
  if (fistIndex === -1) return qs;
  const lastIndex = qs.indexOf(')', fistIndex);
  const leftString = qs.slice(0, fistIndex);
  const rightString = qs.slice(lastIndex) || '';
  return `${leftString}${replaceTo}${rightString}`;
}
function prepareSubQueryString(qs: string, replaceWords: Array<any>) {
  let returnString = qs;
  replaceWords.forEach((word: any) => { returnString = queryStringReplace(returnString, word); });
  return returnString;
}
export default prepareSubQueryString;
