'use client';

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { getProductById } from '@/lib/mock-data';
import { useCart } from '@/lib/cart-context';
import ImageSlider from '@/components/product/ImageSlider';
import ProductInfo from '@/components/product/ProductInfo';
import StickyBuyBar from '@/components/product/StickyBuyBar';
import CurationSection from '@/components/home/CurationSection';
import { products } from '@/lib/mock-data';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = getProductById(id);
  const { addItem } = useCart();

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    if (product?.options) {
      for (const option of product.options) {
        if (option.values.length > 0) {
          defaults[option.name] = option.values[0];
        }
      }
    }
    return defaults;
  });
  const [showToast, setShowToast] = useState(false);

  if (!product) {
    notFound();
  }

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = () => {
    addItem(product, selectedOptions);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, selectedOptions);
    alert('구매 페이지로 이동합니다. (데모)');
  };

  // Related products (same category, excluding self)
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="fade-in pb-24">
      {/* Back button */}
      <div className="sticky top-[60px] z-30 bg-warm-beige/80 backdrop-blur-sm px-4 py-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-base text-warm-gray hover:text-deep-navy transition-colors min-h-0"
        >
          <ChevronLeft className="w-5 h-5" />
          돌아가기
        </Link>
      </div>

      {/* Desktop: 2 column, Mobile: stacked */}
      <div className="max-w-7xl mx-auto md:grid md:grid-cols-2 md:gap-8 md:px-4">
        {/* Image */}
        <div className="md:sticky md:top-24 md:self-start md:rounded-2xl md:overflow-hidden">
          <ImageSlider images={product.images} alt={product.name} />
        </div>

        {/* Info */}
        <ProductInfo
          product={product}
          selectedOptions={selectedOptions}
          onOptionChange={handleOptionChange}
        />
      </div>



      {/* Related products */}
      {related.length > 0 && (
        <>
          <div className="h-2 bg-light-beige" />
          <CurationSection
            title="함께 보면 좋은 상품"
            subtitle="이 상품과 잘 어울리는 추천 아이템"
            products={related}
          />
        </>
      )}

      {/* Sticky buy bar */}
      <StickyBuyBar
        price={product.price}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-deep-navy text-white
                        px-6 py-3 rounded-xl shadow-lg animate-bounce text-base font-medium">
          ✓ 장바구니에 담았습니다
        </div>
      )}
    </div>
  );
}
