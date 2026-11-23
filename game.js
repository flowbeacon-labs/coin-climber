(()=>{'use strict';
const cv=document.getElementById('game'),g=cv.getContext('2d'),$=id=>document.getElementById(id);
const W=540,H=900,LEVELS_PER_WORLD=3;
const worlds=[
{name:'Sunrise Skies',icon:'☀️',top:'#3c96ea',bottom:'#d0f4ff',accent:'#ffffff',enemy:'#ef5b6a',detail:'#72cb91',goal:3100},
{name:'Emerald Jungle',icon:'🌿',top:'#114e64',bottom:'#45c19e',accent:'#d6ffe3',enemy:'#ac4ce8',detail:'#24795e',goal:3500},
{name:'Cosmic Clouds',icon:'🌙',top:'#0d174f',bottom:'#62439c',accent:'#cbcbff',enemy:'#ff6b91',detail:'#7365da',goal:3900},
{name:'Frost Peaks',icon:'❄️',top:'#4c9dcf',bottom:'#d5f6ff',accent:'#ffffff',enemy:'#3679c9',detail:'#a6e5ef',goal:4150},
{name:'Volcano Rise',icon:'🌋',top:'#4e1929',bottom:'#ec6541',accent:'#ffd487',enemy:'#ffbd4f',detail:'#7d2735',goal:4400},
{name:'Candy Heights',icon:'🍭',top:'#e484bf',bottom:'#ffe1ea',accent:'#fff1ad',enemy:'#a448af',detail:'#f3a4d0',goal:4650},
{name:'Ocean Mist',icon:'🌊',top:'#075684',bottom:'#72cfd7',accent:'#c4fbff',enemy:'#e46e9b',detail:'#2e93a7',goal:4900},
{name:'Golden Desert',icon:'🏜️',top:'#e9a952',bottom:'#ffe6a2',accent:'#fff0bc',enemy:'#af6635',detail:'#c38a4b',goal:5150},
{name:'Thunder Realm',icon:'⚡',top:'#22285e',bottom:'#7b80b8',accent:'#c7d5ff',enemy:'#ffe46b',detail:'#4a5b9e',goal:5400},
{name:'Crystal Sky',icon:'💎',top:'#216e94',bottom:'#b0a9ee',accent:'#c4ffff',enemy:'#8d65e3',detail:'#5dc5d2',goal:5650},
{name:'Autumn Canopy',icon:'🍁',top:'#9c452d',bottom:'#e7b164',accent:'#ffe3ae',enemy:'#753886',detail:'#b64d28',goal:5900},
{name:'Neon City',icon:'🌃',top:'#101c4d',bottom:'#533494',accent:'#85ffff',enemy:'#fa62c3',detail:'#383f9d',goal:6150},
{name:'Rainbow Kingdom',icon:'🌈',top:'#6176d9',bottom:'#f6cbd7',accent:'#fff7b5',enemy:'#a346be',detail:'#8fb5e7',goal:6400}
];
const COUNT=worlds.length*LEVELS_PER_WORLD;
const titles=[
'Morning Flight','Cloud Hopper','Stormy Summit',
'Leafy Ascent','Temple Towers','Treetop Chase',
'Star Trail','Meteor Heights','Galaxy Gateway',
'Snowflake Drift','Ice Bridge','Blizzard Crown',
'Ember Flight','Lava Rush','Volcano Crown',
'Sugar Clouds','Lollipop Lanes','Candy Castle',
'Sea Breeze','Whirlpool Climb','Ocean Crown',
'Dune Drifter','Sandstorm Sprint','Sun Temple',
'Storm Watch','Thunder Trails','Lightning Summit',
'Prism Flight','Crystal Maze','Diamond Gate',
'Maple Drift','Harvest Winds','Autumn Crown',
'Neon Ascent','Skyline Sprint','Cyber Summit',
'Rainbow Rise','Prismatic Chase','Skybound Champion'
];
const state={left:false,right:false,boost:false};const touches=new Map();let mode='menu',selected=0,unlocked=1,high=0,mute=false,audio=null;
const SAVE='coin-climber-skybound-v2';
try{let s=JSON.parse(localStorage.getItem(SAVE)||'{}');unlocked=Math.max(1,Math.min(COUNT,Number(s.unlocked)||1));high=Math.max(0,Number(s.high)||0);mute=!!s.mute;}catch{}
let level=0,player={},coins=[],foes=[],pickups=[],particles=[],altitude=0,camera=0,score=0,lives=3,shield=0,invincible=0,checkpoint=0,frame=0,toastTimer=0,edgeCharge=0,edgeSide=0;
const rand=(n)=>{let x=Math.sin(n*137.238+level*59.727)*43758.5453;return x-Math.floor(x);};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const EDGE_LIMIT=78,EDGE_WARNING=35,EDGE_DAMAGE=112;
function enemyX(e){return W/2+Math.sin(frame*.016*e.speed+e.phase)*(W/2-34);}
function edgeSideOf(x){return x<EDGE_LIMIT?-1:x>W-EDGE_LIMIT?1:0;}
function persist(){try{localStorage.setItem(SAVE,JSON.stringify({high,unlocked,mute}));}catch{}}
function beep(freq=500,seconds=.08,type='sine'){if(mute||mode!=='play')return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();let o=audio.createOscillator(),gain=audio.createGain();o.type=type;o.frequency.value=freq;gain.gain.value=.055;gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+seconds);o.connect(gain);gain.connect(audio.destination);o.start();o.stop(audio.currentTime+seconds);}catch{}}
function notify(message){$('toast').textContent=message;$('toast').style.opacity='1';toastTimer=75;}
function updateHud(){let w=Math.floor(level/3),t=worlds[w];$('world').textContent=`${t.icon} ${w+1}-${level%3+1}`;$('coins').textContent='🪙 '+score;$('hearts').textContent='♥ '+lives;$('progress').textContent='↑ '+Math.min(100,Math.floor(altitude/target()*100))+'%';}
function target(){return worlds[Math.floor(level/3)].goal+level%3*550;}
function resetInputs(){touches.clear();Object.keys(state).forEach(k=>state[k]=false);document.querySelectorAll('.control').forEach(b=>b.classList.remove('pressed'));}
function levelButtons(){
 const box=$('levels');box.replaceChildren();box.classList.add('milestone-list');
 const selectedWorld=Math.floor(selected/LEVELS_PER_WORLD);
 for(let w=0;w<worlds.length;w++){
   const group=document.createElement('details');group.className='milestone';
   group.open=w===selectedWorld;
   const summary=document.createElement('summary');
   summary.textContent=`${worlds[w].icon} Milestone ${w+1}: ${worlds[w].name} ${w*3>=unlocked?'🔒':''}`;
   group.append(summary);
   const stageBox=document.createElement('div');stageBox.className='milestone-stages';
   for(let j=0;j<LEVELS_PER_WORLD;j++){
     const i=w*LEVELS_PER_WORLD+j,b=document.createElement('button');
     b.className='level'+(i===selected?' selected':'');b.disabled=i>=unlocked;
     b.textContent=`${i<unlocked?'':'🔒 '}${w+1}-${j+1}`;
     const sub=document.createElement('small');sub.textContent=titles[i];b.append(sub);
     b.addEventListener('click',()=>{selected=i;levelButtons();$('play').textContent='PLAY '+titles[i].toUpperCase();});
     stageBox.append(b);
   }
   group.append(stageBox);box.append(group);
 }
}
function overlay(head,desc,button='PLAY'){resetInputs();$('heading').textContent=head;$('description').textContent=desc;$('best').textContent=`Best coins: ${high}  •  Unlocked: ${unlocked}/${COUNT}`;$('play').textContent=button;$('overlay').hidden=false;$('overlay').style.display='grid';levelButtons();}
function hideOverlay(){$('overlay').hidden=true;$('overlay').style.display='none';}
function start(i){level=i;selected=i;score=0;lives=3;shield=0;invincible=55;altitude=0;checkpoint=0;camera=0;frame=0;edgeCharge=0;edgeSide=0;particles=[];player={x:W/2,y:200,w:50,h:54,vx:0};coins=[];foes=[];pickups=[];const total=target();
for(let y=210,k=0;y<total-110;y+=62,k++){let x=57+rand(k+9)*(W-114);coins.push({x,y,r:12,taken:false});if(k%7===2)coins.push({x:clamp(x+45,38,W-38),y:y+26,r:12,taken:false});}
for(let y=490,k=0;y<total-200;y+=220,k++){foes.push({x:70+rand(k+88)*(W-140),y,w:47+level%3*2,h:45,base:0,phase:rand(k+23)*6.28,dead:false,speed:1+(level%3)*.18});}
for(let y=800,k=0;y<total-200;y+=850,k++)pickups.push({x:70+rand(k+144)*(W-140),y,type:k%2===0?'shield':'heart',taken:false});
mode='play';hideOverlay();updateHud();}
function hurt(){if(invincible>0||mode!=='play')return;if(shield>0){shield=0;edgeCharge=0;edgeSide=0;player.x=clamp(player.x,EDGE_LIMIT+35,W-EDGE_LIMIT-35);invincible=65;beep(220,.16,'triangle');notify('🛡 SHIELD SAVED YOU!');return;}lives--;beep(150,.24,'sawtooth');if(lives===0){mode='over';high=Math.max(high,score);persist();overlay('Game Over 💥',`You collected ${score} coins in ${titles[level]}. Try again!`,'TRY AGAIN');return;}altitude=checkpoint;camera=checkpoint;player.x=W/2;edgeCharge=0;edgeSide=0;invincible=110;notify('♥ TRY AGAIN FROM CHECKPOINT');}
function win(){mode='won';high=Math.max(high,score);unlocked=Math.max(unlocked,Math.min(COUNT,level+2));persist();selected=Math.min(COUNT-1,level+1);beep(800,.24,'triangle');overlay(level===COUNT-1?'🏆 SKY CHAMPION!':'🌟 LEVEL COMPLETE!',`You collected ${score} coins and conquered ${titles[level]}!`,level===COUNT-1?'PLAY AGAIN':'NEXT LEVEL');}
function update(){if(mode!=='play')return;frame++;const dx=(state.right?1:0)-(state.left?1:0);player.vx=dx*5.6;player.x=clamp(player.x+player.vx,27,W-27);let speed=(state.boost?5.2:2.85)+Math.min(1.4,Math.floor(level/3)*.13)+level%3*.12;altitude=Math.min(target()+20,altitude+speed);camera=altitude;if(invincible>0)invincible--;
const side=altitude<240?0:edgeSideOf(player.x);
if(!side){edgeCharge=0;edgeSide=0;}else{
  if(side!==edgeSide){edgeCharge=0;edgeSide=side;}
  edgeCharge++;
  if(edgeCharge===EDGE_WARNING)notify('⚠ EDGE DANGER — MOVE TOWARD CENTER!');
  if(edgeCharge>=EDGE_DAMAGE){
    edgeCharge=0;player.x=side<0?EDGE_LIMIT+35:W-EDGE_LIMIT-35;
    if(invincible===0)hurt();
    else notify('⚠ AVOID THE EDGE!');
  }
}if(toastTimer>0&&--toastTimer===0)$('toast').style.opacity='0';if(altitude>=target()){win();return;}
for(let c of coins){if(c.taken||Math.abs(c.y-altitude)>100)continue;if(Math.abs(c.x-player.x)<35&&Math.abs(c.y-altitude)<37){c.taken=true;score++;beep(660+score%5*70,.055);particles.push({x:c.x,y:c.y,age:0});if(score>high){high=score;if(score%10===0)persist();}}}
for(let p of pickups){if(p.taken||Math.abs(p.y-altitude)>90)continue;if(Math.abs(p.x-player.x)<40&&Math.abs(p.y-altitude)<44){p.taken=true;if(p.type==='shield'){shield=1;notify('🛡 SHIELD ACTIVATED!');}else{lives=Math.min(5,lives+1);notify('♥ EXTRA HEART!');}beep(920,.16,'triangle');}}
for(let e of foes){if(e.dead||Math.abs(e.y-altitude)>100)continue;const xpos=enemyX(e);if(Math.abs(xpos-player.x)<(e.w+player.w)*.42&&Math.abs(e.y-altitude)<42){hurt();if(mode!=='play')break;}}
if(altitude>=checkpoint+800){checkpoint=Math.floor(altitude/800)*800;notify('🚩 CHECKPOINT!');beep(450,.12);}
for(let p of particles)p.age++;particles=particles.filter(p=>p.age<22);updateHud();}
function poly(points,fill){g.fillStyle=fill;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
function circle(x,y,r,fill){g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle=fill;g.fill();}
function worldY(y){return H-200-(y-camera);}
function drawBg(){const w=Math.floor(level/3),t=worlds[w];let grad=g.createLinearGradient(0,0,0,H);grad.addColorStop(0,t.top);grad.addColorStop(1,t.bottom);g.fillStyle=grad;g.fillRect(0,0,W,H);
if(w===0){for(let i=0;i<20;i++){let y=((i*170+camera*.31)%1120)-100,x=rand(i+10)*W;g.fillStyle='#f4fbffbb';for(let k=0;k<3;k++)circle(x+k*22,y+(k%2)*-11,27,'#ffffffc7');}for(let i=0;i<9;i++){let y=((i*270+camera*.17)%1300)-200;poly([[0,y+80],[90,y],[180,y+90]],'#6fb6c588');poly([[320,y+95],[440,y-15],[540,y+70]],'#91d6df77');}}
else if(w===1){for(let i=0;i<26;i++){let y=((i*145+camera*.35)%1150)-130,x=rand(i+40)*W;g.fillStyle='#175d4e';g.fillRect(x-5,y,10,180);circle(x,y,35,t.detail);circle(x-28,y+18,22,'#339b70');}for(let i=0;i<15;i++){let y=((i*170+camera*.53)%1150)-90;poly([[0,y+100],[50,y+38],[100,y+120]],'#1d6a689e');poly([[450,y+110],[500,y],[540,y+115]],'#277d7199');}}
else if(w===2){for(let i=0;i<95;i++){let y=((i*137+camera*(.2+rand(i)*.5))%1100)-100,x=rand(i+12)*W;circle(x,y,rand(i+32)*2.2+1,'#f3efffd9');}for(let i=0;i<12;i++){let y=((i*258+camera*.28)%1200)-140,x=rand(i+200)*W;circle(x,y,20+rand(i)*27,'#a18dfe65');circle(x-7,y-7,7,'#d5c8ff55');}g.strokeStyle='#91b5ff29';g.lineWidth=8;for(let i=0;i<6;i++){let y=((i*320+camera*.3)%1200)-150;g.beginPath();g.moveTo(-20,y);g.quadraticCurveTo(W/2,y-100,W+20,y+30);g.stroke();}}
else {
  // Ten additional animated backgrounds, each with its own motif and color palette.
  const accent=t.accent,detail=t.detail;
  for(let i=0;i<37;i++){
    const x=rand(i+67)*W, y=((i*157+camera*(.18+rand(i+12)*.36))%1110)-110;
    if(w===3){ // snow peaks
      circle(x,y,2+rand(i)*6,'#ffffffb8');
      if(i%6===0)poly([[x-90,y+130],[x,y-45],[x+90,y+130]],'#e6faff88');
    }else if(w===4){ // volcanic embers
      circle(x,y,2+rand(i+2)*6,'#ffd075c9');
      if(i%6===0)poly([[x-90,y+135],[x,y-25],[x+90,y+135]],'#65263caa');
    }else if(w===5){ // candy clouds
      circle(x,y,18+rand(i)*24,i%2?'#fff0ff8c':'#ffb0e69c');
      if(i%7===0){g.fillStyle='#ffffffb8';g.fillRect(x-4,y-75,8,60);circle(x,y-74,24,'#ff77b5aa');}
    }else if(w===6){ // water bubbles and waves
      g.strokeStyle='#cbffff91';g.lineWidth=2;g.beginPath();g.arc(x,y,5+rand(i)*17,0,Math.PI*2);g.stroke();
      if(i%5===0){g.strokeStyle='#a0f9ff55';g.beginPath();g.moveTo(0,y);g.quadraticCurveTo(W/2,y-45,W,y);g.stroke();}
    }else if(w===7){ // desert dunes and sunlight
      if(i%5===0){poly([[0,y+90],[x,y-10],[W,y+90]],'#f5bd70a5');}
      circle(x,y,2+rand(i)*3,'#ffe8bb');
    }else if(w===8){ // lightning and rain
      g.strokeStyle='#c4daff70';g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.lineTo(x-16,y+65);g.stroke();
      if(i%9===0)poly([[x,y-45],[x-14,y],[x+2,y],[x-14,y+50],[x+25,y-7],[x+7,y-7]],'#fff5a6ab');
    }else if(w===9){ // crystals
      poly([[x,y-38],[x+22,y],[x,y+38],[x-22,y]],i%2?'#b1ffff88':'#d6c7ffb0');
    }else if(w===10){ // falling leaves
      g.save();g.translate(x,y);g.rotate(frame*.007+i);poly([[0,-12],[10,0],[0,14],[-9,0]],i%2?'#ffda73b9':'#bf5637bb');g.restore();
      if(i%6===0)circle(x,y+60,35,'#b64d2880');
    }else if(w===11){ // neon towers
      if(i%4===0){g.fillStyle='#151a50b7';g.fillRect(x-25,y-50,52,170);
         for(let yy=y-35;yy<y+115;yy+=23){g.fillStyle='#69f7ffb3';g.fillRect(x-15,yy,9,10);g.fillRect(x+6,yy,9,10);}}
      circle(x,y,2+rand(i)*3,'#ff9ef7');
    }else{ // rainbow atmosphere
      const tones=['#ffb4cf77','#ffd87f88','#9cecb888','#a8cdff88','#d0b2ff88'];
      g.strokeStyle=tones[i%tones.length];g.lineWidth=14;g.beginPath();g.arc(x,y,45+rand(i)*75,Math.PI,0);g.stroke();
      circle(x,y,4,'#fff7d0');
    }
  }
}
}
function drawEdgeDanger(){
 const active=edgeCharge>=EDGE_WARNING,progress=Math.min(1,edgeCharge/EDGE_DAMAGE);
 const blink=active&&Math.floor(frame/9)%2===0;
 g.fillStyle=blink?'#ff354b88':'#ff405444';
 g.fillRect(0,0,EDGE_LIMIT,H);g.fillRect(W-EDGE_LIMIT,0,EDGE_LIMIT,H);
 g.fillStyle='#ffddd8';g.font='bold 15px system-ui';g.textAlign='center';
 g.save();g.translate(21,H*.52);g.rotate(-Math.PI/2);g.fillText('⚡ DANGER EDGE ⚡',0,0);g.restore();
 g.save();g.translate(W-21,H*.52);g.rotate(Math.PI/2);g.fillText('⚡ DANGER EDGE ⚡',0,0);g.restore();
 if(edgeSide){const x=edgeSide<0?8:W-17;
   g.fillStyle='#ffef76';g.fillRect(x,H-260,9,190*progress);
   if(active){g.fillStyle='#fff';g.font='bold 20px system-ui';g.textAlign='center';g.fillText('MOVE TO THE CENTER!',W/2,120);}
 }
}
function drawCoins(){for(let c of coins){if(c.taken)continue;let y=worldY(c.y);if(y<-35||y>H+35)continue;circle(c.x,y,14,'#ca841a');circle(c.x-2,y-2,11,'#ffdd58');circle(c.x-5,y-5,4,'#fff2aa');g.strokeStyle='#ffefab';g.lineWidth=2;g.beginPath();g.arc(c.x,y,8,-1.2,1.1);g.stroke();}}
function drawEnemies(){for(let e of foes){if(e.dead)continue;let y=worldY(e.y),x=enemyX(e);if(y<-80||y>H+80)continue;let w=Math.floor(level/3);if(w%3===0){poly([[x-27,y],[x-47,y-21],[x-20,y-13],[x,y-1]],'#ffe4ed');poly([[x+27,y],[x+47,y-21],[x+20,y-13],[x,y-1]],'#ffe4ed');circle(x,y,22,'#ef5974');circle(x-7,y-6,4,'#fff');circle(x+8,y-6,4,'#fff');circle(x-6,y-5,2,'#262c50');circle(x+9,y-5,2,'#262c50');}
else if(w%3===1){circle(x,y,23,'#8e4bcc');for(let k=0;k<4;k++){let th=k*Math.PI/2+frame*.05;circle(x+Math.cos(th)*25,y+Math.sin(th)*25,7,'#b268ed');}circle(x-7,y-3,5,'#fff');circle(x+9,y-3,5,'#fff');circle(x-6,y-3,2,'#261541');circle(x+10,y-3,2,'#261541');}
else{poly([[x-28,y],[x,y-27],[x+28,y],[x,y+27]],'#fe79aa');circle(x,y,15,'#eb4e87');circle(x-5,y-4,3,'white');circle(x+8,y-4,3,'white');circle(x-4,y-3,1.5,'#1e1450');circle(x+9,y-3,1.5,'#1e1450');} }
}
function drawPickups(){for(let p of pickups){if(p.taken)continue;let y=worldY(p.y);if(y<-40||y>H+40)continue;circle(p.x,y,22,'#ffffff59');circle(p.x,y,17,p.type==='shield'?'#6ae8f9':'#ff8da8');g.fillStyle='#fff';g.font='bold 23px system-ui';g.textAlign='center';g.fillText(p.type==='shield'?'◆':'♥',p.x,y+8);}}
function drawPlayer(){let x=player.x,y=H-200;if(invincible>0&&frame%10<5)return;g.save();g.translate(x,y);if(shield){circle(0,0,45,'#79f5ff43');g.strokeStyle='#91ffff';g.lineWidth=4;g.beginPath();g.arc(0,0,44,0,Math.PI*2);g.stroke();}poly([[-18,20],[-27,42],[0,29],[27,42],[18,20]],'#fd8b36');poly([[-16,-10],[-31,18],[-18,12]],'#ffe493');poly([[16,-10],[31,18],[18,12]],'#ffe493');circle(0,4,25,'#f7b64c');poly([[-22,3],[0,-38],[22,3]],'#ffdb63');circle(-8,3,5,'white');circle(9,3,5,'white');circle(-7,3,2.5,'#263352');circle(10,3,2.5,'#263352');g.fillStyle='#fff5';g.fillRect(-4,13,8,4);poly([[-12,34],[0,42],[12,34]],'#ffdf6a');g.restore();}
function drawGoal(){let y=worldY(target());if(y<-100||y>H+100)return;g.fillStyle='#ffe77a';g.fillRect(25,y-11,W-50,22);g.font='bold 25px system-ui';g.fillStyle='#14204f';g.textAlign='center';g.fillText('★  SKY GATE  ★',W/2,y-23);}
function drawParticles(){for(let p of particles){g.globalAlpha=1-p.age/22;g.font='bold 24px system-ui';g.fillStyle='#ffea66';g.textAlign='center';g.fillText('+1',p.x,worldY(p.y)-p.age*2);}g.globalAlpha=1;}
function draw(){drawBg();drawEdgeDanger();if(mode==='menu')camera+=.4;drawCoins();drawPickups();drawEnemies();drawGoal();if(mode!=='menu')drawPlayer();drawParticles();}
let last=0,carry=0;function loop(t){let delta=Math.min(80,t-last||16.666);last=t;carry+=delta;while(carry>=16.666){update();carry-=16.666;}draw();requestAnimationFrame(loop);}requestAnimationFrame(loop);
function recompute(){Object.keys(state).forEach(k=>state[k]=false);for(let key of touches.values())state[key]=true;document.querySelectorAll('[data-control]').forEach(b=>b.classList.toggle('pressed',state[b.dataset.control]));}
function unpress(id){touches.delete(id);recompute();}
document.querySelectorAll('[data-control]').forEach(b=>{let k=b.dataset.control;b.addEventListener('pointerdown',e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId);}catch{}touches.set(e.pointerId,k);recompute();});b.addEventListener('pointerup',e=>{e.preventDefault();unpress(e.pointerId);});b.addEventListener('pointercancel',e=>{e.preventDefault();unpress(e.pointerId);});b.addEventListener('lostpointercapture',e=>unpress(e.pointerId));b.addEventListener('contextmenu',e=>e.preventDefault());});
window.addEventListener('pointerup',e=>unpress(e.pointerId));window.addEventListener('pointercancel',e=>unpress(e.pointerId));window.addEventListener('blur',()=>{resetInputs();if(mode==='play')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){resetInputs();if(mode==='play')pause();}});document.addEventListener('contextmenu',e=>{if(e.target.closest('button,canvas'))e.preventDefault();});document.addEventListener('selectstart',e=>{if(e.target.closest('button,canvas'))e.preventDefault();});
const keymap={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'boost',ArrowUp:'boost',KeyW:'boost'};document.addEventListener('keydown',e=>{if(keymap[e.code]){e.preventDefault();state[keymap[e.code]]=true;}if(e.code==='KeyP'&&!e.repeat)pause();});document.addEventListener('keyup',e=>{if(keymap[e.code]){e.preventDefault();state[keymap[e.code]]=false;}});
function pause(){if(mode==='play'){mode='paused';overlay('Paused ⏸','Your climb is safe. Resume to keep collecting coins.','RESUME');}else if(mode==='paused'){mode='play';hideOverlay();}}
$('pause').addEventListener('click',pause);$('play').addEventListener('click',()=>{if(mode==='paused'){mode='play';hideOverlay();return;}start(selected);});$('sound').textContent=mute?'🔇':'🔊';$('sound').addEventListener('click',()=>{mute=!mute;$('sound').textContent=mute?'🔇':'🔊';persist();});$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else notify('On iPhone: Share → Add to Home Screen');}catch{notify('Try Add to Home Screen for fullscreen');}});
overlay('Coin Climber ✨','Climb 13 milestones and 39 vertical levels, each with a distinct sky world. Dodge sweeping enemies and avoid camping at dangerous edges. Collect coins, shields and checkpoints!','PLAY LEVEL 1');updateHud();
})();