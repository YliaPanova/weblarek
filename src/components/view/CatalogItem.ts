import { ProductCard } from "./ProductCard";
import { IEvents } from "../base/Events";

// Убираем IProduct, так как храним только ID
// Добавляем интерфейс для данных, которые нужны представлению
interface ICatalogItemData {
  id: string;  // ← Теперь храним только ID, а не весь объект товара
  category: string;
  title: string;
  price: number | null;
  image?: string;
}

export class CatalogItem extends ProductCard<ICatalogItemData> {
  private _productId: string = "";  // ← Изменено: храним только ID

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container, {
      onClick: (event: MouseEvent) => {
        event.preventDefault();
        // Убираем проверку на данные, всегда эмитим событие с ID
        if (this._productId) {
          events.emit("product:select", { id: this._productId });  // ← Отправляем только ID
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
      this._productId = data.id;  // ← Сохраняем ID из данных
    }
    return super.render(data);
  }
}