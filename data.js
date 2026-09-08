/* ============================================================
   بيانات يامن — عدّل هنا فقط، الصفحة تقرأ منه تلقائياً
   Yamen's data. Edit ONLY this file; index.html renders from it.
   ============================================================ */

const STUDENT = {
  name: "يامن",
  college: "كلية إدارة الأعمال",
  dept: "قسم الإدارة",
  level: 3,
  term: "الفصل الأول ١٤٤٨هـ",
  advisor: "د. قيس المنصف صالح عزيز",
  credits: 13
};

/* بداية ونهاية الفصل */
const TERM = {
  start: "2026-08-23",   // الأسبوع الأول
  end:   "2026-12-17",   // نهاية الأسبوع ١٦
  months: ["2026-08","2026-09","2026-10","2026-11","2026-12","2027-01"]
};

/* المواد الخمس */
const COURSES = [
  { code:"MGT 102", sec:"M3",  cr:3, ar:"مبادئ الإدارة",             en:"Principles of Management",
    teacher:"—", room:"105FC001", lang:"—", color:"#b3261e", retake:true,
    note:"إعادة. متطلب سابق لأربع مواد في المستوى الثالث وثمان مواد بعدها. أهم مادة هذا الفصل." },
  { code:"ACCT 203", sec:"M4", cr:3, ar:"مبادئ المحاسبة المالية",   en:"Principles of Financial Accounting",
    teacher:"د. محمود عبدالعليم الخولي", room:"105FC002", lang:"إنجليزي", color:"#1b5e9c",
    note:"الكتاب McGraw Hill — Wild. الواجبات على SmartBook / Connect." },
  { code:"LAW 333", sec:"M4",  cr:3, ar:"البيئة القانونية للأعمال",  en:"Legal Environment of Business",
    teacher:"د. احمد خلف الله الطلحي", room:"105FC003 / 105FC001", lang:"—", color:"#6a4c93",
    note:"الأنظمة سعودية — لا تذاكر من مصادر أمريكية." },
  { code:"MKT 231", sec:"M23", cr:2, ar:"سلوك المستهلك في السياحة", en:"Consumer Behavior in Tourism",
    teacher:"د. مروان بن حامد الأحمدي", room:"105FC004", lang:"عربي", color:"#1a7a5e",
    note:"التدريس بالعربي. دليل المقرر موجود — توزيع الدرجات معروف." },
  { code:"GS 151", sec:"M2",  cr:2, ar:"مهارات الحياة الجامعية",    en:"University Life Skills",
    teacher:"د. عبدالرحيم نويجع الحربي", room:"أونلاين — Blackboard", lang:"عربي", color:"#8a6d1f",
    online:true, note:"محاضرة أونلاين على البلاك بورد." }
];

/* الجدول الأسبوعي — 0=الأحد ... 4=الخميس */
const SCHEDULE = [
  { day:0, from:"09:00", to:"10:40", code:"LAW 333"  },
  { day:0, from:"14:00", to:"15:40", code:"GS 151"   },
  { day:0, from:"16:00", to:"17:15", code:"MGT 102"  },
  { day:1, from:"09:00", to:"10:15", code:"ACCT 203" },
  { day:2, from:"09:00", to:"10:40", code:"MKT 231"  },
  { day:2, from:"16:00", to:"17:15", code:"MGT 102"  },
  { day:3, from:"09:00", to:"09:50", code:"LAW 333"  },
  { day:4, from:"09:00", to:"10:15", code:"ACCT 203" }
];

