/* ---------------- more textures ---------------- */
TEX.bioLabel = canvasTex(256,300,(g,w,h)=>{
  g.clearRect(0,0,w,h);
  g.fillStyle='#F26B21'; rr(g,6,6,w-12,h-12,22); g.fill();
  g.strokeStyle='rgba(17,17,17,.9)'; g.lineWidth=6; rr(g,18,18,w-36,h-36,14); g.stroke();
  drawBiohazard(g, w/2, 124, 150, '#111111');
  g.fillStyle='#111111'; g.font='900 36px Lato, sans-serif'; g.textAlign='center'; g.fillText('BIOHAZARD', w/2, 254);
});
TEX.cPanel = canvasTex(256,84,(g,w,h)=>{
  g.fillStyle='#0f1d33'; g.fillRect(0,0,w,h);
  g.fillStyle='#00A8E4'; [[14,18,90,16],[14,46,60,16]].forEach(([x,y,ww,hh])=>{ rr(g,x,y,ww,hh,5); g.fill(); });
  g.fillStyle='rgba(255,168,30,.95)'; rr(g,180,22,56,40,9); g.fill();
});
TEX.rollSide = canvasTex(512,64,(g,w,h)=>{ g.fillStyle='#ffffff'; g.fillRect(0,0,w,h); for(let x=6;x<w;x+=42){ g.fillStyle='#F26B21'; rr(g,x,8,34,48,6); g.fill(); } });
TEX.labFloor = canvasTex(512,512,(g,w,h)=>{ const R=rng(19); g.fillStyle='#dcf1fb'; g.fillRect(0,0,w,h); for(let k=0;k<3000;k++){ g.fillStyle=`rgba(${R()<.5?'0,120,170':'255,255,255'},${R()*.08})`; g.fillRect(R()*w,R()*h,2,2); } });
TEX.labFloor.wrapS=TEX.labFloor.wrapT=THREE.RepeatWrapping;
TEX.labSpec = canvasTex(512,128,(g,w,h)=>{ g.fillStyle='#ffffff'; rr(g,4,4,w-8,h-8,16); g.fill(); g.strokeStyle='#111111'; g.lineWidth=6; rr(g,12,12,w-24,h-24,12); g.stroke(); g.fillStyle='#111111'; g.font='900 44px Lato, sans-serif'; g.textAlign='center'; g.fillText('Lab Specimens Only', w/2, 80); });
TEX.cabSign = canvasTex(512,96,(g,w,h)=>{ g.fillStyle='#ffffff'; rr(g,4,4,w-8,h-8,18); g.fill(); g.fillStyle='#0069B1'; g.font='900 46px Lato, sans-serif'; g.textAlign='center'; g.fillText('CLEAN SUPPLIES', w/2, 64); });
function labelMesh(w){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w, w*300/256), decal(TEX.bioLabel)); m.renderOrder=4; m.visible=false; return m; }

/* ---------------- lab, office and cleanup models ---------------- */
function sampleTube(parent,x,y,z,cap){
  const t=new THREE.Group(); t.position.set(x,y,z); parent.add(t);
  M(new THREE.CylinderGeometry(.009,.009,.09,10), mat(0xf4f8fb,{roughness:.15,transparent:true,opacity:.55}),0,.045,0,t,false);
  M(new THREE.CylinderGeometry(.0075,.0075,.055,10), mat(0x9e1022,{roughness:.3}),0,.03,0,t,false);
  M(new THREE.CylinderGeometry(.011,.011,.022,10), mat(cap,{roughness:.5}),0,.1,0,t,false);
  return t;
}
function tubeRack(parent,x,y,z,n,seed){
  const g=grp(x,y,z,0,parent); rb(.32,.045,.1,.01, M_.blue(),0,0,0,g);
  const R=rng(seed), caps=[0xE14B63,0x8a6bd1,0xFFA81E,0x00A8E4];
  for(let i=0;i<n;i++) sampleTube(g,-.125+i*.05,.02,0,caps[(R()*4)|0]);
  return g;
}
function labFridge(){
  const g=new THREE.Group(), W=.74, H=1.86, D=.66, wh=mat(0xf4f7fa,{roughness:.4});
  bx(W,.06,D,wh,0,.04,0,g); bx(W,.05,D,wh,0,H-.05,0,g);
  bx(.04,H-.04,D,wh,-W/2+.02,.04,0,g); bx(.04,H-.04,D,wh,W/2-.02,.04,0,g); bx(W,H-.04,.04,wh,0,.04,-D/2+.02,g);
  bx(W-.09,H-.22,.01, mat(0xe8f3fb,{roughness:.6,emissive:0x9fc9e8,emissiveIntensity:.3}),0,.12,-D/2+.045,g);
  [.42,.82,1.2].forEach((y,i)=>{ bx(W-.1,.012,D-.12, mat(0xdfe8f0,{roughness:.2,transparent:true,opacity:.75}),0,y,0,g); tubeRack(g,0,y+.012,-.02,6,i+3); });
  [-1,1].forEach(sx=>[-1,1].forEach(sz=>cy(.02,.02,.04, M_.rubber(), sx*(W/2-.07),0,sz*(D/2-.07),g,10)));
  const fz=D/2+.018, dm=mat(0xe9eef3,{roughness:.35}), top=1.48;
  rb(W,H-top,.035,.012,dm,0,top,fz,g); rb(W,.12,.035,.012,dm,0,.04,fz,g);
  rb(.06,top-.16,.035,.01,dm,-W/2+.03,.16,fz,g); rb(.06,top-.16,.035,.01,dm,W/2-.03,.16,fz,g);
  const gl=M(new THREE.PlaneGeometry(W-.12,top-.16), new THREE.MeshStandardMaterial({color:lin(0xe6f5ff),roughness:.05,metalness:.2,transparent:true,opacity:.2,depthWrite:false}),0,.16+(top-.16)/2,fz,g,false); gl.renderOrder=3;
  cy(.012,.012,.6, M_.steel(), W/2-.09,.6,fz+.035,g,10);
  const lab=labelMesh(.2); lab.position.set(0,top+(H-top)/2,fz+.02); g.add(lab); g.userData.label=lab;
  const spec=M(new THREE.PlaneGeometry(.44,.11), decal(TEX.labSpec),0,1.28,fz+.02,g,false); spec.renderOrder=4; spec.visible=false; g.userData.extra=spec;
  g.userData.h=H; return g;
}
function centrifuge(){
  const g=new THREE.Group();
  rb(.46,.2,.44,.05, mat(0xdfe5ec,{roughness:.35}),0,0,0,g);
  const lid=M(new THREE.SphereGeometry(.2,32,16,0,Math.PI*2,0,Math.PI/2), mat(0xf6f9fb,{roughness:.2}),0,.2,-.01,g); lid.scale.y=.42;
  M(new THREE.TorusGeometry(.2,.012,8,40), mat(0xb9c4d0,{roughness:.3}),0,.2,-.01,g).rotation.x=Math.PI/2;
  rb(.2,.08,.02,.008, M_.screen(),-.1,.06,.215,g);
  M(new THREE.PlaneGeometry(.17,.056), new THREE.MeshBasicMaterial({map:TEX.cPanel}),-.1,.1,.227,g,false);
  const k=M(new THREE.CylinderGeometry(.02,.02,.02,16), M_.navy(),.03,.1,.228,g); k.rotation.x=Math.PI/2;
  const lab=labelMesh(.1); lab.position.set(.14,.1,.223); g.add(lab); g.userData.label=lab;
  g.userData.h=.3; return g;
}
function transportBox(){
  const g=new THREE.Group();
  rb(.36,.2,.26,.03, M_.white(),0,0,0,g);
  rb(.38,.06,.28,.03, M_.blue(),0,.2,0,g);
  M(new THREE.TorusGeometry(.08,.013,8,24,Math.PI), M_.navy(),0,.26,0,g);
  [-.12,.12].forEach(x=>bx(.04,.05,.02, M_.navy(), x,.17,.135,g));
  const lab=labelMesh(.11); lab.position.set(0,.09,.132); g.add(lab); g.userData.label=lab;
  g.userData.h=.36; return g;
}
// medical waste container: lidded, lined with a red bag; labeled ones show the biohazard label
function medWasteBin(o={}){
  const g=new THREE.Group(), W=.54, H=.42, D=.5;
  rb(W,H,D,.03, mat(0xf4f7fa,{roughness:.45}),0,.02,0,g);
  bx(W-.08,.012,D-.08, mat(0x2a2f3a,{roughness:.9}),0,H+.004,0,g);
  // red bag folded over the rim: a ring of four bars, not a solid slab, so its top never sits on the same
  // plane as the dark opening (the two used to flicker against each other)
  { const rim=mat(0xd0222f,{roughness:.32}), t=.035;
    bx(W+.012,t,.035,rim,0,H-.01,(D+.012)/2-.0175,g); bx(W+.012,t,.035,rim,0,H-.01,-(D+.012)/2+.0175,g);
    bx(.035,t,D-.058,rim,(W+.012)/2-.0175,H-.01,0,g); bx(.035,t,D-.058,rim,-(W+.012)/2+.0175,H-.01,0,g); }
  rb(W+.02,.03,D+.02,.015, M_.navy(),0,0,0,g);
  bx(.18,.025,.07, M_.steel(),0,.01,D/2+.04,g);                                // foot pedal
  const lid=new THREE.Group(); lid.position.set(0,H+.025,-D/2-.01); g.add(lid);
  rb(W+.02,.035,D+.02,.015, mat(0xe9eef3,{roughness:.35}),0,0,(D+.02)/2,lid);
  lid.rotation.x = o.open ? -1.25 : 0;
  const lab=labelMesh(.17); lab.position.set(0,H*.5,D/2+.006); g.add(lab); g.userData.label=lab; lab.visible=!!o.labeled;
  g.userData.h=H+.06; return g;
}
// medical waste receptacle: where full, tied, double-bagged red bags go
function wasteReceptacle(){
  const g=new THREE.Group(), W=.92, H=.92, D=.68, red=mat(0xc81e2e,{roughness:.45});
  rb(W,H,D,.05, red,0,.1,0,g);
  rb(W+.04,.07,D+.04,.035, mat(0xa3141f,{roughness:.4}),0,H+.1,0,g);
  [-1,1].forEach(sx=>[-1,1].forEach(sz=>{ const w=cy(.05,.05,.04, M_.rubber(), sx*(W/2-.1),.03,sz*(D/2-.1),g,14); w.rotation.z=Math.PI/2; }));
  const h=M(new THREE.CylinderGeometry(.018,.018,W-.2,10), M_.steel(),0,H-.05,-D/2-.05,g); h.rotation.z=Math.PI/2;
  const lab=labelMesh(.3); lab.position.set(0,.55,D/2+.006); lab.visible=true; g.add(lab);
  g.userData.h=H+.17; return g;
}
function supplyCabinet(){
  const g=new THREE.Group(), W=.96, H=2.0, D=.48, wh=M_.white();
  bx(W,.08,D, M_.navy(),0,0,0,g);
  bx(W,.04,D,wh,0,H-.04,0,g); bx(.04,H-.08,D,wh,-W/2+.02,.08,0,g); bx(.04,H-.08,D,wh,W/2-.02,.08,0,g); bx(W,H-.08,.03,wh,0,.08,-D/2+.015,g);
  const R=rng(21), cols=[0xffffff,0xE6F5FF,0xcfe8f7,0x9fd6f2,0xf3f6f9];
  [.1,.52,.94,1.36].forEach(y=>{ bx(W-.08,.02,D-.06,wh,0,y,0,g); let x=-W/2+.07;
    while(x<W/2-.16){ const w=.09+R()*.11, h=.14+R()*.18; rb(w,h,D-.18,.01, mat(cols[(R()*cols.length)|0],{roughness:.7}), x+w/2,y+.02,-.02,g); x+=w+.025; } });
  const fz=D/2+.012, fm=mat(0xe9eef3,{roughness:.35});
  [-1,1].forEach(s=>{
    const cx=s*W/4, dw=W/2-.02;
    rb(dw,.05,.025,.008,fm,cx,.09,fz,g); rb(dw,.05,.025,.008,fm,cx,H-.1,fz,g);
    rb(.04,H-.2,.025,.008,fm,cx-dw/2+.02,.1,fz,g); rb(.04,H-.2,.025,.008,fm,cx+dw/2-.02,.1,fz,g);
    const gp=M(new THREE.PlaneGeometry(dw-.08,H-.3), new THREE.MeshStandardMaterial({color:lin(0xe6f5ff),roughness:.05,metalness:.2,transparent:true,opacity:.2,depthWrite:false}),cx,.14+(H-.3)/2,fz,g,false); gp.renderOrder=3;
    cy(.009,.009,.22, M_.steel(), cx-s*(dw/2-.07),.9,fz+.02,g,10);
  });
  M(new THREE.PlaneGeometry(.6,.11), new THREE.MeshStandardMaterial({map:TEX.cabSign,roughness:.5}),0,H+.08,fz-.05,g,false);
  rb(.64,.15,.02,.01, M_.white(),0,H,fz-.07,g);
  g.userData.h=H+.15; return g;
}
function broomModel(){
  const g=new THREE.Group();
  cy(.012,.012,1.25, mat(0x5a6479,{roughness:.4,metalness:.3}),0,.12,0,g,10);
  rb(.3,.05,.07,.015, M_.navy(),0,.08,0,g);
  bx(.29,.09,.05, mat(0xe0b96a,{roughness:.9}),0,0,0,g);
  return g;
}
function dustpanModel(){
  const g=new THREE.Group();
  rb(.28,.012,.24,.004, M_.blue(),0,0,0,g);
  rb(.28,.08,.012,.004, M_.blue(),0,0,-.115,g);
  [-1,1].forEach(s=>rb(.012,.06,.22,.004, M_.blue(), s*.135,0,0,g));
  const h=M(new THREE.CylinderGeometry(.012,.012,.2,10), M_.navy(),0,.04,-.22,g); h.rotation.x=Math.PI/2;
  return g;
}
function shards(seed,n,spread){
  const g=new THREE.Group(), R=rng(seed);
  const gm=new THREE.MeshStandardMaterial({color:lin(0x8fcdee),emissive:lin(0x5fb8e6),emissiveIntensity:.35,roughness:.05,metalness:.15,transparent:true,opacity:.95,side:THREE.DoubleSide});
  for(let i=0;i<n;i++){
    const s=new THREE.Shape(), r=.03+R()*.05; s.moveTo(0,0); s.lineTo(r,R()*r*.5); s.lineTo(R()*r*.6,r); s.closePath();
    const m=M(new THREE.ShapeGeometry(s), gm, (R()-.5)*spread, .004+R()*.008, (R()-.5)*spread, g, false);
    m.rotation.x=-Math.PI/2+(R()-.5)*.5; m.rotation.z=R()*6;
  }
  return g;
}
function brokenTube(){
  const g=new THREE.Group(); g.add(shards(4,16,.36));
  const sh=M(new THREE.CircleGeometry(.24,32), new THREE.MeshBasicMaterial({color:lin(0x283764),transparent:true,opacity:.1,depthWrite:false}),0,.002,0,g,false); sh.rotation.x=-Math.PI/2;
  const tm=new THREE.MeshStandardMaterial({color:lin(0xb7def3),roughness:.05,metalness:.15,transparent:true,opacity:.85,side:THREE.DoubleSide});
  const a=M(new THREE.CylinderGeometry(.016,.016,.08,12,1,true), tm,.06,.017,.02,g,false); a.rotation.set(0,.6,Math.PI/2);
  const c=M(new THREE.CylinderGeometry(.019,.019,.035,12), mat(0x8a6bd1,{roughness:.5}),.11,.019,.05,g); c.rotation.set(0,.6,Math.PI/2);
  const b=M(new THREE.CylinderGeometry(.016,.013,.06,12,1,true), tm,-.08,.017,-.03,g,false); b.rotation.set(0,-.4,Math.PI/2);
  g.scale.setScalar(1.5); g.userData.h=.09; return g;
}
function labelRoll(){
  const g=new THREE.Group();
  rb(.22,.05,.13,.012, M_.white(),0,0,0,g);
  const roll=M(new THREE.CylinderGeometry(.055,.055,.08,28), [texMat(TEX.rollSide),M_.white(),M_.white()],0,.105,0,g); roll.rotation.z=Math.PI/2;
  const s=labelMesh(.05); s.visible=true; s.position.set(0,.026,.066); g.add(s);
  return g;
}
function cleanupRack(parent){
  const g=new THREE.Group(); (parent||scene).add(g);
  rb(1.1,.52,.03,.01, mat(0xf4f8fb,{roughness:.6}),0,.85,0,g);
  bx(1.1,.03,.035, M_.navy(),0,1.37,.0,g);
  [-.3,.1,.42].forEach(x=>{ const h=M(new THREE.CylinderGeometry(.008,.008,.06,8), M_.steel(), x,1.25,.04,g); h.rotation.x=Math.PI/2; });
  const br=broomModel(); br.position.set(-.3,0,.12); br.rotation.x=-.1; g.add(br);
  const dp=dustpanModel(); dp.position.set(.1,1.0,.05); dp.rotation.x=Math.PI/2; g.add(dp);
  g.userData={broom:br, dustpan:dp};
  return g;
}
function officeDesk(parent){
  const g=new THREE.Group(); parent.add(g);
  rb(2.2,.045,.75,.012, mat(0xdde6ef,{roughness:.35}),0,.72,0,g);
  rb(.04,.72,.7,.01, M_.white(),-1.08,0,0,g);
  rb(.5,.66,.68,.012, M_.white(),.8,0,0,g);
  [.14,.36,.56].forEach(y=>bx(.16,.014,.02, M_.steel(),.8,y,.345,g));
  [.27,.48].forEach(y=>bx(.46,.006,.004, mat(0xc8d3df),.8,y,.342,g));
  rb(1.6,.4,.02,.006, M_.white(),-.25,.3,-.33,g);
  const p1=bx(.21,.004,.3, mat(0xffffff,{roughness:.9}),-.5,.765,.08,g); p1.rotation.y=.2;
  const p2=bx(.21,.004,.3, mat(0xf3f6f9,{roughness:.9}),-.44,.77,.1,g); p2.rotation.y=-.1;
  cy(.035,.035,.1, M_.navy(),-.88,.765,-.15,g);
  return g;
}
function officeChair(parent){
  const g=new THREE.Group(); parent.add(g);
  for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; const l=bx(.04,.03,.3, M_.darkSteel(), Math.sin(a)*.14,.04,Math.cos(a)*.14,g); l.rotation.y=a; M(new THREE.SphereGeometry(.03,10,8), M_.rubber(), Math.sin(a)*.28,.03,Math.cos(a)*.28,g); }
  cy(.025,.025,.36, M_.steel(),0,.07,0,g,12);
  rb(.5,.08,.48,.03, M_.navy(),0,.43,0,g);
  const back=rb(.46,.5,.06,.03, M_.navy(),0,.55,-.24,g); back.rotation.x=-.08;
  return g;
}
function plant(x,z,s){
  const p=grp(x,0,z); OCC_LATER.push(p); rb(.42*s,.46*s,.42*s,.06*s, M_.navy(),0,0,0,p);
  const lf=mat(0x3f8f6b,{roughness:.7}), R=rng((x*10+z*7)|0);
  for(let i=0;i<9;i++){ const m=M(new THREE.SphereGeometry(.2*s,12,10),lf,(R()-.5)*.3*s,.6*s+R()*.45*s,(R()-.5)*.3*s,p); m.scale.set(1,1.5,1); }
  addCol(x-.25*s,x+.25*s,z-.25*s,z+.25*s);
}

