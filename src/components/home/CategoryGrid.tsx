import { Shirt, Monitor, Apple, Sparkles, Home, Dumbbell } from 'lucide-react';
import Link from 'next/link';

const categories = [
  { name: '패션의류', icon: Shirt, color: 'bg-deep-navy/5', iconColor: 'text-deep-navy' },
  { name: '가전·디지털', icon: Monitor, color: 'bg-blue-50', iconColor: 'text-blue-600' },
  { name: '식품·건강', icon: Apple, color: 'bg-green-50', iconColor: 'text-green-600' },
  { name: '뷰티·향수', icon: Sparkles, color: 'bg-pink-50', iconColor: 'text-pink-500' },
  { name: '홈·리빙', icon: Home, color: 'bg-amber-50', iconColor: 'text-amber-600' },
  { name: '스포츠·레저', icon: Dumbbell, color: 'bg-violet-50', iconColor: 'text-violet-600' },
];

export default function CategoryGrid() {
  return (
    <section className="py-8 px-4 max-w-7xl mx-auto">
      <h2 className="section-title text-center mb-6">카테고리</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-6">
        {categories.map(({ name, icon: Icon, color, iconColor }) => (
          <Link
            key={name}
            href={`/category?cat=${name}`}
            className="flex flex-col items-center gap-2 group min-h-0 min-w-0"
          >
            <div className={`w-16 h-16 md:w-20 md:h-20 ${color} rounded-2xl flex items-center justify-center
                           transition-all group-hover:scale-105 group-hover:shadow-md`}>
              <Icon className={`w-7 h-7 md:w-8 md:h-8 ${iconColor}`} strokeWidth={1.5} />
            </div>
            <span className="text-sm md:text-base font-semibold text-deep-navy text-center">{name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
