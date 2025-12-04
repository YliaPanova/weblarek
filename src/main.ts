import "./scss/styles.scss";
import { ProductCatalog } from "./components/Models/ProductCatalog";
import { ShoppingCart } from "./components/Models/ShoppingCart";
import { Buyer } from "./components/Models/Buyer";
import { apiProducts } from "./utils/data";
import { DataService } from "./components/Service/DataService";
import { Api } from "./components/Service/Api";

// Компоненты представления
import { Header } from "./components/view/Header";
import { Modal } from "./components/view/Modal";
import { CatalogItem } from "./components/view/CatalogItem";
import { PreviewCard } from "./components/view/PreviewCard";
import { Basket } from "./components/view/Basket";
import { BasketItem } from "./components/view/BasketItem";
import { OrderForm } from "./components/view/OrderForm";
import { ContactsForm } from "./components/view/ContactsForm";
import { Success } from "./components/view/Success";

// Утилиты
import { ensureElement, cloneTemplate } from "./utils/utils";
import { IProduct } from "./types";

/**
 * Основной презентер приложения
 * Управляет всеми взаимодействиями между Model и View
 */
class AppPresenter {
    // Модели данных
    private catalog: ProductCatalog;
    private cart: ShoppingCart;
    private buyer: Buyer;

    // Компоненты представления
    private header: Header;
    private modal: Modal;
    private basket: Basket;
    private orderForm: OrderForm;
    private contactsForm: ContactsForm;
    private success: Success;

    // Сервисы
    private dataService: DataService;

    // Шаблоны
    private cardCatalogTemplate: HTMLTemplateElement;
    private cardPreviewTemplate: HTMLTemplateElement;
    private cardBasketTemplate: HTMLTemplateElement;
    private basketTemplate: HTMLTemplateElement;
    private orderTemplate: HTMLTemplateElement;
    private contactsTemplate: HTMLTemplateElement;
    private successTemplate: HTMLTemplateElement;

    // Брокер событий
    private events: EventEmitter;

    constructor() {
        this.events = new EventEmitter();
        this.initializeModels();
        this.initializeTemplates();
        this.initializeViews();
        this.setupEventHandlers();
        this.loadCatalog();
    }

    /**
     * Инициализация моделей данных
     */
    private initializeModels(): void {
        this.catalog = new ProductCatalog(this.events);
        this.cart = new ShoppingCart(this.events);
        this.buyer = new Buyer(this.events);
    }

    /**
     * Инициализация HTML шаблонов
     */
    private initializeTemplates(): void {
        this.cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
        this.cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
        this.cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
        this.basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
        this.orderTemplate = ensureElement<HTMLTemplateElement>('#order');
        this.contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
        this.successTemplate = ensureElement<HTMLTemplateElement>('#success');
    }

    /**
     * Инициализация компонентов представления
     */
    private initializeViews(): void {
        this.header = new Header(this.events, ensureElement<HTMLElement>('.header'));
        this.modal = new Modal(this.events, ensureElement<HTMLElement>('#modal-container'));
        
        // Инициализация других компонентов будет происходить динамически
    }

    /**
     * Настройка обработчиков событий
     */
    private setupEventHandlers(): void {
        // События каталога товаров
        this.events.on('catalog:changed', () => this.renderCatalog());
        this.events.on('product:select', (data: { product: IProduct }) => this.openProductPreview(data.product));
        
        // События корзины
        this.events.on('cart:changed', () => this.updateCart());
        this.events.on('product:add-to-basket', (data: { product: IProduct }) => this.addToCart(data.product));
        this.events.on('basket:open', () => this.openBasket());
        this.events.on('basket:remove', (data: { product: IProduct }) => this.removeFromCart(data.product));
        
        // События оформления заказа
        this.events.on('order:open', () => this.openOrderForm());
        this.events.on('order.payment:change', (data: { payment: string }) => this.updatePayment(data.payment));
        this.events.on('order.address:change', (data: { address: string }) => this.updateAddress(data.address));
        this.events.on('order:submit', () => this.submitOrderForm());
        
        // События контактной информации
        this.events.on('contacts.email:change', (data: { email: string }) => this.updateEmail(data.email));
        this.events.on('contacts.phone:change', (data: { phone: string }) => this.updatePhone(data.phone));
        this.events.on('contacts:submit', () => this.submitContactsForm());
        
        // События модального окна
        this.events.on('modal:close', () => this.onModalClose());
        
        // События успешного оформления
        this.events.on('success:close', () => this.onSuccessClose());
    }

    /**
     * Загрузка каталога товаров с сервера
     */
    private async loadCatalog(): Promise<void> {
        try {
            const api = new Api();
            this.dataService = new DataService(api);
            const products = await this.dataService.getProducts();
            this.catalog.setProducts(products);
        } catch (error) {
            console.error('Ошибка загрузки каталога:', error);
            // Здесь можно добавить отображение ошибки пользователю
        }
    }

    /**
     * Рендеринг каталога товаров (обработчик события catalog:changed)
     */
    private renderCatalog(): void {
        const gallery = ensureElement<HTMLElement>('.gallery');
        const products = this.catalog.getProducts();
        
        const cards = products.map(product => {
            const cardElement = cloneTemplate(this.cardCatalogTemplate);
            const card = new CatalogItem(this.events, cardElement);
            card.render(product);
            return cardElement;
        });

        gallery.replaceChildren(...cards);
    }

