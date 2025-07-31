import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const reporterId = searchParams.get('reporterId');
    const reportedUserId = searchParams.get('reportedUserId');

    const where: any = {};
    if (status) where.status = status;
    if (reporterId) where.reporterId = parseInt(reporterId);
    if (reportedUserId) where.reportedUserId = parseInt(reportedUserId);

    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reportedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageData: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // تحويل profileImageData من Bytes إلى base64 string
    const reportsWithConvertedImages = reports.map(report => ({
      ...report,
      reportedUser: {
        ...report.reportedUser,
        profileImageData: report.reportedUser.profileImageData 
          ? Buffer.from(report.reportedUser.profileImageData).toString('base64')
          : null
      }
    }));

    return NextResponse.json(reportsWithConvertedImages);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reporterId, reportedUserId, reason, description, status = 'pending' } = body;

    if (!reporterId || !reportedUserId || !reason || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user is reporting themselves
    if (reporterId === reportedUserId) {
      return NextResponse.json(
        { error: 'Cannot report yourself' },
        { status: 400 }
      );
    }

    // Check if report already exists
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: parseInt(reporterId),
        reportedUserId: parseInt(reportedUserId),
        reason,
        status: {
          in: ['pending', 'under_review']
        }
      }
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'Similar report already exists' },
        { status: 409 }
      );
    }

    const report = await prisma.report.create({
      data: {
        reporterId: parseInt(reporterId),
        reportedUserId: parseInt(reportedUserId),
        reason,
        description,
        status
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reportedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageData: true
          }
        }
      }
    });

    // تحويل profileImageData من Bytes إلى base64 string
    const reportWithConvertedImage = {
      ...report,
      reportedUser: {
        ...report.reportedUser,
        profileImageData: report.reportedUser.profileImageData 
          ? Buffer.from(report.reportedUser.profileImageData).toString('base64')
          : null
      }
    };

    return NextResponse.json(reportWithConvertedImage, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const report = await prisma.report.update({
      where: { id: parseInt(id) },
      data: {
        status,
        adminNotes,
        updatedAt: new Date()
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reportedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageData: true
          }
        }
      }
    });

    // تحويل profileImageData من Bytes إلى base64 string
    const reportWithConvertedImage = {
      ...report,
      reportedUser: {
        ...report.reportedUser,
        profileImageData: report.reportedUser.profileImageData 
          ? Buffer.from(report.reportedUser.profileImageData).toString('base64')
          : null
      }
    };

    return NextResponse.json(reportWithConvertedImage);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
} 