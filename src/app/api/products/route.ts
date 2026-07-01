import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Map database snake_case columns to camelCase expected by the client
export function mapProduct(p: any) {
  if (!p) return p;
  return {
    ...p,
    originalPrice: p.original_price,
    discountRate: p.discount_rate,
    rating: p.rating ?? 5.0,
    reviewCount: p.review_count ?? p.reviewCount ?? 0
  };
}

// Map camelCase fields to snake_case for DB insertions/updates
export function unmapProduct(p: any) {
  if (!p) return p;
  const { originalPrice, discountRate, ...rest } = p;
  return {
    ...rest,
    original_price: originalPrice,
    discount_rate: discountRate,
    subcategory: p.subcategory ?? p.category ?? '기타',
  };
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ? data.map(mapProduct) : []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newProduct = await request.json();
    
    // Generate a simple ID if not provided
    if (!newProduct.id) {
      const prefix = newProduct.category === '패션의류' ? 'F' : 'P';
      newProduct.id = `${prefix}${Date.now().toString().slice(-4)}`;
    }
    
    const dbPayload = unmapProduct(newProduct);
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(dbPayload)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(mapProduct(data), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add product' }, { status: 500 });
  }
}
