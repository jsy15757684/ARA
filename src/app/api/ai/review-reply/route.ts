import { NextResponse } from 'next/server';
import { generateGeminiJson } from '@/lib/gemini';

function getMockReviewReply(content: string, rating: number, customerName: string, productName: string) {
  let sentiment = rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral';
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

  return {
    success: true,
    analysis: {
      sentiment,
      keywords: [hasDefect ? '불량' : null, wantsRefund ? '환불' : null, wantsExchange ? '교환' : null].filter(Boolean)
    },
    reply
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, rating, customerName, productName } = body;

    if (!content || !rating || !customerName || !productName) {
      return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json(getMockReviewReply(content, rating, customerName, productName));
    }

    const prompt = `고객명: "${customerName}", 상품명: "${productName}", 평점: ${rating}점, 리뷰내용: "${content}"`;
    const systemInstruction = `너는 쇼핑몰 고객관리 담당 매니저야. 고객이 남긴 상품 리뷰를 분석해서 정중하고 친절한 고객 답변을 한국어로 작성해주고, 리뷰 내용에 대한 감정 분석 및 키워드 추출을 해줘.
    반드시 다음 JSON 형식에 맞춰 응답해야 해:
    {
      "analysis": {
        "sentiment": "positive" (4-5점인 경우) 또는 "negative" (1-2점인 경우) 또는 "neutral" (3점인 경우),
        "keywords": ["추출된 주요 키워드1", "키워드2"] (예: "불량", "배송지연", "품질만족" 등 1~3개)
      },
      "reply": "친절하게 정형화되지 않고 고객의 특정 불만이나 칭찬에 맞추어 작성된 매니저 답변글"
    }`;

    const result = await generateGeminiJson<{
      analysis: { sentiment: string; keywords: string[] };
      reply: string;
    }>(prompt, systemInstruction);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('AI Review Reply generation failed:', error);
    try {
      const { content, rating, customerName, productName } = await request.clone().json();
      return NextResponse.json(getMockReviewReply(content, rating, customerName, productName));
    } catch {
      return NextResponse.json({ error: 'AI 답변 생성에 실패했습니다.' }, { status: 500 });
    }
  }
}
