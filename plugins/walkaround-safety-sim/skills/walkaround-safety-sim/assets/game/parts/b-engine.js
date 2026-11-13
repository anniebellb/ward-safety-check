/* ================================================================== */
/*  THREE SETUP                                                        */
/* ================================================================== */
const app = $('app'), canvas = $('scene');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = false;

const PALE = 0xE6F5FF;
const scene = new THREE.Scene();
scene.background = lin(PALE);
scene.fog = new THREE.Fog(lin(PALE), 26, 60);
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 150);

function lin(hex){ return new THREE.Color(hex).convertSRGBToLinear(); }

/* soft studio environment for glossy vinyl, plastic and metal */
(function(){
  const env = new THREE.Scene();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({side:THREE.BackSide, vertexColors:true}));
  const cols=[], pos=sky.geometry.attributes.position, top=lin(0xffffff).multiplyScalar(.42), mid=lin(0xeef5fb).multiplyScalar(.36), bot=lin(0x9aa6b4).multiplyScalar(.3), c=new THREE.Color();
  for(let i=0;i<pos.count;i++){ const y=pos.getY(i)/20; if(y>0) c.copy(mid).lerp(top,y); else c.copy(mid).lerp(bot,-y); cols.push(c.r,c.g,c.b); }
  sky.geometry.setAttribute('color', new THREE.Float32BufferAttribute(cols,3));
  env.add(sky);
  const lamp = new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,1.6,1.6)});
  [[-6,14,-4],[6,14,4],[0,14,-8]].forEach(([x,y,z])=>{ const p=new THREE.Mesh(new THREE.PlaneGeometry(6,2),lamp); p.position.set(x,y,z); p.rotation.x=Math.PI/2; env.add(p); });
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(env, 0.03).texture;
  pm.dispose();
})();

scene.add(new THREE.HemisphereLight(lin(0xffffff), lin(0xcdd6e0), 0.22));
const sun = new THREE.DirectionalLight(lin(0xfff4e6), 0.62);
sun.position.set(-9, 20, 11);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {left:-15, right:15, top:12, bottom:-12, near:1, far:60});
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.025;
scene.add(sun);
const fill = new THREE.DirectionalLight(lin(0xdfefff), 0.14); fill.position.set(8, 9, 16); scene.add(fill);

/* materials */
const matCache = {};
function mat(color, opts){
  const key = color + (opts ? JSON.stringify(opts) : '');
  if(!matCache[key]){
    const o = Object.assign({roughness:.75, metalness:0}, opts||{});
    if(o.emissive!==undefined) o.emissive = lin(o.emissive);
    matCache[key] = new THREE.MeshStandardMaterial(Object.assign(o, {color:lin(color)}));
  }
  return matCache[key];
}
const M_ = {
  white: ()=>mat(0xf7f9fb,{roughness:.5}),
  offwhite: ()=>mat(0xeef2f6,{roughness:.6}),
  steel: ()=>mat(0xc3ccd6,{roughness:.32, metalness:.75}),
  darkSteel: ()=>mat(0x59626f,{roughness:.4, metalness:.5}),
  rubber: ()=>mat(0x2c3038,{roughness:.9}),
  navy: ()=>mat(0x283764,{roughness:.55}),
  blue: ()=>mat(0x0069B1,{roughness:.5}),
  vinyl: ()=>mat(0x0069B1,{roughness:.38}),
  vinylDark: ()=>mat(0x1f4f86,{roughness:.45}),
  counterTop: ()=>mat(0xdde6ef,{roughness:.35}),
  screen: ()=>mat(0x111a2c,{roughness:.2}),
  red: ()=>mat(0xc81e2e,{roughness:.42}),
};
function canvasTex(w, h, draw){
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  draw(c.getContext('2d'), w, h);
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding;
  t.anisotropy=renderer.capabilities.getMaxAnisotropy();
  return t;
}
function texMat(tex, opts){ return new THREE.MeshStandardMaterial(Object.assign({map:tex, roughness:.6}, opts||{})); }
function rng(seed){ let a=seed>>>0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function rr(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }

/* geometry helpers */
let CAPTURE = null;
function M(geo, material, x=0, y=0, z=0, parent, shadow=true){
  const m = new THREE.Mesh(geo, typeof material==='number'?mat(material):material);
  m.position.set(x,y,z); m.castShadow=shadow; m.receiveShadow=true;
  (parent||scene).add(m); if(CAPTURE) CAPTURE.push(m); return m;
}
const geoCache = {};
function RB(w,h,d,r){
  const key=[w,h,d,r].map(v=>v.toFixed(4)).join();
  if(geoCache[key]) return geoCache[key];
  r=Math.min(r, w/2.05, h/2.05, d/2.05);
  const iw=w-2*r, ih=h-2*r, cr=Math.max(0.0005, Math.min(r*.8, iw/2.05, ih/2.05));
  const s=new THREE.Shape(), x=-iw/2, y=-ih/2;
  s.moveTo(x+cr,y); s.lineTo(x+iw-cr,y); s.quadraticCurveTo(x+iw,y,x+iw,y+cr); s.lineTo(x+iw,y+ih-cr);
  s.quadraticCurveTo(x+iw,y+ih,x+iw-cr,y+ih); s.lineTo(x+cr,y+ih); s.quadraticCurveTo(x,y+ih,x,y+ih-cr); s.lineTo(x,y+cr); s.quadraticCurveTo(x,y,x+cr,y);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(d-2*r,0.0005), bevelEnabled:true, bevelThickness:r, bevelSize:r, bevelSegments:3, curveSegments:5});
  g.center();
  return geoCache[key]=g;
}
// rounded box, y = bottom
function rb(w,h,d,r,material,x,y,z,parent){ return M(RB(w,h,d,r), material, x, y+h/2, z, parent); }
function bx(w,h,d,material,x,y,z,parent){ return M(new THREE.BoxGeometry(w,h,d), material, x, y+h/2, z, parent); }
function cy(rt,rbm,h,material,x,y,z,parent,seg=24){ return M(new THREE.CylinderGeometry(rt,rbm,h,seg), material, x, y+h/2, z, parent); }
function grp(x=0,y=0,z=0,ry=0,parent){ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; (parent||scene).add(g); return g; }

