// для карточек в модальном окне
import { ProductCard } from "./ProductCard";
import { IEvents } from "../base/Events";
import { IProduct } from "../../types";

export class PreviewItem extends ProductCard<IProduct> {
  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);

    // Добавляем обработчик для кнопки "В корзину"
    const button = container.querySelector(".card__button");
    if (button) {
      button.addEventListener("click", (event: Event) => {
        event.preventDefault();
        if (this._data) {
          events.emit("product:add-to-basket", { product: this._data });
        }
      });
    }
  }
}
