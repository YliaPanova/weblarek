/**
 * Базовый компонент
 */
export abstract class Component<T> {
    protected constructor(protected readonly container: HTMLElement) {
        // Учитывайте что код в конструкторе исполняется ДО всех объявлений в дочернем классе
    }

        /**
     * Переключает класс у элемента
     */
    toggleClass(element: HTMLElement, className: string, force?: boolean): void {
        element.classList.toggle(className, force);
    }

    /**
     * Устанавливает текст элемента
     */
    protected setText(element: HTMLElement, value: string): void {
        element.textContent = value;
    }

    /**
     * Устанавливает состояние disabled для элемента
     */
    protected setDisabled(element: HTMLElement, state: boolean): void {
        element.toggleAttribute('disabled', state);
    }
    // Инструментарий для работы с DOM в дочерних компонентах

    // Установить изображение с альтернативным текстом
    protected setImage(element: HTMLImageElement, src: string, alt?: string) {
        if (element) {
            element.src = src;
            if (alt) {
                element.alt = alt;
            }
        }
    }

    // Вернуть корневой DOM-элемент
    render(data?: Partial<T>): HTMLElement {
        Object.assign(this as object, data ?? {});
        return this.container;
    }
}