/* ---------------- people ---------------- */
function makePerson(o, parent){
  const g=new THREE.Group();
  const skin=mat(o.skin,{roughness:.6}), top=mat(o.top,{roughness:.7}), pants=mat(o.pants,{roughness:.75}), hair=mat(o.hair,{roughness:.85}), shoe=mat(o.shoes,{roughness:.5});
  const leg=side=>{ const p=new THREE.Group(); p.position.set(side*.12,.8,0); g.add(p);
    M(new THREE.CylinderGeometry(.11,.095,.72,14),pants,0,-.36,0,p);
    rb(.17,.1,.3,.04,shoe,0,-.8,.05,p); return p; };
  const legL=leg(-1), legR=leg(1);
  const body=new THREE.Group(); g.add(body);
  M(new THREE.CylinderGeometry(.25,.235,.2,18),pants,0,.84,0,body);
  const torso=M(new THREE.CylinderGeometry(.29,.255,.62,20),top,0,1.19,0,body); torso.scale.z=.78;
  const sh=M(new THREE.SphereGeometry(.29,20,12),top,0,1.47,0,body); sh.scale.set(1,.42,.78);
  rb(.07,.09,.012,.008,mat(0xffffff),.14,1.27,.225,body); bx(.07,.016,.014,mat(0x0069B1),.14,1.33,.226,body);
  const arm=side=>{ const p=new THREE.Group(); p.position.set(side*.35,1.44,0); p.rotation.z=side*.1; body.add(p);
    M(new THREE.CylinderGeometry(.085,.075,.24,12),top,0,-.12,0,p);
    M(new THREE.CylinderGeometry(.06,.055,.34,10),skin,0,-.41,0,p);
    M(new THREE.SphereGeometry(.065,12,10),skin,0,-.6,0,p); return p; };
  const armL=arm(-1), armR=arm(1);
  M(new THREE.CylinderGeometry(.08,.09,.14,12),skin,0,1.6,0,body);
  const head=new THREE.Group(); head.position.y=1.86; body.add(head);
  M(new THREE.SphereGeometry(.25,24,20),skin,0,0,0,head);
  const eye=mat(0x1b1b22,{roughness:.3});
  [-1,1].forEach(s=>M(new THREE.SphereGeometry(.03,10,8),eye,s*.09,.03,.225,head,false));
  const sm=M(new THREE.TorusGeometry(.05,.011,6,16,Math.PI),eye,0,-.06,.232,head,false); sm.rotation.z=Math.PI;
  [-1,1].forEach(s=>M(new THREE.SphereGeometry(.05,10,8),skin,s*.245,0,0,head));
  const cap=M(new THREE.SphereGeometry(.272,24,14,0,Math.PI*2,0,Math.PI*.52),hair,0,.01,-.015,head); cap.rotation.x=-.32;
  M(new THREE.SphereGeometry(.12,14,10),hair,0,.17,-.22,head);
  (parent||scene).add(g);
  return {group:g, legL, legR, armL, armR, body, head};
}

/* ================================================================== */
/*  ROOM: enclosed floor. Stations on the north wall; lab prep area,   */
/*  office desk and cleanup supplies on the south wall.               */
/* ================================================================== */
const floorMat = new THREE.MeshStandardMaterial({map:TEX.floor, roughness:.42, envMapIntensity:.6});
TEX.floor.repeat.set(22/2.4, 14/2.4);
const floor = M(new THREE.PlaneGeometry(22,14), floorMat, 0,0,0, scene, false); floor.rotation.x=-Math.PI/2;
const ground = M(new THREE.PlaneGeometry(120,120), mat(0xdbe7f1,{roughness:1}), 0,-.02,0, scene, false); ground.rotation.x=-Math.PI/2;
[-2.9, 4.3].forEach(z=>{ const s=M(new THREE.PlaneGeometry(21.4,.1), new THREE.MeshStandardMaterial({color:lin(0x00A8E4),roughness:.5}),0,.006,z,scene,false); s.rotation.x=-Math.PI/2; });
const labFloor = M(new THREE.PlaneGeometry(9.0,2.5), new THREE.MeshStandardMaterial({map:TEX.labFloor,roughness:.5}), -6.4,.004,5.75, scene, false); labFloor.rotation.x=-Math.PI/2;
TEX.labFloor.repeat.set(3,1);

