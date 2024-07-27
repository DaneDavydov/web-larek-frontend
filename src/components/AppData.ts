import { IProduct, IFormOrder, IProductData, FormErrors, TBasketProduct, TOrderInfo } from "../types/";
import { Model } from "./base/Model";

export type CatalogChangeEvent = {
  catalog: Product[]
};

export class Product extends Model<IProduct> {
  id: string;
  image: string;
  category: string;
  title: string;
  description: string;
  price: number | null;
}

export class AppData extends Model<IProductData> {
  catalog: IProduct[];
  preview: string | null;
  order: IFormOrder = {items: [], payment: 'card', address: '', email: '', phone: '', total: 0};
  basket: Map<string, number> = new Map();
  formOrderErrors: FormErrors = {};
  formContactsErrors: FormErrors = {};

  setCatalog(items: IProduct[]) {
    this.catalog = items.map(item => new Product(item, this.events));
    this.emitChanges('items:changed', { catalog: this.catalog });
  }

  getProduct(item: Product) {
    this.preview = item.id;
    this.emitChanges('preview:changed', item);
  }

  isInBasket(id: string): boolean {
    return this.basket.has(id);
  }

  private addProduct(id: string, price: number | null): void {
    this.basket.set(id, price ?? 0);
  }

  private deleteProduct(id: string): void {
    this.basket.delete(id);
  }

  toggleOrderedProduct(id: string, price: number | null) {
    if (!this.isInBasket(id)) {
      this.addProduct(id, price);
    } else {
      this.deleteProduct(id);
    }
    this.emitChanges('basket:changed');
  }

  getCounter(): number {
    return this.basket.size;
  }

  getBasketProducts(): TBasketProduct[] {
    return this.catalog
      .filter((item) => this.isInBasket(item.id))
      .map((item) => {
        return {
          id: item.id,
          title: item.title,
          price: item.price,
        };
      });
  }

  clearBasket(): void {
    this.basket.clear();
    this.emitChanges('basket:changed');
  }

  getTotal(): number {
    return Array.from(this.basket.values()).reduce((a, c) => a + c,0);
  }

  setOrderItems(): void {
    this.order.items = Array.from(this.basket.keys()).filter((i) => this.basket.get(i) != 0);
  }

  setOrderTotal(): void {this.order.total = this.getTotal();}

  validateOrder(): boolean {
    const errors: typeof this.formOrderErrors = {};
    if (!this.order.address) {
      errors.address = 'Необходимо указать адрес';
    }
    this.formOrderErrors = errors;
    this.events.emit('orderFormErrors:changed', this.formOrderErrors);
    return Object.keys(errors).length === 0;
  }

  validateContacts(): boolean {
    const errors: typeof this.formContactsErrors = {};
    if (!this.order.email || !this.order.phone) {
      errors.email = 'Необходимо заполнить все поля';
    }
    this.formContactsErrors = errors;
    this.events.emit('contactsFormErrors:changed', this.formContactsErrors);
    return Object.keys(errors).length === 0;
  }

  setOrderField(field: keyof TOrderInfo, value: string): void {
    this.order[field] = value;
    if (this.validateOrder() && this.validateContacts()) {
      this.events.emit('order:ready', this.order);
    }
  }
}