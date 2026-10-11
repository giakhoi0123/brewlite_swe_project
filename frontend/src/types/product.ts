/** Public catalog contract. price is an integer amount in VND, never formatted text. */
export type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};
