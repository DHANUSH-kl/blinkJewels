// src/app/api/orders/[id]/route.ts
import { connectToDatabase } from '@/lib/mongoose';
import { Order } from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ error: 'Status required' }, { status: 400 });
    }

    const updated = await Order.findOneAndUpdate(
      { _id: params.id, userEmail: session.user.email },
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    console.error('❌ Error cancelling order:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
