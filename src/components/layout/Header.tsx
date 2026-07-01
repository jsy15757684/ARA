'use client';

import Link from 'next/link';
import { Search, ShoppingBag, User, Menu } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarMenu from '@/components/layout/SidebarMenu';

export default function Header() {
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check for auth_session cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };
    
    const sessionCookie = getCookie('auth_session');
    if (sessionCookie) {
      try {
        // Handle UTF-8 decoding properly from base64
        const decodedString = decodeURIComponent(escape(atob(decodeURIComponent(sessionCookie))));
        const decoded = JSON.parse(decodedString);
        setUser(decoded);
      } catch (e) {
        console.error('Failed to parse session cookie');
      }
    }
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.reload();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const executeSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/category?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 한글 입력 중(IME composition) Enter 키 입력 시 중복/잘림 방지
      if (e.nativeEvent.isComposing) return;
      executeSearch();
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface/95 backdrop-blur-md shadow-sm py-2'
          : 'bg-surface py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-cream transition-colors"
            aria-label="카탈로그 메뉴"
          >
            <Menu className="w-6 h-6 md:w-7 md:h-7 text-deep-navy" />
          </button>
          
          {/* Logo */}
          <Link href="/" className="flex flex-col items-start min-h-0">
          <span className="text-xl md:text-2xl font-bold tracking-tight text-deep-navy">
            Les choses du monde
          </span>
        </Link>
        </div>

        {/* Search bar - desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <button 
              onClick={executeSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-warm-gray hover:text-deep-navy transition-colors"
              aria-label="검색 실행"
            >
              <Search className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="찾고 싶은 상품을 검색해 보세요"
              className="w-full pl-12 pr-4 py-3 bg-cream rounded-xl border border-light-beige
                         text-base text-deep-navy placeholder:text-warm-gray/60
                         focus:outline-none focus:border-soft-gold focus:ring-2 focus:ring-soft-gold/20
                         transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile search */}
          <button 
            onClick={() => {
              const term = prompt('검색어를 입력하세요:');
              if (term && term.trim()) {
                router.push(`/category?search=${encodeURIComponent(term.trim())}`);
              }
            }}
            className="md:hidden p-2 rounded-xl hover:bg-cream transition-colors" 
            aria-label="검색"
          >
            <Search className="w-6 h-6 text-deep-navy" />
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 rounded-xl hover:bg-cream transition-colors min-h-0"
            aria-label="장바구니"
          >
            <ShoppingBag className="w-6 h-6 text-deep-navy" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-red text-white text-xs
                             font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* My page / Login - desktop */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/mypage" className="text-sm font-medium text-deep-navy hover:text-soft-gold">
                  <span className="font-bold">{user.name}</span>님
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-xs font-semibold px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-bold text-deep-navy hover:text-soft-gold px-3 py-2 rounded-xl hover:bg-cream transition-all duration-300">
                  로그인
                </Link>
                <Link href="/register" className="text-sm font-bold px-4 py-2 bg-gradient-to-r from-soft-gold to-yellow-600 text-deep-navy rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <SidebarMenu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </header>
  );
}
