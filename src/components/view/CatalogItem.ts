import { ProductCard } from './ProductCard';
import { IEvents } from '../base/Events';
import { IProduct } from '../../types';

export class CatalogItem extends ProductCard<IProduct> {
    constructor(events: IEvents, container: HTMLElement) {
        super(events, container, {
            onClick: (_event: MouseEvent, data?: IProduct) => {
                if (data) {
                    events.emit('product:select', { product: data });
                }
            }
        });
    }
}