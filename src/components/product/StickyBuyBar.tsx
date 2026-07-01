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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-light-beige
                    px-4 py-3 md:py-4 safe-bottom">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Price display */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-warm-gray">결제 금액</p>
          <p className="text-xl font-bold text-deep-navy truncate">{formatPrice(price)}</p>
        </div>

        {/* Cart button */}
        <button
          onClick={onAddToCart}
          className="flex items-center justify-center gap-2 bg-cream border-2 border-deep-navy
                     text-deep-navy font-semibold py-3.5 px-5 rounded-xl text-base
                     hover:bg-deep-navy hover:text-white transition-all active:scale-[0.98]"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="hidden sm:inline">장바구니</span>
        </button>

        {/* Buy now button */}
        <button
          onClick={onBuyNow}
          className="flex items-center justify-center gap-2 btn-primary py-3.5 px-6 flex-1 max-w-[200px] text-base"
        >
          <CreditCard className="w-5 h-5" />
          바로 구매
        </button>
      </div>
    </div>
  );
}
