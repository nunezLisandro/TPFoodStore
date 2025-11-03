export interface IProduct {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: {
    id: number;
    nombre: string;
  };
  imagen: string;
  disponible: boolean;
}