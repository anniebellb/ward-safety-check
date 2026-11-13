window.__vp = async function(){
// Viewport QA: drives the game into each UI state and reports overlaps / overflow.
const W=ms=>new Promise(r=>setTimeout(r,ms)); const $=id=>document.getElementById(id); const F=__fts;
const vis=id=>{ const e=$(id); if(!e||e.classList.contains('hidden')) return null; const cs=getComputedStyle(e); if(cs.display==='none'||e.classList.contains('out')||e.classList.contains('fade')) return null; return e.getBoundingClientRect(); };
const ov=(a,b)=>a&&b&&!(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom);
const VW=innerWidth, VH=innerHeight;
function audit(label, ids, allowed=[]){
  const R={}; ids.forEach(i=>R[i]=vis(i));
  const issues=[];
  Object.entries(R).forEach(([k,r])=>{ if(!r) return; if(r.left<-1||r.top<-1||r.right>VW+1||r.bottom>VH+1) issues.push(`${k} off-screen [${r.left|0},${r.top|0},${r.right|0},${r.bottom|0}]`); });
  const ks=Object.keys(R);
  for(let i=0;i<ks.length;i++) for(let j=i+1;j<ks.length;j++){ const pair=ks[i]+'/'+ks[j]; if(allowed.includes(pair)) continue; if(ov(R[ks[i]],R[ks[j]])) issues.push('overlap '+pair); }
  // scrollable content inside panels
  ['inspect','hud'].forEach(k=>{ const e=$(k); if(R[k] && e.scrollHeight>e.clientHeight+2) issues.push(`${k} scrolls (${e.scrollHeight}>${e.clientHeight})`); });
  return label+': '+(issues.length?issues.join('; '):'ok');
}
const st=document.createElement('style'); st.textContent='*{animation:none!important;transition:none!important}'; document.head.appendChild(st);
const out=[`viewport ${VW}x${VH}`];
// intro
out.push(audit('intro', ['intro']));
const card=document.querySelector('#intro .card').getBoundingClientRect(); if(card.bottom>VH||card.top<0) out.push('intro card clipped');
$('btnStart').click(); await W(400);
// open every checklist group (tallest HUD)
document.querySelector('#ar-lab .area-btn').click(); await W(100);
const it=id=>F.items.find(i=>i.id===id);
// play state with controls + hint + toast
const g=it('glass'); F.P.pos.set(g.place.point[0],0,g.place.point[1]); await W(150);
F.targetsNow().find(t=>t.id==='glass').act(); await W(100);
[...$('insOpts').children][g.options.findIndex(o=>o.ok)].click(); await W(60); $('insActions').children[0].click(); await W(300);
$('btnHelp').click(); await W(50); $('btnStart').click(); await W(200);
$('toast').innerHTML='<span>Sealed. Take it to the designated area for medical waste pickup.</span>'; $('toast').classList.remove('out'); await W(100);
out.push(audit('play', ['hud','tools','prompt','toast','controls']));
// question panel at its tallest: every wrong answer shown (the red bag has four options)
const b=it('bag'); F.P.pos.set(b.place.point[0],0,b.place.point[1]); await W(150); F.targetsNow().find(t=>t.id==='bag').act(); await W(150);
const opts=[...$('insOpts').children]; b.options.forEach((o,i)=>{ if(!o.ok) opts[i].click(); }); await W(150);
out.push(audit('inspect (all wrong shown)', ['inspect','tools'], []));
opts[b.options.findIndex(o=>o.ok)].click(); await W(150);
out.push(audit('inspect', ['inspect','tools'], []));
const insR=vis('inspect'); out.push(`inspect panel ${insR.width|0}x${insR.height|0} (${Math.round(insR.height/VH*100)}% of height)`);
$('insClose').click(); await W(150);
// longest correct feedback (refrigerator)
const fr=it('fridge'); F.P.pos.set(fr.place.point[0],0,fr.place.point[1]); await W(150); F.targetsNow().find(t=>t.id==='fridge').act(); await W(150);
[...$('insOpts').children][fr.options.findIndex(o=>o.ok)].click(); await W(150); out.push(audit('inspect (fridge)', ['inspect','tools'])); $('insClose').click(); await W(100);
// summary
document.getElementById('summary').classList.remove('hidden'); await W(100);
const sc=document.querySelector('#summary .card'); const sr=sc.getBoundingClientRect(); out.push(`summary card ${sr.width|0}x${sr.height|0}${sc.scrollHeight>sc.clientHeight+2?' (scrolls)':''}${sr.bottom>VH||sr.top<0?' CLIPPED':''}`);
document.getElementById('summary').classList.add('hidden');
return out; };
