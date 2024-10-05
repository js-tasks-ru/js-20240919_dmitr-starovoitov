export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.element = this.createElement();
    this.subElements = {
      header: this.element.querySelector('[data-element="header"]'),
      body: this.element.querySelector('[data-element="body"]'),
    };
  }

  createElement() {
    const element = document.createElement("div");
    element.classList.add("sortable-table");
    element.innerHTML =
      this.createHeader() +
      this.createBody() +
      this.createLoading() +
      this.createEmptyState();
    return element;
  }

  createHeader() {
    return ` <div data-element="header" class="sortable-table__header sortable-table__row">
    ${this.headerConfig.map((config) => this.createHeaderCell(config)).join("")}
    </div>`;
  }

  createHeaderCell(config) {
    return `<div class="sortable-table__cell" data-id="${config?.id}" data-sortable="${config?.sortable}">
        <span>${config?.title}</span>
      </div>`;
  }

  createBody() {
    return `<div data-element="body" class="sortable-table__body">
    ${this.data.map((item) => this.createBodyRow(item)).join("")}</div>`;
  }

  createBodyRow(item) {
    const headerConfigImages = this.headerConfig.find(
      (config) => config.id === "images"
    );

    return `<a href="/products/${item.id}}" class="sortable-table__row">
        ${headerConfigImages ? headerConfigImages.template(item.images) : ""}
        ${
          item.title
            ? `<div class="sortable-table__cell">${item.title}</div>`
            : ""
        }
        ${
          item.quantity
            ? `<div class="sortable-table__cell">${item.quantity}</div>`
            : ""
        }
        ${
          item.price
            ? `<div class="sortable-table__cell">${item.price}</div>`
            : ""
        }
        ${
          item.sales
            ? `<div class="sortable-table__cell">${item.title}</div>`
            : ""
        }
      </a>`;
  }

  createLoading() {
    return `<div data-element="loading" class="loading-line sortable-table__loading-line"></div>`;
  }

  createEmptyState() {
    return `<div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>`;
  }

  sort(field, order) {
    const config = this.headerConfig.find((config) => config.id === field);

    if (config.sortable === false) {
      return;
    }

    let sortFunc;

    switch (config.sortType) {
      case "string":
        const collator = new Intl.Collator(["ru", "en"], {
          sensitivity: "variant",
        });
        sortFunc =
          order === "asc"
            ? (a, b) => collator.compare(a[field], b[field])
            : (a, b) => collator.compare(b[field], a[field]);
        this.data.sort(sortFunc);
        break;

      case "number":
        sortFunc =
          order === "asc"
            ? (a, b) => a[field] - b[field]
            : (a, b) => b[field] - a[field];
        this.data = this.data.sort(sortFunc);
        break;
    }

    this.rerenderBody();
  }

  rerenderBody() {
    this.subElements.body?.remove();

    this.subElements.header?.insertAdjacentHTML("afterend", this.createBody());

    this.subElements.body = this.element.querySelector('[data-element="body"]');
  }

  destroy() {
    this.element?.remove();
  }
}
