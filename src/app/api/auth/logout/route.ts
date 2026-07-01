import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set({
    name: 'auth_session',
    value: '',
    path: '/',
    expires: new Date(0) // Expire immediately
  });

  return response;
}
