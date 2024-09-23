/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  const locales = ["ru", "en"];
  const option = { sensitivity: "variant", caseFirst: "upper" };
  const collator = new Intl.Collator(locales, option);
  const sortDesc = (a, b) => collator.compare(b, a);
  const sortAsc = (a, b) => collator.compare(a, b);

  const sortedArr =
    param === "asc" ? arr.slice().sort(sortAsc) : arr.slice().sort(sortDesc);

  return sortedArr;
}
