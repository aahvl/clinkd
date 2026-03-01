const $ = id => document.getElementById(id)
const el = (t,c) => { const e = document.createElement(t); if(c) e.className=c; return e }
const rnd = (a,b) => Math.random()*(b-a)+a
const fmt = n => Math.round(n).toLocaleString()
const now = () => Date.now()

let score=0, ate=0, baseMult=1, rbBonus=1, rebirths=0
let caught=0, missed=0, combo=0, bestCombo=0
let crits=0, mcrits=0, goldenC=0, ghostC=0, shieldU=0, blingHits=0
let critPts=0, bestClick=0, shieldLeft=0
let critChance=0, megaCritChance=0, critPow=1
let comboBonus=0, passiveInc=0, streakMult=0
let frozen=false, magnet=false, goldenHour=false, frenzy=false, luckyTemp=0, dblActive=false, sugarRush=false
let chainClick=false, ghostCans=false, blingMode=false, marketVal=0
let spawnT, autoT, passT, streakT, lastMiss=0, comboReset, t0=now()
const boosts=[], parts=[]
const B = {}
const gb = k => B[k]||0
const cfg = { sfx:true, music:false, musicVol:35, particles:true, scanlines:true, spark:true, floattext:true, spd:1100 }

const PALS = {
  r:    { body:'#e84040', dk:'#a01818', lt:'#ff7070', top:'#bbb', tab:'#888', wave:'rgba(255,255,255,.2)',  txt:'CLNK', tx2:'CLICK', ring:'#eee' },
  o:    { body:'#f07820', dk:'#a04010', lt:'#ffa060', top:'#ccc', tab:'#999', wave:'rgba(255,200,0,.25)',   txt:'HYPR', tx2:'CAN',   ring:'#ffe' },
  y:    { body:'#d4a800', dk:'#8a6800', lt:'#ffd840', top:'#ddd', tab:'#aaa', wave:'rgba(255,255,100,.3)',  txt:'MEGA', tx2:'DOSE',  ring:'#ffd700' },
  b:    { body:'#2060d0', dk:'#0e3880', lt:'#5090ff', top:'#9ac', tab:'#57a', wave:'rgba(100,200,255,.3)',  txt:'ULTR', tx2:'SRGE',  ring:'#adf' },
  v:    { body:'#8020c0', dk:'#500080', lt:'#b060f0', top:'#c9f', tab:'#97c', wave:'rgba(200,100,255,.3)',  txt:'COSM', tx2:'CAN',   ring:'#d8f' },
  gd:   { body:'#d4900a', dk:'#8a5800', lt:'#ffcc30', top:'#ffd700', tab:'#b8860b', wave:'rgba(255,255,100,.4)', txt:'GOLD', tx2:'!!!!', ring:'#ffe' },
  gh:   { body:'#6080a0', dk:'#304060', lt:'#90b0d0', top:'#c0d0e0', tab:'#8090a0', wave:'rgba(180,220,255,.2)', txt:'????', tx2:'~~~~', ring:'#cde' },
  rn:   { body:'#ff4488', dk:'#aa1055', lt:'#ff88bb', top:'#ffa0c0', tab:'#e06', wave:'rgba(255,150,200,.4)', txt:'RNBW', tx2:'OVER', ring:'#fbd' },
  // boost skins
  rbull:{ body:'#1a3a8a', dk:'#0a1a50', lt:'#3060c0', top:'#c0c8d8', tab:'#8090b0', wave:'rgba(180,200,255,.3)', txt:'BULL', tx2:'x2', ring:'#dde8ff' },
  cbrew:{ body:'#3a1a08', dk:'#1a0800', lt:'#6a3010', top:'#7a5030', tab:'#5a3818', wave:'rgba(120,70,20,.4)', txt:'BREW', tx2:'x5',  ring:'#d4a060' },
  mnstr:{ body:'#1a2a10', dk:'#0a1208', lt:'#2a4a1a', top:'#3a5020', tab:'#284018', wave:'rgba(80,200,40,.35)', txt:'MNST', tx2:'x10', ring:'#80e040' },
  ovdv: { body:'#c06000', dk:'#803800', lt:'#f09020', top:'#d07800', tab:'#a05000', wave:'rgba(255,160,0,.35)', txt:'OVRC', tx2:'x3',  ring:'#ffd080' },
}

