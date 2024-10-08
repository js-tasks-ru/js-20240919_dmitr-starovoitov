import SortableTableV1 from "../../05-dom-document-loading/2-sortable-table-v1/index.js";

export default class SortableTableV2 extends SortableTableV1 {
  constructor(
    headersConfig,
    {
      data = [],
      sorted = {
        id: headersConfig.find((item) => item.sortable).id,
        order: "asc",
      },
    } = {}
  ) {
    super(headersConfig, data);

    this.arrowElement = this.createArrowElement();

    this.defaultSortedId = sorted.id;
    this.defaultSortedOrder = sorted.order;

    this.sort(
      this.element.querySelector(`[data-id="${this.defaultSortedId}"]`),
      this.defaultSortedOrder
    );

    this.createListeners();
  }

  createArrowElement() {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = this.createArrowTemplate();
    return tempElement.firstElementChild;
  }

  createArrowTemplate() {
    return `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`;
  }

  handleHeaderClick = (event) => {
    const headerCell = event.target.closest('[data-sortable="true"]');

    if (!headerCell) return;

    const currentOrder = headerCell.dataset.order;

    this.sort(headerCell, currentOrder);
  };

  sort(element, order = "desc") {
    if (element.lastElementChild === this.arrowElement) {
      if (order === "desc") {
        order = "asc";
      } else {
        order = "desc";
      }
    }

    element.setAttribute("data-order", order);

    element.appendChild(this.arrowElement);

    super.sort(element.dataset.id, order);
  }

  createListeners() {
    this.subElements.header?.addEventListener(
      "pointerdown",
      this.handleHeaderClick
    );
  }

  destroyListeners() {
    this.subElements.header?.removeEventListener(
      "pointerdown",
      this.handleHeaderClick
    );
  }

  destroy() {
    super.destroy();
    this.destroyListeners();
  }
}
