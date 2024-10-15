import fetchJson from "./utils/fetch-json.js";
import ColumnChartV1 from "../../04-oop-basic-intro-to-dom/1-column-chart/index.js";

const BACKEND_URL = "https://course-js.javascript.ru";
const ORDERS_PATH = "/api/dashboard/orders";

export default class ColumnChartV2 extends ColumnChartV1 {
  async update(startDate, endDate) {
    this.enableLoader();

    const url = new URL(ORDERS_PATH, BACKEND_URL);
    url.pathname;
    url.searchParams.set("from", startDate);
    url.searchParams.set("to", endDate);

    const responseData = await fetchJson(url);

    super.update(Object.values(responseData));

    this.disableLoader();

    return responseData;
  }
}
