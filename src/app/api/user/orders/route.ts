import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { mapOrder } from '../../orders/[id]/route';

export async function GET(request: Request) {
  try {
    // Check authentication cookie
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader || !cookieHeader.includes('auth_session=')) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const sessionCookie = cookieHeader
      .split('; ')
      .find(row => row.startsWith('auth_session='))
      ?.split('=')[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: '유효하지 않은 세션입니다.' }, { status: 401 });
    }

    // Decode user info
    const user = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf8'));

    // Fetch user orders with items
    const { data: dbOrders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id);

    if (ordersError) throw ordersError;

    let userOrders = dbOrders?.map(o => mapOrder(o, o.order_items || [])) || [];

    // If this is a new demo user and has no orders, inject some cool demo orders into Supabase!
    if (userOrders.length === 0) {
      const demoOrders = [
        {
          id: `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-D01`,
          user_id: user.id,
          customer_name: user.name,
          customer_phone: '010-1234-5678',
          shipping_address: '서울특별시 강남구 테헤란로 123',
          total_price: 189000,
          status: '결제완료'
        },
        {
          id: `ORD-${new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0].replace(/-/g, '')}-D02`,
          user_id: user.id,
          customer_name: user.name,
          customer_phone: '010-1234-5678',
          shipping_address: '서울특별시 강남구 테헤란로 123',
          total_price: 329000,
          status: '배송중'
        }
      ];

      const demoItems = [
        {
          order_id: demoOrders[0].id,
          product_id: 'F001',
          product_name: '프리미엄 리넨 블레이저',
          quantity: 1,
          price: 189000,
          options: { '사이즈': 'L', '색상': '네이비' },
          image: '/images/products/blazer.png'
        },
        {
          order_id: demoOrders[1].id,
          product_id: 'E001',
          product_name: '프리미엄 노이즈캔슬링 헤드폰',
          quantity: 1,
          price: 329000,
          options: { '색상': '매트 블랙' },
          image: '/images/products/headphones.png'
        }
      ];

      // Insert into DB
      await supabaseAdmin.from('orders').insert(demoOrders);
      await supabaseAdmin.from('order_items').insert(demoItems);

      // Query again to get full mapped data
      const { data: reloadedOrders } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id);

      userOrders = reloadedOrders?.map(o => mapOrder(o, o.order_items || [])) || [];
    }

    // Sort by createdAt descending
    userOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(userOrders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '주문 내역을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
