(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const dark=matchMedia('(prefers-color-scheme: dark)').matches,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowEnd=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4||innerWidth<700;
const stops=$$('.stop'),chips=$$('#chips button'),T=stops.map(s=>+s.dataset.t),btn=$('#mode');
let mode='2d',started=false,upd3=()=>{},turn=()=>{},enter=()=>{},leave=()=>{};
function setMode(m){
 if(m==='3d'&&!started&&!init3d()){m='2d';btn.disabled=true;btn.textContent='3D unavailable on this device';}
 mode=m;document.body.classList.toggle('m3d',m==='3d');document.body.classList.toggle('m2d',m==='2d');
 btn.setAttribute('aria-pressed',m==='3d');
 if(!btn.disabled)btn.textContent=m==='3d'?'Switch to 2D page':'Drive mode (3D)';
 upd3();
}
btn.onclick=()=>setMode(mode==='3d'?'2d':'3d');
function go(i){
 if(document.body.classList.contains('busy'))return;
 if(mode==='3d'){turn(i);const mx=document.documentElement.scrollHeight-innerHeight;scrollTo({top:T[i]*mx,behavior:reduce?'auto':'smooth'});}
 else $('#s'+i).scrollIntoView({behavior:reduce?'auto':'smooth'});
}
chips.forEach((b,i)=>b.onclick=()=>go(i));
$$('[data-go]').forEach(b=>b.onclick=()=>go(+b.dataset.go));

function init3d(){
 if(!window.THREE)return false;
 let r;
 try{r=new THREE.WebGLRenderer({canvas:$('#c'),antialias:!lowEnd});if(!r.getContext())return false;}catch(e){return false;}
 started=true;
 r.setPixelRatio(Math.min(devicePixelRatio,1.5));
 const skyC=dark?0x16202b:0xcfe2f1,sc=new THREE.Scene();
 sc.background=new THREE.Color(skyC);sc.fog=new THREE.Fog(skyC,110,330);
 const cam=new THREE.PerspectiveCamera(55,1,.1,700);
 sc.add(new THREE.HemisphereLight(0xffffff,dark?0x2a2018:0xb59a78,dark?.75:1));
 const sun=new THREE.DirectionalLight(0xffffff,dark?.4:.7);sun.position.set(30,50,20);sc.add(sun);
 const M=c=>new THREE.MeshLambertMaterial({color:c});
 const anim=[];
 let occ=null;
 const CT=c=>{const t=new THREE.CanvasTexture(c);t.anisotropy=r.capabilities.getMaxAnisotropy();return t;};
 const RC={},RB=(w,h,d)=>{const mn=Math.min(w,h,d);if(mn<.2)return new THREE.BoxGeometry(w,h,d);const key=w+'|'+h+'|'+d;if(RC[key])return RC[key];
  const rr=Math.min(mn*.3,.5),g=new THREE.BoxGeometry(w,h,d,5,5,5),ps=g.attributes.position,nr=g.attributes.normal,A=[w/2,h/2,d/2],tt=.4142,L=A.map(a=>[-a,-(a-rr)-tt*rr,-(a-rr),a-rr,a-rr+tt*rr,a]);
  for(let i=0;i<ps.count;i++){const p=[ps.getX(i),ps.getY(i),ps.getZ(i)],n=[0,0,0];let l2=0;
   for(let j=0;j<3;j++){p[j]=L[j][Math.round((p[j]+A[j])/(2*A[j])*5)];const a=A[j]-rr,c=Math.max(-a,Math.min(a,p[j]));n[j]=p[j]-c;l2+=n[j]*n[j];}
   const l=Math.sqrt(l2);if(l>1e-6){for(let j=0;j<3;j++){const a=A[j]-rr,c=Math.max(-a,Math.min(a,p[j]));p[j]=c+n[j]/l*rr;n[j]/=l;}}else{n[0]=nr.getX(i);n[1]=nr.getY(i);n[2]=nr.getZ(i);}
   ps.setXYZ(i,p[0],p[1],p[2]);nr.setXYZ(i,n[0],n[1],n[2]);}
  RC[key]=g;return g;};
 const box=(w,h,d,c,x,y,z,p)=>{const m=new THREE.Mesh(RB(w,h,d),M(c));m.position.set(x,y,z);(p||sc).add(m);return m;};
 const CH=0xf5f6f2,BL=0x1d5fc4;

 // route
 const cv=new THREE.CatmullRomCurve3([[0,0],[0,-30],[14,-62],[14,-98],[-10,-132],[-10,-168],[8,-204],[8,-244]].map(a=>new THREE.Vector3(a[0],0,a[1])));
 const LEN=cv.getLength(),N=400,pos=[],idx=[];
 for(let i=0;i<=N;i++){const p=cv.getPointAt(i/N),g=cv.getTangentAt(i/N),lx=g.z,lz=-g.x;
  pos.push(p.x+lx*4,.02,p.z+lz*4,p.x-lx*4,.02,p.z-lz*4);if(i<N){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}
 const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));rg.setIndex(idx);rg.computeVertexNormals();
 sc.add(new THREE.Mesh(rg,new THREE.MeshLambertMaterial({color:dark?0x0f161d:0x2a3440,side:THREE.DoubleSide})));
 const dm=new THREE.InstancedMesh(new THREE.BoxGeometry(.25,.02,2.2),M(0xf0c23a),80),o=new THREE.Object3D();
 for(let i=0;i<80;i++){const p=cv.getPointAt((i+.5)/80),g=cv.getTangentAt((i+.5)/80);o.position.set(p.x,.05,p.z);o.rotation.y=Math.atan2(g.x,g.z);o.updateMatrix();dm.setMatrixAt(i,o.matrix);}
 sc.add(dm);
 const h=i=>Math.abs(Math.sin(i*12.9898)*43758.5453)%1;
 const rib=(off,w,col,y)=>{const ps=[],ix=[];for(let i=0;i<=N;i++){const p=cv.getPointAt(i/N),g=cv.getTangentAt(i/N),lx=g.z,lz=-g.x;ps.push(p.x+lx*(off+w),y,p.z+lz*(off+w),p.x+lx*(off-w),y,p.z+lz*(off-w));if(i<N){const a=i*2;ix.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const q=new THREE.BufferGeometry();q.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));q.setIndex(ix);q.computeVertexNormals();sc.add(new THREE.Mesh(q,new THREE.MeshLambertMaterial({color:col,side:THREE.DoubleSide})));};
 const shoulder=dark?0x2c2219:0x7d6246;
 rib(5.2,1.2,shoulder,.01);rib(-5.2,1.2,shoulder,.01);rib(4.2,.18,0x9aa4ad,.03);rib(-4.2,.18,0x9aa4ad,.03);rib(3.5,.07,0xf5f6f2,.04);rib(-3.5,.07,0xf5f6f2,.04);
 {const pa=new THREE.InstancedMesh(new THREE.BoxGeometry(1.3,.01,2),M(dark?0x0b1117:0x1f2832),26),ck=new THREE.InstancedMesh(new THREE.BoxGeometry(.05,.01,1.6),M(dark?0x05080b:0x141b22),34),q=new THREE.Object3D();
  for(let i=0;i<60;i++){const u=h(i*3+1),p=cv.getPointAt(u),g=cv.getTangentAt(u),d=(h(i*3+2)-.5)*6;q.position.set(p.x+g.z*d,.035,p.z-g.x*d);q.rotation.y=Math.atan2(g.x,g.z)+(h(i*3)-.5)*.4;q.updateMatrix();(i<26?pa:ck).setMatrixAt(i<26?i:i-26,q.matrix);}
  sc.add(pa,ck);
  const po=new THREE.InstancedMesh(new THREE.BoxGeometry(.14,.8,.14),M(0xf5f6f2),44),rf=new THREE.InstancedMesh(new THREE.BoxGeometry(.16,.12,.16),M(0xd23b3b),44);
  for(let i=0;i<44;i++){const u=(i+.5)/44,p=cv.getPointAt(u),g=cv.getTangentAt(u),d=i%2?4.9:-4.9;q.rotation.y=0;q.position.set(p.x+g.z*d,.4,p.z-g.x*d);q.updateMatrix();po.setMatrixAt(i,q.matrix);q.position.y=.72;q.updateMatrix();rf.setMatrixAt(i,q.matrix);}
  sc.add(po,rf);}
 const gr=new THREE.Mesh(new THREE.PlaneGeometry(800,900),M(dark?0x3a2d22:0x8a6a4a));gr.rotation.x=-Math.PI/2;gr.position.set(0,-.02,-250);sc.add(gr);

 // props
 const props=[];
 const sign=(txt,w,x,y,z,g)=>{const c=document.createElement('canvas');c.width=1536;c.height=384;const k=c.getContext('2d');k.scale(3,3);
  k.fillStyle='#1d5fc4';k.fillRect(0,0,512,128);k.fillStyle='#fff';k.font='700 60px sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText(txt,256,68);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshBasicMaterial({map:CT(c)}));m.position.set(x,y,z);g.add(m);};
 const BS=[1.5,1.5,1.8,1.6,1.5],BH=[4.65,4.1,1.25,2.5,4.7],BO=[14,17,17,17,14];
 const prop=i=>{const p=cv.getPointAt(T[i]),g=cv.getTangentAt(T[i]),n=new THREE.Group();
  {const d=BO[i]+BH[i]*(BS[i]-1);n.position.set(p.x-g.z*d,0,p.z+g.x*d);}n.scale.setScalar(BS[i]);n.rotation.y=Math.atan2(g.z,-g.x);sc.add(n);props.push(n.position);return n;};
 const win=(w,hh,x,y,z,gp)=>{box(w+.3,hh+.3,.08,0x3a4654,x,y,z,gp);box(w,hh,.1,0xa9d1ef,x,y,z+.02,gp);box(.06,hh,.12,0x3a4654,x,y,z+.03,gp);};
 const drum=(x,z,c,gp)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1.2,10),M(c));m.position.set(x,.6,z);gp.add(m);};
 const lamp=(x,z,gp)=>{box(.12,3.4,.12,0x3a4654,x,1.7,z,gp);box(.6,.14,.3,0xfff2b0,x,3.45,z,gp);};
 const tire=(x,y,z,gp)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(.5,.2,6,12),M(0x1a1f26));m.rotation.x=Math.PI/2;m.position.set(x,y,z);gp.add(m);};
