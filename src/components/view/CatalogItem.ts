import { ProductCard } from "./ProductCard";
import { IEvents } from "../base/Events";
import { IProduct } from "../../types";

export class CatalogItem extends ProductCard<IProduct> {
  private _productData: IProduct | null = null;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container, {
      onClick: (event: MouseEvent) => {
        event.preventDefault();
        if (this._productData) {
          events.emit("product:select", { product: this._productData });
        }
      },
    });
  }

  render(data?: Partial<IProduct>): HTMLElement {
    if (data) {
      this._productData = data as IProduct;
    }
    return super.render(data);
  }
}
