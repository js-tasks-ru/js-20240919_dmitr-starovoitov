/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  let arr = path.split(".");

  return function getProperty(obj) {
    const prop = arr.shift();
    const arrLength = arr.length;

    if (arrLength === 0) {
      arr = path.split(".");
    }

    return !obj.hasOwnProperty(prop)
      ? undefined
      : arrLength === 0
      ? obj[prop]
      : getProperty(obj[prop]);
  };
}
