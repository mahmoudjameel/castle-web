#!/bin/bash
# سكريبت لاختبار رفع الفيديو على السيرفر

echo "🧪 اختبار رفع الفيديو على toqtalent.com"
echo "========================================="
echo ""

# ألوان للرسائل
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# الخطوة 1: اختبار الاتصال بالسيرفر
echo "1️⃣ اختبار الاتصال بالسيرفر..."
if curl -s -o /dev/null -w "%{http_code}" https://toqtalent.com | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ السيرفر يعمل${NC}"
else
    echo -e "${RED}❌ لا يمكن الوصول إلى السيرفر${NC}"
    exit 1
fi

echo ""

# الخطوة 2: فحص نوع السيرفر
echo "2️⃣ فحص نوع السيرفر..."
SERVER_TYPE=$(curl -s -I https://toqtalent.com | grep -i "server:" | awk '{print $2}')
echo -e "${YELLOW}نوع السيرفر: $SERVER_TYPE${NC}"

echo ""

# الخطوة 3: اختبار رفع ملف صغير
echo "3️⃣ اختبار رفع ملف صغير (1MB)..."
# إنشاء ملف تجريبي 1MB
dd if=/dev/zero of=test_1mb.dat bs=1M count=1 2>/dev/null

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
  -F "file=@test_1mb.dat" \
  -F "userId=999" \
  -F "type=video" \
  -F "title=Test Upload" \
  https://toqtalent.com/api/portfolio)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ رفع الملف الصغير نجح (HTTP $HTTP_CODE)${NC}"
elif [ "$HTTP_CODE" = "413" ]; then
    echo -e "${RED}❌ خطأ 413 - السيرفر يرفض الملف${NC}"
    echo -e "${YELLOW}الحل: عدّل إعدادات السيرفر (انظر SERVER_CONFIGURATION_GUIDE.md)${NC}"
else
    echo -e "${RED}❌ خطأ HTTP $HTTP_CODE${NC}"
    echo "$RESPONSE" | grep -v "HTTP_CODE"
fi

rm -f test_1mb.dat
echo ""

# الخطوة 4: اختبار رفع ملف متوسط
echo "4️⃣ اختبار رفع ملف متوسط (10MB)..."
echo -e "${YELLOW}⚠️  قد يستغرق بعض الوقت...${NC}"

# إنشاء ملف تجريبي 10MB
dd if=/dev/zero of=test_10mb.dat bs=1M count=10 2>/dev/null

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
  -F "file=@test_10mb.dat" \
  -F "userId=999" \
  -F "type=video" \
  -F "title=Test Upload 10MB" \
  https://toqtalent.com/api/portfolio)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ رفع الملف المتوسط نجح (HTTP $HTTP_CODE)${NC}"
elif [ "$HTTP_CODE" = "413" ]; then
    echo -e "${RED}❌ خطأ 413 - الحد الأقصى للسيرفر أقل من 10MB${NC}"
    echo -e "${YELLOW}الحل:${NC}"
    echo "  - Nginx: client_max_body_size 500M;"
    echo "  - Apache: LimitRequestBody 524288000"
else
    echo -e "${RED}❌ خطأ HTTP $HTTP_CODE${NC}"
fi

rm -f test_10mb.dat
echo ""

# الخطوة 5: التوصيات
echo "📋 التوصيات:"
echo "============"
echo ""

if [ "$HTTP_CODE" = "413" ]; then
    echo -e "${YELLOW}المشكلة: السيرفر يرفض الملفات الكبيرة${NC}"
    echo ""
    echo "إذا كان السيرفر Nginx:"
    echo "  sudo nano /etc/nginx/nginx.conf"
    echo "  أضف: client_max_body_size 500M;"
    echo "  sudo systemctl reload nginx"
    echo ""
    echo "إذا كان السيرفر Apache:"
    echo "  sudo nano /etc/apache2/apache2.conf"
    echo "  أضف: LimitRequestBody 524288000"
    echo "  sudo systemctl restart apache2"
    echo ""
    echo "للمزيد: اقرأ SERVER_CONFIGURATION_GUIDE.md"
else
    echo -e "${GREEN}✅ السيرفر يدعم رفع الملفات!${NC}"
    echo ""
    echo "يمكنك الآن رفع فيديوهات من المتصفح"
fi

echo ""
echo "🔗 روابط مفيدة:"
echo "  - دليل الإعداد: SERVER_CONFIGURATION_GUIDE.md"
echo "  - إعدادات Nginx: nginx.conf"
echo "  - توثيق الإصلاح: FIX_413_ERROR.md"
