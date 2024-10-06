export default class NotificationMessage {
  static lastShownComponent;

  constructor(message = "Default Message", options = {}) {
    const { duration = 2000, type = "success" } = options;

    this.message = message;
    this.duration = duration;
    this.type = type;
    this.element = this.createElement();
    this.timerId = null;
  }

  createElement() {
    const element = document.createElement("div");
    element.innerHTML = this.createTemplate();
    return element.firstElementChild;
  }

  createTemplate() {
    return `<div class="notification ${this.type}" style="--value:${(
      this.duration / 1000
    ).toFixed(1)}s; position: fixed; bottom: 10px; left: 10px;">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
      ${this.message}
      </div>
    </div>
  </div>`;
  }

  show(targetElement = document.body) {
    if (NotificationMessage.lastShownComponent) {
      NotificationMessage.lastShownComponent.destroy();
    }
    NotificationMessage.lastShownComponent = this;
    targetElement.append(this.element);
    this.remove();
  }

  remove() {
    this.timerId = setTimeout(() => {
      this.element?.remove();
    }, this.duration);
  }

  destroy() {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.element?.remove();
  }
}
