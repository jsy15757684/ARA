import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, rating, customerName, productName } = body;

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Basic sentiment and intent analysis based on rating
    let sentiment = rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral';
    
    // Check for specific keywords to make it look "smart"
    const hasDefect = content.includes('불량') || content.includes('찌그러져서') || content.includes('고장');
    const wantsRefund = content.includes('환불') || content.includes('반품') || content.includes('취소');
    const wantsExchange = content.includes('교환');

    let reply = '';

    if (sentiment === 'negative') {
      if (hasDefect && wantsExchange) {
        reply = `안녕하세요, ${customerName} 고객님. 먼저 [${productName}] 상품 불량 및 포장 훼손 문제로 큰 불편을 드려 진심으로 죄송합니다. 제품의 초기 불량 문제로 파악되며, 즉시 새 상품으로 무상 교환 처리를 도와드리겠습니다. 남겨주신 연락처로 담당자가 신속히 안내 문자 발송해 드리겠습니다. 다시 한번 사과드립니다.`;
      } else if (wantsRefund) {
        reply = `안녕하세요, ${customerName} 고객님. [${productName}] 상품 구매 후 만족을 드리지 못해 대단히 죄송합니다. 남겨주신 의견(두께 및 미끄러움 등)은 유관 부서에 전달하여 품질 개선에 꼭 반영하겠습니다. 요청하신 환불 건은 확인 즉시 전액 환불 처리 도와드리겠습니다. 불편을 드려 다시 한번 사과드립니다.`;
      } else {
        reply = `안녕하세요, ${customerName} 고객님. [${productName}] 상품 이용에 불편을 드려 죄송합니다. 말씀해주신 사항은 꼼꼼히 확인하여 개선할 수 있도록 노력하겠습니다. 추가 문의사항이 있으시면 언제든 고객센터로 연락 부탁드립니다.`;
      }
    } else if (sentiment === 'positive') {
      reply = `안녕하세요, ${customerName} 고객님! [${productName}] 상품을 만족스럽게 이용해주셔서 저희도 정말 기쁩니다. 고객님의 소중한 후기가 큰 힘이 됩니다. 앞으로도 더 좋은 품질과 서비스로 보답하는 쇼핑몰이 되겠습니다. 늘 건강하시고 행복한 하루 보내세요! 감사합니다.`;
    } else {
      reply = `안녕하세요, ${customerName} 고객님. [${productName}] 상품을 구매해 주셔서 감사합니다. 남겨주신 소중한 의견은 제품 개선에 큰 도움이 됩니다. 앞으로도 더 나은 서비스를 제공하기 위해 노력하겠습니다. 감사합니다.`;
    }

    return NextResponse.json({
      success: true,
      analysis: {
        sentiment,
        keywords: [hasDefect ? '불량' : null, wantsRefund ? '환불' : null, wantsExchange ? '교환' : null].filter(Boolean)
      },
      reply
    });

  } catch (error) {
    console.error('AI Review Reply generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate AI reply' }, { status: 500 });
  }
}
