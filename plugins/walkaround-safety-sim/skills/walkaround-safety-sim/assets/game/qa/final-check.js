// Final QA: full playthrough with wrong answers, keyboard controls, reset, completion message.
window.__final = async function(){
const W=ms=>new Promise(r=>setTimeout(r,ms)); const $=id=>document.getElementById(id); const F=__fts; const log=[]; const fail=[];
const check=(cond,msg)=>{ (cond?log:fail).push((cond?'PASS ':'FAIL ')+msg); };
window.__msgs=[]; addEventListener('message',e=>__msgs.push(e.data));
const key=(code,type='keydown')=>dispatchEvent(new KeyboardEvent(type,{code,key:code,bubbles:true}));
const it=id=>F.items.find(i=>i.id===id); const go=async p=>{ F.P.pos.set(p[0],0,p[1]); await W(120); }; const tg=id=>F.targetsNow().find(t=>t.id===id);
const opts=()=>[...$('insOpts').children];
const SUMMARY_TXT=()=>$("sumList").textContent;
async function answerWithMistakes(x,q){ q=q||x; const bs=opts(); let wrongShown=0;
  for(let i=0;i<q.options.length;i++){ if(q.options[i].ok) continue; bs[i].click(); await W(40); const t=bs[i].innerText; if(/Not quite\./.test(t) && /Try again\./.test(t)) wrongShown++; }
  wrongShown = wrongShown===q.options.length-1 ? 'all' : wrongShown;
  const openFb=bs.filter(b=>b.querySelector('.ofb')).length; if(openFb!==1) wrongShown='open feedback: '+openFb;
  bs[q.options.findIndex(o=>o.ok)].click(); await W(60);
  const right=bs[q.options.findIndex(o=>o.ok)].innerText; const collapsed=bs.every((b,i)=>q.options[i].ok || !b.querySelector('.ofb'));
  return {wrongShown, rightInline:/Correct\./.test(right), collapsed}; }

$('btnStart').click(); await W(300);
check(F.state==='play','start screen leads into play');
check($('introTitle').textContent==='Ward Safety Check','start screen says "Ward Safety Check"');
check(!/forceps|locked|licensed disposal|DM Sans|\bTap\b|\bclick/i.test($("app").textContent+SUMMARY_TXT()+JSON.stringify(F.items.map(i=>[i.name,i.scenario,i.question,i.options,i.glassQ,i.next,i.done,i.carrying]))),'no forceps, locked, licensed disposal, DM Sans, tap or click in learner text');
check(!/infection|policy/i.test(document.documentElement.innerHTML),'no infection-control or policy wording anywhere in the page');
check(getComputedStyle(document.body).fontFamily.startsWith('Lato'),'font is Lato');
check(!/WASD|<kbd>W<\/kbd>/.test(document.body.innerHTML),'no WASD anywhere in the page');

// keyboard: arrows move, WASD does not
// Q and E turn the view
const y0=F.userYaw; key('KeyQ'); await W(400); key('KeyQ','keyup'); const y1=F.userYaw; key('KeyE'); await W(400); key('KeyE','keyup');
check(y1>y0+.2 && F.userYaw<y1-.2,'Q and E turn the view'); $('btnReset').click(); await W(100);
const p0=F.P.pos.clone(); key('KeyW'); await W(400); key('KeyW','keyup'); check(F.P.pos.distanceTo(p0)<.01,'W key does not move');
key('ArrowUp'); await W(500); key('ArrowUp','keyup'); await W(100); check(F.P.pos.distanceTo(p0)>.5,'ArrowUp walks');
// Enter acts on the nearest thing
const bag=it('bag'); await go(bag.place.point); await W(150); key('Enter'); await W(150);
check(F.state==='inspect' && $('insTitle').textContent===bag.name,'Enter opens the nearest item');
key('Escape'); await W(100); check(F.state==='play','Escape closes the panel');
// digit keys answer
await go(bag.place.point); tg('bag').act(); await W(100); const wi=bag.options.findIndex(o=>!o.ok); key('Digit'+(wi+1)); await W(80);
check(opts()[wi].classList.contains('wrong'),'number keys pick an answer');
key('Escape'); await W(80);

// full playthrough
const DESTPT={door:[10.25,1.6], receptacle:[9.75,-1.2]};
const door=async x=>{ await go(x.place.point); tg(x.id).act(); await W(80); const r=await answerWithMistakes(x); $('insActions').children[0].click(); await W(60);
  check(F.hands.kind==='item' && F.hands.item===x, x.id+': picked up'); await go(DESTPT[x.dest]); check(!tg(x.dest==='door'?'receptacle':'door'), x.id+': only its own destination is offered'); tg(x.dest).act(); await W(1800); check(x.status==='done' && !x.obj.visible, x.id+': delivered to the '+x.dest); return r; };
const results={};
results.bag=await door(bag);
results.cartSharps=await door(it('cartSharps'));
results.counterSharps=await door(it('counterSharps'));
check(it('counterSharps').spare.visible,'counterSharps: a new container is in its place');
check(it('bag').obj.userData.tie && !it('cartSharps').spare,'bag tied; no replacement put on the supply cart');
for(const id of ['supplies','cabinet']){ const x=it(id); await go(x.place.point); tg(id).act(); await W(80); results[id]=await answerWithMistakes(x); $('insActions').children[0].click(); check(x.status==='done', id+': look-alike resolved with no fix'); }
// glass
const g=it('glass'); await go(g.place.point); tg('glass').act(); await W(80); results.glass=await answerWithMistakes(g); $('insActions').children[0].click();
check(!tg('glass').act,'glass: cannot pick up without tools');
await go([7.6,6.0]); tg('cleanup').act(); await W(80); check(F.hands.tool==='broom' && F.state==='play','glass: took the plastic dust pan and hand broom');
await go(g.place.point); tg('glass').act(); await W(100); results.glassQ=await answerWithMistakes(g,g.glassQ); $('insActions').children[0].click();
await go(it('counterSharps').place.point); // already gone, nothing to do there
await go([-6.55,5.75]); tg('labSharps').act(); await W(600); check(g.status==='done' && F.hands.kind===null,'glass: disposed in sharps container, tools returned');
// labels
const fr=it('fridge'); await go(fr.place.point); tg('fridge').act(); await W(80); results.fridge=await answerWithMistakes(fr); $('insActions').children[0].click();
check(!tg('fridge').act,'labels: cannot label before collecting labels');
await go([5.3,5.5]); tg('labels').act(); check(F.hasLabels,'labels: collected from office desk');
await go(fr.place.point); tg('fridge').act(); await W(500); check(fr.status==='done' && fr.obj.userData.label.visible,'fridge labeled');
check(fr.obj.userData.extra.visible,'fridge has its "Lab Specimens Only" sign');
for(const id of ['centrifuge','transport','medBin']){ const x=it(id); await go(x.place.point); tg(id).act(); await W(80); results[id]=await answerWithMistakes(x); $('insActions').children[0].click(); await W(450); check(x.status==='done' && x.obj.userData.label.visible, id+' labeled'); }
Object.entries(results).forEach(([k,r])=>{ check(r.wrongShown==='all' && r.rightInline && r.collapsed, `${k}: wrong answers explain + "Try again", correct feedback inline, wrong feedback collapses`); });
await W(1700);
check($('hudSub').textContent==='Issues fixed: 8 of 8','checklist shows 8 of 8');
check([...document.querySelectorAll('.area')].filter(a=>a.id!=='ar-places').every(a=>a.classList.contains('done')),'every area marked done');
check(!$('summary').classList.contains('hidden') && $('sumTitle').textContent==='Floor Is Safe','end screen shows "Floor Is Safe"');
check($('sumList').children.length===4,'summary has 4 lines');
check(!$('confetti').classList.contains('hidden') || matchMedia('(prefers-reduced-motion: reduce)').matches,'confetti plays');
check(F.reported && __msgs.length===1,'completion message sent once ('+__msgs.length+' messages)');
// try again
$('btnAgain').click(); await W(300);
check(F.items.every(i=>i.status==='new' && i.obj.visible && i.obj.parent===scene_parent(i)),'Try again resets every item');
check(!it('counterSharps').spare.visible && !it('fridge').obj.userData.extra.visible,'Try again hides the new container and the fridge sign');
check(!F.hasLabels && F.hands.kind===null && $('hudSub').textContent==='Issues fixed: 0 of 8','Try again resets hands, labels and progress');
function scene_parent(i){ return i.obj.parent && i.obj.parent.type==='Scene' ? i.obj.parent : null; }
return {passed:log.length, failed:fail.length, fail, log};
};
