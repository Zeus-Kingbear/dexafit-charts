/* DexaFit Education Charts — shared chrome behavior (KIN-127).
   Handles domain-lock, GTM, embed mode, and injects the brand mark, help modal
   and copyright — all driven by window.DFCONFIG (defaults = DexaFit Scottsdale,
   so the primary site needs no config; other owners set DFCONFIG before this file).
   A chart supplies its help text via window.HELP_TITLE / HELP_BODY (and optional
   HELP_FOOT). Load this in <head> with chrome.css; keep the chart's own <script>
   at the end of <body>. */
(function(){
  var C = window.DFCONFIG || {};
  var loc      = C.loc      || 'Scottsdale';
  var sub      = C.sub      || 'Education Charts';
  var allow    = C.allow    || ['charts.kingbear.co','localhost','127.0.0.1'];
  var gtmId    = C.gtmId    || 'GTM-MGC5F4HG';
  var redirect = C.redirect || 'https://www.dexafit.com';
  var isEmbed  = !!new URLSearchParams(location.search).get('embed');

  /* 1) domain lock (recommended level) — runs immediately */
  var h = (location.hostname||'').toLowerCase();
  var ok = h===''||h.endsWith('.vercel.app')||allow.some(function(d){return h===d||h.endsWith('.'+d);});
  if(!ok){
    window.__DF_LOCKED = true;
    var blank = function(){
      document.documentElement.innerHTML =
        '<div style="font:600 18px/1.5 system-ui;padding:48px;color:#10151B;max-width:620px">'+
        'This interactive content is \u00a9 DexaFit '+loc+' and is licensed for use only on its official site. '+
        '<a href="'+redirect+'" style="color:#0A6F9E">Visit DexaFit '+loc+' \u2192</a></div>';
    };
    if(document.body) blank(); else document.addEventListener('DOMContentLoaded', blank);
    return;
  }

  /* 2) Google Tag Manager (embed-aware) */
  if(!isEmbed){
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer',gtmId);
  }

  /* 3) on DOM ready: embed class, brand, copyright, help modal */
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    if(window.__DF_LOCKED) return;
    if(isEmbed) document.body.classList.add('embed');

    var brand = document.querySelector('.brand');
    if(brand && !brand.children.length){
      brand.innerHTML = '<span>DEXA</span><span class="x">FIT</span><span class="loc">'+loc+'</span><small>'+sub+'</small>';
    }

    if(!document.querySelector('.copyr')){
      var c = document.createElement('div'); c.className='copyr'; c.textContent='\u00a9 2026 DexaFit '+loc;
      document.body.appendChild(c);
    }

    if(!document.getElementById('helpBtn')){
      var foot = window.HELP_FOOT || ('\u00a9 2026 DexaFit '+loc+' \u00b7 An education tool for your consultation \u2014 not medical advice.');
      var btn = document.createElement('button');
      btn.id='helpBtn'; btn.className='helpBtn'; btn.setAttribute('aria-label','What is this and how do I use it?'); btn.textContent='?';
      document.body.appendChild(btn);
      var modal = document.createElement('div'); modal.id='helpModal'; modal.className='helpModal'; modal.hidden=true;
      modal.innerHTML = '<div class="helpCard"><button id="helpClose" class="helpClose" aria-label="Close">\u00d7</button>'+
        '<h2 id="helpTitle"></h2><div id="helpBody"></div><div class="helpFoot">'+foot+'</div></div>';
      document.body.appendChild(modal);
      document.getElementById('helpTitle').textContent = window.HELP_TITLE || 'About this chart';
      document.getElementById('helpBody').innerHTML   = window.HELP_BODY  || '';
      btn.addEventListener('click', function(){ modal.hidden=false; });
      document.getElementById('helpClose').addEventListener('click', function(){ modal.hidden=true; });
      modal.addEventListener('click', function(e){ if(e.target.id==='helpModal') modal.hidden=true; });
    }

    /* +/- steppers on every slider (KIN-436) */
    Array.prototype.forEach.call(document.querySelectorAll('.controls input[type=range]'), function(sl){
      if(sl.dataset.dfStep) return; sl.dataset.dfStep='1';
      var step=parseFloat(sl.step)||1, mn=parseFloat(sl.min), mx=parseFloat(sl.max);
      var dec=(String(sl.step).split('.')[1]||'').length;
      var mk=function(t,lbl){ var b=document.createElement('button'); b.type='button'; b.className='df-step'; b.textContent=t; b.setAttribute('aria-label',lbl); return b; };
      var minus=mk('\u2212','decrease'), plus=mk('+','increase');
      var wrap=document.createElement('div'); wrap.className='df-stepper';
      sl.parentNode.insertBefore(wrap, sl);
      wrap.appendChild(minus); wrap.appendChild(sl); wrap.appendChild(plus);
      var nudge=function(dir){ var v=parseFloat(sl.value)+dir*step; if(v<mn)v=mn; if(v>mx)v=mx;
        v=parseFloat(v.toFixed(dec)); sl.value=v; sl.dispatchEvent(new Event('input',{bubbles:true})); };
      minus.addEventListener('click',function(){ nudge(-1); });
      plus.addEventListener('click',function(){ nudge(1); });
    });
  });
})();
