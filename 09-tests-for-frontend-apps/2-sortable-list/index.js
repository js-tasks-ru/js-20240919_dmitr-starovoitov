export default class SortableList {
  constructor(data) {
    this.items = data.items;
    this.createElement();
    this.appendItems();
    this.createListeners();
  }

  createElement() {
    const element = document.createElement("div");
    element.innerHTML = this.createTemplate();
    this.element = element.firstElementChild;
  }

  createTemplate() {
    return `<ul class="sortable-list"></ul>`;
  }

  appendItems() {
    this.items.forEach((element) => {
      this.element.append(element);
    });
  }

  handleDeletePointerdown = (event) => {
    const deleteButton = event.target.closest("[data-delete-handle]");
    if (!deleteButton) return;

    event.target.closest("li").remove();
  };

  createPlaceholderElement(item) {
    const element = document.createElement("div");
    element.classList.add("sortable-list__placeholder");
    element.style.width = item.offsetWidth + "px";
    element.style.height = item.offsetHeight + "px";
    this.placeholderElement = element;
  }

  addStylesForDraggingItem(item) {
    item.style.zIndex = 1000;
    item.style.width = item.offsetWidth + "px";
    item.style.height = item.offsetHeight + "px";
    item.classList.add("sortable-list__item_dragging");
  }

  removeStylesForDraggingItem(item) {
    item.style = "";
    item.classList.remove("sortable-list__item_dragging");
  }

  handlePointerDown = (event) => {
    const grabElem = event.target.closest("[data-grab-handle]");
    if (!grabElem) return;

    const targetItem = grabElem.closest("li");

    let shiftX = event.clientX - targetItem.getBoundingClientRect().left;
    let shiftY = event.clientY - targetItem.getBoundingClientRect().top;

    this.addStylesForDraggingItem(targetItem);
    moveAt(event.pageX, event.pageY);

    this.createPlaceholderElement(targetItem);
    targetItem.before(this.placeholderElement);

    const handlePointerMove = (event) => {
      moveAt(event.pageX, event.pageY);

      targetItem.style.display = "none";

      const elemBelow = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest("li.sortable-list__item");

      targetItem.style.display = "flex";

      if (!elemBelow) return;

      if (elemBelow.getBoundingClientRect().top + shiftY <= event.pageY) {
        elemBelow.after(this.placeholderElement);
      } else if (
        elemBelow.getBoundingClientRect().top >=
        event.pageY - shiftY
      ) {
        elemBelow.before(this.placeholderElement);
      }
    };

    const handlePointerUp = () => {
      this.placeholderElement.after(targetItem);
      this.placeholderElement.remove();
      this.removeStylesForDraggingItem(targetItem);

      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    function moveAt(pageX, pageY) {
      targetItem.style.left = pageX - shiftX + "px";
      targetItem.style.top = pageY - shiftY + "px";
    }

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  createListeners() {
    this.element.addEventListener("pointerdown", this.handleDeletePointerdown);
    this.element.addEventListener("pointerdown", this.handlePointerDown);
  }

  removeEventListeners() {
    this.element.removeEventListener(
      "pointerdown",
      this.handleDeletePointerdown
    );
    this.element.removeEventListener("pointerdown", this.handlePointerDown);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}