const DR=[],RD=[];const door=(w,h,col,cx,z,gp,dir)=>{const q=new THREE.Group();q.position.set(cx,0,z);gp.add(q);q.userData={x0:cx,w:w,dir:dir,o:0};box(w+.4,h+.2,.04,0x2a323c,cx,(h+.2)/2,z-.03,gp);box(w+.04,h,.06,0x0a0d11,cx,h/2,z-.02,gp);box(w,h,.1,col,0,h/2,0,q);return q;};
 let g=prop(0); // garage
 box(12,5,8,CH,0,2.5,0,g);box(13,.6,9,BL,0,5.3,0,g);box(6.3,3.8,.04,0x2a323c,0,1.9,4.03,g);box(6,3.6,.06,0x0a0d11,0,1.8,4.02,g);const rdG=new THREE.Group();g.add(rdG);box(6,3.6,.2,0x3a4654,0,1.8,4.05,rdG);RD[0]=rdG;sign('Garage',6,0,4.4,4.6,g);
 for(let i=0;i<6;i++)box(6,.04,.05,0x2e3844,0,.5+i*.55,4.17,rdG);
 win(1.4,1.4,4.6,2.8,4.03,g);win(1.4,1.4,-4.6,2.8,4.03,g);box(1.6,.9,1.2,0xcfd6dc,-3,5.9,0,g);
 lamp(-6.8,4.6,g);drum(5.5,5.2,BL,g);drum(6.7,5,0xd23b3b,g);tire(-5.6,.2,5.2,g);tire(-5.6,.6,5.2,g);tire(-5.6,1,5.2,g);
 g=prop(1); // workshop
 box(12,4.5,8,0xe3e7ea,0,2.25,0,g);box(13,.6,9,BL,0,4.8,0,g);sign('Workshop',5,-2.6,3.6,4.1,g);
 DR[1]=door(1.2,2.2,0x3a4654,-.2,4.05,g,-1);win(1.3,1.1,-4.8,1.8,4.03,g);win(1.3,1.1,-2.6,1.8,4.03,g);
 box(.9,2.4,.9,0x8d99a6,-4,6,-1.5,g);box(1.1,.2,1.1,0x3a4654,-4,7.3,-1.5,g);
 box(2.8,.15,1.1,0xb08a5a,5,1,5.6,g);box(.15,1,1,0x3a4654,3.8,.5,5.6,g);box(.15,1,1,0x3a4654,6.2,.5,5.6,g);box(.5,.3,.5,0x3a4654,4.7,1.25,5.6,g);
 box(2,.12,1.2,0x8d99a6,-7.2,.1,3,g);box(2,.12,1.2,0xaab4be,-7.2,.24,3,g);
 const gear=new THREE.Group(),gb=new THREE.Mesh(new THREE.CylinderGeometry(2,2,.6,16),M(BL));gb.rotation.x=Math.PI/2;gear.add(gb);
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2;box(.7,.7,.6,BL,Math.cos(a)*2.3,Math.sin(a)*2.3,0,gear).rotation.z=a;}
 gear.position.set(4,2.6,4.6);g.add(gear);
 g=prop(2); // dev yard
 box(6,2.4,2.4,BL,-3.2,1.2,0,g);box(6,2.4,2.4,CH,3.2,1.2,0,g);box(6,2.4,2.4,CH,0,3.6,0,g);DR[2]=door(.9,1.65,0x1a1f26,3.2,1.25,g,1);
 for(let i=0;i<7;i++){box(.06,2.2,.04,0x16407f,-6+i*.8,1.2,1.22,g);box(.06,2.2,.04,0xaab4be,.4+i*.8,1.2,1.22,g);}
 box(2.8,.06,1.6,0x1c2e4a,0,5.1,0,g).rotation.x=-.35;
 {const d=new THREE.Mesh(new THREE.SphereGeometry(.8,10,6,0,6.283,0,1.2),new THREE.MeshLambertMaterial({color:CH,side:THREE.DoubleSide}));d.rotation.x=Math.PI+.5;d.position.set(3,5.5,0);g.add(d);box(.1,.8,.1,0x8d99a6,3,4.9,0,g);}
 lamp(-7,2,g);box(1,1,1,0xb08a5a,5.2,.5,2.8,g);box(.8,.8,.8,0xc69d68,6.4,.4,2.4,g);
 {const c=document.createElement('canvas');c.width=960;c.height=384;const k=c.getContext('2d');k.scale(3,3);k.fillStyle='#10202e';k.fillRect(0,0,320,128);
  k.fillStyle='#6fd3a0';k.font='600 20px monospace';['> calc --beam','ok  load check','ok  stress check'].forEach((s,i)=>k.fillText(s,14,38+i*30));
  const m=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.8),new THREE.MeshBasicMaterial({map:CT(c)}));m.position.set(0,3.6,1.22);g.add(m);}
 sign('Dev Yard',5,-3.2,2.6,1.25,g);
 {const p=cv.getPointAt(T[3]),t=cv.getTangentAt(T[3]);box(8,.1,9,0x8d99a6,p.x,.07,p.z).rotation.y=Math.atan2(t.x,t.z);}
 g=prop(3); // weighbridge hut
 box(6,3.2,4,0xe3e7ea,0,1.6,0,g);box(6.8,.5,4.8,BL,0,3.4,0,g);sign('Weighbridge',5.6,0,4,2.5,g);box(1.4,1.2,.1,0x3a4654,0,1.8,2.05,g);
 DR[3]=door(.9,1.9,0x3a4654,2.2,2.05,g,-1);win(1.2,1,-2.2,1.8,2.03,g);box(1.6,.28,.04,0x6fd3a0,0,2.75,2.12,g);
 box(.3,1.3,.3,0x3a4654,5,.65,7.8,g);const bar=new THREE.Group();bar.position.set(5,1.3,7.8);g.add(bar);for(let i=0;i<9;i++)box(.8,.12,.12,i%2?0xd23b3b:CH,-(.4+i*.8),0,0,bar);
 let ba=0;anim.push((tm,dt)=>{const op=ent.i===3&&ent.s&&ent.s!=='pre'&&!(ent.s==='in'&&cu<.15)&&!(ent.s==='outdrive'&&cu>.75);ba+=((op?1.35:0)-ba)*Math.min(1,dt*4);bar.rotation.z=-ba;});
 [3,4].forEach(x=>{const c=new THREE.Mesh(new THREE.ConeGeometry(.25,.6,8),M(0xf08a2a));c.position.set(x,.3,7.1);g.add(c);});
 g=prop(4); // depot
 box(14,6,9,CH,0,3,0,g);box(15,.7,10,BL,0,6.3,0,g);box(7.3,4.2,.04,0x2a323c,0,2.1,4.53,g);box(7,4,.06,0x0a0d11,0,2,4.52,g);const rdD=new THREE.Group();g.add(rdD);box(7,4,.2,0x3a4654,0,2,4.55,rdD);RD[4]=rdD;sign('Depot',6,0,5.2,4.7,g);
 box(.2,9,.2,0x8d99a6,8.5,4.5,3,g);box(2.4,1.4,.1,BL,9.7,8,3,g);
 win(1.5,1.5,-5.5,3.2,4.53,g);win(1.5,1.5,5.5,3.2,4.53,g);for(let i=0;i<7;i++)box(7,.04,.05,0x2e3844,0,.5+i*.55,4.67,rdD);
 {const t=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,2,12),M(0x8d99a6));t.position.set(-4,7.6,-1);g.add(t);[-1,1].forEach(a=>box(.15,.8,.15,0x3a4654,-4+a*.8,6.8,-1,g));}
 [-5,5].forEach(x=>{box(1.2,.6,1,0x8a5a3a,x,.3,5.5,g);const b=new THREE.Mesh(new THREE.SphereGeometry(.6,7,5),M(0x3f9a4a));b.position.set(x,1,5.5);g.add(b);});
 lamp(-8,5.5,g);for(let i=0;i<5;i++)box(.1,.02,3,CH,-4+i*2,.03,6.2,g);

 ['Garage','Workshop','Dev Yard','Weighbridge','Depot'].forEach((nm,i)=>{
  const t=Math.max(.012,T[i]-.05),p=cv.getPointAt(t),gg=cv.getTangentAt(t),n=new THREE.Group();
  n.position.set(p.x-gg.z*5.8,0,p.z+gg.x*5.8);n.rotation.y=Math.atan2(-gg.x,-gg.z);sc.add(n);
  box(.14,3,.14,0x8d99a6,-1.2,1.5,0,n);box(.14,3,.14,0x8d99a6,1.2,1.5,0,n);box(3.6,1.5,.08,0xf5f6f2,0,3.3,-.02,n);
  const c=document.createElement('canvas');c.width=1536;c.height=624;const k=c.getContext('2d');k.scale(3,3);
  k.fillStyle='#1d5fc4';k.fillRect(0,0,512,208);k.strokeStyle='#fff';k.lineWidth=8;k.strokeRect(10,10,492,188);
  k.fillStyle='#fff';k.textAlign='center';k.textBaseline='middle';k.font='600 34px sans-serif';k.fillText('Stop 0'+(i+1),256,52);
  k.font='700 62px sans-serif';k.fillText(nm,256,112);k.font='700 44px sans-serif';k.fillText('→',256,168);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(3.4,3.4*208/512),new THREE.MeshBasicMaterial({map:CT(c)}));m.position.set(0,3.3,.03);n.add(m);});
 // scenery
 let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647,sm=[];
 for(let i=0;i<=120;i++)sm.push(cv.getPointAt(i/120));
 const leaf=M(dark?0x2f6a3c:0x3f9a4a),leaf2=M(dark?0x3a7a3a:0x78c050),trunk=M(0x8a6a48);
 const palm=(x,z,sz)=>{const g=new THREE.Group();let ax=0,ay=0;const l=(rnd()-.5)*.3;
  for(let i=0;i<5;i++){const s=new THREE.Mesh(new THREE.CylinderGeometry(.19-i*.02,.24-i*.02,1.3,6),trunk);s.position.set(ax-Math.sin(l)*.65,ay+Math.cos(l)*.65,0);s.rotation.z=l;g.add(s);ax-=Math.sin(l)*1.3;ay+=Math.cos(l)*1.3;}
  for(let j=0;j<8;j++){const f=new THREE.Group(),m=new THREE.Mesh(new THREE.BoxGeometry(.4,.05,3.2),j%2?leaf:leaf2);m.position.z=1.6;f.add(m);f.position.set(ax,ay,0);f.rotation.set(.35+rnd()*.4,j/8*6.283,0,'YXZ');g.add(f);}
  for(let j=0;j<3;j++){const c=new THREE.Mesh(new THREE.SphereGeometry(.17,6,5),trunk);c.position.set(ax+Math.cos(j*2.1)*.3,ay-.2,Math.sin(j*2.1)*.3);g.add(c);}
  g.position.set(x,0,z);g.scale.setScalar(sz);sc.add(g);};
 const banana=(x,z,sz)=>{const g=new THREE.Group(),st=new THREE.Mesh(new THREE.CylinderGeometry(.15,.22,1.2,6),leaf2);st.position.y=.6;g.add(st);
  for(let j=0;j<6;j++){const f=new THREE.Group(),m=new THREE.Mesh(new THREE.BoxGeometry(.8,.04,2.4),j%2?leaf2:leaf);m.position.z=1.2;f.add(m);f.position.y=1.1;f.rotation.set(-.7-rnd()*.4,j/6*6.283,0,'YXZ');g.add(f);}
  g.position.set(x,0,z);g.scale.setScalar(sz);sc.add(g);};
 for(let n=0,k=0;n<900&&k<56;n++){const x=rnd()*240-120,z=-rnd()*330+40;
  if(sm.some(p=>(p.x-x)**2+(p.z-z)**2<150)||props.some(p=>(p.x-x)**2+(p.z-z)**2<760)||(z>-8&&Math.abs(x)<14)||Math.abs(z-14)<10||(z<-244&&z>-312&&Math.abs(x-8)<38))continue;k++;(k%4?palm:banana)(x,z,.9+rnd()*.5);}
 const inst=(geo,mat,n,a,b,mx,hh)=>{const m=new THREE.InstancedMesh(geo,mat,n),o=new THREE.Object3D();
  for(let i=0;i<n;i++){const u=rnd(),p=cv.getPointAt(u),g=cv.getTangentAt(u),d=(rnd()<.5?-1:1)*(a+rnd()*(b-a)),x=p.x+g.z*d,z=p.z-g.x*d,s=.4+rnd()*mx;
   if(props.some(q=>(q.x-x)**2+(q.z-z)**2<420))o.scale.setScalar(0);else o.scale.set(s,s*(.6+rnd()*.8),s);
   o.position.set(x,hh*o.scale.y,z);o.rotation.y=rnd()*6.28;o.updateMatrix();m.setMatrixAt(i,o.matrix);}sc.add(m);};
 inst(new THREE.IcosahedronGeometry(.5,0),M(dark?0x55585c:0x9a9a94),140,5,60,1.1,.35);
 inst(new THREE.ConeGeometry(.12,.8,4),M(dark?0x3c6b3a:0x7fb04a),900,4.5,60,.9,.4);
 inst(new THREE.SphereGeometry(.12,5,4),M(0xe8643c),90,5,50,.8,.5);inst(new THREE.SphereGeometry(.12,5,4),M(0xf0c23a),90,5,50,.8,.5);
 for(let n=0,k=0;n<500&&k<0;n++){const x=rnd()*140-70,z=-rnd()*280+20;
  if(sm.some(p=>(p.x-x)**2+(p.z-z)**2<150)||props.some(p=>(p.x-x)**2+(p.z-z)**2<260))continue;k++;
  const sz=.8+rnd()*.6,a=new THREE.Mesh(new THREE.CylinderGeometry(.25,.3,1.6,6),trunk),b=new THREE.Mesh(new THREE.ConeGeometry(1.6,4,7),leaf);
  a.position.set(x,.8*sz,z);b.position.set(x,3.4*sz,z);a.scale.setScalar(sz);b.scale.setScalar(sz);sc.add(a,b);}
 const cl=new THREE.MeshBasicMaterial({color:dark?0x2a3846:0xffffff});
 for(let i=0;i<8;i++){const c=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),cl);c.scale.set(7,1.6,3.5);c.position.set(rnd()*240-120,62+rnd()*12,-rnd()*300);sc.add(c);}

 // far scenery
 for(let i=0;i<14;i++){const sd=i%2?1:-1,x=sd*(80+rnd()*50),z=-30-rnd()*270,s=14+rnd()*16,m=new THREE.Mesh(new THREE.ConeGeometry(s,s*.9,6),M(dark?0x24382f:(i%3?0x5f8a57:0x7a9a5a)));m.position.set(x,s*.45,z);m.scale.z=1.4;sc.add(m);}
 for(let i=0;i<14;i++){const sd=i%2?1:-1,x=sd*(26+rnd()*40),z=-12-rnd()*230;
  if(props.some(q=>(q.x-x)**2+(q.z-z)**2<1100)||sm.some(p=>(p.x-x)**2+(p.z-z)**2<320))continue;
  box(10+rnd()*8,.04,8+rnd()*6,i%3?(dark?0x2f4a2a:0x8fbf4a):(dark?0x1f3340:0x7fb6c9),x,.02,z);}
 for(let i=0;i<10;i++){const sd=i%2?1:-1,x=sd*(24+rnd()*30),z=-10-rnd()*230;
  if(props.some(q=>(q.x-x)**2+(q.z-z)**2<1000)||sm.some(p=>(p.x-x)**2+(p.z-z)**2<300))continue;
  const hg=new THREE.Group();box(3,2,3,0xb08a5a,0,2.4,0,hg);for(const [a,b] of [[-1.3,-1.3],[1.3,-1.3],[-1.3,1.3],[1.3,1.3]])box(.2,1.4,.2,0x8a6a48,a,.7,b,hg);
  const rf=new THREE.Mesh(new THREE.ConeGeometry(3.2,1.8,4),M(0xc9a36a));rf.rotation.y=Math.PI/4;rf.position.y=4.3;hg.add(rf);
  hg.position.set(x,0,z);hg.rotation.y=rnd()*6.28;sc.add(hg);}
 for(let i=0;i<14;i++){if(i===13)continue;const u=(i+.5)/14,p=cv.getPointAt(u),gg=cv.getTangentAt(u),d=i%2?-8:8,hg=new THREE.Group();
  hg.position.set(p.x+gg.z*d,0,p.z-gg.x*d);box(.15,5,.15,0x3a4654,0,2.5,0,hg);box(.7,.15,.3,0xfff2b0,0,5.1,0,hg);sc.add(hg);}

 // crossroad at the start and construction zone at the end
 {
 const AS=dark?0x0f161d:0x2a3440,WL=0xf5f6f2,YL=0xf0c23a,shd=dark?0x2c2219:0x7d6246,flash=[];
 // start: road extends toward the camera into a crossroad
 box(8,.04,90,AS,0,.02,45);box(150,.04,8,AS,0,.021,14);
 box(2.4,.02,90,shd,5.2,.012,45);box(2.4,.02,90,shd,-5.2,.012,45);box(150,.02,2.4,shd,0,.012,8.8);box(150,.02,2.4,shd,0,.012,19.2);
 [-3.5,3.5].forEach(x=>{box(.14,.03,10,WL,x,.05,5);box(.14,.03,72,WL,x,.05,54);});
 [-3.5,3.5].forEach(zo=>{box(71,.03,.14,WL,-39.5,.05,14+zo);box(71,.03,.14,WL,39.5,.05,14+zo);});
 for(let z=1.5;z<88;z+=3.1)if(z<9.5||z>18.5)box(.25,.03,2.2,YL,0,.055,z);
 for(let x=-72;x<72;x+=3.1)if(Math.abs(x)>6.5)box(2.2,.03,.25,YL,x,.055,14);
 for(let i=0;i<8;i++){const x=-3.5+i,z=10.5+i;box(.5,.03,2.4,WL,x,.052,7.5);box(.5,.03,2.4,WL,x,.052,20.5);box(2.4,.03,.5,WL,6.5,.052,z);box(2.4,.03,.5,WL,-6.5,.052,z);}
 const lights=[];
 [[-6.5,8,true],[6.5,20,true],[6.5,8,false],[-6.5,20,false]].forEach(a=>{const x=a[0],z=a[1];
  box(.2,5.6,.2,0x3a4654,x,2.8,z);box(.6,1.7,.5,0x1a1f26,x,4.7,z);
  const mk=y=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.2,8,6),new THREE.MeshBasicMaterial({color:0x333333}));m.position.set(x,y,z+.28);sc.add(m);return m;};
  lights.push({main:a[2],l:[mk(5.2),mk(4.7),mk(4.2)]});});
 const ON=[0xff3b3b,0xffb800,0x3fe07f],OFF=[0x4a1414,0x4a3a00,0x12351f];
 anim.push(tm=>{const c=tm%12,ms=c<5?0:c<6?1:2,cs=c<6?2:c<11?0:1;
  lights.forEach(o=>{const st=o.main?ms:cs;o.l.forEach((m,k)=>m.material.color.setHex((k===0&&st===2)||(k===1&&st===1)||(k===2&&st===0)?ON[k]:OFF[k]));});});
 const cols=[0xd23b3b,0x1d5fc4,0xf0c23a,0x3fa86f,0x8d99a6,0xf5f6f2],cars=[];
 for(let i=0;i<6;i++){const c=new THREE.Group(),east=i%2===0;box(2.8,.7,1.3,cols[i],0,.6,0,c);box(1.5,.6,1.15,0xa9d1ef,-.2,1.2,0,c);
  [[-.9,-.7],[.9,-.7],[-.9,.7],[.9,.7]].forEach(a=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.2,10),M(0x1a1f26));w.rotation.x=Math.PI/2;w.position.set(a[0],.3,a[1]);c.add(w);});
  if(!east)c.rotation.y=Math.PI;c.position.set(-70+i*24,0,east?15.8:12.2);sc.add(c);cars.push({c,east,sp:7+rnd()*3,x:-70+i*24});}
 anim.push((tm,dt)=>cars.forEach(o=>{o.x+=(o.east?1:-1)*o.sp*dt;if(o.x>72)o.x=-72;if(o.x<-72)o.x=72;o.c.position.x=o.x;}));

 // end: road under construction
 const X=8;
 box(8,.04,14,AS,X,.02,-251);box(8,.045,12,dark?0x05070a:0x14181d,X,.022,-264);box(8,.03,20,0x9b8466,X,.015,-280);box(10,.025,16,0x6b5238,X,.012,-298);
 [-246,-249,-252,-255].forEach(z=>box(.25,.03,2.2,YL,X,.055,z));[X-3.5,X+3.5].forEach(x=>box(.14,.03,14,WL,x,.05,-251));
 [-2.8,0,2.8].forEach((dx,bi)=>{const bg=new THREE.Group();bg.position.set(X+dx,0,-258);sc.add(bg);
  for(let k=0;k<5;k++)box(.52,.5,.14,k%2?0xd23b3b:WL,-1.04+k*.52,1,0,bg);
  box(.1,1,.1,0x8d99a6,-1.1,.5,0,bg);box(.1,1,.1,0x8d99a6,1.1,.5,0,bg);
  if(bi!==1){const l=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),new THREE.MeshBasicMaterial({color:0xffb000}));l.position.set(0,1.45,0);bg.add(l);flash.push(l);}});
 const cn=[];for(let z=-246;z>=-262;z-=2)cn.push([X-4.5,z],[X+4.5,z]);[-3,-1.5,0,1.5,3].forEach(dx=>cn.push([X+dx,-256.5]));
 const cim=new THREE.InstancedMesh(new THREE.ConeGeometry(.3,.75,8),M(0xff7a1a),cn.length),oo=new THREE.Object3D();
 cn.forEach((a,i)=>{oo.position.set(a[0],.375,a[1]);oo.updateMatrix();cim.setMatrixAt(i,oo.matrix);});sc.add(cim);
 [[X+5.6,-262],[X-5.6,-262],[X+5.6,-250],[X-5.6,-250]].forEach(a=>drum(a[0],a[1],0xff7a1a,sc));
 {const c=document.createElement('canvas');c.width=1920;c.height=960;const k=c.getContext('2d');k.scale(3,3);
  k.fillStyle='#f0c23a';k.fillRect(0,0,640,320);k.strokeStyle='#10161d';k.lineWidth=14;k.strokeRect(10,10,620,300);
  k.fillStyle='#10161d';k.textAlign='center';k.textBaseline='middle';k.font='700 66px sans-serif';k.fillText('ROAD UNDER',320,80);k.fillText('CONSTRUCTION',320,150);
  k.font='600 34px sans-serif';k.fillText('More projects coming soon',320,215);
  for(let i=-1;i<12;i++){k.beginPath();k.moveTo(i*60+20,258);k.lineTo(i*60+50,258);k.lineTo(i*60+30,290);k.lineTo(i*60,290);k.closePath();k.fill();}
  const sg=new THREE.Group();sg.position.set(18,0,-262);sc.add(sg);box(.25,6,.25,0x3a4654,-3.6,3,0,sg);box(.25,6,.25,0x3a4654,3.6,3,0,sg);
  const bd=new THREE.Mesh(new THREE.PlaneGeometry(8,4),new THREE.MeshBasicMaterial({map:CT(c)}));bd.position.set(0,6.6,0);bd.rotation.x=-.45;sg.add(bd);}
 const roller=new THREE.Group(),dr1=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,2.5,16),M(0x6b7580)),dr2=dr1.clone();
 [dr1,dr2].forEach((d,i)=>{d.rotation.z=Math.PI/2;d.position.set(0,.9,i?1.7:-1.7);roller.add(d);});
 box(2,.9,3.4,0xf0b323,0,1.55,0,roller);box(1.5,1.3,1.5,0xf0b323,0,2.65,.6,roller);box(1.52,.6,1.2,0xa9d1ef,0,2.8,.6,roller);box(1.7,.12,1.7,0x3a4654,0,3.35,.6,roller);
 {const rb=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),new THREE.MeshBasicMaterial({color:0xffb000}));rb.position.set(0,3.55,.6);roller.add(rb);flash.push(rb);}
 roller.scale.setScalar(1.1);roller.position.set(X,0,-269);sc.add(roller);
 anim.push(tm=>{const z=-269+7*Math.sin(tm*.5),dz=z-roller.position.z;roller.position.z=z;dr1.rotation.x+=dz/.99;dr2.rotation.x+=dz/.99;});
 anim.push(tm=>flash.forEach((l,i)=>l.material.color.setHex(((tm*2+i*.5)%1)<.5?0xffb000:0x5a3d00)));
 const ex=new THREE.Group();
 box(.9,.7,3.6,0x1a1f26,-1.3,.35,0,ex);box(.9,.7,3.6,0x1a1f26,1.3,.35,0,ex);box(2.2,.5,2.8,0x3a4654,0,.9,0,ex);
 const up=new THREE.Group();up.position.y=1.15;ex.add(up);
 box(2.6,1.1,3,0xf0b323,0,.55,.2,up);box(1.5,1.4,1.5,0xf0b323,-.55,1.7,.5,up);box(1.52,.7,1.2,0xa9d1ef,-.55,1.85,.5,up);box(2.4,.9,.9,0x3a4654,0,.6,1.9,up);
 const boom=new THREE.Group();boom.position.set(.5,.9,-1.3);up.add(boom);box(.5,.5,3.8,0xf0b323,0,0,-1.9,boom);
 const stick=new THREE.Group();stick.position.set(0,0,-3.8);boom.add(stick);box(.38,.38,2.6,0xf0b323,0,0,-1.3,stick);
 const bucket=new THREE.Group();bucket.position.set(0,0,-2.6);stick.add(bucket);box(.9,.8,.9,0x3a4654,0,-.3,0,bucket);
 ex.scale.setScalar(1.3);ex.position.set(-1.5,0,-284);ex.rotation.y=.4;sc.add(ex);
 anim.push(tm=>{up.rotation.y=Math.sin(tm*.4)*.8;boom.rotation.x=.5+.14*Math.sin(tm*.7);stick.rotation.x=-.9+.5*Math.sin(tm*1.1);bucket.rotation.x=.4*Math.sin(tm*1.1+1);});
 const wheels6=(gp,zs)=>zs.forEach(z=>[-1.3,1.3].forEach(x=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.5,12),M(0x1a1f26));w.rotation.z=Math.PI/2;w.position.set(x,.55,z);gp.add(w);}));
 const dtk=new THREE.Group();box(2.6,.5,6.4,0x3a4654,0,.9,0,dtk);box(2.5,1.9,1.9,0xd23b3b,0,2.1,-2.3,dtk);box(2.52,.8,1.4,0xa9d1ef,0,2.5,-2.4,dtk);wheels6(dtk,[-2.2,1.2,2.4]);
 const bed=new THREE.Group();bed.position.set(0,1.25,3.1);dtk.add(bed);
 box(2.6,.15,5.4,0xf0b323,0,0,-2.6,bed);box(.15,1.1,5.4,0xf0b323,1.3,.55,-2.6,bed);box(.15,1.1,5.4,0xf0b323,-1.3,.55,-2.6,bed);box(2.6,1.1,.15,0xf0b323,0,.55,-5.3,bed);
 dtk.position.set(16.5,0,-274);sc.add(dtk);anim.push(tm=>{bed.rotation.x=Math.max(0,Math.sin(tm*.5))*.75;});
 const mxr=new THREE.Group();box(2.5,.5,7,0x3a4654,0,.9,0,mxr);box(2.4,1.8,1.8,CH,0,2.1,-2.9,mxr);box(2.42,.8,1.3,0xa9d1ef,0,2.5,-3,mxr);wheels6(mxr,[-2.8,1.6,2.8]);
 const tilt=new THREE.Group();tilt.position.set(0,2.4,1.1);tilt.rotation.x=Math.PI/2+.25;mxr.add(tilt);
 const mdrum=new THREE.Mesh(new THREE.CylinderGeometry(1.2,.7,4,14),M(0xe9ecef));tilt.add(mdrum);
 [[.95,0],[-.95,0],[0,.95],[0,-.95]].forEach(a=>box(.14,3.8,.14,BL,a[0],0,a[1],mdrum));
 mxr.position.set(16.5,0,-290);sc.add(mxr);anim.push((tm,dt)=>{mdrum.rotation.y+=dt*1.6;});
 const cr=new THREE.Group();box(1.2,26,1.2,0xf0b323,0,13,0,cr);box(3,.8,3,0x3a4654,0,.4,0,cr);
 const jib=new THREE.Group();jib.position.y=26;cr.add(jib);box(26,.8,1,0xf0b323,6,0,0,jib);box(5,1.6,2,0x3a4654,-9,0,0,jib);box(1.6,1.6,1.6,CH,0,1.2,0,jib);
 const tro=new THREE.Group();jib.add(tro);box(.7,.7,.7,0x3a4654,0,-.7,0,tro);box(.06,12,.06,0x8d99a6,0,-6.3,0,tro);box(.9,.9,.9,0xd23b3b,0,-12.5,0,tro);
 cr.position.set(-10,0,-296);sc.add(cr);anim.push(tm=>{jib.rotation.y=tm*.12;tro.position.x=12+6*Math.sin(tm*.3);});
 const bf=new THREE.Group();
 [0,1,2].forEach(f=>{if(f<2)box(11,.4,9,0xaab4be,0,f*3.6+3.6,0,bf);[[-5,-4],[5,-4],[-5,4],[5,4],[0,-4],[0,4]].forEach(a=>box(.8,3.6,.8,0xcfd6dc,a[0],f*3.6+1.8,a[1],bf));});
 [[-5,-4],[5,-4],[-5,4],[5,4]].forEach(a=>box(.08,1.2,.08,0x8a5a3a,a[0]+.2,11.4,a[1],bf));
 for(let i=0;i<5;i++)box(.12,7.6,.12,0xff7a1a,-5.5+i*2.75,3.8,5.2,bf);for(let y=1.8;y<8;y+=1.8)box(11.2,.1,.1,0xff7a1a,0,y,5.2,bf);
 bf.position.set(30,0,-288);sc.add(bf);
 [[-7,-266],[-7,-270]].forEach(a=>{box(6,2.6,2.4,0xcfd6dc,a[0],1.3,a[1]);box(6.02,.3,2.42,BL,a[0],2.5,a[1]);box(.9,1.8,.1,0x3a4654,a[0]+1.8,1,a[1]+1.25);box(1.2,.8,.1,0xa9d1ef,a[0]-1,1.5,a[1]+1.25);});
 box(6,2.6,2.4,0xcfd6dc,-7,3.9,-266);box(6.02,.3,2.42,BL,-7,5.1,-266);
 [[22,-268,0x8f8f88,2.8],[24.5,-262,0xc9b48a,2.2],[-14,-276,0x8f8f88,2.4]].forEach(a=>{const c=new THREE.Mesh(new THREE.ConeGeometry(a[3],a[3]*.9,9),M(a[2]));c.position.set(a[0],a[3]*.45,a[1]);sc.add(c);});
 [[-.75,.35],[0,.35],[.75,.35],[-.37,1],[.37,1],[0,1.65]].forEach(a=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,5,10),M(0x8d99a6));c.rotation.z=Math.PI/2;c.position.set(-8+a[0],a[1],-278);sc.add(c);});
 box(.1,1.3,.1,0x3a4654,5,.65,-292);box(.3,.25,.3,0xd23b3b,5,1.4,-292);
 const mkW=(x,y,z,ry,vest,kind,hat)=>{
  const g=new THREE.Group(),skin=0xd9a77a,hc=hat||YL;
  const lg=sx=>{const q=new THREE.Group();q.position.set(sx*.14,.55,0);box(.2,.55,.22,0x2b3744,0,-.275,0,q);g.add(q);return q;};
  const L=lg(-1),R=lg(1);box(.5,.6,.3,vest,0,.85,0,g);box(.52,.07,.32,WL,0,.95,0,g);
  const am=sx=>{const q=new THREE.Group();q.position.set(sx*.33,1.12,0);box(.14,.5,.14,vest,0,-.22,0,q);box(.12,.12,.12,skin,0,-.5,0,q);g.add(q);return q;};
  const AL=am(-1),AR=am(1);
  const hd=new THREE.Mesh(new THREE.SphereGeometry(.17,8,6),M(skin));hd.position.y=1.38;g.add(hd);
  const ht=new THREE.Mesh(new THREE.SphereGeometry(.2,8,6,0,6.283,0,1.57),M(hc));ht.position.y=1.42;g.add(ht);box(.46,.04,.46,hc,0,1.42,0,g);
  if(kind==='dig'){box(.06,1,.06,0x8a6a48,0,-.5,.25,AR);box(.3,.05,.32,0x8d99a6,0,-1,.32,AR);}
  if(kind==='hammer'){box(.05,.6,.05,0x8a6a48,0,-.5,.15,AR);box(.22,.14,.14,0x3a4654,0,-.82,.15,AR);}
  let pad=null;
  if(kind==='flag'){box(.05,1.5,.05,0x8a6a48,.4,.95,.35,g);pad=new THREE.Group();pad.position.set(.4,1.85,.35);g.add(pad);
   [[.02,0xd23b3b],[-.02,0x3fcf6f]].forEach(a=>{const d=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.04,8),M(a[1]));d.rotation.x=Math.PI/2;d.position.z=a[0];pad.add(d);});}
  if(kind==='walk'){box(.6,.3,.8,0xd23b3b,0,.55,.9,g);box(.08,.08,1,0x8a6a48,-.25,.45,.6,g);box(.08,.08,1,0x8a6a48,.25,.45,.6,g);
   const w=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.12,10),M(0x1a1f26));w.rotation.z=Math.PI/2;w.position.set(0,.22,1.4);g.add(w);}
  g.position.set(x,y,z);g.rotation.y=ry;g.scale.setScalar(1.5);sc.add(g);return {g,L,R,AL,AR,pad};};
 const job=(x,y,z,ry,vest,kind,ph,hat,path)=>{const w=mkW(x,y,z,ry,vest,kind,hat);
  anim.push(tm=>{const s2=tm+ph;
   if(kind==='dig'){w.AR.rotation.x=-.7+.6*Math.sin(s2*3);w.AL.rotation.x=w.AR.rotation.x*.9;w.g.position.y=y+Math.abs(Math.sin(s2*3))*.05;}
   else if(kind==='hammer'){w.AR.rotation.x=-1.3+.9*Math.sin(s2*7);w.AL.rotation.x=-.4;}
   else if(kind==='clip'){w.AL.rotation.x=-1.1;w.AR.rotation.x=-.3;w.g.rotation.y=ry+.5*Math.sin(s2*.5);}
   else if(kind==='flag'){w.AR.rotation.x=-1.3;w.AL.rotation.x=-.2;w.pad.rotation.y=Math.PI*(.5+.5*Math.tanh(4*Math.sin(s2*.9)));}
   else if(kind==='walk'){const u=(s2*.1)%2,f=u>1?2-u:u;w.g.position.set(path[0]+(path[2]-path[0])*f,y,path[1]+(path[3]-path[1])*f);
    w.g.rotation.y=Math.atan2(path[2]-path[0],path[3]-path[1])+(u>1?Math.PI:0);w.L.rotation.x=Math.sin(s2*6)*.6;w.R.rotation.x=-Math.sin(s2*6)*.6;w.AL.rotation.x=w.AR.rotation.x=-.9;}
  });};
 const OR=0xff7a1a,LM=0xb6e22f;
 job(3.2,0,-253.5,0,OR,'flag',0);job(5,0,-266,Math.PI/2,LM,'dig',.4);job(11,0,-264,-Math.PI/2,OR,'dig',1.1);job(12.6,0,-256,0,OR,'hammer',.7);
 job(28,3.8,-287,0,LM,'hammer',.2);job(32,7.4,-289,Math.PI,OR,'hammer',1.5);
 job(13.2,0,-274,0,OR,'walk',0,null,[13.2,-274,13.2,-294]);
 job(-3,0,-270,.6,LM,'clip',.3,0xf5f6f2);job(24,0,-282,-.8,OR,'clip',1.2,0xf5f6f2);job(6.4,0,-291,-.9,LM,'clip',2);job(-5,0,-280,1.2,OR,'clip',.9);job(10,0,-298,Math.PI,LM,'dig',2.2);
 }
 // truck (front faces -z)
 const tr=new THREE.Group(),wh=[];
 const BK=0x1a1f26,GL=0xa9d1ef;
 box(1.4,.18,3.7,BK,0,.52,.1,tr);box(1.56,1.45,1.45,CH,0,1.33,-1,tr);box(1.6,.1,1.49,BL,0,.98,-1,tr);
 box(1.4,.62,.04,GL,0,1.58,-1.745,tr);box(.04,.62,.95,GL,.78,1.58,-1,tr);box(.04,.62,.95,GL,-.78,1.58,-1,tr);
 box(1.56,.2,.16,BK,0,.55,-1.8,tr);box(1.1,.26,.05,BK,0,.86,-1.74,tr);box(.4,.14,.04,0xf0c23a,0,.58,-1.86,tr);
 [.55,-.55].forEach(x=>{box(.34,.26,.06,BK,x,.88,-1.76,tr);box(.2,.16,.05,0xfff2b0,x,.88,-1.8,tr);});
 box(1.56,.08,2.3,CH,0,.78,.95,tr);[.75,-.75].forEach(x=>{box(.06,.28,2.3,CH,x,.96,.95,tr);box(.07,.06,2.31,BL,x,.9,.95,tr);});box(1.56,.28,.06,CH,0,.96,2.1,tr);box(1.4,.14,2.3,BK,0,.66,.95,tr);
 [.79,-.79].forEach(x=>{box(.05,.95,.03,BK,x,1.3,-.62,tr);box(.05,.95,.03,BK,x,1.3,-1.55,tr);box(.06,.05,.22,BK,x,1.15,-.8,tr);box(.1,.2,.1,BK,x*1.1,1.62,-1.68,tr);box(.18,.04,.05,BK,x*1.05,1.66,-1.68,tr);box(.03,.25,.2,BK,x*1.02,.3,1.68,tr);box(.2,.12,.05,0xd23b3b,x*.8,.98,2.15,tr);});
 box(.34,.12,.03,0xf0c23a,0,.75,2.15,tr);box(.5,.06,.3,CH,0,2.1,-1,tr);
 for(let i=0;i<3;i++)box(.9,.025,.02,0x4a5766,0,.79+i*.07,-1.77,tr);
 box(.55,.025,.02,BK,.35,1.3,-1.76,tr);box(.55,.025,.02,BK,-.35,1.3,-1.76,tr);
 box(.7,.28,.4,BL,.3,.96,1.5,tr);box(.72,.04,.42,0x16407f,.3,1.11,1.5,tr);box(.55,.4,.55,0xb08a5a,-.3,1.02,.3,tr);box(.5,.04,.5,0x8a6a48,-.3,1.24,.3,tr);
 [[.78,-1],[-.78,-1],[.78,1.25],[-.78,1.25]].forEach(a=>{const w=new THREE.Group(),t=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.25,14),M(0x1a1f26));t.rotation.z=Math.PI/2;
  w.add(t);box(.28,.1,.46,0xcfd6dc,0,0,0,w);box(.27,.46,.1,0xcfd6dc,0,0,0,w);w.position.set(a[0],.34,a[1]);tr.add(w);wh.push(w);});
 tr.scale.setScalar(1.5);sc.add(tr);wh[0].rotation.order=wh[1].rotation.order='YXZ';

 // loop
 let target=0,cur=0,last=0,face=0,faceT=0,px=null,pz=0,pf=0,st=0,cb=0,WR=.51,STOPD=3.2,swapT=1;
 // ---- checkpoint pathways, interiors and entry sequence ----
 const RSC=[1,.62,.62,.62,1],ROOMX=1200,RS=120,HD=[4.65,4.1,1.25,2.5,4.7],COL=[0xff7a1a,0x1d5fc4,0x1fb5a3,0xf0c23a,0xd23b3b],BGI=[0x3a2c1e,0x12284a,0x0f2f33,0x33331c,0x351a1c];
 const ent={s:null,i:0,u:0,tmr:0,room:-1},ca=new THREE.Vector3(),caKeep=new THREE.Vector3(),rooms=[],fadeEl=document.getElementById('fade'),roomEls=$$('.inside'),PAS=dark?0x0f161d:0x2a3440;
 for(let i=0;i<5;i++){const P=cv.getPointAt(T[i]),tg=cv.getTangentAt(T[i]),end=BO[i]-HD[i]+.3,s0=3.6,len=end-s0,w=i===1?4.6:6,gp=new THREE.Group();
  gp.position.set(P.x-tg.z*(s0+len/2),0,P.z+tg.x*(s0+len/2));gp.rotation.y=Math.atan2(-tg.z,tg.x);sc.add(gp);
  box(w,.05,len,0xb9b4a8,0,.03,0,gp);box(w+3,.045,2.6,PAS,0,.0225,-len/2+.2,gp);
  [-1,1].forEach(sx=>box(.12,.06,len,0xf5f6f2,sx*(w/2-.2),.06,0,gp));
  for(let z=-len/2+1;z<len/2-.6;z+=2)box(.2,.06,1,0xf0c23a,0,.06,z,gp);
  const ar=new THREE.Mesh(new THREE.ConeGeometry(.8,1.6,4),new THREE.MeshBasicMaterial({color:COL[i]}));ar.rotation.x=Math.PI;ar.position.set(0,4.2,-len/2+2);gp.add(ar);
  anim.push(tm=>{ar.position.y=4.2+.5*Math.sin(tm*3+i);ar.rotation.y=tm*2;});}
 const cvTex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w*2;c.height=h*2;const k=c.getContext('2d');k.scale(2,2);fn(k,w,h);return{c,k,t:CT(c)};};
 const plane=(w,h,tex,x,y,z,gp,ry)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));m.position.set(x,y,z);if(ry)m.rotation.y=ry;gp.add(m);return m;};
 const label=(lines,w,h,bg,fg,fs)=>cvTex(w,h,k=>{k.fillStyle=bg;k.fillRect(0,0,w,h);k.fillStyle=fg;k.textAlign='center';k.textBaseline='middle';k.font='700 '+fs+'px sans-serif';lines.forEach((l,n)=>k.fillText(l,w/2,h*(n+1)/(lines.length+1)));});
 const mkRoom=(i,wall,floor,trim)=>{const g=new THREE.Group();g.position.set(ROOMX+i*RS,0,0);g.scale.setScalar(RSC[i]);sc.add(g);rooms[i]=g;
  box(26,.3,36,floor,0,-.15,2,g);box(26.6,10,.4,wall,0,5,-14.2,g);box(.4,10,30,wall,-13.2,5,1,g);box(.4,10,30,wall,13.2,5,1,g);
  box(26,.5,.3,trim,0,.25,-13.9,g);box(.3,.5,30,trim,-12.9,.25,1,g);box(.3,.5,30,trim,12.9,.25,1,g);return g;};
 const live=i=>ent.room===i;
 { // garage: about me
  const g=mkRoom(0,0xe9e3d3,0x8d99a6,BL);
  box(12,5,.2,0xc9a36a,0,6,-13.8,g);
  for(let k=0;k<20;k++){const x=-5.2+(k%10)*1.15,y=7.6-Math.floor(k/10)*2.2;box(.18,1.1,.1,[0x8d99a6,0xd23b3b,0xf0c23a,BL][k%4],x,y,-13.6,g);box(.5,.2,.1,0x3a4654,x,y+.6,-13.6,g);}
  box(11,.3,2.4,0xb08a5a,-6,3,-12.5,g);box(.3,3,2,0x6b5238,-10.8,1.5,-12.5,g);box(.3,3,2,0x6b5238,-1.2,1.5,-12.5,g);
  box(3.2,3.4,2.2,0xd23b3b,-10,1.7,-9.5,g);for(let k=0;k<4;k++)box(3,.06,.05,0x1a1f26,-10,.6+k*.8,-8.38,g);
  drum(9,-10.5,BL,g);drum(10.4,-9.4,0xd23b3b,g);for(let k=0;k<3;k++)tire(9.2,.2+k*.4,-6,g);
  const cl=cvTex(256,256,k=>{k.fillStyle='#f5f6f2';k.beginPath();k.arc(128,128,120,0,6.283);k.fill();k.strokeStyle='#10161d';k.lineWidth=10;k.stroke();for(let n=0;n<12;n++){const a=n/12*6.283;k.beginPath();k.moveTo(128+Math.sin(a)*100,128-Math.cos(a)*100);k.lineTo(128+Math.sin(a)*112,128-Math.cos(a)*112);k.stroke();}});
  const ck=new THREE.Group();ck.position.set(-9.5,8,-13.6);g.add(ck);ck.add(new THREE.Mesh(new THREE.CircleGeometry(1.3,24),new THREE.MeshBasicMaterial({map:cl.t})));
  const hand=(l,wd)=>{const q=new THREE.Group();box(wd,l,.05,0x10161d,0,l/2,.05,q);ck.add(q);return q;},hm=hand(1,.08),hh=hand(.7,.12);
  anim.push(tm=>{hm.rotation.z=-tm*.6;hh.rotation.z=-tm*.05;});
  box(3.4,2.6,.2,0x8a5a3a,9.5,6.5,-13.7,g);plane(3,2.2,label(['BSME','CIT-U 2023'],300,220,'#f5f6f2','#1d5fc4',56).t,9.5,6.5,-13.58,g);
  [-6,0,6].forEach(x=>{const sh=new THREE.Mesh(new THREE.ConeGeometry(1.1,.9,12,1,true),new THREE.MeshBasicMaterial({color:0xd23b3b,side:THREE.DoubleSide}));sh.position.set(x,8.6,-3);g.add(sh);box(.06,1.6,.06,0x3a4654,x,9.6,-3,g);box(.8,.1,.8,0xfff2b0,x,8.1,-3,g);});
  plane(7,2.2,label(['Reden’s Garage'],700,220,'#ff7a1a','#fff',84).t,12.9,5,-3,g,-Math.PI/2);
 }
 { // workshop: CAD and analysis
  const g=mkRoom(1,0xdbe6f3,0x6b7580,0xf0c23a);
  const bp=cvTex(1024,512,(k,w,h)=>{k.fillStyle='#1d4f9c';k.fillRect(0,0,w,h);k.strokeStyle='rgba(255,255,255,.25)';k.lineWidth=1;for(let x=0;x<w;x+=32){k.beginPath();k.moveTo(x,0);k.lineTo(x,h);k.stroke();}for(let y=0;y<h;y+=32){k.beginPath();k.moveTo(0,y);k.lineTo(w,y);k.stroke();}
   k.strokeStyle='#fff';k.lineWidth=3;[110,40].forEach(r=>{k.beginPath();k.arc(256,256,r,0,6.283);k.stroke();});for(let a=0;a<12;a++){k.beginPath();k.arc(256+Math.cos(a/12*6.283)*130,256+Math.sin(a/12*6.283)*130,16,0,6.283);k.stroke();}
   k.strokeRect(560,120,300,260);k.beginPath();k.moveTo(560,250);k.lineTo(860,250);k.stroke();k.fillStyle='#fff';k.font='700 34px sans-serif';k.fillText('REDEN PAGAL, RMEE',560,440);k.font='600 24px sans-serif';k.fillText('DWG-001  FEA / CFD',560,476);});
  plane(18,9,bp.t,0,5.5,-13.9,g);
  box(7,1.4,2.2,0x3a4654,-7,.9,-10,g);box(7.2,.5,2.4,0x8d99a6,-7,1.85,-10,g);box(1.6,2.6,2.2,0xf0b323,-9.6,2.5,-10,g);
  const chuck=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,.5,12),M(0xaab4be));chuck.rotation.z=Math.PI/2;chuck.position.set(-8.6,2.6,-10);g.add(chuck);
  box(2,6,2,BL,9,3,-11,g);box(2.6,1.4,2.6,BL,9,5.4,-10.6,g);box(4,.5,2.6,0x8d99a6,9,2.2,-8.8,g);
  const spn=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,1.4,8),M(0xaab4be));spn.position.set(9,4.2,-9.2);g.add(spn);
  const spk=new THREE.InstancedMesh(new THREE.BoxGeometry(.12,.12,.12),new THREE.MeshBasicMaterial({color:0xffc83a}),16),so=new THREE.Object3D();spk.frustumCulled=false;g.add(spk);
  anim.push((tm,dt)=>{chuck.rotation.x+=dt*14;spn.rotation.y+=dt*20;if(!live(1))return;for(let n=0;n<16;n++){const u=(tm*1.6+n*.37)%1;so.position.set(9+Math.sin(n*5.1)*u*1.6,2.5+u*1.8-u*u*1.2,-8.8+Math.cos(n*3.3)*u*1.3);so.scale.setScalar(1-u+.01);so.updateMatrix();spk.setMatrixAt(n,so.matrix);}spk.instanceMatrix.needsUpdate=true;});
  const pr=new THREE.Group();pr.position.set(-8,0,-6.5);g.add(pr);box(3.4,.4,3.4,0x3a4654,0,.2,0,pr);[[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]].forEach(a=>box(.15,3.4,.15,0x8d99a6,a[0],1.9,a[1],pr));box(3.4,.15,3.4,0x8d99a6,0,3.6,0,pr);box(2.6,.2,2.6,0x1a1f26,0,.55,0,pr);
  const pb=box(.9,.9,.9,0xf0c23a,0,1,0,pr),ph=box(.5,.4,.5,0xd23b3b,0,2,0,pr);
  anim.push(tm=>{const u=Math.max(.05,(tm%6)/6);pb.scale.y=u;pb.position.y=.65+.45*u;ph.position.set(Math.sin(tm*3)*.9,1.4+.9*u,Math.cos(tm*2.1)*.9);});
  box(6,.3,2.4,0xb08a5a,7,2.4,-2,g);box(.3,2.4,2.2,0x6b5238,4.2,1.2,-2,g);box(.3,2.4,2.2,0x6b5238,9.8,1.2,-2,g);
  const s1=cvTex(512,320,()=>{}),s2=cvTex(512,320,(k,w,h)=>{const gr=k.createRadialGradient(256,160,10,256,160,160);gr.addColorStop(0,'#ff3b3b');gr.addColorStop(.4,'#ffb800');gr.addColorStop(.7,'#3fe07f');gr.addColorStop(1,'#1d5fc4');k.fillStyle='#0b1b30';k.fillRect(0,0,w,h);k.fillStyle=gr;k.beginPath();k.arc(256,160,130,0,6.283);k.fill();k.fillStyle='#fff';k.font='700 28px sans-serif';k.fillText('FEA stress',20,40);});
  box(3.4,2.2,.2,0x1a1f26,5.4,4,-2.6,g);plane(3.1,1.9,s1.t,5.4,4,-2.48,g);box(3.4,2.2,.2,0x1a1f26,8.6,4,-2.6,g);plane(3.1,1.9,s2.t,8.6,4,-2.48,g);
  let ft=0;anim.push(tm=>{if(!live(1)||(ft++)%4)return;const k=s1.k,a=tm*.8,P=[];k.fillStyle='#0b1b30';k.fillRect(0,0,512,320);k.strokeStyle='#6fd3a0';k.lineWidth=2;
   for(let n=0;n<8;n++){const x=n&1?1:-1,y=n&2?1:-1,z=n&4?1:-1,X=x*Math.cos(a)-z*Math.sin(a),Z=x*Math.sin(a)+z*Math.cos(a),Y=y*.87-Z*.5,Z2=y*.5+Z*.87,f=70*(1+Z2*.12);P.push([256+X*f,160+Y*f]);}
   [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]].forEach(e=>{k.beginPath();k.moveTo(P[e[0]][0],P[e[0]][1]);k.lineTo(P[e[1]][0],P[e[1]][1]);k.stroke();});s1.t.needsUpdate=true;});
  box(3,1.2,9,0xb08a5a,-10.5,.6,2,g);
  const fan=new THREE.Group();fan.position.set(-10.5,1.8,-1.5);g.add(fan);for(let n=0;n<4;n++){const b=box(.12,.9,.3,0xaab4be,0,0,0,fan);b.position.set(Math.cos(n*1.571)*.45,Math.sin(n*1.571)*.45,0);b.rotation.z=n*1.571;}
  const it=[];let flame=null;const put=(z,fn)=>{const q=new THREE.Group();q.position.set(-10.5,1.8,z);g.add(q);fn(q);it.push(q);};
  put(-.3,q=>{box(.4,1.2,.4,0xe9ecef,0,0,0,q);const c=new THREE.Mesh(new THREE.ConeGeometry(.28,.6,10),M(0xd23b3b));c.position.y=.9;q.add(c);});
  put(.9,q=>{box(1,.6,.6,0x8d99a6,0,0,0,q);box(.2,.2,1,0xf0c23a,0,.4,0,q);});
  put(2.1,q=>{box(.5,.9,.5,0xf5f6f2,0,0,0,q);flame=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),new THREE.MeshBasicMaterial({color:0xffa31a}));flame.position.y=.65;q.add(flame);});
  put(3.3,q=>{box(.25,.9,.25,0x8d99a6,0,0,0,q);const hx=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.25,6),M(0x8d99a6));hx.position.y=.55;q.add(hx);});
  put(4.5,q=>{box(1,.5,.7,0xd23b3b,0,0,0,q);[[-.25,-.15],[.25,-.15],[-.25,.15],[.25,.15]].forEach(a=>{const st2=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.15,8),M(0xd23b3b));st2.position.set(a[0],.32,a[1]);q.add(st2);});});
  put(5.7,q=>{box(1,.7,.8,BL,0,0,0,q);box(.6,.2,.5,0x0b1b30,0,.4,0,q);});
  const gg=(r,col,x,y,z,n)=>{const q=new THREE.Group(),b=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.5,16),M(col));b.rotation.x=Math.PI/2;q.add(b);for(let k=0;k<n;k++){const a=k/n*6.283;box(.5,.3,.5,col,Math.cos(a)*(r+.2),Math.sin(a)*(r+.2),0,q).rotation.z=a;}q.position.set(x,y,z);g.add(q);return q;};
  const th=-.35,GD=3.4,g1=gg(1.8,0xf0b323,-1,4.8,-6,12),g2=gg(1.2,BL,-1+GD*Math.cos(th),4.8+GD*Math.sin(th),-6,8);box(.3,4.4,.3,0x3a4654,-1,2.2,-6,g);box(.2,3.2,.2,0x3a4654,-1+GD*Math.cos(th),1.6,-6,g);
  anim.push((tm,dt)=>{fan.rotation.z+=dt*6;it.forEach((q,n)=>{q.rotation.y=tm*.8+n;});if(flame)flame.scale.setScalar(1+.25*Math.sin(tm*18));g1.rotation.z=tm*.8;g2.rotation.z=-1.5*(tm*.8-th)+th+Math.PI+Math.PI/8;});
 }
 { // dev yard: tools I build
  const g=mkRoom(2,0x2a8a8a,0x1f2a30,0xf0c23a);
  for(let k=-12;k<=12;k++)box(.25,10,.2,0x1f6a6a,k,5,-13.9,g);for(let k=-13;k<=15;k++){box(.2,10,.25,0x1f6a6a,-12.9,5,k,g);box(.2,10,.25,0x1f6a6a,12.9,5,k,g);}
  [-9,-5.5,-2].forEach(x=>box(2.6,7.4,1.6,0x1a1f26,x,3.7,-12,g));
  const leds=new THREE.InstancedMesh(new THREE.BoxGeometry(.18,.12,.05),new THREE.MeshBasicMaterial({color:0xffffff}),90),lo=new THREE.Object3D(),lc=new THREE.Color();leds.frustumCulled=false;
  for(let n=0;n<90;n++){const r=Math.floor(n/30),x=[-9,-5.5,-2][r]-.9+((n%30)%3)*.5,y=1+Math.floor((n%30)/3)*.65;lo.position.set(x,y,-11.15);lo.updateMatrix();leds.setMatrixAt(n,lo.matrix);leds.setColorAt(n,lc.setHex(0x3fe07f));}
  g.add(leds);let lt2=0;
  anim.push(tm=>{if(!live(2)||(lt2++)%8)return;for(let n=0;n<90;n++)leds.setColorAt(n,lc.setHex(Math.sin(tm*3+n*1.7)>.2?0x3fe07f:(n%7===0?0xffb800:0x16381f)));leds.instanceColor.needsUpdate=true;});
  box(10,.3,3,0x3a4654,-5,2.6,-5,g);[-9.5,-.5].forEach(x=>box(.3,2.6,2.8,0x1a1f26,x,1.3,-5,g));
  const code=[],mon=(x,hue)=>{const sx=cvTex(512,320,()=>{});box(3.6,2.3,.2,0x1a1f26,x,4.3,-5.8,g);plane(3.3,2,sx.t,x,4.3,-5.68,g);code.push({s:sx,hue});};
  mon(-8,'#6fd3a0');mon(-5,'#6aa3f5');mon(-2,'#f0c23a');
  const CL=['const load = beam.load(span);','if (stress > limit) warn();','render(route, checkpoints);','export const calc = x => x * k;','npm run build -> ok','git push origin main','vercel deploy --prod','assert(deflection < max);'];
  let ct=0;anim.push(tm=>{if(!live(2)||(ct++)%6)return;code.forEach((m,n)=>{const k=m.s.k;k.fillStyle='#0b1b30';k.fillRect(0,0,512,320);k.fillStyle=m.hue;k.font='600 22px monospace';for(let r=0;r<10;r++)k.fillText(CL[(Math.floor(tm*2)+r+n*3)%CL.length],14,34+r*30);m.s.t.needsUpdate=true;});});
  const nz=cvTex(512,160,(k,w,h)=>{k.shadowColor='#ff3bd4';k.shadowBlur=24;k.fillStyle='#ff9bea';k.font='700 78px monospace';k.textAlign='center';k.textBaseline='middle';k.fillText('npm run dev',w/2,h/2);});
  const nm=plane(8,2.5,nz.t,3,8,-13.6,g);nm.material.transparent=true;anim.push(tm=>{nm.material.opacity=Math.sin(tm*20)>-.9?1:.35;});
  const bulbs=[];for(let n=0;n<18;n++){const b=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),new THREE.MeshBasicMaterial({color:0xffffff}));b.position.set(-12+n*1.4,9.2-Math.sin(n/17*3.14)*.8,-8);g.add(b);bulbs.push(b);}
  anim.push(tm=>{if(!live(2))return;bulbs.forEach((b,n)=>b.material.color.setHex([0xff6b6b,0xffd36b,0x6bd6ff,0x9bff6b][(n+Math.floor(tm*2))%4]));});
  const bb=new THREE.Mesh(new THREE.SphereGeometry(1.4,12,8),M(0xd23b3b));bb.scale.set(1.2,.7,1.2);bb.position.set(8,.9,-3);g.add(bb);
  const mug=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.5,10),M(0xf5f6f2));mug.position.set(-1,3,-4);g.add(mug);
  box(1.4,1,1.4,0x8a5a3a,10.5,.5,-8,g);{const lf=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),M(0x3f9a4a));lf.position.set(10.5,1.9,-8);g.add(lf);}
  plane(7,4,cvTex(700,400,(k,w,h)=>{k.fillStyle='#f5f6f2';k.fillRect(0,0,w,h);[['#fff3a8','ship it',40,40],['#bfe6ff','test',260,70],['#ffc9d6','fix',470,40],['#c9f5c9','review',80,230],['#fff3a8','deploy',330,230]].forEach(a=>{k.fillStyle=a[0];k.fillRect(a[2],a[3],170,130);k.fillStyle='#10161d';k.font='700 34px sans-serif';k.fillText(a[1],a[2]+16,a[3]+76);});}).t,-12.8,5,-4,g,Math.PI/2);
 }
 { // weighbridge: compliance and training
  const g=mkRoom(3,0xdfe6dd,0x9aa6a0,0xf0c23a);
  box(9,.04,13,0x8d99a6,0,.02,3,g);box(9,.05,.2,0xf0c23a,0,.025,-3.4,g);box(9,.05,.2,0xf0c23a,0,.025,9.4,g);box(.2,.05,13,0xf0c23a,-4.4,.025,3,g);box(.2,.05,13,0xf0c23a,4.4,.025,3,g);
  const wd=cvTex(768,256,()=>{});plane(9,3,wd.t,0,6.5,-13.5,g);box(9.4,3.4,.3,0x1a1f26,0,6.5,-13.7,g);
  let wt=0;anim.push(()=>{if(!live(3)||(wt++)%5)return;const k=wd.k,tg=occ===tr?1020:72,v=Math.max(0,Math.min(tg,(9.5-(occ===tr?occ.position.z:occ.position.z/RSC[3]))*tg/5.5));k.fillStyle='#071a10';k.fillRect(0,0,768,256);k.fillStyle='#6fd3a0';k.font='700 36px monospace';k.textAlign='left';k.fillText('DEMO SCALE',30,50);k.font='700 120px monospace';k.fillText(String(Math.round(v)).padStart(4,'0')+' kg',30,170);k.font='700 40px monospace';k.fillStyle=v>=tg?'#6fd3a0':'#ffb800';k.fillText(v>=tg?'LOAD OK':'WEIGHING...',30,230);wd.t.needsUpdate=true;});
  [2.6,4.6,6.6].forEach((y,r)=>{box(.8,.15,16,0x8a5a3a,-12.4,y-.1,1,g);for(let n=0;n<14;n++)box(.6,1.4,.9,[0x1d5fc4,0xd23b3b,0xf0c23a,0x3fa86f,0xf5f6f2][(n+r)%5],-12.4,y+.7,-6+n*1.1,g);});
  box(.3,5,.3,0x3a4654,10.5,2.5,-10,g);box(1,2.2,1,0x1a1f26,10.5,5.6,-10,g);
  const sr=new THREE.Mesh(new THREE.SphereGeometry(.35,10,8),new THREE.MeshBasicMaterial({color:0xff3b3b})),sg=new THREE.Mesh(new THREE.SphereGeometry(.35,10,8),new THREE.MeshBasicMaterial({color:0x3fe07f}));sr.position.set(10.5,6.1,-9.45);sg.position.set(10.5,5.2,-9.45);g.add(sr,sg);
  anim.push(()=>{const ok=(occ===tr?occ.position.z:occ.position.z/RSC[3])<4;sr.material.color.setHex(ok?0x4a1414:0xff3b3b);sg.material.color.setHex(ok?0x3fe07f:0x12351f);});
  plane(5,3.5,label(['Logbook','NHVR 2026','Austroads','PSME CPD'],500,350,'#f5f6f2','#10161d',48).t,12.9,5,-3,g,-Math.PI/2);
  box(5,.3,2,0xb08a5a,-6,2.4,-11,g);box(.3,2.4,1.8,0x6b5238,-8.3,1.2,-11,g);box(.3,2.4,1.8,0x6b5238,-3.7,1.2,-11,g);box(1.4,.8,1,0xe9ecef,-5,3,-11,g);
  [[7,8],[8.4,7]].forEach(a=>{const c=new THREE.Mesh(new THREE.ConeGeometry(.3,.7,8),M(0xff7a1a));c.position.set(a[0],.35,a[1]);g.add(c);});
 }
 { // depot: contact
  const g=mkRoom(4,0xd7dde2,0x8d99a6,0xd23b3b);
  [-10,10].forEach(x=>{[2.2,4.8,7.4].forEach(y=>{box(3,.2,12,BL,x,y,-6,g);for(let n=0;n<4;n++)box(2.2,1.6,2.2,[0xb08a5a,0xc69d68,0xf5f6f2][(n+Math.floor(y))%3],x,y+.9,-10+n*2.8,g);});[-12,0].forEach(z=>[-1.4,1.4].forEach(dx=>box(.3,8.2,.3,0xf0b323,x+dx,4.1,z,g)));});
  const mp=cvTex(768,384,()=>{});plane(10,5,mp.t,0,6,-13.6,g);box(10.4,5.4,.2,0x1a1f26,0,6,-13.75,g);
  const RT=[[60,320],[170,250],[270,300],[380,190],[500,230],[620,120],[700,70]];
  let mt=0;anim.push(tm=>{if(!live(4)||(mt++)%4)return;const k=mp.k;k.fillStyle='#e8f1f8';k.fillRect(0,0,768,384);k.strokeStyle='#2a3440';k.lineWidth=18;k.lineJoin='round';k.beginPath();RT.forEach((q,n)=>n?k.lineTo(q[0],q[1]):k.moveTo(q[0],q[1]));k.stroke();k.strokeStyle='#f0c23a';k.lineWidth=3;k.setLineDash([14,12]);k.stroke();k.setLineDash([]);
   ['Garage','Workshop','Dev yard','Weighbridge','Depot'].forEach((nm,n)=>{const q=RT[[0,2,3,5,6][n]];k.fillStyle='#1d5fc4';k.beginPath();k.arc(q[0],q[1],14,0,6.283);k.fill();k.fillStyle='#10161d';k.font='700 22px sans-serif';k.textAlign='center';k.fillText(nm,q[0],q[1]-24);});
   const u=(tm*.12)%1,sg2=u*(RT.length-1),a=Math.floor(sg2),f=sg2-a,A=RT[a],B=RT[Math.min(a+1,RT.length-1)];k.fillStyle='#d23b3b';k.beginPath();k.arc(A[0]+(B[0]-A[0])*f,A[1]+(B[1]-A[1])*f,12,0,6.283);k.fill();mp.t.needsUpdate=true;});
  const fk=new THREE.Group();box(2,1.2,3,0xf0b323,0,1.1,0,fk);box(1.6,1,1.4,0x3a4654,0,2.2,.6,fk);box(.2,3.4,.2,0x8d99a6,-.6,2.1,-1.7,fk);box(.2,3.4,.2,0x8d99a6,.6,2.1,-1.7,fk);box(.15,.12,2,0x8d99a6,-.5,.5,-2.6,fk);box(.15,.12,2,0x8d99a6,.5,.5,-2.6,fk);
  [[-.9,-.9],[.9,-.9],[-.9,1],[.9,1]].forEach(a=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.3,10),M(0x1a1f26));w.rotation.z=Math.PI/2;w.position.set(a[0],.45,a[1]);fk.add(w);});
  g.add(fk);anim.push(tm=>{fk.position.set(Math.sin(tm*.5)*6,0,-9);fk.rotation.y=Math.cos(tm*.5)>0?-Math.PI/2:Math.PI/2;});
  box(.3,2,.3,0x3a4654,10.5,1,10,g);box(1.6,1,1.2,BL,10.5,2.4,10,g);const fl=box(.1,.9,.5,0xd23b3b,11.4,2.9,10,g);anim.push(tm=>{fl.rotation.z=.6*Math.sin(tm*2);});
  plane(3,.9,label(['Say hi'],300,90,'#ffffff','#1d5fc4',50).t,10.5,2.4,10.61,g);
  const lt=cvTex(512,160,(k,w,h)=>{k.shadowColor='#3fe07f';k.shadowBlur=24;k.fillStyle='#b9ffd0';k.font='700 78px sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText('Let’s talk',w/2,h/2);});
  const ln=plane(5,1.6,lt.t,-9.5,9.3,-13.55,g);ln.material.transparent=true;anim.push(tm=>{ln.material.opacity=Math.sin(tm*17)>-.9?1:.4;});
  for(let n=0;n<5;n++)box(1.2,.9,1.2,[0xb08a5a,0xc69d68,0xf5f6f2][n%3],7+(n%3)*1.3,.45+Math.floor(n/3)*.9,12+Math.floor(n/3)*.2,g);
 }
 const lit=new THREE.PointLight(0xfff0d0,0,90);sc.add(lit);const gl=sc.children.filter(o=>o.isHemisphereLight||o.isDirectionalLight),gl0=gl.map(o=>o.intensity);
 const fade=(on,col)=>{if(col!==undefined)fadeEl.style.setProperty('--fc','#'+col.toString(16).padStart(6,'0'));fadeEl.classList.toggle('on',on);};
 const roll=(ds,da)=>wh.forEach(w=>{w.rotation.x-=(ds+da*w.position.x*1.5)/WR;});
 const steer=(v,dt)=>{st+=(v-st)*Math.min(1,dt*10);wh[0].rotation.y=wh[1].rotation.y=st;};
 const camOut=(p,t)=>{const S=innerWidth>=800?14:0;cam.position.set(p.x-t.x*31+t.z*(S||3),36.7,p.z-t.z*31-t.x*(S||3));cam.lookAt(p.x+t.x*4+t.z*S,0,p.z+t.z*4-t.x*S);};
 const camIn=(i,tm)=>{const x=ROOMX+i*RS,S2=innerWidth>=800?5:0;const w2=ent.wk;cam.position.set(x-S2*(w2?.6:1)+Math.sin(tm*.25)*(w2?1.2:2.2),w2?4.9:9.5,w2?10.4:19);cam.lookAt(x-S2*(w2?.6:1),w2?1.5:1.8,w2?-.6:-3);};
 let crv=null,clen=1,cu=0,pang=0;
 const Rof=i=>{const q=cv.getTangentAt(T[i]);return new THREE.Vector3(-q.z,0,q.x);};
 const mkPath=(a,b,c,d)=>{crv=new THREE.CubicBezierCurve3(a,b,c,d);clen=crv.getLength();cu=0;};
 const mkPath2=list=>{const cs2=list.map(q=>new THREE.CubicBezierCurve3(q[0],q[1],q[2],q[3])),ls=cs2.map(c=>c.getLength()),tot=ls.reduce((a,b)=>a+b,0);
  const loc=u=>{let d=u*tot,k=0;while(k<cs2.length-1&&d>ls[k]){d-=ls[k];k++;}return[cs2[k],Math.min(1,d/ls[k])];};
  crv={getPointAt:u=>{const m=loc(u);return m[0].getPointAt(m[1]);},getTangentAt:u=>{const m=loc(u);return m[0].getTangentAt(m[1]);}};clen=tot;cu=0;};
 const stepPath=dt=>{const v=6.5*(.08+.92*Math.min(ease(Math.min(1,cu/.22)),ease(Math.min(1,(1-cu)/.22))));cu=Math.min(1,cu+v*dt/clen);const pos=crv.getPointAt(cu),d=crv.getTangentAt(cu),ang=Math.atan2(-d.x,-d.z);
  let da=ang-pang;da=Math.atan2(Math.sin(da),Math.cos(da));pang=ang;tr.position.set(pos.x,0,pos.z);tr.rotation.y=ang;steer(Math.max(-.6,Math.min(.6,da/Math.max(dt,.001)*.35)),dt);roll(v*dt,da);return cu>=1;};
 const toRoom=i=>{const cx=ROOMX+i*RS;ent.room=i;document.body.classList.add('inroom');sc.background.setHex(BGI[i]);sc.fog.color.setHex(BGI[i]);sc.fog.near=70;sc.fog.far=170;lit.position.set(cx,9,2);lit.intensity=.55;gl.forEach((o,k)=>{o.intensity=gl0[k]*.5;});roomEls[i].querySelectorAll('[data-exit]').forEach(b=>{b.textContent='Drive back out';});tr.position.set(cx,0,19);tr.rotation.y=0;st=0;wh[0].rotation.y=wh[1].rotation.y=0;};
 const toOut=()=>{ent.room=-1;document.body.classList.remove('inroom');sc.background.setHex(skyC);sc.fog.color.setHex(skyC);sc.fog.near=110;sc.fog.far=330;lit.intensity=0;gl.forEach((o,k)=>{o.intensity=gl0[k];});};
 const startIn=()=>{const i=ent.i,P=cv.getPointAt(T[i]),tgA=cv.getTangentAt(cur),Rr=Rof(i),A=tr.position.clone(),odd=Math.round(faceT/Math.PI)%2!==0,hv=tgA.clone().multiplyScalar(odd?-1:1),D0=P.clone().addScaledVector(Rr,Dlat(i));A.y=0;
  const d0=D0.clone().sub(A),lt=Math.max(2,Math.abs(d0.dot(Rr))),dl=Math.min(3,Math.max(0,lt-d0.dot(hv))),D=D0.clone().addScaledVector(hv,dl),dd=D.clone().sub(A),fw=Math.max(1.5,dd.dot(hv));ent.dv=hv.clone().multiplyScalar(dl);
  mkPath(A,A.clone().addScaledVector(hv,.5523*fw),D.clone().addScaledVector(Rr,-.5523*lt),D);pang=Math.atan2(-hv.x,-hv.z);ca.copy(cv.getPointAt(cur));ent.s='in';};
 const finish=()=>{eng.g.visible=false;occ=tr;ent.door=false;if(vd){vd.visible=false;vdh.visible=false;}cb=1;caKeep.copy(ca);const i=ent.i,mx=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.overflow='';face=0;faceT=0;cur=T[i]+(ent.ex||.02);target=cur;scrollTo(0,cur*mx);px=null;ent.s=null;document.body.classList.remove('busy');btn.disabled=false;upd3();};
 const WALK=[false,true,true,true,false],DOORS=[null,[12.975,.3],[15.75,-5.76],[15.22,-3.52],null];
 const Dlat=i=>WALK[i]?6.4:BO[i]-HD[i]-STOPD;
 const ease=k=>k*k*(3-2*k),angL=(a,b,k)=>{let d=b-a;d=Math.atan2(Math.sin(d),Math.cos(d));return a+d*k;};
 const mkEng=()=>{const g=new THREE.Group(),skin=0xf2c14e,pant=0x2f4f8f,shirt=0xf5f6f2,vest=0xff7a1a,dk=0x1a1f26;
  const B2=(w,h,d,c,x,y,z,pr)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));m.position.set(x,y,z);(pr||g).add(m);return m;};
  const lg=sx=>{const q=new THREE.Group();q.position.set(sx*.15,.6,0);B2(.27,.5,.3,pant,0,-.25,0,q);B2(.29,.12,.4,0x2b2f36,0,-.55,-.05,q);g.add(q);return q;};
  const L=lg(-1),R=lg(1);
  B2(.62,.16,.34,pant,0,.66,0);B2(.6,.56,.34,shirt,0,1.02,0);B2(.64,.42,.38,vest,0,1.04,0);B2(.66,.07,.4,0xf5f6f2,0,1.14,0);B2(.66,.07,.4,0xf5f6f2,0,.94,0);B2(.2,.2,.04,0x1d5fc4,.14,1.1,-.2);
  const am=sx=>{const q=new THREE.Group();q.position.set(sx*.4,1.22,0);B2(.2,.46,.22,shirt,0,-.22,0,q);const h=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.16,10),M(skin));h.rotation.z=Math.PI/2;h.position.set(0,-.5,0);q.add(h);g.add(q);return q;};
  const AL=am(-1),AR=am(1);
  const hd=new THREE.Mesh(new THREE.CylinderGeometry(.26,.26,.3,20),M(skin));hd.position.y=1.5;g.add(hd);
  B2(.06,.09,.04,dk,-.1,1.53,-.262);B2(.06,.09,.04,dk,.1,1.53,-.262);
  const ht=new THREE.Mesh(new THREE.SphereGeometry(.29,16,10,0,6.283,0,1.57),M(0xf5f6f2));ht.position.y=1.6;g.add(ht);
  const br=new THREE.Mesh(new THREE.CylinderGeometry(.33,.33,.05,20),M(0xf5f6f2));br.position.set(0,1.62,-.03);g.add(br);B2(.12,.1,.06,0xffd24a,0,1.74,-.29);B2(.06,.06,.5,0x1d5fc4,0,1.89,0);
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.55,10),M(0xf0e3c0));tube.rotation.x=Math.PI/2;tube.position.set(0,-.56,-.2);AR.add(tube);
  g.scale.setScalar(1.5);return{g,L,R,AL,AR};};
 const eng=mkEng();eng.g.visible=false;sc.add(eng.g);let engTgt=0;
 const Pf=i=>cv.getPointAt(T[i]),Tf=i=>cv.getTangentAt(T[i]);
 const doorBase=i=>Pf(i).addScaledVector(Rof(i),DOORS[i][0]-.6).addScaledVector(Tf(i),DOORS[i][1]);
 const seatW=()=>{tr.updateMatrixWorld(true);const d=DRS[ride.car];return tr.localToWorld(new THREE.Vector3(-.45,0,d[0]+d[1]*.72));};
 const outW=()=>{tr.updateMatrixWorld(true);const d=DRS[ride.car];return tr.localToWorld(new THREE.Vector3(-(cs.bw/2+1.05),0,d[0]+d[1]*.97));};
 const sidePts=(i,a,b)=>{const P=Pf(i),Rr=Rof(i),lat0=a.clone().sub(P).dot(Rr),w1=a.clone().addScaledVector(Rr,DOORS[i][0]-.6-1.2-lat0);return [a.clone(),w1,b.clone()];};
 const wlk=(pts,dt,spd)=>{ent.u+=spd*dt;let u=ent.u,k=0;for(;k<pts.length-2;k++){const l=pts[k].distanceTo(pts[k+1]);if(u>l)u-=l;else break;}
  const a=pts[k],b=pts[k+1],l=a.distanceTo(b)||1,f=Math.min(1,u/l);eng.g.position.lerpVectors(a,b,f);eng.g.position.y=.05;if(l>.01)engTgt=Math.atan2(-(b.x-a.x),-(b.z-a.z));return k===pts.length-2&&f>=1;};
 const gait=(tm,mv,dt)=>{const s2=mv?Math.sin(tm*9)*.75:0,k=Math.min(1,dt*10);eng.L.rotation.x+=(s2-eng.L.rotation.x)*k;eng.R.rotation.x+=(-s2-eng.R.rotation.x)*k;eng.AL.rotation.x+=(-s2*.8-eng.AL.rotation.x)*k;eng.AR.rotation.x+=(s2*.8-eng.AR.rotation.x)*k;eng.g.rotation.y=angL(eng.g.rotation.y,engTgt,Math.min(1,dt*9));};
 const toRoomWalk=i=>{const cx=ROOMX+i*RS;ent.room=i;document.body.classList.add('inroom');sc.background.setHex(BGI[i]);sc.fog.color.setHex(BGI[i]);sc.fog.near=70;sc.fog.far=170;lit.position.set(cx,5.6,1.3);lit.intensity=.55;gl.forEach((o,k)=>{o.intensity=gl0[k]*.5;});
  eng.g.position.set(cx,0,12.5);eng.g.rotation.y=0;engTgt=0;eng.g.visible=true;occ=eng.g;roomEls[i].querySelectorAll('[data-exit]').forEach(b=>{b.textContent='Head back to the vehicle';});};
 const entStep=(tm,dt)=>{const i=ent.i,cx=ROOMX+i*RS,wk=ent.wk,s0=ent.s;
  const outCam=()=>{const aim=eng.g.visible?tr.position.clone().lerp(eng.g.position,.5):tr.position;ca.lerp(aim,Math.min(1,dt*3));camOut(ca,cv.getTangentAt(cur));};
  if(s0==='in'||s0==='outdrive'||s0==='utn'){outCam();
   if(stepPath(dt)){
    if(s0==='in'){if(wk){ent.s='getout';ent.tmr=0;}else{ent.s='fadeIn';ent.tmr=0;fade(true,COL[i]);}}
    else if(s0==='utn'){const D2=tr.position.clone(),Rr=Rof(i),Pf2=cv.getPointAt(T[i]+.02),tf=cv.getTangentAt(T[i]+.02),E=Pf2.clone();E.x-=1.8*tf.z;E.z+=1.8*tf.x;
     mkPath(D2,D2.clone().addScaledVector(Rr,-4),E.clone().addScaledVector(tf,-4),E);pang=Math.atan2(Rr.x,Rr.z);ent.s='outdrive';}
    else finish();}}
  else if(s0==='getout'){ent.tmr+=dt;const t=ent.tmr,sd=seatW(),od=outW();outCam();
   vd.visible=vdh.visible=true;const a=t<1.4?Math.min(1,t/.5):Math.max(0,1-(t-1.4)/.5);vd.rotation.y=-1.25*ease(a);
   if(t>.25){eng.g.visible=true;const q=Math.min(1,(t-.25)/1.1);eng.g.position.copy(sd).lerp(od,ease(q));eng.g.position.y=.05;engTgt=Math.atan2(-(od.x-sd.x),-(od.z-sd.z));gait(tm,q<1,dt);}
   if(t>=1.9){vd.visible=vdh.visible=false;vd.rotation.y=0;ent.s='walkIn';ent.u=0;ent.pts=sidePts(i,od,doorBase(i));}}
  else if(s0==='walkIn'){outCam();const done=wlk(ent.pts,dt,3.4);gait(tm,!done,dt);if(done){ent.s='knock';ent.tmr=0;engTgt=Math.atan2(-Rof(i).x,-Rof(i).z);}}
  else if(s0==='knock'){ent.tmr+=dt;outCam();gait(tm,false,dt);eng.AR.rotation.x=-1.5+Math.sin(tm*18)*.35;if(ent.tmr>.9)ent.door=true;
   if(ent.tmr>1.7){ent.s='enterDoor';ent.u=0;const db=doorBase(i);ent.pts=[db,db.clone().addScaledVector(Rof(i),2.8)];}}
  else if(s0==='enterDoor'){outCam();const done=wlk(ent.pts,dt,2.6);gait(tm,!done,dt);if(ent.u>1.9&&!ent.fd){ent.fd=true;fade(true,COL[i]);}if(done){ent.s='fadeIn';ent.tmr=0;ent.fd=false;ent.door=false;}}
  else if(s0==='fadeIn'){ent.tmr+=dt;outCam();if(wk)gait(tm,false,dt);if(ent.tmr>.75){if(wk)toRoomWalk(i);else toRoom(i);ent.s='park';fade(false);}}
  else if(s0==='park'){
   if(wk){const z=eng.g.position.z,v=Math.max(1.8,Math.min(4.2,(z-2.2)*1.6))*dt;eng.g.position.z=Math.max(2.2,z-v);engTgt=0;gait(tm,true,dt);camIn(i,tm);if(eng.g.position.z<=2.2){ent.s='inside';roomEls[i].classList.add('on');}}
   else{const v=Math.max(.25,Math.min(7,(tr.position.z-3.5)*1.7))*dt;tr.position.z=Math.max(3.5,tr.position.z-v);roll(v,0);steer(0,dt);camIn(i,tm);
    if(tr.position.z<=3.5){ent.s='inside';roomEls[i].classList.add('on');}}}
  else if(s0==='inside'){if(wk){engTgt=Math.PI;gait(tm,false,dt);if(Math.sin(tm*.7)>.2)eng.AR.rotation.x=-2.5+Math.sin(tm*8)*.3;camIn(i,tm);}else{steer(0,dt);camIn(i,tm);}}
  else if(s0==='wout'){const z=eng.g.position.z,v=Math.max(2,Math.min(5,(z-2)*1.2+2))*dt;eng.g.position.z+=v;engTgt=Math.PI;gait(tm,true,dt);camIn(i,tm);if(eng.g.position.z>=12.8){ent.s='fadeOut';ent.tmr=0;fade(true,COL[i]);}}
  else if(s0==='uturn'){ent.tmr+=dt;const k=Math.min(1,ent.tmr/3.4),a=Math.PI*ease(k),r=2.8,w=Math.PI*6*k*(1-k)/3.4;tr.position.set(cx-r+r*Math.cos(a),0,3.5-r*Math.sin(a));tr.rotation.y=a;steer(.6*Math.min(1,w/1.2),dt);roll(r*(a-ent.u),a-ent.u);ent.u=a;camIn(i,tm);if(k>=1){ent.s='out';ent.tmr=0;}}
  else if(s0==='out'){ent.tmr+=dt;const v=Math.min(7,.3+ent.tmr*3.2)*dt;tr.position.z+=v;tr.rotation.y=Math.PI;roll(v,0);steer(0,dt);camIn(i,tm);if(tr.position.z>=18){ent.s='fadeOut';ent.tmr=0;fade(true,COL[i]);}}
  else if(s0==='fadeOut'){ent.tmr+=dt;camIn(i,tm);
   if(ent.tmr>.75){toOut();
    if(wk){occ=tr;const db=doorBase(i);eng.g.visible=true;eng.g.position.copy(db).addScaledVector(Rof(i),2.2);ent.pts=[eng.g.position.clone(),db];ent.u=0;ent.door=true;ent.s='doorOut';ca.copy(tr.position);fade(false);}
    else{const P=cv.getPointAt(T[i]),Rr=Rof(i),D=P.clone().addScaledVector(Rr,Dlat(i)).add(ent.dv||new THREE.Vector3()),dd=Math.max(2.5,Dlat(i)-1.8),ex=(D.clone().sub(P).dot(Tf(i))+dd)/LEN,Pf2=cv.getPointAt(T[i]+ex),tf=cv.getTangentAt(T[i]+ex),E=Pf2.clone();E.x-=1.8*tf.z;E.z+=1.8*tf.x;ent.ex=ex;
     mkPath(D,D.clone().addScaledVector(Rr,-.5523*dd),E.clone().addScaledVector(tf,-.5523*dd),E);pang=Math.atan2(Rr.x,Rr.z);tr.position.set(D.x,0,D.z);tr.rotation.y=pang;ca.copy(D);ent.s='outdrive';fade(false);}}}
  else if(s0==='doorOut'){outCam();const done=wlk(ent.pts,dt,2.4);gait(tm,!done,dt);if(done){ent.door=false;ent.s='walkBack';ent.u=0;ent.pts=sidePts(i,outW(),doorBase(i)).reverse();}}
  else if(s0==='walkBack'){outCam();const done=wlk(ent.pts,dt,3.4);gait(tm,!done,dt);if(done){ent.s='getin';ent.tmr=0;}}
  else if(s0==='getin'){ent.tmr+=dt;const t=ent.tmr,sd=seatW(),od=outW();outCam();vd.visible=vdh.visible=true;
   const a=t<1.2?Math.min(1,t/.5):Math.max(0,1-(t-1.2)/.5);vd.rotation.y=-1.25*ease(a);
   if(t>.3&&t<1.2){const q=Math.min(1,(t-.3)/.9);eng.g.position.copy(od).lerp(sd,ease(q));eng.g.position.y=.05;engTgt=Math.atan2(-(sd.x-od.x),-(sd.z-od.z));gait(tm,true,dt);}
   if(t>=1.2)eng.g.visible=false;
   if(t>=1.7){vd.visible=vdh.visible=false;vd.rotation.y=0;const D=tr.position.clone(),Rr=Rof(i),tg=Tf(i),ru=2.7,dd=Math.max(2.5,D.clone().sub(Pf(i)).dot(Rr)-1.8),D2=D.clone().addScaledVector(tg,2*ru),ex=(D2.clone().sub(Pf(i)).dot(tg)+dd)/LEN,Pf2=cv.getPointAt(T[i]+ex),tf=cv.getTangentAt(T[i]+ex),E=Pf2.clone();E.x-=1.8*tf.z;E.z+=1.8*tf.x;ent.ex=ex;
    mkPath2([[D,D.clone().addScaledVector(Rr,1.333*ru),D2.clone().addScaledVector(Rr,1.333*ru),D2],[D2,D2.clone().addScaledVector(Rr,-.5523*dd),E.clone().addScaledVector(tf,-.5523*dd),E]]);pang=Math.atan2(-Rr.x,-Rr.z);ent.s='outdrive';}}
 };
 enter=i=>{if(ent.s||mode!=='3d')return;ent.i=i;ent.wk=WALK[i];ent.s='pre';btn.disabled=true;document.body.classList.add('busy');document.documentElement.style.overflow='hidden';
  const od=Math.round(faceT/Math.PI)%2!==0,Ti=T[i],d=cur-Ti,r=(Dlat(i)-1.8)/LEN;
  if(!od){if(d<-r){ent.side=-1;ent.tj=Ti-r;}else if(d<=.004){ent.side=-1;ent.tj=cur;}else{ent.side=1;ent.tj=cur>Ti+r?Ti+r:cur;}}
  else{if(d>r){ent.side=1;ent.tj=Ti+r;}else if(d>=-.004){ent.side=1;ent.tj=cur;}else{ent.side=-1;ent.tj=cur<Ti-r?Ti-r:cur;}}
  const mx=document.documentElement.scrollHeight-innerHeight;scrollTo({top:ent.tj*mx,behavior:reduce?'auto':'smooth'});};
 leave=()=>{if(ent.s==='inside'){roomEls[ent.i].classList.remove('on');ent.s=ent.wk?'wout':'uturn';ent.u=0;ent.tmr=0;}};
 // ---- vehicles and customization ----
 const MAIN=[['Black',0x22262c],['Red',0xd23b3b],['Blue',0x1d5fc4],['Orange',0xff7a1a],['Yellow',0xf0c23a],['Green',0x2f9e5b],['Violet / Indigo',0x5b4bc4],['White',0xf5f6f2]];
 const SEC={'Black':['Red','Yellow','Orange','White'],'Red':['White','Black','Cream','Silver'],'Blue':['White','Yellow','Orange','Silver'],'Orange':['Black','White','Navy','Cream'],'Yellow':['Black','Navy','White','Gray'],'Green':['Cream','White','Black','Orange'],'Violet / Indigo':['White','Silver','Yellow','Mint'],'White':['Blue','Red','Black','Orange']};
 const SC={White:0xf5f6f2,Black:0x1a1f26,Silver:0xc5ccd3,Cream:0xf0e3c0,Red:0xd23b3b,Yellow:0xf0c23a,Orange:0xff7a1a,Navy:0x17306b,Blue:0x1d5fc4,Gray:0x8d99a6,Mint:0x8fe0c0};
 const CARS=['Kei truck','Suzuki Wagon R','Honda N-Box','Daihatsu Tanto','Suzuki Hustler','Suzuki Alto','Daihatsu Mira','Suzuki Jimny','Mazda Bongo','Nissan Sunny Truck','Mitsubishi Canter Guts'];
 const GLs=0xa9d1ef,DK=0x1a1f26,LT=0xfff2b0,TL=0xd23b3b;
 let vd=null,vdh=null,cs={bw:1.5};
 const DRS=[[-1.55,.95,.72,1.25],[-.9,1,.75,1.2],[-1.3,1.2,.75,1.25],[-1.25,1.2,.75,1.2],[-1,1.05,.9,1.05],[-.75,.95,.7,.85],[-.8,.95,.7,.9],[-.8,1,.85,1.35],[-1.5,1,.85,1.5],[-.75,.95,.85,1.05],[-2,1,.95,1.3]];
 const cy=(rad,hgt,col,x,y,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,hgt,14),M(col));m.rotation.x=Math.PI/2;m.position.set(x,y,z);tr.add(m);return m;};
 const BUILD=[
  (c1,c2,H)=>{const{S,EX,SL,win,lampR,tl,mir,seam}=H;
   S(1.4,.14,3.9,DK,0,.5,.08);EX([[-1.78,.5],[-1.78,1.12],[-1.6,2.04],[-.28,2.04],[-.28,.5]],1.54,c1);S(1.58,.1,1.5,c2,0,1,-1.03);
   SL(1.38,1.18,-1.76,1.98,-1.6,GLs);win([[-1.55,1.28],[-1.44,1.94],[-.5,1.94],[-.5,1.28]],1.54);S(1.52,.07,1.34,c2,0,2.08,-.94);
   S(1.58,.2,.16,DK,0,.52,-1.84);S(1.1,.3,.05,DK,0,.86,-1.8);for(let k=0;k<3;k++)S(.9,.025,.02,0x4a5766,0,.8+k*.07,-1.84);
   lampR(.58,.92,-1.8,.3,.2);lampR(-.58,.92,-1.8,.3,.2);S(.4,.13,.04,0xf0c23a,0,.55,-1.9);seam(-.62,.7,1.95,.78);seam(-1.5,.7,1.95,.78);mir(1.66,-1.62,.9);
   S(1.56,.1,2.3,c1,0,.88,.95);[.75,-.75].forEach(x=>{S(.06,.34,2.3,c1,x,1.09,.95);S(.07,.07,2.32,c2,x,1,.95);});S(1.56,.34,.06,c1,0,1.07,2.1);S(1.56,.5,.06,c1,0,1.1,-.2);S(1.4,.14,2.3,DK,0,.66,.95);
   S(.7,.28,.4,c2,.3,1.07,1.5);S(.55,.4,.55,0xb08a5a,-.3,1.13,.3);tl(.62,.98,2.14,.2,.12);tl(-.62,.98,2.14,.2,.12);
   return{w:[[.78,-1],[-.78,-1],[.78,1.25],[-.78,1.25]],r:.34,hl:1.95,bw:1.54};},
  (c1,c2,H)=>{const{S,EX,SL,win,lampR,tl,mir,seam}=H;
   S(1.4,.14,3.6,DK,0,.45,0);EX([[-1.82,.4],[-1.82,.85],[-1.1,1],[-.55,2],[1.72,2],[1.83,1.9],[1.83,.4]],1.5,c1);S(1.46,.07,2.3,c2,0,2.04,.58);
   SL(1.34,1.02,-1.1,1.96,-.58,GLs);win([[-.95,1.15],[-.64,1.9],[.45,1.9],[.45,1.15]],1.5);win([[.58,1.15],[.58,1.9],[1.5,1.9],[1.62,1.15]],1.5);SL(1.3,1.9,1.74,1.2,1.84,GLs);
   S(1.52,.22,.12,DK,0,.5,-1.86);S(.9,.2,.05,DK,0,.82,-1.85);lampR(.55,.9,-1.85,.34,.22);lampR(-.55,.9,-1.85,.34,.22);seam(.5,.7,1.85,.76);mir(1.5,-.9,.88);
   tl(.67,1.2,1.86,.14,.5);tl(-.67,1.2,1.86,.14,.5);S(1.52,.2,.12,DK,0,.55,1.88);
   return{w:[[.74,-1.18],[-.74,-1.18],[.74,1.12],[-.74,1.12]],r:.31,hl:1.85,bw:1.5};},
  (c1,c2,H)=>{const{S,EX,SL,win,lampR,tl,mir,seam}=H;
   S(1.4,.14,3.6,DK,0,.45,0);EX([[-1.78,.4],[-1.78,.95],[-1.45,1.05],[-1.15,2.12],[1.74,2.12],[1.82,2],[1.82,.4]],1.52,c1);S(1.48,.07,2.9,c2,0,2.16,.3);
   SL(1.36,1.08,-1.43,2.06,-1.18,GLs);win([[-1.28,1.2],[-1.08,1.98],[.1,1.98],[.1,1.2]],1.52);win([[.22,1.2],[.22,1.98],[1.62,1.98],[1.66,1.2]],1.52);SL(1.3,1.98,1.76,1.25,1.84,GLs);
   S(1.54,.2,.14,DK,0,.5,-1.84);S(.8,.2,.05,DK,0,.85,-1.82);lampR(.55,.95,-1.82,.42,.18);lampR(-.55,.95,-1.82,.42,.18);seam(.16,.65,1.9,.77);seam(-1.2,.65,1.9,.77);
   [.77,-.77].forEach(x=>S(.03,.06,1.5,DK,x,.62,.9));mir(1.75,-1.3,.9);tl(.7,1.4,1.86,.14,.6);tl(-.7,1.4,1.86,.14,.6);S(1.54,.2,.12,DK,0,.55,1.86);
   return{w:[[.74,-1.12],[-.74,-1.12],[.74,1.1],[-.74,1.1]],r:.31,hl:1.8,bw:1.52};},
  (c1,c2,H)=>{const{S,EX,SL,win,lampC,tl,mir,seam}=H;
   S(1.4,.14,3.6,DK,0,.45,0);EX([[-1.8,.4],[-1.8,.95],[-1.5,1.05],[-1,2.08],[1.72,2.08],[1.82,1.95],[1.82,.4]],1.52,c1);S(1.48,.07,2.75,c2,0,2.12,.35);
   SL(1.36,1.08,-1.48,2.02,-1.02,GLs);win([[-1.3,1.2],[-.98,1.94],[.1,1.94],[.1,1.2]],1.52);win([[.2,1.2],[.2,1.94],[1.55,1.94],[1.62,1.2]],1.52);SL(1.3,1.94,1.74,1.25,1.84,GLs);
   [.78,-.78].forEach(x=>{S(.05,.14,3.5,c2,x,.82,0);S(.03,.06,1.5,DK,x,.6,.9);});
   S(1.54,.2,.14,DK,0,.5,-1.84);S(.7,.16,.05,DK,0,.86,-1.84);lampC(.58,1,-1.84,.17);lampC(-.58,1,-1.84,.17);seam(.15,.65,1.9,.77);seam(-1.25,.65,1.9,.77);mir(1.7,-1.25,.9);
   tl(.7,1.3,1.86,.14,.5);tl(-.7,1.3,1.86,.14,.5);S(1.54,.2,.12,DK,0,.55,1.86);
   return{w:[[.74,-1.2],[-.74,-1.2],[.74,1.12],[-.74,1.12]],r:.31,hl:1.85,bw:1.52};},
  (c1,c2,H)=>{const{S,EX,SL,win,lampC,tl,mir,seam}=H;
   S(1.4,.16,3.5,DK,0,.55,0);EX([[-1.76,.5],[-1.76,1.12],[-1.2,1.2],[-.75,2],[1.5,2],[1.78,1.8],[1.78,.5]],1.52,c1);S(1.48,.07,2.2,c2,0,2.04,.38);
   SL(1.34,1.22,-1.2,1.94,-.8,GLs);win([[-1.02,1.32],[-.78,1.86],[.2,1.86],[.2,1.32]],1.52);win([[.3,1.32],[.3,1.86],[1.4,1.86],[1.6,1.32]],1.52);SL(1.24,1.8,1.72,1.35,1.8,GLs);
   [.7,-.7].forEach(x=>S(.06,.08,2.1,DK,x,2.12,.45));S(1.2,.26,.12,0xc5ccd3,0,.62,-1.82);S(1.54,.2,.14,DK,0,.5,-1.8);S(.6,.22,.05,DK,0,.92,-1.8);
   lampC(.52,1.02,-1.8,.17);lampC(-.52,1.02,-1.8,.17);seam(.2,.7,1.8,.77);mir(1.6,-.85,.88);tl(.68,1.3,1.8,.14,.4);tl(-.68,1.3,1.8,.14,.4);S(1.54,.2,.12,DK,0,.55,1.8);
   return{w:[[.78,-1.15],[-.78,-1.15],[.78,1.1],[-.78,1.1]],r:.36,hl:1.8,bw:1.52,ak:1.38};},
  (c1,c2,H)=>{const{S,EX,SL,win,lampR,tl,mir,seam}=H;
   S(1.34,.14,3.4,DK,0,.45,0);EX([[-1.7,.4],[-1.7,.75],[-1,.92],[-.35,1.62],[.7,1.65],[1.45,1.25],[1.72,1.1],[1.72,.4]],1.46,c1);S(1.4,.06,1,c2,0,1.69,.18);
   SL(1.28,.95,-1.02,1.58,-.4,GLs);win([[-.85,1.02],[-.45,1.52],[.12,1.52],[.12,1.02]],1.46);win([[.24,1.02],[.24,1.52],[.7,1.52],[1.12,1.1]],1.46);SL(1.2,1.6,.72,1.15,1.45,GLs);
   S(1.48,.18,.14,DK,0,.5,-1.74);S(.6,.14,.05,DK,0,.78,-1.72);lampR(.52,.95,-1.72,.4,.16);lampR(-.52,.95,-1.72,.4,.16);seam(.18,.62,1.5,.74);mir(1.38,-.55,.82);
   tl(.62,1.08,1.74,.14,.22);tl(-.62,1.08,1.74,.14,.22);S(1.48,.16,.12,DK,0,.52,1.74);
   return{w:[[.72,-1.05],[-.72,-1.05],[.72,1],[-.72,1]],r:.29,hl:1.72,bw:1.46};},
  (c1,c2,H)=>{const{S,EX,SL,win,lampR,tl,mir,seam}=H;
   S(1.34,.14,3.45,DK,0,.45,0);EX([[-1.72,.4],[-1.72,.78],[-1.05,.95],[-.45,1.78],[.95,1.8],[1.5,1.32],[1.74,1.15],[1.74,.4]],1.46,c1);S(1.4,.06,1.4,c2,0,1.84,.25);
   SL(1.3,.98,-1.05,1.74,-.5,GLs);win([[-.88,1.05],[-.52,1.68],[.2,1.68],[.2,1.05]],1.46);win([[.3,1.05],[.3,1.68],[.9,1.68],[1.35,1.18]],1.46);SL(1.22,1.76,1,1.2,1.5,GLs);
   S(1.48,.18,.14,DK,0,.5,-1.76);S(.9,.12,.05,DK,0,.74,-1.74);lampR(.52,.98,-1.74,.46,.16);lampR(-.52,.98,-1.74,.46,.16);seam(.2,.62,1.6,.74);mir(1.5,-.6,.82);
   tl(.62,1.1,1.76,.16,.2);tl(-.62,1.1,1.76,.16,.2);S(1.48,.16,.12,DK,0,.52,1.76);
   return{w:[[.72,-1.08],[-.72,-1.08],[.72,1.05],[-.72,1.05]],r:.3,hl:1.75,bw:1.46};},
  (c1,c2,H)=>{const{S,EX,SL,win,lampC,tl,mir,seam,cy}=H;
   S(1.4,.2,3.2,DK,0,.6,.05);EX([[-1.62,.5],[-1.62,1.35],[-.95,1.4],[-.88,2.3],[1.55,2.3],[1.62,2.25],[1.62,.5]],1.5,c1);S(1.46,.07,2.5,c2,0,2.34,.33);
   SL(1.34,1.45,-.94,2.22,-.88,GLs);win([[-.8,1.55],[-.78,2.18],[.12,2.18],[.12,1.55]],1.5);win([[.24,1.55],[.24,2.18],[1.15,2.18],[1.15,1.55]],1.5);win([[1.25,1.7],[1.25,2.18],[1.5,2.18],[1.55,1.7]],1.5);
   for(let k=0;k<7;k++)S(.09,.32,.06,DK,-.48+k*.16,1.15,-1.64);lampC(.62,1.2,-1.64,.19);lampC(-.62,1.2,-1.64,.19);S(.6,.03,.3,DK,0,1.42,-1.2);
   S(1.62,.2,.2,DK,0,.62,-1.72);S(1.62,.2,.2,DK,0,.62,1.7);cy(.42,.2,DK,0,1.5,1.72);cy(.28,.22,0xcfd6dc,0,1.5,1.72);seam(.18,.7,2.2,.76);mir(1.9,-.8,.86);
   tl(.62,1.1,1.65,.14,.24);tl(-.62,1.1,1.65,.14,.24);
   return{w:[[.78,-1],[-.78,-1],[.78,.98],[-.78,.98]],r:.4,hl:1.7,bw:1.5,ak:1.3};},
  (c1,c2,H)=>{const{S,EX,SL,win,lampR,tl,mir,seam}=H;
   S(1.4,.22,4.1,DK,0,.55,0);EX([[-2.08,.5],[-2.08,1.1],[-1.88,1.25],[-1.55,2.1],[-1.5,2.45],[2,2.45],[2.08,2.35],[2.08,.5]],1.55,c1);S(1.5,.07,3.4,c2,0,2.49,.25);
   SL(1.4,1.3,-1.86,2.1,-1.55,GLs);win([[-1.48,1.4],[-1.4,2.08],[-.62,2.08],[-.62,1.4]],1.55);win([[-.5,1.4],[-.5,2.08],[.5,2.08],[.5,1.4]],1.55);win([[.62,1.4],[.62,2.08],[1.78,2.08],[1.84,1.4]],1.55);
   [-1.2,-.4,.4,1.2].forEach(z=>S(1.5,.05,.06,0x8d99a6,0,2.57,z));[.7,-.7].forEach(x=>S(.05,.05,3.2,0x8d99a6,x,2.57,.2));
   lampR(.55,1.08,-2.1,.4,.2);lampR(-.55,1.08,-2.1,.4,.2);S(1,.3,.05,DK,0,.85,-2.1);S(1.57,.2,.16,DK,0,.58,-2.12);seam(-.56,.7,2.2,.78);seam(.56,.7,2.2,.78);seam(1.8,.7,2.2,.78);mir(1.9,-1.8,.9);
   tl(.7,1.3,2.1,.14,.4);tl(-.7,1.3,2.1,.14,.4);S(1.57,.2,.14,DK,0,.58,2.1);
   return{w:[[.78,-1.4],[-.78,-1.4],[.78,1.3],[-.78,1.3]],r:.33,hl:2.1,bw:1.55};},
  (c1,c2,H)=>{const{S,EX,SL,win,lampC,tl,mir,seam}=H;
   S(1.4,.2,4.2,DK,0,.55,0);EX([[-2.12,.5],[-2.12,.98],[-1,1.08],[.55,1.08],[.55,.5]],1.5,c1);EX([[-.78,1.08],[-.42,1.98],[.38,1.98],[.5,1.08]],1.44,c1);S(1.4,.06,.84,c2,0,2.02,0);
   SL(1.3,1.1,-.77,1.92,-.44,GLs);win([[-.62,1.2],[-.4,1.88],[.28,1.88],[.38,1.2]],1.44);SL(1.2,1.9,.36,1.2,.48,GLs);
   S(1.54,.18,.2,0xc5ccd3,0,.68,-2.16);S(.9,.3,.05,0xc5ccd3,0,.9,-2.16);lampC(.55,.98,-2.14,.15);lampC(-.55,.98,-2.14,.15);S(1.5,.06,1.2,c2,0,1.1,-1.5);
   S(1.5,.1,1.6,c1,0,.95,1.35);[.72,-.72].forEach(x=>{S(.06,.45,1.6,c1,x,1.2,1.35);S(.07,.07,1.62,c2,x,1.1,1.35);});S(1.5,.45,.06,c1,0,1.2,2.15);S(1.5,.5,.06,c1,0,1.2,.58);S(1.52,.16,.2,0xc5ccd3,0,.68,2.22);
   seam(-.1,.7,1.9,.73);mir(1.6,-.8,.82);tl(.62,.95,2.2,.2,.12);tl(-.62,.95,2.2,.2,.12);
   return{w:[[.76,-1.35],[-.76,-1.35],[.76,1.35],[-.76,1.35]],r:.33,hl:2.2,bw:1.5};},
  (c1,c2,H)=>{const{S,EX,SL,win,lampR,tl,mir,seam}=H;
   S(1.45,.16,4.4,DK,0,.62,0);EX([[-2.25,.7],[-2.25,1.25],[-2.12,1.32],[-1.85,2.3],[-.95,2.3],[-.95,.7]],1.56,c1);S(1.6,.1,1,c2,0,2.38,-1.4);
   SL(1.42,1.4,-2.12,2.22,-1.86,GLs);win([[-1.7,1.5],[-1.64,2.2],[-1.1,2.2],[-1.1,1.5]],1.56);[.8,-.8].forEach(x=>S(.05,.2,1.2,c2,x,1,-1.6));
   lampR(.6,1.1,-2.26,.28,.22);lampR(-.6,1.1,-2.26,.28,.22);S(1,.3,.05,DK,0,.88,-2.27);S(1.58,.2,.18,DK,0,.78,-2.28);seam(-1.1,.8,2.25,.8);mir(2,-2,.95);
   S(1.6,.12,2.9,c1,0,.98,.55);[.8,-.8].forEach(x=>S(.06,.4,2.9,c2,x,1.24,.55));S(1.6,.4,.06,c2,0,1.24,2);S(1.6,.55,.06,c2,0,1.3,-.9);S(.5,.4,.9,DK,.55,.55,.2);S(.5,.4,.7,DK,-.55,.55,.9);
   tl(.7,.9,2.02,.2,.14);tl(-.7,.9,2.02,.2,.14);
   return{w:[[.8,-1.45],[-.8,-1.45],[.8,1.4],[-.8,1.4]],r:.38,hl:2.25,bw:1.56};}
 ];
 const mkWheel=(x,z,rad)=>{const w=new THREE.Group(),t=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,.26,24),M(0x1a1f26));t.rotation.z=Math.PI/2;w.add(t);
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(rad*.8,rad*.8,.28,24),M(0x2b2f36));wall.rotation.z=Math.PI/2;w.add(wall);
  const rim=new THREE.Mesh(new THREE.CylinderGeometry(rad*.64,rad*.64,.3,24),M(0xc9d0d6));rim.rotation.z=Math.PI/2;w.add(rim);
  for(let k=0;k<3;k++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.32,rad*1.12,.075),M(0x8d99a6));sp.rotation.x=k*Math.PI/3;w.add(sp);}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(rad*.2,rad*.2,.34,12),M(0x4a5560));hub.rotation.z=Math.PI/2;w.add(hub);
  w.position.set(x,rad,z);return w;};
 const setCar=(id,mainName,secName)=>{
  const c1=MAIN.find(m=>m[0]===mainName)[1],c2=SC[secName];
  while(tr.children.length){const o=tr.children[0];tr.remove(o);o.traverse(q=>{if(q.material)q.material.dispose();if(q.geometry&&q.geometry.userData.own)q.geometry.dispose();});}
  const S=(w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));m.position.set(x,y,z);tr.add(m);return m;};
  const EX=(pts,w,c,xo)=>{const sh=new THREE.Shape();pts.forEach((q,i)=>i?sh.lineTo(-q[0],q[1]):sh.moveTo(-q[0],q[1]));const bs=Math.min(.035,w*.15),g=new THREE.ExtrudeGeometry(sh,{depth:Math.max(.01,w-2*bs),bevelEnabled:true,bevelThickness:bs,bevelSize:bs,bevelSegments:1,curveSegments:1});
   g.userData.own=true;g.rotateY(Math.PI/2);g.translate(-(w/2-bs)+(xo||0),0,0);const m=new THREE.Mesh(g,M(c));tr.add(m);return m;};
  const SL=(w,y1,z1,y2,z2,c)=>{const dy=y2-y1,dz=z2-z1,len=Math.hypot(dy,dz),o=.03,m=S(w,len,.03,c,0,(y1+y2)/2+dz/len*o,(z1+z2)/2-dy/len*o);m.rotation.x=Math.atan2(dz,dy);return m;};
  const win=(pts,wc)=>{EX(pts,.03,GLs,wc/2+.012);EX(pts,.03,GLs,-wc/2-.012);};
  const cy=(rad,hgt,col,x,y,z)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,hgt,16),M(col));m.rotation.x=Math.PI/2;m.position.set(x,y,z);tr.add(m);return m;};
  const H={S,EX,SL,win,cy,
   lampR:(x,y,z,w,h)=>{S(w+.05,h+.05,.06,DK,x,y,z);S(w,h,.07,LT,x,y,z-.012);},
   lampC:(x,y,z,rad)=>{cy(rad+.04,.08,DK,x,y,z);cy(rad,.09,LT,x,y,z-.012);},
   tl:(x,y,z,w,h)=>S(w,h,.05,TL,x,y,z),
   mir:(y,z,sp)=>{[1,-1].forEach(k=>{S(.1,.17,.2,DK,k*(sp+.1),y,z);S(.1,.04,.05,DK,k*sp,y-.04,z);});},
   seam:(z,y1,y2,hw)=>{[1,-1].forEach(k=>{S(.03,y2-y1,.03,DK,k*hw,(y1+y2)/2,z);S(.05,.04,.2,DK,k*hw,y2-.55,z+.3);});}};
  const sp=BUILD[id](c1,c2,H);
  wh.length=0;sp.w.forEach(a=>{const w=mkWheel(a[0],a[1],sp.r);tr.add(w);wh.push(w);const k=sp.ak||1.22,sd=Math.sign(a[0]),xs=sd*(sp.bw/2+.012),well=new THREE.Mesh(new THREE.CircleGeometry(sp.r*k,28,0,Math.PI),new THREE.MeshBasicMaterial({color:0x0d1013,side:THREE.DoubleSide}));
  well.rotation.y=sd*Math.PI/2;well.position.set(xs,sp.r,a[1]);tr.add(well);
  const trim=new THREE.Mesh(new THREE.RingGeometry(sp.r*k,sp.r*k+.075,28,1,0,Math.PI),M(c1));trim.rotation.y=sd*Math.PI/2;trim.position.set(xs+sd*.01,sp.r,a[1]);trim.material.side=THREE.DoubleSide;tr.add(trim);});
  wh[0].rotation.order=wh[1].rotation.order='YXZ';const dd=DRS[id];vd=new THREE.Group();vd.position.set(-(sp.bw/2+.03),dd[2],dd[0]);vd.visible=false;tr.add(vd);
  {const pm=new THREE.Mesh(new THREE.BoxGeometry(.05,dd[3],dd[1]),M(c1));pm.position.set(0,dd[3]/2,dd[1]/2);vd.add(pm);const wm=new THREE.Mesh(new THREE.BoxGeometry(.06,dd[3]*.38,dd[1]*.76),M(GLs));wm.position.set(0,dd[3]*.74,dd[1]/2);vd.add(wm);}
  vdh=new THREE.Mesh(new THREE.BoxGeometry(.03,dd[3],dd[1]),M(0x0b0e12));vdh.position.set(-(sp.bw/2+.012),dd[2]+dd[3]/2,dd[0]+dd[1]/2);vdh.visible=false;tr.add(vdh);
  cs=sp;WR=sp.r*1.5;STOPD=sp.hl*1.5+.3;px=null;st=0;swapT=0;};
 let ride={car:0,main:'White',sec:'Blue'};
 try{const sv=JSON.parse(localStorage.getItem('reden-ride')||'null');if(sv&&sv.car>=0&&sv.car<CARS.length&&SEC[sv.main]&&SEC[sv.main].includes(sv.sec))ride=sv;}catch(e){}
 setCar(ride.car,ride.main,ride.sec);swapT=1;tr.scale.setScalar(1.5);occ=tr;
 anim.push((tm,dt)=>{DR.forEach((q,k)=>{if(q){const u=q.userData,tg=(ent.s&&ent.i===k&&ent.door)?1:0;u.o+=(tg-u.o)*Math.min(1,dt*5);q.position.x=u.x0+u.dir*(u.w+.15)*u.o;}});RD.forEach((q,k)=>{if(q){const op=ent.s&&ent.i===k&&ent.s!=='pre'&&!(ent.s==='in'&&cu<.35)&&!(ent.s==='outdrive'&&cu>.5);q.position.y+=((op?(k===0?3.9:4.2):0)-q.position.y)*Math.min(1,dt*3);}});});
 const rideEl=document.getElementById('ride'),pane=document.getElementById('rpane'),nowEl=document.getElementById('rideNow');
 const hexs=n=>'#'+n.toString(16).padStart(6,'0');
 const nowTxt=()=>{nowEl.textContent=CARS[ride.car]+' in '+ride.main+' with '+ride.sec+' accents';};
 const apply=()=>{setCar(ride.car,ride.main,ride.sec);try{localStorage.setItem('reden-ride',JSON.stringify(ride));}catch(e){}nowTxt();};
 const mkBtn=(cls,label,pressed,fn)=>{const b=document.createElement('button');b.type='button';b.className=cls;if(label)b.textContent=label;b.setAttribute('aria-pressed',pressed);b.onclick=fn;return b;};
 const showCars=()=>{pane.innerHTML='';const wrap=document.createElement('div');wrap.className='chips';CARS.forEach((n,i)=>wrap.appendChild(mkBtn('chip',n,i===ride.car,()=>{ride.car=i;apply();showCars();})));pane.appendChild(wrap);};
 const showColors=()=>{pane.innerHTML='';const h1=document.createElement('h3');h1.textContent='Main color';pane.appendChild(h1);
  const r1=document.createElement('div');r1.className='sws';MAIN.forEach(m=>{const b=mkBtn('sw','',m[0]===ride.main,()=>{ride.main=m[0];if(!SEC[m[0]].includes(ride.sec))ride.sec=SEC[m[0]][0];apply();showColors();});b.style.background=hexs(m[1]);b.title=m[0];b.setAttribute('aria-label',m[0]);r1.appendChild(b);});pane.appendChild(r1);
  const h2=document.createElement('h3');h2.textContent='Pairs well with';pane.appendChild(h2);
  const r2=document.createElement('div');r2.className='sws';SEC[ride.main].forEach(n=>{const b=mkBtn('sw','',n===ride.sec,()=>{ride.sec=n;apply();showColors();});b.style.background=hexs(SC[n]);b.title=n;b.setAttribute('aria-label',n);r2.appendChild(b);});pane.appendChild(r2);};
 const openRide=()=>{nowTxt();pane.innerHTML='';rideEl.classList.add('on');document.documentElement.style.overflow='hidden';};
 const closeRide=()=>{rideEl.classList.remove('on');if(!ent.s)document.documentElement.style.overflow='';};
 document.getElementById('rcar').onclick=showCars;document.getElementById('rcol').onclick=showColors;
 rideEl.addEventListener('click',e=>{if(e.target===rideEl||e.target.closest('[data-close]'))closeRide();});
 addEventListener('keydown',e=>{if(e.key==='Escape')closeRide();});
 const rcs=new THREE.Raycaster(),mv2=new THREE.Vector2(),cvs=r.domElement;
 const hit=e=>{const b=cvs.getBoundingClientRect();mv2.set((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height)*2+1);rcs.setFromCamera(mv2,cam);return rcs.intersectObject(tr,true).length>0;};
 cvs.addEventListener('click',e=>{if(!ent.s&&mode==='3d'&&hit(e))openRide();});
 let mt2=0;cvs.addEventListener('pointermove',e=>{const n=performance.now();if(n-mt2<90)return;mt2=n;cvs.style.cursor=(!ent.s&&hit(e))?'pointer':'';});


 const size=()=>{r.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();};
 upd3=()=>{if(mode!=='3d')return;const mx=document.documentElement.scrollHeight-innerHeight;target=mx>0?Math.min(1,scrollY/mx):0;
  let k=-1;T.forEach((t,i)=>{if(Math.abs(t-target)<.07)k=i;});
  stops.forEach((e,i)=>e.classList.toggle('on',i===k));chips.forEach((b,i)=>b.setAttribute('aria-current',i===k));};
 addEventListener('scroll',upd3,{passive:true});addEventListener('resize',()=>{size();upd3();});size();
 requestAnimationFrame(function f(ts){
  requestAnimationFrame(f);if(mode!=='3d')return;
  const dt=Math.min((ts-last)/1000||.016,.05);last=ts;
  if(swapT<1){swapT=Math.min(1,swapT+dt*2.2);const e=1+2.70158*Math.pow(swapT-1,3)+1.70158*Math.pow(swapT-1,2);tr.scale.setScalar(Math.max(.01,1.5*e));}
  if(ent.s&&ent.s!=='pre'){entStep(ts/1000,dt);gear.rotation.z+=dt*.8;anim.forEach(f=>f(ts/1000,dt));r.render(sc,cam);return;}
  const prev=cur;
  {const odd=Math.round(faceT/Math.PI)%2!==0;if(target<cur-.012&&!odd)faceT+=Math.PI;else if(target>cur+.012&&odd)faceT+=Math.PI;}
  const df=faceT-face;face+=Math.sign(df)*Math.min(Math.abs(df),dt*2.2);
  if(Math.abs(faceT-face)<.01){const dc=(target-cur)*Math.min(1,dt*4),mv=.1*dt;cur+=Math.max(-mv,Math.min(mv,dc));}
  const p=cv.getPointAt(cur),t=cv.getTangentAt(cur);
  const la=-1.8*Math.cos(face),fw=1.6*Math.sin(face);tr.position.set(p.x+t.z*la+t.x*fw,0,p.z-t.x*la+t.z*fw);tr.rotation.y=Math.atan2(-t.x,-t.z)+face;
  st+=(Math.sign(faceT-face)*(Math.abs(faceT-face)>.01?.6:0)-st)*Math.min(1,dt*10);wh[0].rotation.y=wh[1].rotation.y=st;
  {const fx=-Math.sin(tr.rotation.y),fz=-Math.cos(tr.rotation.y);if(px!==null){const ds=(tr.position.x-px)*fx+(tr.position.z-pz)*fz,dfc=face-pf;wh.forEach(w=>w.rotation.x-=(ds+dfc*w.position.x*1.5)/WR);}px=tr.position.x;pz=tr.position.z;pf=face;}gear.rotation.z+=dt*.8;anim.forEach(f=>f(ts/1000,dt));
  if(cb>0)cb=Math.max(0,cb-dt*1.3);const pa=cb>0?p.clone().lerp(caKeep,ease(cb)):p;const S=innerWidth>=800?14:0;
  cam.position.set(pa.x-t.x*31+t.z*(S||3),36.7,pa.z-t.z*31-t.x*(S||3));
  cam.lookAt(pa.x+t.x*4+t.z*S,0,pa.z+t.z*4-t.x*S);
  if(ent.s==='pre'&&Math.abs(cur-target)<.004&&Math.abs(target-ent.tj)<.008){const od=Math.round(faceT/Math.PI)%2!==0;if(od!==(ent.side>0))faceT+=Math.PI;else if(Math.abs(faceT-face)<.01)startIn();}
  r.render(sc,cam);
 });
 return true;
}
let z=5;const tg=$$('.tag');
tg.forEach((t,i)=>{t.tabIndex=0;t.style.rotate=((i*37)%9-4)+'deg';t._x=0;t._y=0;
 const mv=(x,y)=>{t._x=x;t._y=y;t.style.translate=x+'px '+y+'px';};
 t.addEventListener('pointerdown',e=>{t.setPointerCapture(e.pointerId);t._d=[e.clientX-t._x,e.clientY-t._y];t.style.zIndex=++z;});
 t.addEventListener('pointermove',e=>{if(t._d)mv(e.clientX-t._d[0],e.clientY-t._d[1]);});
 ['pointerup','pointercancel'].forEach(n=>t.addEventListener(n,()=>{t._d=null;}));
 t.addEventListener('keydown',e=>{const k={ArrowLeft:[-14,0],ArrowRight:[14,0],ArrowUp:[0,-14],ArrowDown:[0,14]}[e.key];if(k){e.preventDefault();mv(t._x+k[0],t._y+k[1]);}});
 t.reset=()=>mv(0,0);});
