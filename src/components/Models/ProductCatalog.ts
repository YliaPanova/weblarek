import { IProduct } from "../../types";
import { EventEmitter } from "../base/Events";

export class ProductCatalog extends EventEmitter {
  private products: IProduct[] = [];
  private selectedProduct: IProduct | null = null;

  setProducts(products: IProduct[]): void {
    this.products = products;
    this.emit("catalog:changed");
  }

  getProducts(): IProduct[] {
    return this.products;
  }

  getProductById(id: string): IProduct | null {
    return this.products.find((product) => product.id === id) || null;
  }

  setSelectedProduct(product: IProduct): void {
    this.selectedProduct = product;
    this.emit("product:selected", { product });
  }

  getSelectedProduct(): IProduct | null {
    return this.selectedProduct;
  }
}
