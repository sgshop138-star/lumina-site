(function(){
'use strict';
var D=document,W=window,RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
function $(s,c){return (c||D).querySelector(s)}function $$(s,c){return Array.prototype.slice.call((c||D).querySelectorAll(s))}
var y=$('#yr');if(y)y.textContent=new Date().getFullYear();

/* ===== Фоновое видео: постер сразу, видео — после загрузки (на мобильных ещё позже) ===== */
var v=$('#bgv');
function startBg(){
  if(!v||v.src)return;
  var mob=innerWidth<768;
  v.muted=true;v.setAttribute('muted','');v.autoplay=true;
  v.src=(mob||innerWidth*devicePixelRatio<1300)?'media/bg-720.mp4?v=16':'media/bg-1080.mp4?v=16';
  var show=function(){v.classList.add('on')};
  v.addEventListener('playing',show,{once:true});
  var p=v.play();if(p&&p.catch)p.catch(function(){});
}
function schedBg(){
  if(RM||(navigator.connection&&navigator.connection.saveData))return;
  var delay=innerWidth<768?2500:300;
  setTimeout(function(){('requestIdleCallback' in W)?requestIdleCallback(startBg,{timeout:2000}):startBg()},delay);
  ['touchstart','scroll','click'].forEach(function(e){addEventListener(e,function(){startBg();if(v.src&&v.paused)v.play().catch(function(){})},{once:true,passive:true})});
}
if(D.readyState==='complete')schedBg();else addEventListener('load',schedBg);
if(v&&'IntersectionObserver' in W)new IntersectionObserver(function(e){if(!v.src)return;e[0].isIntersecting?v.play().catch(function(){}):v.pause()}).observe(v);
D.addEventListener('visibilitychange',function(){if(!v||!v.src)return;D.hidden?v.pause():v.play().catch(function(){})});

/* ===== Шапка, прогресс скролла, активный пункт меню ===== */
var hd=$('#hd'),pr=$('#prog'),tick=false;
function onScroll(){tick=false;var s=scrollY,h=D.documentElement.scrollHeight-innerHeight;
  hd.classList.toggle('s',s>30);pr.style.transform='scaleX('+(h>0?Math.min(1,s/h):0)+')'}
addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();
var links=$$('.nav a');
if('IntersectionObserver' in W){
  var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id)})})},{rootMargin:'-45% 0px -50% 0px'});
  $$('main section[id]').forEach(function(s){so.observe(s)});
}

/* ===== Появление блоков ===== */
var rv=$$('.rv');
if(!RM&&'IntersectionObserver' in W){
  var ro=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
  rv.forEach(function(el){var sib=el.parentNode?Array.prototype.indexOf.call(el.parentNode.children,el):0;el.style.transitionDelay=Math.min(sib,5)*70+'ms';ro.observe(el)});
}else rv.forEach(function(el){el.classList.add('in')});

/* ===== Кнопки: roll-текст ===== */
$$('.btn').forEach(function(b){
  var t=b.textContent.trim();if(!t||b.querySelector('.roll'))return;
  b.textContent='';var r=D.createElement('span');r.className='roll';
  r.innerHTML='<span></span><span aria-hidden="true"></span>';r.children[0].textContent=t;r.children[1].textContent=t;b.appendChild(r);
  if(b.classList.contains('btn-arr')){var a=D.createElement('span');a.className='arr';a.setAttribute('aria-hidden','true');a.textContent='→';b.appendChild(a)}
});

/* ===== Модалка заявки ===== */
var m=$('#lead'),lastF=null;
function openLead(){var f=$('form',m);resetForm(f);m.hidden=false;D.body.style.overflow='hidden';setTimeout(function(){f.name.focus()},50)}
function closeLead(){m.hidden=true;D.body.style.overflow=''}
$$('[data-lead]').forEach(function(b){b.addEventListener('click',openLead)});
m.addEventListener('click',function(e){if(e.target===m||e.target.closest('[data-close]'))closeLead()});

