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

    this.leftTogglePercent = ((this.from - this.min) * 100) / maxRange;
    this.rightTogglePercent = ((this.max - this.to) * 100) / maxRange;

    this.renderLeftToggle(this.leftTogglePercent);
    this.renderRightToggle(this.rightTogglePercent);
  }

  renderLeftToggle() {
    this.subElements.progress.style.left = this.leftTogglePercent + "%";
    this.subElements.leftToggle.style.left = this.leftTogglePercent + "%";
  }

  renderRightToggle() {
    this.subElements.progress.style.right = this.rightTogglePercent + "%";
    this.subElements.righToggle.style.right = this.rightTogglePercent + "%";
  }

  renderMinPrice() {
    this.subElements.minPrice.textContent = this.formatValue(this.from);
  }

  renderMaxPrice() {
    this.subElements.maxPrice.textContent = this.formatValue(this.to);
  }

  calculateMinPrice() {
    this.from = Math.round(
      this.min + ((this.max - this.min) * this.leftTogglePercent) / 100
    );
  }

  calculateMaxPrice() {
    this.to = Math.round(
      this.max - ((this.max - this.min) * this.rightTogglePercent) / 100
    );
  }

  calculateLeftTogglePercent(startX, left, right) {
    let percent = ((startX - left) * 100) / (right - left);
    percent =
      100 - percent < this.rightTogglePercent
        ? 100 - this.rightTogglePercent
        : percent;
    this.leftTogglePercent = percent;
    return percent;
  }

  calculateRightTogglePercent(startX, left, right) {
    let percent = 100 - ((startX - left) * 100) / (right - left);
    percent =
      100 - percent < this.leftTogglePercent
        ? 100 - this.leftTogglePercent
        : percent;
    this.rightTogglePercent = percent;
    return percent;
  }

  normalize = (min, max, value) => Math.max(min, Math.min(max, value));

  getSliderBoundaries() {
    let { left, right } = this.subElements.sliderArea.getBoundingClientRect();

    console.log(
      `SLIDER RECT: LEFT -> ${
        this.subElements.sliderArea.getBoundingClientRect().left
      } / RIGHT ->${this.subElements.sliderArea.getBoundingClientRect().right}`
    );

    left -= this.subElements.leftToggle.getBoundingClientRect().width;

    console.log(
      `TOGGLE LEFT WIDTH -> ${
        this.subElements.leftToggle.getBoundingClientRect().width
      }`
    );

    return { left, right };
  }

  handleSliderPointerDown = (event) => {
    const isLeft = event.target === this.subElements.leftToggle ? true : false;

    const handlePointerMove = (event) => {
      const { left, right } = this.getSliderBoundaries();
      const x = this.normalize(left, right, event.clientX);
      if (event.clientX === 0) {
        console.log(
          `THIS IS X:${x} THIS IS left: ${left}, THIS IS right: ${right}`
        );
      }

      if (isLeft) {
        this.calculateLeftTogglePercent(x, left, right);
        this.renderLeftToggle();
        this.calculateMinPrice();
        this.renderMinPrice();
      } else {
        this.calculateRightTogglePercent(x, left, right);
        this.renderRightToggle();
        this.calculateMaxPrice();
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
