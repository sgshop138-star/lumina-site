(function(){
'use strict';
var BRAND='Лумина'; /* название бренда — меняется здесь */
document.querySelectorAll('[data-brand]').forEach(function(e){e.textContent=BRAND});
document.title=document.title.replace(/КРЕАТОР|ЛУМИНА|Лумина/,BRAND);
document.getElementById('yr').textContent=new Date().getFullYear();

/* Фон: 720p на телефонах, 1080p на десктопе; при reduced-motion/Save-Data — только постер */
var v=document.getElementById('bgv');
function startBg(){
  v.muted=true;v.setAttribute('muted','');v.autoplay=true;
  v.src=innerWidth*devicePixelRatio<1300?'media/bg-720.mp4?v=15':'media/bg-1080.mp4?v=15';
  var show=function(){v.classList.add('on')};
  v.addEventListener('playing',show,{once:true});v.addEventListener('loadeddata',show,{once:true});
  var tryPlay=function(){var p=v.play();if(p&&p.catch)p.catch(function(){})};
  tryPlay();
  ['touchstart','click','scroll'].forEach(function(e){addEventListener(e,tryPlay,{once:true,passive:true})});
}
startBg();
document.addEventListener('visibilitychange',function(){if(!v.src)return;document.hidden?v.pause():v.play().catch(function(){})});

/* Модалка */
var m=document.getElementById('lead'),f=document.getElementById('lf'),th=m.querySelector('.thanks');
function open(){f.reset();f.querySelectorAll('.bad').forEach(function(i){hint(i,'')});document.getElementById('ferr').hidden=true;f.hidden=false;th.hidden=true;m.hidden=false;setTimeout(function(){f.name.focus()},50)}
function close(){m.hidden=true}
document.querySelectorAll('[data-lead]').forEach(function(b){b.addEventListener('click',open)});
m.addEventListener('click',function(e){if(e.target===m||e.target.closest('[data-close]'))close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!m.hidden)close()});
var ferr=document.getElementById('ferr');
function hint(inp,msg){var l=inp.closest('label'),h=l.querySelector('.fhint');
  if(!msg){inp.classList.remove('bad');inp.removeAttribute('aria-invalid');if(h)h.remove();return true}
  inp.classList.add('bad');inp.setAttribute('aria-invalid','true');if(!h){h=document.createElement('span');h.className='fhint';l.appendChild(h)}h.textContent=msg;return false}
function okContact(s){s=s.trim();
  if(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s))return true;            // e-mail
  if(/^(@|https?:\/\/t\.me\/|t\.me\/)[A-Za-z0-9_]{4,32}$/.test(s))return true; // Telegram
  var d=s.replace(/[\s()+\-.]/g,'');return /^\d{10,13}$/.test(d)&&/^[+\d\s()\-.]+$/.test(s); // телефон
}
function validate(){var ok=true;
  ok=hint(f.name,f.name.value.trim().length<2?'Укажите имя':'')&&ok;
  var c=f.contact.value.trim();ok=hint(f.contact,!c?'Укажите, как с вами связаться':(!okContact(c)?'Телефон (+7…), @username или e-mail':''))&&ok;
  return ok}
