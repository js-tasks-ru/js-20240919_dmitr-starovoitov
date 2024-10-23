import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  element = null;
  subElements = {};
  components = {};

  async render() {
    await this.initComponents();
    this.createElement();
    this.createListeners();
    return this.element;
  }

  async initComponents() {
    this.components.rangePicker = new RangePicker();
    this.components.sortableTable = new SortableTable(header, {
      url: "api/dashboard/bestsellers",
    });
    this.components.ordersChart = new ColumnChart({
      label: "Orders",
      link: "/sales",
      formatHeading: (data) => data,
      url: "api/dashboard/orders",
    });
    this.components.salesChart = new ColumnChart({
      label: "Sales",
      link: "",
      formatHeading: (data) => data,
      url: "api/dashboard/sales",
    });
    this.components.customersChart = new ColumnChart({
      label: "Customers",
      link: "",
      formatHeading: (data) => data,
      url: "api/dashboard/customers",
    });

    await this.components.rangePicker.render();
    await this.components.ordersChart.render();
    await this.components.salesChart.render();
    await this.components.customersChart.render();
  }

  createElement() {
    const element = document.createElement("div");
    element.innerHTML = this.createTemplate();

    this.subElements = {
      rangePicker: element.querySelector('[data-element="rangePicker"]'),
      sortableTable: element.querySelector('[data-element="sortableTable"]'),
      ordersChart: element.querySelector('[data-element="ordersChart"]'),
      salesChart: element.querySelector('[data-element="salesChart"]'),
      customersChart: element.querySelector('[data-element="customersChart"]'),
    };

    this.subElements.sortableTable.appendChild(
      this.components.sortableTable.element
    );

    this.subElements.rangePicker.appendChild(
      this.components.rangePicker.element
    );

    this.subElements.ordersChart.appendChild(
      this.components.ordersChart.element
    );

    this.subElements.salesChart.appendChild(this.components.salesChart.element);

    this.subElements.customersChart.appendChild(
      this.components.customersChart.element
    );

    this.element = element.firstElementChild;
  }

  createTemplate() {
    return `<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker">
        </div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>
      <h3 class="block-title">Best sellers</h3>
      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>`;
  }

  handleDateSelect = async (event) => {
    await this.components.ordersChart.update(
      event.detail.from,
      event.detail.to
    );
    await this.components.salesChart.update(event.detail.from, event.detail.to);
    await this.components.customersChart.update(
      event.detail.from,
      event.detail.to
    );
  };

  createListeners() {
    this.element.addEventListener("date-select", this.handleDateSelect);
  }

  removeListeners() {
    this.element.removeEventListener("date-select", this.handleDateSelect);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.components.rangePicker.destroy();
    this.components.ordersChart.destroy();
    this.components.salesChart.destroy();
    this.components.customersChart.destroy();
    this.components.sortableTable.destroy();
    this.remove();
    this.removeListeners();
  }
}
