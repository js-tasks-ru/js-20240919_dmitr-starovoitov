import fetchJson from "./utils/fetch-json.js";
import SortableTableV2 from "../../06-events-practice/1-sortable-table-v2/index.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTableV3 extends SortableTableV2 {
  loadStartDefault = 0;
  loadEndDefault = 30;
  loadStep = this.loadEndDefault - this.loadStartDefault;

  loadStartCurrent;
  loadEndCurrent;
  isLoaded = false;

  currentSortedId;
  currentSortedOrder;

  constructor(
    headersConfig,
    { data = [], url = "", isSortLocally = false } = {}
  ) {
    super(headersConfig, { data });
    this.path = url;
    this.isSortLocally = isSortLocally;

    this.sortOnServer(this.defaultSortedId, this.defaultSortedOrder);

    super.destroyListeners();

    this.handleHeaderPointerDownVariable = this.handleHeaderPointerDown;

    this.createListeners();
  }

  sortOnClient(id, order) {
    this.sort(id, order);
  }

  async sortOnServer(id, order) {
    this.saveCurrentSortedIdAndOrder(id, order);

    const url = new URL(this.path, BACKEND_URL);
    url.searchParams.set("_embed", "subcategory.category");
    url.searchParams.set("_sort", id);
    url.searchParams.set("_order", order);
    url.searchParams.set("_start", this.loadStartDefault);
    url.searchParams.set("_end", this.loadEndDefault);

    this.addLoadingClass();

    const responseData = await fetchJson(url);

    this.data = responseData;

    this.updateCurrentLoadStartAndEnd();
    this.removeLoadingClass();
    this.isLoaded = false;
    this.render();
    this.render1();
  }

  async loadFromServer() {
    const url = new URL(this.path, BACKEND_URL);
    url.searchParams.set("_embed", "subcategory.category");
    url.searchParams.set("_sort", this.currentSortedId);
    url.searchParams.set("_order", this.currentSortedOrder);
    url.searchParams.set("_start", this.loadStartCurrent);
    url.searchParams.set("_end", this.loadEndCurrent);

    this.addLoadingClass();

    const responseData = await fetchJson(url);

    if (responseData.length) {
      this.isLoaded = false;
    }

    this.data = this.data.concat(responseData);

    this.updateCurrentLoadStartAndEnd();
    this.removeLoadingClass();
    this.render();
    this.render1();
  }

  saveCurrentSortedIdAndOrder(id, order) {
    this.currentSortedId = id;
    this.currentSortedOrder = order;
  }

  updateCurrentLoadStartAndEnd() {
    this.loadStartCurrent = this.data.length;
    this.loadEndCurrent = this.loadStartCurrent + this.loadStep;
  }

  render() {
    if (this.data.length === 0) {
      this.addEmptyClass();
      return;
    }
    if (this.element.classList.contains("sortable-table_loading")) {
      this.removeEmptyClass();
    }
    super.rerenderBody();
  }

  addEmptyClass() {
    this.element.classList.add("sortable-table_empty");
  }

  removeEmptyClass() {
    this.element.classList.remove("sortable-table_empty");
  }

  addLoadingClass() {
    this.element.classList.add("sortable-table_loading");
  }

  removeLoadingClass() {
    this.element.classList.remove("sortable-table_loading");
  }

  handleHeaderPointerDown = (event) => {
    const headerCell = event.target.closest('[data-sortable="true"]');

    if (!headerCell || !this.subElements.header?.contains(headerCell)) return;

    const currentOrder = headerCell.dataset.order;

    let order = this.defineOrder(headerCell, currentOrder);
    this.appendArrow(headerCell, order);

    if (this.isSortLocally) {
      this.sortOnClient(headerCell.dataset.id, order);
    } else {
      this.sortOnServer(headerCell.dataset.id, order);
    }
  };

  handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      !this.isLoaded
    ) {
      this.isLoaded = true;
      this.loadFromServer();
    }
  };

  createListeners() {
    super.createListeners();
    window.addEventListener("scroll", this.handleScroll);
  }

  destroyListeners() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  destroy() {
    super.destroy();
    this.destroyListeners();
  }
}
