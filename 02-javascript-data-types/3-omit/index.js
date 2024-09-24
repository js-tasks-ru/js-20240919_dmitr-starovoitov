/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  if ([...fields].length !== 0) {
    return Object.entries(obj).reduce((obj, current) => {
      if (![...fields].includes(current[0])) {
        obj[current[0]] = current[1];
      }
      return obj;
    }, {});
  }
  return {};
};
