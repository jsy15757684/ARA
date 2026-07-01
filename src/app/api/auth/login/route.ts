import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
    }

    let fileContents = '[]';
    try {
      fileContents = await fs.readFile(dataFilePath, 'utf8');
    } catch (e) {
      return NextResponse.json({ error: '등록된 사용자가 없습니다.' }, { status: 404 });
    }

    const users = JSON.parse(fileContents);
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    // Set a simple cookie for demo purposes
    // In production, sign a JWT and set it as HttpOnly
    const sessionData = Buffer.from(JSON.stringify({ id: user.id, name: user.name, email: user.email })).toString('base64');
    
    const response = NextResponse.json({ success: true, user: { name: user.name, email: user.email } });
    
    response.cookies.set({
      name: 'auth_session',
      value: sessionData,
      httpOnly: false, // Set to false so we can easily read it on the client for the UI
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