$('#reload').onclick=()=>tg.forEach(t=>t.reset());
const MAIL='redenpagal@gmail.com',toast=$('#toast');let tt;
const say=t=>{toast.textContent=t;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('on'),4800);};
const copySync=()=>{let ok=false;try{const ta=document.createElement('textarea');ta.value=MAIL;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,99);ok=document.execCommand('copy');ta.remove();}catch(x){}
 try{if(navigator.clipboard)navigator.clipboard.writeText(MAIL).then(()=>{ok=true;}).catch(()=>{});}catch(x){}return ok;};
const openGmail=()=>{const u='https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(MAIL);let w=null;try{w=window.open(u,'_blank','noopener');}catch(x){}
 if(!w){const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();}};
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest("a[href^='mailto:']");if(!a)return;e.preventDefault();copySync();openGmail();say('Copied '+MAIL+'. Gmail is opening, so you can paste it into the To field if it is empty.');});
$('#copy').onclick=e=>{copySync();e.target.textContent='Copied';say('Copied '+MAIL);};
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&mode==='2d'){const k=+e.target.id.slice(1);chips.forEach((b,i)=>b.setAttribute('aria-current',i===k));}}),{rootMargin:'-40% 0px -50% 0px'});
$$('#p2d .st').forEach(s=>io.observe(s));
const rv=$$('#p2d .in > *,#p2d .plates li,#p2d .tool,#p2d .log details');
rv.forEach(e=>e.classList.add('rv'));
$$('.plates').forEach(ul=>[...ul.children].forEach((li,i)=>li.style.setProperty('--i',i)));
const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const t=e.target;t.classList.add('on2');ro.unobserve(t);setTimeout(()=>t.classList.remove('rv','on2'),1000);}}),{rootMargin:'0px 0px 12% 0px',threshold:.05});
rv.forEach(e=>ro.observe(e));
let ly=scrollY,lt=performance.now(),wt;
addEventListener('scroll',()=>{const n=performance.now(),v=Math.abs(scrollY-ly)/Math.max(1,n-lt);ly=scrollY;lt=n;document.documentElement.style.setProperty('--t',Math.max(.12,.45-v*.12)+'s');clearTimeout(wt);wt=setTimeout(()=>rv.forEach(e=>{if(e.classList.contains('rv')&&!e.classList.contains('on2')&&e.getBoundingClientRect().bottom<0)e.classList.remove('rv');}),120);},{passive:true});
const NM=['the garage','the workshop','the dev yard','the weighbridge','the depot'];
stops.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='btn pri enter';b.textContent='Drive inside '+NM[i];b.onclick=()=>enter(i);s.appendChild(b);});
$$('[data-exit]').forEach(b=>b.onclick=()=>leave());
addEventListener('keydown',e=>{if(e.key==='Escape')leave();});
const CERT={ansys:'assets/cert-ansys.webp',ijisrt:'assets/cert-ijisrt.webp'};
$$('img[data-cert]').forEach(i=>{i.src=CERT[i.dataset.cert];});
document.addEventListener('click',e=>{const im=e.target.closest&&e.target.closest('img[data-cert]');if(im){const L=$('#lbimg');L.src=im.src;L.alt=im.alt;$('#lb').classList.add('on');return;}if(e.target.id==='lb'||(e.target.closest&&e.target.closest('#lb [data-close]')))$('#lb').classList.remove('on');});
addEventListener('keydown',e=>{if(e.key==='Escape')$('#lb').classList.remove('on');});
setMode(reduce||lowEnd?'2d':'3d');
})();
