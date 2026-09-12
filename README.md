# Yamen's Hub — مركز يامن الدراسي

موقع شخصي: الجدول، التقويم، المواد، الملخصات بالعربي والإنجليزي، والبطاقات.
صفحات ثابتة — تشتغل على GitHub Pages بدون سيرفر. **الرابط:** https://wan292.github.io/yamen-hub/

## البنية — نظام واحد لكل الدروس

```
index.html            اللوحة (اليوم · الأسبوع · التقويم · المواد · الملخصات · الخريطة · البطاقات)
data.js               بيانات يامن: الجدول، المواد، المواعيد، الإجازات، الملخصات، الخريطة
assets/theme.css      الثيم المشترك — وضع داكن (ذهبي على أسود، الافتراضي) ووضع فاتح
assets/lesson.js      سلوك الصفحة: تبديل الثيم، نافذات الترجمة، الصوت، شريط القراءة، زر التدرّب
assets/flashcards.js  محرّك البطاقات: صناديق Leitner، التقدّم في localStorage، واجهة القلب
data/cards-S1.js …    مجموعة بطاقات لكل قسم (كلمات + مفاهيم)
lessons/ACCT203-CH1-S1.html      الدرس بالعربي
lessons/ACCT203-CH1-S1-EN.html   الدرس بالإنجليزي مع ترجمة بالضغط
```

**القاعدة:** الدرس ما يحمل CSS ولا JavaScript خاص به. يربط الملفات المشتركة فقط.
أي تغيير في `assets/` ينطبق على كل الدروس الحالية والقادمة.

## كيف تضيف درساً جديداً

1. انسخ أقرب درس (عربي + إنجليزي) وغيّر المحتوى. حافظ على نفس الهيكل:
   `.topbar` → `header.lh` → `.big` → `.concept` (بداخله `.chead` + `.cbody`) → `.q` → جدول المصطلحات → `.footnav`
2. في `<head>` اترك:
   ```html
   <link rel="stylesheet" href="../assets/theme.css">
   <script>(function(){var t="dark";try{t=localStorage.getItem("yh-theme")||"dark"}catch(e){}document.documentElement.setAttribute("data-theme",t)})();</script>
   ```
3. آخر `<body>`:
   ```html
   <script src="../data/cards-S<N>.js"></script>
   <script src="../assets/flashcards.js"></script>
   <script src="../assets/lesson.js"></script>
   ```
4. أنشئ `data/cards-S<N>.js` بنفس شكل الملفات الموجودة، وأضف الدرس في `LESSONS` و`MAP` داخل `data.js`،
   وأضف `<script src="data/cards-S<N>.js">` في `index.html` عشان يظهر في تبويب البطاقات.

## عناصر الدرس

| العنصر | الاستخدام |
|---|---|
| `<span class="g" data-ar="…" data-x="…">word</span>` | كلمة مفردات: خط ذهبي، ترجمة + شرح بالعامية، تدخل جدول المصطلحات والبطاقات. يضاف لها زر 🔊 تلقائياً |
| `<span class="g2" data-ar="…">word</span>` | ترجمة سريعة بالضغط، خط منقّط، لا تدخل الجدول |
| `<div class="ico">💰</div>` أول عنصر في `.chead` | رمز بصري للمفهوم |
| `<div class="hook-mem"><span class="e">🧠</span><div>…</div></div>` | خطّاف ذاكرة — جملة بصورة |
| `<mark class="k">…</mark>` | تظليل ذهبي لما يُختبر عليه |
| `.exam` | نص الكتاب حرفياً — يبقى بدون ترجمات، ويظهر كورقة فاتحة في الوضعين |
| `<button class="pill gold" data-deck="ACCT203-CH1-S3">تدرّب</button>` | يفتح بطاقات ذلك الدرس (`data-mode="ar"` للاتجاه عربي ← إنجليزي) |

## البطاقات

- كل بطاقة: `{id, kind:"vocab"|"concept", en, ar, x, ex}`.
- خمسة صناديق: الخطأ يرجع للصندوق ٠ (يظهر مرة ثانية في نفس الجلسة)، والصح يتقدّم صندوقاً.
  الاستحقاق: ٠ يوم · ١ · ٣ · ٧ · ١٤ يوم.
- التقدّم محفوظ في المتصفح (`localStorage`) — لكل جهاز على حدة.
- اختصارات: مسافة/Enter يقلب، `1` أو ← «ما عرفتها»، `2` أو → «عرفتها»، Esc يغلق.
- الصوت من المتصفح نفسه (`speechSynthesis`) — بدون إنترنت إضافي، يشتغل على iPhone.

## التعديل اليومي

كل البيانات في **`data.js`**. أضف موعداً:

```js
{ date:"2026-11-03", code:"MGT 102", title:"كويز ١", kind:"exam", weight:10, note:"يغطي الفصول ١–٣" }
```

ثم:

```bash
git add -A && git commit -m "update" && git push
```

## ناقص

- [ ] دليل مقرر **MGT 102** — أهم مستند ناقص
- [ ] دليل مقرر ACCT 203 و LAW 333
- [ ] تأكيد تاريخ الاختبار النصفي لـ MKT 231 (٢٥٪)
- [ ] ACCT 203: تمارين FastForward ٢–١١، والمبادئ والفروض
