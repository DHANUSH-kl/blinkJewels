'use client';

import dynamic from 'next/dynamic';

const WishlistToggle = dynamic(() => import('@/components/WishlistToggle'), {
  ssr: false,
});

export default function WishlistToggleWrapper({ productId, initialState }: { productId: string, initialState: boolean }) {
  return <WishlistToggle productId={productId} initialState={initialState} />;
}
