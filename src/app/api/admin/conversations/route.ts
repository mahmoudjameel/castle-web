import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// جلب جميع المحادثات للإدارة
export async function GET(req: NextRequest) {
  try {
    // جلب جميع الرسائل مع بيانات المرسل والمستقبل
    const messages = await prisma.message.findMany({
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profileImageData: true,
            createdAt: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profileImageData: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('Total messages found:', messages.length);
    console.log('Sample message:', messages[0]);

    // تجميع المحادثات الفريدة
    const conversationMap = new Map<string, any>();
    
    messages.forEach(msg => {
      console.log('Processing message:', msg.id, 'Sender role:', msg.sender.role, 'Receiver role:', msg.receiver.role, 'Content:', msg.content.substring(0, 50));
      
      // إنشاء مفتاح فريد لكل محادثة (مستخدم + موهبة)
      const isUserToTalent = msg.sender.role === 'user' && msg.receiver.role === 'talent';
      const isTalentToUser = msg.sender.role === 'talent' && msg.receiver.role === 'user';
      const isAdminMessage = msg.sender.role === 'ADMIN' || msg.content.startsWith('[رسالة من الإدارة]:');
      
      console.log('isUserToTalent:', isUserToTalent, 'isTalentToUser:', isTalentToUser, 'isAdminMessage:', isAdminMessage);
      
      if (isUserToTalent || isTalentToUser || isAdminMessage) {
        console.log('Creating conversation for message:', msg.id);
        
        let userId, talentId;
        
        if (isAdminMessage) {
          // رسالة من الإدارة - استخدم receiverId كـ userId
          userId = msg.receiverId;
          // نحتاج لإيجاد talentId من الرسائل السابقة
          const relatedMessages = messages.filter(m => 
            (m.senderId === userId && m.receiver.role === 'talent') || 
            (m.receiverId === userId && m.sender.role === 'talent')
          );
          
          if (relatedMessages.length > 0) {
            const relatedMsg = relatedMessages[0];
            if (relatedMsg.sender.role === 'talent') {
              talentId = relatedMsg.sender.id;
            } else {
              talentId = relatedMsg.receiver.id;
            }
          } else {
            // إذا لم نجد رسائل سابقة، استخدم senderId كـ talentId (افتراض)
            talentId = msg.senderId;
          }
        } else {
          // رسالة عادية بين مستخدم وموهبة
          userId = isUserToTalent ? msg.sender.id : msg.receiver.id;
          talentId = isUserToTalent ? msg.receiver.id : msg.sender.id;
        }
        
        const conversationKey = `${userId}-${talentId}`;
        
        console.log('Conversation key:', conversationKey, 'User ID:', userId, 'Talent ID:', talentId);
        
        if (!conversationMap.has(conversationKey)) {
          console.log('Creating new conversation:', conversationKey);
          
          // نحتاج لجلب بيانات المستخدم والموهبة
          let user, talent;
          if (isAdminMessage) {
            // إذا كانت رسالة من الإدارة، نحتاج لإيجاد البيانات من الرسائل الأخرى
            const relatedMessages = messages.filter(m => 
              (m.senderId === userId && m.receiverId === talentId) || 
              (m.senderId === talentId && m.receiverId === userId)
            );
            
            if (relatedMessages.length > 0) {
              const firstMsg = relatedMessages[0];
              if (firstMsg.sender.role === 'user') {
                user = firstMsg.sender;
                talent = firstMsg.receiver;
              } else {
                user = firstMsg.receiver;
                talent = firstMsg.sender;
              }
            }
          } else {
            user = isUserToTalent ? msg.sender : msg.receiver;
            talent = isUserToTalent ? msg.receiver : msg.sender;
          }
          
          if (user && talent) {
            conversationMap.set(conversationKey, {
              conversationId: conversationKey,
              user: user,
              talent: talent,
              lastMessage: msg.content,
              lastMessageDate: msg.createdAt,
              lastMessageSender: msg.sender.id,
              totalMessages: 0,
              unreadCount: 0,
              messages: []
            });
          }
        }
        
        const conversation = conversationMap.get(conversationKey);
        if (conversation) {
          conversation.messages.push({
            id: msg.id,
            content: msg.content,
            senderId: msg.sender.id,
            receiverId: msg.receiver.id,
            createdAt: msg.createdAt,
            isRead: msg.isRead
          });
          conversation.totalMessages++;
          
          if (!msg.isRead && msg.receiverId === userId) {
            conversation.unreadCount++;
          }
        }
      } else {
        console.log('Message not matching user-talent pattern:', msg.id);
      }
    });

    // تحويل المحادثات إلى مصفوفة وترتيبها حسب آخر رسالة
    const conversations = Array.from(conversationMap.values())
      .map(conv => ({
        ...conv,
        user: {
          ...conv.user,
          profileImageData: conv.user.profileImageData ? Buffer.from(conv.user.profileImageData).toString('base64') : null
        },
        talent: {
          ...conv.talent,
          profileImageData: conv.talent.profileImageData ? Buffer.from(conv.talent.profileImageData).toString('base64') : null
        }
      }))
      .sort((a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime());

    console.log('Found conversations:', conversations.length);
    console.log('Conversations:', conversations);

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// إرسال رسالة من الإدارة
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, adminMessage, adminId } = body;
    
    if (!conversationId || !adminMessage || !adminId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // تجزئة conversationId للحصول على userId و talentId
    const [userId, talentId] = conversationId.split('-').map(Number);
    
    if (!userId || !talentId) {
      return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
    }

    // إنشاء رسالة من الإدارة
    const message = await prisma.message.create({
      data: {
        senderId: adminId,
        receiverId: userId, // إرسال للمستخدم
        content: `[رسالة من الإدارة]: ${adminMessage}`,
      },
    });

    // إضافة إشعار للمستخدم
    await prisma.notification.create({
      data: {
        userId: userId,
        title: 'رد من الإدارة',
        body: 'لديك رد من إدارة المنصة على استفسارك.',
      }
    });

    console.log('Admin message sent successfully:', message);

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending admin message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
