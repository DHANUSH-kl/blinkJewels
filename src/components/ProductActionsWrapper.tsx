'use client';

import ProductActions from './ProductActions';

interface Props {
  product: {
    _id: string;
    title: string;
    price: number;
    rentalPrice?: number;
    type: 'buy' | 'rent';
    stock: number;
  };
}

export default function ProductActionsWrapper({ product }: Props) {
  return <ProductActions product={product} />;
}