const wallMat=mat(0xE6F5FF,{roughness:.9});
function captureMeshes(fn){ CAPTURE=[]; fn(); const list=CAPTURE; CAPTURE=null; list.forEach(m=>{ m.material=(Array.isArray(m.material)?m.material[0]:m.material).clone(); m.material.transparent=true; }); return list; }
function wallBlock(x1,z1,x2,z2,h=3.1,t=.3){
  const w=Math.abs(x2-x1)||t, d=Math.abs(z2-z1)||t, cx=(x1+x2)/2, cz=(z1+z2)/2, horiz=z1===z2;
  bx(w,h,d,wallMat,cx,0,cz);
  bx(horiz?w:t+.03,.14,horiz?t+.03:d,M_.navy(),cx,0,cz);
  bx(horiz?w:t+.02,.06,horiz?t+.02:d,M_.blue(),cx,1.02,cz);
}
function windowOn(x, z, face){ // face: +1 faces south (north wall), -1 faces north (south wall)
  const p=M(new THREE.PlaneGeometry(2.4,1.0), new THREE.MeshBasicMaterial({map:TEX.window}), x,2.15,z, scene, false); if(face<0) p.rotation.y=Math.PI;
  const zz=z+face*.02;
  bx(2.54,.07,.08,M_.white(),x,1.62,zz); bx(2.54,.07,.08,M_.white(),x,2.63,zz);
  bx(.07,1.08,.08,M_.white(),x-1.24,1.62,zz); bx(.07,1.08,.08,M_.white(),x+1.24,1.62,zz);
}
const OUTER = {
  north: captureMeshes(()=>{
    wallBlock(-11,-7.15,11,-7.15);
    [-7,0,7].forEach(x=>windowOn(x,-6.99,1));
  }),
  south: captureMeshes(()=>{
    wallBlock(-11,7.15,11,7.15);
    [-.4,4.5,9.0].forEach(x=>windowOn(x,6.99,-1));
  }),
  west: captureMeshes(()=>{ wallBlock(-11.15,-7,-11.15,7);
    // the clock, on the empty west wall above the plant (it used to sit behind a bay curtain)
    const ck=M(new THREE.CircleGeometry(.26,40), new THREE.MeshStandardMaterial({map:TEX.clock,roughness:.4}), -10.99,2.45,2.6,scene,false); ck.rotation.y=Math.PI/2; }),
  east: captureMeshes(()=>{ wallBlock(11.15,-7,11.15,.95); wallBlock(11.15,2.25,11.15,7); bx(.3,.85,1.3,wallMat,11.15,2.25,1.6); })
};
addCol(-11.3,11.3,-7.4,-7); addCol(-11.3,11.3,7,7.4); addCol(-11.4,-11,-7,7); addCol(11,11.4,-7,7);

/* door to the medical waste pickup area (east wall) */
const DOOR = {x:10.98, z:1.6};
const doorG = grp(DOOR.x,0,DOOR.z,-Math.PI/2);
OUTER.east.push(...captureMeshes(()=>{
  rb(1.42,2.3,.1,.02, M_.white(),0,0,0,doorG);
  rb(1.2,2.18,.08,.02, M_.navy(),0,0,.04,doorG);
  bx(.04,.3,.05, M_.steel(),.48,1.0,.1,doorG);
  M(new THREE.PlaneGeometry(.98,.46), new THREE.MeshStandardMaterial({map:TEX.doorSign,roughness:.5}),0,1.72,.088,doorG,false);
  bx(.22,.22,.012, M_.steel(),-.42,1.0,.085,doorG);
}));
const doorMat = new THREE.MeshStandardMaterial({color:lin(0x00A8E4), transparent:true, opacity:0, depthWrite:false});
const doorGlow = M(new THREE.PlaneGeometry(1.2,.06), doorMat,0,.02,.4,doorG,false); doorGlow.rotation.x=-Math.PI/2;

/* hospital bays */
const OCC_LATER=[];
const STATIONS=[{x:-7,name:'Bay 1'},{x:0,name:'Bay 2'},{x:7,name:'Bay 3'}];
STATIONS.forEach((st,bi)=>{
  const X=st.x;
  const bay=M(new THREE.PlaneGeometry(6.6,4.0), new THREE.MeshStandardMaterial({map:TEX.bayFloor,roughness:.5}), X,.004,-5.0,scene,false); bay.rotation.x=-Math.PI/2;
  TEX.bayFloor.repeat.set(2,1.2);
  const chG=grp(X,0,-4.7,0); hospitalBed(chG); addCol(X-.5,X+.5,-5.72,-3.7); OCC_LATER.push(chG);
  const mcG=grp(X+1.9,0,-5.45,-.35); patientMonitor(mcG); addCol(X+1.25,X+2.2,-5.8,-5.1); OCC_LATER.push(mcG);
  counter(grp(X-2.05,0,-6.62,0),2.5,.72); addCol(X-3.32,X-.78,-7,-6.27);
  terminal(grp(X-2.85,COUNTER_TOP,-6.72,0));
  stationCart(grp(X-1.75,0,-3.9,0)); addCol(X-2.08,X-1.42,-4.15,-3.65);
  if(bi<2){ const px=X+3.5, pg=grp(px,0,-5.3);
    // a privacy curtain on a ceiling rail between bays, gently pleated (hospital ward look)
    const cur=mat(0xc7e0e6,{roughness:.9}); for(let k=0;k<14;k++){ rb(.07,1.75,.24,.03, cur, (k%2?.035:-.035),.3,-1.6+k*.245,pg); }
    rb(.03,.03,3.42,.01, M_.steel(),0,2.25,0,pg); for(let k=0;k<14;k++) cy(.004,.004,.2, M_.steel(), 0,2.05,-1.6+k*.245,pg,6);
    addCol(px-.08,px+.08,-7,-3.6); OCC_LATER.push(pg); }
});

/* lab prep area (south-west) */
counter(grp(-8.3,0,6.62,Math.PI),4.8,.5); addCol(-10.75,-5.85,6.27,7);
const labSharpsG = sharpsContainer(.32,false,13,true);   // solid: the lab one doesn't need its fill line shown labSharpsG.position.set(-6.55,COUNTER_TOP,6.6); labSharpsG.rotation.y=Math.PI; scene.add(labSharpsG);
/* office desk and cleanup supplies (south-east) */
officeDesk(grp(4.5,0,6.45,Math.PI)); addCol(3.38,5.62,6.05,7);
terminal(grp(4.15,.765,6.72,Math.PI));
officeChair(grp(4.5,0,5.55,0)); addCol(4.22,4.78,5.27,5.83);
const rollG = labelRoll(); rollG.position.set(5.3,.765,6.3); rollG.rotation.y=Math.PI; scene.add(rollG);
const rackG = cleanupRack(grp(7.6,0,6.99,Math.PI)); addCol(7.0,8.2,6.55,7);
const recG = wasteReceptacle(); recG.position.set(10.6,0,-1.2); recG.rotation.y=-Math.PI/2; scene.add(recG); addCol(10.2,11,-1.7,-.7);
const s1Bin = medWasteBin({labeled:true, open:true}); s1Bin.position.set(-8.12,0,-5.72); s1Bin.rotation.y=.3; scene.add(s1Bin); addCol(-8.42,-7.82,-6.02,-5.42);
plant(9.95,6.4,1.05); plant(1.6,6.45,.95); plant(-10.35,2.6,.9);

/* signs and tags */
function makeLabel(lines, o={}){
  const scale=2, fs=(o.fs||38)*scale, pad=22*scale, lh=fs*1.18;
  const c=document.createElement('canvas'), g=c.getContext('2d');
  const fonts=lines.map((l,i)=> i===0?`900 ${fs}px Lato, sans-serif`:`700 ${fs*.66}px Lato, sans-serif`);
  let w=0; lines.forEach((l,i)=>{ g.font=fonts[i]; w=Math.max(w,g.measureText(l).width); });
  const icon=o.icon?fs:0;
  c.width=Math.ceil(w+pad*2+(icon?icon+16*scale:0)); c.height=Math.ceil(pad*1.3+lh*(1+(lines.length-1)*.72));
  g.fillStyle=o.bg||'rgba(255,255,255,.96)'; rr(g,0,0,c.width,c.height,c.height/2.4); g.fill();
  let x=pad;
  if(icon){ if(o.icon==='check'){ const r=icon*.46, cx=pad+icon/2, cy=c.height/2; g.fillStyle='#00A8E4'; g.beginPath(); g.arc(cx,cy,r,0,7); g.fill(); g.strokeStyle='#fff'; g.lineWidth=r*.32; g.lineCap='round'; g.lineJoin='round'; g.beginPath(); g.moveTo(cx-r*.45,cy+r*.02); g.lineTo(cx-r*.1,cy+r*.36); g.lineTo(cx+r*.5,cy-r*.34); g.stroke(); }
    else drawBiohazard(g,pad+icon/2,c.height/2,icon*.95,o.iconColor||'#283764'); x+=icon+16*scale; }
  let y=pad*.62+fs*.95;
  lines.forEach((l,i)=>{ g.font=fonts[i]; g.fillStyle=i===0?(o.fg||'#283764'):'#5a6479'; g.fillText(l,x,y); y+=i===0?lh*.78:lh*.72; });
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,depthTest:false}));
  const hw=o.h||.5; s.scale.set(hw*c.width/c.height,hw,1); s.renderOrder=7;
  return s;
}
const SIGNS=[];
function sign(lines,x,y,z,o){ const s=makeLabel(lines,o); s.position.set(x,y,z); scene.add(s); SIGNS.push(s); return s; }
const AREA_SIGN={}, SIGN_STYLE={h:.44,bg:'rgba(40,55,100,.95)',fg:'#ffffff'};
STATIONS.forEach((st,i)=>{ AREA_SIGN['s'+(i+1)]={s:sign([st.name],st.x+.6,2.35,-5.3,SIGN_STYLE), text:st.name, done:false}; });
AREA_SIGN.lab={s:sign(['Lab Prep Area'],-6.4,2.35,5.3,SIGN_STYLE), text:'Lab Prep Area', done:false};
// a finished area gets a check mark on its floating sign
function setAreaSign(id,done){ const a=AREA_SIGN[id]; if(a.done===done) return; a.done=done; const n=makeLabel([a.text], done?Object.assign({icon:'check'},SIGN_STYLE):SIGN_STYLE); a.s.material.map.dispose(); a.s.material.map=n.material.map; a.s.material.needsUpdate=true; a.s.scale.copy(n.scale);
  if(done){ const s0=a.s.scale.clone(); tween(.5,e=>a.s.scale.copy(s0).multiplyScalar(1+Math.sin(e*Math.PI)*.18)); } }
const DEST_SIGNS=[sign(['Medical Waste','Pickup Area'],10.35,3.0,DOOR.z,{h:.72,icon:'bio'}), sign(['Medical Waste','Receptacle'],10.3,2.2,-1.2,{h:.62,icon:'bio'})];
sign(['Biohazard Labels'],5.3,1.25,6.3,{h:.27,fs:30});
sign(['Cleanup Supplies'],7.6,1.95,6.8,{h:.27,fs:30});
const TAGS=[];
function tag(text,x,y,z){ const s=makeLabel([text],{h:.27,fs:30}); s.position.set(x,y,z); s.material.opacity=0; scene.add(s); TAGS.push(s); }
STATIONS.forEach(st=>tag('Supply cart',st.x-1.75,1.32,-3.62));
tag('Sharps Container',-6.55,1.55,6.5);

