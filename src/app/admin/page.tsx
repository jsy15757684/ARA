'use client';

import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  if (!stats || !stats.metrics) {
    return <div className="p-8 text-red-500">Failed to load statistics.</div>;
  }

  const { metrics, salesTrend, bestSellers } = stats;

  const maxRevenue = Math.max(...salesTrend.map((t: any) => t.revenue), 1); // Avoid division by zero

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-deep-navy">대시보드</h1>
        <p className="text-warm-gray mt-2">쇼핑몰의 핵심 지표와 매출 현황을 한눈에 파악하세요.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="총 누적 매출" 
          value={`${metrics.totalRevenue.toLocaleString()}원`} 
          icon={<DollarSign className="w-6 h-6 text-emerald-500" />} 
          trend="+12%" 
        />
        <StatCard 
          title="총 주문 건수" 
          value={`${metrics.totalOrders.toLocaleString()}건`} 
          icon={<ShoppingCart className="w-6 h-6 text-blue-500" />} 
          trend="+5%" 
        />
        <StatCard 
          title="가입 회원 수" 
          value={`${metrics.totalUsers.toLocaleString()}명`} 
          icon={<Users className="w-6 h-6 text-purple-500" />} 
          trend="+2 명" 
        />
        <StatCard 
          title="평균 객단가" 
          value={`${metrics.averageOrderValue.toLocaleString()}원`} 
          icon={<Activity className="w-6 h-6 text-orange-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (Tailwind Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-deep-navy flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-soft-gold" />
              최근 7일 매출 추이
            </h2>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-2 h-64 mt-auto">
            {salesTrend.map((day: any, idx: number) => {
              const heightPercentage = Math.max((day.revenue / maxRevenue) * 100, 2); // Minimum 2% height
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <div className="relative w-full flex justify-center h-full items-end">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-deep-navy text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-opacity pointer-events-none z-10">
                      {day.revenue.toLocaleString()}원
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-deep-navy" />
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full max-w-[40px] bg-gradient-to-t from-soft-gold/40 to-soft-gold rounded-t-lg transition-all duration-500 group-hover:opacity-80"
                      style={{ height: `${heightPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-3 font-medium">{day.date}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-deep-navy flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-soft-gold" />
            인기 상품 Top 5
          </h2>
          <div className="space-y-5">
            {bestSellers.length > 0 ? (
              bestSellers.map((product: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-soft-gold/10 text-soft-gold font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-deep-navy truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{product.revenue.toLocaleString()}원 매출</p>
                  </div>
                  <div className="text-sm font-bold bg-gray-50 px-2 py-1 rounded-md text-gray-600">
                    {product.quantity}개
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-10 text-sm">
                아직 판매된 상품이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-deep-navy mt-2 tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
  );
}
