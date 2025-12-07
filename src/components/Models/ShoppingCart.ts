import { IProduct } from "../../types";
import { EventEmitter } from "../base/Events";

export class ShoppingCart extends EventEmitter {
  private items: IProduct[] = [];

  getItems(): IProduct[] {
    return this.items;
  }

  addItem(product: IProduct): void {
    this.items.push(product);
    this.emit("cart:changed");
  }

  removeItem(product: IProduct): void {
    this.items = this.items.filter((item) => item.id !== product.id);
    this.emit("cart:changed");
  }

  removeItemById(productId: string): void {
    const product = this.items.find((item) => item.id === productId);
    if (product) {
      this.removeItem(product);
    }
  }

  clear(): void {
    this.items = [];
    this.emit("cart:changed");
  }

  getTotalPrice(): number {
    return this.items.reduce((sum, item) => sum + (item.price || 0), 0);
  }

  getItemCount(): number {
    return this.items.length;
  }

  hasItem(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }
}
