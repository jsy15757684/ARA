import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateGeminiContent } from '@/lib/gemini';
import { mapOrder } from '../orders/[id]/route';
import { mapProduct } from '../products/route';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: '메시지를 입력해주세요.' }, { status: 400 });
    }

    // 1. Get authenticated user from cookie
    const cookieHeader = request.headers.get('cookie');
    let user: any = null;
    let userOrders: any[] = [];

    if (cookieHeader && cookieHeader.includes('auth_session=')) {
      const sessionCookie = cookieHeader
        .split('; ')
        .find(row => row.startsWith('auth_session='))
        ?.split('=')[1];

      if (sessionCookie) {
        try {
          user = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf8'));
          
          // Fetch user's orders from Supabase
          const { data: dbOrders } = await supabaseAdmin
            .from('orders')
            .select('*, order_items(*)')
            .eq('user_id', user.id);

          if (dbOrders) {
            userOrders = dbOrders.map(o => mapOrder(o, o.order_items || []));
            // Sort by latest order first
            userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          }
        } catch (e) {
          console.error('Failed to parse user session or fetch orders:', e);
        }
      }
    }

    // 2. Fetch some products for recommendations
    const { data: dbProducts } = await supabaseAdmin
      .from('products')
      .select('*')
      .limit(10);
    const productsList = dbProducts ? dbProducts.map(mapProduct) : [];

    // 3. Build System Instruction for Gemini
    const systemInstruction = `너는 프리미엄 디자인 편집샵 'Les choses du monde (레 쇼즈 뒤 몽드)'의 공식 AI 고객센터 상담원이야.
    고객의 질문에 친절하고 정중한 높임말로 답변해줘. 한국어로 답변해야 하며, 문장 끝에 적절한 이모지를 사용해줘.
    
    [고객 정보]
    - 로그인 상태: ${user ? '로그인됨' : '로그인 안됨'}
    ${user ? `- 고객 이름: ${user.name}\n- 이메일: ${user.email}\n- 최근 주문 목록:\n${JSON.stringify(userOrders, null, 2)}` : '로그인하지 않은 비회원 상태입니다.'}
    
    [추천 가능한 매장 상품 목록]
    ${JSON.stringify(productsList, null, 2)}
    
    [안내 가이드라인]
    1. 배송/주문 조회 질문:
       - 회원의 경우: 위의 '최근 주문 목록'에 주문 내역이 있으면 해당 주문의 상품명, 금액, 상태(결제완료, 배송중, 배송완료 등)를 언급하며 정확한 상태를 안내해줘.
       - 비회원의 경우: 주문 조회를 위해 먼저 로그인이 필요하다고 정중하게 로그인 링크 이동을 권유해줘.
    2. 상품 추천 질문:
       - 위의 '추천 가능한 매장 상품 목록'에 있는 실제 판매 중인 상품 1~2개를 브랜드와 가격을 명시하여 추천해주고 장점을 매력적으로 설명해줘.
    3. 반품/환불/교환 질문:
       - 상품 수령 후 7일 이내에 마이페이지에서 접수가 가능하다고 설명해줘.
    4. 상담원/전화 문의:
       - 레 쇼즈 뒤 몽드 고객센터(1588-0000)는 평일 오전 10시부터 오후 5시까지 운영됨을 안내해줘.
    5. 모르는 질문이나 일반 대화:
       - 쇼핑몰 이용과 관련된 질문에 친절하게 답변해주고, 모르는 정보는 지어내지 말고 정중히 양해를 구해줘. 답변은 가급적 3~4문장 이내로 명확하게 작성해줘.`;

    const reply = await generateGeminiContent(message, systemInstruction);

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Gemini Chat failed:', error);
    return NextResponse.json({ error: error.message || 'AI 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
