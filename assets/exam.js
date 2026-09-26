/* Yamen's Hub — exam engine.
   Test centre → timed exam (no feedback) → submit → teacher's diagnostic report → share.
   Data: window.YH_EXAM_TESTS, YH_EXAM_GENERIC (data/exams.js) and YH_EXAM_BANKS (data/exam-<bank>.js).
   State: localStorage yh-exam-live (attempt in progress), yh-exam-hist (finished attempts), yh-exam-seen.
   A finished attempt is a compact code; #r=<code> renders its full report on any device. */
(function () {
  'use strict';
  var BANKS = window.YH_EXAM_BANKS || {}, TESTS = window.YH_EXAM_TESTS || [], GEN = window.YH_EXAM_GENERIC || {};
  var LIVE = 'yh-exam-live', HIST = 'yh-exam-hist', SEEN = 'yh-exam-seen';
  var LETTERS = 'ABCD';
  var TYPE_AR = { term: 'التعريفات', concept: 'فهم المفاهيم', scenario: 'تطبيق على مواقف', figure: 'قراءة الأشكال',
    list: 'القوائم والأعداد', people: 'مين قال وش', tf: 'صح وخطأ', vocab: 'الكلمات الإنجليزية', case: 'دراسة الحالة' };
  var view, timerEl;

  /* ---------------- helpers ---------------- */
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /* Arabic text with English runs isolated in <bdi> so punctuation lands right */
  function ar(s) {
    s = String(s == null ? '' : s);
    var out = '', re = /[A-Za-z][A-Za-z0-9 ,.'’\/&+:-]*[A-Za-z0-9]/g, last = 0, m;
    while ((m = re.exec(s))) { out += esc(s.slice(last, m.index)) + '<bdi>' + esc(m[0]) + '</bdi>'; last = m.index + m[0].length; }
    return out + esc(s.slice(last));
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function testById(id) { for (var i = 0; i < TESTS.length; i++) if (TESTS[i].id === id) return TESTS[i]; return null; }
  function ready(t) { return t && t.banks.every(function (b) { return BANKS[b] && BANKS[b].questions && BANKS[b].questions.length; }); }
  function qOf(bid, n) {
    var b = BANKS[bid]; if (!b) return null;
    if (!b._byN) { b._byN = {}; b.questions.forEach(function (q) { b._byN[q.n] = q; }); }
    return b._byN[n] || null;
  }
  function caseOf(bid, id) { var b = BANKS[bid]; return b && (b.cases || []).filter(function (c) { return c.id === id; })[0] || null; }
  function misOf(bid, id) {
    var b = BANKS[bid], m = b && (b.misconceptions || []).filter(function (x) { return x.id === id; })[0];
    return m || (GEN[id] ? Object.assign({ id: id }, GEN[id]) : { id: id, ar: id, explain: '', fix: '', coach: '' });
  }
  function secTitle(bid, sec) {
    if (sec === 'CASE') return 'دراسة الحالة — ' + ((BANKS[bid] || {}).short || bid);
    var s = (BANKS[bid] && BANKS[bid].sections || {})[sec]; return s ? s.ar : sec;
  }
  function loLabel(bid, lo) { var l = ((BANKS[bid] || {}).los || []).filter(function (x) { return x.lo === lo; })[0]; return l ? l.ar : ''; }
  function fmt(sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
  function mins(sec) { return Math.round(sec / 60); }
  function P(c, t) { return t ? Math.round(c * 100 / t) : 0; }
  /* Arabic counted noun: 1 سؤال واحد · 2 سؤالين · 3–10 أسئلة · 11+ سؤال */
  function nq(n) { return n === 1 ? 'سؤال واحد' : n === 2 ? 'سؤالين' : n <= 10 ? n + ' أسئلة' : n + ' سؤال'; }
  function color(p) { return p >= 80 ? 'var(--ok)' : p >= 60 ? 'var(--warn)' : 'var(--bad)'; }
  function grade(p) {
    if (p >= 95) return ['A+', 'ممتاز مرتفع']; if (p >= 90) return ['A', 'ممتاز'];
    if (p >= 85) return ['B+', 'جيد جداً مرتفع']; if (p >= 80) return ['B', 'جيد جداً'];
    if (p >= 75) return ['C+', 'جيد مرتفع']; if (p >= 70) return ['C', 'جيد'];
    if (p >= 65) return ['D+', 'مقبول مرتفع']; if (p >= 60) return ['D', 'مقبول'];
    return ['F', 'راسب'];
  }
  function dateAr(ms) {
    var d = new Date(ms), M = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return d.getDate() + ' ' + M[d.getMonth()] + ' · ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /* ---------------- drawing a test ---------------- */
  function pickDiverse(qs, k, isSeen) {
    if (k >= qs.length) return qs.slice();
    var byType = {};
    qs.forEach(function (q) { (byType[q.type] = byType[q.type] || []).push(q); });
    Object.keys(byType).forEach(function (t) {
      byType[t] = shuffle(byType[t]).sort(function (a, b) { return (isSeen(a) ? 1 : 0) - (isSeen(b) ? 1 : 0); });
    });
    /* each type gets a share proportional to its size in the bank (largest remainder),
       so a lesson's single true/false question isn't drawn as often as its four definitions */
    var types = Object.keys(byType), N = qs.length, quota = {}, rem = [], got = 0, out = [];
    types.forEach(function (t) {
      var exact = k * byType[t].length / N; quota[t] = Math.floor(exact); got += quota[t];
      rem.push({ t: t, r: exact - quota[t] + Math.random() * 1e-6 });
    });
    rem.sort(function (a, b) { return b.r - a.r; });
    for (var i = 0; got < k && i < rem.length; i++) { quota[rem[i].t]++; got++; }
    types.forEach(function (t) { out = out.concat(byType[t].slice(0, quota[t])); });
    return out;
  }
  function draw(test) {
    var seen = lsGet(SEEN, {}), all = test.count === 'all', regular = [], caseBlocks = [];
    test.banks.forEach(function (bid, bi) {
      var B = BANKS[bid], s = seen[bid] || [];
      var isSeen = function (q) { return s.indexOf(q.n) >= 0; };
      var reg = B.questions.filter(function (q) { return q.type !== 'case'; });
      var cases = {};
      B.questions.filter(function (q) { return q.type === 'case'; }).forEach(function (q) { (cases[q.caseId] = cases[q.caseId] || []).push(q); });
      var ids = shuffle(Object.keys(cases)).sort(function (a, b) {
        return cases[a].filter(isSeen).length - cases[b].filter(isSeen).length; });
      var chosen = ids.slice(0, all ? ids.length : (test.casesPerBank || 0));
      var caseQ = chosen.reduce(function (n, id) { return n + cases[id].length; }, 0);
      var secs = {};
      reg.forEach(function (q) { (secs[q.sec] = secs[q.sec] || []).push(q); });
      var secIds = Object.keys(secs).sort();
      if (all) {
        secIds.forEach(function (sid) { secs[sid].forEach(function (q) { regular.push({ b: bi, n: q.n }); }); });
      } else {
        var perBank = Math.floor(test.count / test.banks.length) + (bi < test.count % test.banks.length ? 1 : 0);
        var quota = Math.max(0, perBank - caseQ), base = Math.floor(quota / secIds.length), extra = quota % secIds.length;
        var lucky = shuffle(secIds.slice()).slice(0, extra);
        secIds.forEach(function (sid) {
          pickDiverse(secs[sid], base + (lucky.indexOf(sid) >= 0 ? 1 : 0), isSeen)
            .forEach(function (q) { regular.push({ b: bi, n: q.n }); });
        });
      }
      chosen.forEach(function (id) {
        caseBlocks.push(cases[id].slice().sort(function (a, b) { return a.n - b.n; }).map(function (q) { return { b: bi, n: q.n }; }));
      });
    });
    var list = shuffle(regular);
    caseBlocks.forEach(function (blk) { list = list.concat(blk); });
    list.forEach(function (it) {
      var q = qOf(test.banks[it.b], it.n);
      it.perm = q.type === 'tf' ? [0, 1] : shuffle(q.options.map(function (_, i) { return i; }));
    });
    return list;
  }

  /* ---------------- result code ---------------- */
  function b36(n, w) { var s = Math.max(0, Math.round(n)).toString(36); while (s.length < w) s = '0' + s; return s.slice(-w); }
  function encode(a, dur, auto) {
    var items = a.qs.map(function (it, i) {
      return String(it.b) + b36(it.n, 2) +
        (a.ans[i] === undefined ? '-' : String(a.ans[i])) +
        (a.first[i] === undefined ? '-' : String(a.first[i])) +
        String(Math.min(9, a.chg[i] || 0)) + (a.flag[i] ? '1' : '0') + b36(Math.min(1295, a.tq[i] || 0), 2);
    }).join('');
    return ['x1', a.test, b36(Math.floor(a.start / 60000), 6), b36(dur, 3), b36(a.limit, 3), auto ? '1' : '0', items].join('~');
  }
  function decode(code) {
    var p = String(code || '').split('~');
    if (p.length < 7 || p[0] !== 'x1') return null;
    var test = testById(p[1]);
    if (!test) return { error: 'test' };
    var s = p[6], items = [];
    for (var k = 0; k + 9 <= s.length; k += 9) {
      var c = s.substr(k, 9);
      items.push({ b: +c[0], n: parseInt(c.substr(1, 2), 36), ans: c[3] === '-' ? null : +c[3], first: c[4] === '-' ? null : +c[4],
        chg: +c[5], flag: c[6] === '1', t: parseInt(c.substr(7, 2), 36) });
    }
    return { test: test, start: parseInt(p[2], 36) * 60000, dur: parseInt(p[3], 36), limit: parseInt(p[4], 36), auto: p[5] === '1', items: items, code: code };
  }

  /* ---------------- test centre ---------------- */
  function showHome() {
    setTimer(null);
    var hist = lsGet(HIST, []), live = lsGet(LIVE, null);
    var h = '<div class="big"><h2>📝 الاختبارات</h2>' +
      '<p>اختبار حقيقي: وقت محدد، سؤال ورا سؤال، وما تعرف الجواب الصح إلا بعد ما تسلّم. ' +
      'بعدها يطلع لك تقرير كامل زي تقرير المدرّس: وين أنت قوي، وين ضعيف، وش الأخطاء اللي تتكرر، ووش تذاكر بالضبط.</p>' +
      '<p style="margin:0">الأسئلة بالإنجليزي زي الاختبار الحقيقي، والتقرير بالعربي. وتقدر ترسل التقرير لأخوك يشوفه.</p></div>';
    if (live && testById(live.test)) {
      h += '<div class="xresume"><div class="grow"><b>عندك اختبار ما خلّص</b><br><small>' + esc(testById(live.test).title) +
        ' · باقي ' + fmt(live.limit - (Date.now() - live.start) / 1000) + '</small></div>' +
        '<button class="pill gold" id="xgo">كمّل الاختبار</button></div>';
    }
    h += '<div class="xtests">';
    TESTS.forEach(function (t) {
      var ok = ready(t), mine = hist.filter(function (x) { return x.test === t.id; }), last = mine[mine.length - 1];
      var best = mine.reduce(function (m, x) { return Math.max(m, x.pct); }, 0);
      var n = t.count === 'all' ? (ok ? t.banks.reduce(function (s, b) { return s + BANKS[b].questions.length; }, 0) : 0) : t.count;
      h += '<div class="xtest' + (ok ? '' : ' off') + '"><div class="tt"><b>' + ar(t.title) + '</b><small>' + ar(t.sub) + '</small></div>' +
        (ok ? '<span class="meta">' + n + ' سؤال · ' + mins(n * t.secPerQ) + ' دقيقة</span>' : '') +
        (last ? '<span class="last">آخر نتيجة <b style="color:' + color(last.pct) + '">' + last.pct + '%</b>' +
          (mine.length > 1 ? ' · أفضل ' + best + '%' : '') + '</span>' : '') +
        (ok ? '<a class="pill gold" href="#t=' + t.id + '">ابدأ</a>' : '<span class="pill off">قريباً</span>') + '</div>';
    });
    h += '</div>';
    if (hist.length) {
      h += '<div class="card xhist" style="background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:16px 18px;margin-top:16px">' +
        '<h2 style="font-size:1.1rem;margin-bottom:6px">محاولاتك</h2>';
      hist.slice().reverse().slice(0, 15).forEach(function (x) {
        var t = testById(x.test);
        h += '<div class="h"><span class="d">' + dateAr(x.date) + '</span><span class="g" style="color:' + color(x.pct) + '">' + esc(x.grade) + '</span>' +
          '<span class="grow">' + ar(t ? t.title : x.test) + '</span><b style="color:' + color(x.pct) + '">' + x.pct + '%</b>' +
          '<a class="pill" href="#r=' + encodeURIComponent(x.code) + '">التقرير</a></div>';
      });
      h += '</div>';
    }
    view.innerHTML = h;
    var go = document.getElementById('xgo'); if (go) go.addEventListener('click', function () { run(lsGet(LIVE, null)); });
  }

  function showIntro(t) {
    setTimer(null);
    if (!ready(t)) { location.hash = ''; return; }
    var n = t.count === 'all' ? t.banks.reduce(function (s, b) { return s + BANKS[b].questions.length; }, 0) : t.count;
    var live = lsGet(LIVE, null);
    var h = '<div class="big"><h2>' + ar(t.title) + '</h2><p>' + ar(t.sub) + '</p>' +
      '<div class="xstats" style="max-width:420px"><div><b>' + n + '</b>سؤال</div><div><b>' + mins(n * t.secPerQ) + '</b>دقيقة</div></div></div>' +
      '<div class="card" style="background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:18px 20px">' +
      '<h2 style="font-size:1.1rem">قبل ما تبدأ</h2><ul class="xrules">' +
      '<li>الاختبار زي الحقيقي: <b>ما يطلع لك الجواب الصح</b> أثناء الحل. كل شي يطلع في التقرير بعد التسليم.</li>' +
      '<li>تقدر ترجع لأي سؤال وتغيّر جوابك قبل التسليم، وتعلّم ⚑ الأسئلة اللي تبي ترجع لها.</li>' +
      '<li><b>الوقت يمشي حتى لو طلعت من الصفحة.</b> لو خلص الوقت، الاختبار يتسلّم تلقائي باللي جاوبته.</li>' +
      '<li>ما فيه خصم على الغلط — <b>جاوب كل سؤال</b> حتى لو تخمين.</li>' +
      '<li>اقرأ السؤال كامل، بعدين الخيارات الأربعة كلها، وبعدها اختار.</li>' +
      '<li>قاعدة الوقت: دقيقة لكل سؤال. اللي يعلّقك علّمه وكمّل.</li></ul></div>' +
      (live ? '<p class="xdiag med" style="margin-top:14px">عندك اختبار ثاني ما خلّص. لو بدأت هذا، المحاولة القديمة تنحذف.</p>' : '') +
      '<div class="xacts"><button class="pill gold" id="xstart" style="font-size:1.05rem;padding:12px 26px">ابدأ الاختبار</button>' +
      '<a class="pill" href="#">رجوع</a></div>';
    view.innerHTML = h;
    document.getElementById('xstart').addEventListener('click', function () {
      var qs = draw(t);
      var a = { v: 1, test: t.id, qs: qs, ans: {}, first: {}, chg: {}, flag: {}, tq: {}, cur: 0, start: Date.now(), limit: Math.round(qs.length * t.secPerQ) };
      lsSet(LIVE, a);
      history.replaceState(null, '', location.pathname + location.search);
      run(a);
    });
  }

  /* ---------------- runner ---------------- */
  var A = null, shownAt = 0, tick = null;
  function remaining() { return A.limit - (Date.now() - A.start) / 1000; }
  function account() { if (A && shownAt) { A.tq[A.cur] = (A.tq[A.cur] || 0) + (Date.now() - shownAt) / 1000; shownAt = Date.now(); } }
  function save() { if (A) lsSet(LIVE, A); }
  function setTimer(sec) {
    if (!timerEl) return;
    if (sec == null) { timerEl.hidden = true; return; }
    timerEl.hidden = false; timerEl.textContent = '⏱ ' + fmt(sec);
    timerEl.className = 'pill xtimer' + (sec <= 60 ? ' bad' : sec <= 300 ? ' warn' : '');
  }
  function onVis() {
    if (!A) return;
    if (document.hidden) { account(); shownAt = 0; save(); }
    else { shownAt = Date.now(); if (remaining() <= 0) submit(true); }
  }
  function run(a) {
    if (!a || !testById(a.test)) { lsDel(LIVE); showHome(); return; }
    A = a;
    if (remaining() <= 0) { submit(true); return; }
    document.removeEventListener('visibilitychange', onVis);
    document.addEventListener('visibilitychange', onVis);
    clearInterval(tick);
    tick = setInterval(function () { var r = remaining(); setTimer(r); if (r <= 0) submit(true); }, 1000);
    setTimer(remaining());
    renderQ();
  }
  function current() { var it = A.qs[A.cur], bid = testById(A.test).banks[it.b]; return { it: it, bid: bid, q: qOf(bid, it.n) }; }
  function answered() { return Object.keys(A.ans).length; }
  function renderQ() {
    var c = current(), q = c.q, total = A.qs.length, cs = q.caseId ? caseOf(c.bid, q.caseId) : null;
    var firstCase = -1;
    for (var i = 0; i < total; i++) { if (qOf(testById(A.test).banks[A.qs[i].b], A.qs[i].n).type === 'case') { firstCase = i; break; } }
    var h = '<div class="xhead"><div class="xcount">سؤال <b>' + (A.cur + 1) + '</b> من ' + total + '</div>' +
      '<button class="xflag' + (A.flag[A.cur] ? ' on' : '') + '" id="xflag">⚑ ' + (A.flag[A.cur] ? 'معلّم للمراجعة' : 'علّمه للمراجعة') + '</button></div>' +
      '<div class="xprog"><i style="width:' + (answered() * 100 / total) + '%"></i></div>';
    if (firstCase >= 0) h += '<div class="xpart">' + (A.cur < firstCase ? 'PART A · MULTIPLE CHOICE' : 'PART B · CASE STUDY') + '</div>';
    if (cs) h += '<div class="xcase"><div class="ct">📋 Case — ' + esc(cs.title) + '</div><div class="cx">' + esc(cs.text) + '</div></div>';
    h += '<div class="xq">';
    if (q.img) h += '<div class="exhibit"><img src="' + esc(q.img) + '" alt="The textbook figure this question is about"></div>';
    h += '<div class="xstem">' + esc(q.stem) + '</div><div class="xopts" role="radiogroup">';
    c.it.perm.forEach(function (oi, k) {
      var sel = A.ans[A.cur] === oi;
      h += '<button class="xopt' + (sel ? ' sel' : '') + (/[؀-ۿ]/.test(q.options[oi]) ? ' ar' : '') + '" role="radio" aria-checked="' + sel + '" data-o="' + oi + '">' +
        '<span class="xl">' + LETTERS[k] + '</span><span class="xt" dir="auto">' + esc(q.options[oi]) + '</span></button>';
    });
    h += '</div></div><div class="xnav">' +
      '<button class="pill" id="xprev"' + (A.cur ? '' : ' disabled') + '>→ السابق</button>' +
      '<button class="pill" id="xmap">▦ الأسئلة</button>' +
      (A.cur < total - 1 ? '<button class="pill gold" id="xnext">التالي ←</button>' : '<button class="pill gold" id="xsub">✓ تسليم</button>') + '</div>';
    view.innerHTML = h;
    shownAt = Date.now();
    window.scrollTo(0, 0);
    view.querySelectorAll('.xopt').forEach(function (b) { b.addEventListener('click', function () { choose(+b.dataset.o); }); });
    document.getElementById('xflag').addEventListener('click', function () { A.flag[A.cur] = !A.flag[A.cur]; if (!A.flag[A.cur]) delete A.flag[A.cur]; save(); account(); renderQ(); });
    document.getElementById('xprev').addEventListener('click', function () { go(A.cur - 1); });
    document.getElementById('xmap').addEventListener('click', showMap);
    var nx = document.getElementById('xnext'); if (nx) nx.addEventListener('click', function () { go(A.cur + 1); });
    var sb = document.getElementById('xsub'); if (sb) sb.addEventListener('click', confirmSubmit);
  }
  function choose(oi) {
    var i = A.cur;
    if (A.first[i] === undefined) A.first[i] = oi;
    else if (A.ans[i] !== oi) A.chg[i] = (A.chg[i] || 0) + 1;
    A.ans[i] = oi; save();
    view.querySelectorAll('.xopt').forEach(function (b) {
      var s = +b.dataset.o === oi; b.classList.toggle('sel', s); b.setAttribute('aria-checked', s);
    });
    view.querySelector('.xprog i').style.width = (answered() * 100 / A.qs.length) + '%';
  }
  function go(i) { if (i < 0 || i >= A.qs.length) return; account(); A.cur = i; save(); closeSheet(); renderQ(); }
  function closeSheet() { var s = document.querySelector('.xsheet'); if (s) s.remove(); }
  function sheet(html) {
    closeSheet();
    var s = document.createElement('div'); s.className = 'xsheet';
    s.innerHTML = '<div class="in" role="dialog" aria-modal="true">' + html + '</div>';
    s.addEventListener('click', function (e) { if (e.target === s) closeSheet(); });
    document.body.appendChild(s); return s;
  }
  function showMap() {
    var h = '<h3>كل الأسئلة</h3><div class="xlegend"><span><i class="a"></i>جاوبته</span><span><i></i>ما جاوبته</span><span>⚑ معلّم</span></div><div class="xgrid">';
    A.qs.forEach(function (_, i) {
      h += '<button class="' + (A.ans[i] !== undefined ? 'a ' : '') + (A.flag[i] ? 'f ' : '') + (i === A.cur ? 'cur' : '') + '" data-i="' + i + '">' + (i + 1) + '</button>';
    });
    h += '</div><p style="font-size:.9rem;color:var(--muted)">جاوبت ' + answered() + ' من ' + A.qs.length + '</p>' +
      '<div class="xrow"><button class="pill" id="xclose">رجوع للسؤال</button><button class="pill gold" id="xsub2">✓ تسليم الاختبار</button></div>';
    var s = sheet(h);
    s.querySelectorAll('.xgrid button').forEach(function (b) { b.addEventListener('click', function () { go(+b.dataset.i); }); });
    s.querySelector('#xclose').addEventListener('click', closeSheet);
    s.querySelector('#xsub2').addEventListener('click', confirmSubmit);
  }
  function confirmSubmit() {
    var blank = [], flagged = [];
    A.qs.forEach(function (_, i) { if (A.ans[i] === undefined) blank.push(i); if (A.flag[i]) flagged.push(i); });
    var h = '<h3>تسلّم الاختبار؟</h3><p>جاوبت <b>' + answered() + '</b> من ' + A.qs.length + ' · باقي من الوقت ' + fmt(remaining()) + '</p>';
    if (blank.length) {
      h += '<p class="xdiag high" style="margin:10px 0"><b>ما جاوبت على ' + nq(blank.length) + '.</b> ما فيه خصم على الغلط — ارجع وجاوبها ولو تخمين.</p><div class="xgrid">';
      blank.forEach(function (i) { h += '<button data-i="' + i + '">' + (i + 1) + '</button>'; });
      h += '</div>';
    }
    if (flagged.length) {
      h += '<p style="font-size:.9rem">معلّمة للمراجعة:</p><div class="xgrid">';
      flagged.forEach(function (i) { h += '<button class="f' + (A.ans[i] !== undefined ? ' a' : '') + '" data-i="' + i + '">' + (i + 1) + '</button>'; });
      h += '</div>';
    }
    h += '<div class="xrow"><button class="pill" id="xback">ارجع</button><button class="pill gold" id="xyes">سلّم الحين</button></div>';
    var s = sheet(h);
    s.querySelectorAll('.xgrid button').forEach(function (b) { b.addEventListener('click', function () { go(+b.dataset.i); }); });
    s.querySelector('#xback').addEventListener('click', closeSheet);
    s.querySelector('#xyes').addEventListener('click', function () { submit(false); });
  }
  function submit(auto) {
    if (!A) return;
    account(); clearInterval(tick); document.removeEventListener('visibilitychange', onVis); closeSheet();
    var t = testById(A.test), dur = Math.min(A.limit, Math.round((Date.now() - A.start) / 1000));
    var code = encode(A, dur, auto || remaining() <= 0);
    var seen = lsGet(SEEN, {});
    A.qs.forEach(function (it) { var bid = t.banks[it.b]; seen[bid] = seen[bid] || []; if (seen[bid].indexOf(it.n) < 0) seen[bid].push(it.n); });
    lsSet(SEEN, seen);
    var R = analyze(decode(code));
    var hist = lsGet(HIST, []);
    hist.push({ code: code, test: A.test, pct: R.pct, grade: R.grade[0], date: Date.now() });
    lsSet(HIST, hist.slice(-40));
    lsDel(LIVE); A = null; setTimer(null);
    location.hash = 'r=' + encodeURIComponent(code);
  }

  /* ---------------- analysis ---------------- */
  function bump(o, k, ok) { o[k] = o[k] || { c: 0, t: 0 }; o[k].t++; if (ok) o[k].c++; }
  function analyze(D) {
    var T = D.test, rows = [], by = { lo: {}, sec: {}, type: {}, mis: {}, typeA: {}, secA: {} };
    D.items.forEach(function (it, i) {
      var bid = T.banks[it.b], q = qOf(bid, it.n); if (!q) return;
      var ok = it.ans !== null && it.ans === q.answer, blank = it.ans === null;
      var w = (!ok && !blank) ? (q.wrong || []).filter(function (x) { return x.i === it.ans; })[0] || { mis: 'gen.detail', note: '' } : null;
      var row = { i: i, bid: bid, q: q, it: it, ok: ok, blank: blank, w: w };
      rows.push(row);
      bump(by.lo, bid + '|' + q.lo, ok);
      bump(by.sec, bid + '|' + q.sec, ok);
      bump(by.type, q.type, ok);
      if (!blank) { bump(by.typeA, q.type, ok); bump(by.secA, bid + '|' + q.sec, ok); }   /* skills are judged on answered questions only */
      if (w) { var m = by.mis[w.mis] = by.mis[w.mis] || { id: w.mis, bid: bid, n: 0, rows: [] }; m.n++; m.rows.push(row); }
    });
    var total = rows.length, correct = rows.filter(function (r) { return r.ok; }).length;
    var times = rows.map(function (r) { return r.it.t; }).sort(function (a, b) { return a - b; });
    var median = times.length ? times[Math.floor(times.length / 2)] : 0;
    var R = {
      D: D, test: T, rows: rows, by: by, total: total, correct: correct,
      blank: rows.filter(function (r) { return r.blank; }).length,
      wrong: rows.filter(function (r) { return !r.ok && !r.blank; }).length,
      pct: P(correct, total), median: median,
      rushed: rows.filter(function (r) { return !r.ok && !r.blank && r.it.t < 15; }),
      slow: rows.filter(function (r) { return r.it.t > Math.max(120, 2.5 * median); }),
      r2w: rows.filter(function (r) { return r.it.first === r.q.answer && !r.ok; }),
      w2r: rows.filter(function (r) { return r.it.first !== null && r.it.first !== r.q.answer && r.ok; }),
      mis: Object.keys(by.mis).map(function (k) { return by.mis[k]; }).sort(function (a, b) { return b.n - a.n; })
    };
    R.grade = grade(R.pct);
    R.timedOut = D.auto;
    R.diag = diagnose(R);
    return R;
  }
  function tp(R, types) {
    var c = 0, t = 0;
    types.forEach(function (k) { var x = R.by.typeA[k]; if (x) { c += x.c; t += x.t; } });
    return { c: c, t: t, p: P(c, t) };
  }
  function secList(R, answered) {
    var src = answered ? R.by.secA : R.by.sec;
    return Object.keys(src).map(function (k) {
      var parts = k.split('|'), x = src[k];
      return { key: k, bid: parts[0], sec: parts[1], title: secTitle(parts[0], parts[1]), c: x.c, t: x.t, p: P(x.c, x.t) };
    }).sort(function (a, b) {
      var ka = a.bid + (a.sec === 'CASE' ? '|~' : '|' + a.sec), kb = b.bid + (b.sec === 'CASE' ? '|~' : '|' + b.sec);
      return ka < kb ? -1 : 1;
    });
  }
  function diagnose(R) {
    var d = [], vocab = tp(R, ['vocab']), rest = tp(R, ['term', 'concept', 'scenario', 'figure', 'list', 'people', 'tf', 'case']);
    var term = tp(R, ['term']), apply = tp(R, ['scenario', 'case']), fig = tp(R, ['figure']), rec = tp(R, ['list', 'people']), tf = tp(R, ['tf']);
    if (vocab.t >= 3 && vocab.p < 60) d.push({ k: 'lang', sev: vocab.p < 50 ? 'high' : 'med', score: 100 - vocab.p + 10,
      h: 'الكلمات الإنجليزية هي أكبر عائق عندك',
      p: rest.p - vocab.p >= 15
        ? 'جبت ' + vocab.p + '% في أسئلة الكلمات مقابل ' + rest.p + '% في باقي الأسئلة. يعني جزء كبير من الغلط سببه إنك ما فهمت الكلمة، مو إنك ما تعرف المفهوم.'
        : 'جبت ' + vocab.p + '% في أسئلة الكلمات. الاختبار كله بالإنجليزي، فكل كلمة ما تعرفها تكلّفك سؤال.',
      a: 'افتح النسخة الإنجليزية من كل درس واضغط على الكلمات اللي تحتها خط، وكل يوم ١٠ دقائق بطاقات «عربي ← إنجليزي».',
      coach: 'كل يوم اعطه ١٠ كلمات من جدول المفردات في آخر الدرس الإنجليزي: قل الكلمة وخلّه يقول معناها ويستخدمها في جملة.' });
    if (term.t >= 3 && term.p >= 65 && apply.t >= 3 && apply.p <= term.p - 20) d.push({ k: 'apply', sev: 'high', score: term.p - apply.p + 20,
      h: 'تحفظ التعريف بس ما تعرف تطبقه',
      p: 'التعريفات ' + term.p + '% لكن المواقف ودراسة الحالة ' + apply.p + '%. الاختبار يعطيك قصة ويسألك وش المفهوم اللي فيها، والحفظ لحاله ما يكفي.',
      a: 'بعد كل تعريف تحفظه، اكتب مثال واحد من حياتك (مطعم، مستشفى، الجامعة) يوضحه. وحل أسئلة «اختبر نفسك» في آخر كل درس.',
      coach: 'قل له موقف من الحياة (مثلاً: مدير مطعم يوزّع الشفتات على الموظفين) واسأله: هذا أي مفهوم؟ وليش؟' });
    if (term.t >= 3 && term.p < 60) d.push({ k: 'defs', sev: term.p < 45 ? 'high' : 'med', score: 100 - term.p,
      h: 'التعريفات مو ثابتة',
      p: 'جبت ' + term.p + '% في أسئلة التعريفات. التعريف هو الأساس اللي تقوم عليه باقي الأسئلة.',
      a: 'اقرأ صناديق EXAM BOX في كل درس بصوت عالي، وراجع بطاقات «مفهوم» يومياً.',
      coach: 'اقرأ له التعريف بالإنجليزي وخلّه يقول المصطلح، وبعدين العكس: قل المصطلح وخلّه يقول التعريف.' });
    if (fig.t >= 3 && fig.p < 60) d.push({ k: 'fig', sev: 'med', score: 100 - fig.p - 10,
      h: 'قراءة الأشكال تحتاج شغل',
      p: 'جبت ' + fig.p + '% في أسئلة الأشكال. أشكال الكتاب نفسها تجي في الاختبار.',
      a: 'ارجع لكل شكل في الدروس واقرأ الشرح اللي تحته، وحاول ترسمه من ذاكرتك.',
      coach: 'غطّ الشكل وخلّه يرسمه لك من ذاكرته ويشرح وش فيه.' });
    if (rec.t >= 3 && rec.p < 60) d.push({ k: 'recall', sev: 'med', score: 100 - rec.p - 10,
      h: 'الأعداد والأسماء تضيع منك',
      p: 'جبت ' + rec.p + '% في أسئلة القوائم ومين قال وش. هذي أسهل درجات لو ثبّتها.',
      a: 'اكتب ورقة وحدة فيها كل الأعداد والقوائم والأسماء في الفصل، وراجعها قبل النوم.',
      coach: 'اسأله أسئلة سريعة بدون خيارات: كم وظيفة للإدارة؟ مين صاحب Theory X؟ وش أنواع المهارات الثلاث؟' });
    if (tf.t >= 3 && tf.p < 60) d.push({ k: 'tf', sev: 'med', score: 100 - tf.p - 20,
      h: 'فخاخ صح وخطأ',
      p: 'جبت ' + tf.p + '% في صح وخطأ. غالباً الجملة فيها كلمة مطلقة (always, only, never) أو مصطلح مبدّل.',
      a: 'في أي جملة صح وخطأ، دوّر على الكلمة اللي ممكن تخلّيها غلط قبل ما تقرر.',
      coach: 'اقرأ له جملة صحيحة من الدرس وغيّر فيها كلمة وحدة، وخلّه يكتشف وش تغيّر.' });
    if (R.rushed.length >= 3) d.push({ k: 'rush', sev: R.rushed.length >= 6 ? 'high' : 'med', score: 40 + R.rushed.length * 5,
      h: 'تستعجل',
      p: nq(R.rushed.length) + ' غلطت فيها بعد أقل من ١٥ ثانية. هذا وقت ما يكفي تقرأ السؤال والخيارات كلها.',
      a: 'اقرأ السؤال كامل، بعدين الخيارات الأربعة، وبعدها اختار. الوقت يكفيك.',
      coach: 'لما يحل قدامك، خلّه يقول بصوت عالي ليش استبعد كل خيار غلط.' });
    if (R.slow.length >= 3) d.push({ k: 'slow', sev: 'med', score: 35 + R.slow.length * 3,
      h: 'تعلق على بعض الأسئلة',
      p: nq(R.slow.length) + ' أخذت منك أكثر من دقيقتين. غالباً السبب قراءة الإنجليزي، مو صعوبة الفكرة.',
      a: 'لو ما وضح لك السؤال خلال دقيقة: علّمه ⚑ وكمّل، وارجع له في الآخر.',
      coach: 'درّبه يقرأ السؤال الإنجليزي ويحدد الكلمة المفتاحية فيه قبل ما يشوف الخيارات.' });
    if (R.r2w.length >= 2 && R.r2w.length > R.w2r.length) d.push({ k: 'second', sev: 'med', score: 30 + R.r2w.length * 5,
      h: 'تغيّر جوابك الصح',
      p: 'في ' + nq(R.r2w.length) + ' كان جوابك الأول صح وغيّرته لغلط' + (R.w2r.length ? '، مقابل ' + nq(R.w2r.length) + ' بس غيّرت فيها من غلط لصح.' : '.'),
      a: 'لا تغيّر جوابك إلا إذا لقيت سبب واضح في السؤال. الإحساس لحاله مو سبب.', coach: '' });
    if (R.blank >= 1 && !R.timedOut) d.push({ k: 'blank', sev: R.blank >= 4 ? 'high' : 'med', score: 30 + R.blank * 6,
      h: 'تركت أسئلة بدون جواب',
      p: 'ما جاوبت على ' + nq(R.blank) + '. ما فيه خصم على الغلط، فالسؤال المتروك صفر أكيد.',
      a: 'جاوب كل سؤال حتى لو تخمين: استبعد أبعد خيار واختار من الباقي.', coach: '' });
    if (R.timedOut) d.push({ k: 'time', sev: 'high', score: 999,
      h: 'خلص الوقت قبل ما تسلّم',
      p: 'الوقت انتهى والاختبار تسلّم تلقائي. جاوبت ' + (R.total - R.blank) + ' من ' + R.total + (R.blank ? '، و' + nq(R.blank) + ' انحسبت متروكة.' : '.'),
      a: 'امشِ على قاعدة دقيقة لكل سؤال، واللي يعلّقك علّمه وكمّل.', coach: 'خلّه يحل أسئلة مع مؤقت: دقيقة لكل سؤال.' });
    var secs = secList(R, true).filter(function (s) { return s.t >= 3 && s.sec !== 'CASE'; });
    if (secs.length >= 2) {
      var best = secs.slice().sort(function (a, b) { return b.p - a.p; })[0], worst = secs.slice().sort(function (a, b) { return a.p - b.p; })[0];
      if (best.p - worst.p >= 30) d.push({ k: 'uneven', sev: 'med', score: best.p - worst.p,
        h: 'مستواك مو متساوي بين الدروس',
        p: 'أقوى درس «' + best.title + '» (' + best.p + '%) وأضعفه «' + worst.title + '» (' + worst.p + '%).',
        a: 'ابدأ المراجعة من «' + worst.title + '».', coach: '', sec: worst });
    }
    return d.sort(function (a, b) { return (b.sev === 'high') - (a.sev === 'high') || b.score - a.score; });
  }

  /* ---------------- report ---------------- */
  function bars(list) {
    return '<div class="xbars">' + list.map(function (x) {
      return '<div class="r"><span>' + x.label + '</span><div class="bar"><i style="width:' + x.p + '%;background:' + color(x.p) + '"></i></div>' +
        '<span class="n">' + x.c + '/' + x.t + ' · ' + x.p + '%</span></div>';
    }).join('') + '</div>';
  }
  function lessonLink(sec, label, extra) {
    if (!sec || sec === 'CASE') return '';
    return '<a class="pill" href="lessons/' + sec + '.html' + (extra || '') + '">' + label + '</a>';
  }
  function teacherNote(R) {
    var p = R.pct, secs = secList(R, true).filter(function (s) { return s.t >= 3 && s.sec !== 'CASE'; });
    var best = secs.slice().sort(function (a, b) { return b.p - a.p; })[0];
    var types = Object.keys(R.by.type).filter(function (k) { return k !== 'case' && R.by.type[k].t >= 3; })
      .map(function (k) { return { k: k, p: P(R.by.type[k].c, R.by.type[k].t) }; }).sort(function (a, b) { return b.p - a.p; });
    var out = [], done = R.total - R.blank;
    if (done < R.total * 0.6) out.push('جاوبت <b>' + done + ' من ' + R.total + '</b> بس، فالدرجة هذي تعكس الوقت أكثر من الفهم. ' +
      (done ? 'في اللي جاوبته جبت <b>' + P(R.correct, done) + '%</b>.' : ''));
    else out.push(p >= 90 ? 'ممتاز يا يامن. هذا مستوى <b>' + R.grade[0] + '</b> — واضح إنك فاهم الفصل مو بس حافظه.'
      : p >= 80 ? 'شغل قوي. أنت قريب من الامتياز، والأخطاء اللي تحت محددة وسهلة تنصلح.'
      : p >= 70 ? 'مستوى جيد، بس فيه ثغرات واضحة — لو ما سكّرتها بتنزل درجتك في الاختبار الحقيقي.'
      : p >= 60 ? 'ناجح بس على الحافة. هذي الدرجة معناها إن فيه أجزاء كاملة مو ثابتة عندك، وهذا اللي بنصلحه الحين.'
      : 'النتيجة هذي مو حكم عليك — هي خريطة. الحين نعرف بالضبط وين المشكلة، وهذا أهم من الدرجة نفسها.');
    if (best && best.p >= 60) out.push('أقوى شي عندك: <b>' + esc(best.title) + '</b> (' + best.p + '%)' +
      (types.length && types[0].p >= 70 ? '، وأسئلة <b>' + TYPE_AR[types[0].k] + '</b> (' + types[0].p + '%).' : '.'));
    if (R.diag.length) out.push('أهم مشكلة: <b>' + esc(R.diag[0].h) + '</b>. ' + ar(R.diag[0].p));
    if (R.mis.length) {
      var m = misOf(R.mis[0].bid, R.mis[0].id);
      out.push('أكثر خطأ تكرر: <b>' + ar(m.ar) + '</b>' + (R.mis[0].n > 1 ? ' (' + R.mis[0].n + ' مرات).' : '.'));
    }
    var plan = studyPlan(R);
    out.push(plan.length ? 'ابدأ اليوم بالخطوة الأولى في الخطة تحت، وأعد الاختبار بعد ٣ أيام — بتجيك أسئلة جديدة.'
      : 'كمّل على نفس المستوى، وجرّب الاختبار الشامل أو الفصل الكامل.');
    return '<p>' + out.join('</p><p>') + '</p>';
  }
  function studyPlan(R) {
    var plan = [], weak = secList(R, true).filter(function (s) { return s.sec !== 'CASE' && s.t >= 2 && s.p < 70; }).sort(function (a, b) { return a.p - b.p; });
    weak.slice(0, 3).forEach(function (s) {
      plan.push({ t: 'أعد درس «' + esc(s.title) + '» — جبت فيه ' + s.p + '%. اقرأه بالعربي أول، بعدين النسخة الإنجليزية.',
        links: lessonLink(s.sec, 'الدرس بالعربي') + lessonLink(s.sec + '-EN', 'English') + lessonLink(s.sec, '🃏 بطاقات الدرس', '#practice') });
    });
    R.mis.slice(0, 3).forEach(function (x) {
      var m = misOf(x.bid, x.id);
      if (!m.fix) return;
      plan.push({ t: 'صحّح: <b>' + ar(m.ar) + '</b> — ' + ar(m.fix), links: m.sec ? lessonLink(m.sec, 'افتح الدرس') : '' });
    });
    if (R.diag.some(function (d) { return d.k === 'lang'; })) plan.push({ t: 'روتين الكلمات: ١٠ دقائق يومياً على بطاقات الكلمات (عربي ← إنجليزي) لكل درس ذاكرته.', links: '<a class="pill" href="index.html">🃏 البطاقات</a>' });
    if (plan.length) plan.push({ t: 'بعد ٣ أيام أعد نفس الاختبار — يجيك أسئلة ما شفتها، وتقارن نتيجتك.', links: '<a class="pill gold" href="#t=' + R.test.id + '">↻ أعد الاختبار</a>' });
    return plan;
  }
  function previousOf(R) {
    var hist = lsGet(HIST, []), idx = -1;
    for (var i = 0; i < hist.length; i++) if (hist[i].code === R.D.code) idx = i;
    for (var j = (idx < 0 ? hist.length : idx) - 1; j >= 0; j--) if (hist[j].test === R.test.id) return hist[j];
    return null;
  }
  function showReport(code) {
    setTimer(null);
    var D = decode(code);
    if (!D || D.error) { view.innerHTML = '<div class="card xempty">الرابط هذا ناقص أو قديم — ما قدرت أقرأ النتيجة.</div><div class="xacts"><a class="pill" href="#">الاختبارات</a></div>'; return; }
    if (!ready(D.test)) { view.innerHTML = '<div class="card xempty">بنك الأسئلة ما تحمّل. حدّث الصفحة.</div>'; return; }
    var R = analyze(D), T = R.test, prev = previousOf(R);
    var circ = 2 * Math.PI * 56, dash = circ * R.pct / 100;
    var h = '<div class="xrep">';
    /* hero */
    h += '<div class="card"><div class="xhero"><div class="xring"><svg viewBox="0 0 134 134" width="100%" height="100%">' +
      '<circle cx="67" cy="67" r="56" fill="none" stroke="var(--surface-2)" stroke-width="12"/>' +
      '<circle cx="67" cy="67" r="56" fill="none" stroke="' + color(R.pct) + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + dash + ' ' + circ + '"/></svg>' +
      '<div class="v"><div><b>' + R.pct + '%</b><small>' + R.correct + ' من ' + R.total + '</small></div></div></div>' +
      '<div class="hx"><div class="xgrade" style="color:' + color(R.pct) + '">' + R.grade[0] + '<small>' + R.grade[1] + '</small></div>' +
      '<div class="tn">' + ar(T.title) + '<br>' + dateAr(D.start) + ' · الوقت ' + fmt(D.dur) + ' من ' + fmt(D.limit) + (R.timedOut ? ' · خلص الوقت' : '') + '</div>' +
      (prev ? '<div class="tn">المحاولة اللي قبل: ' + prev.pct + '% <span class="xdelta ' + (R.pct >= prev.pct ? 'up' : 'down') + '">' + (R.pct >= prev.pct ? '+' : '') + (R.pct - prev.pct) + '</span></div>' : '') +
      '</div></div>' +
      '<div class="xstats"><div><b>' + R.correct + '</b>صح</div><div><b>' + R.wrong + '</b>غلط</div><div><b>' + R.blank + '</b>متروك</div><div><b>' + fmt(R.median) + '</b>متوسط السؤال</div></div>' +
      '<div class="xacts"><button class="pill gold" id="xshare">📤 أرسل التقرير</button><a class="pill" href="#t=' + T.id + '">↻ اختبار جديد</a><a class="pill" href="#">كل الاختبارات</a></div></div>';
    /* teacher */
    h += '<div class="card"><h2>🧑‍🏫 كلمة المدرّس</h2><div class="xnote">' + teacherNote(R) + '</div></div>';
    /* diagnoses */
    if (R.diag.length) {
      h += '<div class="card"><h2>وش المشاكل؟ <small>مرتبة من الأهم</small></h2>';
      R.diag.forEach(function (d) { h += '<div class="xdiag ' + d.sev + '"><h4>' + ar(d.h) + '</h4><p>' + ar(d.p) + '</p><div class="do">' + ar(d.a) + '</div></div>'; });
      h += '</div>';
    }
    /* strengths */
    var strong = [];
    secList(R).forEach(function (s) { if (s.sec !== 'CASE' && s.t >= 3 && s.p >= 80) strong.push('درس «' + esc(s.title) + '» — ' + s.p + '%'); });
    Object.keys(R.by.type).forEach(function (k) { var x = R.by.type[k]; if (x.t >= 3 && P(x.c, x.t) >= 80) strong.push('أسئلة ' + TYPE_AR[k] + ' — ' + P(x.c, x.t) + '%'); });
    if (strong.length) h += '<div class="card"><h2>💪 نقاط القوة</h2><div class="xdiag good"><p>' + strong.join('<br>') + '</p></div></div>';
    /* by lesson / type / LO */
    h += '<div class="card"><h2>حسب الدرس</h2>' + bars(secList(R).map(function (s) {
      return { label: s.sec === 'CASE' ? esc(s.title) : '<a href="lessons/' + s.sec + '.html">' + esc(s.title) + '</a>', c: s.c, t: s.t, p: s.p }; })) + '</div>';
    h += '<div class="card"><h2>حسب نوع السؤال <small>يبيّن وش نوع المهارة الناقصة</small></h2>' + bars(Object.keys(TYPE_AR).filter(function (k) { return R.by.type[k]; }).map(function (k) {
      var x = R.by.type[k]; return { label: TYPE_AR[k], c: x.c, t: x.t, p: P(x.c, x.t) }; })) + '</div>';
    h += '<div class="card"><h2>حسب هدف التعلّم <small>Learning Objectives</small></h2>' + bars(Object.keys(R.by.lo).sort().map(function (k) {
      var parts = k.split('|'), x = R.by.lo[k];
      return { label: '<bdi>' + esc(parts[1]) + '</bdi> ' + esc(loLabel(parts[0], parts[1])), c: x.c, t: x.t, p: P(x.c, x.t) }; })) + '</div>';
    /* misconceptions */
    if (R.mis.length) {
      h += '<div class="card"><h2>الأخطاء اللي وقعت فيها <small>كل غلط له سبب</small></h2>';
      R.mis.slice(0, 10).forEach(function (x) {
        var m = misOf(x.bid, x.id);
        h += '<div class="xmis"><h4><span>' + ar(m.ar) + '</span> <span class="c">×' + x.n + '</span></h4>' +
          (m.explain ? '<p>' + ar(m.explain) + '</p>' : '') + (m.fix ? '<p><b>الحل:</b> ' + ar(m.fix) + '</p>' : '') +
          '<p style="font-size:.8rem;color:var(--muted)">في الأسئلة: ' + x.rows.map(function (r) { return '<a href="#q' + r.i + '">' + (r.i + 1) + '</a>'; }).join('، ') + '</p></div>';
      });
      h += '</div>';
    }
    /* time */
    h += '<div class="card"><h2>⏱ كيف استخدمت الوقت</h2><div class="xtime">' +
      '<div><b>' + fmt(D.dur) + '</b>الوقت الكلي من ' + fmt(D.limit) + '</div>' +
      '<div><b>' + fmt(R.median) + '</b>متوسط وقتك للسؤال</div>' +
      '<div><b>' + R.rushed.length + '</b>غلط بسرعة (أقل من ١٥ ث)</div>' +
      '<div><b>' + R.slow.length + '</b>أسئلة علّقتك (+٢ دقيقة)</div>' +
      '<div><b>' + R.r2w.length + '</b>غيّرت من صح لغلط</div>' +
      '<div><b>' + R.w2r.length + '</b>غيّرت من غلط لصح</div></div></div>';
    /* plan */
    var plan = studyPlan(R);
    if (plan.length) {
      h += '<div class="card"><h2>📋 خطة المذاكرة</h2><ol class="xplan">';
      plan.forEach(function (s) { h += '<li>' + s.t + (s.links ? '<div class="links">' + s.links + '</div>' : '') + '</li>'; });
      h += '</ol></div>';
    }
    /* coach */
    var tips = [];
    R.mis.slice(0, 3).forEach(function (x) { var m = misOf(x.bid, x.id); if (m.coach) tips.push('<b>' + ar(m.ar) + ':</b> ' + ar(m.coach)); });
    R.diag.slice(0, 3).forEach(function (d) { if (d.coach) tips.push('<b>' + ar(d.h) + ':</b> ' + ar(d.coach)); });
    var worstSec = secList(R, true).filter(function (s) { return s.t >= 2 && s.sec !== 'CASE'; }).sort(function (a, b) { return a.p - b.p; })[0];
    h += '<div class="card xcoach"><h2>🤝 للي يساعدك في المذاكرة</h2>' +
      '<p>الملخص: <b>' + R.pct + '% (' + R.grade[0] + ')</b>' + (worstSec ? ' · أضعف درس: <b>' + esc(worstSec.title) + '</b> (' + worstSec.p + '%)' : '') +
      (R.diag.length ? ' · أهم مشكلة: <b>' + esc(R.diag[0].h) + '</b>' : '') + '.</p>' +
      (tips.length ? '<p>وش تسوي معه هالأسبوع:</p><ul>' + tips.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' : '<p>مستواه ممتاز — خلّه يجرّب الاختبار الشامل.</p>') + '</div>';
    /* review */
    var nWrong = R.rows.filter(function (r) { return !r.ok; }).length;
    h += '<div class="card"><h2>مراجعة الأسئلة</h2><div class="xfilter">' +
      '<button class="pill" data-f="bad" aria-pressed="' + (nWrong ? 'true' : 'false') + '">الغلط والمتروك (' + nWrong + ')</button>' +
      '<button class="pill" data-f="flag" aria-pressed="false">المعلّمة ⚑</button>' +
      '<button class="pill" data-f="all" aria-pressed="' + (nWrong ? 'false' : 'true') + '">الكل (' + R.total + ')</button></div><div id="xrevs"></div></div>';
    h += '</div>';
    view.innerHTML = h;
    renderReview(R, nWrong ? 'bad' : 'all');
    view.querySelectorAll('.xfilter button').forEach(function (b) {
      b.addEventListener('click', function () {
        view.querySelectorAll('.xfilter button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        renderReview(R, b.dataset.f);
      });
    });
    document.getElementById('xshare').addEventListener('click', function () { share(R); });
    view.querySelectorAll('a[href^="#q"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var id = a.getAttribute('href').slice(1), el = document.getElementById(id);
        if (!el) { view.querySelector('.xfilter button[data-f="all"]').click(); el = document.getElementById(id); }
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    window.scrollTo(0, 0);
  }
  function renderReview(R, f) {
    var rows = R.rows.filter(function (r) { return f === 'all' || (f === 'bad' && !r.ok) || (f === 'flag' && r.it.flag); });
    var box = document.getElementById('xrevs');
    if (!rows.length) { box.innerHTML = '<div class="xempty">' + (f === 'flag' ? 'ما علّمت أي سؤال.' : 'ولا غلط. 👏') + '</div>'; return; }
    box.innerHTML = rows.map(function (r) {
      var q = r.q, cs = q.caseId ? caseOf(r.bid, q.caseId) : null, m = r.w ? misOf(r.bid, r.w.mis) : null;
      var s = '<div class="xrev ' + (r.ok ? 'ok' : r.blank ? 'blank' : 'bad') + '" id="q' + r.i + '">' +
        '<div class="meta"><span class="st">' + (r.ok ? '✓ صح' : r.blank ? '— متروك' : '✗ غلط') + '</span><span>سؤال ' + (r.i + 1) + '</span>' +
        '<span>' + TYPE_AR[q.type] + '</span><span><bdi>' + esc(q.lo) + '</bdi></span><span>⏱ ' + fmt(r.it.t) + '</span>' +
        (r.it.chg ? '<span>غيّرت جوابك ' + r.it.chg + '×</span>' : '') + (r.it.flag ? '<span>⚑</span>' : '') + '</div>';
      if (cs) s += '<details class="cs"><summary>📋 Case — ' + esc(cs.title) + '</summary><div class="cx">' + esc(cs.text) + '</div></details>';
      if (q.img) s += '<div class="exhibit"><img src="' + esc(q.img) + '" alt="The textbook figure for this question" loading="lazy"></div>';
      s += '<div class="stem">' + esc(q.stem) + '</div>';
      q.options.forEach(function (o, i) {
        var right = i === q.answer, mine = i === r.it.ans && !right;
        s += '<div class="o' + (right ? ' right' : '') + (mine ? ' mine' : '') + (/[؀-ۿ]/.test(o) ? ' ar' : '') + '"><span class="m">' + (right ? '✓' : mine ? '✗' : '') + '</span><span dir="auto">' + esc(o) + '</span></div>';
      });
      s += '<div class="why"><b>ليش؟</b> ' + ar(q.why) + '</div>';
      if (r.w) s += '<div class="trap"><b>السبب:</b> ' + ar(m.ar) + (r.w.note ? ' — ' + ar(r.w.note) : '') + '</div>';
      s += (q.sec && q.sec !== 'CASE' ? '<div class="xacts" style="margin-top:8px">' + lessonLink(q.sec, 'راجع الدرس') + '</div>' : '') + '</div>';
      return s;
    }).join('');
  }
  function share(R) {
    var url = location.origin + location.pathname + '#r=' + encodeURIComponent(R.D.code);
    var top = R.diag[0] ? R.diag[0].h : (R.mis[0] ? misOf(R.mis[0].bid, R.mis[0].id).ar : '');
    var text = 'نتيجة ' + R.test.title + ': ' + R.correct + '/' + R.total + ' (' + R.pct + '%) — ' + R.grade[0] +
      (top ? '\nأهم نقطة ضعف: ' + top : '') + '\nالتقرير كامل:';
    if (navigator.share) { navigator.share({ title: 'نتيجة الاختبار', text: text, url: url }).catch(function () {}); return; }
    var done = function () { window.open('https://wa.me/?text=' + encodeURIComponent(text + '\n' + url), '_blank'); };
    try { navigator.clipboard.writeText(url).then(done, done); } catch (e) { done(); }
  }

  /* ---------------- router ---------------- */
  function route() {
    closeSheet();
    var h = decodeURIComponent(location.hash.slice(1));
    if (h.indexOf('r=') === 0) { if (A) return; showReport(h.slice(2)); return; }
    var live = lsGet(LIVE, null);
    if (live && testById(live.test)) {
      if (h.indexOf('t=') === 0 && h.slice(2) !== live.test) { showIntro(testById(h.slice(2))); return; }
      run(live); return;
    }
    if (h.indexOf('t=') === 0 && testById(h.slice(2))) { showIntro(testById(h.slice(2))); return; }
    showHome();
  }
  document.addEventListener('keydown', function (e) {
    if (!A || document.querySelector('.xsheet') || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase(), c = current(), idx = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
    if (idx >= 0 && idx < c.it.perm.length) { e.preventDefault(); choose(c.it.perm[idx]); }
    else if (k === 'enter') { e.preventDefault(); if (A.cur < A.qs.length - 1) go(A.cur + 1); else confirmSubmit(); }
  });
  document.addEventListener('DOMContentLoaded', function () {
    view = document.getElementById('view'); timerEl = document.getElementById('xtimer');
    window.addEventListener('hashchange', route);
    route();
  });
  window.YH_EXAM = { analyze: analyze, decode: decode, draw: draw, encode: encode };
})();
