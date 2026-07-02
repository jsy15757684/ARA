import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export function mapReview(r: any) {
  if (!r) return r;
  return {
    id: r.id,
    productId: r.product_id,
    productName: r.product_name,
    userName: r.user_name,
    customerName: r.user_name,
    rating: r.rating,
    content: r.content,
    reply: r.reply,
    repliedAt: r.replied_at,
    createdAt: r.created_at,
    status: r.reply ? 'replied' : 'pending'
  };
}

export async function GET() {
  try {
    const { data: dbReviews, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(dbReviews ? dbReviews.map(mapReview) : []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, reply } = body;

    const { data: updatedReview, error } = await supabaseAdmin
      .from('reviews')
      .update({
        reply,
        replied_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, review: mapReview(updatedReview) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update review' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, productName, userName, rating, content } = body;

    if (!productId || !productName || !userName || !rating || !content) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
    }

    const reviewId = `RV-${Date.now().toString().slice(-8)}`;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        id: reviewId,
        product_id: productId,
        product_name: productName,
        user_name: userName,
        rating: Math.min(5, Math.max(1, Number(rating))),
        content,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, review: mapReview(data) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create review' }, { status: 500 });
  }
}
