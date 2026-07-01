import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(usersFilePath, 'utf8');
    const users = JSON.parse(fileContents);
    
    // Remove passwords before sending to the client
    const safeUsers = users.map((user: any) => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    // In a real app, we should sort by createdAt desc. Let's assume we can do it here if createdAt exists.
    // If not, we just return them.

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    // If file doesn't exist or is empty, return empty array
    return NextResponse.json([]);
  }
}
