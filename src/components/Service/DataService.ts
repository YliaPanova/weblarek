import { IApi, IProduct, ApiResponse, IOrder, IBuyer } from "../../types";
import { Buyer } from "../Models/Buyer";

export class DataService {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }
  async getProducts(): Promise<IProduct[]> {
    try {
      const response: ApiResponse = await this.api.get<ApiResponse>(
        "/product/"
      );
      return response.items;
    } catch (error) {
      console.error("Ошибка при загрузке товаров:", error);
      throw error;
    }
  }

  async sendOrder(
    orderData: IOrder
  ): Promise<{ success: boolean; orderId?: string }> {
    try {
      const validationErrors = this.validateOrder(orderData);
      if (Object.keys(validationErrors).length > 0) {
        throw new Error(
          "Невалидные данные заказа: " + JSON.stringify(validationErrors)
        );
      }

      const response = await this.api.post<{ id: string }>(
        "/order/",
        orderData
      );

      return {
        success: true,
        orderId: response.id,
      };
    } catch (error) {
      console.error("Ошибка при отправке заказа:", error);
      throw error;
    }
  }

  private validateOrder(order: IOrder): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    const buyerErrors = this.validateBuyer(order.buyer);
    if (Object.keys(buyerErrors).length > 0) {
      errors.buyer =
        "Некорректные данные покупателя: " +
        Object.values(buyerErrors).join(", ");
    }

    if (order.cartItems.length === 0) {
      errors.cartItems = "Корзина пуста";
    }

    if (order.totalPrice <= 0) {
      errors.totalPrice = "Неверная сумма заказа";
    }

    const calculatedTotal = order.cartItems.reduce(
      (sum, item) => sum + (item.price || 0),
      0
    );
    if (Math.abs(order.totalPrice - calculatedTotal) > 0.01) {
      errors.totalPrice = `Сумма заказа не совпадает с расчетной (${calculatedTotal})`;
    }

    return errors;
  }

  private validateBuyer(buyerData: IBuyer): { [key: string]: string } {
    const tempBuyer = new Buyer();

    tempBuyer.updatePayment(buyerData.payment);
    tempBuyer.updateEmail(buyerData.email);
    tempBuyer.updatePhone(buyerData.phone);
    tempBuyer.updateAddress(buyerData.address);

    return tempBuyer.validate();
  }
}
