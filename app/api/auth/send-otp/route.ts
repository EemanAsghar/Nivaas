import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  phone: z.string().regex(/^(\+92|0)?3\d{9}$/, 'Invalid Pakistani mobile number'),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Normalise phone to +923XXXXXXXXX
  let phone = parsed.data.phone.replace(/^0/, '+92');
  if (!phone.startsWith('+')) phone = '+92' + phone;

  // Upsert user
  const user = await prisma.user.upsert({
    where: { phone },
    create: { phone, role: 'TENANT' },
    update: {},
  });

  // Invalidate old OTPs
  await prisma.oTP.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.oTP.create({
    data: { userId: user.id, code, expiresAt },
  });

  // In production: await twilio.messages.create({ to: phone, body: `Your Nivaas OTP is ${code}` })
  console.log(`[DEV] OTP for ${phone}: ${code}`);

  return NextResponse.json({ success: true, message: 'OTP sent', ...(process.env.NODE_ENV === 'development' && { _dev_otp: code }) });
}
