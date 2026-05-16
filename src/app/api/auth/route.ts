import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 4) {
    return NextResponse.json({ error: 'Server not configured (ADMIN_PASSWORD missing)' }, { status: 500 });
  }
  try {
    const { password } = await req.json();
    if (typeof password !== 'string') {
      return NextResponse.json({ error: 'password required' }, { status: 400 });
    }
    // Constant-time compare
    if (password.length !== expected.length) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    let mismatch = 0;
    for (let i = 0; i < password.length; i++) {
      mismatch |= password.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (mismatch !== 0) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    return NextResponse.json({ ok: true, token: password });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
