import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";
import { Form } from "./Form";

interface IContactsForm {
  email: string;
  phone: string;
  valid: boolean;
  errors: string[];
}

export class ContactsForm extends Form<IContactsForm> {
  protected _emailInput: HTMLInputElement;
  protected _phoneInput: HTMLInputElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this._emailInput = ensureElement<HTMLInputElement>(
      'input[name="email"]',
      container
    );
    this._phoneInput = ensureElement<HTMLInputElement>(
      'input[name="phone"]',
      container
    );

    // Обработчики событий
    this._emailInput.addEventListener("input", () => {
      events.emit("contacts.email:change", { email: this._emailInput.value });
    });

    this._phoneInput.addEventListener("input", () => {
      events.emit("contacts.phone:change", { phone: this._phoneInput.value });
    });

    this._form.addEventListener("submit", (event: Event) => {
      event.preventDefault();
      events.emit("contacts:submit");
    });
  }

  set email(value: string) {
    this._emailInput.value = value;
  }

  set phone(value: string) {
    this._phoneInput.value = value;
  }
}
