import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url!);
    const id = searchParams.get('id');
    const categoryId = searchParams.get('categoryId');
    const role = searchParams.get('role');
    const where: any = {};
    if (id) where.id = Number(id);
    if (categoryId) where.categoryId = categoryId;
    if (role) {
      if (role.includes(',')) {
        where.role = { in: role.split(',').map(r => r.trim()) };
      } else {
        where.role = role;
      }
    } else {
      // الافتراضي: جلب المواهب فقط
      where.role = 'talent';
    }
    const users = await prisma.user.findMany({ where });
    // تحويل profileImageData إلى base64 إذا كانت موجودة
    const usersWithImage = users.map(u => {
      if (u.profileImageData && typeof u.profileImageData !== 'string') {
        return { ...u, profileImageData: Buffer.from(u.profileImageData).toString('base64') };
      }
      return u;
    });
    return NextResponse.json(usersWithImage);
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في جلب الحسابات.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    let { id, approved, age, bio, socialLinks, categoryId, profileImageData, workingSchedule, jobTitle, services, name, workArea, canTravelAbroad } = body;
    if (!id) {
      return NextResponse.json({ message: 'id مطلوب.' }, { status: 400 });
    }
    // تأكد أن id رقم
    id = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(id)) {
      return NextResponse.json({ message: 'id غير صالح.' }, { status: 400 });
    }
    const data: any = {};
    if (typeof approved === 'boolean') data.approved = approved;
    if (typeof age === 'number') data.age = age;
    if (typeof bio === 'string') data.bio = bio;
    if (socialLinks) data.socialLinks = typeof socialLinks === 'string' ? socialLinks : JSON.stringify(socialLinks);
    if (typeof categoryId === 'string') data.categoryId = categoryId || null;
    if (typeof profileImageData === 'string') data.profileImageData = Buffer.from(profileImageData, 'base64');
    if (typeof workingSchedule === 'string') data.workingSchedule = workingSchedule;
    if (typeof jobTitle === 'string') data.jobTitle = jobTitle;
    if (typeof services === 'string') data.services = services;
    if (typeof name === 'string') data.name = name;
    if (typeof workArea === 'string') data.workArea = workArea;
    if (typeof canTravelAbroad === 'boolean') data.canTravelAbroad = canTravelAbroad;
    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json(user);
  } catch (err) {
    console.error('PATCH /api/accounts error:', err);
    const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
    return NextResponse.json({ message: `خطأ في تحديث المستخدم: ${errorMessage}` }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url!);
    const all = searchParams.get('all');
    
    if (all === 'true') {
      // حذف جميع المستخدمين
      console.log('Attempting to delete all users...');
      
      // حذف البيانات المرتبطة أولاً
      await prisma.talentReview.deleteMany({});
      await prisma.talentOrder.deleteMany({});
      await prisma.notification.deleteMany({});
      await prisma.message.deleteMany({});
      await prisma.portfolioItem.deleteMany({});
      
      // ثم حذف المستخدمين
      const result = await prisma.user.deleteMany({});
      console.log('Deleted users:', result);
      
      return NextResponse.json({ message: 'تم حذف جميع الحسابات.' });
    } else {
      // حذف مستخدم واحد
      const { id } = await req.json();
      if (!id) return NextResponse.json({ message: 'id مطلوب.' }, { status: 400 });
      await prisma.user.delete({ where: { id } });
      return NextResponse.json({ message: 'تم حذف الحساب.' });
    }
  } catch (err) {
    console.error('Delete error:', err);
    const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف';
    return NextResponse.json({ message: `خطأ في حذف الحساب: ${errorMessage}` }, { status: 500 });
  }
} 