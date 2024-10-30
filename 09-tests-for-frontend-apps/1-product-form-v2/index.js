import SortableList from "../2-sortable-list/index.js";
import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";
import ProductFormV1 from "../../08-forms-fetch-api-part-2/1-product-form-v1/index.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm extends ProductFormV1 {
  constructor(productId) {
    super();
    this.productId = productId;
  }

  async render() {
    await super.render();
    const listContainer = this.element.querySelector(".sortable-list");
    listContainer.innerHTML = "";
    this.createSortableList();
    listContainer.append(this.sortableList.element);
    return this.element;
  }

  createSortableList() {
    this.sortableList = new SortableList({
      items: this.productData.images.map((img) => {
        const element = document.createElement("li");
        element.classList.add("products-edit__imagelist-item");
        element.classList.add("sortable-list__item");
        element.innerHTML = `
         <input type="hidden" name="url" value="${escapeHtml(img.url)}">
          <input type="hidden" name="source" value="${escapeHtml(img.source)}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(
              img.url
            )}">
            <span>${escapeHtml(img.source)}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
      `;
        return element;
      }),
    });
  }
}
