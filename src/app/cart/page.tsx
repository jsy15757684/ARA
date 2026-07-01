'use client';

import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/mock-data';
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const router = useRouter();
  
  // Prevent hydration mismatch for localStorage
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="fade-in min-h-screen bg-gray-50 pb-24">
      <div className="bg-deep-navy text-white pt-10 pb-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">장바구니</h1>
        <p className="text-white/70 text-sm">담아두신 상품들을 확인해 보세요</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-10">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">장바구니가 비어있습니다.</h2>
            <p className="text-gray-500 mb-8">매력적인 상품들을 장바구니에 담아보세요.</p>
            <Link 
              href="/"
              className="px-6 py-3 bg-deep-navy text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              쇼핑 계속하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cart Items List */}
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => {
                const itemId = (item as any).id;
                return (
                  <div key={itemId} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-xl relative overflow-hidden shrink-0 border border-gray-200">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900 line-clamp-1">{item.product.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {Object.entries(item.selectedOptions || {}).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                          </p>
                        </div>
                        <button 
                          onClick={() => removeItem(itemId)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(itemId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center text-sm font-medium text-gray-900 border-x border-gray-200">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(itemId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="font-bold text-deep-navy">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">결제 예상 금액</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>총 상품금액</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>총 배송비</span>
                    <span className="font-medium">0원</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>- 전 상품 무료배송</span>
                    <span className="text-soft-gold">0원</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">총 결제금액</span>
                    <span className="text-2xl font-bold text-deep-navy">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-4 bg-deep-navy text-white rounded-xl font-bold text-lg hover:bg-deep-navy/90 transition-colors active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-deep-navy/20"
                >
                  주문하기
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
