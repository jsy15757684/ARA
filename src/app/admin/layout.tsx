'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, Users, LayoutDashboard, ChevronLeft, Menu, X, MessageSquareText } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/admin' && pathname !== '/admin') return false;
    return pathname?.startsWith(path);
  };

  const navItemClass = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
    ${isActive(path) ? 'bg-soft-gold/20 text-soft-gold' : 'hover:bg-white/10 text-white/70 hover:text-white'}
  `;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-deep-navy text-white p-4 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold tracking-tight">ADMIN CENTER</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-deep-navy text-white flex flex-col shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold tracking-tight">Les choses du monde</h1>
          <p className="text-soft-gold text-xs font-semibold tracking-widest mt-1">ADMIN CENTER</p>
        </div>
        
        <nav className="flex-1 px-4 py-4 md:py-0 md:pb-4 space-y-2 overflow-y-auto">
          <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className={navItemClass('/admin')}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">대시보드</span>
          </Link>
          <Link href="/admin/products" onClick={() => setIsMobileMenuOpen(false)} className={navItemClass('/admin/products')}>
            <Package className="w-5 h-5" />
            <span className="font-medium">상품 관리</span>
          </Link>
          <Link href="/admin/orders" onClick={() => setIsMobileMenuOpen(false)} className={navItemClass('/admin/orders')}>
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">주문 관리</span>
          </Link>
          <Link href="/admin/reviews" onClick={() => setIsMobileMenuOpen(false)} className={navItemClass('/admin/reviews')}>
            <MessageSquareText className="w-5 h-5" />
            <span className="font-medium">리뷰 관리 <span className="ml-2 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">New</span></span>
          </Link>
          <Link href="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className={navItemClass('/admin/users')}>
            <Users className="w-5 h-5" />
            <span className="font-medium">회원 관리</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <Link href="/" className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
            <span>쇼핑몰로 돌아가기</span>
          </Link>
        </div>
      </aside>


      {/* Main Content */}
      <main className="flex-1 w-full overflow-x-hidden md:overflow-y-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
