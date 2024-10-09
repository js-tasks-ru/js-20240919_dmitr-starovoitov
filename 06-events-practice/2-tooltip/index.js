class Tooltip {
  static instance;
  element;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize() {
    this.createListeners();
  }

  createElement() {
    const element = document.createElement("div");
    element.classList.add("tooltip");
    return element;
  }

  render(textContent) {
    this.element = this.createElement();
    this.element.textContent = textContent;
    document.body.append(this.element);
  }

  handleDataTooltipPointerOver = (event) => {
    const tooltipValue = event.target.dataset.tooltip;
    if (!tooltipValue) return;

    this.render(tooltipValue);
  };

  handleDataTooltipPointerMove = (event) => {
    if (!this.element) return;

    this.element.style.top = event.clientY + "px";
    this.element.style.left = event.clientX + "px";
  };

  handleDataTooltipPointerOut = () => {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  };

  createListeners() {
    document.addEventListener("pointerover", this.handleDataTooltipPointerOver);
    document.addEventListener("pointermove", this.handleDataTooltipPointerMove);
    document.addEventListener("pointerout", this.handleDataTooltipPointerOut);
  }

  destroyListeners() {
    document.removeEventListener(
      "pointerover",
      this.handleDataTooltipPointerOver
    );
    document.removeEventListener(
      "pointermove",
      this.handleDataTooltipPointerOut
    );
    document.removeEventListener(
      "pointerout",
      this.handleDataTooltipPointerOut
    );
  }

  destroy() {
    this.destroyListeners();
  }
}

export default Tooltip;
