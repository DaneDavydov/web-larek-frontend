import { Api, ApiListResponse } from './base/api';
import { IFormOrder, IProduct, IFormOrderResult } from "../types";

export interface IAppAPI {
  getProductList: () => Promise<IProduct[]>;
  getProductItem: (id: string) => Promise<IProduct>;
  orderLots: (order: IFormOrder) => Promise<IFormOrderResult>;
}

export class AppAPI extends Api implements IAppAPI {
  readonly cdn: string;

  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  getProductItem(id: string): Promise<IProduct> {
    return this.get(`/product/${id}`).then((item: IProduct) => ({
      ...item,
      image: this.cdn + item.image,
    }));
  }

  getProductList(): Promise<IProduct[]> {
    return this.get('/product').then((data: ApiListResponse<IProduct>) =>
      data.items.map((item) => ({
        ...item,
        image: this.cdn + item.image,
      }))
    );
  }

  orderLots(order: IFormOrder): Promise<IFormOrderResult> {
    return this.post('/order', order).then((data: IFormOrderResult) => data);
  }
}