import { TPayment } from "../../types";

export class Buyer {
  private payment: TPayment | null = null;
  private email: string = "";
  private phone: string = "";
  private address: string = "";

  updatePayment(payment: TPayment): void {
    this.payment = payment;
  }

  updateEmail(email: string): void {
    this.email = email;
  }

  updatePhone(phone: string): void {
    this.phone = phone;
  }

  updateAddress(address: string): void {
    this.address = address;
  }

  getData(): {
    payment: TPayment | null;
    email: string;
    phone: string;
    address: string;
  } {
    return {
      payment: this.payment,
      email: this.email,
      phone: this.phone,
      address: this.address,
    };
  }

  clearData(): void {
    this.payment = null;
    this.email = "";
    this.phone = "";
    this.address = "";
  }

  validate(): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    if (!this.payment) errors.payment = "Не выбран вид оплаты";
    if (!this.email) errors.email = "Укажите email";
    if (!this.phone) errors.phone = "Укажите телефон";
    if (!this.address) errors.address = "Укажите адрес";

    return errors;
  }
}