function drawCan(cv, w, h, k) {
  const p=PALS[k]||PALS.r, ctx=cv.getContext('2d')
  ctx.clearRect(0,0,w,h)
  const s=Math.floor(w/7), bx=s, by=Math.floor(s*1.2), bw=w-s*2, bh=h-Math.floor(s*2.4)
  const rr=(x,y,w,h,r)=>{
    if(w<1||h<1) return; r=Math.min(r,w/2,h/2)
    ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r)
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h)
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r)
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath()
  }

  const g=ctx.createLinearGradient(bx,by,bx+bw,by)
  g.addColorStop(0,p.dk); g.addColorStop(.3,p.lt); g.addColorStop(.7,p.body); g.addColorStop(1,p.dk)
  ctx.fillStyle=g; rr(bx,by,bw,bh,s); ctx.fill()
  ctx.fillStyle=p.wave; ctx.fillRect(bx,by+bh*.4,bw,bh*.22)
  ctx.fillStyle=p.top; rr(bx+s,by-Math.floor(s*.6),bw-s*2,Math.floor(s*.9),s/2); ctx.fill()
  rr(bx+s,by+bh-Math.floor(s*.3),bw-s*2,Math.floor(s*.8),s/2); ctx.fill()
  ctx.fillStyle=p.tab
  ctx.fillRect(bx+Math.floor(bw/2)-s/2,by-s,Math.floor(s*1.2),Math.floor(s*.5))
  ctx.fillRect(bx+Math.floor(bw/2)-s/4,by-Math.floor(s*1.2),s/2,Math.floor(s*.9))
  ctx.fillStyle=p.ring; ctx.textAlign='center'; ctx.textBaseline='middle'
  ctx.font=`bold ${Math.floor(s*1.1)}px monospace`; ctx.fillText(p.txt,bx+bw/2,by+bh*.36)
  ctx.font=`bold ${Math.floor(s*.8)}px monospace`; ctx.fillText(p.tx2,bx+bw/2,by+bh*.57)
  const sh=ctx.createLinearGradient(bx,by,bx,by+bh*.5)
  sh.addColorStop(0,'rgba(255,255,255,.3)'); sh.addColorStop(1,'rgba(255,255,255,0)')
  ctx.fillStyle=sh; rr(bx+2,by+2,bw-4,bh*.46,s-2); ctx.fill()
  ctx.fillStyle='rgba(255,255,255,.14)'; ctx.fillRect(bx+Math.floor(bw*.68),by+s,Math.floor(s*.44),bh-s*2)
}

let actx, mgain, mplay=false, mseq
const getCtx = () => actx||(actx=new(window.AudioContext||window.webkitAudioContext)())

function beep(t) {
  if(!cfg.sfx) return
  try {
    const c=getCtx(), n=c.currentTime
    const mk=(f,type,d,v=.1)=>{ const o=c.createOscillator(),g=c.createGain(); o.connect(g); g.connect(c.destination); o.type=type; o.frequency.value=f; g.gain.setValueAtTime(v,n); g.gain.exponentialRampToValueAtTime(.001,n+d); o.start(n); o.stop(n+d) }
    if(t==='click')   mk(650,'square',.08)
    if(t==='crit')    { mk(1000,'sawtooth',.1,.18); mk(2000,'sine',.07,.1) }
    if(t==='mega')    [880,1320,1760,2640].forEach((f,i)=>setTimeout(()=>mk(f,'sine',.22,.1),i*45))
    if(t==='miss')    mk(160,'sawtooth',.13,.08)
    if(t==='buy')     { mk(440,'sine',.07); setTimeout(()=>mk(600,'sine',.1),70) }
    if(t==='golden')  [880,1108,1320,1760].forEach((f,i)=>setTimeout(()=>mk(f,'sine',.3,.1),i*55))
    if(t==='ghost')   mk(280,'triangle',.28,.07)
    if(t==='rebirth') [220,330,440,660,880].forEach((f,i)=>setTimeout(()=>mk(f,'sawtooth',1.2,.07),i*60))
    if(t==='freeze')  { mk(180,'sine',.5,.07); mk(360,'sine',.4,.05) }
    if(t==='combo')   mk(280+Math.min(combo,22)*38,'triangle',.07,.06)
    if(t==='shield')  mk(550,'sine',.12,.07)
    if(t==='boom')    [200,300,400].forEach((f,i)=>setTimeout(()=>mk(f,'sawtooth',.15,.12),i*40))
    if(t==='rain')    [600,500,400,300].forEach((f,i)=>setTimeout(()=>mk(f,'sine',.12,.1),i*60))
    if(t==='bling')   { mk(1200,'sine',.1,.15); mk(1800,'sine',.08,.12) }
  } catch(e){}
}

