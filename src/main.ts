import "./scss/styles.scss";

// Базовые компоненты
import { EventEmitter } from "./components/base/Events";
import { API_URL } from "./utils/constants";
import { ensureElement, cloneTemplate } from "./utils/utils";

// Сервисы
import { Api } from "./components/Service/Api";
import { DataService } from "./components/Service/DataService";

// Модели данных
import { ProductCatalog } from "./components/Models/ProductCatalog";
import { ShoppingCart } from "./components/Models/ShoppingCart";
import { Buyer } from "./components/Models/Buyer";

// Компоненты представления
import { Header } from "./components/view/Header";
import { Modal } from "./components/view/Modal";
import { Gallery } from "./components/view/Gallery";
import { CatalogItem } from "./components/view/CatalogItem";
import { PreviewItem } from "./components/view/PreviewItem";
import { Basket } from "./components/view/Basket";
import { BasketItem } from "./components/view/BasketItem";
import { OrderForm } from "./components/view/OrderForm";
import { ContactsForm } from "./components/view/ContactForm";
import { Success } from "./components/view/Success";

// Типы
import { IProduct, IOrder, TPayment } from "./types";

// Инициализация обработчика событий
const events = new EventEmitter();

// Инициализация Api и сервисов
const api = new Api(API_URL);
const dataService = new DataService(api);

// Инициализация Моделей
const catalogModel = new ProductCatalog();
const cartModel = new ShoppingCart();
const buyerModel = new Buyer();

// Инициализация шаблонов
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>("#card-catalog");
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>("#card-preview");
const cardBasketTemplate = ensureElement<HTMLTemplateElement>("#card-basket");
const basketTemplate = ensureElement<HTMLTemplateElement>("#basket");
const orderTemplate = ensureElement<HTMLTemplateElement>("#order");
const contactTemplate = ensureElement<HTMLTemplateElement>("#contacts");
const successTemplate = ensureElement<HTMLTemplateElement>("#success");

// Получение контейнеров
const galleryContainer = ensureElement<HTMLElement>(".gallery");
const headerContainer = ensureElement<HTMLElement>(".header");
const modalContainer = ensureElement<HTMLElement>("#modal-container");

// Инициализация компонентов View
const gallery = new Gallery(galleryContainer);
const header = new Header(events, headerContainer);
const modal = new Modal(events, modalContainer);

// Обработка событий каталога товаров
events.on("catalog:changed", () => {
  const products = catalogModel.getProducts();

  const catalogItems = products.map((product) => {
    const cardElement = cloneTemplate(cardCatalogTemplate);
    const cardView = new CatalogItem(events, cardElement);

    cardView.title = product.title;
    cardView.price = product.price;
    cardView.category = product.category;

    if (product.image) {
      cardView.image = product.image;
    }

    return cardView.render(product);
  });

  gallery.catalog = catalogItems;
  header.counter = cartModel.getItemCount();
});

// Выбор карточки (открытие превью)
events.on("product:select", (data: { product: IProduct }) => {
  const product = data.product;

  const previewElement = cloneTemplate(cardPreviewTemplate);
  const previewCard = new PreviewItem(events, previewElement);

  previewCard.title = product.title;
  previewCard.price = product.price;
  previewCard.category = product.category;

  if (product.image) {
    previewCard.image = product.image;
  }

  // Проверяем, есть ли товар уже в корзине
  const inCart = cartModel.getItems().some((item) => item.id === product.id);
  const isAvailable = product.price !== null;

  previewCard.buttonDisabled = !isAvailable || inCart;
  previewCard.buttonText = !isAvailable
    ? "Недоступно"
    : inCart
    ? "Уже в корзине"
    : "В корзину";

  modal.content = previewCard.render(product);
  modal.open();
});

// Добавление товара в корзину
events.on("product:add-to-basket", (data: { product: IProduct }) => {
  cartModel.addItem(data.product);
  events.emit("cart:changed");
  modal.close();
});

// Обновление состояния корзины
events.on("cart:changed", () => {
  header.counter = cartModel.getItemCount();
});