/* المواعيد المهمة */
const DEADLINES = [
  { date:"2026-10-14", code:"—",        title:"آخر موعد للانسحاب بعذر", kind:"univ",
    note:"نهائي — لا يمكن التراجع بعده" },
  { date:"2026-10-28", code:"—",        title:"آخر موعد للاعتذار عن الفصل", kind:"univ",
    note:"نهائي — لا يمكن التراجع بعده" },
  { date:"2026-10-20", code:"MKT 231",  title:"الاختبار النصفي", kind:"exam", weight:25,
    note:"⚠ التاريخ تقديري — لازم تتأكد من الدكتور", unconfirmed:true },
  { date:"2026-12-06", code:"MKT 231",  title:"مناقشة البحث الجماعي والعرض الشفوي", kind:"task", weight:10,
    note:"الأسبوعان ١٥ و١٦ (٦–١٧ ديسمبر). بحث جماعي — ابدأ بدري" },
  { date:"2027-02-01", code:"ACCT 203", title:"SmartBook — الفصل الأول", kind:"task",
    note:"٦٢ مفهوم · الوقت المقدّر ساعتان و٩ دقائق · ⚠ تأكد من التاريخ في Connect", unconfirmed:true }
];

/* الإجازات */
const HOLIDAYS = [
  { from:"2026-09-23", to:"2026-09-24", name:"إجازة اليوم الوطني" },
  { from:"2026-11-20", to:"2026-11-28", name:"إجازة الخريف" }
];

/* توزيع الدرجات — من دليل المقرر */
const GRADING = {
  "MKT 231": { confirmed:true, source:"دليل مقرر سلوك المستهلك ١٤٤٨", items:[
    { ar:"المشاركة والمناقشة", w:10, when:"مستمر", attend:true },
    { ar:"اختبار نصفي",        w:25, when:"حسب الجدول" },
    { ar:"التكاليف (بحث جماعي + عرض شفوي)", w:10, when:"أسابيع ١٤–١٦" },
    { ar:"الملاحظة المباشرة",  w:5,  when:"مستمر", attend:true },
    { ar:"اختبار نهائي",       w:50, when:"حسب الجدول" }
  ]},
  "MGT 102":  { confirmed:false },
  "ACCT 203": { confirmed:false },
  "LAW 333":  { confirmed:false },
  "GS 151":   { confirmed:false }
};

/* خطة مادة سلوك المستهلك أسبوعاً بأسبوع */
const MKT231_WEEKS = [
  [1,"2026-08-23","مدخل عام"],
  [2,"2026-08-30","التعريف بسلوك المستهلك"],
  [3,"2026-09-06","اتخاذ القرار الشرائي"],
  [4,"2026-09-13","اتخاذ القرار الشرائي"],
  [5,"2026-09-20","تصميم الموقع التنافسي للمنتج"],
  [6,"2026-09-27","تأثير ثقافة المجتمع على سلوك المستهلك"],
  [7,"2026-10-04","الطبقات الاجتماعية وتأثيرها"],
  [8,"2026-10-11","تأثير الأسرة على سلوك المستهلك"],
  [9,"2026-10-18","الجماعات المرجعية وتأثيرها"],
  [10,"2026-10-25","الظروف المحيطة بالموقف الشرائي"],
  [11,"2026-11-01","دوافع السلوك الشرائي والاستهلاكي"],
  [12,"2026-11-08","الإدراك الحسي وسلوك المستهلك"],
  [13,"2026-11-15","الاتجاهات النفسية للأفراد"],
  [14,"2026-11-29","قضايا وموضوعات معاصرة"],
  [15,"2026-12-06","مناقشة البحث والعرض الشفوي"],
  [16,"2026-12-13","مناقشة البحث والعرض الشفوي"]
];

/* الملخصات الجاهزة */
const LESSONS = [
  { code:"ACCT 203", title:"الفصل ١ — أهمية المحاسبة",
    sub:"Chapter 1 · القسم ١ من ٤ · Importance of Accounting",
    href:"lessons/ACCT203-CH1-S1.html", done:true },
  { code:"ACCT 203", title:"الفصل ١ — أساسيات المحاسبة",
    sub:"Chapter 1 · القسم ٢ من ٤ · Fundamentals of Accounting (الأخلاق والمعايير)",
    href:"lessons/ACCT203-CH1-S2.html", done:true },
  { code:"ACCT 203", title:"الفصل ١ — العمليات والمعادلة المحاسبية",
    sub:"Chapter 1 · القسم ٣ من ٤ · Business Transactions (أهم درس في المادة)",
    href:"lessons/ACCT203-CH1-S3.html", done:true },
  { code:"ACCT 203", title:"الفصل ١ — القوائم المالية",
    sub:"Chapter 1 · القسم ٤ من ٤ · Financial Statements — الفصل مكتمل ✅",
    href:"lessons/ACCT203-CH1-S4.html", done:true }
];

