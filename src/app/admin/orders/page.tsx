'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/mock-data';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activePreset, setActivePreset] = useState('all');

  const handleQuickDateSelect = (presetName: string, days: number | 'all') => {
    setActivePreset(presetName);
    if (days === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    const formatDate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  };
  
  // Custom Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      alert('상태 변경에 실패했습니다.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/orders/${deleteTarget}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== deleteTarget));
        setDeleteTarget(null);
      }
    } catch (error) {
      alert('오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    // 1. Search term filter
    const matchesSearch = o.id.includes(searchTerm) || o.customerName.includes(searchTerm);
    if (!matchesSearch) return false;

    // 2. Date range filter
    if (o.createdAt) {
      const orderDate = new Date(o.createdAt).getTime();
      if (startDate) {
        const start = new Date(startDate).getTime();
        if (orderDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end.getTime()) return false;
      }
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case '결제대기': return 'bg-yellow-100 text-yellow-800';
      case '결제완료': return 'bg-blue-100 text-blue-800';
      case '배송준비': return 'bg-purple-100 text-purple-800';
      case '배송중': return 'bg-indigo-100 text-indigo-800';
      case '배송완료': return 'bg-green-100 text-green-800';
      case '교환신청': return 'bg-orange-100 text-orange-800';
      case '교환완료': return 'bg-teal-100 text-teal-800';
      case '환불신청': return 'bg-rose-100 text-rose-800';
      case '환불완료': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = ['결제대기', '결제완료', '배송준비', '배송중', '배송완료', '교환신청', '교환완료', '환불신청', '환불완료'];

  return (
    <div className="fade-in max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">주문 관리</h1>
        <p className="text-gray-500 mt-1">최근 들어온 주문 내역을 관리합니다.</p>
      </div>

      {/* Filters/Search */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="주문번호, 주문자명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-soft-gold text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-gray-600">주문일자:</span>
          {/* Presets */}
          <div className="flex gap-1.5 mr-2">
            {[
              { label: '오늘', days: 0 },
              { label: '1주일', days: 7 },
              { label: '1개월', days: 30 },
              { label: '3개월', days: 90 },
              { label: '전체', days: 'all' }
            ].map((btn: { label: string; days: number | 'all' }) => (
              <button
                key={btn.label}
                onClick={() => handleQuickDateSelect(btn.label, btn.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activePreset === btn.label
                    ? 'bg-deep-navy border-deep-navy text-white shadow-sm'
                    : 'bg-white border-gray-200 text-deep-navy hover:bg-gray-50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setActivePreset('');
            }}
            className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-soft-gold"
          />
          <span className="text-gray-400">~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setActivePreset('');
            }}
            className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-soft-gold"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-red-500 hover:underline font-semibold ml-2"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600 text-sm">주문일시 / 번호</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">주문자</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">결제금액</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">상태 관리</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">데이터를 불러오는 중입니다...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">검색된 주문이 없습니다.</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.id}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{order.items[0].productName} {order.items.length > 1 ? `외 ${order.items.length - 1}건` : ''}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.customerPhone}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(order.totalPrice)}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.items.length}개 상품</p>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-sm font-medium px-3 py-1.5 rounded-full border-none cursor-pointer outline-none focus:ring-2 focus:ring-soft-gold/30 transition-colors ${getStatusColor(order.status)}`}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt} className="bg-white text-gray-900">{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-2 text-gray-400 hover:text-deep-navy hover:bg-gray-100 rounded-lg transition-colors"
                          title="상세 보기"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(order.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="주문 삭제"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">주문 삭제</h3>
            <p className="text-gray-600 text-sm mb-6">
              정말로 주문 <span className="font-bold text-gray-900">{deleteTarget}</span> 내역을 삭제하시겠습니까?<br/>
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? '삭제 중...' : '삭제하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