    /**
     * Открытие превью товара
     */
    private openProductPreview(product: IProduct): void {
        const previewElement = cloneTemplate(this.cardPreviewTemplate);
        const previewCard = new PreviewCard(this.events, previewElement);
        previewCard.render(product);
        
        this.modal.content = previewElement;
        this.modal.open();
    }

    /**
     * Добавление товара в корзину
     */
    private addToCart(product: IProduct): void {
        this.cart.addItem(product);
        this.modal.close();
    }

    /**
     * Обновление отображения корзины (обработчик события cart:changed)
     */
    private updateCart(): void {
        // Обновление счетчика в header
        this.header.counter = this.cart.getItemCount();
    }

    /**
     * Открытие модального окна корзины
     */
    private openBasket(): void {
        const basketElement = cloneTemplate(this.basketTemplate);
        this.basket = new Basket(this.events, basketElement);
        
        // Создание элементов товаров в корзине
        const items = this.cart.getItems().map((item, index) => {
            const itemElement = cloneTemplate(this.cardBasketTemplate);
            const basketItem = new BasketItem(this.events, itemElement);
            basketItem.render({ ...item, index: index + 1 });
            return itemElement;
        });
        
        this.basket.items = items;
        this.basket.total = this.cart.getTotalPrice();
        this.basket.buttonDisabled = this.cart.getItemCount() === 0;
        
        this.modal.content = basketElement;
        this.modal.open();
    }

    /**
     * Удаление товара из корзины
     */
    private removeFromCart(product: IProduct): void {
        this.cart.removeItem(product.id);
        
        // Обновляем отображение корзины
        this.openBasket();
    }

    /**
     * Открытие формы оформления заказа
     */
    private openOrderForm(): void {
        const orderElement = cloneTemplate(this.orderTemplate);
        this.orderForm = new OrderForm(this.events, orderElement);
        
        // Устанавливаем начальные значения
        this.orderForm.payment = this.buyer.getPayment();
        this.orderForm.address = this.buyer.getAddress();
        this.updateOrderFormValidation();
        
        this.modal.content = orderElement;
        this.modal.open();
    }

    /**
     * Обновление способа оплаты
     */
    private updatePayment(payment: string): void {
        this.buyer.updatePayment(payment);
        this.updateOrderFormValidation();
    }

    /**
     * Обновление адреса доставки
     */
    private updateAddress(address: string): void {
        this.buyer.updateAddress(address);
        this.updateOrderFormValidation();
    }

    /**
     * Обновление валидации формы заказа
     */
    private updateOrderFormValidation(): void {
        const errors = this.buyer.validate();
        const isValid = errors.length === 0;
        
        if (this.orderForm) {
            this.orderForm.valid = isValid;
            this.orderForm.errors = errors;
        }
    }

    /**
     * Отправка формы заказа
     */
    private submitOrderForm(): void {
        const errors = this.buyer.validate();
        
        if (errors.length === 0) {
            this.openContactsForm();
        }
    }

    /**
     * Открытие формы контактной информации
     */
    private openContactsForm(): void {
        const contactsElement = cloneTemplate(this.contactsTemplate);
        this.contactsForm = new ContactsForm(this.events, contactsElement);
        
        // Устанавливаем начальные значения
        this.contactsForm.email = this.buyer.getEmail();
        this.contactsForm.phone = this.buyer.getPhone();
        this.updateContactsFormValidation();
        
        this.modal.content = contactsElement;
        this.modal.open();
    }

    /**
     * Обновление email
     */
    private updateEmail(email: string): void {
        this.buyer.updateEmail(email);
        this.updateContactsFormValidation();
    }

    /**
     * Обновление телефона
     */
    private updatePhone(phone: string): void {
        this.buyer.updatePhone(phone);
        this.updateContactsFormValidation();
    }

    /**
     * Обновление валидации формы контактов
     */
    private updateContactsFormValidation(): void {
        const errors = this.buyer.validate();
        const isValid = errors.length === 0;
        
        if (this.contactsForm) {
            this.contactsForm.valid = isValid;
            this.contactsForm.errors = errors;
        }
    }

    /**
     * Отправка формы контактов
     */
    private async submitContactsForm(): Promise<void> {
        const errors = this.buyer.validate();
        
        if (errors.length === 0) {
            try {
                const orderData = {
                    ...this.buyer.getData(),
                    items: this.cart.getItems().map(item => item.id),
                    total: this.cart.getTotalPrice()
                };
                
                await this.dataService.createOrder(orderData);
                this.showSuccess();
            } catch (error) {
                console.error('Ошибка оформления заказа:', error);
                // Здесь можно добавить отображение ошибки пользователю
            }
        }
    }

    /**
     * Показ экрана успешного оформления заказа
     */
    private showSuccess(): void {
        const successElement = cloneTemplate(this.successTemplate);
        this.success = new Success(this.events, successElement);
        
        this.success.total = this.cart.getTotalPrice();
        this.modal.content = successElement;
        
        // Очищаем данные после успешного оформления
        this.cart.clear();
        this.buyer.clearData();
        this.updateCart();
    }

    /**
     * Обработчик закрытия модального окна
     */
    private onModalClose(): void {
        // Очищаем ссылки на временные компоненты
        this.basket = null;
        this.orderForm = null;
        this.contactsForm = null;
        this.success = null;
    }

    /**
     * Обработчик закрытия экрана успеха
     */
    private onSuccessClose(): void {
        this.modal.close();
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new AppPresenter();
});

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