/* ===== Формы: валидация + FormSubmit ===== */
function hint(inp,msg){var l=inp.closest('label'),h=$('.fhint',l);
  if(!msg){inp.classList.remove('bad');inp.removeAttribute('aria-invalid');if(h)h.remove();return true}
  inp.classList.add('bad');inp.setAttribute('aria-invalid','true');if(!h){h=D.createElement('span');h.className='fhint';l.appendChild(h)}h.textContent=msg;return false}
function okContact(s){s=s.trim();
  if(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s))return true;
  if(/^(@|https?:\/\/t\.me\/|t\.me\/)[A-Za-z0-9_]{4,32}$/.test(s))return true;
  var d=s.replace(/[\s()+\-.]/g,'');return /^\d{10,13}$/.test(d)&&/^[+\d\s()\-.]+$/.test(s)}
function validate(f){var ok=hint(f.name,f.name.value.trim().length<2?'Укажите имя':'');
  var c=f.contact.value.trim();ok=hint(f.contact,!c?'Укажите, как с вами связаться':(!okContact(c)?'Телефон (+7…), @username или e-mail':''))&&ok;return ok}
function resetForm(f){f.reset();$$('.bad',f).forEach(function(i){hint(i,'')});$('.ferr',f).hidden=true;f.hidden=false;var th=f.parentNode.querySelector('.thanks');if(th)th.hidden=true}
$$('form[data-form]').forEach(function(f){
  var ferr=$('.ferr',f),th=f.parentNode.querySelector('.thanks');
  ['name','contact'].forEach(function(n){f[n].addEventListener('input',function(){if(f[n].classList.contains('bad'))validate(f)})});
  f.addEventListener('submit',function(e){
    e.preventDefault();ferr.hidden=true;
    if(!validate(f)){($('.bad',f)||f.name).focus();return}
    var data={name:f.name.value.trim(),contact:f.contact.value.trim(),idea:f.idea.value.trim(),form:f.id==='lf'?'модалка':'блок контактов'};
    /* ===== ОБРАБОТЧИК ФОРМЫ: FormSubmit -> sgshop138@gmail.com ===== */
    data._subject='Новая заявка с сайта Лумина';data._template='table';data._captcha='false';
    var btn=$('[type=submit]',f),lbl=$$('.roll>span',btn),txt=lbl.length?lbl[0].textContent:btn.textContent;
    function setL(t){if(lbl.length)lbl.forEach(function(s){s.textContent=t});else btn.textContent=t}
    btn.disabled=true;btn.classList.add('loading');setL('Отправляем…');
    fetch('https://formsubmit.co/ajax/sgshop138@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
      .then(function(r){if(!r.ok)throw r;return r.json().catch(function(){return {}})})
      .then(function(j){if(j&&(j.success===false||j.success==='false'))throw j;f.hidden=true;if(th)th.hidden=false})
      .catch(function(){ferr.textContent='Не удалось отправить заявку. Попробуйте ещё раз через минуту или напишите нам в мессенджер.';ferr.hidden=false})
      .then(function(){btn.disabled=false;btn.classList.remove('loading');setL(txt)});
  });
});

/* ===== Кейсы: превью только видимые + лайтбокс ===== */
var cvs=$$('.cv video');
if(!RM&&'IntersectionObserver' in W){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){var x=e.target;
    if(e.isIntersecting){if(!x.src)x.src=x.dataset.src;var p=x.play();if(p&&p.catch)p.catch(function(){})}else if(x.src)x.pause()})},{threshold:.35});
  cvs.forEach(function(x){io.observe(x)});
}
var lb=$('#lb'),lv=$('#lbv'),lt=$('#lbt');
function openLb(c){lv.src=c.dataset.full;lv.poster=$('video',c).poster;lt.textContent=c.dataset.title;lb.hidden=false;D.body.style.overflow='hidden';var p=lv.play();if(p&&p.catch)p.catch(function(){})}
function closeLb(){lb.hidden=true;D.body.style.overflow='';lv.pause();lv.removeAttribute('src');lv.load()}
$$('.case[data-full]').forEach(function(c){
  c.addEventListener('click',function(){openLb(c)});
  c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openLb(c)}});
});
lb.addEventListener('click',function(e){if(e.target===lb||e.target.closest('[data-close]'))closeLb()});
D.addEventListener('keydown',function(e){if(e.key!=='Escape')return;if(!lb.hidden)closeLb();else if(!m.hidden)closeLead()});

