import { ProductCard } from "./ProductCard";
import { IEvents } from "../base/Events";
import { IProduct } from "../../types";

export class PreviewItem extends ProductCard<IProduct> {
  protected _button: HTMLButtonElement | null = null;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);

    this._button = container.querySelector(".card__button");
    if (this._button) {
      this._button.addEventListener("click", (event: Event) => {
        event.preventDefault();
        events.emit("product:toggle-basket");
      });
    }
  }

  set buttonText(value: string) {
    if (this._button) {
      this.setText(this._button, value);
    }
  }

  set buttonDisabled(state: boolean) {
    if (this._button) {
      this.setDisabled(this._button, state);
    }
  }
}
