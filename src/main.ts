import "./scss/styles.scss";
import { ProductCatalog } from "./components/Models/ProductCatalog";
import { ShoppingCart } from "./components/Models/ShoppingCart";
import { Buyer } from "./components/Models/Buyer";
import { apiProducts } from "./utils/data";
import { DataService } from "./components/Service/DataService";
import { Api } from "./components/Service/Api";

async function testModels() {
  const catalog = new ProductCatalog();
  catalog.setProducts(apiProducts.items);
  console.log("Каталог товаров:", catalog.getProducts());

  const product = catalog.getProductById("1");
  console.log("Товар по ID=1:", product);

  const cart = new ShoppingCart();
  cart.addItem(apiProducts.items[0]);
  cart.addItem(apiProducts.items[1]);
  console.log("Товары в корзине:", cart.getItems());
  console.log("Общая стоимость:", cart.getTotalPrice());
  console.log("Количество товаров:", cart.getItemCount());

  cart.clear();
  console.log("После очистки:", cart.getItems());

  const buyer = new Buyer();
  buyer.updateEmail("test@example.com");
  buyer.updatePhone("+7 (999) 123-45-67");
  buyer.updatePayment("card");
  buyer.updateAddress("Москва, ул. Примерная, 1");
  console.log("Данные покупателя:", buyer.getData());

  const validationErrors = buyer.validate();
  console.log("Ошибки валидации:", validationErrors);

  buyer.clearData();
  console.log("После очистки:", buyer.getData());
}

async function testApiIntegration() {
  try {
    const apiInstance = new Api();
    const dataService = new DataService(apiInstance);

    const catalog = new ProductCatalog();
    const products = await dataService.getProducts();

    catalog.setProducts(products);
    console.log("Каталог загружен с сервера:", catalog.getProducts());
  } catch (error) {
    console.error("Ошибка загрузки с сервера:", error);
  }
}

async function main() {
  await testModels();
  await testApiIntegration();
}

main();
