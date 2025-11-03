export interface ICartItem {
  product: {
    id: number;
    nombre: string;
    precio: number;
    imagen: string;
    stock: number;
  };
  quantity: number;
}

export interface ICart {
  items: ICartItem[];
  total: number;
}