function startMusic() {
  if(mplay) return
  try {
    const c=getCtx(); mgain=c.createGain(); mgain.gain.value=cfg.musicVol/500; mgain.connect(c.destination)
    const notes=[261.6,293.7,329.6,392,440,523.3,392,329.6]; let step=0; mplay=true
    function tick() {
      if(!mplay) return
      const c2=getCtx(), n=c2.currentTime, o=c2.createOscillator(), g=c2.createGain()
      o.connect(g); g.connect(mgain); o.type='square'; o.frequency.value=notes[step%notes.length]/2
      g.gain.setValueAtTime(.35,n); g.gain.exponentialRampToValueAtTime(.001,n+.16); o.start(n); o.stop(n+.18)
      if(step%2===0) {
        const buf=c2.createBuffer(1,c2.sampleRate*.04,c2.sampleRate), d=buf.getChannelData(0)
        for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*.5
        const s=c2.createBufferSource(), hg=c2.createGain()
        s.buffer=buf; s.connect(hg); hg.connect(mgain)
        hg.gain.setValueAtTime(.45,n); hg.gain.exponentialRampToValueAtTime(.001,n+.035); s.start(n)
      }
      step++; mseq=setTimeout(tick,60000/155)
    }
    tick()
  } catch(e){}
}
function stopMusic() { mplay=false; clearTimeout(mseq); if(mgain){try{mgain.disconnect()}catch(e){} mgain=null} }
function setVol(v) { cfg.musicVol=+v; if(mgain) mgain.gain.value=v/500 }
function toggleMusic(on) { cfg.music=on; on?startMusic():stopMusic() }
function toggleScan(on) { $('scanlines').style.display=on?'':'none' }
function toggleTheme(dark) { document.body.dataset.theme=dark?'dark':'light' }
const fxcv=$('fx'), fxc=fxcv.getContext('2d')
const resizeFx=()=>{ const g=$('game'); fxcv.width=g.clientWidth; fxcv.height=g.clientHeight }

function burst(x,y,col='#00b4d8',n=8,big=false) {
  if(!cfg.particles) return
  for(let i=0;i<n;i++) {
    const a=rnd(0,Math.PI*2), sp=rnd(1.2,big?7:4)
    parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-rnd(.5,2.5),life:1,d:rnd(.022,.05),r:rnd(2,big?8:5),c:col})
  }
}

function tickParts() {
  fxc.clearRect(0,0,fxcv.width,fxcv.height)
  for(let i=parts.length-1;i>=0;i--) {
    const p=parts[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=.13; p.life-=p.d
    if(p.life<=0){parts.splice(i,1);continue}
    fxc.globalAlpha=p.life; fxc.fillStyle=p.c
    fxc.beginPath(); fxc.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); fxc.fill()
  }
  fxc.globalAlpha=1
}

function float(x,y,txt,cls='') {
  if(!cfg.floattext) return
  const d=el('div','ft '+cls)
  d.textContent=txt; d.style.left=(x-24)+'px'; d.style.top=(y-8)+'px'
  $('game').appendChild(d); setTimeout(()=>d.remove(),1000)
}

let canCount=0
function respawn() {
  clearInterval(spawnT)
  const iv=magnet?cfg.spd/2:cfg.spd
  spawnT=setInterval(()=>{ const n=gb('ts')?3:1; for(let i=0;i<n;i++) spawnCan() },iv)
}

