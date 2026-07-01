import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Helper to wait a bit to simulate thinking
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    // Simulate network/thinking delay (1.5s to 2.5s)
    await delay(1500 + Math.random() * 1000);

    const msg = message.toLowerCase();
    
    // 1. 배송/주문 조회 로직
    if (msg.includes('배송') || msg.includes('주문') || msg.includes('언제')) {
      const cookieHeader = request.headers.get('cookie');
      let userName = null;
      
      if (cookieHeader && cookieHeader.includes('auth_session=')) {
        const sessionCookie = cookieHeader
          .split('; ')
          .find(row => row.startsWith('auth_session='))
          ?.split('=')[1];

        if (sessionCookie) {
          try {
            const decodedString = decodeURIComponent(escape(atob(sessionCookie)));
            userName = JSON.parse(decodedString).name;
          } catch (e) {
            // ignore
          }
        }
      }

      if (userName) {
        // Read orders
        const ordersFilePath = path.join(process.cwd(), 'src', 'data', 'orders.json');
        try {
          const fileContents = await fs.readFile(ordersFilePath, 'utf8');
          const orders = JSON.parse(fileContents);
          const userOrders = orders.filter((o: any) => o.customerName === userName);
          
          if (userOrders.length > 0) {
            const latestOrder = userOrders[0];
            const productName = latestOrder.items[0].productName;
            const extraCount = latestOrder.items.length > 1 ? ` 외 ${latestOrder.items.length - 1}건` : '';
            
            return NextResponse.json({
              reply: `${userName} 고객님! 최근 주문하신 '${productName}${extraCount}' 상품은 현재 [${latestOrder.status}] 상태입니다. 마이페이지에서 더 자세한 배송 현황을 확인하실 수 있습니다! 🚚`
            });
          } else {
            return NextResponse.json({
              reply: `${userName} 고객님, 아직 주문하신 내역이 조회되지 않습니다. 원하시는 상품이 있다면 추천해 드릴까요? 😊`
            });
          }
        } catch (e) {
          return NextResponse.json({ reply: '주문 내역을 조회하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
        }
      } else {
        return NextResponse.json({
          reply: '주문 및 배송 조회를 위해서는 먼저 로그인을 해주세요! 로그인 후 다시 물어보시면 상세히 안내해 드리겠습니다. 🔒'
        });
      }
    }

    // 2. 상품 추천 로직
    if (msg.includes('추천') || msg.includes('선물') || msg.includes('뭐가 좋') || msg.includes('베스트') || msg.includes('인기')) {
      const productsFilePath = path.join(process.cwd(), 'src', 'data', 'products.json');
      try {
        const fileContents = await fs.readFile(productsFilePath, 'utf8');
        const products = JSON.parse(fileContents);
        
        // Pick a random highly rated product
        const premiumProducts = products.filter((p: any) => p.price > 100000);
        const randomProduct = premiumProducts[Math.floor(Math.random() * premiumProducts.length)] || products[0];
        
        return NextResponse.json({
          reply: `지금 가장 인기 있는 상품은 **[${randomProduct.brand}] ${randomProduct.name}** 입니다! \n\n이 상품은 ${randomProduct.price.toLocaleString('ko-KR')}원에 판매 중이며, 고급스러운 디자인과 탁월한 품질로 선물용으로도 아주 좋습니다. 검색창에 '${randomProduct.name}'을 검색해 보세요! ✨`
        });
      } catch (e) {
        return NextResponse.json({ reply: '현재 베스트 상품 데이터를 불러오는데 실패했습니다.' });
      }
    }

    // 3. 반품/환불 로직
    if (msg.includes('반품') || msg.includes('환불') || msg.includes('교환')) {
      return NextResponse.json({
        reply: '교환 및 반품은 상품 수령 후 7일 이내에 마이페이지에서 신청하실 수 있습니다. 단, 택을 제거하시거나 사용 흔적이 있는 경우에는 처리가 어려울 수 있으니 양해 부탁드립니다. 📦'
      });
    }
    
    // 4. 고객센터/상담원 로직
    if (msg.includes('상담원') || msg.includes('전화') || msg.includes('고객센터')) {
      return NextResponse.json({
        reply: '고객센터 전화번호는 1588-0000 입니다. 평일 오전 10시부터 오후 5시까지 운영되며, 주말 및 공휴일은 휴무입니다. 급한 문의는 1:1 게시판을 이용해 주세요! 📞'
      });
    }

    // 5. 기본 응답 (Fallback)
    return NextResponse.json({
      reply: '말씀하신 내용을 정확히 이해하지 못했어요. 😅\n"주문 배송 조회", "베스트 상품 추천", "교환/환불 방법" 등을 물어보시면 빠르게 도와드릴게요!'
    });

  } catch (error) {
    return NextResponse.json({ error: 'AI 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
