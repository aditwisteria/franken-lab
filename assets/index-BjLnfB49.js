(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function a(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=a(o);fetch(o.href,i)}})();const ut=20261031;function Dn(){if(typeof window>"u")return ut;const e=new URLSearchParams(window.location.search).get("seed");if(e===null)return ut;const t=parseInt(e,10);return Number.isFinite(t)?t:ut}function Jt(e){let t=e>>>0;function a(){t+=1831565813;let i=t;return i=Math.imul(i^i>>>15,i|1),i^=i+Math.imul(i^i>>>7,i|61),((i^i>>>14)>>>0)/4294967296}function n(i,s){return Math.floor(a()*(s-i+1))+i}function o(i){if(i.length===0)throw new RangeError("pick: empty array");const s=i[n(0,i.length-1)];if(s===void 0)throw new RangeError("pick: index out of bounds");return s}return{next:a,int:n,pick:o,get seed(){return e}}}const Bn=Jt(Dn()),Ee={vampire:{id:"vampire",name:"Vampire",motif:"Pale skin, crimson cape collar, sharp fangs",palette:{primary:"#d4c8e0",secondary:"#8b0000",accent:"#ff2244"}},robot:{id:"robot",name:"Robot",motif:"Grey plating, cyan panel lines, retractable antenna",palette:{primary:"#7a8490",secondary:"#00e5ff",accent:"#ffffff"}},werewolf:{id:"werewolf",name:"Werewolf",motif:"Brown matted fur, rough bristle texture, amber eyes",palette:{primary:"#6b4423",secondary:"#a0622a",accent:"#ffb300"}},ghost:{id:"ghost",name:"Ghost",motif:"Translucent teal, no hard outline, drifting float",palette:{primary:"#80ffe8",secondary:"#004d40",accent:"#e0fff8"}},human:{id:"human",name:"Human",motif:"Plain fleshy tones, unmodified anatomy",palette:{primary:"#f0c08a",secondary:"#c68642",accent:"#ffe4c4"}}},Qt={vampire_head:{donor:"vampire",slot:"head",ability:{id:"vampire_head_lifesteal",name:"Lifesteal Bite",slot:"head",donor:"vampire",description:"Lunge and drain HP from the nearest villager, healing yourself.",cooldownSec:6,effectKey:"lifeStealBite"},mods:{hp:20,damage:5,speed:10,energy:-10}},vampire_torso:{donor:"vampire",slot:"torso",ability:{id:"vampire_torso_batform",name:"Bat Swarm Burst",slot:"torso",donor:"vampire",description:"Release a swarm of bats that scatter, pushing back all villagers.",cooldownSec:10,effectKey:"batSwarmBurst"},mods:{hp:10,damage:10,speed:5,energy:5}},vampire_arms:{donor:"vampire",slot:"arms",ability:{id:"vampire_arms_clawstrike",name:"Claw Strike",slot:"arms",donor:"vampire",description:"Slash both claws in a wide arc, hitting villagers in melee range.",cooldownSec:2,effectKey:"clawStrike"},mods:{hp:0,damage:15,speed:0,energy:-5}},vampire_legs:{donor:"vampire",slot:"legs",ability:{id:"vampire_legs_mistdash",name:"Mist Dash",slot:"legs",donor:"vampire",description:"Dissolve into mist and surge forward, passing through villagers.",cooldownSec:5,effectKey:"mistDash"},mods:{hp:-10,damage:0,speed:30,energy:10}},robot_head:{donor:"robot",slot:"head",ability:{id:"robot_head_targetlock",name:"Target Lock",slot:"head",donor:"robot",description:"Scan the arena and mark three villagers; they take double damage until cleared.",cooldownSec:8,effectKey:"targetLock"},mods:{hp:0,damage:5,speed:-5,energy:20}},robot_torso:{donor:"robot",slot:"torso",ability:{id:"robot_torso_shieldburst",name:"Chassis Shield Burst",slot:"torso",donor:"robot",description:"Deploy an energy barrier that absorbs the next two hits.",cooldownSec:12,effectKey:"chassisShieldBurst"},mods:{hp:30,damage:0,speed:-10,energy:10}},robot_arms:{donor:"robot",slot:"arms",ability:{id:"robot_arms_rangedzap",name:"Ranged Zap",slot:"arms",donor:"robot",description:"Fire a crackling bolt of electricity at the nearest villager.",cooldownSec:1.5,effectKey:"rangedZap"},mods:{hp:0,damage:10,speed:-5,energy:15}},robot_legs:{donor:"robot",slot:"legs",ability:{id:"robot_legs_overdrive",name:"Overdrive Stomp",slot:"legs",donor:"robot",description:"Turbine legs propel a ground-shaking stomp, stunning nearby villagers.",cooldownSec:7,effectKey:"overdriveStomp"},mods:{hp:10,damage:5,speed:15,energy:0}},werewolf_head:{donor:"werewolf",slot:"head",ability:{id:"werewolf_head_howl",name:"Terrifying Howl",slot:"head",donor:"werewolf",description:"Let loose a horrifying howl that freezes every villager in fear.",cooldownSec:9,effectKey:"terrifyingHowl"},mods:{hp:10,damage:10,speed:5,energy:-5}},werewolf_torso:{donor:"werewolf",slot:"torso",ability:{id:"werewolf_torso_roarknockback",name:"Roar Knockback",slot:"torso",donor:"werewolf",description:"Slam your chest and bellow, blasting all villagers backward.",cooldownSec:8,effectKey:"roarKnockback"},mods:{hp:20,damage:5,speed:0,energy:5}},werewolf_arms:{donor:"werewolf",slot:"arms",ability:{id:"werewolf_arms_frenzyswipe",name:"Frenzy Swipe",slot:"arms",donor:"werewolf",description:"Unleash a flurry of rapid claw swipes, hitting up to three villagers.",cooldownSec:3,effectKey:"frenzySwipe"},mods:{hp:0,damage:20,speed:5,energy:-10}},werewolf_legs:{donor:"werewolf",slot:"legs",ability:{id:"werewolf_legs_packleap",name:"Pack Leap",slot:"legs",donor:"werewolf",description:"Spring into the thickest group of villagers, landing for area damage.",cooldownSec:6,effectKey:"packLeap"},mods:{hp:5,damage:10,speed:20,energy:-5}},ghost_head:{donor:"ghost",slot:"head",ability:{id:"ghost_head_wail",name:"Spectral Wail",slot:"head",donor:"ghost",description:"Emit a piercing spectral wail that drains energy from every villager on screen.",cooldownSec:10,effectKey:"spectralWail"},mods:{hp:-10,damage:5,speed:10,energy:20}},ghost_torso:{donor:"ghost",slot:"torso",ability:{id:"ghost_torso_incorporeal",name:"Incorporeal Shroud",slot:"torso",donor:"ghost",description:"Briefly turn fully intangible; incoming attacks pass through you.",cooldownSec:11,effectKey:"incorporealShroud"},mods:{hp:-20,damage:0,speed:15,energy:20}},ghost_arms:{donor:"ghost",slot:"arms",ability:{id:"ghost_arms_hauntstrike",name:"Haunt Strike",slot:"arms",donor:"ghost",description:"Extend ghostly tendrils that phase through armour and deal direct damage.",cooldownSec:2.5,effectKey:"hauntStrike"},mods:{hp:-10,damage:5,speed:5,energy:10}},ghost_legs:{donor:"ghost",slot:"legs",ability:{id:"ghost_legs_phasedash",name:"Phase Dash",slot:"legs",donor:"ghost",description:"Phase out of reality and reappear behind the nearest villager, avoiding all damage.",cooldownSec:4,effectKey:"phaseDash"},mods:{hp:-15,damage:0,speed:40,energy:15}},human_head:{donor:"human",slot:"head",ability:{id:"human_head_rally",name:"Rally Cry",slot:"head",donor:"human",description:"A determined battle cry that boosts all stats momentarily.",cooldownSec:15,effectKey:"rallyCry"},mods:{hp:10,damage:0,speed:5,energy:5}},human_torso:{donor:"human",slot:"torso",ability:{id:"human_torso_secondwind",name:"Second Wind",slot:"torso",donor:"human",description:"Draw on pure willpower to restore a chunk of HP.",cooldownSec:20,effectKey:"secondWind"},mods:{hp:40,damage:-5,speed:0,energy:0}},human_arms:{donor:"human",slot:"arms",ability:{id:"human_arms_brawl",name:"Brawler Punch",slot:"arms",donor:"human",description:"A reliable, unadorned punch — no frills, solid knockback.",cooldownSec:1,effectKey:"brawlerPunch"},mods:{hp:0,damage:5,speed:0,energy:0}},human_legs:{donor:"human",slot:"legs",ability:{id:"human_legs_sprint",name:"Adrenaline Sprint",slot:"legs",donor:"human",description:"Pump your legs and sprint clear of a mob, buying precious distance.",cooldownSec:8,effectKey:"adrenalineSprint"},mods:{hp:0,damage:0,speed:20,energy:0}}};function en(e,t){const a=`${e}_${t}`,n=Qt[a];if(!n)throw new RangeError(`getPart: no part for donor="${e}" slot="${t}"`);return n}["vampire","robot","werewolf","ghost","human"].flatMap(e=>["head","torso","arms","legs"].map(t=>en(e,t).ability));const Ze={maxHp:100,damage:10,speed:100,maxEnergy:100},Z={maxHp:{min:40,max:300},damage:{min:1,max:60},speed:{min:40,max:260},maxEnergy:{min:20,max:200}};function Xe(e,t,a){return Math.max(t,Math.min(a,e))}const Un=["head","torso","arms","legs"];function ce(e){const t=Object.freeze({...e});let a=Ze.maxHp,n=Ze.damage,o=Ze.speed,i=Ze.maxEnergy;const s=Un.map(c=>{const l=en(t[c],c);return a+=l.mods.hp,n+=l.mods.damage,o+=l.mods.speed,i+=l.mods.energy,l.ability}),r={maxHp:Xe(a,Z.maxHp.min,Z.maxHp.max),damage:Xe(n,Z.damage.min,Z.damage.max),speed:Xe(o,Z.speed.min,Z.speed.max),maxEnergy:Xe(i,Z.maxEnergy.min,Z.maxEnergy.max)};return{build:t,abilities:s,stats:r}}const T={headW:50,headH:60,headTop:-190,torsoW:60,torsoH:70,torsoTop:-130,armW:20,armH:60,armTop:-130,armCx:50,legW:22,legH:60,legTop:-60,legCx:17,seamY1:-130,seamY2:-60};function ct(e,t){e.globalAlpha=t?.55:1}function dt(e,t,a,n,o,i){e.save(),e.strokeStyle=i,e.lineWidth=1,e.globalAlpha*=.6;const s=Math.floor(n/6),r=Math.floor(o/7);for(let c=0;c<r;c++)for(let l=0;l<s;l++){const d=t+l*6+3,f=a+c*7+2;e.beginPath(),e.moveTo(d,f),e.lineTo(d+(l%2===0?2:-2),f-4),e.stroke()}e.restore()}function ye(e,t,a,n,o,i,s){e.fillStyle=s,e.beginPath(),e.roundRect(t,a,n,o,i),e.fill()}function Oe(e,t,a,n,o,i,s,r){e.strokeStyle=s,e.lineWidth=r,e.beginPath(),e.roundRect(t,a,n,o,i),e.stroke()}function On(e,t,a){const n=Ee[t].palette,o=t==="ghost",i=o?Math.sin(a*2.1)*4:0;e.save(),e.translate(0,i),ct(e,o);const s=-50/2,r=T.headTop,c=T.headW,l=T.headH;if(ye(e,s,r,c,l,8,n.primary),o||Oe(e,s,r,c,l,8,n.secondary,2),t==="vampire"&&(e.fillStyle="#ffffff",e.beginPath(),e.moveTo(-6,r+l),e.lineTo(-3,r+l+8),e.lineTo(0,r+l),e.fill(),e.beginPath(),e.moveTo(0,r+l),e.lineTo(3,r+l+8),e.lineTo(6,r+l),e.fill(),e.fillStyle=n.secondary,e.beginPath(),e.moveTo(s-10,r+l-5),e.lineTo(s,r+l+2),e.lineTo(s+5,r+l-10),e.fill(),e.beginPath(),e.moveTo(s+c+10,r+l-5),e.lineTo(s+c,r+l+2),e.lineTo(s+c-5,r+l-10),e.fill(),e.fillStyle=n.accent,e.beginPath(),e.ellipse(-10,r+22,5,5,0,0,Math.PI*2),e.fill(),e.beginPath(),e.ellipse(10,r+22,5,5,0,0,Math.PI*2),e.fill()),t==="robot"){const d=Math.sin(a*3)>0;e.strokeStyle=n.secondary,e.lineWidth=2,e.beginPath(),e.moveTo(0,r),e.lineTo(0,r-18),e.stroke(),e.fillStyle=d?n.accent:n.secondary,e.beginPath(),e.arc(0,r-22,4,0,Math.PI*2),e.fill(),e.fillStyle=n.secondary,e.globalAlpha*=.7,ye(e,s+6,r+18,c-12,14,3,n.secondary),e.globalAlpha/=.7,e.strokeStyle=n.secondary,e.lineWidth=1,e.beginPath(),e.moveTo(s+8,r+40),e.lineTo(s+c-8,r+40),e.stroke()}if(t==="werewolf"&&(dt(e,s,r,c,l,n.secondary),e.fillStyle=n.accent,e.beginPath(),e.ellipse(-10,r+20,6,5,0,0,Math.PI*2),e.fill(),e.beginPath(),e.ellipse(10,r+20,6,5,0,0,Math.PI*2),e.fill(),e.fillStyle=n.secondary,ye(e,-8,r+l-18,16,12,4,n.secondary)),t==="ghost"){e.strokeStyle=n.accent,e.lineWidth=2;for(let d=-1;d<=1;d++){const f=d*14;e.beginPath(),e.moveTo(f,r),e.quadraticCurveTo(f+6,r-12,f,r-20),e.stroke()}e.fillStyle=n.secondary,e.beginPath(),e.ellipse(-10,r+25,6,8,0,0,Math.PI*2),e.fill(),e.beginPath(),e.ellipse(10,r+25,6,8,0,0,Math.PI*2),e.fill()}t==="human"&&(e.fillStyle="#3a2a1a",e.beginPath(),e.arc(-10,r+22,4,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(10,r+22,4,0,Math.PI*2),e.fill(),e.strokeStyle="#3a2a1a",e.lineWidth=2,e.beginPath(),e.arc(0,r+32,10,.1*Math.PI,.9*Math.PI),e.stroke()),e.restore()}function Wn(e,t,a){const n=Ee[t].palette,o=t==="ghost",i=o?Math.sin(a*2.1+.5)*3:0;e.save(),e.translate(0,i),ct(e,o);const s=-60/2,r=T.torsoTop,c=T.torsoW,l=T.torsoH;if(ye(e,s,r,c,l,6,n.primary),o||Oe(e,s,r,c,l,6,n.secondary,2),t==="vampire"&&(e.fillStyle=n.secondary,e.globalAlpha*=.5,e.beginPath(),e.moveTo(s-5,r),e.lineTo(s-15,r+l),e.lineTo(s+c+15,r+l),e.lineTo(s+c+5,r),e.closePath(),e.fill(),e.globalAlpha/=.5),t==="robot"){e.strokeStyle=n.secondary,e.lineWidth=1.5,Oe(e,s+8,r+8,c-16,l-16,4,n.secondary,1.5),e.fillStyle=n.accent,e.beginPath(),e.arc(0,r+l/2,6,0,Math.PI*2),e.fill(),e.fillStyle="#ffffff",e.beginPath(),e.arc(0,r+l/2,2,0,Math.PI*2),e.fill();for(let d=1;d<=2;d++){const f=r+l/3*d;e.beginPath(),e.moveTo(s+8,f),e.lineTo(s+c-8,f),e.stroke()}}if(t==="werewolf"&&(dt(e,s,r,c,l,n.secondary),e.strokeStyle=n.accent,e.lineWidth=2,e.beginPath(),e.moveTo(-5,r+15),e.lineTo(5,r+30),e.stroke(),e.beginPath(),e.moveTo(5,r+15),e.lineTo(-5,r+30),e.stroke()),t==="ghost"){e.strokeStyle=n.accent,e.lineWidth=1.5;for(let d=-1;d<=1;d+=2)e.beginPath(),e.moveTo(d*20,r+10),e.quadraticCurveTo(d*28,r+l/2,d*20,r+l-10),e.stroke()}t==="human"&&(e.strokeStyle=n.secondary,e.lineWidth=2,e.beginPath(),e.moveTo(-12,r+5),e.lineTo(0,r+14),e.lineTo(12,r+5),e.stroke()),e.restore()}function Kn(e,t,a){const n=Ee[t].palette,o=t==="ghost",i=o?Math.sin(a*2.1+1)*3:0;for(const s of[-1,1]){e.save(),e.translate(s*T.armCx,i),ct(e,o);const r=s===-1?-20:0,c=T.armTop,l=T.armW,d=T.armH;if(ye(e,r,c,l,d,5,n.primary),o||Oe(e,r,c,l,d,5,n.secondary,2),t==="vampire"){e.fillStyle=n.secondary;const f=r+2;for(let m=0;m<3;m++)e.beginPath(),e.moveTo(f+m*6,c+d),e.lineTo(f+m*6+3,c+d+9),e.lineTo(f+m*6+6,c+d),e.fill()}if(t==="robot"&&(e.strokeStyle=n.secondary,e.lineWidth=1,e.beginPath(),e.moveTo(r+l/2,c+8),e.lineTo(r+l/2,c+d-8),e.stroke(),e.fillStyle=n.accent,e.beginPath(),e.arc(r+l/2,c+d-4,4,0,Math.PI*2),e.fill()),t==="werewolf"){dt(e,r,c,l,d,n.secondary),e.fillStyle=n.secondary;for(let f=0;f<4;f++)e.beginPath(),e.moveTo(r+f*5,c+d),e.lineTo(r+f*5+2,c+d+10),e.lineTo(r+f*5+4,c+d),e.fill()}if(t==="ghost"){e.strokeStyle=n.accent,e.lineWidth=1.5;for(let f=-1;f<=1;f++){const m=r+l/2+f*5;e.beginPath(),e.moveTo(m,c+d),e.quadraticCurveTo(m+f*6,c+d+10,m,c+d+18),e.stroke()}}if(t==="human"){e.strokeStyle=n.secondary,e.lineWidth=1;for(let f=0;f<3;f++)e.beginPath(),e.moveTo(r+4,c+d-10-f*6),e.lineTo(r+l-4,c+d-10-f*6),e.stroke()}e.restore()}}function $n(e,t,a){const n=Ee[t].palette,o=t==="ghost",i=o?Math.sin(a*2.1+1.5)*2:0;for(const s of[-1,1]){e.save(),e.translate(s*T.legCx,i),ct(e,o);const r=-22/2,c=T.legTop,l=T.legW,d=T.legH;if(ye(e,r,c,l,d,5,n.primary),o||Oe(e,r,c,l,d,5,n.secondary,2),t==="vampire"&&(e.fillStyle=n.secondary,e.beginPath(),e.moveTo(r,c+d-8),e.lineTo(r-7,c+d+4),e.lineTo(r+4,c+d-4),e.fill()),t==="robot"){e.strokeStyle=n.secondary,e.lineWidth=2,e.beginPath(),e.ellipse(r+l/2,c+d-10,l/2-2,5,0,0,Math.PI*2),e.stroke(),e.strokeStyle=n.accent,e.lineWidth=1;for(let f=0;f<3;f++)e.beginPath(),e.moveTo(r+3+f*5,c+d/2-4),e.lineTo(r+3+f*5,c+d/2+4),e.stroke()}t==="werewolf"&&(dt(e,r,c,l,d,n.secondary),e.fillStyle=n.secondary,e.beginPath(),e.moveTo(r+l/2-4,c+d),e.lineTo(r+l/2,c+d+10),e.lineTo(r+l/2+4,c+d),e.fill()),t==="ghost"&&(e.strokeStyle=n.accent,e.lineWidth=1.5,e.beginPath(),e.moveTo(r+l/2,c+d),e.quadraticCurveTo(r+l/2+s*8,c+d+12,r+l/2,c+d+20),e.stroke()),t==="human"&&(e.strokeStyle=n.secondary,e.lineWidth=2,e.beginPath(),e.moveTo(r,c+d-8),e.lineTo(r+l,c+d-8),e.stroke()),e.restore()}}function Fn(e){e.save(),e.strokeStyle="#39ff14",e.lineWidth=1.5,e.setLineDash([4,4]),e.lineDashOffset=0;const t=T.torsoW/2+4;e.beginPath(),e.moveTo(-t,T.seamY1),e.lineTo(t,T.seamY1),e.stroke(),e.beginPath(),e.moveTo(-62,T.seamY2),e.lineTo(T.armCx+T.armW/2+2,T.seamY2),e.stroke();for(const a of[-1,1]){const n=a*T.armCx;e.beginPath(),e.moveTo(n,T.armTop-4),e.lineTo(n,T.armTop+8),e.stroke()}e.setLineDash([]),e.restore()}function tt(e,t,a,n,o,i){e.save(),e.translate(a,n),e.scale(o,o),Kn(e,t.build.arms,i),$n(e,t.build.legs,i),Wn(e,t.build.torso,i),On(e,t.build.head,i),Fn(e),e.globalAlpha=1,e.restore()}const Ut={head:"vampire",torso:"robot",arms:"werewolf",legs:"ghost"};function Gn(){return{phase:{name:"TITLE"},seed:Bn.seed,elapsed:0,now:0,score:0,hp:100,maxHp:100,energy:0,wave:0}}function R(e,t){e.phase=t}function tn(e){const t=e.phase;switch(t.name){case"TITLE":R(e,{name:"STITCH",build:{...Ut},monster:ce(Ut)});break;case"STITCH":R(e,{name:"ZAP",build:t.build,monster:t.monster,charge:0});break;case"ZAP":R(e,{name:"SURVIVE",build:t.build,monster:t.monster,charge:t.charge}),e.hp=t.monster.stats.maxHp,e.maxHp=t.monster.stats.maxHp,e.energy=t.charge,e.wave=1,e.score=0;break;case"SURVIVE":R(e,{name:"END",score:e.score,wave:e.wave});break;case"END":R(e,{name:"TITLE"});break}}function qn(e,t,a){if(e.phase.name!=="STITCH")return;const n={...e.phase.build,[t]:a};e.phase={name:"STITCH",build:n,monster:ce(n)}}const jn=typeof window<"u"&&typeof AudioContext<"u",nn={get(e){try{return localStorage.getItem(e)}catch{return null}},set(e,t){try{localStorage.setItem(e,t)}catch{}}};let C=null,de=null,X=null,nt=null;const on="frankenlab.muted";let ot=nn.get(on)==="true";function ft(){if(jn){if(!C){C=new AudioContext,X=C.createDynamicsCompressor(),X.threshold.value=-18,X.knee.value=6,X.ratio.value=4,X.attack.value=.003,X.release.value=.25,de=C.createGain(),de.gain.value=ot?0:.85,de.connect(X),X.connect(C.destination);const e=C.sampleRate;nt=C.createBuffer(1,e,e);const t=nt.getChannelData(0);for(let a=0;a<e;a++)t[a]=Math.random()*2-1}C.state==="suspended"&&C.resume().catch(()=>{})}}function O(){return!C||C.state==="closed"?null:C}function ue(){return C?C.currentTime:0}function K(e){de&&e.connect(de)}function an(e,t,a,n,o){e.setValueAtTime(t,n),e.linearRampToValueAtTime(a,n+o)}function Mt(e,t,a,n,o,i){const s=O();if(!s||!nt)return null;const r=s.createBufferSource();r.buffer=nt,r.loop=!0;const c=s.createBiquadFilter();c.type="lowpass",c.frequency.value=i;const l=s.createGain();return l.gain.setValueAtTime(0,e),l.gain.linearRampToValueAtTime(a,e+n),l.gain.linearRampToValueAtTime(0,e+t),r.connect(c),c.connect(l),K(l),r.start(e),r.stop(e+t+o+.05),l}function Zn(){const e=O();if(!e)return;const t=ue();Mt(t,1.8,.9,.003,1.8,8e3);const a=e.createOscillator();a.type="sawtooth",an(a.frequency,42,18,t,2);const n=e.createGain();n.gain.setValueAtTime(0,t),n.gain.linearRampToValueAtTime(.5,t+.01),n.gain.exponentialRampToValueAtTime(1e-4,t+2.2);const o=e.createBiquadFilter();o.type="lowpass",o.frequency.value=120,a.connect(o),o.connect(n),K(n),a.start(t),a.stop(t+2.4)}function Xn(){const e=O();if(!e)return;const t=ue(),a=e.createOscillator();a.type="square",an(a.frequency,1200,80,t,.35);const n=e.createGain();n.gain.setValueAtTime(0,t),n.gain.linearRampToValueAtTime(.4,t+.005),n.gain.exponentialRampToValueAtTime(1e-4,t+.4),a.connect(n),K(n),a.start(t),a.stop(t+.45),Mt(t,.08,.5,.002,.08,4e3)}function Yn(){const e=O();if(!e)return;const t=ue(),a=[0,14,-12],n=90;for(const o of a){const i=e.createOscillator();i.type="sawtooth",i.detune.value=o,i.frequency.setValueAtTime(n*.6,t),i.frequency.linearRampToValueAtTime(n*1.3,t+.2),i.frequency.linearRampToValueAtTime(n*.8,t+1.4);const s=e.createGain();s.gain.setValueAtTime(0,t),s.gain.linearRampToValueAtTime(.28,t+.08),s.gain.linearRampToValueAtTime(.18,t+.9),s.gain.linearRampToValueAtTime(0,t+1.4),i.connect(s),K(s),i.start(t),i.stop(t+1.5)}Mt(t,1.2,.18,.05,1.1,2200)}function Jn(){const e=O();if(!e)return;const t=ue(),a=e.createOscillator();a.type="square",a.frequency.value=440;const n=e.createGain();n.gain.setValueAtTime(0,t),n.gain.linearRampToValueAtTime(.15,t+.004),n.gain.exponentialRampToValueAtTime(1e-4,t+.07),a.connect(n),K(n),a.start(t),a.stop(t+.08)}function rn(){const e=O();if(!e)return;const t=ue();[523.25,783.99].forEach((n,o)=>{const i=t+o*.07,s=e.createOscillator();s.type="triangle",s.frequency.value=n;const r=e.createGain();r.gain.setValueAtTime(0,i),r.gain.linearRampToValueAtTime(.18,i+.005),r.gain.exponentialRampToValueAtTime(1e-4,i+.15),s.connect(r),K(r),s.start(i),s.stop(i+.18)})}let P=null,B=null,Ot=0;function Qn(){if(P)return;const e=O();if(!e)return;const t=ue();P=e.createOscillator(),P.type="sawtooth",P.frequency.value=60;const a=e.createOscillator();a.type="sine",a.frequency.value=7;const n=e.createGain();n.gain.value=8,a.connect(n),n.connect(P.frequency),B=e.createGain(),B.gain.setValueAtTime(0,t),B.gain.linearRampToValueAtTime(.22,t+.3),P.connect(B),K(B),P.start(t),a.start(t),P._lfo=a}function ln(e){if(Ot=Math.max(0,Math.min(1,e)),!P||!C)return;const t=60,n=t+Ot*(1200-t);P.frequency.setTargetAtTime(n,C.currentTime,.05)}function sn(){if(!P||!C)return;const e=C.currentTime;B&&(B.gain.setValueAtTime(B.gain.value,e),B.gain.linearRampToValueAtTime(0,e+.15));const t=P._lfo,a=P,n=B;setTimeout(()=>{try{a.stop()}catch{}try{t?.stop()}catch{}n?.disconnect()},200),P=null,B=null}let fe=null,at=null;function eo(e){const t=O();if(!t)return;const a=t.createOscillator();a.type="sine",a.frequency.value=55;const n=t.createGain();n.gain.setValueAtTime(0,e),n.gain.linearRampToValueAtTime(.6,e+.012),n.gain.exponentialRampToValueAtTime(1e-4,e+.12),a.connect(n),K(n),a.start(e),a.stop(e+.14);const o=t.createOscillator();o.type="sine",o.frequency.value=48;const i=t.createGain(),s=e+.15;i.gain.setValueAtTime(0,s),i.gain.linearRampToValueAtTime(.4,s+.012),i.gain.exponentialRampToValueAtTime(1e-4,s+.1),o.connect(i),K(i),o.start(s),o.stop(s+.14)}function cn(){if(!fe)return;const t=300+(at?Math.max(0,Math.min(1,at())):1)*700;O()&&eo(ue()+.02),fe=setTimeout(cn,t)}function dn(e){fe===null&&(at=e,fe=setTimeout(cn,0))}function fn(){fe!==null&&(clearTimeout(fe),fe=null),at=null}const Wt=[110,123.47,130.81,146.83,164.81,174.61,196,220,246.94,261.63,293.66,329.63],to=105,Pe=60/to,no=.12,Kt=50;let te=null,Qe=0,it=0,pn=0;function Pt(e){pn=Math.max(0,e)}function yt(){if(!te)return;const e=O();if(!e){te=setTimeout(yt,Kt);return}const t=e.currentTime+no;for(;Qe<t;){const a=Qe,n=it%4;oo(e,a,n),Qe+=Pe,it++}te=setTimeout(yt,Kt)}function oo(e,t,a){const n=pn,o=.07+Math.min(n*.015,.12),i=a%2===0?2:n>=3?3:1;(a===0||a===2)&&ht(e,t,110,"triangle",.28,Pe*.9);for(let s=0;s<i;s++){const r=t+s/i*Pe,c=(it*i+s)%Wt.length,l=Wt[c]??220;ht(e,r,l,"sine",o,Pe*.4)}if(n>=5&&a===0){const s=.06+Math.min((n-5)*.01,.06);ht(e,t,55,"sawtooth",s,Pe*4)}}function ht(e,t,a,n,o,i){const s=e.createOscillator();s.type=n,s.frequency.value=a;const r=e.createGain(),c=.015,l=Math.min(.1,i*.2);r.gain.setValueAtTime(0,t),r.gain.linearRampToValueAtTime(o,t+c),r.gain.setValueAtTime(o,t+i-l),r.gain.linearRampToValueAtTime(0,t+i),s.connect(r),K(r),s.start(t),s.stop(t+i+.02)}function mn(){if(te!==null)return;const e=O();Qe=e?e.currentTime+.05:0,it=0,te=setTimeout(yt,0)}function un(){te!==null&&(clearTimeout(te),te=null)}function ao(e){ot=e,nn.set(on,String(e)),de&&C&&de.gain.setTargetAtTime(e?0:.85,C.currentTime,.05)}function io(){return ao(!ot),ot}function wt(){if(typeof window>"u")return null;const e=window;return e.SpeechRecognition??e.webkitSpeechRecognition??null}function hn(){return wt()!==null}function ro(){return typeof window<"u"&&"speechSynthesis"in window}function lo(e){const t=e.toLowerCase();return t.includes("alive")?{type:"awaken"}:t.includes("zap")?{type:"ability",slot:"head",effectKey:"rangedZap"}:t.includes("roar")?{type:"ability",slot:"torso",effectKey:"roarKnockback"}:t.includes("phase")?{type:"ability",slot:"legs",effectKey:"phaseDash"}:null}let re=null,Re=!1,Ie=null;function gn(e){if(!wt())return!1;if(re){Re=!1;try{re.abort()}catch{}re=null}Ie=e,Re=!0;function a(){if(!Re||!Ie)return;const n=wt();if(!n)return;const o=new n;re=o,o.continuous=!0,o.interimResults=!1,o.lang="en-US",o.onresult=i=>{try{for(let s=0;s<i.results.length;s++){const r=i.results[s];if(!r||!r.isFinal)continue;const c=r[0];if(!c)continue;const l=lo(c.transcript);l&&Ie&&Ie(l)}}catch{}},o.onerror=()=>{},o.onend=()=>{Re&&setTimeout(a,150)};try{o.start()}catch{}}return a(),!0}function Rt(){if(Re=!1,Ie=null,re){try{re.abort()}catch{}re=null}}const so={vampire:{pitch:.5,rate:.75},robot:{pitch:.9,rate:1.1},werewolf:{pitch:.4,rate:1.3},ghost:{pitch:1.8,rate:.65},human:{pitch:1,rate:1}};function co(e){return so[e]}const fo={vampire:"I hunger... for villagers! Also, do you have any garlic bread? Asking for a friend.",robot:"BOOT SEQUENCE COMPLETE. Emotions: none. Desire to stomp villagers: maximum.",werewolf:"YES! LEGS! I HAVE LEGS! WAIT — are those torches? Run. I mean, I mean CHARGE!",ghost:"Ooooh... I am AWAKE. Do not be alarmed. I am mostly harmless. Mostly.",human:"I feel... INCREDIBLE! Has anyone checked whether this is legal? No? Great, let's go!"};function po(e,t){if(ro())try{const a=window.speechSynthesis,n=co(t),o=new SpeechSynthesisUtterance(e);o.pitch=n.pitch,o.rate=n.rate,a.cancel(),a.speak(o)}catch{}}const bn="frankenlab.journal.v1",mo=["vampire","robot","werewolf","ghost","human"];function yn(){return{vampire:0,robot:0,werewolf:0,ghost:0,human:0}}function vt(){return{version:1,bestScore:0,totalRuns:0,monstersStitched:0,donorUsage:yn()}}function uo(e){const t=vt();if(e==null)return t;let a;try{a=JSON.parse(e)}catch{return t}if(typeof a!="object"||a===null||Array.isArray(a))return t;const n=a,o=typeof n.bestScore=="number"&&n.bestScore>=0?Math.floor(n.bestScore):0,i=typeof n.totalRuns=="number"&&n.totalRuns>=0?Math.floor(n.totalRuns):0,s=typeof n.monstersStitched=="number"&&n.monstersStitched>=0?Math.floor(n.monstersStitched):0,r=typeof n.donorUsage=="object"&&n.donorUsage!==null?n.donorUsage:{},c=yn();for(const l of mo){const d=r[l];typeof d=="number"&&d>=0&&(c[l]=Math.floor(d))}return{version:1,bestScore:o,totalRuns:i,monstersStitched:s,donorUsage:c}}function ho(e,t){return{...e,donorUsage:{...e.donorUsage},monstersStitched:e.monstersStitched+1}}function go(e,t,a){const n={...e.donorUsage},o=["head","torso","arms","legs"];for(const s of o){const r=a[s];n[r]=(n[r]??0)+1}const i=typeof t=="number"&&isFinite(t)?Math.max(0,t):0;return{...e,totalRuns:e.totalRuns+1,bestScore:Math.max(e.bestScore,i),donorUsage:n}}function pt(){try{if(typeof window>"u")return vt();const e=window.localStorage.getItem(bn);return uo(e)}catch{return vt()}}function wn(e){try{if(typeof window>"u")return;window.localStorage.setItem(bn,JSON.stringify(e))}catch{}}function bo(e){const t=ho(pt());wn(t)}function yo(e,t){const a=go(pt(),e,t);wn(a)}const wo=260;let G=[],Ye=16.67,ae=1;function le(e,t=1){return Math.max(t,Math.round(e*ae))}function be(e,t,a,n,o,i,s,r,c,l){const d=wo-G.length,f=Math.min(le(a),d);for(let m=0;m<f;m++)G.push({x:e,y:t,vx:n+(l()-.5)*i,vy:o+(l()-.5)*i,life:c,maxLife:c,r:r*(.6+l()*.8),color:s})}let It=!1,gt="",pe=!1,N=[],J=[],ke=0,Le=0,vn=0,Y=null,rt=!1;const _=[0,0,0,0];let q=0,se=0,Q=0,We=0,p=0,Te=!1,Se=!1,we=!1,lt=0,y=0,_t=0,xe=null,Ve=null,ze=null,He=null,De=null,Be=null;function kn(e){return{count:3+2*e,hp:26+10*(e-1),speed:34+5*(e-1)}}let Tn=null;function Sn(){return Tn}function vo(){return pe}function Cn(e){const t=e.phase;if(t.name!=="SURVIVE")return{wave:e.wave,hp:e.hp,maxHp:e.maxHp,energy:e.energy,maxEnergy:100,score:e.score,abilities:[],armsAbility:{name:"",cooldownFrac:0}};const a=t.monster,n=a.stats.maxEnergy,i=[{slot:"head",idx:0,key:"1"},{slot:"torso",idx:1,key:"2"},{slot:"legs",idx:3,key:"3"}].map(({slot:l,idx:d,key:f})=>{const m=a.abilities[d],b=_[d]??0,u=b>0?b/m.cooldownSec:0;return{slot:l,name:m.name,donorName:m.donor.charAt(0).toUpperCase()+m.donor.slice(1),keyHint:f,cooldownFrac:Math.max(0,Math.min(1,u)),ready:b<=0,affordable:e.energy>=20}}),s=a.abilities[2],r=_[2]??0,c=r>0?r/s.cooldownSec:0;return{wave:e.wave,hp:e.hp,maxHp:e.maxHp,energy:e.energy,maxEnergy:n,score:e.score,abilities:i,armsAbility:{name:s.name,cooldownFrac:Math.max(0,Math.min(1,c))}}}function ko(e,t){ge(e,t)}function ge(e,t){if(e.phase.name!=="SURVIVE")return;const a=e.phase.monster,n=t==="head"?0:t==="torso"?1:3,o=a.abilities[n];!o||(_[n]??0)>0||e.energy<20||(e.energy-=20,_[n]=o.cooldownSec,En(o.effectKey,e,a))}function En(e,t,a){const n=To(t);switch(e){case"lifeStealBite":{const o=F(p,240);if(!o)break;const i=V(o,n,t);t.hp=Math.min(t.maxHp,t.hp+i*.5),S("flash",o.x,p<o.x?o.x-20:o.x+20,y,30,.3,"#ff2244"),p=p<o.x?o.x-40:o.x+40;break}case"targetLock":{const o=$t(p,3,1/0);for(const i of o)i.marked=!0;S("flash",p,0,y,80,.5,"#00e5ff");break}case"terrifyingHowl":{for(const o of N)o.alive&&(o.freezeTimer=2.5);S("ring",p,0,y,200,.5,"#a0622a");break}case"spectralWail":{for(const o of N)o.alive&&(V(o,n*.6,t),t.energy=Math.min(a.stats.maxEnergy,t.energy+3));S("ring",p,0,y,300,.6,"#80ffe8");break}case"rallyCry":{q=6,S("flash",p,0,y,60,.5,"#ffe4c4");break}case"batSwarmBurst":{for(const o of N){if(!o.alive||Math.abs(o.x-p)>280)continue;V(o,n*.4,t);const i=o.x>p?1:-1;o.knockbackVx+=i*400}S("ring",p,0,y,180,.5,"#8b0000");break}case"chassisShieldBurst":{We=2,S("ring",p,0,y,60,.5,"#00e5ff");break}case"roarKnockback":{Yn();for(const o of N){if(!o.alive||Math.abs(o.x-p)>260)continue;V(o,n*.5,t);const i=o.x>p?1:-1;o.knockbackVx+=i*500}S("ring",p,0,y,180,.6,"#ffb300");break}case"incorporealShroud":{se=2.5,S("flash",p,0,y,70,.4,"#80ffe8");break}case"secondWind":{t.hp=Math.min(t.maxHp,t.hp+t.maxHp*.3),S("flash",p,0,y,60,.5,"#f0c08a");break}case"clawStrike":{const o=et();for(const i of N){if(!i.alive)continue;const s=i.x-p;Math.abs(s)>100||s*o<0||V(i,n,t)}S("flash",p+o*50,0,y,40,.2,"#d4c8e0");break}case"rangedZap":{Xn();const o=F(p,520);if(!o)break;V(o,n,t),Eo(p,o.x,y-80,y-40),be(o.x,y-40,le(8,1),0,-80,200,"#00e5ff",3,.35,Math.random.bind(Math));break}case"frenzySwipe":{const o=$t(p,3,110);for(const i of o)V(i,n,t);S("flash",p,0,y,55,.2,"#a0622a");break}case"hauntStrike":{const o=F(p,460);if(!o)break;V(o,n,t),S("tendril",p,o.x,y-40,8,.4,"#80ffe8"),be(o.x,y-40,le(6,1),0,-60,160,"#80ffe8",2,.4,Math.random.bind(Math));break}case"brawlerPunch":{const o=F(p,95);if(!o)break;V(o,n,t);const i=o.x>p?1:-1;o.knockbackVx+=i*350,S("flash",o.x,0,y,30,.2,"#f0c08a");break}case"mistDash":{const o=F(p,1/0),i=o?o.x>p?1:-1:et(),s=_e(p+i*200),r=Math.min(p,s),c=Math.max(p,s);Q=.3,p=s;for(const l of N)!l.alive||l.x<r||l.x>c||V(l,n*.4,t);S("ring",s,0,y,50,.3,"#d4c8e0");break}case"overdriveStomp":{for(const o of N)!o.alive||Math.abs(o.x-p)>140||(V(o,n*.6,t),o.stunTimer=2);S("stomp",p,0,y,140,.5,"#7a8490"),be(p,y,le(14,2),0,-50,300,"#7a8490",4,.5,Math.random.bind(Math));break}case"packLeap":{const o=Co(120);if(o===null)break;p=_e(o);for(const i of N)!i.alive||Math.abs(i.x-p)>120||V(i,n*.7,t);S("ring",p,0,y,120,.5,"#6b4423"),be(p,y,le(12,2),0,-40,260,"#8b6030",4,.5,Math.random.bind(Math));break}case"phaseDash":{const o=F(p,1/0);if(!o)break;const i=o.x>p?1:-1;p=_e(o.x-i*50),Q=.6,S("ring",p,0,y,50,.4,"#004d40");break}case"adrenalineSprint":{q=Math.max(q,3);const o=F(p,1/0),i=o?o.x>p?-1:1:et()*-1;p=_e(p+i*120),S("flash",p,0,y,50,.3,"#ffe4c4");break}}}function To(e){if(e.phase.name!=="SURVIVE")return 10;const t=e.phase.monster.stats.damage;return q>0?t*1.25:t}function V(e,t,a){if(!e.alive)return 0;const n=e.marked?t*2:t;return e.hp-=n,S("flash",e.x,0,y-20,20,.15,"#ff9900"),e.hp<=0&&So(e,a),n}function So(e,t){e.alive=!1,e.hp=0,t.score+=25,t.energy=Math.min(t.phase.name==="SURVIVE"?t.phase.monster.stats.maxEnergy:100,t.energy+4);const a=()=>Math.random();be(e.x,y-30,le(10,1),0,-120,180,"#7a9a7a",4,.6,a),be(e.x,y-20,le(5,1),0,-60,120,"#a09060",3,.4,a)}function F(e,t){let a=null,n=t;for(const o of N){if(!o.alive)continue;const i=Math.abs(o.x-e);i<n&&(n=i,a=o)}return a}function $t(e,t,a){return N.filter(n=>n.alive&&Math.abs(n.x-e)<=a).sort((n,o)=>Math.abs(n.x-e)-Math.abs(o.x-e)).slice(0,t)}function Co(e){const t=N.filter(o=>o.alive);if(t.length===0)return null;let a=t[0].x,n=0;for(const o of t){const i=t.filter(s=>Math.abs(s.x-o.x)<=e).length;i>n&&(n=i,a=o.x)}return a}function et(){const e=F(p,1/0);return e?e.x>=p?1:-1:1}function _e(e){return Math.max(40,Math.min(_t-40,e))}function S(e,t,a,n,o,i,s){J.push({kind:e,x:t,x2:a,y2:n,r:o,life:i,maxLife:i,color:s,y:n})}function Eo(e,t,a,n){J.push({kind:"bolt",x:e,y:a,x2:t,y2:n,r:3,life:.25,maxLife:.25,color:"#00e5ff"})}function An(e,t){ke=kn(e).count,Le=0,Y=Jt(t+e*7919),rt=!1}function Ao(e){if(ke<=0||!Y)return;ke--;const t=kn(e),a=(Y.next()-.5)*10,n=t.speed+a,o=Y.next()<.5,i=o?-20:_t+20,s=o?1:-1,r={id:vn++,x:i,y,hp:t.hp,maxHp:t.hp,speed:n,facing:s,alive:!0,attackCd:Y.next()*.4,stunTimer:0,freezeTimer:0,knockbackVx:0,marked:!1,torch:Y.next()<.6,flickerPhase:Y.next()*Math.PI*2};N.push(r)}function No(e,t){xe=a=>{switch(a.code){case"ArrowLeft":case"KeyA":Te=!0,a.preventDefault();break;case"ArrowRight":case"KeyD":Se=!0,a.preventDefault();break;case"Digit1":ge(e,"head");break;case"Digit2":ge(e,"torso");break;case"Digit3":ge(e,"legs");break}},Ve=a=>{switch(a.code){case"ArrowLeft":case"KeyA":Te=!1;break;case"ArrowRight":case"KeyD":Se=!1;break}},Be=a=>{a.code==="KeyP"&&e.phase.name==="SURVIVE"&&(a.preventDefault(),Po(e))},ze=a=>{if(e.phase.name!=="SURVIVE")return;const n=t.getBoundingClientRect();we=!0,lt=a.clientX-n.left,a.preventDefault()},De=a=>{if(!we)return;const n=t.getBoundingClientRect();lt=a.clientX-n.left},He=()=>{we=!1},window.addEventListener("keydown",xe),window.addEventListener("keyup",Ve),window.addEventListener("keydown",Be),t.addEventListener("pointerdown",ze),window.addEventListener("pointermove",De),window.addEventListener("pointerup",He),gn(a=>{if(e.phase.name!=="SURVIVE"||a.type!=="ability")return;const n=e.phase.monster,o=["head","torso","legs"];for(const i of o){const s=i==="head"?0:i==="torso"?1:3;if(n.abilities[s]?.effectKey===a.effectKey){ge(e,i);return}}(a.slot==="head"||a.slot==="torso"||a.slot==="legs")&&ge(e,a.slot)})}function Mo(e){xe&&window.removeEventListener("keydown",xe),Ve&&window.removeEventListener("keyup",Ve),Be&&window.removeEventListener("keydown",Be),ze&&e.removeEventListener("pointerdown",ze),De&&window.removeEventListener("pointermove",De),He&&window.removeEventListener("pointerup",He),xe=null,Ve=null,Be=null,ze=null,De=null,He=null}function Po(e){pe=!pe,pe?(fn(),un()):(dn(()=>e.hp/e.maxHp),mn(),Pt(e.wave))}function Ro(e){It=!0,pe=!1,N=[],J=[],G=[],ke=0,Le=0,vn=0,Y=null,rt=!1,_[0]=0,_[1]=0,_[2]=0,_[3]=0,q=0,se=0,Q=0,We=0,Te=!1,Se=!1,we=!1,p=typeof window<"u"?window.innerWidth/2:400,e.phase.name==="SURVIVE"&&bo(e.phase.build),dn(()=>e.hp/e.maxHp),mn(),Pt(e.wave),An(e.wave,e.seed);const t=typeof document<"u"?document.getElementById("game"):null;t&&No(e,t)}function Ft(){It=!1,pe=!1,fn(),un(),Rt();const e=typeof document<"u"?document.getElementById("game"):null;e&&Mo(e),Te=!1,Se=!1,we=!1,G=[]}function Io(e,t){const a=e.phase.name;if(a!==gt&&(gt==="SURVIVE"&&Ft(),a==="SURVIVE"&&Ro(e),gt=a),!It||a!=="SURVIVE")return;const n=t*1e3;if(Ye=Ye*.9+n*.1,Ye>19&&ae>.25?ae=Math.max(.25,ae*.85):Ye<13&&ae<1&&(ae=Math.min(1,ae+.05)),pe){e.phase.name!=="SURVIVE"&&Ft();return}const o=e.phase.monster,i=typeof document<"u"?document.getElementById("game"):null;if(i){const l=window.devicePixelRatio??1;_t=i.width/l,y=i.height/l*.8}const s=o.stats.speed*(q>0?1.25:1);if(Te&&!Se&&(p-=s*t),Se&&!Te&&(p+=s*t),we){const l=lt-p,d=s*t;Math.abs(l)>d?p+=Math.sign(l)*d:p=lt}p=_e(p);for(let l=0;l<4;l++)(_[l]??0)>0&&(_[l]=Math.max(0,(_[l]??0)-t));q>0&&(q=Math.max(0,q-t)),se>0&&(se=Math.max(0,se-t)),Q>0&&(Q=Math.max(0,Q-t)),e.energy=Math.min(o.stats.maxEnergy,e.energy+5*t),ke>0&&(Le-=t,Le<=0&&(Ao(e.wave),Le=1.1));for(const l of N){if(!l.alive)continue;l.stunTimer>0&&(l.stunTimer=Math.max(0,l.stunTimer-t)),l.freezeTimer>0&&(l.freezeTimer=Math.max(0,l.freezeTimer-t));const d=l.stunTimer>0||l.freezeTimer>0;if(l.knockbackVx!==0){l.x+=l.knockbackVx*t;const m=Math.sign(l.knockbackVx)*Math.min(Math.abs(l.knockbackVx),1200*t);l.knockbackVx-=m,Math.abs(l.knockbackVx)<1&&(l.knockbackVx=0)}if(!d&&l.knockbackVx===0){const m=p-l.x;Math.abs(m)>2&&(l.x+=Math.sign(m)*l.speed*t,l.facing=m>0?1:-1)}if(!d&&Math.abs(l.x-p)<55){if(l.attackCd-=t,l.attackCd<=0&&(l.attackCd=.8,!(se>0||Q>0))){if(We>0)We--,S("ring",p,0,y,50,.2,"#00e5ff");else if(e.hp=Math.max(0,e.hp-8),e.hp<=0){e.hp=0,e.phase.name==="SURVIVE"&&(Tn={build:e.phase.build,monster:e.phase.monster},yo(e.score,e.phase.build)),tn(e);return}}}else l.attackCd<.4&&(l.attackCd=.4)}const r=o.abilities[2];if(r&&(_[2]??0)<=0){const d=_o(r.effectKey);F(p,d)&&(_[2]=r.cooldownSec,En(r.effectKey,e,o))}for(const l of J)l.life-=t;for(let l=J.length-1;l>=0;l--)(J[l]?.life??0)<=0&&J.splice(l,1);const c=300;for(const l of G)l.vy+=c*t,l.x+=l.vx*t,l.y+=l.vy*t,l.life-=t;for(let l=G.length-1;l>=0;l--)(G[l]?.life??0)<=0&&G.splice(l,1);!rt&&ke===0&&N.every(l=>!l.alive)&&(rt=!0,e.score+=25*e.wave,e.wave++,Pt(e.wave),N=[],An(e.wave,e.seed))}function _o(e){switch(e){case"rangedZap":return 520;case"hauntStrike":return 460;case"frenzySwipe":return 110;case"clawStrike":return 100;case"brawlerPunch":return 95;default:return 100}}function Lo(e,t,a,n,o){if(t.phase.name!=="SURVIVE")return;const i=t.elapsed/1e3,s=t.phase.monster,r=n*.8;xo(e,a,n,r,i,o);for(const u of N)u.alive&&Ho(e,u,r,i,o);const c=p*o,l=r,f=Math.min(n*.42/190,1.6*o),m=se>0||Q>0;e.save(),m&&(e.globalAlpha=.4),et()===-1?(e.save(),e.translate(c*2,0),e.scale(-1,1),tt(e,s,c,l,f,i),e.restore()):tt(e,s,c,l,f,i),e.restore(),We>0&&(e.save(),e.strokeStyle="#00e5ff",e.lineWidth=3*o,e.globalAlpha=.7+Math.sin(i*6)*.2,e.beginPath(),e.arc(c,l-80*o,70*o,0,Math.PI*2),e.stroke(),e.globalAlpha=1,e.restore());for(const u of N)!u.alive||!u.marked||Oo(e,u.x*o,r-30*o,18*o,i);for(const u of J)Uo(e,u,o);for(const u of G){if(u.life<=0)continue;const h=Math.max(0,u.life/u.maxLife);e.save(),e.globalAlpha=h,e.fillStyle=u.color;const w=u.x*o,v=u.y*o,k=u.r*o;e.beginPath(),e.arc(w,v,k,0,Math.PI*2),e.fill(),e.restore()}}function xo(e,t,a,n,o,i){const s=36*i,r=t*.82,c=a*.12;e.save(),e.fillStyle="#e8e0c0",e.shadowColor="#ffe8a0",e.shadowBlur=30*i,e.beginPath(),e.arc(r,c,s,0,Math.PI*2),e.fill(),e.shadowBlur=0,e.restore();const l=e.createLinearGradient(0,n,0,a);l.addColorStop(0,"#1a2a1a"),l.addColorStop(1,"#0a0f0a"),e.fillStyle=l,e.fillRect(0,n,t,a-n),e.strokeStyle="#2a4a2a",e.lineWidth=2,e.beginPath(),e.moveTo(0,n),e.lineTo(t,n),e.stroke(),Vo(e,t,n,i),zo(e,t,n,i)}function Vo(e,t,a,n){const o=6*n,i=42*n,s=a-i*.6,r=32*n;e.fillStyle="#1c2c1c",e.strokeStyle="#2a4a2a",e.lineWidth=1,e.fillRect(0,s,t,4*n);for(let c=0;c<t;c+=r)e.fillRect(c,a-i,o,i),e.beginPath(),e.moveTo(c,a-i),e.lineTo(c+o/2,a-i-8*n),e.lineTo(c+o,a-i),e.fill()}function zo(e,t,a,n){const o=[.12,.32,.65,.88];for(const i of o){const s=t*i,r=22*n,c=32*n;e.fillStyle="#1a2420",e.strokeStyle="#2a4a2a",e.lineWidth=1,e.beginPath(),e.roundRect(s-r/2,a-c,r,c,[r/2,r/2,2,2]),e.fill(),e.stroke()}}function Ho(e,t,a,n,o){const i=t.x*o,s=a,r=o;e.save(),t.freezeTimer>0&&(e.globalAlpha=.7,e.filter="hue-rotate(180deg) brightness(1.5)"),t.stunTimer>0&&(e.fillStyle="#ffdd00",e.font=`${10*r}px Courier New`,e.textAlign="center",e.fillText("★",i,s-68*r)),e.fillStyle="#5a4030",e.strokeStyle="#3a2820",e.lineWidth=1.5,e.beginPath(),e.roundRect(i-10*r,s-50*r,20*r,30*r,3),e.fill(),e.stroke(),e.fillStyle="#c8a070",e.beginPath(),e.arc(i,s-60*r,11*r,0,Math.PI*2),e.fill(),e.stroke(),e.strokeStyle="#3a2820",e.lineWidth=4*r,e.beginPath(),e.moveTo(i-5*r,s-20*r),e.lineTo(i-6*r,s),e.stroke(),e.beginPath(),e.moveTo(i+5*r,s-20*r),e.lineTo(i+6*r,s),e.stroke(),t.torch?Do(e,i+t.facing*14*r,s-40*r,n+t.flickerPhase,r):Bo(e,i+t.facing*14*r,s-40*r,t.facing,r);const c=28*r,l=Math.max(0,t.hp/t.maxHp);e.fillStyle="#330000",e.fillRect(i-c/2,s-78*r,c,4*r),e.fillStyle=l>.5?"#39ff14":l>.25?"#ffb300":"#ff3c3c",e.fillRect(i-c/2,s-78*r,c*l,4*r),e.restore()}function Do(e,t,a,n,o){e.strokeStyle="#6b4423",e.lineWidth=3*o,e.beginPath(),e.moveTo(t,a),e.lineTo(t,a+20*o),e.stroke();const i=Math.sin(n*14)*3,s=e.createRadialGradient(t,a-6*o,2,t,a,10*o);s.addColorStop(0,"#ffffa0"),s.addColorStop(.4,"#ff8c00"),s.addColorStop(1,"rgba(255,60,0,0)"),e.fillStyle=s,e.beginPath(),e.ellipse(t,a-4*o+i,(5+Math.abs(i)*.3)*o,9*o,0,0,Math.PI*2),e.fill()}function Bo(e,t,a,n,o){e.strokeStyle="#7a6050",e.lineWidth=2.5*o,e.beginPath(),e.moveTo(t,a),e.lineTo(t,a+20*o),e.stroke(),e.lineWidth=2*o;for(const i of[-5,0,5])e.beginPath(),e.moveTo(t+i*o,a),e.lineTo(t+i*o,a-14*o),e.stroke();e.beginPath(),e.moveTo(t-5*o,a-8*o),e.lineTo(t+5*o,a-8*o),e.stroke()}function Uo(e,t,a){const n=Math.max(0,t.life/t.maxLife);e.save(),e.globalAlpha=n;const o=t.x*a,i=t.y2??t.y,s=(t.x2??t.x)*a;switch(t.kind){case"flash":{const r=t.r*a,c=e.createRadialGradient(o,i,0,o,i,r);c.addColorStop(0,t.color),c.addColorStop(1,"transparent"),e.fillStyle=c,e.beginPath(),e.arc(o,i,r,0,Math.PI*2),e.fill();break}case"ring":{const r=1-n,c=t.r*a*(.3+r*.7);e.strokeStyle=t.color,e.lineWidth=3*a*n,e.beginPath(),e.arc(o,i,c,0,Math.PI*2),e.stroke();break}case"bolt":{const r=o,c=t.y,l=s,d=t.y2??t.y;e.strokeStyle=t.color,e.lineWidth=t.r*a*n,e.shadowColor=t.color,e.shadowBlur=8*a,e.beginPath(),e.moveTo(r,c);const f=5;for(let m=1;m<f;m++){const b=m/f,u=r+(l-r)*b+(Math.random()-.5)*20*a,h=c+(d-c)*b+(Math.random()-.5)*10*a;e.lineTo(u,h)}e.lineTo(l,d),e.stroke(),e.shadowBlur=0;break}case"tendril":{const r=o,c=t.y,l=s,d=t.y2??t.y,f=(r+l)/2+(Math.random()-.5)*30*a,m=(c+d)/2-20*a;e.strokeStyle=t.color,e.lineWidth=t.r*a*n*.5,e.shadowColor=t.color,e.shadowBlur=6*a,e.beginPath(),e.moveTo(r,c),e.quadraticCurveTo(f,m,l,d),e.stroke(),e.shadowBlur=0;break}case"stomp":{const r=1-n,c=t.r*a*(.5+r*.5);e.strokeStyle=t.color,e.lineWidth=5*a*n,e.beginPath(),e.ellipse(o,i,c,c*.25,0,0,Math.PI*2),e.stroke();break}}e.restore()}function Oo(e,t,a,n,o){e.save(),e.strokeStyle="#00e5ff",e.lineWidth=1.5,e.globalAlpha=.8+Math.sin(o*8)*.15,e.translate(t,a),e.rotate(o*1.5);const i=n*.4;for(let s=0;s<4;s++)e.save(),e.rotate(s*Math.PI/2),e.beginPath(),e.moveTo(n,-i),e.lineTo(n,0),e.lineTo(n-i,0),e.stroke(),e.restore();e.restore()}const he={head:"vampire",torso:"robot",arms:"werewolf",legs:"ghost"},Wo={TITLE:{bg:"#0a0d0f",label:"TITLE",color:"#39ff14"},STITCH:{bg:"#0d0a14",label:"STITCH",color:"#c77dff"},ZAP:{bg:"#0a0f0a",label:"ZAP",color:"#ffb300"},SURVIVE:{bg:"#0d0505",label:"SURVIVE",color:"#ff3c3c"},END:{bg:"#050505",label:"END",color:"#00e5cc"}};function Ko(e){const t=window.devicePixelRatio??1,a=e.getBoundingClientRect(),n=Math.round(a.width*t),o=Math.round(a.height*t);(e.width!==n||e.height!==o)&&(e.width=n,e.height=o)}function $o(e,t,a,n){e.strokeStyle="rgba(255,255,255,0.03)",e.lineWidth=1;const o=40*n;for(let i=0;i<t;i+=o)e.beginPath(),e.moveTo(i,0),e.lineTo(i,a),e.stroke();for(let i=0;i<a;i+=o)e.beginPath(),e.moveTo(0,i),e.lineTo(t,i),e.stroke()}function Fo(e,t,a,n,o,i){if(t.phase.name!=="STITCH")return;const s=a*.5,r=s/2,c=Math.min(s*.7,240*o),l=18*o,d=r-c/2,f=n*.72;e.fillStyle="#1a2a1a",e.strokeStyle="#2a4a2a",e.lineWidth=2,e.beginPath(),e.roundRect(d,f,c,l,4),e.fill(),e.stroke(),e.strokeStyle="#2a3a2a",e.lineWidth=3;for(const W of[d+12*o,d+c-12*o])e.beginPath(),e.moveTo(W,f+l),e.lineTo(W,f+l+28*o),e.stroke();const m=n*.08,b=c*.55,u=.85+Math.sin(i*1.4)*.08,h=e.createRadialGradient(r,m,0,r,m,b);h.addColorStop(0,`rgba(200, 240, 180, ${.22*u})`),h.addColorStop(.4,`rgba(150, 220, 120, ${.1*u})`),h.addColorStop(1,"rgba(0, 0, 0, 0)"),e.fillStyle=h,e.beginPath(),e.ellipse(r,f/2+m/2,b,(f-m)*.9,0,0,Math.PI*2),e.fill(),e.fillStyle="#39ff14",e.beginPath(),e.arc(r,m,5*o,0,Math.PI*2),e.fill(),e.strokeStyle="#2a4a2a",e.lineWidth=2,e.beginPath(),e.moveTo(r,0),e.lineTo(r,m),e.stroke();const v=Math.min(n*.58/190/o,1.6)*o,k=r,E=f;tt(e,t.phase.monster,k,E,v,i);const $=Math.round(10*o);e.font=`${$}px 'Courier New', Courier, monospace`,e.textAlign="center",e.textBaseline="top",e.fillStyle="rgba(85, 102, 85, 0.6)",e.fillText("▸ OPERATING TABLE ◂",r,f+l+32*o)}function Go(e,t,a,n,o,i){if(t.phase.name!=="ZAP")return;const s=a/2,r=a*.35,c=.85+Math.sin(i*2.2)*.12,l=e.createRadialGradient(s,n*.1,0,s,n*.1,r);l.addColorStop(0,`rgba(255,179,0,${.18*c})`),l.addColorStop(.5,`rgba(255,100,0,${.08*c})`),l.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=l,e.fillRect(0,0,a,n);const d=190,f=n*.52,m=Math.min(n*.42/d/o,1.6)*o;tt(e,t.phase.monster,s,f,m,i)}function qo(e,t,a,n,o,i){const s=Math.round(Math.min(a,n)*.12);e.font=`bold ${s}px 'Courier New', Courier, monospace`,e.textAlign="center",e.textBaseline="middle",e.shadowColor=t.color,e.shadowBlur=s*.4,e.fillStyle=t.color,e.fillText(t.label,a/2,n/2),e.shadowBlur=0,e.fillStyle="#ffffff",e.globalAlpha=.85,e.fillText(t.label,a/2,n/2),e.globalAlpha=1;const r=Math.round(s*.18);e.font=`${r}px 'Courier New', Courier, monospace`,e.fillStyle="rgba(255,255,255,0.3)",e.fillText(`SEED: ${o}  T: ${Math.floor(i/1e3)}s`,a/2,n/2+s*.75)}function jo(e,t){Ko(e);const a=e.getContext("2d");if(!a)return;const n=window.devicePixelRatio??1,o=e.width,i=e.height,s=t.phase.name,r=Wo[s],c=t.elapsed/1e3;a.fillStyle=r.bg,a.fillRect(0,0,o,i),$o(a,o,i,n),s==="STITCH"?Fo(a,t,o,i,n,c):s==="ZAP"?Go(a,t,o,i,n,c):s==="SURVIVE"?Lo(a,t,o,i,n):s==="END"&&qo(a,r,o,i,t.seed,t.elapsed)}function Zo(e){const t=a=>{if(e.phase.name!=="SURVIVE")switch(a.key){case"1":R(e,{name:"TITLE"});break;case"2":{const n=ce(he);R(e,{name:"STITCH",build:he,monster:n});break}case"3":{const n=ce(he);R(e,{name:"ZAP",build:he,monster:n,charge:0});break}case"4":{const n=ce(he);R(e,{name:"SURVIVE",build:he,monster:n,charge:80});break}case"5":R(e,{name:"END",score:e.score,wave:e.wave});break}};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)}const Xo=["head","torso","arms","legs"],Yo=["vampire","robot","werewolf","ghost","human"];let j="",ee="",Gt=!1;function Nn(){if(Gt)return;Gt=!0;const e=document.createElement("style");e.textContent=`
/* ── TITLE screen ─────────────────────────────────────────────────────── */
.fl-title-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  pointer-events: all;
  gap: 18px;
  padding: 24px;
  text-align: center;
}
.fl-title-logo {
  font-size: clamp(2rem, 7vw, 4.5rem);
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #39ff14;
  text-shadow:
    0 0 24px #39ff14,
    0 0 60px #39ff14aa;
  animation: fl-logo-pulse 3s ease-in-out infinite;
}

@keyframes fl-logo-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.75; }
}

.fl-title-logo span {
  color: #ffb300;
  text-shadow:
    0 0 24px #ffb300,
    0 0 60px #ffb300aa;
}

.fl-title-pitch {
  max-width: 540px;
  font-size: clamp(0.7rem, 2vw, 0.95rem);
  font-family: 'Courier New', Courier, monospace;
  color: #c8d8c0;
  line-height: 1.6;
  letter-spacing: 0.05em;
}

.fl-title-btn {
  margin-top: 12px;
  padding: 14px 40px;
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(0.85rem, 2.2vw, 1.1rem);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #0a0d0f;
  background: #39ff14;
  border: none;
  cursor: pointer;
  clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  box-shadow: 0 0 20px #39ff14aa;
  transition: background 0.15s, box-shadow 0.15s;
}

.fl-title-btn:hover,
.fl-title-btn:focus {
  background: #80ff50;
  box-shadow: 0 0 32px #39ff14;
  outline: none;
}

/* ── STITCH screen ────────────────────────────────────────────────────── */
.fl-stitch-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  pointer-events: all;
  overflow: hidden;
}

/* Right panel — part picker, 50 % width on wide screens */
.fl-stitch-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 50%;
  min-width: 300px;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  background: rgba(10, 13, 15, 0.92);
  border-left: 2px solid #2a3a2a;
  overflow-y: auto;
  padding: 14px 14px 0;
  gap: 10px;
  z-index: 2;
  pointer-events: all;
}

/* ── Slot rows ── */
.fl-slot-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fl-slot-label {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #556655;
  padding-left: 2px;
}

.fl-donor-cards {
  display: flex;
  gap: 5px;
  flex-wrap: nowrap;
}

/* Individual donor card */
.fl-card {
  flex: 1 1 0;
  min-width: 0;
  padding: 7px 4px 6px;
  background: #111518;
  border: 1.5px solid #2a3a2a;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.1s, background 0.1s;
  display: flex;
  flex-direction: column;
  gap: 3px;
  user-select: none;
  pointer-events: all;
}

.fl-card:hover {
  border-color: #556655;
  background: #161c1a;
}

.fl-card.selected {
  border-color: #39ff14;
  background: #0d1a0d;
  box-shadow: 0 0 8px #39ff1455;
}

.fl-card-name {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c8d8c0;
  font-family: 'Courier New', Courier, monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fl-card.selected .fl-card-name {
  color: #39ff14;
}

.fl-card-ability {
  font-size: 0.52rem;
  color: #556655;
  font-family: 'Courier New', Courier, monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fl-card.selected .fl-card-ability {
  color: #39ff1499;
}

/* ── Ability list ── */
.fl-ability-section {
  border-top: 1px solid #2a3a2a;
  padding-top: 10px;
  margin-top: 2px;
}

.fl-ability-section-title {
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: #556655;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.fl-ability-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fl-ability-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fl-ability-name {
  font-size: 0.72rem;
  color: #c77dff;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.08em;
}

.fl-ability-desc {
  font-size: 0.6rem;
  color: #778877;
  font-family: 'Courier New', Courier, monospace;
  line-height: 1.4;
}

/* ── Stats bar ── */
.fl-stats-section {
  border-top: 1px solid #2a3a2a;
  padding-top: 10px;
  margin-top: 2px;
}

.fl-stats-title {
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: #556655;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.fl-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 14px;
}

.fl-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fl-stat-label {
  font-size: 0.55rem;
  color: #556655;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-family: 'Courier New', Courier, monospace;
}

.fl-stat-value {
  font-size: 0.75rem;
  color: #ffb300;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.08em;
}

/* ── To-the-coil button ── */
.fl-coil-btn-wrap {
  padding: 12px 0 16px;
  display: flex;
  justify-content: flex-end;
}

.fl-coil-btn {
  padding: 12px 24px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #0a0d0f;
  background: #ffb300;
  border: none;
  cursor: pointer;
  clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  box-shadow: 0 0 16px #ffb30099;
  transition: background 0.15s, box-shadow 0.15s;
}

.fl-coil-btn:hover,
.fl-coil-btn:focus {
  background: #ffd040;
  box-shadow: 0 0 28px #ffb300;
  outline: none;
}

/* ── Responsive: narrow viewport ── */
@media (max-width: 600px) {
  .fl-stitch-panel {
    width: 100%;
    max-width: 100%;
    border-left: none;
    border-top: 2px solid #2a3a2a;
    top: auto;
    height: 65%;
  }
  .fl-card-ability { display: none; }
}

@media (max-width: 480px) {
  .fl-stitch-panel {
    padding: 10px 8px 0;
    gap: 7px;
  }
  .fl-donor-cards {
    gap: 3px;
  }
  .fl-card {
    padding: 5px 2px 4px;
  }
  .fl-card-name {
    font-size: 0.55rem;
  }
  .fl-coil-btn {
    font-size: 0.75rem;
    padding: 10px 16px;
  }
}

/* ── Lab Journal panel (title screen) ── */
.fl-journal-panel {
  border: 1px solid #2a3a2a;
  border-radius: 4px;
  padding: 10px 20px;
  background: rgba(10, 20, 10, 0.55);
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
}

.fl-journal-title {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #556655;
  margin-bottom: 2px;
}

.fl-journal-row {
  display: flex;
  justify-content: space-between;
  gap: 24px;
}

.fl-journal-label {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #3a5a3a;
}

.fl-journal-value {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.72rem;
  color: #ffb300;
  letter-spacing: 0.08em;
  text-shadow: 0 0 8px #ffb30055;
}
  `,document.head.appendChild(e)}function Jo(e,t){const a=pt(),n=`${a.bestScore}:${a.totalRuns}:${a.monstersStitched}`;if(j==="TITLE"&&ee===n)return;j="TITLE",ee=n,Nn(),e.innerHTML="";const o=document.createElement("div");o.className="fl-title-screen";const i=document.createElement("div");i.className="fl-title-logo",i.innerHTML="FRANKEN<span>-LAB</span>";const s=document.createElement("p");s.className="fl-title-pitch",s.textContent="Stitch a monster from vampire, robot, werewolf and ghost parts, shout it alive with your real voice, then defend the lab against the villagers — every sound, voice and animation is generated in the browser, zero assets.";const r=document.createElement("div");r.className="fl-journal-panel";const c=document.createElement("div");c.className="fl-journal-title",c.textContent="LAB JOURNAL",r.appendChild(c);const l=[["BEST SCORE",a.bestScore],["RUNS",a.totalRuns],["MONSTERS STITCHED",a.monstersStitched]];for(const[f,m]of l){const b=document.createElement("div");b.className="fl-journal-row";const u=document.createElement("span");u.className="fl-journal-label",u.textContent=f;const h=document.createElement("span");h.className="fl-journal-value",h.textContent=String(m),b.appendChild(u),b.appendChild(h),r.appendChild(b)}const d=document.createElement("button");d.className="fl-title-btn",d.textContent="ENTER THE LAB",d.addEventListener("click",()=>{j="",ee="",R(t,{name:"STITCH",build:{head:"vampire",torso:"robot",arms:"werewolf",legs:"ghost"},monster:ce({head:"vampire",torso:"robot",arms:"werewolf",legs:"ghost"})})}),o.appendChild(i),o.appendChild(s),o.appendChild(r),o.appendChild(d),e.appendChild(o)}function Mn(e,t){if(t.phase.name!=="STITCH")return;const{build:a,monster:n}=t.phase,o=`${a.head}-${a.torso}-${a.arms}-${a.legs}`;if(j==="STITCH"&&ee===o)return;j="STITCH",ee=o,Nn(),e.innerHTML="";const i=document.createElement("div");i.className="fl-stitch-panel";for(const h of Xo){const w=document.createElement("div");w.className="fl-slot-row";const v=document.createElement("div");v.className="fl-slot-label",v.textContent=h.toUpperCase();const k=document.createElement("div");k.className="fl-donor-cards";for(const E of Yo){const $=Qt[`${E}_${h}`],W=Ee[E],L=a[h]===E,A=document.createElement("div");A.className="fl-card"+(L?" selected":""),A.setAttribute("role","button"),A.setAttribute("aria-pressed",String(L)),A.setAttribute("tabindex","0");const I=document.createElement("div");I.className="fl-card-name",I.textContent=W.name;const D=document.createElement("div");D.className="fl-card-ability",D.textContent=$?.ability.name??"",A.appendChild(I),A.appendChild(D);const Ae=()=>{qn(t,h,E),j="",ee="",Mn(e,t)};A.addEventListener("click",Ae),A.addEventListener("keydown",x=>{(x.key==="Enter"||x.key===" ")&&(x.preventDefault(),Ae())}),k.appendChild(A)}w.appendChild(v),w.appendChild(k),i.appendChild(w)}const s=document.createElement("div");s.className="fl-ability-section";const r=document.createElement("div");r.className="fl-ability-section-title",r.textContent="ABILITIES";const c=document.createElement("div");c.className="fl-ability-list";for(const h of n.abilities){const w=document.createElement("div");w.className="fl-ability-item";const v=document.createElement("div");v.className="fl-ability-name",v.textContent=`▸ ${h.name}`;const k=document.createElement("div");k.className="fl-ability-desc",k.textContent=h.description,w.appendChild(v),w.appendChild(k),c.appendChild(w)}s.appendChild(r),s.appendChild(c),i.appendChild(s);const l=document.createElement("div");l.className="fl-stats-section";const d=document.createElement("div");d.className="fl-stats-title",d.textContent="RESOLVED STATS";const f=document.createElement("div");f.className="fl-stats-grid";const m=[["HP",n.stats.maxHp],["DAMAGE",n.stats.damage],["SPEED",n.stats.speed],["ENERGY",n.stats.maxEnergy]];for(const[h,w]of m){const v=document.createElement("div");v.className="fl-stat";const k=document.createElement("div");k.className="fl-stat-label",k.textContent=h;const E=document.createElement("div");E.className="fl-stat-value",E.textContent=String(w),v.appendChild(k),v.appendChild(E),f.appendChild(v)}l.appendChild(d),l.appendChild(f),i.appendChild(l);const b=document.createElement("div");b.className="fl-coil-btn-wrap";const u=document.createElement("button");u.className="fl-coil-btn",u.textContent="TO THE COIL →",u.addEventListener("click",()=>{j="",ee="",t.phase.name==="STITCH"&&R(t,{name:"ZAP",build:t.phase.build,monster:t.phase.monster,charge:0})}),b.appendChild(u),i.appendChild(b),e.appendChild(i)}function Qo(e){j!=="CLEAR"&&(j="CLEAR",ee="",e.innerHTML="")}let qt=!1;function ea(){if(qt)return;qt=!0;const e=document.createElement("style");e.textContent=`
/* ── ZAP screen ──────────────────────────────────────────────────────── */
.fl-zap-screen {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

/* Stack container — absolutely positioned using height-relative coords so
   the controls always sit in the lower ~44 % of the screen regardless of
   viewport width. 'top: 56%' resolves against the element's own height
   (which equals the viewport height when inset:0 is in force). */
.fl-zap-stack {
  position: absolute;
  top: 56%;
  left: 0;
  right: 0;
  bottom: clamp(16px, 4vh, 48px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  overflow: visible;
  pointer-events: none;
}

/* coil charge bar track */
.fl-zap-track {
  width: min(480px, 80vw);
  height: 36px;
  background: rgba(10,15,10,0.85);
  border: 2px solid #2a4a2a;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 12px rgba(57,255,20,0.2);
}

/* fill bar */
.fl-zap-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 0%;
  background: linear-gradient(90deg, #39ff14 0%, #ffb300 70%, #ff4400 100%);
  transition: width 0.03s linear;
  box-shadow: 0 0 10px #39ff1488;
}

/* target zone (green band) */
.fl-zap-target {
  position: absolute;
  top: 0; bottom: 0;
  left: 60%;
  width: 30%;
  background: rgba(57,255,20,0.12);
  border-left:  1px solid rgba(57,255,20,0.4);
  border-right: 1px solid rgba(57,255,20,0.4);
}

/* perfect zone (amber band, inner 10%) */
.fl-zap-perfect-zone {
  position: absolute;
  top: 0; bottom: 0;
  left: 90%;
  width: 10%;
  background: rgba(255,179,0,0.18);
  border-left: 1px solid rgba(255,179,0,0.5);
}

/* percent label inside bar */
.fl-zap-pct {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  color: rgba(255,255,255,0.75);
  user-select: none;
  mix-blend-mode: overlay;
}

/* instruction text */
.fl-zap-instruction {
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(0.7rem, 1.8vw, 0.95rem);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c8d8c0;
  text-align: center;
  pointer-events: none;
}

/* hold button */
.fl-zap-hold-btn {
  pointer-events: all;
  padding: 16px 48px;
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(0.85rem, 2vw, 1.1rem);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #0a0d0f;
  background: #39ff14;
  border: none;
  cursor: pointer;
  clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  box-shadow: 0 0 20px #39ff14aa;
  user-select: none;
  -webkit-user-select: none;
  transition: background 0.1s, box-shadow 0.1s;
}

.fl-zap-hold-btn:active,
.fl-zap-hold-btn.fl-held {
  background: #ffb300;
  box-shadow: 0 0 32px #ffb300;
}

/* voice status */
.fl-zap-voice-status {
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(0.6rem, 1.4vw, 0.78rem);
  letter-spacing: 0.1em;
  color: #556655;
  text-align: center;
  pointer-events: none;
}

.fl-zap-voice-status.fl-voice-active {
  color: #39ff14;
  animation: fl-voice-pulse 1.2s ease-in-out infinite;
}

@keyframes fl-voice-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

@media (max-width: 480px) {
  .fl-zap-hold-btn {
    padding: 14px 32px;
    font-size: 0.9rem;
  }
  .fl-zap-stack {
    gap: 10px;
    bottom: clamp(8px, 2vh, 24px);
  }
}

/* verdict banner */
.fl-zap-verdict {
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(1.4rem, 5vw, 3rem);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  text-align: center;
  pointer-events: none;
  display: none;
}

.fl-zap-verdict.fl-verdict-perfect {
  color: #ffb300;
  text-shadow: 0 0 30px #ffb300, 0 0 70px #ffb30088;
}

.fl-zap-verdict.fl-verdict-good {
  color: #39ff14;
  text-shadow: 0 0 24px #39ff14;
}

.fl-zap-verdict.fl-verdict-weak {
  color: #668866;
  text-shadow: 0 0 10px #39ff1444;
}

/* first spoken line text */
.fl-zap-first-line {
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(0.7rem, 1.6vw, 0.9rem);
  letter-spacing: 0.06em;
  color: #c77dff;
  text-align: center;
  max-width: min(560px, 85vw);
  line-height: 1.5;
  pointer-events: none;
  display: none;
  font-style: italic;
}

/* screen-flash overlay */
.fl-zap-flash {
  position: fixed;
  inset: 0;
  background: #ffffff;
  pointer-events: none;
  opacity: 0;
  z-index: 999;
  transition: opacity 0.08s ease-out;
}

.fl-zap-flash.fl-flash-active {
  opacity: 1;
  transition: none;
}
  `,document.head.appendChild(e)}let g=null,Lt=!1,Ce=null,U=0,ne=!1,me=!1,ve=null,Pn=0,Ke=0;const ta=1600;function Rn(e){e.key===" "&&(e.repeat||(e.preventDefault(),xt()))}function In(e){e.key===" "&&Vt()}function xt(){me||ne||(ne=!0,Pn=performance.now(),Ke=U,na(),g?.holdBtn.classList.add("fl-held"))}function Vt(){ne&&(ne=!1,mt(),g?.holdBtn.classList.remove("fl-held"),!me&&Ce&&zt(U,Ce))}function na(){ve===null&&_n()}function mt(){ve!==null&&(cancelAnimationFrame(ve),ve=null)}function _n(){const e=performance.now()-Pn,t=Math.min(e/ta*100,100-Ke);if(U=Math.round(Ke+t),oa(),U>=100){ne=!1,g?.holdBtn.classList.remove("fl-held"),mt(),!me&&Ce&&zt(U,Ce);return}ne?ve=requestAnimationFrame(_n):ve=null}function oa(){g&&(ln(U/100),g.fill.style.width=`${U}%`,g.pct.textContent=`${U}%`)}function aa(e){return e>=90?"perfect":e>=60?"good":"weak"}function ia(e){return e==="perfect"?100:e==="good"?70:40}function zt(e,t){if(me)return;me=!0,sn(),Rt(),mt(),Ln();const a=aa(e),n=ia(a);if(t.phase.name==="ZAP"&&(t.phase.charge=n),g&&(g.flash.classList.add("fl-flash-active"),requestAnimationFrame(()=>{requestAnimationFrame(()=>{g&&g.flash.classList.remove("fl-flash-active")})})),Zn(),g){const o={perfect:"PERFECT AWAKENING!",good:"GREAT AWAKENING!",weak:"WEAK AWAKENING"},i={perfect:"fl-verdict-perfect",good:"fl-verdict-good",weak:"fl-verdict-weak"};g.verdict.textContent=o[a],g.verdict.className=`fl-zap-verdict ${i[a]}`,g.verdict.style.display="block",g.holdBtn.style.display="none",g.fill.parentElement.style.visibility="hidden"}if(t.phase.name==="ZAP"){const{build:o}=t.phase,i=fo[o.head];po(i,o.head),g&&(g.firstLine.textContent=`"${i}"`,g.firstLine.style.display="block")}setTimeout(()=>{tn(t)},900)}function ra(e,t){e.type==="awaken"&&zt(U,t)}let st=!1;function la(e){st||(st=!0,window.addEventListener("keydown",Rn),window.addEventListener("keyup",In),g&&(g.holdBtn.addEventListener("pointerdown",xt),window.addEventListener("pointerup",Vt)),hn()?(gn(t=>ra(t,e)),g&&(g.voiceStatus.textContent="🎤 LISTENING — shout: IT'S ALIVE!",g.voiceStatus.classList.add("fl-voice-active"))):g&&(g.voiceStatus.textContent="voice unavailable — hold SPACE"))}function Ln(){st&&(st=!1,window.removeEventListener("keydown",Rn),window.removeEventListener("keyup",In),window.removeEventListener("pointerup",Vt),g&&g.holdBtn.removeEventListener("pointerdown",xt))}function sa(e,t){ea(),e.innerHTML="";const a=document.createElement("div");a.className="fl-zap-flash",document.body.appendChild(a);const n=document.createElement("div");n.className="fl-zap-screen";const o=document.createElement("div");o.className="fl-zap-verdict",o.style.display="none";const i=document.createElement("div");i.className="fl-zap-first-line",i.style.display="none";const s=document.createElement("div");s.className="fl-zap-track";const r=document.createElement("div");r.className="fl-zap-fill";const c=document.createElement("div");c.className="fl-zap-target";const l=document.createElement("div");l.className="fl-zap-perfect-zone";const d=document.createElement("div");d.className="fl-zap-pct",d.textContent="0%",s.appendChild(r),s.appendChild(c),s.appendChild(l),s.appendChild(d);const f=document.createElement("div");f.className="fl-zap-instruction",f.textContent="HOLD SPACE — or SHOUT: IT'S ALIVE!";const m=document.createElement("button");m.className="fl-zap-hold-btn",m.textContent="⚡ HOLD TO CHARGE ⚡",m.setAttribute("aria-label","Hold to charge the coil");const b=document.createElement("div");b.className="fl-zap-voice-status",b.textContent=hn()?"🎤 Initialising microphone…":"voice unavailable — hold SPACE";const u=document.createElement("div");u.className="fl-zap-stack",u.appendChild(o),u.appendChild(i),u.appendChild(s),u.appendChild(f),u.appendChild(m),u.appendChild(b),n.appendChild(u),e.appendChild(n),g={screen:n,fill:r,pct:d,holdBtn:m,voiceStatus:b,verdict:o,firstLine:i,flash:a},Lt=!0,Ce=t,U=0,ne=!1,me=!1,Ke=0,ft(),Qn(),ln(0),la(t)}function ca(e,t){t.phase.name==="ZAP"&&(Lt||sa(e,t))}function da(){mt(),Ln(),Rt(),sn(),g?.flash?.parentNode&&g.flash.parentNode.removeChild(g.flash),g=null,Lt=!1,Ce=null,me=!1,ne=!1,U=0,Ke=0}let jt=!1;function fa(){if(jt)return;jt=!0;const e=document.createElement("style");e.id="fl-hud-styles",e.textContent=`
/* ── HUD outer shell ───────────────────────────────────────────────────── */
.fl-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  font-family: 'Courier New', Courier, monospace;
}

/* ── Top bar ───────────────────────────────────────────────────────────── */
.fl-hud-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 14px;
  background: rgba(10, 13, 15, 0.78);
  border-bottom: 1px solid #2a3a2a;
  pointer-events: none;
}

.fl-hud-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.fl-hud-stat-label {
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #556655;
}

.fl-hud-stat-value {
  font-size: 0.75rem;
  color: #c8d8c0;
  min-width: 2.2em;
  text-align: right;
}

/* HP bar */
.fl-hud-hp-track {
  flex: 1 1 80px;
  max-width: 160px;
  height: 10px;
  background: #1a0a0a;
  border: 1px solid #3a1a1a;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.fl-hud-hp-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  background: #cc2222;
  transition: width 0.08s linear;
  border-radius: 2px;
}

/* Energy bar */
.fl-hud-en-track {
  flex: 1 1 60px;
  max-width: 120px;
  height: 10px;
  background: #1a1500;
  border: 1px solid #3a3000;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.fl-hud-en-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  background: #ffb300;
  transition: width 0.08s linear;
  border-radius: 2px;
}

/* ── Bottom ability bar ─────────────────────────────────────────────────── */
.fl-hud-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(10, 13, 15, 0.78);
  border-top: 1px solid #2a3a2a;
  pointer-events: none;
}

/* Individual ability button */
.fl-hud-ability-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 72px;
  min-height: 56px;
  padding: 6px 8px 5px;
  background: #0d1a0d;
  border: 1.5px solid #2a4a2a;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  pointer-events: auto;
  user-select: none;
  -webkit-user-select: none;
  transition: border-color 0.1s, background 0.1s;
  gap: 2px;
}

.fl-hud-ability-btn:hover:not(.fl-hud-btn-disabled) {
  border-color: #39ff14;
  background: #122012;
}

.fl-hud-ability-btn:active:not(.fl-hud-btn-disabled) {
  background: #1a3a1a;
}

.fl-hud-btn-disabled {
  opacity: 0.42;
  cursor: default;
}

/* Cooldown sweep overlay — fills from bottom up as frac goes 0→1→0 */
.fl-hud-cd-overlay {
  position: absolute;
  left: 0; bottom: 0; right: 0;
  height: 0%;
  background: rgba(0, 0, 0, 0.55);
  pointer-events: none;
  transition: height 0.08s linear;
}

.fl-hud-ability-name {
  position: relative;
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #39ff14;
  text-align: center;
  line-height: 1.2;
  z-index: 1;
}

.fl-hud-btn-disabled .fl-hud-ability-name {
  color: #556655;
}

.fl-hud-ability-donor {
  position: relative;
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  color: #556655;
  text-align: center;
  z-index: 1;
}

.fl-hud-ability-key {
  position: relative;
  font-size: 0.6rem;
  color: #ffb300;
  letter-spacing: 0.08em;
  z-index: 1;
}

/* Arms chip (non-button, auto-attack status) */
.fl-hud-arms-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
  padding: 5px 7px 4px;
  background: #0a0f0a;
  border: 1px solid #1a2a1a;
  border-radius: 4px;
  gap: 4px;
  pointer-events: none;
}

.fl-hud-arms-label {
  font-size: 0.5rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #3a5a3a;
}

.fl-hud-arms-name {
  font-size: 0.55rem;
  color: #778877;
  text-align: center;
  line-height: 1.2;
}

.fl-hud-arms-cd-track {
  width: 100%;
  height: 3px;
  background: #1a2a1a;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.fl-hud-arms-cd-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  background: #778877;
  transition: width 0.08s linear;
  border-radius: 2px;
}

/* ── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .fl-hud-top {
    flex-wrap: wrap;
    gap: 6px 10px;
    padding: 6px 8px;
    font-size: 0.85em;
  }
  .fl-hud-stat-label {
    font-size: 0.55rem;
  }
  .fl-hud-stat-value {
    font-size: 0.7rem;
  }
  .fl-hud-hp-track {
    max-width: 100px;
    flex: 1 1 60px;
  }
  .fl-hud-en-track {
    max-width: 80px;
    flex: 1 1 50px;
  }
  .fl-hud-bottom {
    gap: 5px;
    padding: 6px 6px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .fl-hud-ability-btn {
    min-width: 0;
    flex: 1 1 calc(33% - 10px);
    min-height: 48px;
    padding: 5px 4px 4px;
  }
  .fl-hud-arms-chip {
    min-width: 0;
    flex: 1 1 calc(33% - 10px);
    min-height: 48px;
    justify-content: center;
  }
}

/* ── Pause overlay ──────────────────────────────────────────────────────── */
.fl-hud-pause-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 15;
}

.fl-hud-pause-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(1rem, 3vw, 1.6rem);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #c8d8c0;
  background: rgba(10, 13, 15, 0.82);
  border: 1px solid #2a4a2a;
  padding: 12px 28px;
  border-radius: 4px;
  text-shadow: 0 0 12px #39ff1444;
}
  `,document.head.appendChild(e)}let z=null,Ht=!1,kt=-1,Tt=-1,St=-1,Ct=-1,Et=[],At=-1,Nt=!1;function pa(e,t){fa(),e.innerHTML="";const a=document.createElement("div");a.className="fl-hud";const n=document.createElement("div");n.className="fl-hud-top";const o=Je("WAVE"),i=o.val;n.appendChild(o.wrap);const s=Je("HP"),r=s.val;n.appendChild(s.wrap);const c=document.createElement("div");c.className="fl-hud-hp-track";const l=document.createElement("div");l.className="fl-hud-hp-fill",l.style.width="100%",c.appendChild(l),n.appendChild(c);const d=Je("EN");n.appendChild(d.wrap);const f=document.createElement("div");f.className="fl-hud-en-track";const m=document.createElement("div");m.className="fl-hud-en-fill",m.style.width="0%",f.appendChild(m),n.appendChild(f);const b=Je("SCORE"),u=b.val;n.appendChild(b.wrap),a.appendChild(n);const h=document.createElement("div");h.className="fl-hud-bottom";const w=[],v=[],k=[{slot:"head",keyHint:"1"},{slot:"torso",keyHint:"2"},{slot:"legs",keyHint:"3"}];for(let x=0;x<3;x++){const{slot:oe}=k[x],M=document.createElement("button");M.className="fl-hud-ability-btn",M.setAttribute("type","button"),M.setAttribute("aria-label",`Use ${oe} ability`);const Ne=document.createElement("div");Ne.className="fl-hud-cd-overlay";const qe=document.createElement("div");qe.className="fl-hud-ability-name";const je=document.createElement("div");je.className="fl-hud-ability-donor";const Bt=document.createElement("div");Bt.className="fl-hud-ability-key",M.appendChild(Ne),M.appendChild(qe),M.appendChild(je),M.appendChild(Bt),h.appendChild(M),w.push(M),v.push(Ne);const Hn=oe;M.addEventListener("click",()=>{M.classList.contains("fl-hud-btn-disabled")||(ft(),Jn(),ko(t,Hn))})}const E=document.createElement("div");E.className="fl-hud-arms-chip";const $=document.createElement("div");$.className="fl-hud-arms-label",$.textContent="AUTO";const W=document.createElement("div");W.className="fl-hud-arms-name";const L=document.createElement("div");L.className="fl-hud-arms-cd-track";const A=document.createElement("div");A.className="fl-hud-arms-cd-fill",A.style.width="0%",L.appendChild(A),E.appendChild($),E.appendChild(W),E.appendChild(L),h.appendChild(E),a.appendChild(h);const I=document.createElement("div");I.className="fl-hud-pause-overlay",I.style.display="none";const D=document.createElement("div");D.className="fl-hud-pause-text",D.textContent="❚❚ PAUSED — P to resume",I.appendChild(D),a.appendChild(I),e.appendChild(a);const Ae=Cn(t);for(let x=0;x<3;x++){const oe=Ae.abilities[x];if(!oe)continue;const M=w[x],Ne=M.querySelector(".fl-hud-ability-name"),qe=M.querySelector(".fl-hud-ability-donor"),je=M.querySelector(".fl-hud-ability-key");Ne.textContent=oe.name,qe.textContent=oe.donorName,je.textContent=`[${oe.keyHint}]`}W.textContent=Ae.armsAbility.name,z={screen:a,waveVal:i,scoreVal:u,hpFill:l,hpVal:r,enFill:m,abilityBtns:w,cdOverlays:v,armsCdFill:A,pauseOverlay:I},Ht=!0}function Je(e){const t=document.createElement("div");t.className="fl-hud-stat";const a=document.createElement("span");a.className="fl-hud-stat-label",a.textContent=e;const n=document.createElement("span");return n.className="fl-hud-stat-value",n.textContent="—",t.appendChild(a),t.appendChild(n),{wrap:t,val:n}}function ma(e,t){if(t.phase.name!=="SURVIVE"||(Ht||(xn(),pa(e,t)),!z))return;const a=Cn(t);a.wave!==kt&&(z.waveVal.textContent=String(a.wave),kt=a.wave),a.score!==Tt&&(z.scoreVal.textContent=String(a.score),Tt=a.score);const n=Math.round(a.hp);n!==St&&(z.hpVal.textContent=`${n}/${a.maxHp}`,z.hpFill.style.width=`${Math.max(0,a.hp/a.maxHp*100)}%`,St=n);const o=Math.round(a.energy);o!==Ct&&(z.enFill.style.width=`${Math.max(0,a.energy/a.maxEnergy*100)}%`,Ct=o);for(let r=0;r<3;r++){const c=a.abilities[r];if(!c)continue;const l=`${c.cooldownFrac.toFixed(2)}-${c.ready}-${c.affordable}`;if(l===Et[r])continue;Et[r]=l;const d=z.abilityBtns[r],f=z.cdOverlays[r],m=!c.ready||!c.affordable;d.classList.toggle("fl-hud-btn-disabled",m),f.style.height=`${c.cooldownFrac*100}%`}const i=Math.round(a.armsAbility.cooldownFrac*100)/100;i!==At&&(z.armsCdFill.style.width=`${(1-a.armsAbility.cooldownFrac)*100}%`,At=i);const s=vo();s!==Nt&&(z.pauseOverlay.style.display=s?"flex":"none",Nt=s)}function ua(){z=null,Ht=!1,xn()}function xn(){kt=-1,Tt=-1,St=-1,Ct=-1,Et=[],At=-1,Nt=!1}let Zt=!1;function ha(){if(Zt)return;Zt=!0;const e=document.createElement("style");e.id="fl-end-styles",e.textContent=`
/* ── END screen ────────────────────────────────────────────────────────── */
.fl-end-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 28px 20px;
  background: rgba(10, 13, 15, 0.92);
  pointer-events: all;
  z-index: 20;
  overflow-y: auto;
}

.fl-end-title {
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(1.4rem, 5vw, 2.8rem);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #cc2222;
  text-shadow: 0 0 24px #cc222288, 0 0 60px #cc222244;
  text-align: center;
  animation: fl-end-flicker 2.8s ease-in-out infinite;
}

@keyframes fl-end-flicker {
  0%, 90%, 100% { opacity: 1; }
  92%           { opacity: 0.6; }
  94%           { opacity: 1; }
  96%           { opacity: 0.4; }
  98%           { opacity: 1; }
}

.fl-end-stats-row {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.fl-end-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.fl-end-stat-label {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #556655;
}

.fl-end-stat-value {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.4rem;
  color: #ffb300;
  letter-spacing: 0.08em;
  text-shadow: 0 0 10px #ffb30066;
}

.fl-end-seed {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  color: #3a5a3a;
  text-transform: uppercase;
}

/* Build recap */
.fl-end-build {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 420px;
  border: 1px solid #2a3a2a;
  border-radius: 4px;
  padding: 10px 14px;
  background: rgba(10, 20, 10, 0.6);
}

.fl-end-build-title {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: #556655;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.fl-end-build-row {
  display: flex;
  gap: 10px;
  align-items: baseline;
}

.fl-end-build-slot {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.15em;
  color: #3a5a3a;
  text-transform: uppercase;
  min-width: 40px;
}

.fl-end-build-donor {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.72rem;
  color: #c8d8c0;
  letter-spacing: 0.06em;
}

.fl-end-build-ability {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.6rem;
  color: #c77dff;
  letter-spacing: 0.04em;
}

/* Buttons */
.fl-end-btn-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}

.fl-end-btn {
  padding: 12px 28px;
  font-family: 'Courier New', Courier, monospace;
  font-size: clamp(0.75rem, 1.8vw, 0.95rem);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  transition: background 0.15s, box-shadow 0.15s;
}

.fl-end-btn-retry {
  color: #0a0d0f;
  background: #39ff14;
  box-shadow: 0 0 16px #39ff1488;
}

.fl-end-btn-retry:hover,
.fl-end-btn-retry:focus {
  background: #80ff50;
  box-shadow: 0 0 28px #39ff14;
  outline: none;
}

.fl-end-btn-title {
  color: #c8d8c0;
  background: #1a2a1a;
  border: 1px solid #2a4a2a;
  box-shadow: 0 0 8px #2a4a2a44;
}

.fl-end-btn-title:hover,
.fl-end-btn-title:focus {
  background: #223322;
  box-shadow: 0 0 16px #39ff1444;
  outline: none;
}

@media (max-width: 480px) {
  .fl-end-screen {
    padding: 16px 12px;
    gap: 12px;
    justify-content: flex-start;
    overflow-y: auto;
  }
  .fl-end-build {
    padding: 8px 10px;
  }
  .fl-end-build-row {
    flex-wrap: wrap;
    gap: 4px;
  }
  .fl-end-btn-row {
    gap: 10px;
  }
  .fl-end-btn {
    padding: 10px 18px;
    font-size: 0.75rem;
  }
}
  `,document.head.appendChild(e)}let $e=!1,Fe=-1,Ge=-1,Ue=null;function ga(e,t){if(ha(),e.innerHTML="",t.phase.name!=="END")return;const{score:a,wave:n}=t.phase,o=Sn(),i=document.createElement("div");i.className="fl-end-screen";const s=document.createElement("div");s.className="fl-end-title",s.textContent="THE LAB HAS FALLEN",i.appendChild(s);const r=document.createElement("div");r.className="fl-end-stats-row";const c=pt(),l=[["SCORE",String(a)],["BEST",String(c.bestScore)],["WAVE",String(n)]];for(const[u,h]of l){const w=document.createElement("div");w.className="fl-end-stat";const v=document.createElement("div");v.className="fl-end-stat-label",v.textContent=u;const k=document.createElement("div");k.className="fl-end-stat-value",k.textContent=h,w.appendChild(v),w.appendChild(k),r.appendChild(w)}i.appendChild(r);const d=document.createElement("div");if(d.className="fl-end-seed",d.textContent=`SEED: ${t.seed.toString(16).toUpperCase().padStart(8,"0")}`,i.appendChild(d),o){const u=document.createElement("div");u.className="fl-end-build";const h=document.createElement("div");h.className="fl-end-build-title",h.textContent="YOUR MONSTER",u.appendChild(h);const w=["head","torso","arms","legs"],v={head:0,torso:1,arms:2,legs:3};for(const k of w){const E=o.build[k],$=Ee[E],W=o.monster.abilities[v[k]],L=document.createElement("div");L.className="fl-end-build-row";const A=document.createElement("span");A.className="fl-end-build-slot",A.textContent=k.toUpperCase();const I=document.createElement("span");I.className="fl-end-build-donor",I.textContent=$.name;const D=document.createElement("span");D.className="fl-end-build-ability",D.textContent=`▸ ${W.name}`,L.appendChild(A),L.appendChild(I),L.appendChild(D),u.appendChild(L)}i.appendChild(u)}const f=document.createElement("div");f.className="fl-end-btn-row";const m=document.createElement("button");m.className="fl-end-btn fl-end-btn-retry",m.textContent="RETRY (R)",m.addEventListener("click",()=>Xt(t)),f.appendChild(m);const b=document.createElement("button");b.className="fl-end-btn fl-end-btn-title",b.textContent="RETURN TO LAB",b.addEventListener("click",()=>ba(t)),f.appendChild(b),i.appendChild(f),e.appendChild(i),$e=!0,Fe=a,Ge=n,Ue=u=>{t.phase.name==="END"&&(u.key==="r"||u.key==="R")&&(u.preventDefault(),Xt(t))},window.addEventListener("keydown",Ue)}function Xt(e){ft(),rn(),Dt();const t=Sn(),a=t?{...t.build}:{head:"vampire",torso:"robot",arms:"werewolf",legs:"ghost"};R(e,{name:"STITCH",build:a,monster:ce(a)}),$e=!1,Fe=-1,Ge=-1}function ba(e){ft(),rn(),Dt(),R(e,{name:"TITLE"}),$e=!1,Fe=-1,Ge=-1}function ya(e,t){if(t.phase.name!=="END")return;const{score:a,wave:n}=t.phase;(!$e||a!==Fe||n!==Ge)&&ga(e,t)}function wa(){Dt(),$e=!1,Fe=-1,Ge=-1}function Dt(){Ue&&(window.removeEventListener("keydown",Ue),Ue=null)}const Vn=document.getElementById("game"),Yt=document.getElementById("phase-label"),ie=document.getElementById("dom-root");if(!Vn)throw new Error('FRANKEN-LAB: <canvas id="game"> not found in DOM.');if(!ie)throw new Error('FRANKEN-LAB: <div id="dom-root"> not found in DOM.');const H=Gn();Zo(H);let Me="";function va(){const e=H.phase.name;switch(e!==Me&&(Me==="ZAP"&&da(),Me==="SURVIVE"&&ua(),Me==="END"&&wa(),Me=e,Yt&&(Yt.textContent=e)),e){case"TITLE":Jo(ie,H);break;case"STITCH":Mn(ie,H);break;case"ZAP":ca(ie,H);break;case"SURVIVE":ma(ie,H);break;case"END":ya(ie,H);break;default:Qo(ie);break}}window.addEventListener("keydown",e=>{(e.key==="m"||e.key==="M")&&io()});let bt=0;function zn(e){const t=bt===0?0:e-bt;bt=e,H.now=e,H.elapsed+=t;const a=Math.min(t,50);H.phase.name==="SURVIVE"&&Io(H,a/1e3),jo(Vn,H),va(),requestAnimationFrame(zn)}requestAnimationFrame(zn);
