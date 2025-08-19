import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url!);
    const id = searchParams.get('id');
    const role = searchParams.get('role');
    const where: any = {};
    if (id) where.id = Number(id);
    if (role) {
      where.role = role;
    }
    // جلب المستخدمين مع التصنيفات المرتبطة (عبر جدول الربط UserCategory)
    const users = await prisma.user.findMany({
      where,
      include: {
        userCategories: { include: { category: true } }
      }
    });
    // تحويل profileImageData إلى base64 إذا كانت موجودة مع إرجاع قائمة التصنيفات المسطحة
    const usersWithImage = users.map(u => {
      const categories = (u as any).userCategories?.map((uc: any) => uc.category) || [];
      if (u.profileImageData && typeof u.profileImageData !== 'string') {
        return { ...u, profileImageData: Buffer.from(u.profileImageData).toString('base64'), categories };
      }
      return { ...u, categories };
    });
    return NextResponse.json(usersWithImage);
  } catch (err) {
    return NextResponse.json({ message: 'خطأ في جلب الحسابات.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    let { id, approved, age, bio, socialLinks, categories, profileImageData, workingSchedule, jobTitle, services, name, workArea, canTravelAbroad, role, eyeColor, hairStyle, height, weight, skinColor, language, accent, features, hairColor } = body;
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
    if (typeof profileImageData === 'string') data.profileImageData = Buffer.from(profileImageData, 'base64');
    if (typeof workingSchedule === 'string') data.workingSchedule = workingSchedule;
    if (typeof jobTitle === 'string') data.jobTitle = jobTitle;
    if (typeof services === 'string') data.services = services;
    if (typeof name === 'string') data.name = name;
    if (typeof workArea === 'string') data.workArea = workArea;
    if (typeof canTravelAbroad === 'boolean') data.canTravelAbroad = canTravelAbroad;
    if (typeof role === 'string' && ['user', 'talent', 'admin'].includes(role)) data.role = role;
    if (typeof eyeColor === 'string') data.eyeColor = eyeColor;
    // hairStyle can be string or array; store arrays as JSON string
    if (Array.isArray(hairStyle)) data.hairStyle = JSON.stringify(hairStyle);
    else if (typeof hairStyle === 'string') data.hairStyle = hairStyle;
    if (typeof height === 'number' || (typeof height === 'string' && height !== '')) data.height = Number(height);
    if (typeof weight === 'number' || (typeof weight === 'string' && weight !== '')) data.weight = Number(weight);
    if (typeof skinColor === 'string') data.skinColor = skinColor;
    // language can be string or array; store arrays as JSON string
    if (Array.isArray(language)) data.language = JSON.stringify(language);
    else if (typeof language === 'string') data.language = language;
    // accent can be string or array; store arrays as JSON string
    if (Array.isArray(accent)) data.accent = JSON.stringify(accent);
    else if (typeof accent === 'string') data.accent = accent;
    if (typeof features === 'string') data.features = features;
    if (typeof hairColor === 'string') data.hairColor = hairColor;
    // تحديث بيانات المستخدم
    const user = await prisma.user.update({ where: { id }, data });
    // تحديث التصنيفات المرتبطة
    if (Array.isArray(categories)) {
      await prisma.userCategory.deleteMany({ where: { userId: id } });
      for (const categoryId of categories) {
        await prisma.userCategory.create({ data: { userId: id, categoryId } });
      }
    }
    // جلب المستخدم مع التصنيفات بعد التحديث
    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: {
        userCategories: { include: { category: true } }
      }
    });
    const categoriesArr = (updatedUser as any)?.userCategories?.map((uc: any) => uc.category) || [];
    return NextResponse.json({ ...updatedUser, categories: categoriesArr });
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