/* ================================================================== */
/*  ITEMS                                                              */
/* ================================================================== */
const BUILD = {
  bag: ()=>{ const b=redBag(5); b.scale.setScalar(.84); return b; }, supplies: ()=>supplies(),
  cartSharps: ()=>sharpsContainer(.75,false,3), glass: ()=>brokenTube(),
  counterSharps: ()=>sharpsContainer(.97,true,9),
  fridge: ()=>labFridge(), centrifuge: ()=>centrifuge(), transport: ()=>transportBox(),
  medBin: ()=>medWasteBin(), cabinet: ()=>supplyCabinet()
};
const PI=Math.PI;
const PLACE = {
  bag:          {pos:[-8.12,.12,-5.72], rot:.3,  point:[-8.0,-4.92], marker:[-8.12,1.02,-5.7], cam:-.95, carryY:.9},
  supplies:     {pos:[-8.77,CART.shelf,-3.9], rot:0, point:[-9.6,-3.72], marker:[-9.32,.82,-3.66], cam:.75},
  cartSharps:   {pos:[-1.75,CART.top,-3.92], rot:0, point:[-1.42,-3.12], marker:[-1.62,1.62,-3.9], cam:.55, carryY:1.02},
  glass:        {pos:[1.0,0,-3.25], rot:0, point:[1.0,-2.42], marker:[1.0,.62,-3.25], cam:.5},
  counterSharps:{pos:[5.05,COUNTER_TOP,-6.58], rot:.08, point:[5.05,-5.86], marker:[5.05,1.72,-6.55], cam:-.75, carryY:1.02},
  centrifuge:   {pos:[-10.0,COUNTER_TOP,6.6], rot:PI, point:[-10.0,5.75], marker:[-10.0,1.6,6.6], cam:.55},
  transport:    {pos:[-8.9,COUNTER_TOP,6.58], rot:PI, point:[-8.9,5.75], marker:[-8.9,1.55,6.58], cam:.45},
  medBin:       {pos:[-4.0,0,6.68], rot:PI, point:[-4.0,5.8], marker:[-4.0,1.05,6.68], cam:.5, col:[-4.3,-3.7,6.4,7]},
  fridge:       {pos:[-5.15,0,6.55], rot:PI, point:[-5.15,5.7], marker:[-5.15,2.25,6.4], cam:-.5, col:[-5.52,-4.78,6.2,7]},
  cabinet:      {pos:[-2.7,0,6.7], rot:PI, point:[-2.7,5.95], marker:[-2.7,2.55,6.5], cam:.5, col:[-3.2,-2.2,6.42,7]}
};
const FIXED = {
  door:{point:[10.25,DOOR.z], pos:[DOOR.x,1.1,DOOR.z], obj:doorG},
  receptacle:{point:[9.75,-1.2], pos:[10.6,1.0,-1.2], obj:recG},
  labels:{point:[5.3,5.5], pos:[5.3,.8,6.3], obj:rollG},
  cleanup:{point:[7.6,6.0], pos:[7.6,.9,6.85], obj:rackG},
  labSharps:{point:[-6.55,5.75], pos:[-6.55,1.1,6.6], obj:labSharpsG}
};
Object.keys(FIXED).forEach(id=>FIXED[id].obj.traverse(m=>{ m.userData.fixedId=id; }));
const TOOL_NAME = {broom:'plastic dust pan and hand broom'};

