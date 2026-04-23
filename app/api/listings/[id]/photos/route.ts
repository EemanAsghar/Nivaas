import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (listing.landlordId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const files = formData.getAll('photos') as File[];
  if (!files.length) return NextResponse.json({ error: 'No files provided' }, { status: 400 });

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', id);
  await mkdir(uploadDir, { recursive: true });

  const existingCount = await prisma.listingPhoto.count({ where: { listingId: id } });
  const saved: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop() ?? 'jpg';
    const filename = `${Date.now()}-${i}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);
    const url = `/uploads/${id}/${filename}`;

    await prisma.listingPhoto.create({
      data: { listingId: id, url, isCover: existingCount + i === 0, order: existingCount + i },
    });
    saved.push(url);
  }

  return NextResponse.json({ urls: saved }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { photoId } = await req.json();

  await prisma.listingPhoto.delete({ where: { id: photoId } });
  return NextResponse.json({ success: true });
}
