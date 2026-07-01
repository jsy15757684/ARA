'use client';

import { useState, useEffect } from 'react';
import { Sparkles, MessageSquareText, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [generatedReplies, setGeneratedReplies] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activePreset, setActivePreset] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'replied'>('all');

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

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReply = async (review: any) => {
    setAnalyzingId(review.id);
    try {
      const res = await fetch('/api/ai/review-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: review.content,
          rating: review.rating,
          customerName: review.customerName,
          productName: review.productName
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedReplies(prev => ({ ...prev, [review.id]: data.reply }));
      }
    } catch (error) {
      console.error('Failed to generate reply', error);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleSubmitReply = async (reviewId: string) => {
    setSubmittingId(reviewId);
    try {
      const res = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reviewId,
          reply: generatedReplies[reviewId]
        })
      });
      if (res.ok) {
        await fetchReviews();
        // Clear generated reply from state since it's now saved
        setGeneratedReplies(prev => {
          const next = { ...prev };
          delete next[reviewId];
          return next;
        });
      }
    } catch (error) {
      console.error('Failed to submit reply', error);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleBatchGenerate = async () => {
    setIsBatchGenerating(true);
    const pendingReviews = reviews.filter(r => r.status === 'pending' && !generatedReplies[r.id]);
    
    for (const review of pendingReviews) {
      setAnalyzingId(review.id);
      try {
        const res = await fetch('/api/ai/review-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: review.content,
            rating: review.rating,
            customerName: review.customerName,
            productName: review.productName
          })
        });
        const data = await res.json();
        if (data.success) {
          setGeneratedReplies(prev => ({ ...prev, [review.id]: data.reply }));
        }
      } catch (error) {
        console.error('Failed to generate reply', error);
      }
    }
    setAnalyzingId(null);
    setIsBatchGenerating(false);
  };

  const handleBatchSubmit = async () => {
    setIsBatchSubmitting(true);
    const idsToSubmit = Object.keys(generatedReplies);
    
    for (const reviewId of idsToSubmit) {
      setSubmittingId(reviewId);
      try {
        const res = await fetch('/api/reviews', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: reviewId,
            reply: generatedReplies[reviewId]
          })
        });
        if (res.ok) {
          setGeneratedReplies(prev => {
            const next = { ...prev };
            delete next[reviewId];
            return next;
          });
        }
      } catch (error) {
        console.error('Failed to submit reply', error);
      }
    }
    await fetchReviews();
    setSubmittingId(null);
    setIsBatchSubmitting(false);
  };

  const filteredReviews = reviews.filter(review => {
    // 1. Status Filter
    if (statusFilter !== 'all' && review.status !== statusFilter) return false;

    // 2. Date range filter
    if (!review.createdAt) return true;
    const reviewDate = new Date(review.createdAt).getTime();
    
    if (startDate) {
      const start = new Date(startDate).getTime();
      if (reviewDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (reviewDate > end.getTime()) return false;
    }
    return true;
  });

  if (loading) {
    return <div className="p-8">Loading reviews...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-deep-navy">리뷰 관리</h1>
          <p className="text-warm-gray mt-2">고객 리뷰를 확인하고 AI를 활용해 답변을 작성하세요.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBatchGenerate}
            disabled={isBatchGenerating || reviews.filter(r => r.status === 'pending' && !generatedReplies[r.id]).length === 0}
            className="bg-white border border-soft-gold text-deep-navy px-4 py-2 rounded-lg text-sm font-bold hover:bg-soft-gold/10 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isBatchGenerating ? <div className="w-4 h-4 border-2 border-deep-navy/30 border-t-deep-navy rounded-full animate-spin" /> : <Sparkles className="w-4 h-4 text-soft-gold" />}
            일괄 AI 답변 생성
          </button>
          <button
            onClick={handleBatchSubmit}
            disabled={isBatchSubmitting || Object.keys(generatedReplies).length === 0}
            className="bg-deep-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isBatchSubmitting ? '등록 중...' : '일괄 답변 등록'}
          </button>
        </div>
      </div>

      {/* Filters (Date & Status) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
        {/* Date Filter Row */}
        <div className="flex flex-wrap items-center gap-4 border-b border-gray-50 pb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-deep-navy">조회 기간:</span>
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
              className="px-3 py-2 bg-gray-50 rounded-xl border border-light-beige text-sm focus:outline-none focus:ring-2 focus:ring-soft-gold"
            />
            <span className="text-gray-400">~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setActivePreset('');
              }}
              className="px-3 py-2 bg-gray-50 rounded-xl border border-light-beige text-sm focus:outline-none focus:ring-2 focus:ring-soft-gold"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setActivePreset('all');
              }}
              className="text-xs text-red-500 hover:underline font-semibold"
            >
              필터 초기화
            </button>
          )}
        </div>

        {/* Status Filter Row */}
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-deep-navy">답변 상태:</span>
          <div className="flex gap-1.5">
            {[
              { label: '전체', value: 'all' },
              { label: '미답변', value: 'pending' },
              { label: '답변완료', value: 'replied' }
            ].map(btn => (
              <button
                key={btn.value}
                onClick={() => setStatusFilter(btn.value as any)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  statusFilter === btn.value
                    ? 'bg-deep-navy border-deep-navy text-white shadow-sm'
                    : 'bg-white border-gray-200 text-deep-navy hover:bg-gray-50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-100">
            조회된 리뷰가 없습니다.
          </div>
        ) : (
          filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{review.customerName}</span>
                  <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  {review.status === 'replied' ? (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> 답변완료
                    </span>
                  ) : (
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> 미답변
                    </span>
                  )}
                </div>
                <div className="text-sm text-deep-navy font-medium mt-1">[{review.productName}]</div>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-5 h-5 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="bg-gray-50 p-4 rounded-xl text-gray-700 leading-relaxed">
              {review.content}
            </div>

            {/* Actions & Reply Area */}
            {review.status === 'replied' ? (
              <div className="bg-soft-gold/10 p-4 rounded-xl border border-soft-gold/30">
                <div className="flex items-center gap-2 text-deep-navy font-bold mb-2">
                  <MessageSquareText className="w-4 h-4" />
                  관리자 답변
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{review.reply}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {generatedReplies[review.id] ? (
                  <div className="border border-deep-navy/20 rounded-xl overflow-hidden">
                    <div className="bg-deep-navy/5 px-4 py-2 border-b border-deep-navy/10 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-deep-navy font-bold text-sm">
                        <Sparkles className="w-4 h-4 text-soft-gold" />
                        AI 생성 답변
                      </div>
                      <button 
                        onClick={() => handleGenerateReply(review)}
                        className="text-xs text-gray-500 hover:text-deep-navy underline"
                      >
                        다시 생성
                      </button>
                    </div>
                    <textarea 
                      className="w-full p-4 text-sm text-gray-700 focus:outline-none focus:bg-white resize-none"
                      rows={4}
                      value={generatedReplies[review.id]}
                      onChange={(e) => setGeneratedReplies(prev => ({ ...prev, [review.id]: e.target.value }))}
                    />
                    <div className="bg-gray-50 px-4 py-3 flex justify-end">
                      <button
                        onClick={() => handleSubmitReply(review.id)}
                        disabled={submittingId === review.id}
                        className="bg-deep-navy text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center gap-2"
                      >
                        {submittingId === review.id ? '등록 중...' : '답변 등록'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleGenerateReply(review)}
                      disabled={analyzingId === review.id}
                      className="bg-soft-gold text-deep-navy px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-sm"
                    >
                      {analyzingId === review.id ? (
                        <div className="w-4 h-4 border-2 border-deep-navy/30 border-t-deep-navy rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {analyzingId === review.id ? 'AI 분석 중...' : 'AI 답변 생성'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          ))
        )}
      </div>
    </div>
  );
}
