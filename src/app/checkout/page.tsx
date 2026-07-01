'use client';

import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/mock-data';
import { CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient: '',
    phone: '',
    address: '',
    memo: ''
  });

  useEffect(() => {
    setMounted(true);
    // Redirect if cart is empty after mount
    if (items.length === 0) {
      // Small timeout to avoid redirecting during SSR mismatch, but logic relies on mount
    }
  }, [items]);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">결제할 상품이 없습니다.</h2>
        <p className="text-gray-500 mb-6">장바구니에 상품을 담은 후 결제를 진행해주세요.</p>
        <Link href="/" className="px-6 py-3 bg-deep-navy text-white rounded-xl font-medium">
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipient || !formData.phone || !formData.address) {
      alert('필수 배송지 정보를 모두 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: formData.address,
          customerName: formData.recipient,
          customerPhone: formData.phone,
          items: items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            options: item.selectedOptions,
            image: item.product.image
          })),
          totalPrice
        })
      });

      if (res.ok) {
        clearCart();
        alert('결제가 완료되었습니다! (가상 결제)');
        router.push('/mypage');
      } else {
        const data = await res.json();
        alert(data.error || '결제 처리에 실패했습니다. 로그인을 확인해주세요.');
        if (res.status === 401) {
          router.push('/login');
        }
      }
    } catch (error) {
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-200 sticky top-[60px] z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium text-sm">
            <ChevronLeft className="w-5 h-5" />
            이전으로
          </button>
          <h1 className="text-lg font-bold text-gray-900">주문 / 결제</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Form Details */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Delivery Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-deep-navy text-white flex items-center justify-center text-xs">1</span>
                배송지 정보
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">수령인 *</label>
                    <input 
                      type="text" 
                      name="recipient"
                      required
                      value={formData.recipient}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-deep-navy focus:ring-1 focus:ring-deep-navy transition-colors"
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">연락처 *</label>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-deep-navy focus:ring-1 focus:ring-deep-navy transition-colors"
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">배송 주소 *</label>
                  <input 
                    type="text" 
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-deep-navy focus:ring-1 focus:ring-deep-navy transition-colors"
                    placeholder="도로명 주소 또는 지번 주소"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">배송 메모 (선택)</label>
                  <input 
                    type="text" 
                    name="memo"
                    value={formData.memo}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-deep-navy focus:ring-1 focus:ring-deep-navy transition-colors"
                    placeholder="문 앞에 두고 가주세요"
                  />
                </div>
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-deep-navy text-white flex items-center justify-center text-xs">2</span>
                주문 상품 ({items.length}개)
              </h2>
              
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 relative overflow-hidden shrink-0">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{item.product.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {Object.entries(item.selectedOptions || {}).map(([k,v]) => `${v}`).join(' / ')} 
                        <span className="mx-2">|</span> {item.quantity}개
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold text-gray-900">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method (Mock) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-deep-navy text-white flex items-center justify-center text-xs">3</span>
                결제 수단
              </h2>
              
              <div className="p-4 border-2 border-deep-navy bg-deep-navy/5 rounded-xl flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-deep-navy" />
                  <span className="font-bold text-deep-navy">가상 테스트 결제 (Demo)</span>
                </div>
                <span className="text-xs text-gray-500">수수료 무료</span>
              </div>
              <p className="text-xs text-gray-400 mt-3 ml-1">
                * 데모 버전이므로 실제 카드 결제가 연동되지 않으며 바로 결제가 완료됩니다.
              </p>
            </div>
          </div>

          {/* Right Column: Checkout Sticky Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">최종 결제 금액</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>총 상품금액</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>배송비</span>
                  <span className="font-medium">0원</span>
                </div>
              </div>

              <div className="border-t border-gray-200 border-dashed pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-gray-900">결제금액</span>
                  <span className="text-3xl font-bold text-red-500">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-deep-navy text-white rounded-xl font-bold text-lg hover:bg-deep-navy/90 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait shadow-md shadow-deep-navy/20"
              >
                {loading ? '결제 처리 중...' : `${formatPrice(totalPrice)} 결제하기`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
