'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Truck, CreditCard, User, Package } from 'lucide-react';
import { formatPrice } from '@/lib/mock-data';
import { useParams } from 'next/navigation';

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          const found = data.find((o: any) => o.id === id);
          setOrder(found);
        }
      } catch (error) {
        console.error('Failed to fetch order details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">불러오는 중...</div>;
  if (!order) return <div className="p-8 text-center text-gray-500">주문을 찾을 수 없습니다.</div>;

  return (
    <div className="fade-in max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">주문 상세 내역</h1>
          <p className="text-gray-500 mt-1">주문번호: {order.id}</p>
        </div>
      </div>

      {/* Exchange/Refund Request Banner */}
      {order.requestType && (
        <div className={`mb-6 p-5 rounded-2xl border flex flex-col gap-2 ${
          order.status.includes('완료') 
            ? 'bg-gray-50 border-gray-200 text-gray-700' 
            : order.requestType === '교환'
              ? 'bg-orange-50 border-orange-200 text-orange-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            <span className="text-lg">[{order.requestType} 신청 건]</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
              order.status.includes('완료') 
                ? 'bg-gray-200 text-gray-600' 
                : order.requestType === '교환' ? 'bg-orange-100 text-orange-800' : 'bg-rose-100 text-rose-800'
            }`}>{order.status}</span>
          </div>
          <p className="text-sm">
            <span className="font-semibold text-gray-700">신청 사유:</span> {order.requestReason || '입력된 사유가 없습니다.'}
          </p>
          
          {/* Quick actions for admin to approve */}
          {!order.status.includes('완료') && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={async () => {
                  try {
                    const nextStatus = order.requestType === '교환' ? '교환완료' : '환불완료';
                    const res = await fetch(`/api/orders/${order.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: nextStatus })
                    });
                    if (res.ok) {
                      alert(`${order.requestType} 처리가 완료되었습니다.`);
                      window.location.reload();
                    }
                  } catch (e) {
                    alert('승인 처리에 실패했습니다.');
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-colors ${
                  order.requestType === '교환' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {order.requestType} 승인 처리
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <Package className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">주문 상품 ({order.items.length}건)</h2>
            </div>
            
            <ul className="divide-y divide-gray-100">
              {order.items.map((item: any, idx: number) => (
                <li key={idx} className="py-4 flex gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                    <Image src={item.image} alt={item.productName} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 line-clamp-1">{item.productName}</p>
                    <p className="text-sm text-gray-500 mt-1">상품코드: {item.productId}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(item.options).map(([k, v]) => (
                        <span key={k} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {k}: {v as string}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">{formatPrice(item.price)}</p>
                    <p className="text-sm text-gray-500 mt-1">수량: {item.quantity}개</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <Truck className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">배송 정보</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex">
                <span className="w-24 text-gray-500">배송 상태</span>
                <span className="font-bold text-indigo-600">{order.status}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500">배송지</span>
                <span className="text-gray-900">{order.shippingAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer & Payment */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <User className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">주문자 정보</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">이름</span>
                <span className="font-medium text-gray-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">연락처</span>
                <span className="font-medium text-gray-900">{order.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">주문일시</span>
                <span className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">결제 정보</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">상품 총액</span>
                <span className="text-gray-900">{formatPrice(order.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">배송비</span>
                <span className="text-gray-900">무료</span>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-900">총 결제금액</span>
                <span className="text-xl font-bold text-red-500">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