// Открытие корзины
events.on("basket:open", () => {
  const basketElement = cloneTemplate(basketTemplate);
  const basketView = new Basket(events, basketElement);

  const cartItems = cartModel.getItems();
  const itemElements: HTMLElement[] = [];
  const total = cartModel.getTotalPrice();

  if (cartItems.length > 0) {
    cartItems.forEach((product, index) => {
      const basketCardElement = cloneTemplate(cardBasketTemplate);
      const basketItem = new BasketItem(events, basketCardElement);

      basketItem.title = product.title;
      basketItem.price = product.price;
      basketItem.index = index + 1;

      itemElements.push(basketItem.render({ ...product, index: index + 1 }));
    });

    basketView.items = itemElements;
    basketView.buttonDisabled = false;
  } else {
    basketView.items = [];
    basketView.buttonDisabled = true;
  }

  basketView.total = total;
  modal.content = basketView.render();
  modal.open();
});

// Удаление товара из корзины
events.on("basket:remove", (data: { product: IProduct }) => {
  cartModel.removeItem(data.product);
  events.emit("cart:changed");

  // Если корзина открыта, обновляем её
  if (modal.isOpen) {
    events.emit("basket:open");
  }
});

// Открытие формы заказа
events.on("order:open", () => {
  const orderElement = cloneTemplate(orderTemplate);
  const orderForm = new OrderForm(events, orderElement);

  const currentData = buyerModel.getData();
  orderForm.payment = currentData.payment || "";
  orderForm.address = currentData.address;

  // Проверяем валидацию
  const errors = buyerModel.validate();
  const errorMessages = Object.values(errors);
  orderForm.valid = errorMessages.length === 0;
  orderForm.errors = errorMessages;

  modal.content = orderForm.render();
  modal.open();
});

// Изменение данных в форме заказа
events.on("order.payment:change", (data: { payment: string }) => {
  buyerModel.updatePayment(data.payment as TPayment);
  updateFormValidation();
});

events.on("order.address:change", (data: { address: string }) => {
  buyerModel.updateAddress(data.address);
  updateFormValidation();
});

// Отправка формы заказа
events.on("order:submit", () => {
  const errors = buyerModel.validate();
  const errorMessages = Object.values(errors);

  if (errorMessages.length === 0) {
    // Переходим к форме контактов
    const contactElement = cloneTemplate(contactTemplate);
    const contactForm = new ContactsForm(events, contactElement);

    const currentData = buyerModel.getData();
    contactForm.email = currentData.email;
    contactForm.phone = currentData.phone;

    // Проверяем валидацию
    const contactErrors = buyerModel.validate();
    const contactErrorMessages = Object.values(contactErrors);
    contactForm.valid = contactErrorMessages.length === 0;
    contactForm.errors = contactErrorMessages;

    modal.content = contactForm.render();
  }
});

// Изменение данных в форме контактов
events.on("contacts.email:change", (data: { email: string }) => {
  buyerModel.updateEmail(data.email);
  updateFormValidation();
});

events.on("contacts.phone:change", (data: { phone: string }) => {
  buyerModel.updatePhone(data.phone);
  updateFormValidation();
});

// Отправка формы контактов
events.on("contacts:submit", async () => {
  const errors = buyerModel.validate();
  const errorMessages = Object.values(errors);

  if (errorMessages.length === 0) {
    try {
      const buyerData = buyerModel.getData();
      const orderData: IOrder = {
        payment: buyerData.payment!,
        email: buyerData.email,
        phone: buyerData.phone,
        address: buyerData.address,
        total: cartModel.getTotalPrice(),
        items: cartModel.getItems().map((item) => item.id),
      };

      await dataService.sendOrder(orderData);

      // Показываем экран успеха
      const successElement = cloneTemplate(successTemplate);
      const successView = new Success(events, successElement);
      successView.total = orderData.total;

      // Очищаем данные
      cartModel.clear();
      buyerModel.clearData();
      events.emit("cart:changed");

      modal.content = successView.render();
    } catch (error) {
      console.error("Ошибка оформления заказа:", error);
    }
  }
});

// Обновление валидации форм
function updateFormValidation(): void {
  const errors = buyerModel.validate();
  const errorMessages = Object.values(errors);
  const isValid = errorMessages.length === 0;

  // Можно добавить логику обновления текущей открытой формы
  console.log("Form validation updated:", { isValid, errorMessages });
}

// Закрытие модального окна
events.on("modal:close", () => {
  modal.close();
});

// Закрытие экрана успеха
events.on("success:close", () => {
  modal.close();
});

// Загрузка каталога товаров при старте
dataService
  .getProducts()
  .then((products) => {
    catalogModel.setProducts(products);
    events.emit("catalog:changed");
  })
  .catch((error) => {
    console.error("Ошибка загрузки товаров:", error);
  });