function bubbleTex(kind){
  return canvasTex(128,148,g=>{
    const col=kind==='done'?'#0069B1':'#FFA81E';
    g.shadowColor='rgba(40,55,100,.35)'; g.shadowBlur=10; g.shadowOffsetY=3;
    g.fillStyle=col; g.beginPath(); g.arc(64,58,48,0,7); g.fill();
    g.beginPath(); g.moveTo(48,98); g.lineTo(64,128); g.lineTo(80,98); g.fill();
    g.shadowColor='transparent';
    g.strokeStyle='#fff'; g.lineWidth=6; g.beginPath(); g.arc(64,58,45,0,7); g.stroke();
    g.strokeStyle=kind==='done'?'#fff':'#283764'; g.fillStyle='#283764'; g.lineCap='round'; g.lineJoin='round';
    if(kind==='done'){ g.lineWidth=12; g.beginPath(); g.moveTo(42,60); g.lineTo(58,76); g.lineTo(88,42); g.stroke(); }
    else if(kind==='todo'){ g.lineWidth=12; g.beginPath(); g.moveTo(64,34); g.lineTo(64,64); g.stroke(); g.beginPath(); g.arc(64,82,7,0,7); g.fill(); }
    else { g.lineWidth=9; g.beginPath(); g.arc(58,52,17,0,7); g.stroke(); g.lineWidth=12; g.beginPath(); g.moveTo(71,66); g.lineTo(84,79); g.stroke(); }
  });
}
const BUB={inspect:bubbleTex('inspect'), todo:bubbleTex('todo'), done:bubbleTex('done')};
// shuffle answer order once (seeded) so the right answer isn't always first
function shuffled(arr, seed){ const a=arr.slice(), R=rng(seed); for(let i=a.length-1;i>0;i--){ const j=(R()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; }
const items = ITEMS.map((d,k)=>{
  const p=PLACE[d.id], obj=BUILD[d.id]();
  obj.position.set(...p.pos); obj.rotation.y=p.rot; scene.add(obj);
  obj.traverse(m=>{ m.userData.itemId=d.id; });
  const marker=new THREE.Sprite(new THREE.SpriteMaterial({map:BUB.inspect,transparent:true,depthWrite:false,depthTest:false}));
  marker.scale.set(.34,.39,1); marker.renderOrder=8; marker.position.set(...p.marker); marker.userData.itemId=d.id; scene.add(marker);
  const ring=M(new THREE.RingGeometry(.36,.46,40), new THREE.MeshBasicMaterial({color:lin(0xFFA81E),transparent:true,opacity:0,depthWrite:false}), p.point[0],.012,p.point[1],scene,false);
  ring.rotation.x=-Math.PI/2;
  const it=Object.assign({}, d, {obj, marker, ring, place:p, baseScale:obj.scale.x, status:'new', glassAnswered:false, col:p.col?addCol(...p.col):null});
  it.options=shuffled(d.options, 101+k*17);
  if(d.glassQ) it.glassQ=Object.assign({}, d.glassQ, {options:shuffled(d.glassQ.options, 977)});
  return it;
});
const itemById = id => items.find(i=>i.id===id);

/* thumbnails rendered once from the same models */
const THUMBS={};
(function(){
  const r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  r.setSize(256,256); r.setPixelRatio(1); r.outputEncoding=THREE.sRGBEncoding;
  const s=new THREE.Scene(); s.environment=scene.environment;
  s.add(new THREE.HemisphereLight(lin(0xffffff),lin(0xcdd6e0),.6));
  const dl=new THREE.DirectionalLight(lin(0xffffff),.9); dl.position.set(1.5,3,2.5); s.add(dl);
  const cam=new THREE.PerspectiveCamera(30,1,.01,30);
  const shots=Object.assign({}, BUILD, {
    cleanup: ()=>{ const g=new THREE.Group(); const b=broomModel(); b.position.x=-.12; b.rotation.z=.25; g.add(b); const d=dustpanModel(); d.position.set(.16,.0,.1); g.add(d); return g; },
    labels: ()=>labelRoll(), receptacle: ()=>wasteReceptacle()
  });
  Object.keys(shots).forEach(id=>{
    const o=shots[id](); s.add(o);
    const box=new THREE.Box3().setFromObject(o), c=box.getCenter(new THREE.Vector3()), sz=box.getSize(new THREE.Vector3()).length();
    const dir = id==='glass' ? new THREE.Vector3(.35,1.1,.8) : id==='bag' ? new THREE.Vector3(.5,.7,1) : new THREE.Vector3(.55,.42,1);
    cam.position.copy(c).add(dir.normalize().multiplyScalar(Math.max(sz,.25)*1.75)); cam.lookAt(c);
    r.render(s,cam); THUMBS[id]=r.domElement.toDataURL('image/png'); s.remove(o);
  });
  r.dispose(); if(r.forceContextLoss) r.forceContextLoss();
})();

/* player and what she carries */
// The player's scrubs are green (LearnCurio version).
const player = makePerson({skin:0xc58c64, top:0x2f7d5a, pants:0x2f7d5a, hair:0x2a1b12, shoes:0xffffff});
const carry = new THREE.Group(); carry.position.set(0,0,.4); player.group.add(carry);
const held = {broom:new THREE.Group()};
(function(){
  const dp=dustpanModel(); dp.position.set(0,1.08,.04); held.broom.add(dp);
  const br=broomModel(); br.scale.setScalar(.85); br.position.set(.3,.6,-.05); br.rotation.set(-.35,0,.3); held.broom.add(br);
  const sb=shards(31,8,.14); sb.position.set(0,1.09,.05); held.broom.add(sb); held.broom.userData.shards=sb;
  Object.values(held).forEach(h=>{ h.visible=false; h.userData.shards.visible=false; carry.add(h); });
})();
(function(){ items.filter(it=>it.replace).forEach(it=>{ const sp=sharpsContainer(.08,false,17); sp.position.set(...it.place.pos); sp.rotation.y=it.place.rot; sp.visible=false; scene.add(sp); it.spare=sp; }); })();
const START = {x:0, z:.4, rot:Math.PI};
const P = {pos:new THREE.Vector3(START.x,0,START.z), rot:START.rot, phase:0, speed:0};
const youTag = makeLabel(['You'],{h:.3,fs:30,bg:'rgba(0,105,177,.97)',fg:'#ffffff'}); scene.add(youTag);
const pRing = M(new THREE.CircleGeometry(.5,32), new THREE.MeshBasicMaterial({color:lin(0x283764),transparent:true,opacity:.14,depthWrite:false}),0,.01,0,scene,false); pRing.rotation.x=-Math.PI/2;
const tapMark = M(new THREE.RingGeometry(.18,.26,32), new THREE.MeshBasicMaterial({color:lin(0x00A8E4),transparent:true,opacity:0,depthWrite:false}),0,.015,0,scene,false); tapMark.rotation.x=-Math.PI/2;

/* ================================================================== */
/*  STATE                                                              */
/* ================================================================== */
let state='loading', current=null, currentQ='main', nearT=null, goal=null, autoTarget=null, stuckT=0, pendingSummary=false;
let hands={kind:null, item:null, tool:null}, hasLabels=false, insFocus=null, doorFlash=0;
const tweens=[];
const CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const CROSS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>';
const CHEV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
const live = msg => { $('live').textContent=''; setTimeout(()=>$('live').textContent=msg,30); };
const ease = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
function tween(dur, fn, done){ tweens.push({t:0,dur,fn,done}); }
let toastT=0;
function toast(text, ok){ const el=$('toast'); el.innerHTML=(ok?`<span class="ic" aria-hidden="true">${CHECK}</span>`:'')+`<span>${text}</span>`; el.classList.remove('out'); clearTimeout(toastT); toastT=setTimeout(()=>el.classList.add('out'), ok?4200:3000); }

/* ---------------- what can be done where ---------------- */
function T(id,pt,text,act){ return {id, x:pt[0], z:pt[1], text, act}; }
function targetsNow(){
  const L=[];
  items.forEach(it=>{
    if(it.status==='done'||it.status==='carrying') return;
    const p=it.place.point;
    if(it.status==='new'){ L.push(T(it.id,p,`Inspect: ${it.name}`,()=>openQuestion(it))); return; }
    if(it.action==='carry'){
      if(!hands.kind) L.push(T(it.id,p,it.prepPrompt,()=>pickUp(it)));
      else if(hands.kind==='glass') L.push(T(it.id,p,'This one is full. Use the sharps container on the lab prep counter.'));
      else L.push(T(it.id,p,'Your hands are full.'));
    } else if(it.action==='glass'){
      if(hands.kind==='tool') L.push(T(it.id,p,'Sweep up the glass with the dust pan and broom',()=>pickGlass(it)));
      else if(!hands.kind) L.push(T(it.id,p,'Get the plastic dust pan and hand broom from the cleanup supplies.'));
      else L.push(T(it.id,p,'Your hands are full.'));
    } else {
      if(hasLabels) L.push(T(it.id,p, it.id==='fridge'?'Put the biohazard label and sign on it':'Put a biohazard label on it', ()=>applyLabel(it)));
      else L.push(T(it.id,p,'Get biohazard labels from the office desk.'));
    }
  });
  if(hands.kind==='item'){ const d=hands.item.dest; L.push(T(d,FIXED[d].point,`Put the ${hands.item.lower} in the ${DEST[d].name}`,dropAtDest)); }
  if(hands.kind==='glass') L.push(T('labSharps',FIXED.labSharps.point,'Put the broken glass in this sharps container',disposeGlass));
  if(!hasLabels) L.push(T('labels',FIXED.labels.point,'Take biohazard labels',takeLabels));
  if(!hands.kind) L.push(T('cleanup',FIXED.cleanup.point,'Take the plastic dust pan and hand broom',()=>takeTool('broom')));
  else if(hands.kind==='tool') L.push(T('cleanup',FIXED.cleanup.point,'Put the tools back',returnTools));
  return L;
}
function objective(){
  if(hands.kind==='item') return `Take the ${hands.item.lower} to the ${DEST[hands.item.dest].name} (east wall).`;
  if(hands.kind==='tool'){ const g=itemById('glass'); return g.status==='answered' ? 'Pick up the broken glass at Bay 2.' : `You're holding the ${TOOL_NAME[hands.tool]}.`; }
  if(hands.kind==='glass') return itemById('glass').glassAnswered ? 'Take the glass to the sharps container on the lab prep counter.' : null;
  return null;
}

/* ---------------- actions ---------------- */
function pickUp(it){
  if(hands.kind) return;
  hands={kind:'item', item:it, tool:null}; it.status='carrying'; if(it.col) it.col.on=false;
  if(it.seal && it.obj.userData.seal) it.obj.userData.seal();   // sealed at 3/4 full
  if(it.obj.userData.tie) it.obj.userData.tie();                 // center knot, double bagged
  carry.add(it.obj); it.obj.position.set(0,it.place.carryY,0); it.obj.rotation.set(0,0,0); it.obj.scale.setScalar(it.baseScale);
  toast(it.carrying); updateHUD();
}
function dropAtDest(){
  const it=hands.item; if(!it) return;
  const from=new THREE.Vector3(); it.obj.getWorldPosition(from); scene.add(it.obj); it.obj.position.copy(from);
  hands={kind:null, item:null, tool:null};
  const atDoor = it.dest==='door', to = atDoor ? new THREE.Vector3(DOOR.x-.3,1.0,DOOR.z) : new THREE.Vector3(10.6,1.15,-1.2), s0=it.obj.scale.x;
  tween(.75, e=>{ it.obj.position.lerpVectors(from,to,e); it.obj.position.y+=Math.sin(e*Math.PI)*.4; it.obj.scale.setScalar(Math.max(.001,s0*(1-e*e))); }, ()=>{ it.obj.visible=false;
    if(atDoor) doorFlash=1; else tween(.5, e=>recG.scale.setScalar(1+Math.sin(e*Math.PI)*.06), ()=>recG.scale.setScalar(1)); });
  if(it.spare){ const sp=it.spare; sp.visible=true; sp.scale.setScalar(.01); tween(.6, e=>sp.scale.setScalar(Math.max(.01,e))); }   // a new one in its place
  complete(it);
}
function takeTool(k){
  hands={kind:'tool', item:null, tool:k};
  const r=rackG.userData; r.broom.visible=false; r.dustpan.visible=false;
  held[k].visible=true; held[k].userData.shards.visible=false;
  toast(`You have the ${TOOL_NAME[k]}.`); updateHUD();
}
function rackBack(){ const r=rackG.userData; r.broom.visible=r.dustpan.visible=true; Object.values(held).forEach(h=>{ h.visible=false; h.userData.shards.visible=false; }); }
function returnTools(){ rackBack(); hands={kind:null,item:null,tool:null}; toast('Tools put back.'); updateHUD(); }
function pickGlass(it){
  if(hands.kind!=='tool') return;
  hands={kind:'glass', item:it, tool:hands.tool}; it.status='carrying'; it.obj.visible=false;
  held[hands.tool].userData.shards.visible=true;
  updateHUD(); openQuestion(it,'glass');
}
function disposeGlass(){
  const it=itemById('glass');
  if(!it.glassAnswered){ openQuestion(it,'glass'); return; }
  held[hands.tool].userData.shards.visible=false;
  const c=labSharpsG; tween(.5, e=>{ c.scale.setScalar(1+Math.sin(e*Math.PI)*.08); }, ()=>c.scale.setScalar(1));
  rackBack(); hands={kind:null,item:null,tool:null};
  complete(it);
}
function takeLabels(){ hasLabels=true; toast('You have biohazard labels.'); updateHUD(); }
function applyLabel(it){
  const parts=[it.obj.userData.label, it.obj.userData.extra].filter(Boolean);
  parts.forEach(lab=>{ lab.visible=true; lab.scale.setScalar(.01); });
  tween(.45, e=>parts.forEach(lab=>lab.scale.setScalar(Math.max(.01, e<.7? e/.7*1.15 : 1.15-(e-.7)/.3*.15))));
  complete(it);
}
function complete(it){ it.status='done'; toast(it.done, true); live(it.done); updateHUD(); checkFinish(); }
const allDone = ()=>items.every(i=>i.status==='done');
function checkFinish(){ if(!allDone()) return; if(state==='play') setTimeout(()=>{ if(state==='play') showSummary(); else pendingSummary=true; }, 1300); else pendingSummary=true; }

/* ---------------- panel ---------------- */
function optButton(i,label){ const b=document.createElement('button'); b.className='opt'; b.innerHTML=`<span class="k" aria-hidden="true">${'ABCD'[i]}</span><span>${label}</span><span class="m" aria-hidden="true"></span>`; return b; }
// feedback sits inside the option it belongs to
function optFb(b,ok,text){ if(ok) text=text.replace(/^Right\.\s*/,''); const f=document.createElement('span'); f.className='ofb'; f.innerHTML=`<b>${ok?'Correct.':'Not quite.'}</b> ${text}`+(ok?'':' <span class="again">Try again.</span>'); b.appendChild(f); b.querySelector('.m').innerHTML=ok?CHECK:CROSS; live((ok?'Correct. ':'Not quite. ')+text+(ok?'':' Try again.')); }
function actions(list){ const a=$('insActions'); a.innerHTML=''; list.forEach(([label,fn,cls])=>{ const b=document.createElement('button'); b.className='btn '+(cls||''); b.textContent=label; b.onclick=fn; a.appendChild(b); }); }
function focusFirst(){ setTimeout(()=>{ const b=$('insOpts').querySelector('.opt:not(:disabled)')||$('insActions').querySelector('button'); if(b) b.focus({preventScroll:true}); },40); }
function openPanel(o){
  state='inspect'; autoTarget=null; goal=null;
  $('prompt').classList.add('hidden'); hideControls();
  $('insImg').src=o.img; $('insKicker').textContent=o.kicker; $('insTitle').textContent=o.title;
  $('insScn').textContent=o.scn; $('insQ').textContent=o.q||''; $('insQ').classList.toggle('hidden',!o.q);
  $('insNext').classList.add('hidden'); $('insOpts').innerHTML=''; $('insActions').innerHTML=''; $('insAfter').classList.add('hidden');
  insFocus={pos:new THREE.Vector3(...o.focus.pos), yaw:o.yaw, h:o.h||.6};
  $('inspect').classList.remove('hidden');
}
function stepTo(pt, look){ if(Math.hypot(P.pos.x-pt[0],P.pos.z-pt[1])>1.0){ P.pos.set(pt[0],0,pt[1]); P.speed=0; } if(look) P.rot=Math.atan2(look[0]-P.pos.x, look[2]-P.pos.z); zoneYaw(true); }
function openQuestion(it, which='main', fromList){
  if(fromList && it.status!=='carrying') stepTo(it.place.point, it.place.pos);
  current=it; currentQ=which;
  const p=it.place, q = which==='glass' ? it.glassQ : it;
  openPanel({kicker:AREA_NAME[it.area]+(which==='glass'?' · Next step':' · Inspect'), title:it.name, img:THUMBS[it.id],
    scn: which==='glass' ? `You swept up the broken glass with the ${TOOL_NAME[hands.tool]||'dust pan and broom'}.` : it.scenario,
    q:q.question, focus:{pos:[p.pos[0], p.pos[1]+(it.obj.userData.h||.3)*.5, p.pos[2]]}, h:it.obj.userData.h||.3, yaw:Math.atan2(p.point[0]-p.pos[0], p.point[1]-p.pos[2])+p.cam});
  const answered = which==='glass' ? it.glassAnswered : it.status!=='new';
  const box=$('insOpts');
  q.options.forEach((o,i)=>{
    const b=optButton(i,o.t);
    if(answered){ b.disabled=true; if(o.ok){ b.classList.add('right'); optFb(b,true,o.fb); } else b.classList.add('dim'); }
    else b.onclick=()=>choose(it,which,i,b);
    box.appendChild(b);
  });
  renderNext(it,which,answered);
  focusFirst();
}
function choose(it,which,i,btn){
  const q = which==='glass' ? it.glassQ : it, o=q.options[i];
  // only the latest wrong answer keeps its feedback open; earlier ones keep their cross
  if(!o.ok){ [...$('insOpts').children].forEach(b=>{ const f=b.querySelector('.ofb'); if(f) f.remove(); }); btn.classList.add('wrong'); btn.disabled=true; optFb(btn,false,o.fb); focusFirst(); return; }
  [...$('insOpts').children].forEach(b=>{ b.disabled=true; if(b!==btn){ b.classList.add('dim'); const f=b.querySelector('.ofb'); if(f) f.remove(); } });
  btn.classList.add('right'); optFb(btn,true,o.fb);
  if(which==='glass') it.glassAnswered=true;
  else it.status = it.action==='none' ? 'done' : 'answered';
  renderNext(it,which,true); updateHUD();
  if(it.status==='done') checkFinish();
  setTimeout(()=>{ const b=$('insActions').querySelector('button'); if(b) b.focus({preventScroll:true}); },40);
}
function renderNext(it,which,answered){
  const L=[]; let text='', lead='Next:';
  if(answered){
    if(it.status==='done'){ text = it.action==='none' ? '' : it.done; lead='Done.'; }
    else if(which==='glass' || (it.action==='glass' && it.status==='carrying')) text = it.glassAnswered ? it.glassQ.next : '';
    else if(it.status==='carrying') text=it.carrying;
    else if(it.action==='carry'){ text=it.next; if(!hands.kind) L.push([it.prep,()=>{ closePanel(); pickUp(it); },'navy']); }
    else if(it.action==='glass'){ text=it.next; if(hands.kind==='tool') L.push(['Sweep up the glass',()=>{ closePanel(); pickGlass(it); },'navy']); }
    else if(it.action!=='none'){ text = hasLabels ? it.nextHave : it.next; if(hasLabels) L.push([it.labelVerb||'Put a label on it',()=>{ closePanel(); applyLabel(it); },'navy']); }
    L.push(['Continue',closePanel, L.length?'':'primary']);
  }
  actions(L);
  $('insNext').innerHTML = text ? `<b>${lead}</b> ${text}` : '';
  $('insNext').classList.toggle('hidden', !text);
  $('insAfter').classList.toggle('hidden', !text && !L.length);
}
function closePanel(){
  $('inspect').classList.add('hidden'); current=null; insFocus=null; state='play';
  lastPrompt='';
  if(pendingSummary){ pendingSummary=false; setTimeout(()=>{ if(state==='play') showSummary(); }, 900); }
  canvas.focus({preventScroll:true});
}
function showSummary(){
  state='summary'; $('summary').classList.remove('hidden'); $('prompt').classList.add('hidden');
  reportComplete(); confetti(); Music.endFade(3900);
  setTimeout(()=>$('btnAgain').focus({preventScroll:true}),30);
}

/* ---------------- HUD ---------------- */
const PLACES = [
  {id:'door', name:DEST.door.title, img:null},
  {id:'receptacle', name:DEST.receptacle.title, img:'receptacle'},
  {id:'labels', name:'Biohazard Labels (Office Desk)', img:'labels'},
  {id:'cleanup', name:'Cleanup Supplies', img:'cleanup'},
  {id:'labSharps', name:'Sharps Container (Lab Prep Counter)', img:null}
];
function buildHUD(){
  const g=$('groups');
  g.innerHTML = AREAS.map(a=>`<div class="area" id="ar-${a.id}">
    <button class="area-btn" aria-expanded="false" aria-controls="ul-${a.id}"><span>${a.name}</span><small id="arc-${a.id}"></small>${CHEV}</button>
    <ul id="ul-${a.id}" class="hidden">${items.filter(i=>i.area===a.id).map(it=>`<li id="li-${it.id}"><button data-id="${it.id}"><img src="${THUMBS[it.id]}" alt=""><span><b>${it.name}</b><small>${it.where}</small></span><span class="chk" aria-hidden="true">${CHECK}</span></button></li>`).join('')}</ul></div>`).join('')
    + `<div class="area" id="ar-places"><button class="area-btn" aria-expanded="false" aria-controls="ul-places"><span>Go To</span><small></small>${CHEV}</button>
    <ul id="ul-places" class="hidden">${PLACES.map(p=>`<li><button data-place="${p.id}"><img src="${p.img?THUMBS[p.img]:THUMBS.counterSharps}" alt=""><span><b>${p.name}</b></span><span></span></button></li>`).join('')}</ul></div>`;
  g.querySelectorAll('.area-btn').forEach(b=>b.addEventListener('click',()=>{ const open=b.getAttribute('aria-expanded')!=='true';
    g.querySelectorAll('.area-btn').forEach(o=>{ const on=o===b&&open; o.setAttribute('aria-expanded',on); $(o.getAttribute('aria-controls')).classList.toggle('hidden',!on); }); }));
  g.querySelectorAll('button[data-id]').forEach(b=>b.addEventListener('click',()=>{ if(state!=='play'&&state!=='inspect') return; const it=itemById(b.dataset.id);
    openQuestion(it, it.action==='glass' && it.status==='carrying' ? 'glass':'main', true); }));
  g.querySelectorAll('button[data-place]').forEach(b=>b.addEventListener('click',()=>{ if(state==='inspect') closePanel(); if(state!=='play') return; const f=FIXED[b.dataset.place]; stepTo(f.point, f.pos); canvas.focus({preventScroll:true}); }));
}
function updateHUD(){
  const n=items.filter(i=>i.action!=='none' && i.status==='done').length;
  $('hudSub').textContent=`Issues fixed: ${n} of ${FIX_TOTAL}`; $('hudBar').style.width=(n/FIX_TOTAL*100)+'%';
  AREAS.forEach(a=>{ const list=items.filter(i=>i.area===a.id), d=list.filter(i=>i.status==='done').length;
    $('arc-'+a.id).textContent=`${d} of ${list.length} done`; $('ar-'+a.id).classList.toggle('done', d===list.length); setAreaSign(a.id, d===list.length); });
  items.forEach(it=>{ const li=$('li-'+it.id); li.classList.toggle('done',it.status==='done'); li.classList.toggle('todo',it.status==='answered'||it.status==='carrying'); li.classList.toggle('near', !!nearT && nearT.id===it.id);
    li.querySelector('button').setAttribute('aria-label', `${it.name}, ${it.where}${it.status==='done'?', done':it.status==='new'?'':', needs fixing'}`);
    it.marker.material.map = it.status==='done'?BUB.done:(it.status==='new'?BUB.inspect:BUB.todo); });
  const holding = hands.kind==='item' ? `Holding: ${hands.item.lower}` : hands.kind==='tool' ? `Holding: ${TOOL_NAME[hands.tool]}` : hands.kind==='glass' ? 'Holding: broken glass' : 'Hands free';
  $('inv').innerHTML = `<span class="chip ${hands.kind?'on':''}">${holding}</span><span class="chip ${hasLabels?'on':''}">${hasLabels?'Biohazard labels ✓':'No labels yet'}</span>`;
}
function resetAll(){
  tweens.length=0;
  items.forEach(it=>{
    it.status='new'; it.glassAnswered=false; scene.add(it.obj); it.obj.visible=true; it.obj.scale.setScalar(it.baseScale);
    it.obj.position.set(...it.place.pos); it.obj.rotation.set(0,it.place.rot,0);
    if(it.obj.userData.label) it.obj.userData.label.visible=false;
    if(it.obj.userData.extra) it.obj.userData.extra.visible=false;
    if(it.obj.userData.unseal) it.obj.userData.unseal();
    if(it.obj.userData.untie) it.obj.userData.untie();
    if(it.spare) it.spare.visible=false;
    if(it.col) it.col.on=true;
  });
  rackBack(); hands={kind:null,item:null,tool:null}; hasLabels=false;
  P.pos.set(START.x,0,START.z); P.rot=START.rot; P.speed=0; resetView(); autoYaw=0;
  pendingSummary=false; updateHUD();
}


/* ================================================================== */
/*  MUSIC: a soft bossa-nova "elevator" loop, generated in code       */
/*  (Web Audio), so there are no audio files to license.               */
/* ================================================================== */
const MUSIC_VOL=.5, BPM=88, E8=60/BPM/2;           // E8 = one eighth note
const hz=m=>440*Math.pow(2,(m-69)/12);
// one bar per chord: [bass, chord tones...]; 8-bar loop
const BARS=[
  [48,[52,55,59,62]], [45,[48,52,55,59]], [50,[53,57,60,64]], [43,[53,57,59,64]],
  [52,[55,59,62,66]], [45,[55,61,64,67]], [50,[53,57,60,65]], [43,[53,59,62,65]]
];
const COMP=[0,3,5];                                  // bossa comping hits (eighths in the bar)
const BASSLINE=[[0,0],[3,7],[4,0],[7,7]];            // [eighth, interval above root]
function musicGraph(ctx){
  const master=ctx.createGain(); master.gain.value=0; master.connect(ctx.destination);
  const glue=ctx.createDynamicsCompressor(); glue.threshold.value=-20; glue.ratio.value=3; glue.attack.value=.01; glue.release.value=.25; glue.connect(master);
  const mkVerb=(sec,decay,seed)=>{ const len=Math.floor(ctx.sampleRate*sec), ir=ctx.createBuffer(2,len,ctx.sampleRate), R=rng(seed);
    for(let c=0;c<2;c++){ const d=ir.getChannelData(c); for(let i=0;i<len;i++) d[i]=(R()*2-1)*Math.pow(1-i/len,decay); } const v=ctx.createConvolver(); v.buffer=ir; return v; };
  // music bus: warm and a little distant, like ceiling speakers
  const mTone=ctx.createBiquadFilter(); mTone.type='lowpass'; mTone.frequency.value=2300; mTone.connect(glue);
  const mDry=ctx.createGain(); mDry.gain.value=.75; mDry.connect(mTone);
  const mRev=mkVerb(2.2,2.8,5), mWet=ctx.createGain(); mWet.gain.value=.38; mRev.connect(mWet); mWet.connect(mTone);
  const noise=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate), nd=noise.getChannelData(0), NR=rng(3); for(let i=0;i<nd.length;i++) nd[i]=NR()*2-1;
  return {ctx, master, mDry, mRev, noise, next:0, bar:0, eighth:0, R:rng(77)};
}
/* ---- music voices ---- */
function env(g,t,a,peak,hold,rel,pluck){ g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(peak,t+a); if(pluck) g.gain.setTargetAtTime(0,t+a,hold); else { g.gain.setValueAtTime(peak,t+a+hold); g.gain.linearRampToValueAtTime(0,t+a+hold+rel); } }
function toMusic(G,node,wet){ node.connect(G.mDry); if(wet) node.connect(G.mRev); }
function epiano(G,m,t,dur,vel){ // Rhodes-style: sine carrier, decaying FM bark, gentle tremolo
  const c=G.ctx, car=c.createOscillator(), mod=c.createOscillator(), mg=c.createGain(), g=c.createGain();
  car.frequency.value=hz(m); mod.frequency.value=hz(m)*1.0; mg.gain.setValueAtTime(hz(m)*.9,t); mg.gain.exponentialRampToValueAtTime(hz(m)*.08,t+.3);
  mod.connect(mg); mg.connect(car.frequency);
  env(g,t,.012,.028*vel,dur*.45,0,true);
  car.connect(g); toMusic(G,g,true); car.start(t); mod.start(t); car.stop(t+dur*2.5+.2); mod.stop(t+dur*2.5+.2);
}
function bassNote(G,m,t,dur){
  const c=G.ctx, o=c.createOscillator(), o2=c.createOscillator(), g=c.createGain(), lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=600;
  o.type='sine'; o.frequency.value=hz(m-12); o2.type='triangle'; o2.frequency.value=hz(m-12);
  const g2=c.createGain(); g2.gain.value=.35; o2.connect(g2); g2.connect(lp); o.connect(lp); lp.connect(g);
  env(g,t,.012,.11,dur*.5,0,true); toMusic(G,g,false); o.start(t); o2.start(t); o.stop(t+dur*2+.1); o2.stop(t+dur*2+.1);
}
function brush(G,t,accent){
  const c=G.ctx, s=c.createBufferSource(), bp=c.createBiquadFilter(), g=c.createGain(); s.buffer=G.noise; bp.type='bandpass'; bp.frequency.value=7000; bp.Q.value=.8;
  s.connect(bp); bp.connect(g); env(g,t,.006,accent?.009:.005,accent?.08:.04,0,true); toMusic(G,g,false); s.start(t,G.R()*1.5); s.stop(t+.4);
}
function vibes(G,m,t){
  const c=G.ctx, o=c.createOscillator(), o2=c.createOscillator(), g=c.createGain(), g2=c.createGain(), trem=c.createOscillator(), tg=c.createGain();
  o.frequency.value=hz(m); o2.frequency.value=hz(m)*4; trem.frequency.value=5.2; tg.gain.value=.25; trem.connect(tg);
  const amp=c.createGain(); amp.gain.value=1; tg.connect(amp.gain);
  o.connect(g); o2.connect(g2); g2.connect(g); env(g2,t,.002,.25,.08,0,true); env(g,t,.004,.028,.7,0,true);
  g.connect(amp); toMusic(G,amp,true); [o,o2,trem].forEach(x=>{ x.start(t); x.stop(t+3); });
}
function musicStep(G,t){
  const [root,chord]=BARS[G.bar%BARS.length], e=G.eighth;
  if(COMP.includes(e)) chord.forEach((m,i)=>epiano(G,m,t+i*.008,e===0?E8*3:E8*2,(e===0?1:.8)*(.85+G.R()*.2)));
  BASSLINE.forEach(([pos,iv])=>{ if(pos===e) bassNote(G,root+iv,t,E8*(pos%4===0?3:1)); });
  brush(G,t,e%2===0);
  if(e%2===0 && G.R()<(e===0?.35:.22)){ const tones=chord.map(n=>n+12).concat([chord[0]+24]); vibes(G,tones[(G.R()*tones.length)|0],t); }
}
function musicSchedule(G, until){
  while(G.next<until){
    musicStep(G,G.next);
    G.next+=E8*(G.eighth%2===0?1.08:.92);               // a light swing
    if(++G.eighth===8){ G.eighth=0; G.bar++; }
  }
}
const Music=(function(){
  let G=null, timer=0, on=true;
  try{ on = localStorage.getItem('fts-music')!=='off'; }catch(e){}
  function ui(){ const b=$('btnMusic'); b.setAttribute('aria-pressed',on); b.setAttribute('aria-label', on?'Turn music off':'Turn music on'); b.title = on?'Music on (M)':'Music off (M)'; }
  function fade(v,s){ const m=G.master.gain, t=G.ctx.currentTime; m.cancelScheduledValues(t); m.setValueAtTime(m.value,t); m.linearRampToValueAtTime(v,t+s); }
  function play(){
    try{
      if(!G) G=musicGraph(new (window.AudioContext||window.webkitAudioContext)());
      G.ctx.resume();
      if(!timer){ G.next=Math.max(G.next,G.ctx.currentTime+.1); timer=setInterval(()=>musicSchedule(G,G.ctx.currentTime+1.6),250); musicSchedule(G,G.ctx.currentTime+1.6); }
      fade(MUSIC_VOL,3);
    }catch(e){}
  }
  let ended=false, endTimer=0;
  function halt(){ clearInterval(timer); timer=0; G.ctx.suspend(); }
  function stop(){ if(!G) return; fade(0,1.2); setTimeout(()=>{ if(!on) halt(); },1400); }
  ui();
  return {
    start(){ if(on) play(); ui(); },
    // end screen: let the confetti play, then fade the music out; Try again brings it back
    endFade(afterMs){ ended=true; clearTimeout(endTimer); endTimer=setTimeout(()=>{ if(!G||!ended) return; fade(0,1.6); setTimeout(()=>{ if(ended) halt(); },1800); },afterMs); },
    restart(){ ended=false; clearTimeout(endTimer); if(on) play(); },
    get ended(){ return ended; },
    toggle(){ on=!on; try{ localStorage.setItem('fts-music', on?'on':'off'); }catch(e){} on?play():stop(); ui(); live(on?'Music on':'Music off'); },
    hidden(h){ if(!G) return; if(h) G.ctx.suspend(); else if(on && timer) G.ctx.resume(); },
    get on(){ return on; }, get ctx(){ return G&&G.ctx; }
  };
})();
document.addEventListener('visibilitychange',()=>Music.hidden(document.hidden));
$('btnMusic').onclick=()=>{ Music.toggle(); canvas.focus({preventScroll:true}); };

/* intro / buttons */
function start(){ if(state!=='intro') return; state='play'; $('intro').classList.add('hidden'); Music.start();
  ['hud','tools'].forEach(id=>$(id).classList.remove('hidden'));
  showControls();
  updateHUD(); canvas.focus({preventScroll:true}); }
$('btnStart').onclick=start;
$('insClose').onclick=closePanel;
$('promptBtn').onclick=()=>{ if(nearT && nearT.act && state==='play') nearT.act(); };
$('btnAgain').onclick=()=>{ $('summary').classList.add('hidden'); state='play'; resetAll(); Music.restart(); canvas.focus({preventScroll:true}); };
$('btnExplore').onclick=()=>{ $('summary').classList.add('hidden'); state='play'; canvas.focus({preventScroll:true}); };
$('btnHelp').onclick=()=>{ if(state==='play'){ showControls(); state='intro'; $('intro').classList.remove('hidden'); $('btnStart').textContent='Back to the floor'; $('btnStart').focus(); } };
let zoom=1;
$('btnZoomIn').onclick=()=>{ zoom=Math.max(.5,zoom-.15); };
$('btnZoomOut').onclick=()=>{ zoom=Math.min(1.45,zoom+.15); };
$('btnReset').onclick=()=>resetView();
$('sumList').innerHTML = SUMMARY.map(t=>`<li><span class="dot" aria-hidden="true">${CHECK}</span><span>${t}</span></li>`).join('');

/* input */
const keys=new Set();
const ACT=c=>c==='Enter'||c==='NumpadEnter'||c==='Space';
addEventListener('keydown',e=>{
  const k=e.code, onButton=e.target && e.target.closest && e.target.closest('button');
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k) && state==='play') e.preventDefault();
  if(k==='Space' && !onButton) e.preventDefault();
  switch(state){
    case 'intro': if(k==='Escape' && $('btnStart').textContent!=='Start') start(); break;
    case 'play':
      keys.add(k);
      if(e.repeat) break;
      if(ACT(k) && !onButton && nearT && nearT.act){ e.preventDefault(); nearT.act(); }
      else if(k==='KeyR') resetView();
      else if(k==='KeyM') Music.toggle();
      break;
    case 'inspect':
      if(k==='Escape') closePanel();
      else if(/^(Digit|Numpad)[1-4]$/.test(k)){ const b=$('insOpts').children[+k.slice(-1)-1]; if(b && !b.disabled) b.click(); }
      break;
    case 'summary': if(k==='Escape') $('btnExplore').click(); break;
  }
});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>keys.clear());