/* الغياب — حدّثه يدوياً */
const ABSENCE = { "MGT 102":0, "ACCT 203":0, "LAW 333":0, "MKT 231":0, "GS 151":0 };

/* ============================================================
   خريطة المحتوى — وش جاهز ووش ناقص لكل مادة
   ============================================================ */
const MAP = [
  { code:"ACCT 203", ar:"مبادئ المحاسبة المالية", lang:"إنجليزي",
    book:"McGraw Hill — Wild · SmartBook / Connect",
    units:[
      { name:"Chapter 1 — Accounting in Business", items:[
        { t:"Importance of Accounting", o:"C1", s:"done", href:"lessons/ACCT203-CH1-S1.html" },
        { t:"Fundamentals — Ethics & GAAP", o:"C2", s:"done", href:"lessons/ACCT203-CH1-S2.html" },
        { t:"Business Transactions & the Equation", o:"A1", s:"done", href:"lessons/ACCT203-CH1-S3.html" },
        { t:"Financial Statements", o:"P2", s:"done", href:"lessons/ACCT203-CH1-S4.html" },
        { t:"FastForward — transactions 2 to 11", o:"P1", s:"todo",
          note:"التحليل خطوة بخطوة — أهم تمرين في الفصل" },
        { t:"Principles and assumptions + forms of organization", o:"C2", s:"todo",
          note:"ذيل القسم الثاني" }
      ]},
      { name:"Chapter 2 وما بعده", items:[
        { t:"لم يبدأ بعد", s:"wait", note:"ينتظر أن يفتحه الدكتور" } ]}
    ]},
  { code:"MGT 102", ar:"مبادئ الإدارة", lang:"—", priority:true,
    book:"غير معروف — ينتظر دليل المقرر",
    units:[ { name:"المادة كاملة", items:[
      { t:"دليل المقرر", s:"block",
        note:"⚠ أهم مستند ناقص. بدونه ما نعرف توزيع الدرجات ولا مواعيد الكويزات." },
      { t:"المحتوى", s:"wait", note:"ينتظر الكتاب أو شرائح الدكتور" } ]} ]},
  { code:"MKT 231", ar:"سلوك المستهلك في السياحة", lang:"عربي",
    book:"أحمد علي سليمان — سلوك المستهلك · مرجع مساند: Solomon 13e",
    units:[ { name:"الفصول الأربعة الأولى", items:[
      { t:"دليل المقرر — توزيع الدرجات", s:"done", note:"✅ معروف بالكامل" },
      { t:"الفصل ١ — طبيعة سلوك المستهلك", s:"ready", note:"PDF موجود، لم يُشرح" },
      { t:"الفصل ٢ — اتخاذ القرار الشرائي", s:"ready", note:"PDF موجود" },
      { t:"الفصل ٣ — الموقع التنافسي للمنتج", s:"ready", note:"PDF موجود" },
      { t:"الفصل ٤ — تأثير ثقافة المجتمع", s:"ready", note:"PDF موجود" } ]} ]},
  { code:"LAW 333", ar:"البيئة القانونية للأعمال", lang:"—",
    book:"أنظمة سعودية — laws.boe.gov.sa",
    units:[ { name:"المادة", items:[
      { t:"دليل المقرر", s:"block", note:"ناقص" },
      { t:"المحتوى", s:"wait",
        note:"⚠ لا تُذاكر من مصادر أمريكية — الأنظمة سعودية. عربيتك ميزة هنا." } ]} ]},
  { code:"GS 151", ar:"مهارات الحياة الجامعية", lang:"عربي",
    book:"جامعة طيبة — مركز المتطلبات العامة",
    units:[ { name:"المادة", items:[
      { t:"المحتوى", s:"wait", note:"أونلاين على البلاك بورد" } ]} ]}
];
