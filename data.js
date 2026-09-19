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

/* ============================================================
   الملخصات — مرتّبة: مادة ثم فصل ثم درس
   status: done = جاهز · soon = تحت الشغل · src = المادة موجودة ولم تُشرح
           wait = ينتظر الدكتور
   ============================================================ */
const LESSONS = [
  { code:"ACCT 203", chapters:[
    { name:"Chapter 1 — Accounting in Business", meta:"الفصل الأول · مكتمل",
      items:[
        { n:1, ar:"أهمية المحاسبة",              en:"Importance of Accounting",        o:"C1",
          s:"done", href:"lessons/ACCT203-CH1-S1.html", enhref:"lessons/ACCT203-CH1-S1-EN.html" },
        { n:2, ar:"أساسيات المحاسبة",            en:"Fundamentals — Ethics and GAAP",  o:"C2",
          s:"done", href:"lessons/ACCT203-CH1-S2.html", enhref:"lessons/ACCT203-CH1-S2-EN.html" },
        { n:3, ar:"العمليات والمعادلة المحاسبية", en:"Business Transactions",           o:"A1",
          s:"done", href:"lessons/ACCT203-CH1-S3.html", enhref:"lessons/ACCT203-CH1-S3-EN.html", star:"أهم درس في المادة" },
        { n:4, ar:"القوائم المالية",             en:"Financial Statements",            o:"P2",
          s:"done", href:"lessons/ACCT203-CH1-S4.html", enhref:"lessons/ACCT203-CH1-S4-EN.html" },
        { n:5, ar:"تحليل العمليات — تمارين FastForward", en:"Transactions 2 to 11",     o:"P1",
          s:"soon", note:"التحليل خطوة بخطوة. أهم تمرين في الفصل." },
        { n:6, ar:"المبادئ والفروض وأشكال المنشآت", en:"Principles and assumptions",    o:"C2",
          s:"soon", note:"ذيل القسم الثاني" }
      ]},
    { name:"Chapter 2 وما بعده", meta:"لم يُفتح بعد",
      items:[ { ar:"ينتظر أن يفتحه الدكتور", s:"wait" } ]}
  ]},

  { code:"MKT 231", chapters:[
    { name:"الفصول الأربعة الأولى", meta:"الـ PDF موجود — لم يُشرح بعد",
      items:[
        { n:1, ar:"طبيعة سلوك المستهلك وأهميته", s:"src" },
        { n:2, ar:"اتخاذ القرار الشرائي",        s:"src" },
        { n:3, ar:"تصميم الموقع التنافسي للمنتج", s:"src" },
        { n:4, ar:"تأثير ثقافة المجتمع",          s:"src" }
      ]}
  ]},

  { code:"MGT 102", chapters:[
    { name:"Chapter 1 — Managers and Managing", meta:"الفصل الأول · مكتمل",
      items:[
        { n:1, ar:"وش هي الإدارة؟",                    en:"What Is Management?",                  o:"LO1-1",
          s:"done", href:"lessons/MGT102-CH1-S1.html", enhref:"lessons/MGT102-CH1-S1-EN.html" },
        { n:2, ar:"وظائف الإدارة الأربع",               en:"The Four Functions of Management",     o:"LO1-2",
          s:"done", href:"lessons/MGT102-CH1-S2.html", enhref:"lessons/MGT102-CH1-S2-EN.html", star:"أكثر شي يجي في الاختبار" },
        { n:3, ar:"مستويات المديرين ومهاراتهم",         en:"Levels and Skills of Managers",        o:"LO1-3 · LO1-4",
          s:"done", href:"lessons/MGT102-CH1-S3.html", enhref:"lessons/MGT102-CH1-S3-EN.html" },
        { n:4, ar:"التغيّرات الحديثة والتحديات العالمية", en:"Recent Changes and Global Challenges",  o:"LO1-5 · LO1-6",
          s:"done", href:"lessons/MGT102-CH1-S4.html", enhref:"lessons/MGT102-CH1-S4-EN.html" }
      ]},
    { name:"Chapters 2–6", meta:"نص الكتاب موجود — تُشرح حسب ما يمشي الدكتور",
      items:[
        { n:2, ar:"تطوّر الفكر الإداري", en:"The Evolution of Management Thought", s:"src" },
        { n:3, ar:"القيم والاتجاهات والمشاعر والثقافة", en:"Values, Attitudes, Emotions, and Culture", s:"src" },
        { n:4, ar:"الأخلاقيات والمسؤولية الاجتماعية", en:"Ethics and Social Responsibility", s:"src" },
        { n:5, ar:"إدارة التنوّع", en:"Managing Diverse Employees", s:"src" },
        { n:6, ar:"إدارة البيئة العالمية", en:"Managing in the Global Environment", s:"src" }
      ]}
  ]},

  { code:"LAW 333", chapters:[
    { name:"المادة", meta:"ينتظر مادة من الدكتور",
      items:[ { ar:"ينتظر الشرائح ودليل المقرر", s:"wait",
                note:"الأنظمة سعودية — لا تُذاكر من مصادر أمريكية" } ]}
  ]},

  { code:"GS 151", chapters:[
    { name:"المادة", meta:"أونلاين على البلاك بورد",
      items:[ { ar:"ينتظر المحتوى", s:"wait" } ]}
  ]}
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
        { t:"Importance of Accounting", o:"C1", s:"done", href:"lessons/ACCT203-CH1-S1.html", enhref:"lessons/ACCT203-CH1-S1-EN.html" },
        { t:"Fundamentals — Ethics & GAAP", o:"C2", s:"done", href:"lessons/ACCT203-CH1-S2.html", enhref:"lessons/ACCT203-CH1-S2-EN.html" },
        { t:"Business Transactions & the Equation", o:"A1", s:"done", href:"lessons/ACCT203-CH1-S3.html", enhref:"lessons/ACCT203-CH1-S3-EN.html" },
        { t:"Financial Statements", o:"P2", s:"done", href:"lessons/ACCT203-CH1-S4.html", enhref:"lessons/ACCT203-CH1-S4-EN.html" },
        { t:"FastForward — transactions 2 to 11", o:"P1", s:"todo",
          note:"التحليل خطوة بخطوة — أهم تمرين في الفصل" },
        { t:"Principles and assumptions + forms of organization", o:"C2", s:"todo",
          note:"ذيل القسم الثاني" }
      ]},
      { name:"Chapter 2 وما بعده", items:[
        { t:"لم يبدأ بعد", s:"wait", note:"ينتظر أن يفتحه الدكتور" } ]}
    ]},
  { code:"MGT 102", ar:"مبادئ الإدارة", lang:"إنجليزي", priority:true,
    book:"McGraw Hill — Jones & George, Contemporary Management · الكتاب الإلكتروني",
    units:[
      { name:"Chapter 1 — Managers and Managing", items:[
        { t:"What Is Management?", o:"LO1-1", s:"done", href:"lessons/MGT102-CH1-S1.html", enhref:"lessons/MGT102-CH1-S1-EN.html" },
        { t:"The Four Functions of Management", o:"LO1-2", s:"done", href:"lessons/MGT102-CH1-S2.html", enhref:"lessons/MGT102-CH1-S2-EN.html" },
        { t:"Levels and Skills of Managers", o:"LO1-3 · LO1-4", s:"done", href:"lessons/MGT102-CH1-S3.html", enhref:"lessons/MGT102-CH1-S3-EN.html" },
        { t:"Recent Changes and Global Challenges", o:"LO1-5 · LO1-6", s:"done", href:"lessons/MGT102-CH1-S4.html", enhref:"lessons/MGT102-CH1-S4-EN.html" }
      ]},
      { name:"Chapters 2–6", items:[
        { t:"نص الكتاب محفوظ للفصول ٢–٦", s:"ready", note:"تُشرح فصلاً فصلاً حسب ما يمشي الدكتور" } ]},
      { name:"دليل المقرر", items:[
        { t:"دليل المقرر — توزيع الدرجات", s:"block",
          note:"⚠ ما زال ناقصاً. بدونه ما نعرف توزيع الدرجات ولا مواعيد الكويزات — اطلبه من الدكتور أو من البلاك بورد" } ]}
    ]},
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
