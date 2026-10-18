/* Yamen's Hub — question bank: practise with instant feedback (progress saved), or build a custom exam.
   Uses the same banks as the exam centre (window.YH_EXAM_BANKS) and hands custom exams to exam.html.
   Progress: localStorage yh-bank = { bankId: { n: [lastRight 0|1, tries, lastTime] } } */
(function () {
  'use strict';
  var BANKS = window.YH_EXAM_BANKS || {}, GEN = window.YH_EXAM_GENERIC || {};
  var KEY = 'yh-bank', LIVE = 'yh-exam-live', LETTERS = 'ABCD';
  var TYPE_AR = { term: 'تعريف', concept: 'فهم', scenario: 'حالة تطبيقية', figure: 'شكل', list: 'أعداد وقوائم',
    people: 'مين قال وش', tf: 'صح وخطأ', vocab: 'كلمات', case: 'دراسة حالة', calc: 'حساب وقيود' };
  var view, S = null;

  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ar(s) {
    s = String(s == null ? '' : s);
    var out = '', re = /[A-Za-z][A-Za-z0-9 ,.'’\/&+:-]*[A-Za-z0-9]/g, last = 0, m;
    while ((m = re.exec(s))) { out += esc(s.slice(last, m.index)) + '<bdi>' + esc(m[0]) + '</bdi>'; last = m.index + m[0].length; }
    return out + esc(s.slice(last));
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function P(c, t) { return t ? Math.round(c * 100 / t) : 0; }
  function color(p) { return p >= 80 ? 'var(--ok)' : p >= 60 ? 'var(--warn)' : 'var(--bad)'; }
  function isAr(s) { return /[؀-ۿ]/.test(s); }

  /* ---------- catalogue: courses → banks → sections ---------- */
  function courseOf(id) { var b = BANKS[id]; return b.course || id.replace(/^([A-Z]+)(\d+).*$/, '$1 $2'); }
  function courses() {
    var m = {};
    Object.keys(BANKS).forEach(function (id) { var c = courseOf(id); (m[c] = m[c] || []).push(id); });
    return m;
  }
  function sections(bid) {
    var b = BANKS[bid], out = [], seen = {};
    Object.keys(b.sections || {}).forEach(function (k) { seen[k] = 1; out.push({ key: k, title: b.sections[k].ar }); });
    b.questions.forEach(function (q) { if (!seen[q.sec]) { seen[q.sec] = 1; out.push({ key: q.sec, title: q.sec === 'CASE' ? 'دراسة الحالة' : q.sec }); } });
    return out.filter(function (s) { return b.questions.some(function (q) { return q.sec === s.key; }); });
  }
  function prog() { return lsGet(KEY, {}); }
  function stat(bid, sec) {
    var p = prog()[bid] || {}, qs = BANKS[bid].questions.filter(function (q) { return !sec || q.sec === sec; });
    var done = 0, right = 0;
    qs.forEach(function (q) { var r = p[q.n]; if (r) { done++; if (r[0]) right++; } });
    return { total: qs.length, done: done, right: right };
  }
  function misOf(bid, id) {
    var m = (BANKS[bid].misconceptions || []).filter(function (x) { return x.id === id; })[0];
    return m || (GEN[id] ? Object.assign({ id: id }, GEN[id]) : { id: id, ar: '' });
  }
  function lessonHref(sec) { return sec && sec !== 'CASE' ? 'lessons/' + sec + '.html' : ''; }

  /* ---------- home ---------- */
  function home() {
    S = null;
    var C = courses(), names = Object.keys(C).sort();
    var h = '<div class="big"><h2>🎯 بنك الأسئلة</h2>' +
      '<p>حل على راحتك: سؤال سؤال، والجواب يطلع لك على طول مع الشرح. تقدّمك ينحفظ، وتقدر ترجع للأسئلة اللي غلطت فيها بس.</p>' +
      '<p style="margin:0">ولو تبي تختبر نفسك: سوّ <b>اختبار مخصص</b> — تختار الفصول، وكم سؤال، ومع وقت أو بدون.</p></div>';
    if (!names.length) h += '<div class="xempty">ما فيه بنوك أسئلة.</div>';
    names.forEach(function (c, ci) {
      var ids = C[c], tot = 0, done = 0, right = 0;
      ids.forEach(function (b) { var s = stat(b); tot += s.total; done += s.done; right += s.right; });
      h += '<div class="card bkc" data-c="' + ci + '"><div class="bkh"><h2>' + esc(c) + '</h2>' +
        '<span class="bkm">' + done + ' من ' + tot + ' سؤال محلول · صح ' + right + '</span></div>' +
        '<div class="bkbar"><i style="width:' + P(right, tot) + '%;background:var(--ok)"></i><i style="width:' + P(done - right, tot) + '%;background:var(--bad)"></i></div>' +
        '<div class="bksecs">';
      ids.forEach(function (b) {
        var bank = BANKS[b];
        if (ids.length > 1 || bank.short) h += '<div class="bkgroup">' + esc(bank.short || b) + '</div>';
        sections(b).forEach(function (s) {
          var st = stat(b, s.key);
          h += '<label class="bksec"><input type="checkbox" checked data-b="' + esc(b) + '" data-s="' + esc(s.key) + '">' +
            '<span class="t">' + esc(s.title) + '</span>' +
            '<span class="bkbar sm"><i style="width:' + P(st.right, st.total) + '%;background:var(--ok)"></i><i style="width:' + P(st.done - st.right, st.total) + '%;background:var(--bad)"></i></span>' +
            '<span class="n">' + st.right + '/' + st.total + '</span></label>';
        });
      });
      h += '</div><div class="bkall"><button class="pill" data-act="all">تحديد الكل</button><button class="pill" data-act="none">إلغاء الكل</button></div>' +
        '<div class="bkmodes">' +
        '<div class="bkmode"><b>🎯 تدرّب</b><div class="bkopts">' +
        '<label><input type="radio" name="f' + ci + '" value="new" checked> الجديدة</label>' +
        '<label><input type="radio" name="f' + ci + '" value="wrong"> اللي غلطت فيها</label>' +
        '<label><input type="radio" name="f' + ci + '" value="all"> الكل</label></div>' +
        '<button class="pill gold" data-act="practice">ابدأ التدريب</button></div>' +
        '<div class="bkmode"><b>📝 اختبار مخصص</b><div class="bkopts">' +
        '<select data-k="count"><option value="10">10 أسئلة</option><option value="20" selected>20 سؤال</option><option value="30">30 سؤال</option><option value="40">40 سؤال</option><option value="all">كل الأسئلة</option></select>' +
        '<select data-k="timer"><option value="0" selected>بدون وقت</option><option value="72">مع وقت (٧٢ ث للسؤال)</option></select></div>' +
        '<button class="pill gold" data-act="exam">ابدأ الاختبار</button></div></div>' +
        '<div class="bkfoot"><button class="linkbtn" data-act="reset">تصفير تقدّم هذي المادة</button></div></div>';
    });
    h += '<div class="xacts"><a class="pill" href="exam.html">📝 الاختبارات الجاهزة ونتائجك</a></div>';
    view.innerHTML = h;
    view.querySelectorAll('.bkc').forEach(function (card) {
      var c = names[+card.dataset.c];
      card.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]'); if (!b) return;
        var act = b.dataset.act, boxes = card.querySelectorAll('input[type=checkbox]');
        if (act === 'all' || act === 'none') { boxes.forEach(function (x) { x.checked = act === 'all'; }); return; }
        var sel = []; boxes.forEach(function (x) { if (x.checked) sel.push({ b: x.dataset.b, s: x.dataset.s }); });
        if (act === 'reset') {
          if (!confirm('تصفّر تقدّمك في ' + c + '؟')) return;
          var p = prog(); C[c].forEach(function (id) { delete p[id]; }); lsSet(KEY, p); home(); return;
        }
        if (!sel.length) { alert('اختر فصل واحد على الأقل'); return; }
        if (act === 'practice') startPractice(sel, (card.querySelector('input[type=radio]:checked') || {}).value || 'new');
        if (act === 'exam') startExam(sel, card.querySelector('[data-k=count]').value, +card.querySelector('[data-k=timer]').value);
      });
    });
    /* bank.html#s=<section>: came from a lesson or lecture — tick only that one and bring its course into view */
    var want = (location.hash.match(/^#s=([\w-]+)/) || [])[1];
    var hit = want && view.querySelector('input[data-s="' + want + '"]');
    if (hit) {
      var card = hit.closest('.bkc');
      card.querySelectorAll('input[type=checkbox]').forEach(function (x) { x.checked = x === hit; });
      card.querySelector('.bkmodes').scrollIntoView({ block: 'center' });
      hit.closest('.bksec').classList.add('pick');
    }
  }

  /* ---------- practice ---------- */
  function startPractice(sel, filter) {
    var p = prog(), pool = [];
    sel.forEach(function (x) {
      BANKS[x.b].questions.forEach(function (q) {
        if (q.sec !== x.s) return;
        var r = (p[x.b] || {})[q.n];
        if (filter === 'new' && r) return;
        if (filter === 'wrong' && !(r && !r[0])) return;
        pool.push({ b: x.b, n: q.n });
      });
    });
    if (!pool.length) {
      alert(filter === 'new' ? 'حليت كل الأسئلة في الفصول اللي اخترتها 👏 — اختر «الكل» أو «اللي غلطت فيها».'
        : filter === 'wrong' ? 'ما عندك أسئلة غلط في هذي الفصول 👏' : 'ما فيه أسئلة.');
      return;
    }
    S = { q: shuffle(pool), i: 0, right: 0, wrong: 0, missed: [], sel: sel };
    show();
  }
  function qOf(it) { var b = BANKS[it.b]; return b.questions.filter(function (q) { return q.n === it.n; })[0]; }
  function show() {
    var it = S.q[S.i], q = qOf(it), b = BANKS[it.b];
    var perm = q.type === 'tf' ? q.options.map(function (_, i) { return i; }) : shuffle(q.options.map(function (_, i) { return i; }));
    var cs = q.caseId ? (b.cases || []).filter(function (c) { return c.id === q.caseId; })[0] : null;
    var sec = (b.sections || {})[q.sec];
    var h = '<div class="xhead"><div class="xcount">سؤال <b>' + (S.i + 1) + '</b> من ' + S.q.length +
      ' · <span style="color:var(--ok)">✓ <span id="bkr">' + S.right + '</span></span> <span style="color:var(--bad)">✗ <span id="bkw">' + S.wrong + '</span></span></div>' +
      '<button class="pill" id="bkend">إنهاء</button></div>' +
      '<div class="xprog"><i style="width:' + (S.i * 100 / S.q.length) + '%"></i></div>' +
      '<div class="xpart">' + esc(sec ? sec.ar : (q.sec === 'CASE' ? 'دراسة الحالة' : '')) + ' · ' + (TYPE_AR[q.type] || '') + '</div>';
    if (cs) h += '<div class="xcase"><div class="ct">📋 ' + esc(cs.title) + '</div><div class="cx" dir="auto">' + esc(cs.text) + '</div></div>';
    h += '<div class="xq">';
    if (q.img) h += '<div class="exhibit"><img src="' + esc(q.img) + '" alt="الشكل المطلوب في السؤال"></div>';
    var A = isAr(q.stem), L = A ? 'أبجد' : LETTERS;
    h += '<div class="xstem' + (A ? ' ar' : '') + '">' + esc(q.stem) + '</div><div class="xopts">';
    perm.forEach(function (oi, k) {
      h += '<button class="xopt' + (isAr(q.options[oi]) ? ' ar' : '') + '" data-o="' + oi + '"><span class="xl">' + L[k] + '</span>' +
        '<span class="xt" dir="auto">' + esc(q.options[oi]) + '</span></button>';
    });
    h += '</div><div id="bkfb"></div></div>';
    view.innerHTML = h; window.scrollTo(0, 0);
    view.querySelectorAll('.xopt').forEach(function (btn) { btn.addEventListener('click', function () { answer(it, q, +btn.dataset.o); }); });
    document.getElementById('bkend').addEventListener('click', finish);
  }
  function answer(it, q, oi) {
    if (S.locked) return; S.locked = true;
    var ok = oi === q.answer, p = prog();
    p[it.b] = p[it.b] || {};
    var r = p[it.b][it.n] || [0, 0, 0]; p[it.b][it.n] = [ok ? 1 : 0, r[1] + 1, Date.now()]; lsSet(KEY, p);
    if (ok) S.right++; else { S.wrong++; S.missed.push(it); }
    document.getElementById('bkr').textContent = S.right; document.getElementById('bkw').textContent = S.wrong;
    view.querySelectorAll('.xopt').forEach(function (b) {
      var o = +b.dataset.o; b.disabled = true;
      if (o === q.answer) b.classList.add('right'); else if (o === oi) b.classList.add('wrong');
    });
    var w = !ok ? (q.wrong || []).filter(function (x) { return x.i === oi; })[0] : null, m = w ? misOf(it.b, w.mis) : null;
    var href = lessonHref(q.sec);
    document.getElementById('bkfb').innerHTML =
      '<div class="bkfb ' + (ok ? 'ok' : 'bad') + '"><b>' + (ok ? '✓ صح' : '✗ غلط') + '</b><div>' + ar(q.why) + '</div>' +
      (w ? '<div class="trap"><b>السبب:</b> ' + ar(m.ar || '') + (w.note ? ' — ' + ar(w.note) : '') + '</div>' : '') + '</div>' +
      '<div class="xnav">' + (href ? '<a class="pill" href="' + href + '">راجع الدرس</a>' : '<span></span>') +
      '<button class="pill gold" id="bknext">' + (S.i < S.q.length - 1 ? 'التالي ←' : 'النتيجة') + '</button></div>';
    var nb = document.getElementById('bknext');
    nb.addEventListener('click', function () { S.locked = false; S.i++; if (S.i < S.q.length) show(); else finish(); });
    nb.focus();
  }
  function finish() {
    var n = S.right + S.wrong;
    var h = '<div class="card bkdone"><div class="xgrade" style="color:' + color(P(S.right, n)) + '">' + P(S.right, n) + '%</div>' +
      '<p>حليت <b>' + n + '</b> سؤال: <span style="color:var(--ok)">صح ' + S.right + '</span> · <span style="color:var(--bad)">غلط ' + S.wrong + '</span></p>';
    if (S.missed.length) {
      var tally = {}, order = [];
      S.missed.forEach(function (it) { var t = qOf(it).topic || ''; if (!tally[t]) order.push(t); tally[t] = (tally[t] || 0) + 1; });
      h += '<p style="font-size:.9rem;color:var(--ink-2)">تقدّمك انحفظ. هذي المواضيع اللي غلطت فيها — راجعها:</p><ul class="bkmiss">' +
        order.map(function (t) { return '<li>' + ar(t) + (tally[t] > 1 ? ' <b>×' + tally[t] + '</b>' : '') + '</li>'; }).join('') + '</ul>';
    } else h += '<p>ولا غلط 👏</p>';
    h += '<div class="xacts">' + (S.missed.length ? '<button class="pill gold" id="bkagain">↻ أعد اللي غلطت فيها (' + S.missed.length + ')</button>' : '') +
      '<button class="pill" id="bkhome">رجوع للبنك</button></div></div>';
    view.innerHTML = h; window.scrollTo(0, 0);
    var again = document.getElementById('bkagain');
    if (again) again.addEventListener('click', function () { S = { q: shuffle(S.missed.slice()), i: 0, right: 0, wrong: 0, missed: [], sel: S.sel }; show(); });
    document.getElementById('bkhome').addEventListener('click', home);
  }

  /* ---------- custom exam → exam.html ---------- */
  function startExam(sel, count, secPerQ) {
    var banks = [], secs = [];
    sel.forEach(function (x) { if (banks.indexOf(x.b) < 0) banks.push(x.b); if (secs.indexOf(x.s) < 0) secs.push(x.s); });
    var E = window.YH_EXAM; if (!E) { alert('محرّك الاختبار ما تحمّل'); return; }
    var t = E.testById('x.' + banks.join('+'));
    t.secs = secs; t.count = count === 'all' ? 'all' : +count; t.casesPerBank = secs.indexOf('CASE') >= 0 ? 1 : 0;
    var qs = E.draw(t);
    if (!qs.length) { alert('ما فيه أسئلة في اختيارك'); return; }
    var live = lsGet(LIVE, null);
    if (live && !confirm('عندك اختبار ثاني ما خلّص. تبدأ هذا وتحذف القديم؟')) return;
    lsSet(LIVE, { v: 1, test: t.id, qs: qs, ans: {}, first: {}, chg: {}, flag: {}, tq: {}, cur: 0, start: Date.now(), limit: secPerQ ? qs.length * secPerQ : 0 });
    location.href = 'exam.html?t=' + Date.now();   /* never land on a cached exam page that lacks this bank */
  }

  document.addEventListener('DOMContentLoaded', function () { view = document.getElementById('bank'); if (view) home(); });
})();
