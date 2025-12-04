import { ensureElement } from '../../utils/utils';
import { ProductCard } from './ProductCard';
import { IEvents } from '../base/Events';
import { IProduct } from '../../types';

interface IBasketItem extends IProduct {
    index: number;
}

export class BasketItem extends ProductCard<IBasketItem> {
    protected _index: HTMLElement;
    protected _deleteButton: HTMLButtonElement;

    constructor(events: IEvents, container: HTMLElement) {
        super(events, container);

        this._index = ensureElement<HTMLElement>('.basket__item-index', container);
        this._deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

        this._deleteButton.addEventListener('click', (event: MouseEvent) => {
            event.preventDefault();
            if (this._data) {
                events.emit('basket:remove', { product: this._data });
            }
        });
    }

    set index(value: number) {
        this.setText(this._index, String(value));
    }
}