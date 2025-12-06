//для карточек в каталоге
import { ProductCard } from "./ProductCard";
import { IEvents } from "../base/Events";
import { IProduct } from "../../types";

export class CatalogItem extends ProductCard<IProduct> {
  constructor(events: IEvents, container: HTMLElement) {
    super(events, container, {
      onClick: (_event: MouseEvent, data?: IProduct) => {
        // Клик по карточке в каталоге открывает превью
        if (data) {
          events.emit("product:select", { product: data });
        }
      },
    });
  }
}
