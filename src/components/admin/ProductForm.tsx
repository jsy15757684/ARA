'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { Product, CategoryType, categories } from '@/lib/mock-data';

interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>(
    initialData || {
      name: '',
      brand: '',
      category: '패션의류',
      price: 0,
      originalPrice: 0,
      discountRate: 0,
      image: '/images/products/blazer.png',
      images: ['/images/products/blazer.png'],
      description: '',
      specs: {},
      options: [],
      tags: [],
      rating: 5.0,
      reviewCount: 0,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isEditing = !!initialData;
    const url = isEditing ? `/api/products/${initialData.id}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(isEditing ? '수정되었습니다.' : '등록되었습니다.');
        router.push('/admin/products');
        router.refresh();
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (error) {
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, [key]: value },
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        setFormData(prev => ({
          ...prev,
          image: result.url,
          images: [result.url]
        }));
      } else {
        alert(result.error || '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      alert('오류가 발생했습니다.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!formData.name) {
      alert('상품명을 먼저 입력해주세요.');
      return;
    }
    
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, category: formData.category }),
      });
      
      if (res.ok) {
        const { description, tags } = await res.json();
        
        // Typewriter effect
        setFormData(prev => ({
          ...prev,
          tags,
          description: '' // Clear description first
        }));
        
        let i = 0;
        const timer = setInterval(() => {
          setFormData(prev => ({
            ...prev,
            description: description.substring(0, i + 1)
          }));
          i++;
          if (i >= description.length) {
            clearInterval(timer);
            setAiLoading(false);
          }
        }, 15);
        
        // We don't setAiLoading(false) here, we wait for typewriter to finish
        return; 

      } else {
        alert('AI 생성에 실패했습니다.');
        setAiLoading(false);
      }
    } catch (error) {
      alert('오류가 발생했습니다.');
      setAiLoading(false);
    }
  };

  const handleOriginalPriceChange = (val: number) => {
    const discountRate = formData.discountRate || 0;
    const calculatedPrice = discountRate > 0 
      ? Math.round(val * (1 - discountRate / 100)) 
      : (formData.price || 0);

    setFormData(prev => ({
      ...prev,
      originalPrice: val,
      price: calculatedPrice
    }));
  };

  const handleDiscountRateChange = (val: number) => {
    const originalPrice = formData.originalPrice || 0;
    const calculatedPrice = originalPrice > 0 
      ? Math.round(originalPrice * (1 - val / 100)) 
      : (formData.price || 0);

    setFormData(prev => ({
      ...prev,
      discountRate: val,
      price: calculatedPrice
    }));
  };

  const handlePriceChange = (val: number) => {
    const originalPrice = formData.originalPrice || 0;
    const calculatedDiscountRate = (originalPrice > 0 && originalPrice > val)
      ? Math.round(((originalPrice - val) / originalPrice) * 100)
      : 0;

    setFormData(prev => ({
      ...prev,
      price: val,
      discountRate: calculatedDiscountRate
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {initialData ? '상품 수정' : '신규 상품 등록'}
          </h1>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-deep-navy text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-deep-navy/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {loading ? '저장 중...' : '저장하기'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">기본 정보</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">브랜드명</label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-soft-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as CategoryType })}
                  className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-soft-gold"
                >
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-soft-gold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">상세 설명</label>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors disabled:opacity-70 disabled:cursor-wait shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {aiLoading ? 'AI 작성 중...' : '✨ AI 자동 작성'}
                </button>
              </div>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className={`w-full p-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-soft-gold resize-none transition-colors ${aiLoading ? 'border-indigo-300 bg-indigo-50/30 animate-pulse' : 'border-transparent'}`}
                placeholder={aiLoading ? 'AI가 상품에 딱 맞는 매력적인 문구를 고민하고 있습니다...' : '상품 설명을 입력하세요'}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">가격 정보</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">판매가 (원)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={e => handlePriceChange(Number(e.target.value))}
                  className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-soft-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">정가 (원)</label>
                <input
                  type="number"
                  required
                  value={formData.originalPrice}
                  onChange={e => handleOriginalPriceChange(Number(e.target.value))}
                  className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-soft-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">할인율 (%)</label>
                <input
                  type="number"
                  value={formData.discountRate}
                  onChange={e => handleDiscountRateChange(Number(e.target.value))}
                  className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-soft-gold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Media & Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">대표 이미지</h2>
            
            <div className="space-y-4">
              <div className="relative border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors group aspect-square flex flex-col items-center justify-center">
                {formData.image ? (
                  <>
                    <img src={formData.image} alt="미리보기" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium">사진 변경하기</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-12 h-12 mb-3 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {uploadingImage ? '업로드 중...' : '클릭하여 이미지 업로드'}
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG (최대 5MB)</p>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                  title="이미지 업로드"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">또는 이미지 URL 직접 입력</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value, images: [e.target.value] })}
                  className="w-full p-2.5 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-soft-gold text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">태그 설정</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SNS 마케팅 태그 (쉼표로 구분)</label>
              <input
                type="text"
                value={formData.tags?.join(', ')}
                onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                className={`w-full p-3 bg-gray-50 rounded-xl border text-sm transition-colors focus:ring-2 focus:ring-soft-gold ${aiLoading ? 'border-purple-300 bg-purple-50/30 animate-pulse' : 'border-transparent'}`}
                placeholder={aiLoading ? 'AI 태그 추출 중...' : 'MD추천, 인기, 신상품...'}
              />
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md border border-gray-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
