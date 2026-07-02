import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export function mapOrder(o: any, items: any[] = []) {
  if (!o) return o;
  return {
    id: o.id,
    createdAt: o.created_at,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    shippingAddress: o.shipping_address,
    totalPrice: Number(o.total_price),
    status: o.status,
    requestType: o.request_type,
    requestReason: o.request_reason,
    trackingNumber: o.tracking_number,
    courierName: o.courier_name,
    items: items.map(i => ({
      productId: i.product_id,
      productName: i.product_name,
      quantity: i.quantity,
      price: Number(i.price),
      options: i.options,
      image: i.image
    }))
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      throw error;
    }

    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    return NextResponse.json(mapOrder(order, items || []));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, requestType, requestReason, trackingNumber, courierName } = body;

    const updatePayload: any = {};
    if (status !== undefined) updatePayload.status = status;
    if (requestType !== undefined) updatePayload.request_type = requestType;
    if (requestReason !== undefined) updatePayload.request_reason = requestReason;
    if (trackingNumber !== undefined) updatePayload.tracking_number = trackingNumber;
    if (courierName !== undefined) updatePayload.courier_name = courierName;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      throw error;
    }

    // Fetch items
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    return NextResponse.json(mapOrder(order, items || []));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update order status' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete order' }, { status: 500 });
  }
}
