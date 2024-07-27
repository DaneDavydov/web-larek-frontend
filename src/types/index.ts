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
  basket: Map<string, number>;
}

export interface IFormOrderResult {
  id: string;
  total: number;
}

export type TBasketProduct = Pick<IProduct, 'id' | 'title' | 'price'>;

export type TOrderInfo = Pick<IFormOrder, 'payment' | 'address' | 'email' | 'phone'>;

export type FormErrors = Partial<Record<keyof IFormOrder, string>>;

