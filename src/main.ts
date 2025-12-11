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

// Инициализация Моделей с передачей EventEmitter
const catalogModel = new ProductCatalog(events);
const cartModel = new ShoppingCart(events);
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

// Создаем представления форм один раз
let orderForm: OrderForm | null = null;
let contactForm: ContactsForm | null = null;
let successView: Success | null = null;

// Текущий просматриваемый товар
let currentPreviewProduct: IProduct | null = null;

// Функция загрузки товаров с сервера
async function loadProducts() {
  try {
    console.log("Loading products from server...");
    const products = await dataService.getProducts();
    console.log("Products loaded:", products);
    
    // Обновляем модель каталога
    catalogModel.setProducts(products);
    
    // Обновляем UI через событие
    events.emit("catalog:changed");
  } catch (error) {
    console.error("Failed to load products:", error);
    // Показываем сообщение об ошибке
    gallery.catalog = [createMessageElement("Не удалось загрузить товары. Пожалуйста, попробуйте позже.")];
  }
}

// Обработка событий каталога товаров
events.on("catalog:changed", () => {
  console.log("Catalog changed event received");
  const products = catalogModel.getProducts();
  console.log("Products in catalog:", products);

  if (products.length === 0) {
    gallery.catalog = [createMessageElement("Нет доступных товаров")];
    return;
  }

  const catalogItems = products.map((product) => {
    const cardElement = cloneTemplate(cardCatalogTemplate);
    const cardView = new CatalogItem(events, cardElement);

    // Устанавливаем данные
    cardView.category = product.category;
    cardView.title = product.title;
    cardView.price = product.price;

    // Проверяем и устанавливаем изображение
    if (product.image) {
      cardView.image = product.image;
    } else {
      // Если нет изображения, устанавливаем placeholder
      const imgElement = cardElement.querySelector(".card__image");
      if (imgElement) {
        (imgElement as HTMLImageElement).src = "src/images/placeholder.jpg";
      }
    }

    // Сохраняем id товара
    cardElement.dataset.id = product.id;

    return cardView.render();
  });

  gallery.catalog = catalogItems;
  header.counter = cartModel.getItemCount();
  console.log(`Catalog updated with ${catalogItems.length} items`);
});

// Создание элемента сообщения
function createMessageElement(message: string): HTMLElement {
  const element = document.createElement("div");
  element.className = "message";
  element.textContent = message;
  element.style.padding = "20px";
  element.style.textAlign = "center";
  return element;
}

// Выбор карточки (открытие превью)
events.on("product:select", (data: { product: IProduct }) => {
  console.log("Product selected:", data.product);
  currentPreviewProduct = data.product;

  const previewElement = cloneTemplate(cardPreviewTemplate);
  const previewCard = new PreviewItem(events, previewElement);

  // Проверяем, есть ли товар уже в корзине
  const inCart = cartModel.hasItem(data.product.id);
  const isAvailable = data.product.price !== null;

  previewCard.buttonDisabled = !isAvailable;
  previewCard.buttonText = !isAvailable
    ? "Недоступно"
    : inCart
    ? "Удалить"
    : "В корзину";

  // Устанавливаем данные
  previewCard.category = data.product.category;
  previewCard.title = data.product.title;
  previewCard.price = data.product.price;

  if (data.product.image) {
    previewCard.image = data.product.image;
  }

  modal.content = previewCard.render();
  modal.open();
});

// Переключение товара в корзине (добавить/удалить)
events.on("product:toggle-basket", () => {
  if (!currentPreviewProduct) return;

  console.log("Toggling basket for product:", currentPreviewProduct.id);

  if (cartModel.hasItem(currentPreviewProduct.id)) {
    cartModel.removeItem(currentPreviewProduct);
    console.log("Product removed from cart");
  } else {
    cartModel.addItem(currentPreviewProduct);
    console.log("Product added to cart");
  }

  // Обновляем кнопку в превью
  const inCart = cartModel.hasItem(currentPreviewProduct.id);

  const previewButton = document.querySelector(".card__button");
  if (previewButton) {
    (previewButton as HTMLButtonElement).textContent = inCart
      ? "Удалить"
      : "В корзину";
  }

  modal.close();
});

// Обновление состояния корзины
events.on("cart:changed", () => {
  console.log("Cart changed, items:", cartModel.getItemCount());
  header.counter = cartModel.getItemCount();
});

// Открытие корзины
events.on("basket:open", () => {
  console.log("Opening basket");
  const basketElement = cloneTemplate(basketTemplate);
  const basketView = new Basket(events, basketElement);

  const cartItems = cartModel.getItems();
  const itemElements: HTMLElement[] = [];
  const total = cartModel.getTotalPrice();

  console.log("Cart items:", cartItems);

  if (cartItems.length > 0) {
    cartItems.forEach((product, index) => {
      const basketCardElement = cloneTemplate(cardBasketTemplate);
      const basketItem = new BasketItem(events, basketCardElement);

      basketItem.title = product.title;
      basketItem.price = product.price;
      basketItem.index = index + 1;
      basketItem.productId = product.id;

      itemElements.push(basketItem.render());
    });

    basketView.items = itemElements;
    basketView.buttonDisabled = false;
  } else {
    basketView.items = [createMessageElement("Корзина пуста")];
    basketView.buttonDisabled = true;
  }

  basketView.total = total;
  modal.content = basketView.render();
  modal.open();
});

// Удаление товара из корзины
events.on("basket:remove", (data: { productId: string }) => {
  console.log("Removing product from basket:", data.productId);
  const product = catalogModel.getProductById(data.productId);
  if (product) {
    cartModel.removeItem(product);
  }

  // Если корзина открыта, обновляем её
  if (modal.isOpen) {
    events.emit("basket:open");
  }
});

// Открытие формы заказа
events.on("order:open", () => {
  console.log("Opening order form");
  if (!orderForm) {
    const orderElement = cloneTemplate(orderTemplate);
    orderForm = new OrderForm(events, orderElement);
  }

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
  console.log("Order form submitted");
  const errors = buyerModel.validate();
  const errorMessages = Object.values(errors);

  if (errorMessages.length === 0) {
    // Переходим к форме контактов
    if (!contactForm) {
      const contactElement = cloneTemplate(contactTemplate);
      contactForm = new ContactsForm(events, contactElement);
    }

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
  console.log("Contacts form submitted");
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

      console.log("Sending order:", orderData);
      const result = await dataService.sendOrder(orderData);
      console.log("Order sent successfully:", result);

      // Показываем экран успеха
      if (!successView) {
        const successElement = cloneTemplate(successTemplate);
        successView = new Success(events, successElement);
      }
      successView.total = orderData.total;

      // Очищаем данные
      cartModel.clear();
      buyerModel.clearData();

      modal.content = successView.render();
    } catch (error) {
      console.error("Ошибка оформления заказа:", error);
      alert(
        "Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз."
      );
    }
  }
});

// Обновление валидации форм
function updateFormValidation(): void {
  const errors = buyerModel.validate();
  const errorMessages = Object.values(errors);
  const isValid = errorMessages.length === 0;

  // Обновляем текущую открытую форму
  if (modal.isOpen) {
    const currentForm = orderForm || contactForm;
    if (currentForm) {
      currentForm.valid = isValid;
      currentForm.errors = errorMessages;
    }
  }
}

// Закрытие модального окна
events.on("modal:close", () => {
  modal.close();
});

// Закрытие экрана успеха
events.on("success:close", () => {
  modal.close();
  // Сбрасываем формы для следующего заказа
  buyerModel.clearData();
});

// Загружаем товары при запуске приложения
loadProducts();