function spawnCan(force) {
  const g=$('game'), gr=g.getBoundingClientRect()
  const sz=gb('bc')?90:65, cw=Math.round(sz*.6), ch=sz
  const x=rnd(14,gr.width-cw-14), y=rnd(14,gr.height-ch-14)
  const life=gb('sd')?3800*2:3800
  canCount++
  const isGold  = force==='gd'||goldenHour||(!force&&Math.random()<.013)
  const isGhost = !isGold&&ghostCans&&Math.random()<.08
  const isBling = !isGold&&!isGhost&&blingMode&&canCount%10===0

  const wrap=el('div','can')
  if(isGhost) wrap.classList.add('ghost-can')
  if(isGold)  wrap.classList.add('golden-can')
  if(isBling) wrap.classList.add('bling-can')
  wrap.style.left=x+'px'; wrap.style.top=y+'px'

  const cv=el('canvas'); cv.width=cw; cv.height=ch
  const skin=isGold?'gd':isGhost?'gh':isBling?'rn':(activeCanStyle()||'r')
  drawCan(cv,cw,ch,skin)
  wrap.appendChild(cv)
  if(frozen&&!isGold) wrap.classList.add('iced')

  wrap.onclick=e=>{
    e.stopPropagation()
    if(wrap.dataset.done) return
    wrap.dataset.done=1; clearTimeout(+wrap.dataset.et); wrap.classList.add('dead')

    const bm=boosts.reduce((a,b)=>now()<b.until?a*b.mult:a,1)
    const isCrit=critChance>0&&Math.random()<(critChance+(luckyTemp||0))
    const isMega=megaCritChance>0&&Math.random()<megaCritChance
    const cMult=isMega?50:isCrit?(5*(critPow===2?2:1)):1
    const coBon=combo>2?1+(combo*comboBonus):1
    const mktBon=1+Math.floor(caught/100)*marketVal
    let pts=Math.round(baseMult*rbBonus*bm*(frenzy?3:1)*(dblActive?2:1)*(1+streakMult)*cMult*coBon*mktBon*(isGold?50:1)*(isGhost?10:1)*(isBling?20:1))

    score+=pts; ate+=pts; caught++
    combo++; if(combo>bestCombo) bestCombo=combo
    clearTimeout(comboReset)
    comboReset=setTimeout(()=>{combo=0;updCombo()},sugarRush?4500:1500)

    if(isMega){mcrits++;critPts+=pts;beep('mega')}
    else if(isCrit){crits++;critPts+=pts;beep('crit')}
    else if(isGold){beep('golden')}
    else if(isGhost){beep('ghost')}
    else if(isBling){blingHits++;beep('bling')}
    else beep('click')
    if(combo>1) beep('combo')
    if(isGold) goldenC++
    if(isGhost) ghostC++
    if(pts>bestClick) bestClick=pts
    if(gb('crchain')&&(isCrit||isMega)) setTimeout(spawnCan,100)

    const col=isGold?'#f59e0b':isMega?'#a78bfa':isCrit?'#ff6eb4':isBling?'#c084fc':'#00b4d8'
    burst(x+cw/2,y+ch/2,col,isMega?24:isCrit?13:8,isMega||isBling)

    const lbl=isMega?'💥MEGA! +':isCrit?'💥CRIT! +':isGold?'⭐+':isGhost?'👻+':isBling?'💎+':'+'
    float(x+cw/2,y,lbl+fmt(pts),isMega?'mega':isCrit?'crit':isGold?'gold':isGhost?'ghost':isBling?'bling':'')

    if(chainClick) {
      ;[...document.querySelectorAll('.can:not(.dead):not([data-done])')].filter(c=>{
        return Math.abs(parseFloat(c.style.left)-x)<85&&Math.abs(parseFloat(c.style.top)-y)<85&&c!==wrap
      }).forEach(c=>setTimeout(()=>c.click(),60))
    }

    const se=$('s'); se.classList.remove('pop'); void se.offsetWidth; se.classList.add('pop')
    updCombo(); ui()
    setTimeout(()=>wrap.remove(),220)
  }

  const et=setTimeout(()=>{
    if(!wrap.dataset.done){
      if(shieldLeft>0){shieldLeft--;shieldU++;beep('shield');updBoosts()}
      else{missed++;lastMiss=now();combo=0;updCombo();flashMiss();float(x+cw/2,y,'miss','miss');beep('miss')}
      ui()
    }
    wrap.remove()
  },life)

  wrap.dataset.et=et; g.appendChild(wrap)
}

function flashMiss() {
  let f=$('flash-overlay')
  if(!f){f=el('div');f.id='flash-overlay';document.body.appendChild(f)}
  f.classList.add('on'); setTimeout(()=>f.classList.remove('on'),180)
  $('game').classList.add('shaking'); setTimeout(()=>$('game').classList.remove('shaking'),250)
}

