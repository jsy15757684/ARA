'use client';

import { ShoppingBag, CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/mock-data';

interface StickyBuyBarProps {
  price: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export default function StickyBuyBar({ price, onAddToCart, onBuyNow }: StickyBuyBarProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-light-beige
                    px-4 py-2.5 safe-bottom">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Price display */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-warm-gray leading-none mb-0.5">결제 금액</p>
          <p className="text-base font-bold text-deep-navy truncate leading-tight">{formatPrice(price)}</p>
        </div>

        {/* Cart button */}
        <button
          onClick={onAddToCart}
          className="flex items-center justify-center gap-1.5 bg-cream border border-deep-navy
                     text-deep-navy font-semibold py-2.5 px-4 rounded-xl text-sm
                     hover:bg-deep-navy hover:text-white transition-all active:scale-[0.98]"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>장바구니</span>
        </button>

        {/* Buy now button */}
        <button
          onClick={onBuyNow}
          className="flex items-center justify-center gap-1.5 btn-primary py-2.5 px-4 flex-1 max-w-[150px] text-sm"
        >
          <CreditCard className="w-4 h-4" />
          <span>바로 구매</span>
        </button>
      </div>
    </div>
  );
}
