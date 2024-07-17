export interface IProduct {
  id: string;
  image: string;
  category: string;
  title: string;
  description: string;
  price: number | null;
}

export interface IFormOrder {
  items: string[];
  payment: string;
  address: string;
  email: string;
  phone: string;
  total: number;
}

export interface IProductData {
  catalog: IProduct[];
  preview: string | null;
  order: IFormOrder;
  addProduct(productId: string): void;
  deleteProduct(cardId: string): void;
  getProduct(productId: string): IProduct;
}

export interface IFormOrderResult {
  id: string;
  total: number;
}

export type TBasketProduct = Pick<IProduct, 'id' | 'title' | 'description'>;

export type TOrderInfo = Pick<IFormOrder, 'payment' | 'address' | 'email' | 'phone'>;

