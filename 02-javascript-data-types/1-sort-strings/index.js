/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  const sorted = arr
    .slice()
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), "ru"));

  for (let i = 0; i < sorted.length - 1; i++) {
    const firstElem = sorted[i];
    const secondElem = sorted[i + 1];

    if (
      firstElem.toLowerCase().localeCompare(secondElem.toLowerCase()) === 0 &&
      secondElem[0] === firstElem[0].toUpperCase()
    ) {
      [sorted[i], sorted[i + 1]] = [sorted[i + 1], sorted[i]];
    }
  }

  if (param === "desc") {
    return sorted.reverse();
  }

  return sorted;
}
