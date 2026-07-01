import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'products.json');

async function getProducts() {
  const fileContents = await fs.readFile(dataFilePath, 'utf8');
  return JSON.parse(fileContents);
}

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newProduct = await request.json();
    const products = await getProducts();
    
    // Generate a simple ID if not provided
    if (!newProduct.id) {
      const prefix = newProduct.category === '패션의류' ? 'F' : 'P';
      newProduct.id = `${prefix}${Date.now().toString().slice(-4)}`;
    }
    
    products.push(newProduct);
    await fs.writeFile(dataFilePath, JSON.stringify(products, null, 2), 'utf8');
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
