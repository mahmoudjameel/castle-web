import nodemailer from "nodemailer";

// إنشاء transporter للبريد الإلكتروني
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// دالة إرسال البريد الإلكتروني
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("تم إرسال البريد الإلكتروني:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("خطأ في إرسال البريد الإلكتروني:", error);
    throw error;
  }
}

// دالة إرسال رابط إعادة تعيين كلمة المرور
export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  const subject = "إعادة تعيين كلمة المرور";
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>إعادة تعيين كلمة المرور</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        .title {
          color: #333;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #666;
          font-size: 16px;
        }
        .content {
          margin-bottom: 30px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #333;
        }
        .message {
          font-size: 16px;
          margin-bottom: 25px;
          color: #555;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 25px;
          font-weight: bold;
          font-size: 16px;
          margin: 20px 0;
          text-align: center;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
          color: #856404;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
        .link {
          color: #667eea;
          text-decoration: none;
        }
        .link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">ك</div>
          <div class="title">إعادة تعيين كلمة المرور</div>
          <div class="subtitle">منصة المواهب</div>
        </div>
        
        <div class="content">
          <div class="greeting">مرحباً ${name}،</div>
          
          <div class="message">
            لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.
            إذا لم تكن أنت من طلب هذا التغيير، يمكنك تجاهل هذا البريد الإلكتروني.
          </div>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          
          <div class="warning">
            <strong>تنبيه:</strong> هذا الرابط صالح لمدة ساعة واحدة فقط. 
            إذا انتهت صلاحية الرابط، يمكنك طلب رابط جديد من صفحة تسجيل الدخول.
          </div>
          
          <div class="message">
            إذا لم يعمل الزر أعلاه، يمكنك نسخ الرابط التالي ولصقه في متصفحك:
            <br>
            <a href="${resetUrl}" class="link">${resetUrl}</a>
          </div>
        </div>
        
        <div class="footer">
          <p>هذا البريد الإلكتروني تم إرساله من منصة المواهب</p>
          <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to, subject, html });
}
