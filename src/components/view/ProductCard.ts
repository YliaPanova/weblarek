import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { CDN_URL, categoryMap } from "../../utils/constants";

interface ICardActions {
  onClick?: (event: MouseEvent, data?: any) => void;
}

export class ProductCard<T> extends Component<T> {
  protected _category: HTMLElement | null = null;
  protected _title: HTMLElement;
  protected _image: HTMLImageElement | null = null;
  protected _price: HTMLElement;
  protected _button: HTMLButtonElement | null = null;
  protected _data: T | null = null;

  constructor(
    protected events: IEvents,
    container: HTMLElement,
    actions?: ICardActions
  ) {
    super(container);

    this._category = container.querySelector(".card__category");
    this._title = ensureElement<HTMLElement>(".card__title", container);
    this._image = container.querySelector(".card__image");
    this._price = ensureElement<HTMLElement>(".card__price", container);
    this._button = container.querySelector(".card__button");

    if (actions?.onClick) {
      const clickHandler = (event: MouseEvent) => {
        event.preventDefault();
        actions.onClick!(event, this._data);
      };

      if (this._button) {
        this._button.addEventListener("click", clickHandler);
      } else {
        container.addEventListener("click", clickHandler);
      }
    }
  }

  protected setImage(
    element: HTMLImageElement | null,
    src: string,
    alt?: string
  ): void {
    if (element) {
      element.src = src;
      if (alt) {
        element.alt = alt;
      }
    }
  }

  set category(value: string) {
    if (this._category) {
      this.setText(this._category, value);
      const categoryClass =
        categoryMap[value as keyof typeof categoryMap] ||
        "card__category_other";
      this._category.className = "card__category " + categoryClass;
    }
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  set image(value: string) {
    if (this._image) {
      this.setImage(this._image, `${CDN_URL}/${value}`);
    }
  }

  set price(value: number | null) {
    const priceText = value !== null ? `${value} синапсов` : "Бесценно";
    this.setText(this._price, priceText);
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

  render(data?: Partial<T>): HTMLElement {
    if (data) {
      this._data = { ...this._data, ...data } as T;
      super.render(this._data);
    }
    return this.container;
  }
}
