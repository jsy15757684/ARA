import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const reviewsFilePath = path.join(process.cwd(), 'src', 'data', 'reviews.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(reviewsFilePath, 'utf8');
    const reviews = JSON.parse(fileContents);
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, reply } = body;

    const fileContents = await fs.readFile(reviewsFilePath, 'utf8');
    let reviews = JSON.parse(fileContents);

    const reviewIndex = reviews.findIndex((r: any) => r.id === id);
    if (reviewIndex === -1) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    reviews[reviewIndex].reply = reply;
    reviews[reviewIndex].status = 'replied';

    await fs.writeFile(reviewsFilePath, JSON.stringify(reviews, null, 2), 'utf8');

    return NextResponse.json({ success: true, review: reviews[reviewIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