/* ===== Hero h1: «в код и обратно» ===== */
(function(){
  var h=$('.hero h1');if(!h||RM)return;
  var CH='0123456789ABCDEF<>/{}[]#$%*=+アカサタナハマヤラ',cs=[];
  Array.prototype.slice.call(h.childNodes).forEach(function(n){
    if(n.nodeType!==3)return;var fr=D.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(function(w){if(!w)return;
      if(/^\s+$/.test(w)){fr.appendChild(D.createTextNode(w));return}
      var ws=D.createElement('span');ws.className='w';
      for(var i=0;i<w.length;i++){var s=D.createElement('span');s.className='c';s.textContent=w[i];ws.appendChild(s);cs.push(s)}
      fr.appendChild(ws)});
    h.replaceChild(fr,n)});
  h.setAttribute('aria-label','Зажжём ваш бренд');
  var run=false,N=cs.length,ST=380/N,DU=480,TK=45;
  function rnd(){return CH[Math.random()*CH.length|0]}
  function go(){if(run)return;run=true;var t0=performance.now(),last=0;
    (function f(t){var e=t-t0,fl=t-last>TK,done=true;if(fl)last=t;
      for(var i=0;i<N;i++){var s=cs[i],st=i*ST;if(e<st){done=false;continue}
        if(e<st+DU){done=false;if(!s.classList.contains('sc')){s.classList.add('sc');s.setAttribute('data-c',rnd())}else if(fl)s.setAttribute('data-c',rnd())}
        else if(s.classList.contains('sc'))s.classList.remove('sc')}
      if(done){run=false;return}requestAnimationFrame(f)})(t0)}
  h.addEventListener('mouseenter',go);h.addEventListener('click',go);
  if(!FINE)setTimeout(go,1200);
})();

/* ===== Курсор и магнит (только мышь) ===== */
if(FINE&&!RM){
  var dot=D.createElement('div'),ring=D.createElement('div');dot.className='cur-dot';ring.className='cur-ring';ring.innerHTML='<span>смотреть</span>';
  D.body.appendChild(dot);D.body.appendChild(ring);
  var cx=-100,cy=-100,rx=cx,ry=cy,on=false;
  addEventListener('mousemove',function(e){cx=e.clientX;cy=e.clientY;if(!on){on=true;rx=cx;ry=cy;D.body.classList.add('cur-on');loop()}
    dot.style.transform='translate('+cx+'px,'+cy+'px)';
    var t=e.target,c=t.closest&&t.closest('.case'),i=t.closest&&t.closest('a,button,summary,.sv,input,textarea');
    ring.classList.toggle('view',!!c);ring.classList.toggle('big',!c&&!!i);
    D.body.classList.toggle('cur-hide',!!(t.closest&&t.closest('#lb video')))},{passive:true});
  D.addEventListener('mouseleave',function(){D.body.classList.remove('cur-on');on=false});
  function loop(){if(!on)return;rx+=(cx-rx)*.2;ry+=(cy-ry)*.2;ring.style.transform='translate('+rx+'px,'+ry+'px)';requestAnimationFrame(loop)}
  $$('[data-magnet]').forEach(function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.3).toFixed(1)+'px)'});
    b.addEventListener('mouseleave',function(){b.style.transform=''})});
}
})();
