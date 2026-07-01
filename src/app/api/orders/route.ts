import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // 1. Check Authentication
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

    const user = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf8'));

    // 2. Read Request Body
    const body = await request.json();
    const { shippingAddress, customerName, customerPhone, items, totalPrice } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '결제할 상품이 없습니다.' }, { status: 400 });
    }

    const orderId = `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // 3. Insert Order metadata
    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        id: orderId,
        user_id: user.id,
        customer_name: customerName || user.name,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        total_price: totalPrice,
        status: '결제완료'
      });

    if (orderError) throw orderError;

    // 4. Insert Order Items (transaction-like rollback if failed)
    const dbItems = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      price: item.price,
      options: item.options,
      image: item.image
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(dbItems);

    if (itemsError) {
      // Rollback order
      await supabaseAdmin.from('orders').delete().eq('id', orderId);
      throw itemsError;
    }

    return NextResponse.json({ success: true, orderId: orderId });
  } catch (error: any) {
    console.error('Order creation failed:', error);
    return NextResponse.json({ error: error.message || '주문 처리에 실패했습니다.' }, { status: 500 });
  }
}
