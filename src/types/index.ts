export type ApiPostMethods = "POST" | "PUT" | "DELETE";

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods
  ): Promise<T>;
}

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}

export type TPayment = "card" | "cash" | "online";

export interface ApiResponse {
  total: number;
  items: IProduct[];
}

export interface IOrder extends IBuyer {
  items: string[];
  total: number;
}

// Дополнительные типы для событий
export interface ProductSelectEvent {
  product: IProduct;
}

export interface BasketRemoveEvent {
  product: IProduct;
}

export interface PaymentChangeEvent {
  payment: string;
}

export interface AddressChangeEvent {
  address: string;
}

export interface EmailChangeEvent {
  email: string;
}

export interface PhoneChangeEvent {
  phone: string;
}
