import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateGeminiContent } from '@/lib/gemini';
import { mapOrder } from '../orders/[id]/route';
import { mapProduct } from '../products/route';

function getMockChatResponse(msg: string, user: any, userOrders: any[], productsList: any[]) {
  const cleanMsg = msg.toLowerCase();
  
  if (cleanMsg.includes('배송') || cleanMsg.includes('주문') || cleanMsg.includes('언제')) {
    if (user) {
      if (userOrders.length > 0) {
        const latestOrder = userOrders[0];
        const productName = latestOrder.items[0]?.productName || '주문 상품';
        const extraCount = latestOrder.items.length > 1 ? ` 외 ${latestOrder.items.length - 1}건` : '';
        return `${user.name} 고객님! 최근 주문하신 '${productName}${extraCount}' 상품은 현재 [${latestOrder.status}] 상태입니다. 마이페이지에서 더 자세한 배송 현황을 확인하실 수 있습니다! 🚚`;
      } else {
        return `${user.name} 고객님, 아직 주문하신 내역이 조회되지 않습니다. 원하시는 상품이 있다면 추천해 드릴까요? 😊`;
      }
    } else {
      return '주문 및 배송 조회를 위해서는 먼저 로그인을 해주세요! 로그인 후 다시 물어보시면 상세히 안내해 드리겠습니다. 🔒';
    }
  }

  if (cleanMsg.includes('추천') || cleanMsg.includes('선물') || cleanMsg.includes('뭐가 좋') || cleanMsg.includes('베스트') || cleanMsg.includes('인기')) {
    const randomProduct = productsList[Math.floor(Math.random() * productsList.length)] || { brand: 'Les choses', name: '시그니처 상품', price: 100000 };
    return `지금 가장 인기 있는 상품은 **[${randomProduct.brand}] ${randomProduct.name}** 입니다! \n\n이 상품은 ${Number(randomProduct.price).toLocaleString('ko-KR')}원에 판매 중이며, 고급스러운 디자인과 탁월한 품질로 선물용으로도 아주 좋습니다. 검색창에 '${randomProduct.name}'을 검색해 보세요! ✨`;
  }

  if (cleanMsg.includes('반품') || cleanMsg.includes('환불') || cleanMsg.includes('교환')) {
    return '교환 및 반품은 상품 수령 후 7일 이내에 마이페이지에서 신청하실 수 있습니다. 단, 택을 제거하시거나 사용 흔적이 있는 경우에는 처리가 어려울 수 있으니 양해 부탁드립니다. 📦';
  }
  
  if (cleanMsg.includes('상담원') || cleanMsg.includes('전화') || cleanMsg.includes('고객센터')) {
    return '고객센터 전화번호는 1588-0000 입니다. 평일 오전 10시부터 오후 5시까지 운영되며, 주말 및 공휴일은 휴무입니다. 급한 문의는 1:1 게시판을 이용해 주세요! 📞';
  }

  return '말씀하신 내용을 정확히 이해하지 못했어요. 😅\n"주문 배송 조회", "베스트 상품 추천", "교환/환불 방법" 등을 물어보시면 빠르게 도와드릴게요!';
}

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
          user = JSON.parse(Buffer.from(decodeURIComponent(sessionCookie), 'base64').toString('utf8'));
          
          // Fetch user's orders from Supabase
          const { data: dbOrders } = await supabaseAdmin
            .from('orders')
            .select('*, order_items(*)')
            .eq('user_id', user.id);

          if (dbOrders) {
            userOrders = dbOrders.map(o => mapOrder(o, o.order_items || []));
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

    // Fallback if API key is not configured
    if (!process.env.GEMINI_API_KEY) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({ reply: getMockChatResponse(message, user, userOrders, productsList) });
    }

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
    try {
      const { message } = await request.clone().json();
      return NextResponse.json({ reply: '죄송합니다, AI 처리 중 예기치 못한 오류가 발생했습니다.' });
    } catch {
      return NextResponse.json({ error: 'AI 처리 중 오류가 발생했습니다.' }, { status: 500 });
    }
  }
}
