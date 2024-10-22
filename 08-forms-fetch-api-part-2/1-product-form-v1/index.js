import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";
const CATEGORIES_PATH = "api/rest/categories";
const PRODUCT_PATH = "api/rest/products";

export default class ProductForm {
  constructor(productId) {
    this.productId = productId;
  }

  getCategoriesUrl() {
    const url = new URL(CATEGORIES_PATH, BACKEND_URL);
    url.searchParams.set("_sort", "weight");
    url.searchParams.set("_refs", "subcategory");
    return url;
  }

  getProductUrlById() {
    const url = new URL(PRODUCT_PATH, BACKEND_URL);
    url.searchParams.set("id", `${this.productId}`);
    return url;
  }

  getProductUrl() {
    return new URL(PRODUCT_PATH, BACKEND_URL);
  }

  async render() {
    this.prepareCategoryNames(await fetchJson(this.getCategoriesUrl()));

    if (this.productId) {
      const response = await fetchJson(this.getProductUrlById());
      this.productData = response[0];
    }

    this.createElement();
    this.fillInCategories();

    if (this.productId) {
      this.fillInFormData();
    }

    return this.element;
  }

  fillInCategories() {
    this.categoriesMap.forEach((value, key) => {
      this.subElements.productForm.subcategory.append(new Option(value, key));
    });
  }

  fillInFormData() {
    this.subElements.productForm.title.value = escapeHtml(
      this.productData.title
    );
    this.subElements.productForm.description.value = escapeHtml(
      this.productData.description
    );
    this.subElements.productForm.price.value = escapeHtml(
      this.productData.price.toString()
    );
    this.subElements.productForm.discount.value = escapeHtml(
      this.productData.discount.toString()
    );
    this.subElements.productForm.quantity.value = escapeHtml(
      this.productData.quantity.toString()
    );
    this.subElements.productForm.subcategory.value = escapeHtml(
      this.productData.subcategory
    );
    this.subElements.productForm.status.value = escapeHtml(
      this.productData.status.toString()
    );
  }

  getUpdatedProduct() {
    const product = {};
    const formData = new FormData(this.subElements.productForm);
    product.images = [];

    if (this.productId) {
      product.id = this.productData.id;
      product.images = this.productData.images;
    }

    product.title = formData.get("title");
    product.description = formData.get("description");
    product.price = +formData.get("price");
    product.discount = +formData.get("discount");
    product.quantity = +formData.get("quantity");
    product.subcategory = formData.get("subcategory");
    product.status = +formData.get("status");

    return product;
  }

  prepareCategoryNames(response) {
    const valueNames = new Map();

    for (const category of response) {
      for (const child of category.subcategories) {
        valueNames.set(child.id, `${category.title} > ${child.title}`);
      }
    }

    this.categoriesMap = valueNames;
  }

  createElement() {
    const element = document.createElement("div");
    element.innerHTML = this.createTemplate();

    this.element = element.firstElementChild;

    this.subElements = {
      productForm: this.element.querySelector('[data-element="productForm"]'),
      imageListContainer: this.element.querySelector(
        '[data-element="imageListContainer"]'
      ),
    };

    this.createListeners();
  }

  handleSubmitFromUpdate = async (event) => {
    event.preventDefault();
    await fetch(this.getProductUrl(), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(this.getUpdatedProduct()),
    });

    this.subElements.productForm.dispatchEvent(
      new CustomEvent("product-updated", {
        bubbles: true,
      })
    );
  };

  handleSubmitFromCreate = async (event) => {
    event.preventDefault();
    await fetch(this.getProductUrl(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(this.getUpdatedProduct()),
    });

    this.subElements.productForm.dispatchEvent(
      new CustomEvent("product-saved", {
        bubbles: true,
      })
    );
  };

  createListeners() {
    if (this.productId) {
      this.subElements.productForm?.addEventListener(
        "submit",
        this.handleSubmitFromUpdate
      );
    } else {
      this.subElements.productForm?.addEventListener(
        "submit",
        this.handleSubmitFromCreate
      );
    }
  }

  removeListeners() {
    if (this.productId) {
      this.subElements.productForm?.removeEventListener(
        "submit",
        this.handleSubmitFromUpdate
      );
    } else {
      this.subElements.productForm?.removeEventListener(
        "submit",
        this.handleSubmitFromCreate
      );
    }
  }

  destroy() {
    this.element.remove();
    this.removeListeners();
  }

  createImageTemplate() {
    if (this.productId) {
      return this.productData.images
        .map(
          (img) =>
            `<li class="products-edit__imagelist-item sortable-list__item" style="">
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
        </li>`
        )
        .join("");
    }
    return "";
  }

  createTemplate() {
    return `<div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
        <ul class="sortable-list">
        ${this.createImageTemplate()}
        </ul>
      </div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" id="subcategory" name="subcategory">
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" id="price" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" id="discount" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" id="status" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>
  </div>`;
  }
}
