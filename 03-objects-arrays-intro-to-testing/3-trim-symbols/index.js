/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */

const trimHelper = {
  counter: 0,
  current: null,
  finalStr: "",

  updateCurrent(char) {
    this.current = char;
    this.counter = 1;
    this.finalStr += char;
  },

  reset() {
    this.counter = 0;
    this.current = null;
    this.finalStr = "";
  },
};

export function trimSymbols(string, size) {
  switch (size) {
    case 0:
      return trimHelper.finalStr;
    case undefined:
      return string;
  }

  for (let char of string) {
    switch (trimHelper.current) {
      case char:
        trimHelper.counter < size ? (trimHelper.finalStr += char) : null;
        trimHelper.counter++;
        break;
      case null:
      default:
        trimHelper.updateCurrent(char);
    }
  }

  string = trimHelper.finalStr;
  trimHelper.reset();

  return string;
}