let userYaw=0, autoYaw=0, camPitch=.68, curYaw=0, curPitch=.68, curDist=8;
const camFocus=new THREE.Vector3(0,1,0);
function resetView(){ userYaw=0; camPitch=.68; zoom=1; }
// look south when the player is on the lab/office side, north when at the stations
function zoneYaw(force){ if(P.pos.z>2.2) autoYaw=PI; else if(P.pos.z<.4) autoYaw=0; else if(force) autoYaw = P.pos.z>1.3?PI:0; }
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2(), floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
let down=null;
canvas.addEventListener('pointerdown',e=>{
  if(state!=='play' && state!=='inspect') return;
  down={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,moved:false};
  try{ canvas.setPointerCapture(e.pointerId); }catch(_){}
});
canvas.addEventListener('pointermove',e=>{
  if(!down) return;
  const dx=e.clientX-down.lx, dy=e.clientY-down.ly; down.lx=e.clientX; down.ly=e.clientY;
  if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>6){ down.moved=true; app.classList.add('dragging'); }
  if(down.moved && state==='play'){ userYaw-=dx*.006; camPitch=Math.min(1.35,Math.max(.32,camPitch+dy*.004)); }
});
canvas.addEventListener('pointerup',e=>{
  if(!down) return; const d=down; down=null; app.classList.remove('dragging');
  if(d.moved || state!=='play') return;
  const r=canvas.getBoundingClientRect();
  ndc.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
  ray.setFromCamera(ndc,camera);
  const objs=[]; items.forEach(it=>{ if(it.obj.visible && it.obj.parent===scene){ objs.push(it.obj); if(it.marker.visible) objs.push(it.marker); } });
  Object.values(FIXED).forEach(f=>objs.push(f.obj));
  const hit=ray.intersectObjects(objs,true)[0];
  if(hit){ let o=hit.object; while(o && !o.userData.itemId && !o.userData.fixedId) o=o.parent;
    if(o){ const id=o.userData.itemId||o.userData.fixedId; const pt=o.userData.itemId?itemById(id).place.point:FIXED[id].point;
      goal=id; autoTarget=new THREE.Vector3(pt[0],0,pt[1]); stuckT=0; return; } }
  const pt=new THREE.Vector3(); if(ray.ray.intersectPlane(floorPlane,pt)){ goal=null; autoTarget=pt; stuckT=0; tapMark.position.set(pt.x,.015,pt.z); tapMark.material.opacity=.9; }
});
canvas.addEventListener('pointercancel',()=>{ down=null; app.classList.remove('dragging'); });
canvas.addEventListener('contextmenu',e=>e.preventDefault());
function resize(){ const w=app.clientWidth, h=app.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(app); resize();


/* ---------------- controls card: shown at start, fades once the player is moving ---------------- */
let ctlTimer=0, movedOnce=false;
function showControls(){ const c=$('controls'); if(app.clientWidth<=820) return; c.classList.remove('hidden','fade'); app.classList.add('ctl'); movedOnce=false; clearTimeout(ctlTimer); ctlTimer=setTimeout(hideControls,15000); }
function hideControls(){ $('controls').classList.add('fade'); app.classList.remove('ctl'); clearTimeout(ctlTimer); }

/* ---------------- anything between the camera and what you're looking at fades out ---------------- */
const OCC=[], occMeshes=[];
function occluder(obj){
  const meshes=[];
  obj.traverse(m=>{ if(!m.isMesh) return;
    m.material = Array.isArray(m.material) ? m.material.map(x=>x.clone()) : m.material.clone();
    (Array.isArray(m.material)?m.material:[m.material]).forEach(mm=>{ mm.userData.o0=mm.opacity; mm.userData.t0=mm.transparent; mm.userData.d0=mm.depthWrite; });
    m.userData.occ=OCC.length; meshes.push(m); occMeshes.push(m); });
  OCC.push({meshes, a:1, hit:false});
}
const occRay=new THREE.Raycaster();
function updateOcclusion(dt){
  OCC.forEach(o=>o.hit=false);
  const targets=[];
  if(state==='inspect' && insFocus){ const t=insFocus.pos.clone(); targets.push(t, t.clone().add(new THREE.Vector3(0,.35,0))); }
  else if(state==='play'){ targets.push(P.pos.clone().setY(1.1), P.pos.clone().setY(.4)); }
  targets.forEach(t=>{ const dir=camera.position.clone().sub(t), dist=dir.length(); occRay.set(t, dir.normalize()); occRay.far=dist-.2;
    occRay.intersectObjects(occMeshes,false).forEach(h=>OCC[h.object.userData.occ].hit=true); });
  OCC.forEach(o=>{ const tgt=o.hit?.16:1; if(Math.abs(o.a-tgt)<.003) return; o.a+=(tgt-o.a)*Math.min(1,dt*8); if(Math.abs(o.a-tgt)<.01) o.a=tgt;
    o.meshes.forEach(m=>(Array.isArray(m.material)?m.material:[m.material]).forEach(mm=>{ mm.opacity=mm.userData.o0*o.a; mm.transparent=mm.userData.t0||o.a<.999; mm.depthWrite=mm.userData.d0&&o.a>.97; })); });
}

/* ---------------- confetti on the end screen ---------------- */
function confetti(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c=$('confetti'), g=c.getContext('2d'), W=c.width=app.clientWidth*devicePixelRatio, H=c.height=app.clientHeight*devicePixelRatio;
  c.classList.remove('hidden');
  const cols=['#283764','#0069B1','#00A8E4','#FFA81E','#E14B63','#E6F5FF','#F1B534'], R=Math.random, s=devicePixelRatio;
  const ps=Array.from({length:170},()=>({x:W*(.2+R()*.6), y:H*(.25+R()*.15), vx:(R()-.5)*14*s, vy:(-6-R()*12)*s, w:(6+R()*7)*s, h:(3+R()*5)*s, r:R()*6, vr:(R()-.5)*.35, c:cols[(R()*cols.length)|0], round:R()<.25}));
  const t0=performance.now();
  (function step(now){
    const t=(now-t0)/1000; g.clearRect(0,0,W,H);
    ps.forEach(p=>{ p.vy+=.32*s; p.vx*=.992; p.x+=p.vx; p.y+=p.vy; p.r+=p.vr;
      g.save(); g.globalAlpha=Math.max(0,1-Math.max(0,t-2.6)/1.2); g.translate(p.x,p.y); g.rotate(p.r); g.fillStyle=p.c;
      if(p.round){ g.beginPath(); g.arc(0,0,p.w/2.4,0,7); g.fill(); } else g.fillRect(-p.w/2,-p.h/2,p.w,p.h*Math.abs(Math.cos(p.r*1.7))+1);
      g.restore(); });
    if(t<3.9) requestAnimationFrame(step); else { g.clearRect(0,0,W,H); c.classList.add('hidden'); }
  })(t0);
}

/* ================================================================== */
/*  LOOP                                                               */
/* ================================================================== */
const PR=.3;
function blocked(x,z){ for(const b of colliders){ if(b.on && x+PR>b.minX && x-PR<b.maxX && z+PR>b.minZ && z-PR<b.maxZ) return true; } return false; }
function angLerp(a,b,k){ let d=((b-a+PI)%(PI*2)+PI*2)%(PI*2)-PI; return a+d*k; }
function camOffset(yaw,pitch,dist){ return new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch)*dist, Math.sin(pitch)*dist, Math.cos(yaw)*Math.cos(pitch)*dist); }
function fadeWall(list,hide,dt){ const target=hide?.12:1; list.forEach(m=>{ const o=m.material.opacity+(target-m.material.opacity)*Math.min(1,dt*8); m.material.opacity=o; m.material.depthWrite=o>.97; }); }
function animatePerson(p,phase,amp,carrying){
  const s=Math.sin(phase);
  p.legL.rotation.x=s*.65*amp; p.legR.rotation.x=-s*.65*amp;
  if(carrying){ p.armL.rotation.x=-1.25; p.armR.rotation.x=-1.25; }
  else { p.armL.rotation.x=-s*.55*amp; p.armR.rotation.x=s*.55*amp; }
  p.body.position.y=Math.abs(Math.cos(phase))*.05*amp;
}
let camStarted=false, introT=0, inputYaw=0, wasKeys=false, lastPrompt='', turning=0;
function updateCamera(dt){
  if(state==='loading'||(state==='intro' && !camStarted)){
    introT+=dt; const a=introT*.07+.35;
    camera.position.set(Math.sin(a)*8.5, 10, Math.cos(a)*5.5); camera.lookAt(0,0,0); return;
  }
  // narrow or portrait frames (tablet upright) see less sideways, so pull the camera back
  const aspectK=Math.min(1.9, Math.max(1, 1.5/camera.aspect));
  let focus=P.pos.clone(), dist=7.6*zoom*aspectK, pitch=camPitch, yawT=autoYaw+userYaw;
  focus.x-=Math.sin(curYaw)*2.2; focus.z-=Math.cos(curYaw)*2.2; focus.y=1.25;
  if(state==='inspect' && insFocus){
    // frame the item's centre in the open space above the panel, whatever the panel's height
    const frac=Math.min(.8, $('inspect').offsetHeight/Math.max(1,app.clientHeight));
    dist=Math.max(3.2, insFocus.h*2.3)*Math.pow(aspectK,.6)*(1+frac*.35);
    focus=insFocus.pos.clone(); focus.y-=.42*frac*dist; pitch=Math.min(camPitch,.5); yawT=insFocus.yaw; }
  if(!camStarted){ camStarted=true; camFocus.copy(focus); curDist=dist+5; curYaw=yawT; }
  const k=1-Math.exp(-dt*5);
  camFocus.lerp(focus,k); curYaw=angLerp(curYaw,yawT,state==='inspect'?k*.8:1-Math.exp(-dt*((down&&down.moved)||turning?16:3.2)));
  curPitch+=(pitch-curPitch)*k; curDist+=(dist-curDist)*k;
  camera.position.copy(camFocus).add(camOffset(curYaw,curPitch,curDist)); camera.lookAt(camFocus);
}
const clock=new THREE.Clock();
function frame(){
  const dt=Math.min(clock.getDelta(),.05), t=clock.elapsedTime;
  let ix=0, iz=0;
  if(state==='play'){
    if(keys.has('ArrowUp')) iz-=1;
    if(keys.has('ArrowDown')) iz+=1;
    if(keys.has('ArrowLeft')) ix-=1;
    if(keys.has('ArrowRight')) ix+=1;
    const usingKeys=!!(ix||iz);
    if(usingKeys && !wasKeys) inputYaw=curYaw; // hold the control basis steady while keys are down
    wasKeys=usingKeys;
    if(usingKeys){ autoTarget=null; goal=null;
      const l=Math.hypot(ix,iz); ix/=l; iz/=l; const c=Math.cos(inputYaw), s=Math.sin(inputYaw); [ix,iz]=[ix*c+iz*s,-ix*s+iz*c]; }
    else if(autoTarget){
      const dx=autoTarget.x-P.pos.x, dz=autoTarget.z-P.pos.z, d=Math.hypot(dx,dz);
      if(d<.12) arrive(); else { ix=dx/d; iz=dz/d; }
    }
  }
  const moving=ix||iz;
  if(moving){
    const target=(keys.has('ShiftLeft')||keys.has('ShiftRight'))?5.6:3.6;
    P.speed+=(target-P.speed)*Math.min(1,dt*10);
    const ox=P.pos.x, oz=P.pos.z, nx=P.pos.x+ix*P.speed*dt, nz=P.pos.z+iz*P.speed*dt;
    if(!blocked(nx,P.pos.z)) P.pos.x=nx;
    if(!blocked(P.pos.x,nz)) P.pos.z=nz;
    if(autoTarget){ const prog=Math.hypot(P.pos.x-ox,P.pos.z-oz); stuckT=prog<P.speed*dt*.25?stuckT+dt:0; if(stuckT>.35) arrive(true); }
    P.rot=angLerp(P.rot,Math.atan2(ix,iz),Math.min(1,dt*12));
    P.phase+=dt*P.speed*2.4;
  } else {
    P.speed*=Math.max(0,1-dt*12);
    P.phase+=(Math.round(P.phase/PI)*PI-P.phase)*Math.min(1,dt*10);
  }
  // Q and E turn the view from the keyboard (dragging is optional)
  turning = state==='play' ? (keys.has('KeyQ')?1:0)-(keys.has('KeyE')?1:0) : 0;
  if(turning) userYaw += turning*dt*1.7;
  if(state==='play') zoneYaw();
  player.group.position.copy(P.pos); player.group.rotation.y=P.rot;
  animatePerson(player,P.phase,Math.min(1,P.speed/3.6),!!hands.kind);
  if(!moving && P.speed<.2) player.body.position.y=Math.sin(t*2)*.006;
  const showP=state!=='inspect'; player.group.visible=pRing.visible=youTag.visible=showP;
  youTag.position.set(P.pos.x,2.5,P.pos.z); pRing.position.set(P.pos.x,.01,P.pos.z);
  tapMark.material.opacity=Math.max(0,tapMark.material.opacity-dt*1.4); tapMark.scale.setScalar(1+(.9-tapMark.material.opacity)*.5);

  // nearest thing to do
  let best=null, bd=1.0;
  if(state==='play') targetsNow().forEach(tg=>{ const d=Math.hypot(P.pos.x-tg.x,P.pos.z-tg.z); if(d<bd){ bd=d; best=tg; } });
  const objText = state==='play' && !best ? objective() : null;
  const glassQPending = state==='play' && hands.kind==='glass' && !itemById('glass').glassAnswered;
  if(!best && glassQPending) best=T('glassQ',[P.pos.x,P.pos.z],'Where does the broken glass go?',()=>openQuestion(itemById('glass'),'glass'));
  const key = state!=='play' ? '' : best ? (best.act?'a:':'h:')+best.text : objText ? 'o:'+objText : '';
  if((nearT&&nearT.id)!==(best&&best.id)){ nearT=best; updateHUD(); } else nearT=best;
  if(key!==lastPrompt){ lastPrompt=key; const pr=$('prompt');
    if(!key) pr.classList.add('hidden');
    else { pr.classList.remove('hidden'); const act=key[0]==='a'; pr.classList.toggle('hint',!act); $('promptBtn').classList.toggle('hidden',!act);
      if(act){ $('promptText').textContent=''; $('promptAct').textContent=best.text; }
      else $('promptText').textContent = best ? best.text : objText; } }

  // markers, rings, tags
  items.forEach((it,i)=>{
    it.marker.position.y=it.place.marker[1]+Math.sin(t*2.6+i*1.3)*.045;
    it.marker.visible = it.obj.visible && it.obj.parent===scene && it.status!=='carrying' && state!=='inspect';
    const s=(nearT&&nearT.id===it.id)?1.18:1; it.marker.scale.set(.34*s,.39*s,1);
    const tgt=(nearT&&nearT.id===it.id)||goal===it.id?.85:0; it.ring.material.opacity+=(tgt-it.ring.material.opacity)*Math.min(1,dt*8);
    it.ring.scale.setScalar(1+Math.sin(t*4)*.05);
  });
  // floating signs that come very close to the camera fade so they never fill the view
  // and the destination signs fade while the player stands right under them
  SIGNS.forEach(s=>{ let o=Math.min(1,Math.max(.12,(camera.position.distanceTo(s.position)-2.6)/2.2));
    if(DEST_SIGNS.includes(s) && state==='play') o=Math.min(o,Math.max(.2,(Math.hypot(P.pos.x-s.position.x,P.pos.z-s.position.z)-1.1)/1.4));
    s.material.opacity+=(o-s.material.opacity)*Math.min(1,dt*8); });
  TAGS.forEach(s=>{ const d=Math.hypot(P.pos.x-s.position.x,P.pos.z-s.position.z); const tgt=(state==='play'&&d<3.2)?1:0; s.material.opacity+=(tgt-s.material.opacity)*Math.min(1,dt*6); s.visible=s.material.opacity>.02; });

  for(let i=tweens.length-1;i>=0;i--){ const w=tweens[i]; w.t+=dt/w.dur; const k=Math.min(1,w.t); w.fn(ease(k)); if(k>=1){ tweens.splice(i,1); if(w.done) w.done(); } }
  if(doorFlash>0) doorFlash=Math.max(0,doorFlash-dt*.8);
  doorMat.opacity=doorFlash*.9; doorGlow.scale.set(1,1+doorFlash*6,1);

  updateCamera(dt);
  updateOcclusion(dt);
  if(moving && !movedOnce && app.classList.contains('ctl')){ movedOnce=true; clearTimeout(ctlTimer); ctlTimer=setTimeout(hideControls,4000); }
  fadeWall(OUTER.north, camera.position.z<-6.9, dt);
  fadeWall(OUTER.south, camera.position.z>6.9, dt);
  fadeWall(OUTER.west, camera.position.x<-10.9, dt);
  fadeWall(OUTER.east, camera.position.x>10.9, dt);

  renderer.render(scene,camera);
  if(!DEBUG) requestAnimationFrame(frame);
}
function arrive(stuck){
  const id=goal; autoTarget=null; goal=null; stuckT=0;
  if(!id) return;
  const tg=targetsNow().find(x=>x.id===id);
  if(!tg) return;
  if(stuck && Math.hypot(P.pos.x-tg.x,P.pos.z-tg.z)>3.5) return;
  if(tg.act) tg.act(); else toast(tg.text);
}

