import { Sparkles, Bot } from 'lucide-react';

export default function AIRecommendPlaceholder() {
  return (
    <section className="mx-5 md:mx-8 my-8 p-6 md:p-8 bg-gradient-to-br from-deep-navy to-deep-navy/90 rounded-2xl text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-soft-gold/20 rounded-xl flex items-center justify-center">
          <Bot className="w-5 h-5 text-soft-gold" />
        </div>
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            AI 스타일 추천
            <Sparkles className="w-4 h-4 text-soft-gold" />
          </h3>
          <p className="text-sm text-white/60">곧 만나보실 수 있습니다</p>
        </div>
      </div>

      <p className="text-base text-white/80 leading-relaxed mb-5">
        AI가 고객님의 체형과 선호 스타일을 분석하여,
        <strong className="text-soft-gold"> 나에게 딱 맞는 사이즈</strong>와
        <strong className="text-soft-gold"> 어울리는 코디</strong>를 추천해 드립니다.
      </p>

      <button
        disabled
        className="w-full py-4 bg-soft-gold/20 text-soft-gold font-semibold rounded-xl
                   border border-soft-gold/30 cursor-not-allowed opacity-70 text-base"
      >
        <Sparkles className="w-5 h-5 inline mr-2" />
        준비 중 · Coming Soon
      </button>
    </section>
  );
}
