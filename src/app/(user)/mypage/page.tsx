'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Package, Truck, CheckCircle, ChevronRight, User } from 'lucide-react';
import { formatPrice } from '@/lib/mock-data';

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Exchange / Refund State
  const [requestTarget, setRequestTarget] = useState<{orderId: string, type: '교환' | '환불'} | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const handleSubmitRequest = async () => {
    if (!requestTarget || !requestReason.trim()) return;
    setIsSubmittingRequest(true);
    try {
      const newStatus = requestTarget.type === '교환' ? '교환신청' : '환불신청';
      const res = await fetch(`/api/orders/${requestTarget.orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          requestType: requestTarget.type,
          requestReason: requestReason,
        }),
      });
      if (res.ok) {
        alert(`${requestTarget.type} 신청이 완료되었습니다.`);
        setRequestTarget(null);
        setRequestReason('');
        fetchOrders();
      } else {
        alert('신청에 실패했습니다.');
      }
    } catch (e) {
      alert('오류가 발생했습니다.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  useEffect(() => {
    // 1. Check User Session
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };
    
    const sessionCookie = getCookie('auth_session');
    if (!sessionCookie) {
      alert('로그인이 필요한 페이지입니다.');
      router.push('/login');
      return;
    }

    try {
      const decodedString = decodeURIComponent(escape(atob(sessionCookie)));
      const decoded = JSON.parse(decodedString);
      setUser(decoded);
      fetchOrders();
    } catch (e) {
      router.push('/login');
    }
  }, [router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/user/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case '결제대기': return 'bg-amber-100 text-amber-700';
      case '결제완료': return 'bg-blue-100 text-blue-700';
      case '배송준비': return 'bg-indigo-100 text-indigo-700';
      case '배송중': return 'bg-purple-100 text-purple-700';
      case '배송완료': return 'bg-green-100 text-green-700';
      case '교환신청': return 'bg-orange-100 text-orange-700';
      case '교환완료': return 'bg-teal-100 text-teal-700';
      case '환불신청': return 'bg-rose-100 text-rose-700';
      case '환불완료': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case '결제대기':
      case '결제완료': return <Package className="w-5 h-5" />;
      case '배송준비':
      case '배송중': return <Truck className="w-5 h-5" />;
      case '배송완료':
      case '교환완료':
      case '환불완료': return <CheckCircle className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  if (!user) return null; // Avoid flicker before redirect

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-deep-navy text-white pt-12 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">마이페이지</h1>
          <p className="text-soft-gold text-sm md:text-base opacity-90">Les choses du monde와 함께하는 특별한 여정</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 flex items-center gap-6 mb-8 border border-gray-100">
          <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center shrink-0 border border-light-beige">
            <User className="w-10 h-10 text-deep-navy" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name} <span className="text-lg font-medium text-gray-500">고객님</span></h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">최근 주문 내역</h3>
            <span className="text-sm font-medium text-deep-navy bg-cream px-3 py-1 rounded-full">
              총 {orders.length}건
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">주문 내역을 불러오는 중입니다...</div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg text-gray-500 font-medium">아직 주문하신 내역이 없습니다.</p>
              <button 
                onClick={() => router.push('/')}
                className="mt-6 px-6 py-2.5 bg-deep-navy text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                쇼핑하러 가기
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 주문
                      </p>
                      <p className="text-xs text-gray-500 font-medium">주문번호: {order.id}</p>
                    </div>
                    <button 
                      onClick={() => alert('주문 상세 및 영수증 페이지 기능은 준비 중입니다. (데모)')}
                      className="text-sm font-semibold text-deep-navy hover:text-soft-gold flex items-center self-start md:self-auto"
                    >
                      상세보기 <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                      <span className="text-sm text-gray-500 font-medium">
                        {order.status === '배송중' ? '내일 도착 예정' : order.status === '배송완료' ? '배송이 완료되었습니다.' : '결제 확인 중입니다.'}
                      </span>
                    </div>

                    <div className="space-y-6">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex gap-4 md:gap-6">
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                            <Image src={item.image} alt={item.productName} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base md:text-lg font-bold text-gray-900 truncate mb-1">{item.productName}</h4>
                            <div className="text-sm text-gray-500 mb-2">
                              {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                              <span className="mx-2">|</span>
                              {item.quantity}개
                            </div>
                            <p className="text-lg font-bold text-deep-navy">{formatPrice(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    {['결제대기', '결제완료', '배송준비', '배송중', '배송완료'].includes(order.status) && (
                      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                        {/* Before shipping: immediate cancellation/refund */}
                        {['결제대기', '결제완료', '배송준비'].includes(order.status) && (
                          <button
                            onClick={async () => {
                              if (confirm('주문을 취소하시겠습니까? 즉시 환불 처리됩니다.')) {
                                try {
                                  const res = await fetch(`/api/orders/${order.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: '환불완료' })
                                  });
                                  if (res.ok) {
                                    alert('주문 취소 및 환불 처리가 완료되었습니다.');
                                    fetchOrders();
                                  } else {
                                    alert('처리에 실패했습니다.');
                                  }
                                } catch (e) {
                                  alert('오류가 발생했습니다.');
                                }
                              }
                            }}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
                          >
                            주문 취소 (즉시 환불)
                          </button>
                        )}

                        {/* After shipping: exchange/refund request (requires approval) */}
                        {['배송중', '배송완료'].includes(order.status) && (
                          <>
                            <button
                              onClick={() => setRequestTarget({ orderId: order.id, type: '교환' })}
                              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                              교환 신청
                            </button>
                            <button
                              onClick={() => setRequestTarget({ orderId: order.id, type: '환불' })}
                              className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
                            >
                              환불 신청
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exchange/Refund Modal */}
      {requestTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{requestTarget.type} 신청</h3>
            <p className="text-gray-500 text-xs mb-4">주문번호: {requestTarget.orderId}</p>
            
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {requestTarget.type} 사유를 입력해 주세요.
            </label>
            <textarea
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              placeholder="예: 사이즈가 너무 작습니다. / 상품이 파손되어 배송되었습니다."
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-soft-gold outline-none text-sm resize-none mb-6"
              rows={4}
            />
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setRequestTarget(null);
                  setRequestReason('');
                }}
                disabled={isSubmittingRequest}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
              >
                취소
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={isSubmittingRequest || !requestReason.trim()}
                className="px-5 py-2 bg-deep-navy text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {isSubmittingRequest ? '신청 중...' : '신청하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