function doFreeze(d) {
  frozen=true; beep('freeze')
  document.querySelectorAll('.can:not(.golden-can)').forEach(c=>{c.classList.add('iced');clearTimeout(+c.dataset.et)})
  setTimeout(()=>{
    frozen=false
    document.querySelectorAll('.can.iced').forEach(c=>{
      c.classList.remove('iced')
      c.dataset.et=setTimeout(()=>{if(!c.dataset.done){missed++;ui();flashMiss()}c.remove()},2200)
    })
    ui()
  },d)
}

function addBoost(m,d,cls,lbl,style='') { boosts.push({mult:m,until:now()+d,cls,lbl,style}); updBoosts() }
function activeCanStyle() { const t=now(); for(let i=boosts.length-1;i>=0;i--) if(boosts[i].style&&boosts[i].until>t) return boosts[i].style; return null }

function updBoosts() {
  const t=now(); for(let i=boosts.length-1;i>=0;i--) if(boosts[i].until<=t) boosts.splice(i,1)
  const bar=$('boosts'); bar.innerHTML=''
  boosts.forEach(b=>{const p=el('div','bpill '+b.cls);p.textContent=`${b.lbl} ${Math.ceil((b.until-t)/1000)}s`;bar.appendChild(p)})
  if(frozen){const p=el('div','bpill freeze');p.textContent='❄️ frozen';bar.appendChild(p)}
  if(magnet){const p=el('div','bpill o');p.textContent='🧲 magnet';bar.appendChild(p)}
  if(goldenHour){const p=el('div','bpill y');p.textContent='⭐ golden hour';bar.appendChild(p)}
  if(frenzy){const p=el('div','bpill p');p.textContent='🌀 frenzy';bar.appendChild(p)}
  if(dblActive){const p=el('div','bpill');p.textContent='✌️ double time';bar.appendChild(p)}
  if(sugarRush){const p=el('div','bpill g');p.textContent='💨 sugar rush';bar.appendChild(p)}
  if(shieldLeft>0){const p=el('div','bpill b');p.textContent=`🛡️ shield ×${shieldLeft}`;bar.appendChild(p)}
  if(streakMult>0){const p=el('div','bpill g');p.textContent=`🏆 streak ×${(1+streakMult).toFixed(1)}`;bar.appendChild(p)}
}

