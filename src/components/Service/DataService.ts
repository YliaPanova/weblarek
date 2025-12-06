import { IApi, IProduct, ApiResponse, IOrder } from "../../types";

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
  ): Promise<{ success: boolean; orderId?: string; total?: number }> {
    try {
      const response = await this.api.post<{ id: string; total: number }>(
        "/order/",
        orderData
      );

      return {
        success: true,
        orderId: response.id,
        total: response.total,
      };
    } catch (error) {
      console.error("Ошибка при отправке заказа:", error);
      throw error;
    }
  }
}
