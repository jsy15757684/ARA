'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

const tabs = [
  { href: '/', label: '홈', icon: Home },
  { href: '/category', label: '카테고리', icon: LayoutGrid },
  { href: '/cart', label: '장바구니', icon: ShoppingBag },
  { href: '/mypage', label: '마이페이지', icon: User },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-light-beige safe-bottom">
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          const isCart = href === '/cart';

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-colors min-h-0 min-w-0 ${
                isActive
                  ? 'text-soft-gold'
                  : 'text-warm-gray hover:text-deep-navy'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.8} />
                {isCart && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4.5 h-4.5 bg-accent-red text-white text-[0.6rem]
                                 font-bold rounded-full flex items-center justify-center leading-none">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className={`text-[0.7rem] font-medium ${isActive ? 'font-bold' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