const DEFS = {
  rb:    {cost:80,   max:Infinity,sc:1,  do:()=>addBoost(2,20000,'','x2 🥤','rbull')},
  cf:    {cost:200,  max:Infinity,sc:1,  do:()=>addBoost(5,30000,'b','x5 ☕','cbrew')},
  mn:    {cost:500,  max:Infinity,sc:1,  do:()=>addBoost(10,15000,'g','x10 ⚡','mnstr')},
  ov:    {cost:350,  max:Infinity,sc:1,  do:()=>addBoost(3,60000,'b','x3 🔋','ovdv')},
  pl:    {cost:2000, max:Infinity,sc:1,  req:()=>rebirths>=1, do:()=>addBoost(25,10000,'p','x25 🟢')},
  gd:    {cost:25000,max:Infinity,sc:1,  req:()=>rebirths>=5, do:()=>addBoost(100,8000,'p','x100 ☀️')},
  fr:    {cost:300,  max:Infinity,sc:1,  do:()=>doFreeze(8000)},
  mfr:   {cost:2500, max:Infinity,sc:1,  req:()=>rebirths>=2, do:()=>doFreeze(25000)},
  mg:    {cost:150,  max:Infinity,sc:1,  do:()=>{magnet=true;respawn();setTimeout(()=>{magnet=false;respawn();ui()},20000)}},
  sh:    {cost:600,  max:Infinity,sc:1.5,do:()=>{shieldLeft+=15}},
  boom:  {cost:800,  max:Infinity,sc:1,  do:()=>{beep('boom');[...document.querySelectorAll('.can:not([data-done])')].forEach((c,i)=>setTimeout(()=>c.click(),i*30))}},
  gh:    {cost:1500, max:Infinity,sc:1,  do:()=>{goldenHour=true;updBoosts();setTimeout(()=>{goldenHour=false;ui()},20000)}},
  fz:    {cost:400,  max:Infinity,sc:1,  do:()=>{frenzy=true;updBoosts();setTimeout(()=>{frenzy=false;ui()},12000)}},
  lk:    {cost:1200, max:Infinity,sc:1,  do:()=>{luckyTemp+=.15;setTimeout(()=>{luckyTemp=Math.max(0,luckyTemp-.15)},30000)}},
  dbl:   {cost:900,  max:Infinity,sc:1,  do:()=>{dblActive=true;updBoosts();setTimeout(()=>{dblActive=false;ui()},45000)}},
  rush:  {cost:700,  max:Infinity,sc:1,  do:()=>{sugarRush=true;updBoosts();setTimeout(()=>{sugarRush=false;ui()},20000)}},
  rain:  {cost:1800, max:Infinity,sc:1,  do:()=>{beep('rain');for(let i=0;i<20;i++) setTimeout(spawnCan,i*80)}},
  d1:    {cost:50,   max:5, sc:1.6, do:()=>baseMult+=2},
  d5:    {cost:250,  max:3, sc:1.8, do:()=>baseMult+=5},
  d15:   {cost:1000, max:1, sc:1,   do:()=>baseMult+=15},
  d30:   {cost:5000, max:1, sc:1,   do:()=>baseMult+=30},
  d100:  {cost:50000,max:1, sc:1,   req:()=>rebirths>=5,  do:()=>baseMult+=100},
  d500:  {cost:500000,max:1,sc:1,   req:()=>rebirths>=10, do:()=>baseMult+=500},
  cr:    {cost:300,  max:5, sc:2,   do:()=>{critChance=Math.min(1,critChance+.1)}},
  crp:   {cost:2000, max:1, sc:1,   do:()=>critPow=2},
  mcc:   {cost:1500, max:3, sc:2.5, do:()=>{megaCritChance=Math.min(.5,megaCritChance+.05)}},
  crchain:{cost:4000,max:1, sc:1,   do:()=>{}},
  bc:    {cost:400,  max:1, sc:1,   do:()=>{}},
  sd:    {cost:350,  max:1, sc:1,   do:()=>{}},
  ac:    {cost:800,  max:1, sc:1,   do:()=>{autoT=setInterval(()=>{const c=[...document.querySelectorAll('.can:not([data-done])')];if(c.length)c[0|rnd(0,c.length)].click()},3000)}},
  ts:    {cost:1200, max:1, sc:1,   do:()=>respawn()},
  cb:    {cost:500,  max:3, sc:2.2, do:()=>{comboBonus+=.08}},
  pp:    {cost:750,  max:10,sc:1.8, do:()=>{passiveInc+=5}},
  ch:    {cost:3000, max:1, sc:1,   do:()=>chainClick=true},
  gs:    {cost:5000, max:1, sc:1,   do:()=>ghostCans=true},
  bling: {cost:6000, max:1, sc:1,   do:()=>blingMode=true},
  clickval:{cost:2500,max:5,sc:2,  do:()=>{marketVal+=.01}},
  streak:{cost:3500, max:5, sc:2,   do:()=>{
    clearInterval(streakT)
    streakT=setInterval(()=>{
      if(now()-lastMiss>10000&&combo>0) streakMult=Math.min(gb('streak')*.5,streakMult+.1)
      else if(now()-lastMiss<2000) streakMult=Math.max(0,streakMult-.2)
    },1000)
  }},
}

function buy(k) {
  const d=DEFS[k]; if(!d) return
  const n=gb(k); if(n>=d.max) return
  if(d.req&&!d.req()) return
  const cost=Math.floor(d.cost*Math.pow(d.sc,n))
  if(score<cost) return
  score-=cost; B[k]=(n+1); d.do(); beep('buy'); ui(); saveGame()
}

const RB_TIERS=[
  {req:1000,    mult:10},
  {req:10000,   mult:50},
  {req:100000,  mult:200},
  {req:1000000, mult:1000},
  {req:10000000,mult:5000},
  {req:1000000000,mult:50000},
]

function doRb(tier) {
  const t=RB_TIERS[tier]; if(!t||rebirths!==tier||ate<t.req) return
  if(!confirm(`Rebirth for ×${t.mult} permanent mult? Score + upgrades reset.`)) return
  rbBonus*=t.mult; rebirths++; score=0; baseMult=1
  critChance=0;megaCritChance=0;critPow=1;comboBonus=0;passiveInc=0;marketVal=0;streakMult=0
  chainClick=false;ghostCans=false;blingMode=false; clearInterval(autoT)
  'bc,sd,ac,ts,cb,pp,ch,gs,bling,clickval,streak,d1,d5,d15,d30,d100,d500,cr,crp,mcc,crchain'.split(',').forEach(k=>delete B[k])
  beep('rebirth')
  document.body.classList.add('rb-flashing'); setTimeout(()=>document.body.classList.remove('rb-flashing'),500)
  for(let i=0;i<10;i++) setTimeout(()=>burst(rnd(60,fxcv.width-60),rnd(60,fxcv.height-60),'#00b4d8',28,true),i*65)
  ui(); saveGame()
}

