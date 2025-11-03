export interface IOrderItem {
  id: number;
  producto: {
    id: number;
    nombre: string;
    precio: number;
    imagen: string;
  };
  cantidad: number;
  precioUnitario: number;
}

export interface IOrder {
  id: number;
  usuario: {
    id: number;
    name: string;
    email: string;
  };
  items: IOrderItem[];
  total: number;
  subtotal: number;
  costoEnvio: number;
  estado: "pending" | "processing" | "completed" | "cancelled";
  fechaCreacion: string;
  telefono: string;
  direccion: string;
  metodoPago: "efectivo" | "tarjeta" | "transferencia";
  notas?: string;
}