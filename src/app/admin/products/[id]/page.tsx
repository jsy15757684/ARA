import ProductForm from '@/components/admin/ProductForm';
import { supabase } from '@/lib/supabase';
import { mapProduct } from '@/app/api/products/route';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: dbProduct } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  const product = mapProduct(dbProduct);

  if (!product) {
    notFound();
  }

  return <ProductForm initialData={product} />;
}
