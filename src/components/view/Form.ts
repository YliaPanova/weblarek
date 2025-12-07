import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";

export abstract class Form<T> extends Component<T> {
  protected _form: HTMLFormElement;
  protected _errors: HTMLElement;
  protected _submitButton: HTMLButtonElement;

  constructor(container: HTMLElement) {
    super(container);
    this._form = container as HTMLFormElement;
    this._errors = ensureElement<HTMLElement>(".form__errors", container);
    this._submitButton = ensureElement<HTMLButtonElement>(
      'button[type="submit"]',
      container
    );
  }

  set valid(value: boolean) {
    this.setDisabled(this._submitButton, !value);
  }

  set errors(value: string[]) {
    this.setText(this._errors, value.join(", "));
  }
}