function updCombo() {
  const e=$('combo')
  if(combo<3){e.classList.remove('show');return}
  const cols=['#00b4d8','#4ade80','#f59e0b','#fb923c','#ef4444','#a78bfa']
  const c=cols[Math.min(Math.floor(combo/3),cols.length-1)]
  e.style.color=c; e.textContent=`🔥 ${combo}x combo`
  if(!e.classList.contains('show')) { e.classList.add('show') }
  else { e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump') }
}

function swTab(btn) {
  document.querySelectorAll('.tab').forEach(t=>t.classList.add('hidden'))
  document.querySelectorAll('.ptab').forEach(b=>b.classList.remove('active'))
  $(btn.dataset.tab).classList.remove('hidden')
  btn.classList.add('active')
}

function openSettings() { $('settings-modal').classList.remove('hidden') }
function closeSettings() { $('settings-modal').classList.add('hidden') }

// ── save / load ──────────────────────────────────────────────────
const SAVE_KEY = 'clinkd_v1'
function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      score, ate, baseMult, rbBonus, rebirths,
      caught, missed, bestCombo, crits, mcrits,
      goldenC, ghostC, shieldU, blingHits, critPts, bestClick,
      critChance, megaCritChance, critPow,
      comboBonus, passiveInc, streakMult, marketVal,
      chainClick, ghostCans, blingMode, shieldLeft,
      B, t0,
      theme: document.body.dataset.theme || 'dark'
    }))
  } catch(e) {}
}
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY); if(!raw) return
    const d = JSON.parse(raw)
    const n = v => v != null ? v : 0
    score=n(d.score); ate=n(d.ate); baseMult=d.baseMult||1; rbBonus=d.rbBonus||1
    rebirths=n(d.rebirths); caught=n(d.caught); missed=n(d.missed)
    bestCombo=n(d.bestCombo); crits=n(d.crits); mcrits=n(d.mcrits)
    goldenC=n(d.goldenC); ghostC=n(d.ghostC); shieldU=n(d.shieldU)
    blingHits=n(d.blingHits); critPts=n(d.critPts); bestClick=n(d.bestClick)
    critChance=n(d.critChance); megaCritChance=n(d.megaCritChance); critPow=d.critPow||1
    comboBonus=n(d.comboBonus); passiveInc=n(d.passiveInc); streakMult=n(d.streakMult)
    marketVal=n(d.marketVal); chainClick=!!d.chainClick; ghostCans=!!d.ghostCans
    blingMode=!!d.blingMode; shieldLeft=n(d.shieldLeft)
    if(d.B) Object.assign(B, d.B)
    if(d.t0) t0=d.t0
    if(gb('ac')) autoT=setInterval(()=>{const c=[...document.querySelectorAll('.can:not([data-done])')];if(c.length)c[0|rnd(0,c.length)].click()},3000)
    if(gb('streak')) { clearInterval(streakT); streakT=setInterval(()=>{ if(now()-lastMiss>10000&&combo>0) streakMult=Math.min(gb('streak')*.5,streakMult+.1); else if(now()-lastMiss<2000) streakMult=Math.max(0,streakMult-.2) },1000) }
    const theme = d.theme || 'dark'
    document.body.dataset.theme = theme
    const chk = $('dark-t'); if(chk) chk.checked = theme==='dark'
  } catch(e) { console.warn('save load failed', e) }
}
setInterval(saveGame, 30000)

let lastSpark=0
document.addEventListener('mousemove',e=>{
  if(!cfg.spark) return
  const t=now(); if(t-lastSpark<42) return; lastSpark=t
  const s=el('div','spark'), sz=rnd(3,6)
  s.style.cssText=`left:${e.clientX-sz/2}px;top:${e.clientY-sz/2}px;width:${sz}px;height:${sz}px`
  document.body.appendChild(s); setTimeout(()=>s.remove(),450)
})