/* boot */
OCC_LATER.forEach(occluder);
buildHUD(); updateHUD();
if(DEBUG) window.__fts={items,P,camera,camFocus,targetsNow,get hands(){return hands;},get hasLabels(){return hasLabels;},get state(){return state;},get userYaw(){return userYaw;},get reported(){return reported;}, Music,
  // QA: render the music offline and measure its level
  async renderMusic(sec){ const oc=new OfflineAudioContext(2,Math.floor(44100*sec),44100), G=musicGraph(oc); G.master.gain.value=MUSIC_VOL; musicSchedule(G,sec); const b=await oc.startRendering(); const d0=b.getChannelData(0), W=441; let prev=null, jump=0; for(let i=W*20;i+W<d0.length;i+=W){ let e=0; for(let k=i;k<i+W;k++) e+=d0[k]*d0[k]; const r=20*Math.log10(Math.sqrt(e/W)+1e-6); if(prev!==null && r>-50) jump=Math.max(jump,r-prev); prev=r; } let peak=0,sum=0,n=0; for(let c=0;c<2;c++){ const d=b.getChannelData(c); for(let i=0;i<d.length;i++){ const v=Math.abs(d[i]); if(v>peak) peak=v; sum+=d[i]*d[i]; n++; } } const db=x=>+(20*Math.log10(x)).toFixed(1); return {peakDb:db(peak), rmsDb:db(Math.sqrt(sum/n)), maxRiseDbPer10ms:+jump.toFixed(1)}; }};
$('loading').classList.add('hidden'); $('intro').classList.remove('hidden'); state='intro';
setTimeout(()=>$('btnStart').focus({preventScroll:true}),50);
if(DEBUG) setInterval(frame,33); else requestAnimationFrame(frame);
})();
</script>
</body>
</html>
