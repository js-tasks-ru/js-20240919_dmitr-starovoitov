/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  if ([...fields].length !== 0) {
    return Object.entries(obj).reduce((obj, current) => {
      if ([...fields].includes(current[0])) {
        obj[current[0]] = current[1];
      }
      return obj;
    }, {});
  }
  return {};
};
