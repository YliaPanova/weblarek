import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

interface IOrderForm {
  payment: string;
  address: string;
  valid: boolean;
  errors: string[];
}

export class OrderForm extends Component<IOrderForm> {
  protected _form: HTMLFormElement;
  protected _paymentButtons: NodeListOf<HTMLButtonElement>;
  protected _addressInput: HTMLInputElement;
  protected _errors: HTMLElement;
  protected _submitButton: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this._form = ensureElement<HTMLFormElement>(
      'form[name="order"]',
      container
    );
    this._paymentButtons = container.querySelectorAll(
      ".order__buttons .button"
    );
    this._addressInput = ensureElement<HTMLInputElement>(
      'input[name="address"]',
      container
    );
    this._errors = ensureElement<HTMLElement>(".form__errors", container);
    this._submitButton = ensureElement<HTMLButtonElement>(
      ".order__button",
      container
    );

    // Обработчики событий
    this._paymentButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.setPayment(button.name);
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

  set valid(value: boolean) {
    this.setDisabled(this._submitButton, !value);
  }

  set errors(value: string[]) {
    this.setText(this._errors, value.join(", "));
  }

  private setPayment(method: string) {
    this.payment = method;
  }
}