/* colliders */
const colliders = [];
function addCol(minX,maxX,minZ,maxZ,tag){ const c={minX,maxX,minZ,maxZ,tag,on:true}; colliders.push(c); return c; }

/* ================================================================== */
/*  TEXTURES                                                           */
/* ================================================================== */
function drawBiohazard(g, cx, cy, s, color){
  const c=document.createElement('canvas'); c.width=c.height=256; const q=c.getContext('2d');
  q.translate(128,128); q.fillStyle=color; q.strokeStyle=color;
  const A=i=>-Math.PI/2+i*2*Math.PI/3;
  for(let i=0;i<3;i++){ q.beginPath(); q.arc(Math.cos(A(i))*40,Math.sin(A(i))*40,64,0,7); q.fill(); }
  q.lineWidth=17; q.beginPath(); q.arc(0,0,66,0,7); q.stroke();
  q.globalCompositeOperation='destination-out';
  for(let i=0;i<3;i++){ q.beginPath(); q.arc(Math.cos(A(i))*58,Math.sin(A(i))*58,45,0,7); q.fill(); }
  q.beginPath(); q.arc(0,0,21,0,7); q.fill();
  q.lineWidth=7;
  for(let i=0;i<3;i++){ const a=A(i)+Math.PI; q.beginPath(); q.moveTo(Math.cos(a)*14,Math.sin(a)*14); q.lineTo(Math.cos(a)*40,Math.sin(a)*40); q.stroke(); }
  q.globalCompositeOperation='source-over';
  q.lineWidth=0; q.beginPath(); q.arc(0,0,13,0,7); q.fill();
  q.globalCompositeOperation='destination-out'; q.beginPath(); q.arc(0,0,8,0,7); q.fill();
  g.drawImage(c, cx-s/2, cy-s/2, s, s);
}
const TEX = {};
TEX.floor = canvasTex(1024,1024,(g,w,h)=>{
  const n=4, t=w/n, R=rng(7);
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){
    const l=90+R()*2.5; g.fillStyle=`hsl(210,${16+R()*8}%,${l}%)`; g.fillRect(i*t,j*t,t,t);
    for(let k=0;k<900;k++){ g.fillStyle=`rgba(${R()<.5?'120,140,165':'255,255,255'},${R()*.18})`; const s=1+R()*2.2; g.fillRect(i*t+R()*t,j*t+R()*t,s,s); }
  }
  g.strokeStyle='rgba(150,168,190,.45)'; g.lineWidth=3;
  for(let i=0;i<=n;i++){ g.beginPath(); g.moveTo(i*t,0); g.lineTo(i*t,h); g.stroke(); g.beginPath(); g.moveTo(0,i*t); g.lineTo(w,i*t); g.stroke(); }
});
TEX.floor.wrapS=TEX.floor.wrapT=THREE.RepeatWrapping;
TEX.bayFloor = canvasTex(512,512,(g,w,h)=>{
  const R=rng(11); g.fillStyle='#d9ecfa'; g.fillRect(0,0,w,h);
  for(let k=0;k<3000;k++){ g.fillStyle=`rgba(${R()<.5?'40,90,150':'255,255,255'},${R()*.09})`; g.fillRect(R()*w,R()*h,2,2); }
});
TEX.bayFloor.wrapS=TEX.bayFloor.wrapT=THREE.RepeatWrapping;
TEX.window = canvasTex(512,256,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#bfe3fa'); gr.addColorStop(.7,'#eaf6ff'); gr.addColorStop(1,'#f7fbff');
  g.fillStyle=gr; g.fillRect(0,0,w,h);
  g.fillStyle='rgba(255,255,255,.8)'; [[80,60,90],[300,40,70],[420,90,60]].forEach(([x,y,r])=>{ g.beginPath(); g.ellipse(x,y,r,r*.32,0,0,7); g.fill(); });
  g.fillStyle='rgba(120,160,190,.5)'; for(let x=0;x<w;x+=36){ const hh=30+((x*37)%50); g.fillRect(x,h-hh,30,hh); }
  g.fillStyle='#f4f7fa'; g.fillRect(w/2-5,0,10,h);
  const sh=g.createLinearGradient(0,0,w,h); sh.addColorStop(0,'rgba(255,255,255,.35)'); sh.addColorStop(.5,'rgba(255,255,255,0)'); g.fillStyle=sh; g.fillRect(0,0,w,h);
});
// Vital signs on the patient monitor: heart rate, oxygen and blood pressure, with an ECG line.
TEX.vitalsScreen = canvasTex(320,220,(g,w,h)=>{
  g.fillStyle='#0b1220'; g.fillRect(0,0,w,h);
  g.strokeStyle='#4ade80'; g.lineWidth=3; g.beginPath();
  for(let x=0;x<=200;x+=2){ const t=x%50; const y=60-(t>20&&t<24?36:t>=24&&t<27?-18:0)+Math.sin(x/9)*1.5; x?g.lineTo(10+x,y):g.moveTo(10,y); } g.stroke();
  g.strokeStyle='#38bdf8'; g.lineWidth=2.5; g.beginPath();
  for(let x=0;x<=200;x+=2){ const y=128-Math.max(0,Math.sin(x/8))*18; x?g.lineTo(10+x,y):g.moveTo(10,y); } g.stroke();
  g.textAlign='right';
  g.fillStyle='#4ade80'; g.font='900 46px Lato, sans-serif'; g.fillText('72', 308, 70); g.font='700 14px Lato, sans-serif'; g.fillText('HR', 308, 24);
  g.fillStyle='#38bdf8'; g.font='900 40px Lato, sans-serif'; g.fillText('98', 308, 140); g.font='700 14px Lato, sans-serif'; g.fillText('SpO2', 308, 98);
  g.fillStyle='#f8fafc'; g.font='900 32px Lato, sans-serif'; g.fillText('120/80', 308, 200); g.textAlign='left'; g.font='700 14px Lato, sans-serif'; g.fillText('NIBP', 12, 196);
});
TEX.machineScreen = canvasTex(320,220,(g,w,h)=>{
  g.fillStyle='#0f1d33'; g.fillRect(0,0,w,h);
  g.fillStyle='#0069B1'; g.fillRect(0,0,w,26);
  g.fillStyle='rgba(255,255,255,.85)'; rr(g,10,8,60,10,4); g.fill();
  const panes=[[10,36,145,80],[165,36,145,80],[10,126,300,84]];
  panes.forEach(([x,y,pw,ph],i)=>{
    g.fillStyle='rgba(255,255,255,.06)'; rr(g,x,y,pw,ph,8); g.fill();
    g.strokeStyle=i===1?'#FFA81E':'#00A8E4'; g.lineWidth=3; g.beginPath();
    for(let k=0;k<=pw-20;k+=3){ const yy=y+ph/2+Math.sin(k/(i===2?14:9)+i)*ph*.22*(i===2?Math.sin(k/60)+1.2:1); k?g.lineTo(x+10+k,yy):g.moveTo(x+10+k,yy); }
    g.stroke();
  });
  g.fillStyle='rgba(255,255,255,.12)'; for(let k=0;k<4;k++){ rr(g,14+k*76,186-0,64,16,5); }
});
TEX.terminal = canvasTex(400,250,(g,w,h)=>{
  g.fillStyle='#f6f9fc'; g.fillRect(0,0,w,h);
  g.fillStyle='#283764'; g.fillRect(0,0,w,30);
  g.fillStyle='rgba(255,255,255,.9)'; rr(g,12,10,70,10,4); g.fill();
  g.fillStyle='#e6f5ff'; g.fillRect(0,30,90,h-30);
  g.fillStyle='#b9cde2'; for(let i=0;i<6;i++){ rr(g,12,46+i*26,62,10,4); g.fill(); }
  for(let i=0;i<7;i++){ g.fillStyle=i%3===0?'#9fb4cb':'#cfdbe8'; rr(g,106,48+i*24,180+((i*53)%90),9,4); g.fill(); }
  g.fillStyle='#0069B1'; rr(g,300,206,82,26,7); g.fill();
});
TEX.sharpsFront = (lineFrac)=>canvasTex(256,336,(g,w,h)=>{
  g.clearRect(0,0,w,h);
  // label
  g.fillStyle='rgba(255,255,255,.96)'; rr(g,22,h*.42,w-44,h*.44,16); g.fill();
  drawBiohazard(g, w/2, h*.56, 86, '#1b1b1f');
  g.fillStyle='#c81e2e'; g.font='900 34px Lato, sans-serif'; g.textAlign='center'; g.fillText('SHARPS', w/2, h*.79);
  // dashed 3/4 fill line
  const y=h*lineFrac;
  g.strokeStyle='rgba(255,255,255,.95)'; g.lineWidth=6; g.setLineDash([16,11]); g.beginPath(); g.moveTo(8,y); g.lineTo(w-8,y); g.stroke(); g.setLineDash([]);
  g.fillStyle='#fff'; rr(g,w-74,y-34,64,26,9); g.fill();
  g.fillStyle='#283764'; g.font='900 19px Lato, sans-serif'; g.fillText('3/4', w-42, y-15);
});
TEX.bagDecal = canvasTex(256,160,(g,w,h)=>{
  g.clearRect(0,0,w,h); drawBiohazard(g, w/2, 62, 96, 'rgba(20,20,24,.92)');
  g.fillStyle='rgba(20,20,24,.92)'; g.font='900 26px Lato, sans-serif'; g.textAlign='center'; g.fillText('BIOHAZARD', w/2, 140);
});
TEX.gloveFront = canvasTex(320,140,(g,w,h)=>{
  g.fillStyle='#ffffff'; g.fillRect(0,0,w,h);
  g.fillStyle='#00A8E4'; g.fillRect(0,h-26,w,26);
  g.fillStyle='#0069B1'; g.fillRect(0,h-34,w,8);
  g.fillStyle='#283764'; g.font='900 40px Lato, sans-serif'; g.textAlign='left'; g.fillText('GLOVES', 22, 62);
  g.font='700 18px Lato, sans-serif'; g.fillStyle='#5a6479'; g.fillText('Disposable', 24, 90);
  // glove icon
  g.fillStyle='#00A8E4'; g.save(); g.translate(262,58);
  rr(g,-18,-6,36,44,10); g.fill(); [-14,-5,4,13].forEach((x,i)=>{ rr(g,x-4,-34+(i===0||i===3?8:0),9,34,4.5); g.fill(); }); g.rotate(-.6); rr(g,-30,4,9,24,4.5); g.fill(); g.restore();
});
TEX.gloveSide = canvasTex(160,140,(g,w,h)=>{ g.fillStyle='#fff'; g.fillRect(0,0,w,h); g.fillStyle='#00A8E4'; g.fillRect(0,h-26,w,26); g.fillStyle='#0069B1'; g.fillRect(0,h-34,w,8); });
TEX.gloveTop = canvasTex(320,160,(g,w,h)=>{ g.fillStyle='#fff'; g.fillRect(0,0,w,h); g.fillStyle='#e9eef3'; g.beginPath(); g.ellipse(w/2,h/2,96,34,0,0,7); g.fill(); g.fillStyle='#3b4656'; g.beginPath(); g.ellipse(w/2,h/2,84,24,0,0,7); g.fill(); });
TEX.rubLabel = canvasTex(320,120,(g,w,h)=>{
  g.fillStyle='#ffffff'; g.fillRect(0,0,w,h); g.fillStyle='#0069B1'; g.fillRect(0,0,w,14); g.fillStyle='#00A8E4'; g.fillRect(0,h-12,w,12);
  g.fillStyle='#283764'; g.font='900 34px Lato, sans-serif'; g.textAlign='center'; g.fillText('HAND RUB', w/2, 70);
  g.fillStyle='#00A8E4'; g.beginPath(); g.moveTo(w/2,82); g.bezierCurveTo(w/2+10,94,w/2+8,104,w/2,104); g.bezierCurveTo(w/2-8,104,w/2-10,94,w/2,82); g.fill();
});
// door to the medical waste pickup area
TEX.doorSign = canvasTex(640,300,(g,w,h)=>{
  g.fillStyle='#ffffff'; rr(g,6,6,w-12,h-12,26); g.fill();
  g.strokeStyle='#283764'; g.lineWidth=8; rr(g,14,14,w-28,h-28,20); g.stroke();
  g.fillStyle='#283764'; rr(g,36,40,150,h-80,20); g.fill();
  drawBiohazard(g, 111, h/2, 108, '#ffffff');
  g.fillStyle='#283764'; g.textAlign='left';
  g.font='900 46px Lato, sans-serif'; g.fillText('Medical', 214, 106); g.fillText('Waste', 214, 160); g.fillText('Pickup Area', 214, 214);
  g.fillStyle='#FFA81E'; g.fillRect(214,236,120,8);
});
TEX.clock = canvasTex(256,256,(g,w,h)=>{
  g.fillStyle='#283764'; g.beginPath(); g.arc(128,128,124,0,7); g.fill();
  g.fillStyle='#fff'; g.beginPath(); g.arc(128,128,110,0,7); g.fill();
  g.strokeStyle='#283764'; for(let i=0;i<12;i++){ const a=i*Math.PI/6; g.lineWidth=i%3?4:8; g.beginPath(); g.moveTo(128+Math.cos(a)*92,128+Math.sin(a)*92); g.lineTo(128+Math.cos(a)*104,128+Math.sin(a)*104); g.stroke(); }
  g.lineCap='round'; g.lineWidth=9; g.beginPath(); g.moveTo(128,128); g.lineTo(128+Math.cos(-2.3)*56,128+Math.sin(-2.3)*56); g.stroke();
  g.lineWidth=6; g.beginPath(); g.moveTo(128,128); g.lineTo(128+Math.cos(-0.6)*82,128+Math.sin(-0.6)*82); g.stroke();
  g.fillStyle='#FFA81E'; g.beginPath(); g.arc(128,128,9,0,7); g.fill();
});
function decal(tex){ return new THREE.MeshStandardMaterial({map:tex, transparent:true, roughness:.55, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2}); }

