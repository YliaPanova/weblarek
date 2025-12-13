import { IProduct } from "../../types";
import { IEvents } from "../base/Events";

export class ProductCatalog {
  private products: IProduct[] = [];

  constructor(private events: IEvents) {}

  setProducts(products: IProduct[]): void {
    this.products = products;
    this.events.emit("catalog:changed");
  }

  getProducts(): IProduct[] {
    return this.products;
  }

  getProductById(id: string): IProduct | null {
    return this.products.find((product) => product.id === id) || null;
  }
  
  // Убираем методы для selectedProduct, так как это состояние UI
}