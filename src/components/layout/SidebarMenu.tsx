'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, ChevronDown, ChevronRight, User, Settings, ShoppingBag } from 'lucide-react';
import { categoryTree } from '@/lib/mock-data';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(prev => (prev === categoryName ? null : categoryName));
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-deep-navy/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-64 max-w-[85vw] bg-surface z-[70] shadow-2xl
                    transform transition-transform duration-300 ease-in-out flex flex-col
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-light-beige">
          <Link href="/" className="flex flex-col items-start min-h-0" onClick={onClose}>
            <span className="text-xl font-bold tracking-tight text-deep-navy">Les choses du monde</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-xl hover:bg-cream transition-colors"
            aria-label="메뉴 닫기"
          >
            <X className="w-6 h-6 text-deep-navy" />
          </button>
        </div>

        {/* Quick Links */}
        <div className="flex items-center justify-around py-4 px-2 border-b border-light-beige bg-cream/50">
          <Link href="/cart" className="flex flex-col items-center gap-1 min-h-0 group" onClick={onClose}>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-deep-navy" />
            </div>
            <span className="text-sm font-medium text-deep-navy">장바구니</span>
          </Link>
          <Link href="/mypage" className="flex flex-col items-center gap-1 min-h-0 group" onClick={onClose}>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <User className="w-5 h-5 text-deep-navy" />
            </div>
            <span className="text-sm font-medium text-deep-navy">마이페이지</span>
          </Link>
        </div>

        {/* Categories (Accordion Tree) */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-5 py-3">
            <h2 className="text-sm font-bold text-warm-gray tracking-widest mb-1">카테고리 전체보기</h2>
          </div>
          
          <ul className="flex flex-col">
            {categoryTree.map((cat) => {
              const isExpanded = expandedCategory === cat.name;
              
              return (
                <li key={cat.name} className="border-b border-light-beige/50 last:border-0">
                  <button
                    onClick={() => toggleCategory(cat.name)}
                    className="w-full flex items-center justify-between px-5 py-4 min-h-[56px] hover:bg-cream transition-colors text-left"
                    aria-expanded={isExpanded}
                  >
                    <span className={`text-lg font-semibold ${isExpanded ? 'text-soft-gold' : 'text-deep-navy'}`}>
                      {cat.name}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 text-soft-gold' : 'text-warm-gray'
                      }`}
                    />
                  </button>
                  
                  {/* Subcategories */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out bg-cream/30 ${
                      isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <ul className="py-2">
                      {/* "전체보기" link for the main category */}
                      <li>
                        <Link
                          href={`/category?cat=${encodeURIComponent(cat.name)}`}
                          onClick={onClose}
                          className="flex items-center justify-between px-5 py-3 pl-8 min-h-[48px] hover:bg-cream text-base font-medium text-deep-navy transition-colors"
                        >
                          {cat.name} 전체보기
                          <ChevronRight className="w-4 h-4 text-warm-gray/50" />
                        </Link>
                      </li>
                      {cat.subcategories.map((sub) => (
                        <li key={sub}>
                          <Link
                            href={`/category?cat=${encodeURIComponent(cat.name)}&sub=${encodeURIComponent(sub)}`}
                            onClick={onClose}
                            className="flex items-center justify-between px-5 py-3 pl-8 min-h-[48px] hover:bg-cream text-base text-warm-gray hover:text-deep-navy transition-colors"
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
