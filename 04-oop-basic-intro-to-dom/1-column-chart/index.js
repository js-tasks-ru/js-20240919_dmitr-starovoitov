export default class ColumnChart {
  chartHeight = 50;
  element;

  constructor(props = {}) {
    const {
      data = [],
      label = "",
      value = 0,
      link = "",
      formatHeading = (value) => value,
    } = props;

    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;

    this.element = this.createElement();
    this.updateChartLoadingState();

    this.subElements = {
      body: this.element.querySelector("[data-element='body']"),
      header: this.element?.querySelector("[data-element='header']"),
    };
  }

  createLinkTemplate() {
    if (this.link) {
      return `<a href="${this.link}" class="column-chart__link">View all</a>`;
    }
    return "";
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map((item) => {
      return {
        percent: ((item / maxValue) * 100).toFixed(0) + "%",
        value: String(Math.floor(item * scale)),
      };
    });
  }

  createChartTemplate() {
    return this.getColumnProps(this.data)
      .map(
        ({ value, percent }) =>
          `<div style="--value: ${value}" data-tooltip="${percent}"></div>`
      )
      .join("");
  }

  createTemplate() {
    return `<div class="column-chart" style="--chart-height: 50">
      <div class="column-chart__title">
        ${this.label}
        ${this.createLinkTemplate()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
          ${this.formatHeading(this.value)}
        </div>
        <div data-element="body" class="column-chart__chart">
          ${this.createChartTemplate()}
        </div>
      </div>
    </div>`;
  }

  createElement() {
    const element = document.createElement("div");

    element.innerHTML = this.createTemplate();

    const firstElementChild = element.firstElementChild;

    return firstElementChild;
  }

  updateChartLoadingState() {
    if (this.data.length != 0) {
      this.element.classList.remove("column-chart_loading");
    } else {
      this.element.classList.add("column-chart_loading");
    }
  }

  update(newData) {
    this.data = newData;

    this.updateChartLoadingState();

    this.subElements.body.innerHTML = this.createChartTemplate();
    this.subElements.header.textContent = this.data.reduce((acc, current) => {
      return (acc += current);
    }, 0);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