/* ================================================================== */
/*  OBJECT BUILDERS                                                    */
/* ================================================================== */
function syringe(parent){
  const s=new THREE.Group(); parent.add(s);
  M(new THREE.CylinderGeometry(.011,.011,.085,10), mat(0xf4f7fa,{roughness:.3,transparent:true,opacity:.92}), 0,0,0,s,false);
  M(new THREE.CylinderGeometry(.0045,.0045,.05,6), mat(0xd8dde4), 0,.06,0,s,false);
  M(new THREE.CylinderGeometry(.02,.02,.004,12), mat(0xf4f7fa), 0,.044,0,s,false);
  M(new THREE.CylinderGeometry(.007,.0055,.036,8), mat(0xFFA81E,{roughness:.5}), 0,-.06,0,s,false);
  return s;
}
const SH = {W:.27, H:.36, D:.19};
function sharpsContainer(fill, overfull, seed, solid=false){
  const g=new THREE.Group(), {W,H,D}=SH, R=rng(seed);
  // contents
  const inner=new THREE.Group(); g.add(inner);
  const n=Math.round(fill*44), top=H*fill;
  for(let i=0;i<n;i++){
    const s=syringe(inner);
    const y=.03+(i/n)*(top-.05)+R()*.02;
    s.position.set((R()-.5)*(W-.07), Math.min(y, top-.012), (R()-.5)*(D-.07));
    s.rotation.set(Math.PI/2+(R()-.5)*.9, R()*Math.PI, (R()-.5)*.6);
  }
  // translucent shell
  const shellMat = solid ? new THREE.MeshStandardMaterial({color:lin(0xd0202f), roughness:.32})
    : new THREE.MeshStandardMaterial({color:lin(0xd0202f), roughness:.28, transparent:true, opacity:.6, depthWrite:false});
  const shell = M(RB(W,H,D,.02), shellMat, 0,H/2,0,g,true); shell.renderOrder=3;
  rb(W+.012,.03,D+.012,.01, M_.red(), 0,0,0,g);
  // front decal: label + dashed 3/4 line
  const dH=H-.04, lineFromTop=((H-.02)-H*.75)/dH;
  const dc=M(new THREE.PlaneGeometry(W-.03,dH), decal(TEX.sharpsFront(lineFromTop)), 0,H/2,D/2+.0035,g,false); dc.renderOrder=4;
  // hinged lid
  const lid=new THREE.Group(); lid.position.set(0,H-.004,-D/2-.006); g.add(lid);
  rb(W+.016,.05,D+.014,.014, M_.red(), 0,0,(D+.014)/2,lid);
  M(new THREE.BoxGeometry(W*.56,.006,D*.36), mat(0x4a0c14), 0,.052,(D+.014)/2,lid,false);
  rb(W*.62,.012,D*.44,.004, mat(0xb51a29,{roughness:.4}), 0,.05,(D+.014)/2+.005,lid);
  // sealed closure: covers the opening once the container is sealed
  const cover=rb(W*.6,.014,D*.4,.004, M_.red(), 0,.054,(D+.014)/2,lid); cover.visible=false;
  const lid0 = overfull ? -0.3 : 0; lid.rotation.x = lid0;
  g.userData.seal=()=>{ lid.rotation.x=0; cover.visible=true; };
  g.userData.unseal=()=>{ lid.rotation.x=lid0; cover.visible=false; };
  g.userData.h=H+.06;
  return g;
}
function redBag(seed){
  const g=new THREE.Group(), R=rng(seed);
  const prof=[[0,0],[.15,.004],[.22,.025],[.255,.08],[.268,.16],[.256,.245],[.215,.315],[.15,.37],[.08,.41],[.042,.44],[.034,.465],[0,.47]];
  const geo=new THREE.LatheGeometry(prof.map(([r,y])=>new THREE.Vector2(r,y)), 48, 0, Math.PI*2);
  const p=geo.attributes.position, ph=R()*6;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i), y=p.getY(i), z=p.getZ(i), a=Math.atan2(z,x);
    const k=1+0.05*Math.sin(a*5+y*16+ph)+0.028*Math.sin(a*11-y*29)+0.02*Math.sin(a*3+ph*2);
    p.setX(i,x*k); p.setZ(i,z*k*0.92);
  }
  geo.computeVertexNormals();
  M(geo, mat(0xd0222f,{roughness:.32, metalness:.02}), 0,0,0,g);
  // open neck while the bag is in use
  const open=new THREE.Group(); g.add(open);
  const cg=new THREE.CylinderGeometry(.2,.11,.09,28,1,true), cp=cg.attributes.position;
  for(let i=0;i<cp.count;i++){ const x=cp.getX(i), y=cp.getY(i), z=cp.getZ(i), a=Math.atan2(z,x), k=y>0?1+.1*Math.sin(a*6+ph):1; cp.setX(i,x*k); cp.setZ(i,z*k); cp.setY(i,y+(y>0?.015*Math.sin(a*4):0)); }
  cg.computeVertexNormals();
  M(cg, new THREE.MeshStandardMaterial({color:lin(0xd0222f),roughness:.32,side:THREE.FrontSide}), 0,.49,0,open);
  M(cg, new THREE.MeshStandardMaterial({color:lin(0x5a0d16),roughness:.6,side:THREE.BackSide}), 0,.49,0,open,false);   // dark inside: the bag is open
  const hole=M(new THREE.CircleGeometry(.115,24), mat(0x3a070e,{roughness:.9}), 0,.472,0,open,false); hole.rotation.x=-Math.PI/2;
  // secured: one center knot (not dog-eared corners), double bagged
  const tied=new THREE.Group(); tied.visible=false; g.add(tied);
  M(new THREE.TorusGeometry(.03,.012,8,16), mat(0xb81a28,{roughness:.35}), 0,.455,0,tied).rotation.x=Math.PI/2;
  M(new THREE.SphereGeometry(.042,14,10), mat(0xc41f2c,{roughness:.35}), 0,.495,0,tied);
  const outer=M(geo.clone(), new THREE.MeshStandardMaterial({color:lin(0xb81a28),roughness:.38,transparent:true,opacity:.55,depthWrite:false}), 0,-.004,0,tied,false); outer.scale.set(1.05,1.03,1.05); outer.renderOrder=6;
  M(new THREE.TorusGeometry(.036,.013,8,16), mat(0xb81a28,{roughness:.35}), 0,.475,0,tied).rotation.x=Math.PI/2;
  g.userData.tie=()=>{ open.visible=false; tied.visible=true; };
  g.userData.untie=()=>{ open.visible=true; tied.visible=false; };
  // biohazard print
  [-0.5, -0.5-Math.PI/2].forEach(t0=>{ const d=M(new THREE.CylinderGeometry(.276,.286,.15,28,1,true,t0,1.0), decal(TEX.bagDecal), 0,.175,0,g,false); d.scale.z=.93; d.renderOrder=4; });
  g.userData.h=.58;
  return g;
}
function supplies(){
  const g=new THREE.Group();
  // glove box
  const W=.25,H=.105,D=.13;
  const gm=[texMat(TEX.gloveSide),texMat(TEX.gloveSide),texMat(TEX.gloveTop),mat(0xeef2f6),texMat(TEX.gloveFront),texMat(TEX.gloveSide)];
  const box=M(new THREE.BoxGeometry(W,H,D), gm, -.07,H/2,0,g);
  const glove=new THREE.Group(); glove.position.set(-.07,H,0); g.add(glove);
  const gl=mat(0x7fcff0,{roughness:.55});
  [[0,.012,0,.05,.6,.36],[-.025,.03,.005,.022,.9,.5],[.02,.035,-.004,.02,1,.5],[.0,.045,.006,.018,1,.5]].forEach(([x,y,z,r,sy,sz])=>{ const m=M(new THREE.SphereGeometry(r,12,10), gl, x,y,z,glove); m.scale.set(1,sy,sz); });
  // hand rub pump bottle
  const b=new THREE.Group(); b.position.set(.13,0,.005); g.add(b);
  M(new THREE.CylinderGeometry(.031,.031,.11,20), mat(0x9fdcf5,{roughness:.2,transparent:true,opacity:.75}), 0,.058,0,b,false);
  const body=M(new THREE.CylinderGeometry(.036,.037,.15,24), new THREE.MeshStandardMaterial({color:lin(0xf3f9fd),roughness:.08,transparent:true,opacity:.42,depthWrite:false}), 0,.075,0,b); body.renderOrder=3;
  const lab=M(new THREE.CylinderGeometry(.0372,.0372,.07,24,1,true,-1.15,2.3), texMat(TEX.rubLabel), 0,.07,0,b,false); lab.renderOrder=4;
  cy(.022,.026,.02, M_.white(), 0,.15,0,b);
  cy(.007,.007,.04, M_.white(), 0,.17,0,b,10);
  rb(.034,.022,.03,.008, M_.white(), 0,.205,0,b);
  M(new THREE.BoxGeometry(.012,.012,.04), M_.white(), 0,.217,.03,b);
  g.userData.h=.24;
  return g;
}
function stationCart(parent){
  const g=new THREE.Group(); parent.add(g);
  const st=M_.steel();
  [[-.28,-.2],[.28,-.2],[-.28,.2],[.28,.2]].forEach(([x,z])=>{
    cy(.014,.014,.78, st, x,.08,z,g,12);
    M(new THREE.CylinderGeometry(.032,.032,.026,16), M_.rubber(), x,.033,z+.012,g).rotation.z=Math.PI/2;
    bx(.02,.05,.02, M_.darkSteel(), x,.045,z,g);
  });
  rb(.62,.025,.46,.01, M_.white(), 0,.255,0,g);           // lower shelf (top at .28)
  [-.21,.21].forEach(z=>bx(.6,.02,.012, M_.white(), 0,.28,z,g));
  rb(.6,.13,.44,.014, M_.blue(), 0,.70,0,g);              // drawer
  bx(.22,.016,.02, st, 0,.755,.235,g);
  rb(.66,.035,.5,.014, M_.white(), 0,.845,0,g);            // top tray (top at .88)
  [[0,.24,.64,.012],[0,-.24,.64,.012]].forEach(([x,z,w,d])=>rb(w,.03,d+.004,.005, M_.offwhite(), x,.875,z,g));
  [-.32,.32].forEach(x=>rb(.012,.03,.5,.005, M_.offwhite(), x,.875,0,g));
  // push handle
  [-.2,.2].forEach(x=>cy(.009,.009,.1, st, x,.88,-.24,g,10));
  const h=M(new THREE.CylinderGeometry(.012,.012,.42,12), st, 0,.985,-.24,g); h.rotation.z=Math.PI/2;
  return g;
}
const CART = {top:.905, shelf:.28};
// A hospital bed (LearnCurio version: a hospital ward, not a treatment chair). Head toward the wall (-z).
function hospitalBed(parent){
  const g=new THREE.Group(); parent.add(g);
  const frame=mat(0x8a95a3,{roughness:.45,metalness:.35}), board=mat(0xdfe5ec,{roughness:.5}), sheet=mat(0xf8fafc,{roughness:.7}),
        blanket=mat(0x8fb9d6,{roughness:.8}), rail=M_.steel();
  // base with casters
  rb(.78,.1,1.7,.03, frame, 0,.12,0,g);
  [[-.34,-.78],[.34,-.78],[-.34,.78],[.34,.78]].forEach(([x,z])=>{ const w=M(new THREE.CylinderGeometry(.05,.05,.04,16), M_.rubber(), x,.05,z,g); w.rotation.z=Math.PI/2; cy(.012,.012,.08, rail, x,.08,z,g,8); });
  [-.45,.45].forEach(z=>cy(.035,.035,.3, frame, 0,.22,z,g,12));
  // deck and mattress
  rb(.9,.06,1.92,.02, frame, 0,.5,0,g);
  rb(.86,.14,1.18,.05, sheet, 0,.56,.36,g);
  // raised head section with pillow
  const head=new THREE.Group(); head.position.set(0,.6,-.24); head.rotation.x=.38; g.add(head);
  rb(.86,.14,.72,.05, sheet, 0,-.04,-.36,head);
  rb(.6,.11,.34,.05, mat(0xffffff,{roughness:.75}), 0,.1,-.48,head);
  // blanket over the foot end, folded edge
  rb(.9,.05,1.0,.03, blanket, 0,.69,.42,g);
  rb(.91,.055,.12,.025, sheet, 0,.695,-.06,g);
  // head and foot boards
  rb(.94,.62,.06,.03, board, 0,.5,-.99,g);
  rb(.94,.42,.06,.03, board, 0,.5,.98,g);
  // side rails near the head
  [-1,1].forEach(s=>{ rb(.03,.16,.72,.015, rail, s*.47,.7,-.42,g); cy(.012,.012,.18, rail, s*.47,.52,-.66,g,8); cy(.012,.012,.18, rail, s*.47,.52,-.18,g,8); });
  return g;
}
// A patient monitor on a rolling stand, with an IV pole and bag (LearnCurio version).
function patientMonitor(parent){
  const g=new THREE.Group(); parent.add(g);
  const steel=M_.steel(), dark=mat(0x2f3644,{roughness:.4});
  // rolling base: five feet and casters
  for(let k=0;k<5;k++){ const a=k/5*Math.PI*2; const f=bx(.26,.03,.04, mat(0x59626f,{roughness:.4,metalness:.4}), Math.cos(a)*.12,.05,Math.sin(a)*.12,g); f.rotation.y=-a;
    const w=M(new THREE.CylinderGeometry(.025,.025,.025,10), M_.rubber(), Math.cos(a)*.24,.02,Math.sin(a)*.24,g); w.rotation.z=Math.PI/2; }
  cy(.02,.02,1.1, steel, 0,.06,0,g,12);
  // monitor
  const sc=new THREE.Group(); sc.position.set(0,1.32,.04); sc.rotation.x=-.12; g.add(sc);
  rb(.46,.34,.1,.03, dark, 0,-.17,-.04,sc);
  M(new THREE.PlaneGeometry(.4,.27), new THREE.MeshBasicMaterial({map:TEX.vitalsScreen}), 0,0,.012,sc,false);
  // IV pole with a fluid bag
  for(let k=0;k<5;k++){ const a=k/5*Math.PI*2+.3; const f=bx(.2,.025,.035, mat(0x59626f,{roughness:.4,metalness:.4}), -.5+Math.cos(a)*.08,.045,-.16+Math.sin(a)*.08,g); f.rotation.y=-a;
    const w=M(new THREE.CylinderGeometry(.022,.022,.022,10), M_.rubber(), -.5+Math.cos(a)*.16,.018,-.16+Math.sin(a)*.16,g); w.rotation.z=Math.PI/2; }
  cy(.03,.03,.04, steel, -.5,.04,-.16,g,12);
  cy(.011,.011,1.95, steel, -.5,.06,-.16,g,10);
  const hk=M(new THREE.TorusGeometry(.04,.006,6,16,Math.PI), steel, -.5,2.03,-.16,g); hk.rotation.y=Math.PI/2;
  rb(.14,.24,.04,.03, new THREE.MeshStandardMaterial({color:lin(0xf3f9ff),roughness:.15,transparent:true,opacity:.6}), -.5,1.74,-.16,g);
  cy(.004,.004,.9, mat(0xe9f2f8,{roughness:.3,transparent:true,opacity:.7}), -.5,.86,-.16,g,6);
  return g;
}
function counter(parent, w, kneeW){
  const g=new THREE.Group(); parent.add(g);
  const cab=w-kneeW, white=M_.white(), seam=mat(0xc8d3df);
  rb(cab,.08,.56,.01, M_.navy(), -w/2+cab/2,0,.02,g);
  rb(cab,.8,.6,.012, white, -w/2+cab/2,.08,0,g);
  const doors=Math.max(1,Math.round(cab/.55));
  for(let i=0;i<doors;i++){
    const x=-w/2+(i+.5)*cab/doors;
    bx(.012,.72,.004, seam, -w/2+(i+1)*cab/doors,.12,.302,g);
    bx(.16,.016,.02, M_.steel(), x,.74,.31,g);
  }
  bx(cab-.02,.01,.004, seam, -w/2+cab/2,.66,.302,g);
  rb(.04,.88,.6,.01, white, w/2-.02,0,0,g);
  rb(kneeW,.04,.56,.01, white, w/2-kneeW/2,.82,-.02,g);
  rb(w+.04,.05,.66,.012, M_.counterTop(), 0,.88,.02,g);
  return g;
}
const COUNTER_TOP=.93;
function terminal(parent){
  const g=new THREE.Group(); parent.add(g);
  rb(.18,.02,.14,.008, M_.darkSteel(), 0,0,0,g);
  cy(.016,.016,.34, M_.darkSteel(), 0,.02,-.03,g,12);
  const s=new THREE.Group(); s.position.set(0,.5,0); s.rotation.x=-.08; g.add(s);
  rb(.56,.36,.035,.012, mat(0x252b36,{roughness:.4}), 0,-.18,0,s);
  M(new THREE.PlaneGeometry(.52,.32), new THREE.MeshBasicMaterial({map:TEX.terminal}), 0,0,.019,s,false);
  rb(.42,.018,.14,.006, mat(0x3a4250,{roughness:.6}), .05,0,.24,g);
  return g;
}

