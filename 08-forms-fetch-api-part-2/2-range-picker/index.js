export default class RangePicker {
  rangePickerOpenClass = "rangepicker_open";

  constructor({ from, to }) {
    this.from = from;
    this.to = to;

    this.createElement();

    this.subElements = {
      from: this.element.querySelector('[data-element="from"]'),
      to: this.element.querySelector('[data-element="to"]'),
      input: this.element.querySelector('[data-element="input"]'),
      calendarFirst: this.element.querySelectorAll(".rangepicker__calendar")[0],
      calendarSecond: this.element.querySelectorAll(
        ".rangepicker__calendar"
      )[1],
      selector: this.element?.querySelector(".rangepicker__selector"),
    };

    this.firstMonthDate = new Date(from);

    this.renderCalendars();

    this.subElements.leftArrow = this.element.querySelector(
      ".rangepicker__selector-control-left"
    );
    this.subElements.rightArrow = this.element.querySelector(
      ".rangepicker__selector-control-right"
    );

    this.updateMonthArrays();

    this.setDaysOfWeek();

    this.setFromDate(this.from);
    this.setToDate(this.to);
    this.setBetween();

    this.isSelected = true;

    this.createListeners();
  }

  createElement() {
    const element = document.createElement("div");
    element.innerHTML = this.createTemplate();
    this.element = element.firstElementChild;
  }

  createTemplate() {
    return `<div class="rangepicker">
    <div class="rangepicker__input" data-element="input">
      <span data-element="from">${this.formatDate(this.from)}</span> -
      <span data-element="to">${this.formatDate(this.to)}</span>
    </div>
    <div class="rangepicker__selector" data-element="selector">
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      <div class="rangepicker__calendar">
      </div>
      <div class="rangepicker__calendar">
      </div>
    </div>
    </div>`;
  }

  getFirstMonthCells() {
    this.firstMonthCells = [];
  }

  formatDate(date) {
    return date
      .toLocaleString("ru", { dateStyle: "short" })
      .replaceAll(".", "/");
  }

  updateDateInputs() {
    this.subElements.from.textContent = this.formatDate(this.from);
    this.subElements.to.textContent = this.formatDate(this.to);
  }

  openRangePicker() {
    this.element.classList.add(this.rangePickerOpenClass);
  }

  closeRangePicker() {
    this.element.classList.remove(this.rangePickerOpenClass);
  }

  isRangePickerOpened() {
    return this.element.classList.contains(this.rangePickerOpenClass);
  }

  handleInputClick = (event) => {
    const input = event.target.closest('[data-element="input"]');
    if (!input || !this.subElements.input === input) return;

    if (!this.isRangePickerOpened()) {
      this.openRangePicker();
    } else {
      this.closeRangePicker();
    }
  };

  handleDocumentClick = (event) => {
    const rangepicker = event.target.closest(".rangepicker");
    if (!rangepicker || !this.element === rangepicker) {
      this.closeRangePicker();
    }
  };

  handleLeftArrowClick = (event) => {
    const arrow = event.target.closest(".rangepicker__selector-control-left");
    if (!arrow || !this.subElements.leftArrow === arrow) return;
    event.stopPropagation();
    this.firstMonthDate = new Date(
      this.firstMonthDate.getFullYear(),
      this.firstMonthDate.getMonth() - 1,
      1
    );

    this.renderCalendars();
    this.setDaysOfWeek();

    if (this.isSelected) {
      this.setFromDate(this.from);
      this.setToDate(this.to);
      this.setBetween();
    }
  };

  handleRightArrowClick = (event) => {
    const arrow = event.target.closest(".rangepicker__selector-control-right");
    if (!arrow || !this.subElements.rightArrow === arrow) return;
    event.stopPropagation();
    this.firstMonthDate = new Date(
      this.firstMonthDate.getFullYear(),
      this.firstMonthDate.getMonth() + 1,
      1
    );

    this.renderCalendars();
    this.setDaysOfWeek();

    if (this.isSelected) {
      this.setFromDate(this.from);
      this.setToDate(this.to);
      this.setBetween();
    } else if (this.cellIndexFrom !== null) {
      this.setFromDate(this.from);
    }
  };

  handleCellClick = (event) => {
    const cell = event.target;
    if (!cell.classList.contains("rangepicker__cell")) return;

    if (this.isSelected) {
      this.clearSelectedRange();
      let newDate = new Date(cell.getAttribute("data-value"));
      newDate.setDate(newDate.getDate() - 1);

      this.from = newDate;

      this.setFromDate(this.from);
      this.isSelected = false;
    } else if (this.cellIndexTo === null) {
      let newDate = new Date(cell.getAttribute("data-value"));
      newDate.setDate(newDate.getDate() - 1);

      if (newDate < this.from) {
        this.clearSelectedRange();
        this.to = this.from;
        this.from = newDate;
        this.setFromDate(this.from);
      } else {
        this.to = newDate;
      }

      this.setToDate(this.to);
      this.setBetween();
      this.updateDateInputs();
      this.isSelected = true;

      this.dispatchSelectEvent();
    }
  };

  dispatchSelectEvent() {
    this.element.dispatchEvent(
      new CustomEvent("date-select", {
        bubbles: true,
      })
    );
  }

  createListeners() {
    document.addEventListener("click", this.handleDocumentClick, true);
    this.subElements.input.addEventListener("click", this.handleInputClick);
    this.subElements.leftArrow.addEventListener(
      "click",
      this.handleLeftArrowClick
    );
    this.subElements.rightArrow.addEventListener(
      "click",
      this.handleRightArrowClick
    );
    this.subElements.selector.addEventListener("click", this.handleCellClick);
  }

  removeListeners() {
    document.removeEventListener("click", this.handleDocumentClick, true);
    this.subElements.input.removeEventListener("click", this.handleInputClick);
    this.subElements.leftArrow.removeEventListener(
      "click",
      this.handleLeftArrowClick
    );
    this.subElements.rightArrow.removeEventListener(
      "click",
      this.handleRightArrowClick
    );
    this.subElements.selector.removeEventListener(
      "click",
      this.handleCellClick
    );
  }

  getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  getMonthName(date) {
    return date.toLocaleString("ru", { month: "long" });
  }

  setDaysOfWeek() {
    this.firstMonthCellArray[0].setAttribute(
      "style",
      `--start-from: ${new Date(
        this.firstMonthDate.getFullYear(),
        this.firstMonthDate.getMonth(),
        1
      ).getDay()}`
    );
    this.secondMonthCellArray[0].setAttribute(
      "style",
      `--start-from: ${new Date(
        this.firstMonthDate.getFullYear(),
        this.firstMonthDate.getMonth() + 1,
        1
      ).getDay()}`
    );
  }

  setFromDate(date) {
    const allCellsArr = this.getAllCellsArr();
    const cellIndex = this.getCellIndexByDate(date, allCellsArr);
    if (cellIndex !== -1) {
      allCellsArr[cellIndex].classList.add("rangepicker__selected-from");
      this.cellIndexFrom = cellIndex;
    } else {
      this.cellIndexFrom = null;
    }
  }

  setToDate(date) {
    const allCellsArr = this.getAllCellsArr();
    const cellIndex = this.getCellIndexByDate(date, allCellsArr);
    if (cellIndex !== -1) {
      allCellsArr[cellIndex].classList.add("rangepicker__selected-to");
      this.cellIndexTo = cellIndex;
    } else {
      this.cellIndexTo = null;
    }
  }

  setBetween() {
    const allCellsArr = this.getAllCellsArr();
    if (this.cellIndexFrom !== null && this.cellIndexTo != null) {
      allCellsArr
        .slice(this.cellIndexFrom + 1, this.cellIndexTo)
        .forEach((cell) => cell.classList.add("rangepicker__selected-between"));
    } else if (!this.cellIndexFrom) {
      allCellsArr
        .slice(0, this.cellIndexTo)
        .forEach((cell) => cell.classList.add("rangepicker__selected-between"));
    } else if (!this.cellIndexTo) {
      allCellsArr
        .slice(this.cellIndexFrom + 1, allCellsArr.length)
        .forEach((cell) => cell.classList.add("rangepicker__selected-between"));
    }
    return;
  }

  clearSelectedRange() {
    this.cellIndexFrom = null;
    this.cellIndexTo = null;

    this.subElements.selector
      .querySelector(".rangepicker__selected-from")
      ?.classList.remove("rangepicker__selected-from");

    this.subElements.selector
      .querySelector(".rangepicker__selected-to")
      ?.classList.remove("rangepicker__selected-to");

    this.subElements.selector
      .querySelectorAll(".rangepicker__selected-between")
      .forEach((cell) => {
        cell.classList.remove("rangepicker__selected-between");
      });
  }

  getAllCellsArr() {
    return [...this.firstMonthCellArray, ...this.secondMonthCellArray];
  }

  getCellIndexByDate(date, arr) {
    return arr.findIndex(
      (cell) =>
        cell.getAttribute("data-value") ===
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 1
        ).toISOString()
    );
  }

  updateMonthArrays() {
    this.firstMonthCellArray =
      this.subElements.calendarFirst.getElementsByClassName(
        "rangepicker__cell"
      );
    this.secondMonthCellArray =
      this.subElements.calendarSecond.getElementsByClassName(
        "rangepicker__cell"
      );
  }

  createDateGridCell(month, year) {
    const cells = [];
    const dayInMonth = this.getDaysInMonth(month, year);

    for (let i = 1; i <= dayInMonth; i++) {
      cells.push(
        `<button type="button" class="rangepicker__cell" data-value="${new Date(
          year,
          month,
          i + 1
        ).toISOString()}">${i}</button>`
      );
    }

    return cells.join("");
  }

  renderCalendars() {
    this.subElements.calendarFirst.innerHTML = this.createCalendarTemplate(
      this.firstMonthDate
    );
    this.subElements.calendarSecond.innerHTML = this.createCalendarTemplate(
      new Date(
        this.firstMonthDate.getFullYear(),
        this.firstMonthDate.getMonth() + 1,
        1
      )
    );
  }

  createCalendarTemplate(date) {
    return `<div class="rangepicker__month-indicator">
          <time datetime="${this.getMonthName(date)}">${this.getMonthName(
      date
    )}</time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
          ${this.createDateGridCell(date.getMonth(), date.getFullYear())}
        </div>
      </div>`;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeListeners();
    this.remove();
  }
}
