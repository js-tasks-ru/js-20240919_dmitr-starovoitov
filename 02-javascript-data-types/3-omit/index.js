/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */

export const omit = (obj, ...fields) => {
  let finalObj = {};

  Object.entries(obj).forEach((i) => {
    if (!fields.includes(i[0])) {
      finalObj[i[0]] = i[1];
    }
  });

  return finalObj;
};