['name','contact'].forEach(function(n){f[n].addEventListener('input',function(){if(f[n].classList.contains('bad'))validate()})});
f.addEventListener('submit',function(e){
  e.preventDefault();ferr.hidden=true;
  if(!validate()){(f.querySelector('.bad')||f.name).focus();return}
  var data={name:f.name.value.trim(),contact:f.contact.value.trim(),idea:f.idea.value.trim()};
  /* ===== ОБРАБОТЧИК ФОРМЫ: FormSubmit -> sgshop138@gmail.com ===== */
  data._subject='Новая заявка с сайта Лумина';data._template='table';data._captcha='false';
  var btn=f.querySelector('[type=submit]'),lbl=btn.querySelectorAll('.roll>span');
  function setL(t){if(lbl.length)lbl.forEach(function(s){s.textContent=t});else btn.textContent=t}
  btn.disabled=true;btn.classList.add('loading');setL('Отправляем…');
  fetch('https://formsubmit.co/ajax/sgshop138@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
    .then(function(r){if(!r.ok)throw r;return r.json().catch(function(){return {}})})
    .then(function(j){if(j&&(j.success===false||j.success==='false'))throw j;f.hidden=true;th.hidden=false})
    .catch(function(){ferr.textContent='Не удалось отправить заявку. Попробуйте ещё раз через минуту или напишите нам напрямую.';ferr.hidden=false})
    .then(function(){btn.disabled=false;btn.classList.remove('loading');setL('Отправить')});
});
})();
/* Превью кейсов: грузим и играем только видимые */
(function(){
  var vs=document.querySelectorAll('.cv video');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;
    if(e.isIntersecting){if(!v.src)v.src=v.dataset.src;var p=v.play();if(p&&p.catch)p.catch(function(){})}else if(v.src)v.pause();});},{threshold:.3});
  vs.forEach(function(v){io.observe(v)});
})();
/* Hero h1: «в код и обратно» */
(function(){
  var h=document.querySelector('.hero h1');
  if(!h||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var CH='0123456789ABCDEF<>/{}[]#$%*=+アカサタナハマヤラ';
  var cs=[];
  Array.prototype.slice.call(h.childNodes).forEach(function(n){
    if(n.nodeType!==3)return;
    var f=document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(function(w){
      if(!w)return;
      if(/^\s+$/.test(w)){f.appendChild(document.createTextNode(w));return}
      var ws=document.createElement('span');ws.className='w';
      for(var i=0;i<w.length;i++){var s=document.createElement('span');s.className='c';s.textContent=w[i];ws.appendChild(s);cs.push(s)}
      f.appendChild(ws);
    });
    h.replaceChild(f,n);
  });
  h.setAttribute('aria-label',h.textContent);
  var run=false,N=cs.length,STAG=380/N,DUR=480,TICK=45;
  function go(){
    if(run)return;run=true;var t0=performance.now(),last=0;
    (function f(t){
      var e=t-t0,flick=t-last>TICK,done=true;if(flick)last=t;
      for(var i=0;i<N;i++){var s=cs[i],st=i*STAG;
        if(e<st){done=false;continue}
        if(e<st+DUR){done=false;if(!s.classList.contains('sc')){s.classList.add('sc');s.setAttribute('data-c',CH[Math.random()*CH.length|0])}else if(flick)s.setAttribute('data-c',CH[Math.random()*CH.length|0])}
        else if(s.classList.contains('sc'))s.classList.remove('sc');
      }
      if(done){run=false;return}
      requestAnimationFrame(f);
    })(t0);
  }
  h.addEventListener('mouseenter',go);
  h.addEventListener('click',go);
  if(matchMedia('(hover: none)').matches)setTimeout(go,1000);
  window.__scramble=go;
})();
/* Лайтбокс кейсов: полный ролик со звуком */
(function(){
  var lb=document.getElementById('lb'),v=document.getElementById('lbv'),t=document.getElementById('lbt');
  function open(c){v.src=c.dataset.full;v.poster=c.querySelector('video').poster;t.textContent=c.dataset.title;lb.hidden=false;var p=v.play();if(p&&p.catch)p.catch(function(){})}
  function close(){lb.hidden=true;v.pause();v.removeAttribute('src');v.load()}
  document.querySelectorAll('.case[data-full]').forEach(function(c){
    c.addEventListener('click',function(){open(c)});
    c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(c)}});
  });
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.closest('[data-close]'))close()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!lb.hidden)close()});
})();

/* Микро-взаимодействия: roll-текст на кнопках, курсор, магнит */
(function(){
  document.querySelectorAll('.btn').forEach(function(b){
    var t=b.textContent.trim();if(!t||b.querySelector('.roll'))return;
    b.textContent='';var r=document.createElement('span');r.className='roll';
    r.innerHTML='<span></span><span aria-hidden="true"></span>';r.children[0].textContent=t;r.children[1].textContent=t;b.appendChild(r);
    if(b.classList.contains('btn-arr')){var a=document.createElement('span');a.className='arr';a.setAttribute('aria-hidden','true');a.textContent='→';b.appendChild(a)}
  });
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches,rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!fine||rm)return;
  var dot=document.createElement('div'),ring=document.createElement('div');dot.className='cur-dot';ring.className='cur-ring';ring.innerHTML='<span>смотреть</span>';
  document.body.appendChild(dot);document.body.appendChild(ring);
  var x=-100,y=-100,rx=x,ry=y,on=false;
  addEventListener('mousemove',function(e){x=e.clientX;y=e.clientY;if(!on){on=true;rx=x;ry=y;document.body.classList.add('cur-on');loop()}
    dot.style.transform='translate('+x+'px,'+y+'px)';
    var t=e.target,c=t.closest&&t.closest('.case'),i=t.closest&&t.closest('a,button,[data-lead],.plan,input,textarea,video');
    ring.classList.toggle('view',!!c);ring.classList.toggle('big',!c&&!!i);
    document.body.classList.toggle('cur-hide',!!(t.closest&&t.closest('#lb video')));
  },{passive:true});
  document.addEventListener('mouseleave',function(){document.body.classList.remove('cur-on');on=false});
  function loop(){if(!on)return;rx+=(x-rx)*.2;ry+=(y-ry)*.2;ring.style.transform='translate('+rx+'px,'+ry+'px)';requestAnimationFrame(loop)}
  document.querySelectorAll('[data-magnet]').forEach(function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);b.style.transform='translate('+(dx*.18).toFixed(1)+'px,'+(dy*.3).toFixed(1)+'px)'});
    b.addEventListener('mouseleave',function(){b.style.transform=''});
  });
})();
