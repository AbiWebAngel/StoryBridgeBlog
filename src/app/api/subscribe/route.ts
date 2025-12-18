import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';


interface SubscribeRequestBody {
  email: string;
}

// /app/api/subscribe/route.ts (App Router example)
export async function POST(req: NextRequest) {
  try {
    const body: SubscribeRequestBody = await req.json();
    const email: string = body.email?.trim();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const BREVO_API = 'https://api.brevo.com/v3/contacts';
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    await axios.post(
      BREVO_API,
      { email, listIds: [2], updateEnabled: true },
      { headers: { 'api-key': BREVO_API_KEY!, 'Content-Type': 'application/json' } }
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    // Narrow the unknown error type
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data || error.message);
    } else if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
