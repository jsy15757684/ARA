import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ordersFilePath = path.join(process.cwd(), 'src', 'data', 'orders.json');
const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

export async function GET() {
  try {
    const [ordersFile, usersFile] = await Promise.all([
      fs.readFile(ordersFilePath, 'utf8').catch(() => '[]'),
      fs.readFile(usersFilePath, 'utf8').catch(() => '[]')
    ]);

    const orders = JSON.parse(ordersFile);
    const users = JSON.parse(usersFile);

    // 1. Key Metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalPrice, 0);
    const totalUsers = users.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // 2. Sales Trend (Last 7 days)
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const salesTrend = last7Days.map(date => {
      const dayOrders = orders.filter((o: any) => o.createdAt.startsWith(date));
      const revenue = dayOrders.reduce((sum: number, o: any) => sum + o.totalPrice, 0);
      return {
        date: date.slice(5), // MM-DD
        revenue
      };
    });

    // 3. Best Sellers
    const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
    orders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        const id = item.productId || item.product?.id;
        const name = item.productName || item.product?.name;
        const price = item.price || item.product?.price || 0;
        
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
        totalUsers,
        averageOrderValue
      },
      salesTrend,
      bestSellers
    });

  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
