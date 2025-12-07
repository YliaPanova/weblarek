import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";
import { Form } from "./Form";

interface IOrderForm {
  payment: string;
  address: string;
  valid: boolean;
  errors: string[];
}

export class OrderForm extends Form<IOrderForm> {
  protected _paymentButtons: NodeListOf<HTMLButtonElement>;
  protected _addressInput: HTMLInputElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this._paymentButtons = container.querySelectorAll(
      ".order__buttons .button"
    );
    this._addressInput = ensureElement<HTMLInputElement>(
      'input[name="address"]',
      container
    );

    // Обработчики событий
    this._paymentButtons.forEach((button) => {
      button.addEventListener("click", () => {
        events.emit("order.payment:change", { payment: button.name });
      });
    });

    this._addressInput.addEventListener("input", () => {
      events.emit("order.address:change", {
        address: this._addressInput.value,
      });
    });

    this._form.addEventListener("submit", (event: Event) => {
      event.preventDefault();
      events.emit("order:submit");
    });
  }

  set payment(value: string) {
    this._paymentButtons.forEach((button) => {
      this.toggleClass(button, "button_alt-active", button.name === value);
    });
  }

  set address(value: string) {
    this._addressInput.value = value;
  }
}
