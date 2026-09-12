/* Yamen's Hub — shared page behaviour: theme, glosses, speech, reading bar, practice launcher */
(function(){
  /* ---------- theme (default dark; remembered) ---------- */
  var KEY='yh-theme';
  function applyTheme(t){ document.documentElement.setAttribute('data-theme',t);
    document.querySelectorAll('.tbtn.theme').forEach(function(b){ b.textContent = t==='dark' ? '☀️' : '🌙';
      b.setAttribute('aria-label', t==='dark' ? 'الوضع الفاتح' : 'الوضع الداكن'); }); }
  function currentTheme(){ try{ return localStorage.getItem(KEY) || 'dark'; }catch(e){ return 'dark'; } }
  window.yhToggleTheme=function(){ var t=currentTheme()==='dark'?'light':'dark';
    try{ localStorage.setItem(KEY,t); }catch(e){} applyTheme(t); };

  /* ---------- speech (browser TTS, free, works on iPhone) ---------- */
  window.yhSay=function(text,lang){
    if(!('speechSynthesis' in window)) return;
    try{ speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(text); u.lang=lang||'en-US'; u.rate=0.85;
      var vs=speechSynthesis.getVoices().filter(function(v){return v.lang&&v.lang.indexOf('en')===0;});
      var pref=vs.find(function(v){return /Samantha|Daniel|Google US|Google UK|Karen|Moira/.test(v.name);})||vs[0];
      if(pref) u.voice=pref; speechSynthesis.speak(u); }catch(e){}
  };
  function spkBtn(text){ var b=document.createElement('button'); b.type='button'; b.className='spk';
    b.title='اسمع النطق'; b.setAttribute('aria-label','pronounce'); b.textContent='🔊';
    b.addEventListener('click',function(e){ e.stopPropagation(); e.preventDefault(); yhSay(text); }); return b; }

  /* ---------- glosses (two tiers) ---------- */
  function buildGlosses(){
    document.querySelectorAll('span.g, span.g2').forEach(function(s){
      if(s.querySelector('.ar')) return;
      var t=document.createElement('span'); t.className='ar';
      if(s.classList.contains('g')){
        var b=document.createElement('b'); b.textContent=s.dataset.ar; t.appendChild(b);
        if(s.dataset.x){ var m=document.createElement('small'); m.textContent=s.dataset.x; t.appendChild(m); }
      } else { t.textContent=s.dataset.ar; }
      s.appendChild(t);
      s.addEventListener('click',function(e){
        e.stopPropagation();
        document.querySelectorAll('span.g.on, span.g2.on').forEach(function(o){ if(o!==s) o.classList.remove('on'); });
        s.classList.toggle('on');
        if(s.classList.contains('on')){
          t.style.transform='translateX(-50%)';
          var r=t.getBoundingClientRect(), pad=10, w=window.innerWidth, dx=0;
          if(r.left<pad) dx=pad-r.left; else if(r.right>w-pad) dx=(w-pad)-r.right;
          if(dx) t.style.transform='translateX(calc(-50% + '+dx+'px))';
        }
      });
      /* speaker after every vocabulary word (tier 1) — reads the English word */
      if(s.classList.contains('g') && !s.nextElementSibling?.classList?.contains('spk')){
        var word=(s.firstChild&&s.firstChild.textContent||'').trim();
        if(word) s.insertAdjacentElement('afterend', spkBtn(word));
      }
    });
    document.addEventListener('click',function(){
      document.querySelectorAll('span.g.on, span.g2.on').forEach(function(o){o.classList.remove('on');});
    });
    /* Arabic pages: speaker on each English term in the terms tables (first cell) */
    if(document.documentElement.dir==='rtl'){
      document.querySelectorAll('table td:first-child > bdi, table td:first-child > b > bdi').forEach(function(b){
        if(b.parentElement.querySelector('.spk')) return;
        var w=b.textContent.trim(); if(w && /[A-Za-z]/.test(w)) b.insertAdjacentElement('afterend', spkBtn(w));
      });
    }
    /* concept headers: speaker on the English term */
    document.querySelectorAll('.chead .term').forEach(function(el){
      if(el.querySelector('.spk')) return; el.appendChild(spkBtn(el.textContent.trim())); });
  }

  /* ---------- reading progress bar ---------- */
  function readbar(){
    var bar=document.createElement('div'); bar.className='readbar'; document.body.appendChild(bar);
    function upd(){ var h=document.documentElement; var max=h.scrollHeight-h.clientHeight;
      bar.style.width=(max>0? (h.scrollTop/max*100):0)+'%'; }
    window.addEventListener('scroll',upd,{passive:true}); upd();
  }

  /* ---------- practice launcher ---------- */
  function wirePractice(){
    document.querySelectorAll('[data-deck]').forEach(function(b){
      b.addEventListener('click',function(){
        var id=b.dataset.deck, mode=b.dataset.mode||'en';
        if(window.YH_FLASH && window.YH_DECKS && window.YH_DECKS[id]) YH_FLASH.open(YH_DECKS[id], mode);
      });
    });
  }

  document.addEventListener('DOMContentLoaded',function(){
    applyTheme(currentTheme());
    document.querySelectorAll('.tbtn.theme').forEach(function(b){ b.addEventListener('click',yhToggleTheme); });
    buildGlosses(); readbar(); wirePractice();
    if('speechSynthesis' in window) speechSynthesis.onvoiceschanged=function(){};
  });
})();
