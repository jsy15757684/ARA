import ProductForm from '@/components/admin/ProductForm';
import { getProductById } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductForm initialData={product} />;
}
