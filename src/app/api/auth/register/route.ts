import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
    }

    let fileContents = '[]';
    try {
      fileContents = await fs.readFile(dataFilePath, 'utf8');
    } catch (e) {
      // File doesn't exist, which is fine
    }

    const users = JSON.parse(fileContents);
    
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      return NextResponse.json({ error: '이미 존재하는 이메일입니다.' }, { status: 409 });
    }

    // In a real app, hash password here. We just store plain text for the demo.
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // DO NOT DO THIS IN PRODUCTION
      name,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), 'utf8');

    return NextResponse.json({ success: true, message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
