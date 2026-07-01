import { NextResponse } from 'next/server';
import { generateGeminiJson } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { name, category } = await request.json();

    if (!name || !category) {
      return NextResponse.json({ error: '상품명과 카테고리는 필수 입력값입니다.' }, { status: 400 });
    }

    const prompt = `상품명: "${name}", 카테고리: "${category}"`;
    const systemInstruction = `너는 프리미엄 이커머스 쇼핑몰의 전문 카피라이터야. 제공되는 상품명과 카테고리에 맞는 자연스럽고 매력적인 상세 정보 설명글(description, 한국어로 3~4문장)과 해당 상품을 홍보할 수 있는 관련 태그 리스트(tags, 4~6개의 해시태그 형식 문자열, 앞에 #은 뺀 순수 단어)를 생성해줘.
    반드시 다음 JSON 형식에 맞춰 응답해야 해:
    {
      "description": "생성된 상품 설명글",
      "tags": ["태그1", "태그2", "태그3"]
    }`;

    const result = await generateGeminiJson<{ description: string; tags: string[] }>(prompt, systemInstruction);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Failed to generate product details with Gemini:', error);
    return NextResponse.json({ error: error.message || 'AI 상품 설명 생성에 실패했습니다.' }, { status: 500 });
  }
}