function ui() {
  $('s').textContent=fmt(score)
  $('bal').textContent=fmt(score)
  $('ate').textContent=fmt(ate)
  $('caught').textContent=fmt(caught)
  $('missed').textContent=fmt(missed)
  $('rb').textContent=rebirths
  $('acc').textContent=caught+missed>0?Math.round(caught/(caught+missed)*100)+'%':'--%'
  const bm=boosts.reduce((a,b)=>now()<b.until?a*b.mult:a,1)
  const em=baseMult*rbBonus*bm*(frenzy?3:1)*(dblActive?2:1)*(1+streakMult)
  $('mult').textContent='x'+(Number.isInteger(em)?em:em.toFixed(1))

  Object.keys(DEFS).forEach(k=>{
    const btn=document.querySelector(`#pi-${k} button`); if(!btn) return
    const d=DEFS[k], n=gb(k), maxd=n>=d.max
    const locked=d.req&&!d.req()
    const cost=Math.floor(d.cost*Math.pow(d.sc,n))
    const cnt=$(`pc-${k}`)
    if(cnt) cnt.textContent=`${n}/${d.max===Infinity?'∞':d.max}`
    if(maxd){btn.textContent="max'd";btn.className='maxd';btn.disabled=false}
    else if(locked){btn.textContent='locked';btn.disabled=true;btn.className=''}
    else{btn.textContent=fmt(cost);btn.disabled=score<cost;btn.className=''}
  })

  RB_TIERS.forEach((t,i)=>{
    const row=$(`rbt${i}`); if(!row) return
    const btn=row.querySelector('button')
    const done=rebirths>i, cur=rebirths===i, rdy=cur&&ate>=t.req
    row.className=done?'done':rdy?'ready':''
    btn.disabled=done||!cur||ate<t.req
    btn.textContent=done?'✓':rdy?'rebirth ♻':'locked'
  })
  $('rbc').textContent=rebirths; $('rbb').textContent='x'+rbBonus; $('rbate').textContent=fmt(ate)

  const s2=Math.floor((now()-t0)/1000)
  const ids=['st0','st1','st2','st3','st4','st5','st6','st7','st8','st9','st10','st11','st12','st13','st14','st15','st16','st17']
  const vals=[fmt(score),fmt(ate),fmt(caught),fmt(missed),caught+missed>0?Math.round(caught/(caught+missed)*100)+'%':'--%',
    bestCombo,fmt(crits),fmt(mcrits),fmt(goldenC),fmt(ghostC),fmt(shieldU),fmt(bestClick),fmt(critPts),
    s2>0?fmt(ate/s2*60):'0',s2<60?s2+'s':Math.floor(s2/60)+'m '+s2%60+'s',rebirths,fmt(blingHits),'x'+(1+streakMult).toFixed(1)]
  ids.forEach((id,i)=>{ const e=$(id); if(e) e.textContent=vals[i] })

  updBoosts()
}

passT=setInterval(()=>{ if(passiveInc>0){score+=passiveInc;ate+=passiveInc;$('s').textContent=fmt(score)} },1000)

let last=0
function loop(ts) {
  if(!last) last=ts; last=ts; tickParts()
  if(boosts.length) updBoosts()
  requestAnimationFrame(loop)
}

window.addEventListener('resize',resizeFx)

const TIPS = [
  'loading cans...','warming up the fridge...','shaking it up...','applying condensation...',
  'chilling to 4°c...','popping the tab...','almost ready to click...'
]
let tipIdx=0

function runLoader() {
  const bar=$('loader-bar'), tip=$('loader-tip')
  const cv=$('ldr-cv')
  if(cv) drawCan(cv,54,90,'r')
  let pct=0
  const iv=setInterval(()=>{
    pct+=rnd(8,18)
    bar.style.width=Math.min(pct,100)+'%'
    tipIdx=(tipIdx+1)%TIPS.length
    tip.textContent=TIPS[tipIdx]
    if(pct>=100) {
      clearInterval(iv)
      bar.style.width='100%'
      tip.textContent='let\'s go! 🥤'
      setTimeout(()=>{
        $('loader').classList.add('out')
        setTimeout(()=>{
          $('loader').style.display='none'
          resizeFx(); respawn(); ui(); setInterval(ui,600)
          requestAnimationFrame(loop)
        },650)
      },400)
    }
  },120)
}

loadGame()
runLoader()
