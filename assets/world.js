(()=>{
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const body=document.body, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduce) body.classList.add('low-power');

const canvas=$('#stars');
if(canvas){
 const ctx=canvas.getContext('2d'); let stars=[];
 function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);stars=Array.from({length:Math.min(180,Math.floor(innerWidth/6))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.3+.2,a:Math.random()*.55+.12,v:Math.random()*.08+.01}))}
 function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const s of stars){ctx.beginPath();ctx.fillStyle=`rgba(210,230,255,${s.a})`;ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();if(!reduce){s.y+=s.v;if(s.y>innerHeight)s.y=0}}requestAnimationFrame(draw)}
 addEventListener('resize',resize);resize();draw();
}
const glow=$('.glow'); if(glow&&!reduce)addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'});

let ac=null,nodes=[],master=null,current='NO MUSIC';
const moodMap={
 'JOGA BONITO':[[110,.035],[164.81,.026],[220,.018]],
 'FINAL BOSS':[[55,.05],[82.41,.032],[146.83,.017]],
 'MATCHDAY':[[73.42,.043],[110,.028],[196,.013]],
 'LOCKED IN':[[65.41,.038],[98,.027],[130.81,.018]],
};
function stopAudio(){nodes.forEach(n=>{try{n.stop()}catch(e){}});nodes=[];if(master){master.disconnect();master=null}current='NO MUSIC';syncSound()}
function startMood(name){
 stopAudio(); if(name==='NO MUSIC')return;
 ac=ac||new (window.AudioContext||window.webkitAudioContext)(); if(ac.state==='suspended')ac.resume();
 master=ac.createGain(); master.gain.value=Number(localStorage.getItem('nts-volume')||.28); master.connect(ac.destination);
 const filter=ac.createBiquadFilter(); filter.type='lowpass';filter.frequency.value=920;filter.Q.value=.8;filter.connect(master);
 (moodMap[name]||moodMap['LOCKED IN']).forEach(([f,g],i)=>{const o=ac.createOscillator(),gain=ac.createGain();o.type=i===0?'sine':'triangle';o.frequency.value=f;gain.gain.value=g;o.connect(gain).connect(filter);o.start();nodes.push(o)});
 current=name;localStorage.setItem('nts-mood',name);syncSound();
}
function syncSound(){
 const txt=$('[data-sound-label]'); if(txt)txt.textContent=current;
 const wrap=$('[data-sound-button]')?.closest('.sound'); if(wrap)wrap.classList.toggle('off',current==='NO MUSIC');
 const sel=$('#moodSelect');if(sel)sel.value=current;
}
$$('[data-sound-button]').forEach(b=>b.addEventListener('click',()=>$('#soundPanel')?.classList.toggle('open')));
$('#moodSelect')?.addEventListener('change',e=>startMood(e.target.value));
$('#volume')?.addEventListener('input',e=>{localStorage.setItem('nts-volume',e.target.value);if(master)master.gain.value=Number(e.target.value)});
$('#power')?.addEventListener('change',e=>body.classList.toggle('low-power',e.target.checked));
const saved=localStorage.getItem('nts-mood'); if(saved&&saved!=='NO MUSIC') current='NO MUSIC'; syncSound();

const intro=$('#intro');
if(intro){
 const seen=localStorage.getItem('nts-intro-seen')==='1';
 if(seen) intro.classList.add('hide');
 else{
  const lines=['ANALYSING YOUR LAST 20 LOSSES…','PROBLEM FOUND.','YOU.','WELCOME TO NOT THE SCRIPT.'];
  const line=$('#introLine'),bar=$('#introBar');let i=0;
  const next=()=>{if(i>=lines.length){setTimeout(()=>{intro.classList.add('hide');localStorage.setItem('nts-intro-seen','1')},900);return}
    line.textContent=lines[i];bar.style.width=((i+1)/lines.length*100)+'%';i++;setTimeout(next,i===3?1000:1250)};
  setTimeout(next,450);
 }
 $('#skipIntro')?.addEventListener('click',()=>{intro.classList.add('hide');localStorage.setItem('nts-intro-seen','1')});
}
$$('[data-enter-sound]').forEach(b=>b.addEventListener('click',()=>{if(current==='NO MUSIC')startMood(localStorage.getItem('nts-mood')==='NO MUSIC'?'LOCKED IN':(localStorage.getItem('nts-mood')||'LOCKED IN'))}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#soundPanel')?.classList.remove('open')});
})();
