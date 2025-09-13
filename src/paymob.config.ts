import { NextResponse } from 'next/server';

export const PAYMOB_CONFIG = {
  // API Keys
  API_KEY: process.env.PAYMOB_API_KEY || '',
  SECRET_KEY: process.env.PAYMOB_SECRET_KEY || '',
  PUBLIC_KEY: process.env.PAYMOB_PUBLIC_KEY || '',

  // Integration IDs - Updated with correct Apple Pay data
  INTEGRATIONS: {
    CARD_PAYMENT: {
      ID: parseInt(process.env.PAYMOB_CARD_PAYMENT_ID || '14252'), // MIGS-online website
      NAME: 'MIGS-online website',
      IFRAME_ID: process.env.PAYMOB_CARD_PAYMENT_IFRAME_ID || '9589'
    },
    APPLE_PAY: {
      ID: parseInt(process.env.PAYMOB_APPLE_PAY_ID || '14250'), // MIGS-online (APPLE PAY) website
      NAME: 'MIGS-online (APPLE PAY) website',
      IFRAME_ID: process.env.PAYMOB_APPLE_PAY_IFRAME_ID || '14250'
    },
    APPLE_PAY_LINK: {
      ID: parseInt(process.env.PAYMOB_APPLE_PAY_LINK_ID || '14251'), // MIGS-online (APPLE PAY) PL
      NAME: 'MIGS-online (APPLE PAY) PL',
      IFRAME_ID: process.env.PAYMOB_APPLE_PAY_LINK_IFRAME_ID || '14251'
    }
  },

  // API Endpoints
  API: {
    BASE_URL: 'https://ksa.paymob.com/api',
    AUTH: '/auth/tokens',
    ORDER: '/ecommerce/orders',
    PAYMENT_KEY: '/acceptance/payment_keys',
    IFRAME_URL: 'https://ksa.paymob.com/api/acceptance/iframes'
  },

  // Callbacks - Updated to production URLs
  CALLBACKS: {
    SUCCESS_URL: 'http://localhost:3000/payment-success',
    FAILED_URL: 'http://localhost:3000/payment-failed',
    TRANSACTION_CALLBACK: 'http://localhost:3000/api/paymob-callback',
    RESPONSE_CALLBACK: 'http://localhost:3000/api/paymob-callback'
  }
};

