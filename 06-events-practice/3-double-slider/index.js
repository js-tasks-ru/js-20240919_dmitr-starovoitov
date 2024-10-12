export default class DoubleSlider {
  minPriceAttr = "from";
  maxPriceAttr = "to";

  leftTogglePercent;
  rightTogglePercent;

  constructor(
    options = {
      min: 100,
      max: 200,
      formatValue: (value) => "$" + value,
      selected: {},
    }
  ) {
    this.min = options.min;
    this.max = options.max;
    this.formatValue = options.formatValue;
    this.from = options.selected?.from || options.min;
    this.to = options.selected?.to || options.max;
    this.element = this.createElement();

    this.subElements = {
      progress: this.element.querySelector(".range-slider__progress"),
      leftToggle: this.element.querySelector(".range-slider__thumb-left"),
      righToggle: this.element.querySelector(".range-slider__thumb-right"),
      sliderArea: this.element.querySelector(".range-slider__inner"),
      minPrice: this.element.querySelector(
        `[data-element="${this.minPriceAttr}"]`
      ),
      maxPrice: this.element.querySelector(
        `[data-element="${this.maxPriceAttr}"]`
      ),
    };

    this.init();
    this.createListeners();
  }

  createElement() {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = this.createElementTemplate();
    return tempElement.firstElementChild;
  }

  createElementTemplate() {
    return `<div class="range-slider">
    <span data-element="${this.minPriceAttr}">${this.formatValue(
      this.from
    )}</span>
    <div class="range-slider__inner">
      <span class="range-slider__progress"></span>
      <span class="range-slider__thumb-left"></span>
      <span class="range-slider__thumb-right"></span>
    </div>
    <span data-element="${this.maxPriceAttr}">${this.formatValue(
      this.to
    )}</span>
  </div>`;
  }

  init() {
    const maxRange = this.max - this.min;
    const left = this.from - this.min;
    const right = this.to - this.min;
    this.leftTogglePercent = (left * 100) / maxRange;
    this.rightTogglePercent = (right * 100) / maxRange;

    this.subElements.progress.style.left = this.leftTogglePercent + "%";
    this.subElements.leftToggle.style.left = this.leftTogglePercent + "%";
    this.subElements.progress.style.right = 100 - this.rightTogglePercent + "%";
    this.subElements.righToggle.style.right =
      100 - this.rightTogglePercent + "%";
  }

  renderLeftToggle() {
    this.subElements.progress.style.left = this.leftTogglePercent + "%";
    this.subElements.leftToggle.style.left = this.leftTogglePercent + "%";
  }

  renderRightToggle() {
    this.subElements.progress.style.right = 100 - this.rightTogglePercent + "%";
    this.subElements.righToggle.style.right =
      100 - this.rightTogglePercent + "%";
  }

  renderMinPrice() {
    this.subElements.minPrice.textContent = this.formatValue(
      Math.round(this.from)
    );
  }

  renderMaxPrice() {
    this.subElements.maxPrice.textContent = this.formatValue(
      Math.round(this.to)
    );
  }

  normalize = (min, max, value) => Math.max(min, Math.min(max, value));

  handleSliderPointerDown = (event) => {
    const isLeft = event.target === this.subElements.leftToggle ? true : false;

    const handlePointerMove = (event) => {
      const { left, right } =
        this.subElements.sliderArea.getBoundingClientRect();
      const x = this.normalize(left, right, event.clientX) - left;
      const percent = (x / (right - left)) * 100;

      if (isLeft) {
        this.leftTogglePercent = this.normalize(
          0,
          this.rightTogglePercent,
          percent
        );
        this.from =
          this.min + (this.leftTogglePercent * (this.max - this.min)) / 100;

        this.renderLeftToggle();
        this.renderMinPrice();
      } else {
        this.rightTogglePercent = this.normalize(
          this.leftTogglePercent,
          100,
          percent
        );
        this.to =
          this.min + (this.rightTogglePercent * (this.max - this.min)) / 100;

        this.renderRightToggle();
        this.renderMaxPrice();
      }
    };

    const handlePointerUp = () => {
      this.element.dispatchEvent(
        new CustomEvent("range-select", {
          bubbles: true,
          detail: { from: this.from, to: this.to },
        })
      );

      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  createListeners() {
    this.subElements.leftToggle.addEventListener(
      "pointerdown",
      this.handleSliderPointerDown
    );
    this.subElements.righToggle.addEventListener(
      "pointerdown",
      this.handleSliderPointerDown
    );
  }

  destroyListeners() {
    this.subElements.leftToggle.removeEventListener(
      "pointerdown",
      this.handleSliderPointerDown
    );
    this.subElements.righToggle.removeEventListener(
      "pointerdown",
      this.handleSliderPointerDown
    );
  }

  destroy() {
    this.element.remove();
    this.destroyListeners();
  }
}
