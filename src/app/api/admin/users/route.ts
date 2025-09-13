import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - جلب جميع المستخدمين
export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        approved: true,
        createdAt: true,
        profileImageData: true,
        bio: true,
        age: true,
        jobTitle: true,
        workArea: true,
        canTravelAbroad: true,
        accent: true,
        eyeColor: true,
        features: true,
        hairColor: true,
        hairStyle: true,
        height: true,
        language: true,
        skinColor: true,
        weight: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // تحويل profileImageData إلى base64 إذا كان موجوداً
    const usersWithBase64 = users.map(user => ({
      ...user,
      profileImageData: user.profileImageData ? Buffer.from(user.profileImageData).toString('base64') : undefined
    }));

    return NextResponse.json(usersWithBase64);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH - تحديث حالة المستخدم (اعتماد/إلغاء اعتماد)
export async function PATCH(req: NextRequest) {
  try {
    const { userId, approved } = await req.json();

    if (!userId || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'User ID and approval status are required' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { approved },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        approved: true,
        createdAt: true,
        profileImageData: true,
        bio: true,
        age: true,
        jobTitle: true,
        workArea: true,
        canTravelAbroad: true,
        accent: true,
        eyeColor: true,
        features: true,
        hairColor: true,
        hairStyle: true,
        height: true,
        language: true,
        skinColor: true,
        weight: true
      }
    });

    // تحويل profileImageData إلى base64 إذا كان موجوداً
    const userWithBase64 = {
      ...updatedUser,
      profileImageData: updatedUser.profileImageData ? Buffer.from(updatedUser.profileImageData).toString('base64') : undefined
    };

    return NextResponse.json(userWithBase64);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - حذف مستخدم
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // حذف المستخدم وجميع البيانات المرتبطة به
    await prisma.user.delete({
      where: { id: parseInt(userId) }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
