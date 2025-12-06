import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { IProduct } from "../../types";

interface IBasketItem extends IProduct {
  index: number;
}

export class BasketItem extends Component<IBasketItem> {
  protected _index: HTMLElement;
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _deleteButton: HTMLButtonElement;

  protected _data: IBasketItem | null = null;

  constructor(events: IEvents, container: HTMLElement) {
    super(container);

    this._index = ensureElement<HTMLElement>(".basket__item-index", container);
    this._title = ensureElement<HTMLElement>(".card__title", container);
    this._price = ensureElement<HTMLElement>(".card__price", container);
    this._deleteButton = ensureElement<HTMLButtonElement>(
      ".basket__item-delete",
      container
    );

    this._deleteButton.addEventListener("click", (event: MouseEvent) => {
      event.preventDefault();
      if (this._data) {
        events.emit("basket:remove", { product: this._data });
      }
    });
  }

  set index(value: number) {
    this.setText(this._index, String(value));
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  set price(value: number | null) {
    const priceText = value !== null ? `${value} синапсов` : "Бесценно";
    this.setText(this._price, priceText);
  }

  render(data?: Partial<IBasketItem>): HTMLElement {
    if (data) {
      this._data = { ...this._data, ...data } as IBasketItem;

      // Устанавливаем значения
      if (data.index !== undefined) this.index = data.index;
      if (data.title !== undefined) this.title = data.title;
      if (data.price !== undefined) this.price = data.price;
    }
    return this.container;
  }
}
