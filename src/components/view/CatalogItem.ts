import { ProductCard } from "./ProductCard";
import { IEvents } from "../base/Events";

interface ICatalogItemData {
  id: string;
  category: string;
  title: string;
  price: number | null;
  image?: string;
}

export class CatalogItem extends ProductCard<ICatalogItemData> {
  private _productId: string = "";

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container, {
      onClick: (event: MouseEvent) => {
        event.preventDefault();

        if (this._productId) {
          events.emit("product:select", { id: this._productId });
        }
      },
    });
  }

  // Добавляем сеттер для ID
  set productId(value: string) {
    this._productId = value;
  }

  render(data?: Partial<ICatalogItemData>): HTMLElement {
    if (data?.id) {
      this._productId = data.id;
    }
    return super.render(data);
  }
}
