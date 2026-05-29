# Beeforce - نظام إدارة التموين

<div align="center">
  <img src="public/icon-512x512.png" alt="Beeforce Logo" width="120" />
  <h3>نظام إدارة التموين والإنتاج</h3>
  <p>Catering & Production Management System</p>
</div>

---

## 🚀 نظرة عامة

**Beeforce** هو نظام متكامل لإدارة عمليات التموين والإنتاج، يعمل على:
- 🖥️ **سطح المكتب** (Windows) عبر Electron
- 🌐 **المتصفح** (Web App / PWA)
- 📱 **الهاتف** (Progressive Web App)

## ⚙️ التقنيات المستخدمة

| التقنية | الإصدار | الاستخدام |
|--------|---------|-----------|
| React | 18.x | واجهة المستخدم |
| TypeScript | 5.x | نظام الأنواع |
| Vite | 6.x | بناء المشروع |
| Electron | 42.x | تطبيق سطح المكتب |
| Supabase | 2.x | قاعدة البيانات والـ Realtime |
| Tailwind CSS | 3.x | التصميم |
| Recharts | 2.x | الرسوم البيانية |
| Lucide React | 0.364 | الأيقونات |

## 📁 هيكل المشروع

```
beeforce-app/
├── src/
│   ├── components/         # مكونات الواجهة
│   │   ├── App.tsx         # المكون الرئيسي
│   │   └── ui.tsx          # مكونات UI المشتركة
│   ├── lib/
│   │   ├── context.tsx     # State Management (React Context)
│   │   ├── types.ts        # TypeScript Types & Constants
│   │   ├── supabase.ts     # Supabase Client
│   │   └── gemini.ts       # Gemini AI Integration
│   ├── hooks/
│   │   └── use-mobile.tsx  # Hook للكشف عن الجوال
│   ├── styles/
│   │   └── globals.css     # الستايل العام
│   └── main.tsx            # نقطة الدخول
├── electron/
│   └── main.js             # Electron Main Process
├── public/
│   ├── sw.js               # Service Worker (PWA)
│   ├── manifest.json       # Web App Manifest
│   ├── icon-192x192.png    # أيقونة التطبيق (صغيرة)
│   └── icon-512x512.png    # أيقونة التطبيق (كبيرة)
├── database/               # ملفات SQL لإعداد Supabase
│   ├── supabase-setup.sql
│   ├── notifications-setup.sql
│   ├── rls-setup.sql
│   ├── storage-setup.sql
│   └── add-receipt-images.sql
└── scripts/                # سكريبتات التطوير والنقل
    ├── refactor.cjs
    ├── refactor-auth.cjs
    └── check_ids.js
```

## 🔧 الإعداد والتشغيل

### المتطلبات
- Node.js 18+
- npm 9+

### التثبيت
```bash
npm install
```

### وضع التطوير (متصفح)
```bash
npm run dev
```

### وضع التطوير (Electron)
```bash
npm run electron:dev
```

### البناء للويب
```bash
npm run build
```

### بناء تطبيق Windows
```bash
npm run electron:build
```

## 🗄️ إعداد قاعدة البيانات

تشغيل ملفات SQL بالترتيب في Supabase SQL Editor:
1. `database/supabase-setup.sql` - الجداول الأساسية
2. `database/notifications-setup.sql` - نظام الإشعارات
3. `database/add-receipt-images.sql` - صور الفواتير
4. `database/rls-setup.sql` - سياسات الأمان (RLS)
5. `database/storage-setup.sql` - Storage Bucket للفواتير

## 🌐 البيئات

| البيئة | الرابط / الطريقة |
|--------|----------|
| Web/PWA | نشر الـ dist على أي استضافة |
| Electron | `npm run electron:build` |
| Supabase | [bgoepilmrozycsbgpsku.supabase.co](https://app.supabase.com) |

## 📋 الميزات الرئيسية

- ✅ إدارة المشاريع والعملاء
- ✅ المعاملات المالية والتقارير
- ✅ نظام الإشعارات في الوقت الفعلي
- ✅ قراءة الفواتير بالذكاء الاصطناعي (Gemini AI)
- ✅ إدارة المخزون والوحدات
- ✅ نظام صلاحيات المستخدمين
- ✅ دعم اللغة العربية (RTL)
- ✅ يعمل كـ PWA على الهاتف
- ✅ تطبيق سطح مكتب (Electron)
