import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

interface IModalData {
  content: HTMLElement;
}

export class Modal extends Component<IModalData> {
  protected _closeButton: HTMLButtonElement;
  protected _content: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);
    this._closeButton = ensureElement<HTMLButtonElement>(
      ".modal__close",
      this.container
    );
    this._content = ensureElement<HTMLElement>(
      ".modal__content",
      this.container
    );

    this._closeButton.addEventListener("click", () => this.close());
    this.container.addEventListener("click", (event) => {
      if (event.target === this.container) {
        this.close();
      }
    });

    events.on("modal:force-close", () => {
      if (this.isOpen) {
        this.container.classList.remove("modal_active");
        this._content.innerHTML = "";
      }
    });
  }

  get isOpen(): boolean {
    return this.container.classList.contains("modal_active");
  }

  set content(value: HTMLElement) {
    this._content.replaceChildren(value);
  }

  open(): void {
    this.toggleClass(this.container, "modal_active", true);
    this.events.emit("modal:open");
  }

  close(): void {
    this.toggleClass(this.container, "modal_active", false);
    this._content.innerHTML = "";
  }

  render(data: IModalData): HTMLElement {
    super.render(data);
    return this.container;
  }
}
