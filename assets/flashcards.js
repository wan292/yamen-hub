/* Yamen's Hub — flashcards. Leitner boxes, progress in localStorage, flip UI. No dependencies.
   Deck format:  { id, title, cards:[ {id, en, ar, x, ex, kind} ] }
   kind: "vocab" | "concept"   ·  x = casual Arabic explanation · ex = example sentence (optional) */
(function(){
  var DAY=864e5, GAP=[0,1,3,7,14];           /* days until due, per box 0..4 */
  var LIMIT=20;

  function load(id){ try{ return JSON.parse(localStorage.getItem('yh-fc-'+id)||'{}'); }catch(e){ return {}; } }
  function save(id,st){ try{ localStorage.setItem('yh-fc-'+id, JSON.stringify(st)); }catch(e){} }
  function bumpStreak(){
    try{ var k='yh-streak', d=new Date(); d.setHours(0,0,0,0);
      var s=JSON.parse(localStorage.getItem(k)||'{"n":0,"last":0}'), t=d.getTime();
      if(s.last===t) return s.n;
      s.n = (t-s.last===DAY) ? s.n+1 : 1; s.last=t; localStorage.setItem(k,JSON.stringify(s)); return s.n;
    }catch(e){ return 0; }
  }
  function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }

  /* public stats for the hub */
  function stats(deck){
    var st=load(deck.id), now=Date.now(), due=0, seen=0, learned=0;
    deck.cards.forEach(function(c){ var r=st[c.id]; if(!r){ due++; return; } seen++;
      if(r.box>=3) learned++; if(r.due<=now) due++; });
    return {total:deck.cards.length, due:due, seen:seen, learned:learned};
  }
  function pick(deck){
    var st=load(deck.id), now=Date.now();
    var due=deck.cards.filter(function(c){ var r=st[c.id]; return !r || r.due<=now; });
    due.sort(function(a,b){ var ra=st[a.id]||{box:0,due:0}, rb=st[b.id]||{box:0,due:0}; return ra.box-rb.box || ra.due-rb.due; });
    return shuffle(due.slice(0,LIMIT));
  }

  /* ---------- UI ---------- */
  var ov, el={};
  function build(){
    ov=document.createElement('div'); ov.className='fc-ov';
    ov.innerHTML=
      '<div class="fc" role="dialog" aria-modal="true">'+
      '<div class="fc-top"><span class="ttl"></span><span class="cnt"></span>'+
      '<button class="tbtn fc-x" aria-label="إغلاق">✕</button></div>'+
      '<div class="fc-prog"><i></i></div>'+
      '<div class="fc-body">'+
        '<div class="fc-stage"><div class="fc-card">'+
          '<div class="fc-face fc-front"><span class="tag"></span><div class="w"></div><div class="ex"></div><span class="hint">اضغط البطاقة عشان تقلبها</span></div>'+
          '<div class="fc-face fc-back"><span class="tag"></span><div class="w ar"></div><div class="x"></div><div class="ex"></div></div>'+
        '</div></div>'+
        '<div class="fc-btns"><button class="fc-btn flipb">اقلب البطاقة</button>'+
          '<button class="fc-btn no" disabled>❌ ما عرفتها</button><button class="fc-btn yes" disabled>✅ عرفتها</button></div>'+
        '<div class="fc-foot"><span class="mode"></span><button class="pill swap">🔁 اعكس الاتجاه</button></div>'+
      '</div>'+
      '<div class="fc-done" hidden></div>'+
      '</div>';
    document.body.appendChild(ov);
    el.ttl=ov.querySelector('.ttl'); el.cnt=ov.querySelector('.cnt'); el.prog=ov.querySelector('.fc-prog i');
    el.body=ov.querySelector('.fc-body'); el.done=ov.querySelector('.fc-done');
    el.card=ov.querySelector('.fc-card'); el.ftag=ov.querySelector('.fc-front .tag'); el.fw=ov.querySelector('.fc-front .w');
    el.fex=ov.querySelector('.fc-front .ex'); el.btag=ov.querySelector('.fc-back .tag'); el.bw=ov.querySelector('.fc-back .w');
    el.bx=ov.querySelector('.fc-back .x'); el.bex=ov.querySelector('.fc-back .ex');
    el.flip=ov.querySelector('.flipb'); el.no=ov.querySelector('.no'); el.yes=ov.querySelector('.yes');
    el.mode=ov.querySelector('.mode'); el.swap=ov.querySelector('.swap');
    ov.querySelector('.fc-x').addEventListener('click',close);
    ov.addEventListener('click',function(e){ if(e.target===ov) close(); });
    el.card.addEventListener('click',flip); el.flip.addEventListener('click',flip);
    el.no.addEventListener('click',function(){ grade(false); });
    el.yes.addEventListener('click',function(){ grade(true); });
    el.swap.addEventListener('click',function(){ S.mode = S.mode==='en' ? 'ar' : 'en'; show(); });
    document.addEventListener('keydown',function(e){ if(!ov.classList.contains('on')) return;
      if(e.key==='Escape') close(); else if(e.key===' '||e.key==='Enter'){ e.preventDefault(); flip(); }
      else if(e.key==='1'||e.key==='ArrowLeft') grade(false); else if(e.key==='2'||e.key==='ArrowRight') grade(true); });
  }

  var S={};
  function open(deck,mode){
    if(!ov) build();
    S={deck:deck, mode:mode||'en', queue:pick(deck), i:0, right:0, wrong:0, flipped:false};
    el.ttl.textContent=deck.title; el.done.hidden=true; el.body.hidden=false;
    ov.classList.add('on'); document.body.style.overflow='hidden';
    if(!S.queue.length){ finish(true); return; }
    show();
  }
  function close(){ ov.classList.remove('on'); document.body.style.overflow=''; try{speechSynthesis.cancel();}catch(e){} }
  function speaker(text){ var b=document.createElement('button'); b.className='spk'; b.type='button'; b.textContent='🔊';
    b.addEventListener('click',function(e){ e.stopPropagation(); if(window.yhSay) yhSay(text); }); return b; }
  function show(){
    var c=S.queue[S.i]; S.flipped=false; el.card.classList.remove('flip');
    el.no.disabled=true; el.yes.disabled=true; el.flip.disabled=false;
    el.cnt.textContent=(S.i+1)+' / '+S.queue.length; el.prog.style.width=(S.i/S.queue.length*100)+'%';
    var kindAr = c.kind==='concept' ? 'مفهوم' : 'كلمة';
    el.mode.textContent = S.mode==='en' ? 'الاتجاه: إنجليزي ← عربي' : 'الاتجاه: عربي ← إنجليزي (أصعب)';
    el.fw.innerHTML=''; el.bw.innerHTML=''; el.fex.textContent=''; el.bex.textContent='';
    if(S.mode==='en'){
      el.ftag.textContent=kindAr; el.fw.textContent=c.en; el.fw.classList.remove('ar'); el.fw.appendChild(speaker(c.en));
      el.fex.textContent=c.ex||'';
      el.btag.textContent='المعنى'; el.bw.textContent=c.ar; el.bw.classList.add('ar'); el.bx.textContent=c.x||'';
    } else {
      el.ftag.textContent='وش الكلمة بالإنجليزي؟'; el.fw.textContent=c.ar; el.fw.classList.add('ar'); el.fex.textContent=c.x||'';
      el.btag.textContent=kindAr; el.bw.textContent=c.en; el.bw.classList.remove('ar'); el.bw.appendChild(speaker(c.en));
      el.bx.textContent=''; el.bex.textContent=c.ex||'';
    }
    if(S.mode==='en' && window.yhSay) setTimeout(function(){ yhSay(c.en); }, 250);
  }
  function flip(){ if(S.flipped) return; S.flipped=true; el.card.classList.add('flip');
    el.no.disabled=false; el.yes.disabled=false; el.flip.disabled=true;
    if(S.mode==='ar' && window.yhSay) setTimeout(function(){ yhSay(S.queue[S.i].en); }, 300); }
  function grade(ok){
    if(!S.flipped) return;
    var c=S.queue[S.i], st=load(S.deck.id), r=st[c.id]||{box:0,due:0};
    r.box = ok ? Math.min(r.box+1,4) : 0;
    r.due = Date.now() + GAP[r.box]*DAY; st[c.id]=r; save(S.deck.id,st);
    if(ok) S.right++; else { S.wrong++; S.queue.push(c); }   /* wrong cards come back this session */
    S.i++;
    if(S.i>=S.queue.length) finish(false); else show();
  }
  function finish(nothing){
    var n=bumpStreak(); el.body.hidden=true; el.done.hidden=false; el.prog.style.width='100%';
    var st=stats(S.deck);
    el.done.innerHTML = nothing
      ? '<div class="big-n">✅</div><p>ما فيه بطاقات مستحقة الحين — راجعت كل شي. ارجع بكرة.</p>'+
        '<p class="streak">🔥 '+n+' يوم متواصل</p><br><button class="pill gold fc-again">إغلاق</button>'
      : '<div class="big-n">'+S.right+'</div><p>صح من أصل '+(S.right+S.wrong)+' · '+
        'تعلّمت '+st.learned+' من '+st.total+' في هذا الدرس</p>'+
        '<p class="streak">🔥 '+n+' يوم متواصل</p><br>'+
        '<button class="pill gold fc-again">🔁 جولة ثانية</button> <button class="pill fc-close2">إغلاق</button>';
    el.done.querySelector('.fc-again').addEventListener('click',function(){ nothing?close():open(S.deck,S.mode); });
    var c2=el.done.querySelector('.fc-close2'); if(c2) c2.addEventListener('click',close);
  }

  window.YH_FLASH={open:open, close:close, stats:stats};
})();
