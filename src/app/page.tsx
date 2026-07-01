import HeroBanner from '@/components/home/HeroBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import CurationSection from '@/components/home/CurationSection';
import { products, getProductsByTag } from '@/lib/mock-data';

export default function HomePage() {
  const mdPicks = getProductsByTag('MD추천');
  const popular = getProductsByTag('인기');
  const bestItems = getProductsByTag('베스트');

  return (
    <div className="fade-in">
      <HeroBanner />
      <CategoryGrid />

      {/* Divider */}
      <div className="h-2 bg-light-beige" />

      <CurationSection
        title="오늘의 추천"
        subtitle="MD가 직접 엄선한 프리미엄 아이템"
        products={mdPicks}
      />

      {/* Divider */}
      <div className="h-2 bg-light-beige" />

      <CurationSection
        title="인기 급상승"
        subtitle="지금 가장 많이 찾는 상품"
        products={popular}
      />

      {/* Divider */}
      <div className="h-2 bg-light-beige" />

      <CurationSection
        title="주간 베스트"
        subtitle="이번 주 가장 많은 사랑을 받은 아이템"
        products={bestItems}
      />

      {/* Trust section */}
      <section className="py-8 md:py-12 px-4 bg-deep-navy text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Les choses du monde가 특별한 이유</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '100%', label: '정품 보장' },
              { num: '무료', label: '배송 · 교환 · 반품' },
              { num: '당일', label: '빠른 배송' },
              { num: '5만+', label: '만족 후기' },
            ].map(({ num, label }) => (
              <div key={label}>
                <p className="text-2xl md:text-3xl font-bold text-soft-gold mb-2">{num}</p>
                <p className="text-sm md:text-base text-white/80">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
