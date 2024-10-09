export default class DoubleSlider {
  minPriceId = "minValue";
  maxPriceId = "maxValue";

  leftTogglePercent;
  rightTogglePercent;

  percentInOnePixel;

  constructor(
    options = {
      min: 100,
      max: 200,
      formatValue: (value) => "$" + value,
      selected: {
        from: 120,
        to: 150,
      },
    }
  ) {
    this.minValue = options.min;
    this.maxValue = options.max;
    this.formatValue = options.formatValue;
    this.from = options.selected.from;
    this.to = options.selected.to;
    this.element = this.createElement();

    this.subElements = {
      progress: this.element?.querySelector(".range-slider__progress"),
      leftToggle: this.element?.querySelector(".range-slider__thumb-left"),
      righToggle: this.element?.querySelector(".range-slider__thumb-right"),
      sliderArea: this.element?.querySelector(".range-slider__inner"),
      minPrice: this.element?.querySelector(`[data-id="${this.minPriceId}"]`),
      maxPrice: this.element?.querySelector(`[data-id="${this.maxPriceId}"]`),
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
    <span data-id="${this.minPriceId}">${this.formatValue(this.from)}</span>
    <div class="range-slider__inner">
      <span class="range-slider__progress"></span>
      <span class="range-slider__thumb-left"></span>
      <span class="range-slider__thumb-right"></span>
    </div>
    <span data-id="${this.maxPriceId}">${this.formatValue(this.to)}</span>
  </div>`;
  }

  init() {
    const maxRange = this.maxValue - this.minValue;

    this.leftTogglePercent = ((this.from - this.minValue) * 100) / maxRange;
    this.rightTogglePercent = ((this.maxValue - this.to) * 100) / maxRange;

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

  calculatePercentForOnePixel() {
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
      this.renderMinPrice(
        Math.round(((this.to - this.minValue) * newPercentValue) / 100)
      );
      return { isLeft: true, value: newPercentValue };
    } else if (classList.contains("range-slider__thumb-right")) {
      newPercentValue = this.checkBoundaries(
        this.rightTogglePercent + distanceInPercent,
        this.leftTogglePercent
      );

      this.renderRightToggle(newPercentValue);
      this.renderMaxPrice(
        Math.round(((this.maxValue - this.from) * newPercentValue) / 100)
      );
      return { isLeft: false, value: newPercentValue };
    }
  }

  handleSliderPointerDown = (event) => {
    const pointerDownEvent = event;
    const startX = event.clientX;
    this.calculatePercentForOnePixel();

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
    this.destroyListeners();
  }
}
