import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ordersFilePath = path.join(process.cwd(), 'src', 'data', 'orders.json');

export async function POST(request: Request) {
  try {
    // 1. Check Authentication (Optional for guest checkout, but we enforce it here)
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

    // 3. Read Existing Orders
    let orders = [];
    try {
      const fileContents = await fs.readFile(ordersFilePath, 'utf8');
      orders = JSON.parse(fileContents);
    } catch (e) {
      orders = [];
    }

    // 4. Create New Order
    const newOrder = {
      id: `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      customerName: customerName || user.name, // Use provided name, fallback to user name
      customerPhone: customerPhone,
      totalPrice: totalPrice,
      status: '결제완료',
      items: items,
      shippingAddress: shippingAddress
    };

    // Add to beginning of the array
    orders.unshift(newOrder);

    // 5. Save Back to File
    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json({ error: '주문 처리에 실패했습니다.' }, { status: 500 });
  }
}
