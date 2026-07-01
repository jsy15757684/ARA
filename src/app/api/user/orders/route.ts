import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ordersFilePath = path.join(process.cwd(), 'src', 'data', 'orders.json');

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

    // Read orders database
    let orders = [];
    try {
      const fileContents = await fs.readFile(ordersFilePath, 'utf8');
      orders = JSON.parse(fileContents);
    } catch (e) {
      orders = [];
    }

    // Filter orders by user name (mock approach)
    let userOrders = orders.filter((o: any) => o.customerName === user.name);

    // If this is a new demo user and has no orders, inject some cool demo orders!
    if (userOrders.length === 0) {
      userOrders = [
        {
          id: `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-D01`,
          createdAt: new Date().toISOString(),
          customerName: user.name,
          totalPrice: 189000,
          status: '결제완료',
          items: [
            {
              productId: 'F001',
              productName: '프리미엄 리넨 블레이저',
              quantity: 1,
              price: 189000,
              options: { '사이즈': 'L', '색상': '네이비' },
              image: '/images/products/blazer.png'
            }
          ]
        },
        {
          id: `ORD-${new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0].replace(/-/g, '')}-D02`,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          customerName: user.name,
          totalPrice: 329000,
          status: '배송중',
          items: [
            {
              productId: 'E001',
              productName: '프리미엄 노이즈캔슬링 헤드폰',
              quantity: 1,
              price: 329000,
              options: { '색상': '매트 블랙' },
              image: '/images/products/headphones.png'
            }
          ]
        }
      ];
    }

    // Sort by createdAt descending
    userOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(userOrders);
  } catch (error) {
    return NextResponse.json({ error: '주문 내역을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
