import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
    }

    // 1. Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ error: '이미 존재하는 이메일입니다.' }, { status: 409 });
    }

    // 2. Insert new user
    const newUser = {
      email,
      password, // Plain text for demo
      name,
      role: email === 'admin@leschoses.com' || email.includes('admin') ? 'admin' : 'user'
    };

    const { error } = await supabaseAdmin
      .from('users')
      .insert(newUser);

    if (error) throw error;

    return NextResponse.json({ success: true, message: '회원가입이 완료되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
