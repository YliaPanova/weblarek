import { IProduct } from "../../types";
import { IEvents } from "../base/Events";

export class ProductCatalog {
  private products: IProduct[] = [];
  private selectedProduct: IProduct | null = null;

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

  setSelectedProduct(product: IProduct): void {
    this.selectedProduct = product;
    this.events.emit("product:selected", { product });
  }

  getSelectedProduct(): IProduct | null {
    return this.selectedProduct;
  }
}