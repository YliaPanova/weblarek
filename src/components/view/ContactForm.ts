import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

interface IContactsForm {
  email: string;
  phone: string;
  valid: boolean;
  errors: string[];
}

export class ContactsForm extends Component<IContactsForm> {
  protected _form: HTMLFormElement;
  protected _emailInput: HTMLInputElement;
  protected _phoneInput: HTMLInputElement;
  protected _errors: HTMLElement;
  protected _submitButton: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this._form = ensureElement<HTMLFormElement>(
      'form[name="contacts"]',
      container
    );
    this._emailInput = ensureElement<HTMLInputElement>(
      'input[name="email"]',
      container
    );
    this._phoneInput = ensureElement<HTMLInputElement>(
      'input[name="phone"]',
      container
    );
    this._errors = ensureElement<HTMLElement>(".form__errors", container);
    this._submitButton = ensureElement<HTMLButtonElement>(
      'button[type="submit"]',
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

  set valid(value: boolean) {
    this.setDisabled(this._submitButton, !value);
  }

  set errors(value: string[]) {
    this.setText(this._errors, value.join(", "));
  }
}
