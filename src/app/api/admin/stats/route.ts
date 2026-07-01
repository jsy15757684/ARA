import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)');

    if (ordersError) throw ordersError;

    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    const safeOrders = orders || [];
    const safeUsersCount = totalUsers || 0;

    // 1. Key Metrics
    const totalOrders = safeOrders.length;
    const totalRevenue = safeOrders.reduce((sum: number, order: any) => sum + Number(order.total_price), 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // 2. Sales Trend (Last 7 days)
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const salesTrend = last7Days.map(date => {
      const dayOrders = safeOrders.filter((o: any) => o.created_at.startsWith(date));
      const revenue = dayOrders.reduce((sum: number, o: any) => sum + Number(o.total_price), 0);
      return {
        date: date.slice(5), // MM-DD
        revenue
      };
    });

    // 3. Best Sellers
    const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
    safeOrders.forEach((order: any) => {
      order.order_items?.forEach((item: any) => {
        const id = item.product_id;
        const name = item.product_name;
        const price = Number(item.price) || 0;
        
        if (!id) return;

        if (!productSales[id]) {
          productSales[id] = {
            name: name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[id].quantity += item.quantity;
        productSales[id].revenue += item.quantity * price;
      });
    });

    const bestSellers = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json({
      metrics: {
        totalOrders,
        totalRevenue,
        totalUsers: safeUsersCount,
        averageOrderValue
      },
      salesTrend,
      bestSellers
    });

  } catch (error: any) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch stats' }, { status: 500 });
  }
}