export async function POST(req: Request) {
  try {
    const { amount, user, paymentMethod } = await req.json();

    console.log('Request data:', { amount, user, paymentMethod });
    
    if (!amount || !user) {
      return NextResponse.json({ 
        error: 'بيانات الطلب غير مكتملة',
        details: 'المبلغ أو بيانات المستخدم مفقودة'
      }, { status: 400 });
    }

    // اختيار إعدادات طريقة الدفع - استخدام Integration واحد فقط مؤقتاً
    let integrationConfig = PAYMOB_CONFIG.INTEGRATIONS.CARD_PAYMENT; // Default to card payment
    
    // مؤقتاً: استخدام نفس Integration لجميع طرق الدفع حتى يتم حل مشكلة Integration IDs
    // TODO: إعادة تفعيل Apple Pay عندما يتم التحقق من Integration IDs الصحيحة

    if (!PAYMOB_CONFIG.API_KEY) {
      console.error('PAYMOB_API_KEY is missing');
      return NextResponse.json({ 
        error: 'إعدادات Paymob غير مكتملة',
        details: 'API key مفقود'
      }, { status: 500 });
    }

    if (!integrationConfig.ID || !integrationConfig.IFRAME_ID) {
      console.error('Integration ID or Iframe ID is missing');
      return NextResponse.json({ 
        error: 'إعدادات Paymob غير مكتملة',
        details: 'Integration ID أو Iframe ID مفقود'
      }, { status: 500 });
    }

    console.log('Config check passed');
    console.log('API Key length:', PAYMOB_CONFIG.API_KEY?.length);
    console.log('Integration ID:', integrationConfig.ID);
    console.log('Iframe ID:', integrationConfig.IFRAME_ID);

    // 1. Get Auth Token - استخدام الرابط الصحيح للسعودية
    console.log('=== الخطوة 1: الحصول على Auth Token ===');
    
    const authPayload = { 
      api_key: PAYMOB_CONFIG.API_KEY
    };
    
    console.log('Attempting authentication...');
    
    // استخدام الرابط الصحيح للسعودية
    const authUrl = `${PAYMOB_CONFIG.API.BASE_URL}${PAYMOB_CONFIG.API.AUTH}`;
    console.log('Auth URL:', authUrl);
    
    const authRes = await fetch(authUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(authPayload)
    });
    
    console.log('Auth response status:', authRes.status);
    console.log('Auth response headers:', Object.fromEntries(authRes.headers.entries()));
    
    // تحقق خاص من خطأ 401 (Unauthorized) أو 403 (Forbidden)
    if (authRes.status === 401 || authRes.status === 403) {
      console.error('Authentication failed - Invalid API Key');
      const errorResponse = await authRes.text();
      console.error('Error response:', errorResponse);
      return NextResponse.json({ 
        error: 'خطأ في بيانات الاعتماد. يرجى التحقق من إعدادات Paymob',
        details: `API Key غير صحيح أو منتهي الصلاحية. استجابة الخطأ: ${errorResponse}`
      }, { status: 401 });
    }
    
    if (!authRes.ok) {
      const errorText = await authRes.text();
      console.error('Auth request failed:', errorText);
      return NextResponse.json({ 
        error: 'فشل في المصادقة مع Paymob',
        details: `HTTP ${authRes.status}: ${errorText}`
      }, { status: 400 });
    }
    
    let authJson;
    try {
      authJson = await authRes.json();
    } catch (parseError) {
      console.error('Failed to parse auth response as JSON');
      return NextResponse.json({ 
        error: 'خطأ في تحليل استجابة المصادقة',
        details: 'استجابة غير صحيحة من Paymob'
      }, { status: 400 });
    }
    
    console.log('Auth response success:', { 
      hasToken: !!authJson.token,
      profile: authJson.profile ? 'exists' : 'missing'
    });
    
    if (!authJson.token) {
      console.error('No token in auth response:', authJson);
      return NextResponse.json({ 
        error: 'لم يتم الحصول على token من Paymob',
        details: 'استجابة المصادقة لا تحتوي على token صحيح'
      }, { status: 400 });
    }

    const { token } = authJson;

    // 2. Create Order - استخدام الرابط الصحيح للسعودية
    console.log('=== الخطوة 2: إنشاء الطلب ===');
    
    const orderPayload = {
      auth_token: token,
      delivery_needed: "false",
      amount_cents: String(amount * 100),
      currency: "SAR",
      items: []
    };
    
    console.log('Order payload:', {
      ...orderPayload,
      auth_token: '***hidden***'
    });

    const orderUrl = `${PAYMOB_CONFIG.API.BASE_URL}${PAYMOB_CONFIG.API.ORDER}`;
    console.log('Order URL:', orderUrl);

    const orderRes = await fetch(orderUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });
    
    console.log('Order response status:', orderRes.status);
    
    if (!orderRes.ok) {
      const errorText = await orderRes.text();
      console.error('Order request failed:', errorText);
      return NextResponse.json({ 
        error: 'فشل في إنشاء الطلب',
        details: `HTTP ${orderRes.status}: ${errorText}`
      }, { status: 400 });
    }
    
    const orderData = await orderRes.json();
    console.log('Order response success:', { 
      id: orderData.id,
      amount_cents: orderData.amount_cents 
    });
    
    if (!orderData.id) {
      console.error('No order ID in response:', orderData);
      return NextResponse.json({ 
        error: 'لم يتم الحصول على معرف الطلب',
        details: 'استجابة إنشاء الطلب لا تحتوي على ID'
      }, { status: 400 });
    }

    const orderId = orderData.id;

    // 3. Create Payment Key - استخدام الرابط الصحيح للسعودية
    console.log('=== الخطوة 3: إنشاء مفتاح الدفع ===');
    
    const paymentKeyPayload = {
      auth_token: token,
      amount_cents: String(amount * 100),
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        apartment: "NA",
        email: user.email || "test@example.com",
        floor: "NA",
        first_name: user.firstName || "Test",
        street: "NA",
        building: "NA",
        phone_number: user.phone || "+966500000000",
        shipping_method: "NA",
        postal_code: "12345",
        city: "Riyadh",
        country: "SA",
        last_name: user.lastName || "User",
        state: "Riyadh"
      },
      currency: "SAR",
      integration_id: integrationConfig.ID
    };
    
    console.log('Payment key payload:', {
      ...paymentKeyPayload,
      auth_token: '***hidden***',
      billing_data: { 
        ...paymentKeyPayload.billing_data,
        email: '***hidden***',
        phone_number: '***hidden***'
      }
    });

    const paymentKeyUrl = `${PAYMOB_CONFIG.API.BASE_URL}${PAYMOB_CONFIG.API.PAYMENT_KEY}`;
    console.log('Payment key URL:', paymentKeyUrl);

    const paymentKeyRes = await fetch(paymentKeyUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(paymentKeyPayload)
    });
    
    console.log('Payment key response status:', paymentKeyRes.status);
    
    if (!paymentKeyRes.ok) {
      const errorText = await paymentKeyRes.text();
      console.error('Payment key request failed:', errorText);
      return NextResponse.json({ 
        error: 'فشل في إنشاء مفتاح الدفع',
        details: `HTTP ${paymentKeyRes.status}: ${errorText}`
      }, { status: 400 });
    }
    
    const paymentKeyData = await paymentKeyRes.json();
    console.log('Payment key response success:', { 
      hasToken: !!paymentKeyData.token 
    });
    
    if (!paymentKeyData.token) {
      console.error('No payment token in response:', paymentKeyData);
      return NextResponse.json({ 
        error: 'لم يتم الحصول على payment token',
        details: 'استجابة مفتاح الدفع لا تحتوي على token'
      }, { status: 400 });
    }

    const paymentToken = paymentKeyData.token;

    // 4. Return iframe link - استخدام الرابط الصحيح للسعودية
    const iframeUrl = `${PAYMOB_CONFIG.API.IFRAME_URL}/${integrationConfig.IFRAME_ID}?payment_token=${paymentToken}`;
    
    console.log('=== النجاح: تم إنشاء رابط الدفع ===');
    console.log('Iframe URL created successfully');
    console.log('Final iframe URL:', iframeUrl);

    return NextResponse.json({
      iframe: iframeUrl,
      success: true
    });

  } catch (error) {
    console.error('=== خطأ عام في Paymob API ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({
      error: 'خطأ في الاتصال مع Paymob',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}