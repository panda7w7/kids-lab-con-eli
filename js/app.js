/* Kids Lab con Eli - lógica principal (pantalla de bienvenida, perfil, mapa y ayudante Bit) */
const PERSONAJES = [
  {id:'eli',   nombre:'Eli',   img:'img/eli.png',   frase:'¡Hola! Soy Eli. ¡Equipo, vamos a descubrir cómo funciona! Primero observemos y después lo probamos.'},
  {id:'robin', nombre:'Robin', img:'img/robin.png', frase:'Hola, soy Robin. Eli, creo que podemos entenderlo mejor con un ejemplo. ¿Lo probamos juntos?'},
  {id:'mila',  nombre:'Mila',  img:'img/mila.png',  frase:'¡Hola, soy Mila! Espera, ¿puedes explicarlo otra vez? Me encanta preguntar.'},
  {id:'luno',  nombre:'Luno',  img:'img/luno.png',  frase:'¡Soy Luno! ¡Tengo una idea gigantesca! ¿Y si esto fuera el botón de una nave espacial?'}
];
const $ = s => document.querySelector(s);
const guardar = (k,v) => { try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };
const leer = k => { try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } };

/* ---- Sonidos (sin archivos: se generan con el navegador) ---- */
let ctx;
function tono(freq=600, dur=0.14){
  try{
    ctx = ctx || new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type='triangle'; o.frequency.value=freq; g.gain.value=.15;
    g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+dur);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+dur);
  }catch(e){}
}
document.addEventListener('click', e=>{
  const b = e.target.closest('[data-tone]'); if(b) tono(+b.dataset.tone);
});

/* ---- Voz (voz del navegador, gratis; luego se puede cambiar por audios grabados) ---- */
function hablar(texto){
  if(!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto); u.lang='es-CL'; u.rate=.95; u.pitch=1.15;
  const v = speechSynthesis.getVoices().find(v=>v.lang.startsWith('es')); if(v) u.voice=v;
  speechSynthesis.speak(u);
}

/* ---- Navegación entre pantallas ---- */
function ir(id){
  document.querySelectorAll('.pantalla').forEach(p=>p.classList.remove('activa'));
  $('#'+id).classList.add('activa'); window.scrollTo(0,0);
  if(id==='mapa'){ const j=leer('jugador'); $('#saludo').textContent = `¡Hola, ${j.apodo}! ¿A qué jugamos hoy?`; }
  reiniciarBit();
}

/* ---- Fondo animado: números y símbolos que flotan ---- */
const simbolos=['0','1','1','0','+','★','=','✦','2','3'], colores=['#ffc400','#25c6ff','#ff4fa3','#19d3a2','#c9a0ff'];
for(let i=0;i<16;i++){
  const s=document.createElement('span'); s.className='flota';
  s.textContent=simbolos[i%simbolos.length]; s.style.left=Math.random()*96+'%';
  s.style.fontSize=(24+Math.random()*34)+'px'; s.style.color=colores[i%colores.length];
  s.style.animationDuration=(12+Math.random()*14)+'s'; s.style.animationDelay=(-Math.random()*20)+'s';
  $('#decor').appendChild(s);
}

/* ---- Bienvenida: personajes interactivos ---- */
PERSONAJES.forEach(p=>{
  const b=document.createElement('button'); b.className='personaje'; b.setAttribute('aria-label','Conocer a '+p.nombre);
  b.innerHTML=`<img src="${p.img}" alt="${p.nombre}"><span>${p.nombre}</span>`;
  b.onclick=()=>{
    tono(500+Math.random()*400);
    b.classList.remove('salta'); void b.offsetWidth; b.classList.add('salta');
    const g=$('#globo'); g.textContent=p.frase; g.classList.add('ver'); hablar(p.frase);
  };
  $('#equipo').appendChild(b);
});
const jugador = leer('jugador');
if(jugador) $('#btnEntrar').textContent = `¡Seguir jugando, ${jugador.apodo}!`;
$('#btnEntrar').onclick = ()=> ir(leer('jugador') ? 'mapa' : 'perfil');

/* ---- Perfil: apodo + avatar, sin datos personales ---- */
let elegido = null;
PERSONAJES.forEach(p=>{
  const b=document.createElement('button'); b.className='personaje';
  b.innerHTML=`<img src="${p.img}" alt="${p.nombre}"><span>${p.nombre}</span>`;
  b.onclick=()=>{ document.querySelectorAll('#avatares .personaje').forEach(x=>x.classList.remove('elegido'));
    b.classList.add('elegido'); elegido=p.id; tono(700); };
  $('#avatares').appendChild(b);
});
$('#btnEmpezar').onclick=()=>{
  const apodo=$('#apodo').value.trim();
  if(!apodo||!elegido){ mostrarBit('Escribe tu apodo y elige un amigo para empezar.'); return; }
  guardar('jugador',{apodo,avatar:elegido}); ir('mapa');
};
$('#btnSalir').onclick=()=>{ try{localStorage.removeItem('jugador');}catch(e){} location.reload(); };

/* ---- Mapa: juegos (por ahora avisan que llegan pronto) ---- */
document.querySelectorAll('.juego').forEach(b=>b.onclick=()=>mostrarBit(b.dataset.msg));

/* ---- Bit: ayudante que aparece si el niño no avanza ---- */
let temporizador;
const PISTAS={bienvenida:'¡Toca a tus amigos para conocerlos! Después presiona el botón rosado.',
  perfil:'Escribe tu apodo y toca a tu amigo favorito. ¡Tú puedes!',
  mapa:'Elige un juego del Nivel 1. ¡Te va a encantar!'};
function pantallaActual(){ return document.querySelector('.pantalla.activa').id; }
function mostrarBit(texto){
  const bit=$('#bit'); $('#pista').textContent=texto;
  bit.classList.remove('oculto','aparece'); void bit.offsetWidth; bit.classList.add('aparece');
  tono(880,.2); hablar(texto);
}
function reiniciarBit(){
  clearTimeout(temporizador); $('#bit').classList.add('oculto');
  temporizador=setTimeout(()=>mostrarBit(PISTAS[pantallaActual()]),25000); // 25 segundos sin actividad
}
['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,e=>{ if(!e.target.closest('#bit')) reiniciarBit(); }));
$('#bit').onclick=()=>hablar($('#pista').textContent);
reiniciarBit();
