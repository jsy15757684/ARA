import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'orders.json');

async function getOrders() {
  const fileContents = await fs.readFile(dataFilePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, requestType, requestReason } = await request.json();
    const orders = await getOrders();
    
    const index = orders.findIndex((o: any) => o.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    orders[index].status = status;
    if (requestType !== undefined) orders[index].requestType = requestType;
    if (requestReason !== undefined) orders[index].requestReason = requestReason;
    
    await fs.writeFile(dataFilePath, JSON.stringify(orders, null, 2), 'utf8');
    
    return NextResponse.json(orders[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orders = await getOrders();
    
    const filteredOrders = orders.filter((o: any) => o.id !== id);
    
    if (orders.length === filteredOrders.length) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    await fs.writeFile(dataFilePath, JSON.stringify(filteredOrders, null, 2), 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
