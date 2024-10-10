export default class DoubleSlider {
  minPriceAttr = "from";
  maxPriceAttr = "to";

  leftTogglePercent;
  rightTogglePercent;

  percentInOnePixel;

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
      maxPrice: this.element?.querySelector(
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

  renderLeftToggle(value) {
    this.subElements.progress.style.left = value + "%";
    this.subElements.leftToggle.style.left = value + "%";
  }

  renderRightToggle(value) {
    this.subElements.progress.style.right = value + "%";
    this.subElements.righToggle.style.right = value + "%";
  }

  renderMinPrice(price) {
    this.subElements.minPrice.textContent = this.formatValue(price);
  }

  renderMaxPrice(price) {
    this.subElements.maxPrice.textContent = this.formatValue(price);
  }

  calculatePercentInOnePixel() {
    this.percentInOnePixel = +(
      this.subElements.sliderArea.getBoundingClientRect().width / 100
    ).toFixed(2);
  }

  calculateDistanceInPercents(pointerDownEvent, currentX, startX) {
    const classList = pointerDownEvent.target.classList;

    if (classList.contains("range-slider__thumb-left")) {
      return +((currentX - startX) / this.percentInOnePixel).toFixed(2);
    } else if (classList.contains("range-slider__thumb-right")) {
      return +((startX - currentX) / this.percentInOnePixel).toFixed(2);
    }
  }

  recalculatePriceForPercentValue(percent, isLeft) {
    if (isLeft) {
      this.from = Math.round(
        this.min + ((this.max - this.min) * percent) / 100
      );
    } else {
      this.to = Math.round(this.max - ((this.max - this.min) * percent) / 100);
    }
  }

  checkBoundaries(percentValue, otherTogglePercentValue) {
    if (percentValue < 0) {
      percentValue = 0;
    }
    if (percentValue > 100 - otherTogglePercentValue) {
      percentValue = 100 - otherTogglePercentValue;
    }
    return percentValue;
  }

  moveToogle(pointerDownEvent, distanceInPercent) {
    const classList = pointerDownEvent.target.classList;

    let newPercentValue;

    if (classList.contains("range-slider__thumb-left")) {
      newPercentValue = this.checkBoundaries(
        this.leftTogglePercent + distanceInPercent,
        this.rightTogglePercent
      );

      this.renderLeftToggle(newPercentValue);
      this.recalculatePriceForPercentValue(newPercentValue, true);
      this.renderMinPrice(this.from);

      return { isLeft: true, value: newPercentValue };
    } else if (classList.contains("range-slider__thumb-right")) {
      newPercentValue = this.checkBoundaries(
        this.rightTogglePercent + distanceInPercent,
        this.leftTogglePercent
      );

      this.renderRightToggle(newPercentValue);
      this.recalculatePriceForPercentValue(newPercentValue, false);
      this.renderMaxPrice(this.to);

      return { isLeft: false, value: newPercentValue };
    }
  }

  handleSliderPointerDown = (event) => {
    const pointerDownEvent = event;
    const startX = event.clientX;
    this.calculatePercentInOnePixel();

    let newToggleValueData;

    const handlePointerMove = (event) => {
      newToggleValueData = this.moveToogle(
        pointerDownEvent,
        this.calculateDistanceInPercents(
          pointerDownEvent,
          event.clientX,
          startX
        )
      );
    };

    const handlePointerUp = () => {
      newToggleValueData.isLeft
        ? (this.leftTogglePercent = newToggleValueData.value)
        : (this.rightTogglePercent = newToggleValueData.value);

      this.element?.dispatchEvent(
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
    this.element?.remove();
    this.destroyListeners();
  }
}
