import { NextResponse } from 'next/server';
import { generateGeminiJson } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, rating, customerName, productName } = body;

    if (!content || !rating || !customerName || !productName) {
      return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
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
    return NextResponse.json({ error: error.message || 'AI 답변 생성에 실패했습니다.' }, { status: 500 });
  }
}
