/* ============================================================
   JIJOHO RESIDENCE  -  4-bedroom duplex + twin BQ
   Plot: 19.55 m x 33.52 m  (655.1 sqm)
   Site: 6.418988 N, 2.893992 E  (Badagry axis, Lagos State)
   ============================================================ */
"use strict";
var T = THREE;

/* ---------- site geometry constants ---------- */
var PW = 19.55, PD = 33.52;              // plot width (E-W) x depth (N-S)
var X0 = -PW/2, X1 = PW/2;               // -9.775 .. 9.775
var Z0 = -PD/2, Z1 = PD/2;               // -16.76 (road) .. 16.76 (rear)

var HX = -6.775, HZ = -9.76;             // duplex local origin
var HW = 13.55,  HD = 11.5;              // duplex footprint
var GF = 0.60;                           // ground floor level (raised plinth)
var FF = 3.90;                           // first floor level
var CH = 3.00;                           // clear ceiling height
var SLAB = 0.30;
var RF = FF + CH + SLAB;                 // 7.20  roof slab top

var BX = -6.775, BZ = 7.74;              // BQ local origin
var BW = 13.55,  BD = 6.00;
var BF = 0.45;                           // BQ floor level
var BCH = 2.90;

function hx(u){ return HX + u; }
function hz(v){ return HZ + v; }
function bxf(u){ return BX + u; }
function bzf(v){ return BZ + v; }

/* ---------- renderer / scene ---------- */
var scene = new T.Scene();
scene.fog = new T.Fog(0xcfe0ea, 70, 230);

var camera = new T.PerspectiveCamera(62, window.innerWidth/window.innerHeight, 0.05, 500);

var renderer = new T.WebGLRenderer({antialias:true, powerPreference:"high-performance"});
/* A retina phone or laptop reports 2-3, which on integrated graphics means
   drawing four to nine times the pixels for a difference you cannot see at
   arm's length. Capped at 1.5. */
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
renderer.outputEncoding = T.sRGBEncoding;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
document.getElementById("app").appendChild(renderer.domElement);

/* ---------- sky ---------- */
var skyMat = new T.ShaderMaterial({
  side: T.BackSide, depthWrite:false,
  uniforms:{ top:{value:new T.Color(0x2f7fc4)}, mid:{value:new T.Color(0x9fc9e6)},
             bot:{value:new T.Color(0xe9e2d2)}, sunv:{value:new T.Vector3(0.5,0.7,-0.4)},
             sunc:{value:new T.Color(0xfff0d0)}, sunI:{value:1.0} },
  vertexShader:"varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
  fragmentShader:[
    "uniform vec3 top; uniform vec3 mid; uniform vec3 bot; uniform vec3 sunv; uniform vec3 sunc;",
    "uniform float sunI; varying vec3 vP;",
    "void main(){",
    "  vec3 d = normalize(vP);",
    "  float hgt = d.y;",
    "  vec3 c = hgt>0.0 ? mix(mid, top, pow(hgt,0.55)) : mix(mid, bot, pow(-hgt,0.35));",
    "  float s = max(0.0, dot(d, normalize(sunv)));",
    "  c += sunc * (pow(s, 110.0)*2.2 + pow(s, 7.0)*0.26) * sunI;",
    "  gl_FragColor = vec4(c,1.0);",
    "}"].join("\n")
});
scene.add(new T.Mesh(new T.SphereGeometry(300, 40, 24), skyMat));

/* ---------- lights ---------- */
var amb  = new T.AmbientLight(0xffffff, 0.17);              scene.add(amb);
var hemi = new T.HemisphereLight(0xbfe0ff, 0x6b6350, 0.30); scene.add(hemi);
var sun = new T.DirectionalLight(0xfff2d8, 1.55);
sun.position.set(26, 42, -20);
sun.castShadow = true;
sun.shadow.mapSize.set(4096,4096);
var sc = sun.shadow.camera;
sc.left=-28; sc.right=28; sc.top=32; sc.bottom=-32; sc.near=1; sc.far=130;
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.022;
sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
sun.target.position.set(0,0,0);

/* ---------- groups (toggleable) ---------- */
var gSite = new T.Group();
var gGF   = new T.Group();
var gFF   = new T.Group();
var gRoof = new T.Group();
var gBQ   = new T.Group();
var gBQR  = new T.Group();
var gSport = new T.Group();      /* the sports court - alternative to the BQ */
var gSolar = null;               /* PV on the main roof, only in court mode */
[gSite,gGF,gFF,gRoof,gBQ,gBQR,gSport].forEach(function(g){ scene.add(g); });
var FURN = [];   // furniture meshes, for the furniture toggle

/* ============================================================
   PROCEDURAL TEXTURES
   Everything is drawn onto a canvas at load time, so the file stays
   self-contained: no image downloads, no external assets. Each pattern
   is authored to tile seamlessly across its square, and each one also
   produces a grey-scale bump companion.
   ============================================================ */
var ANISO = renderer.capabilities.getMaxAnisotropy();
function PRNG(seed){
  var s = (seed>>>0) || 1;
  return function(){ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return s/4294967296; };
}
function cv(n){
  var c = document.createElement("canvas");
  c.width = c.height = n;
  return { c:c, x:c.getContext("2d"), n:n };
}
function tex(canvas, srgb){
  var t = new T.CanvasTexture(canvas);
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.anisotropy = ANISO;
  t.encoding = srgb ? T.sRGBEncoding : T.LinearEncoding;
  return t;
}
/* wrap-safe soft blob: nine copies so nothing is clipped at the seam */
function blob(x0, cx, cy, r, style, N){
  x0.fillStyle = style;
  for(var i=-1;i<=1;i++) for(var j=-1;j<=1;j++){
    x0.beginPath(); x0.arc(cx+i*N, cy+j*N, r, 0, 6.2832); x0.fill();
  }
}
function radial(x0, cx, cy, r, inner, N){
  for(var i=-1;i<=1;i++) for(var j=-1;j<=1;j++){
    var g = x0.createRadialGradient(cx+i*N, cy+j*N, 0, cx+i*N, cy+j*N, r);
    g.addColorStop(0, inner); g.addColorStop(1, "rgba(0,0,0,0)");
    x0.fillStyle = g;
    x0.beginPath(); x0.arc(cx+i*N, cy+j*N, r, 0, 6.2832); x0.fill();
  }
}
/* fine per-pixel grain */
function grain(ctx, N, amount){
  var img = ctx.getImageData(0,0,N,N), d = img.data, r = PRNG(7717);
  for(var i=0;i<d.length;i+=4){
    var v = (r()-0.5)*amount;
    d[i]   = Math.max(0, Math.min(255, d[i]  +v));
    d[i+1] = Math.max(0, Math.min(255, d[i+1]+v));
    d[i+2] = Math.max(0, Math.min(255, d[i+2]+v));
  }
  ctx.putImageData(img,0,0);
}

/* --- grass: mottled base, then thousands of individual blades --- */
function texGrass(seed, base){
  var N=512, A=cv(N), B=cv(N), r=PRNG(seed);
  A.x.fillStyle=base; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#7a7a7a"; B.x.fillRect(0,0,N,N);
  for(var i=0;i<150;i++){
    radial(A.x, r()*N, r()*N, 24+r()*80,
      r()<0.5 ? "rgba(28,64,26,0.20)" : "rgba(138,176,86,0.16)", N);
  }
  var pal = ["rgba(96,152,62,.50)","rgba(56,104,40,.50)","rgba(126,172,76,.42)",
             "rgba(38,78,30,.46)","rgba(150,182,92,.28)"];
  for(var k=0;k<11000;k++){
    var x=r()*N, y=r()*N, l=3+r()*7, a=(r()-0.5)*1.1, s=Math.floor(r()*5);
    var ex=x+Math.sin(a)*l, ey=y-Math.cos(a)*l;
    A.x.strokeStyle=pal[s]; A.x.lineWidth=1;
    A.x.beginPath(); A.x.moveTo(x,y); A.x.lineTo(ex,ey); A.x.stroke();
    B.x.strokeStyle = s<2 ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.16)";
    B.x.beginPath(); B.x.moveTo(x,y); B.x.lineTo(ex,ey); B.x.stroke();
  }
  return [A.c,B.c];
}

/* --- paving: running bond slabs with joints and per-slab tone --- */
function texPaver(seed, base, warm){
  var N=512, A=cv(N), B=cv(N), r=PRNG(seed);
  var W=128, H=64;
  A.x.fillStyle="#6d6862"; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#3a3a3a"; B.x.fillRect(0,0,N,N);
  for(var row=0; row<N/H; row++){
    var off = (row%2) ? W/2 : 0;
    for(var col=-1; col<N/W+1; col++){
      var x = col*W + off, y = row*H;
      var lum = 1 + (r()-0.5)*0.20;
      var c = base.map(function(v,i){ return Math.round(Math.max(0,Math.min(255, v*lum + (warm?[8,3,-4][i]:0)))); });
      A.x.fillStyle = "rgb("+c[0]+","+c[1]+","+c[2]+")";
      A.x.fillRect(x+1.5, y+1.5, W-3, H-3);
      B.x.fillStyle = "#c8c8c8";
      B.x.fillRect(x+1.5, y+1.5, W-3, H-3);
      A.x.strokeStyle="rgba(255,255,255,.10)"; A.x.lineWidth=1.5;
      A.x.strokeRect(x+2.5, y+2.5, W-5, H-5);
      for(var s=0;s<70;s++){
        A.x.fillStyle = r()<0.5 ? "rgba(0,0,0,.05)" : "rgba(255,255,255,.05)";
        A.x.fillRect(x+2+r()*(W-4), y+2+r()*(H-4), 1+r()*2, 1+r()*2);
      }
    }
  }
  grain(A.x,N,14); grain(B.x,N,10);
  return [A.c,B.c];
}

/* --- external render / plaster: near-flat, faint float marks --- */
function texPlaster(seed, base){
  var N=512, A=cv(N), B=cv(N), r=PRNG(seed);
  A.x.fillStyle=base; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#808080"; B.x.fillRect(0,0,N,N);
  for(var i=0;i<70;i++){
    radial(A.x, r()*N, r()*N, 40+r()*110, "rgba(0,0,0,0.013)", N);
    radial(B.x, r()*N, r()*N, 40+r()*110, "rgba(255,255,255,0.06)", N);
  }
  for(var k=0;k<900;k++){
    var x=r()*N, y=r()*N, l=10+r()*40, a=r()*6.2832;
    B.x.strokeStyle="rgba(255,255,255,.05)"; B.x.lineWidth=1+r()*2;
    B.x.beginPath(); B.x.moveTo(x,y); B.x.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); B.x.stroke();
  }
  grain(A.x,N,7); grain(B.x,N,16);
  return [A.c,B.c];
}

/* --- random ashlar stone cladding for pillars and plinth --- */
function texStone(seed){
  var N=512, A=cv(N), B=cv(N), r=PRNG(seed);
  A.x.fillStyle="#5d5347"; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#2e2e2e"; B.x.fillRect(0,0,N,N);
  var H=64;
  for(var row=0;row<N/H;row++){
    var x=0, off=(row*97)%N;
    while(x < N+120){
      var w = 60 + Math.floor(r()*90);
      var px = (x + off) % N;
      var tint = [0.80,0.92,1.0,1.10,1.22][Math.floor(r()*5)];
      var c = [168,150,126].map(function(v){ return Math.round(Math.min(255, v*tint)); });
      for(var d=-1;d<=1;d++){
        A.x.fillStyle="rgb("+c[0]+","+c[1]+","+c[2]+")";
        A.x.fillRect(px+d*N+2, row*H+2, w-4, H-4);
        B.x.fillStyle="#d0d0d0";
        B.x.fillRect(px+d*N+2, row*H+2, w-4, H-4);
        A.x.fillStyle="rgba(0,0,0,.14)";
        A.x.fillRect(px+d*N+2, row*H+H-7, w-4, 5);
        A.x.fillStyle="rgba(255,255,255,.10)";
        A.x.fillRect(px+d*N+2, row*H+2, w-4, 3);
      }
      x += w;
    }
  }
  grain(A.x,N,22); grain(B.x,N,14);
  return [A.c,B.c];
}

/* --- stone-coated steel roof tile: courses of pans with granules --- */
function texRoof(seed, base){
  var N=512, A=cv(N), B=cv(N), r=PRNG(seed);
  A.x.fillStyle=base; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#606060"; B.x.fillRect(0,0,N,N);
  var H=64, W=128;
  for(var row=0;row<N/H;row++){
    var off=(row%2)?W/2:0;
    for(var col=-1;col<N/W+1;col++){
      var x=col*W+off, y=row*H;
      var g=A.x.createLinearGradient(0,y,0,y+H);
      g.addColorStop(0,"rgba(255,255,255,.14)");
      g.addColorStop(0.45,"rgba(255,255,255,0)");
      g.addColorStop(1,"rgba(0,0,0,.28)");
      A.x.fillStyle=g; A.x.fillRect(x,y,W,H);
      A.x.fillStyle="rgba(0,0,0,.42)"; A.x.fillRect(x,y+H-4,W,4);
      A.x.fillStyle="rgba(0,0,0,.30)"; A.x.fillRect(x-1.5,y,3,H);
      var bg=B.x.createLinearGradient(0,y,0,y+H);
      bg.addColorStop(0,"#d8d8d8"); bg.addColorStop(0.8,"#909090"); bg.addColorStop(1,"#1a1a1a");
      B.x.fillStyle=bg; B.x.fillRect(x,y,W,H);
      B.x.fillStyle="#202020"; B.x.fillRect(x-1.5,y,3,H);
    }
  }
  for(var k=0;k<26000;k++){
    A.x.fillStyle = r()<0.5 ? "rgba(255,255,255,.055)" : "rgba(0,0,0,.075)";
    A.x.fillRect(r()*N, r()*N, 1.4, 1.4);
  }
  grain(B.x,N,26);
  return [A.c,B.c];
}

/* --- timber: straight grain with occasional dark streaks --- */
function texWood(seed, base, dark){
  var N=512, A=cv(N), B=cv(N), r=PRNG(seed);
  A.x.fillStyle=base; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#808080"; B.x.fillRect(0,0,N,N);
  for(var i=0;i<420;i++){
    var x=r()*N, w=0.6+r()*3.4, a=0.04+r()*0.16;
    A.x.fillStyle = "rgba("+dark+","+(a*(0.5+r()*0.9)).toFixed(3)+")";
    A.x.fillRect(x,0,w,N);
    B.x.fillStyle = r()<0.5 ? "rgba(0,0,0,"+(a*0.9).toFixed(3)+")" : "rgba(255,255,255,"+(a*0.7).toFixed(3)+")";
    B.x.fillRect(x,0,w,N);
  }
  for(var j=0;j<14;j++){
    var y=r()*N;
    A.x.strokeStyle="rgba("+dark+",0.10)"; A.x.lineWidth=1+r()*2;
    A.x.beginPath(); A.x.moveTo(0,y);
    for(var q=0;q<=N;q+=32) A.x.lineTo(q, y+Math.sin(q*0.02+j)*6);
    A.x.stroke();
  }
  grain(A.x,N,9); grain(B.x,N,8);
  return [A.c,B.c];
}

/* --- large-format porcelain floor tile with a fine grout line --- */
function texFloorTile(seed, base, veinAlpha){
  var N=512, A=cv(N), B=cv(N), r=PRNG(seed);
  A.x.fillStyle="#b9b3aa"; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#303030"; B.x.fillRect(0,0,N,N);
  var S=256;
  for(var iy=0;iy<2;iy++) for(var ix=0;ix<2;ix++){
    var x=ix*S, y=iy*S;
    A.x.fillStyle=base; A.x.fillRect(x+2,y+2,S-4,S-4);
    B.x.fillStyle="#e0e0e0"; B.x.fillRect(x+2,y+2,S-4,S-4);
    A.x.save(); A.x.beginPath(); A.x.rect(x+2,y+2,S-4,S-4); A.x.clip();
    for(var v=0;v<12;v++){
      var vx=x+r()*S, vy=y+r()*S;
      A.x.strokeStyle="rgba(120,112,102,"+veinAlpha+")";
      A.x.lineWidth=0.6+r()*2.2;
      A.x.beginPath(); A.x.moveTo(vx,vy);
      for(var q=0;q<6;q++){ vx+=(r()-0.5)*90; vy+=(r()-0.3)*70; A.x.lineTo(vx,vy); }
      A.x.stroke();
    }
    for(var s=0;s<26;s++) radial(A.x, x+r()*S, y+r()*S, 20+r()*70, "rgba(255,255,255,0.05)", N);
    A.x.restore();
  }
  grain(A.x,N,5);
  return [A.c,B.c];
}

/* --- engineered board flooring --- */
function texBoard(seed, base){
  var N=512, A=cv(N), B=cv(N), r=PRNG(seed);
  A.x.fillStyle="#4a3320"; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#282828"; B.x.fillRect(0,0,N,N);
  var H=64;
  for(var row=0;row<N/H;row++){
    var off=(row*128)%N;
    for(var col=-1;col<3;col++){
      var x=col*256+off, y=row*H;
      var tint=0.84+r()*0.34;
      var c=base.map(function(v){ return Math.round(Math.min(255,v*tint)); });
      for(var d=-1;d<=1;d++){
        var bx=x+d*N;
        A.x.fillStyle="rgb("+c[0]+","+c[1]+","+c[2]+")";
        A.x.fillRect(bx+1, y+1, 254, H-2);
        B.x.fillStyle="#d8d8d8"; B.x.fillRect(bx+1, y+1, 254, H-2);
        A.x.save(); A.x.beginPath(); A.x.rect(bx+1,y+1,254,H-2); A.x.clip();
        for(var g=0;g<26;g++){
          A.x.strokeStyle="rgba(48,28,12,"+(0.05+r()*0.13).toFixed(3)+")";
          A.x.lineWidth=0.5+r()*1.6;
          var gy=y+r()*H;
          A.x.beginPath(); A.x.moveTo(bx,gy);
          for(var q=0;q<=256;q+=48) A.x.lineTo(bx+q, gy+Math.sin(q*0.03+g)*2.2);
          A.x.stroke();
        }
        A.x.restore();
      }
    }
  }
  grain(A.x,N,8);
  return [A.c,B.c];
}

/* --- woven upholstery / rug pile --- */
function texWeave(seed, base, coarse){
  var N=256, A=cv(N), B=cv(N), r=PRNG(seed);
  A.x.fillStyle=base; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#808080"; B.x.fillRect(0,0,N,N);
  var S = coarse?6:3;
  for(var y=0;y<N;y+=S) for(var x=0;x<N;x+=S){
    var on = ((x/S)+(y/S))%2===0;
    A.x.fillStyle = on ? "rgba(255,255,255,.020)" : "rgba(0,0,0,.028)";
    A.x.fillRect(x,y,S,S);
    B.x.fillStyle = on ? "rgba(255,255,255,.13)" : "rgba(0,0,0,.13)";
    B.x.fillRect(x,y,S,S);
  }
  for(var i=0;i<40;i++) radial(A.x, r()*N, r()*N, 20+r()*50, "rgba(0,0,0,0.05)", N);
  grain(A.x,N,10); grain(B.x,N,22);
  return [A.c,B.c];
}

/* --- dense foliage mass for hedges and tree canopies --- */
function texLeaf(seed, base){
  var N=256, A=cv(N), B=cv(N), r=PRNG(seed);
  A.x.fillStyle=base; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#707070"; B.x.fillRect(0,0,N,N);
  var pal=["#3f7a30","#2c5c22","#589a3c","#1f4419","#6aa848"];
  for(var i=0;i<1800;i++){
    var x=r()*N, y=r()*N, w=3+r()*7, h=2+r()*5, a=r()*6.2832;
    var c=pal[Math.floor(r()*5)];
    var lit = r()<0.5;
    for(var dx=-1;dx<=1;dx++) for(var dy=-1;dy<=1;dy++){
      A.x.save(); A.x.translate(x+dx*N,y+dy*N); A.x.rotate(a);
      A.x.fillStyle=c; A.x.beginPath(); A.x.ellipse(0,0,w,h,0,0,6.2832); A.x.fill();
      A.x.restore();
      B.x.save(); B.x.translate(x+dx*N,y+dy*N); B.x.rotate(a);
      B.x.fillStyle = lit?"rgba(255,255,255,.20)":"rgba(0,0,0,.22)";
      B.x.beginPath(); B.x.ellipse(0,0,w,h,0,0,6.2832); B.x.fill();
      B.x.restore();
    }
  }
  return [A.c,B.c];
}

/* --- topsoil / mulch --- */
function texSoil(seed){
  var N=256, A=cv(N), B=cv(N), r=PRNG(seed);
  A.x.fillStyle="#4c3826"; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#707070"; B.x.fillRect(0,0,N,N);
  for(var i=0;i<2400;i++){
    var x=r()*N,y=r()*N,s=1.5+r()*5, v=Math.floor(50+r()*70);
    blob(A.x,x,y,s,"rgb("+(v+22)+","+v+","+Math.floor(v*0.7)+")",N);
    blob(B.x,x,y,s, r()<0.5?"rgba(255,255,255,.25)":"rgba(0,0,0,.25)",N);
  }
  return [A.c,B.c];
}

/* --- worn bitumen for the street --- */
function texAsphalt(seed){
  var N=512, A=cv(N), B=cv(N), r=PRNG(seed);
  A.x.fillStyle="#33342f"; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#808080"; B.x.fillRect(0,0,N,N);
  for(var i=0;i<26000;i++){
    var x=r()*N,y=r()*N,s=1+r()*2.6, v=Math.floor(30+r()*95);
    A.x.fillStyle="rgba("+v+","+v+","+Math.floor(v*0.96)+",.65)";
    A.x.fillRect(x,y,s,s);
    B.x.fillStyle = r()<0.5?"rgba(255,255,255,.22)":"rgba(0,0,0,.22)";
    B.x.fillRect(x,y,s,s);
  }
  for(var j=0;j<26;j++) radial(A.x, r()*N, r()*N, 30+r()*90, "rgba(190,190,180,0.05)", N);
  return [A.c,B.c];
}

/* --- still water ripple (bump only) --- */
function texRipple(seed){
  var N=256, B=cv(N), r=PRNG(seed);
  B.x.fillStyle="#808080"; B.x.fillRect(0,0,N,N);
  for(var i=0;i<26;i++){
    var cx=r()*N, cy=r()*N;
    for(var k=1;k<9;k++){
      for(var dx=-1;dx<=1;dx++) for(var dy=-1;dy<=1;dy++){
        B.x.strokeStyle = "rgba(255,255,255,"+(0.10/k).toFixed(3)+")";
        B.x.lineWidth=2;
        B.x.beginPath(); B.x.arc(cx+dx*N, cy+dy*N, k*7, 0, 6.2832); B.x.stroke();
      }
    }
  }
  return [B.c,B.c];
}

/* --- rough ground beyond the boundary ---
   The plot lawn is deliberately high contrast, which is right when you are
   standing on it and wrong on a 400 m ground plane: the tonal blobs line up
   into a visible grid at distance. This is the same grass with the large-scale
   variation taken almost all the way out and the palette dulled, so the land
   outside the wall reads as untended scrub and tiles invisibly. */
function texScrub(seed, base){
  var N=512, A=cv(N), B=cv(N), r=PRNG(seed);
  A.x.fillStyle=base; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#808080"; B.x.fillRect(0,0,N,N);
  for(var i=0;i<40;i++) radial(A.x, r()*N, r()*N, 30+r()*60, "rgba(120,132,86,0.045)", N);
  var pal = ["rgba(104,118,74,.30)","rgba(78,92,58,.30)","rgba(118,128,84,.24)",
             "rgba(92,100,62,.26)"];
  for(var k=0;k<9000;k++){
    var x=r()*N, y=r()*N, l=2+r()*5, a=(r()-0.5)*1.3, s=Math.floor(r()*4);
    A.x.strokeStyle=pal[s]; A.x.lineWidth=1;
    A.x.beginPath(); A.x.moveTo(x,y); A.x.lineTo(x+Math.sin(a)*l, y-Math.cos(a)*l); A.x.stroke();
  }
  grain(A.x,N,9); grain(B.x,N,14);
  return [A.c,B.c];
}

/* --- acrylic sports surface: cushioned coat over concrete, sand-filled --- */
function texCourt(seed, base){
  var N=512, A=cv(N), B=cv(N), r=PRNG(seed);
  A.x.fillStyle=base; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#808080"; B.x.fillRect(0,0,N,N);
  /* broad tonal drift from the squeegee passes */
  for(var i=0;i<40;i++) radial(A.x, r()*N, r()*N, 60+r()*110, "rgba(255,255,255,0.030)", N);
  /* the silica sand in the top coat */
  for(var k=0;k<30000;k++){
    var x=r()*N, y=r()*N, s=0.5+r()*1.1;
    A.x.fillStyle = r()<0.5 ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.075)";
    A.x.beginPath(); A.x.arc(x,y,s,0,6.2832); A.x.fill();
    B.x.fillStyle = "rgba(255,255,255,0.11)";
    B.x.beginPath(); B.x.arc(x,y,s,0,6.2832); B.x.fill();
  }
  grain(A.x,N,7); grain(B.x,N,26);
  return [A.c,B.c];
}

/* --- ball-stop netting: an alpha grid, so it screens without blocking --- */
function texNetting(){
  var N=128, c=document.createElement("canvas"); c.width=c.height=N;
  var x=c.getContext("2d");
  x.clearRect(0,0,N,N);
  x.strokeStyle="rgba(30,38,33,0.80)"; x.lineWidth=1.5;
  for(var i=0;i<8;i++){
    var p=(i+0.5)*N/8;
    x.beginPath(); x.moveTo(p,0); x.lineTo(p,N); x.stroke();
    x.beginPath(); x.moveTo(0,p); x.lineTo(N,p); x.stroke();
  }
  return c;
}

/* --- fine sanded render for internal walls --- */
function texRenderFine(seed, base){
  var N=512, A=cv(N), B=cv(N);
  A.x.fillStyle=base; A.x.fillRect(0,0,N,N);
  B.x.fillStyle="#808080"; B.x.fillRect(0,0,N,N);
  grain(A.x,N,6); grain(B.x,N,20);
  return [A.c,B.c];
}

/* ============================================================
   PBR MAP DERIVATION
   Each pattern above produces a colour canvas and a grey-scale height
   canvas. From the height canvas we derive the two maps that actually
   carry the realism:

     normalMap  - Sobel gradient of the height field, tangent space.
                  Replaces bumpMap: same silhouette cost (none), but it
                  perturbs the shading normal per texel rather than
                  approximating it from screen-space derivatives, so
                  grout lines, mortar joints and roof-tile courses hold
                  up at grazing angles and under moving sunlight.

     ORM        - one texture carrying three channels, which is exactly
                  how three.js reads them:
                     R -> aoMap        (needs uv2)
                     G -> roughnessMap (multiplies material.roughness)
                     B -> metalnessMap (multiplies material.metalness)
                  Packing them into one image means one upload and one
                  sampler fetch instead of three.

   Both are derived at half the colour map's resolution. Normals and
   roughness tolerate that; it keeps load time to a few hundred ms.
   ============================================================ */
function shrink(canvas, n){
  var o = document.createElement("canvas"); o.width = o.height = n;
  var x = o.getContext("2d");
  x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
  x.drawImage(canvas, 0, 0, n, n);
  return o;
}
function heightData(canvas, n){
  var s = shrink(canvas, n).getContext("2d").getImageData(0,0,n,n).data;
  var h = new Float32Array(n*n);
  for(var i=0;i<n*n;i++) h[i] = s[i*4]/255;
  return h;
}
/* Sobel over a wrapping height field. Green is +Y-up (OpenGL convention),
   which is what three.js expects of a tangent-space normal map. */
function normalCanvas(h, n, strength){
  var o = document.createElement("canvas"); o.width = o.height = n;
  var oc = o.getContext("2d"), id = oc.createImageData(n,n), d = id.data;
  function at(x,y){ return h[(((y%n)+n)%n)*n + (((x%n)+n)%n)]; }
  for(var y=0;y<n;y++){
    for(var x=0;x<n;x++){
      var dx = (at(x-1,y-1) + 2*at(x-1,y) + at(x-1,y+1))
             - (at(x+1,y-1) + 2*at(x+1,y) + at(x+1,y+1));
      var dy = (at(x-1,y+1) + 2*at(x,y+1) + at(x+1,y+1))
             - (at(x-1,y-1) + 2*at(x,y-1) + at(x+1,y-1));
      var nx = dx*strength, ny = dy*strength;
      var l = Math.sqrt(nx*nx + ny*ny + 1);
      var i = (y*n+x)*4;
      d[i]   = (nx/l*0.5 + 0.5)*255;
      d[i+1] = (ny/l*0.5 + 0.5)*255;
      d[i+2] = (1/l*0.5 + 0.5)*255;
      d[i+3] = 255;
    }
  }
  oc.putImageData(id,0,0);
  return o;
}
/* R = ambient occlusion, G = roughness multiplier, B = metalness multiplier.
   Low points in the height field sit in shadow and are rougher; high points
   catch the light and wear smooth. `ao` and `rv` set how far each swings. */
function ormCanvas(h, n, ao, rv){
  var o = document.createElement("canvas"); o.width = o.height = n;
  var oc = o.getContext("2d"), id = oc.createImageData(n,n), d = id.data;
  /* a 3x3 box blur of the height field stands in for a cavity map */
  var b = new Float32Array(n*n);
  for(var y=0;y<n;y++) for(var x=0;x<n;x++){
    var s=0;
    for(var j=-1;j<=1;j++) for(var i2=-1;i2<=1;i2++)
      s += h[(((y+j)%n)+n)%n*n + ((((x+i2)%n)+n)%n)];
    b[y*n+x] = s/9;
  }
  for(var k=0;k<n*n;k++){
    var cav = Math.max(0, Math.min(1, 0.5 + (h[k]-b[k])*4 + (h[k]-0.5)));
    var i3 = k*4;
    d[i3]   = Math.max(0, Math.min(1, 1 - ao*(1-cav)))*255;
    d[i3+1] = Math.max(0, Math.min(1, 1 - rv*(cav-0.5)*2))*255;
    d[i3+2] = 255;
    d[i3+3] = 255;
  }
  oc.putImageData(id,0,0);
  return o;
}

/* build them all once */
var TX = {};
var MAPRES = 256;              /* resolution of the derived normal / ORM maps */
function reg(name, pair, tile, bumpScale, o){
  o = o||{};
  var h = heightData(pair[1], MAPRES);
  TX[name] = {
    map   : tex(pair[0], true),
    normal: tex(normalCanvas(h, MAPRES, o.ng!=null?o.ng:3.0), false),
    orm   : tex(ormCanvas(h, MAPRES, o.ao!=null?o.ao:0.45, o.rv!=null?o.rv:0.22), false),
    tile  : tile,
    /* the old bumpScale is in metres of relief; normalScale is a unitless
       gain on the same information, so carry it across on a fixed factor
       and let individual patterns override where the guess is wrong */
    ns    : o.ns!=null ? o.ns : Math.max(0.15, Math.min(2.2, bumpScale*22))
  };
}
reg("grass",     texGrass(11, "#3a6b2c"),                   1.5, 0.070, {ns:1.30, ao:0.55, rv:0.10});
reg("grassDark", texGrass(29, "#2f5c25"),                   2.4, 0.060, {ns:1.10, ao:0.55, rv:0.10});
/* paving: deep joints, so a strong normal and heavy occlusion in the gaps */
reg("paver",     texPaver(37, [163,158,150], false),        2.4, 0.030, {ns:1.15, ng:4.0, ao:0.70, rv:0.26});
reg("paverWarm", texPaver(53, [178,164,142], true),         2.4, 0.030, {ns:1.15, ng:4.0, ao:0.70, rv:0.26});
/* render: micro-bump only - too much normal here and the walls read as stucco */
reg("plaster",   texPlaster(61, "#ded7ca"),                 3.0, 0.020, {ns:0.42, ng:2.0, ao:0.24, rv:0.14});
reg("plasterIn", texRenderFine(67, "#eeeae3"),              3.0, 0.010, {ns:0.26, ng:2.0, ao:0.16, rv:0.10});
reg("stone",     texStone(73),                              1.5, 0.055, {ns:1.45, ng:4.2, ao:0.78, rv:0.28});
/* stone-coated steel: the course shadows are the whole character of it */
reg("roof",      texRoof(79, "#2e3237"),                    1.6, 0.045, {ns:1.60, ng:4.5, ao:0.72, rv:0.30});
reg("wood",      texWood(83, "#8a5a30", "60,34,14"),        1.6, 0.020);
reg("woodDark",  texWood(89, "#5a3a20", "34,18,8"),         1.6, 0.020);
/* 800x800 porcelain: the tile face is dead flat, all the relief is the grout,
   so keep the normal subtle but let the joint occlude hard */
reg("tileF",     texFloorTile(97, "#e3ded6", 0.12),         2.4, 0.006, {ns:0.30, ng:5.0, ao:0.62, rv:0.30});
reg("tileWet",   texFloorTile(101,"#d3dade", 0.10),         1.8, 0.006, {ns:0.30, ng:5.0, ao:0.62, rv:0.30});
reg("board",     texBoard(103,[146,100,60]),                2.2, 0.014);
reg("fabric",    texWeave(107,"#57646f", true),             0.8, 0.020);
reg("fabric2",   texWeave(109,"#8a7c6a", true),             0.8, 0.020);
reg("linen",     texWeave(113,"#eee8dd", false),            0.7, 0.014);
reg("rug",       texWeave(127,"#74879a", true),             1.1, 0.030);
reg("leaf",      texLeaf(131,"#356b28"),                    1.1, 0.045);
reg("hedge",     texLeaf(137,"#2c5722"),                    0.9, 0.045);
reg("soil",      texSoil(139),                              0.9, 0.040);
reg("asphalt",   texAsphalt(149),                           3.6, 0.020);
reg("ripple",    texRipple(151),                            1.4, 0.006);
reg("scrub",     texScrub(167, "#5c6b40"),                  3.2, 0.020, {ns:0.55, ao:0.25, rv:0.10});
reg("courtIn",   texCourt(157, "#2d6b52"),                  2.0, 0.004, {ns:0.55, ao:0.30, rv:0.34});
reg("courtOut",  texCourt(163, "#a2543c"),                  2.0, 0.004, {ns:0.55, ao:0.30, rv:0.34});

/* ---------- materials ---------- */
function M(hex, o){
  o = o||{};
  var p = { color:hex, roughness:o.r!=null?o.r:0.85, metalness:o.m!=null?o.m:0.0 };
  if(o.side) p.side = T.DoubleSide;
  if(o.op!=null){ p.transparent=true; p.opacity=o.op; }
  if(o.emis){ p.emissive = new T.Color(o.emis); p.emissiveIntensity = o.ei||0.4; }
  var mm = o.phys ? new T.MeshPhysicalMaterial(p) : new T.MeshStandardMaterial(p);
  /* r128 has no colour management: hex values are taken as linear, which washes
     everything out once outputEncoding = sRGB. Convert them explicitly. */
  mm.color.convertSRGBToLinear();
  if(o.emis) mm.emissive.convertSRGBToLinear();
  if(o.env!=null) mm.envMapIntensity = o.env;
  /* attach a procedural texture set; `tile` is the size in metres that one
     repeat of the pattern covers, and addBox() rescales each box's UVs to it */
  if(o.t){
    var e = TX[o.t];
    mm.map = e.map;
    if(o.bump!==false){
      /* full PBR map set: shading normal, per-texel roughness, per-texel
         occlusion. aoMap reads uv2 - every geometry gets one in fixUV2()
         at the end of the build. */
      var ns = o.ns!=null ? o.ns : (o.bs!=null ? Math.max(0.15, o.bs*22) : e.ns);
      mm.normalMap = e.normal;
      mm.normalScale = new T.Vector2(ns, ns);
      mm.roughnessMap = e.orm;
      mm.aoMap = e.orm;
      mm.aoMapIntensity = o.aoI!=null ? o.aoI : 1.0;
      if(mm.metalness > 0.001) mm.metalnessMap = e.orm;
    }
    mm.userData.tile = o.tile!=null ? o.tile : e.tile;
    /* the pattern already carries the colour, so don't tint it twice */
    if(o.keep!==true) mm.color.setRGB(1,1,1);
    if(o.tint){ mm.color.set(o.tint); mm.color.convertSRGBToLinear(); }
  }
  return mm;
}
var MAT = {
  wallExt   : M(0xffffff, {r:0.90, t:"plaster",   tint:0xf2ede3, env:0.7}),
  wallInt   : M(0xffffff, {r:0.95, t:"plasterIn", tint:0xf7f4ee, env:0.5}),
  accent    : M(0x3b4046, {r:0.62, m:0.10, env:1.0}),
  stone     : M(0xffffff, {r:0.94, t:"stone",     env:0.7}),
  wood      : M(0xffffff, {r:0.62, t:"wood",      env:0.9}),
  woodDark  : M(0xffffff, {r:0.62, t:"woodDark",  env:0.9}),
  /* Real glass, not an alpha blend. MeshPhysicalMaterial renders transmissive
     surfaces through a dedicated pass, so what you see through a window is the
     scene refracted at IOR 1.5, with a Fresnel reflection of the sky on top.
     It costs one extra pass per frame for the entire model, because every pane
     in the building shares this single material. If the frame rate can't carry
     it the loop downgrades it in place - see part 6. */
  glass     : (function(){
                var g = M(0xe6f1f5, {r:0.05, m:0.0, env:1.7, phys:true, keep:true});
                g.transmission = 0.92;
                g.thickness    = 0.05;   /* a 6 mm pane, not a block - big values frost the view */
                g.ior          = 1.5;
                g.transparent  = false;
                return g;
              })(),
  roof      : M(0xffffff, {r:0.80, m:0.10, t:"roof", env:0.8}),
  fascia    : M(0xe4ded3, {r:0.55, env:0.9}),
  fence     : M(0xffffff, {r:0.94, t:"plaster",   tint:0xe6dfd1, tile:2.6, env:0.6}),
  gate      : M(0x394046, {r:0.38, m:0.70, env:1.6}),
  tileF     : M(0xffffff, {r:0.18, m:0.04, t:"tileF",   env:1.6}),
  tileWet   : M(0xffffff, {r:0.15, m:0.04, t:"tileWet", env:1.8}),
  parquet   : M(0xffffff, {r:0.34, t:"board",     env:1.1}),
  rug       : M(0xffffff, {r:0.96, t:"rug"}),
  ceiling   : M(0xffffff, {r:0.96, t:"plasterIn", tint:0xfcfbf8, tile:2.2, env:0.4}),
  grass     : M(0xffffff, {r:0.99, t:"grass",     env:0.5}),
  grassDark : M(0xffffff, {r:0.99, t:"grassDark", env:0.4}),
  scrub     : M(0xffffff, {r:0.99, t:"scrub",     env:0.35}),
  paver     : M(0xffffff, {r:0.85, t:"paver",     env:0.6}),
  paverWarm : M(0xffffff, {r:0.85, t:"paverWarm", env:0.6}),
  asphalt   : M(0xffffff, {r:0.96, t:"asphalt",   env:0.4}),
  soil      : M(0xffffff, {r:1.00, t:"soil"}),
  water     : M(0x2f7fa8, {r:0.03, m:0.30, op:0.80, t:"ripple", keep:true, bs:0.012, env:3.0}),
  trunk     : M(0xffffff, {r:0.95, t:"woodDark",  tint:0x9d7c58, tile:0.9}),
  leaf      : M(0xffffff, {r:0.92, t:"leaf",      env:0.5}),
  leaf2     : M(0xffffff, {r:0.92, t:"leaf",      tint:0xc8e0a8, tile:0.8, env:0.5}),
  palm      : M(0x3f7a35, {r:0.90, side:true, env:0.5}),
  fabric    : M(0xffffff, {r:0.94, t:"fabric",    env:0.5}),
  fabric2   : M(0xffffff, {r:0.94, t:"fabric2",   env:0.5}),
  linen     : M(0xffffff, {r:0.92, t:"linen",     env:0.6}),
  steel     : M(0x9aa0a6, {r:0.28, m:0.85, env:1.8}),
  black     : M(0x1d2024, {r:0.42, m:0.20, env:1.2}),
  white     : M(0xfbfaf7, {r:0.60, env:0.9}),
  counter   : M(0x2b2f33, {r:0.16, m:0.25, env:2.2}),
  carBody   : M(0x22384c, {r:0.16, m:0.70, env:2.6}),
  carBody2  : M(0x9fa4a8, {r:0.18, m:0.75, env:2.6}),
  carGlass  : M(0x141c26, {r:0.05, m:0.60, env:3.0}),
  tyre      : M(0x17181a, {r:0.94}),
  lamp      : M(0xfff0cf, {r:0.4, emis:0xffd899, ei:0.9}),
  planter   : M(0xffffff, {r:0.92, t:"stone",     tint:0xd8cfc0, tile:0.8}),
  hedge     : M(0xffffff, {r:0.98, t:"hedge",     env:0.4}),
  bloom1    : M(0xd2564f, {r:0.86, env:0.6}),
  bloom2    : M(0xe0a63c, {r:0.86, env:0.6}),
  bloom3    : M(0xb96ba8, {r:0.86, env:0.6}),
  /* sports court */
  courtIn   : M(0xffffff, {r:0.58, m:0.02, t:"courtIn",  env:1.0}),
  courtOut  : M(0xffffff, {r:0.58, m:0.02, t:"courtOut", env:1.0}),
  courtLine : M(0xf4f5f2, {r:0.50, env:1.0}),
  courtKey  : M(0xffffff, {r:0.58, m:0.02, t:"courtIn", tint:0xbcd8c8, tile:2.0, env:1.0}),
  backboard : M(0xf7f8f6, {r:0.22, m:0.05, env:1.9}),
  hoopRim   : M(0xd8532c, {r:0.35, m:0.55, env:1.8})
};
/* Ball-stop netting and the badminton net. Both are alpha-cut grids on flat
   quads: you see the court through them, they still read as a barrier, and
   they cost two triangles each instead of a few thousand cylinders. */
var NETTEX = (function(){
  var t = new T.CanvasTexture(texNetting());
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.anisotropy = ANISO;
  t.encoding = T.sRGBEncoding;
  return t;
})();
MAT.netting = new T.MeshStandardMaterial({
  map:NETTEX, transparent:true, alphaTest:0.28, side:T.DoubleSide,
  roughness:0.92, metalness:0.0, color:0xffffff, depthWrite:false, alphaToCoverage:true
});
MAT.netting.userData.tile = 0.80;
/* The badminton and basketball nets are much finer than the ball-stop mesh, so
   they run at ~110 mm squares with a low alpha cut - at 60 mm the cords fell
   below a pixel at any distance and alphaTest erased the net entirely. */
MAT.netWhite = new T.MeshStandardMaterial({
  map:NETTEX, transparent:true, alphaTest:0.10, side:T.DoubleSide,
  roughness:0.85, metalness:0.0, color:0xf2f2ee, depthWrite:false
});
MAT.netWhite.color.convertSRGBToLinear();
MAT.netWhite.userData.tile = 0.11;
/* The badminton net is 6.1 m of 19 mm mesh. Drawn as an alpha grid it needs
   ~300 repeats of the tile, and by the second mip level the cords and the holes
   have averaged into a flat translucent haze - the net simply disappears. So it
   is drawn the way it actually reads from three metres away: one dark
   translucent panel, with the white tape and the posts carrying the detail. */
MAT.netFine = new T.MeshStandardMaterial({
  color:0x2f3630, transparent:true, opacity:0.46, side:T.DoubleSide,
  roughness:0.88, metalness:0.0, depthWrite:false
});
MAT.netFine.color.convertSRGBToLinear();

/* ---------- image-based lighting from the sky ---------- */
/* One PMREM pass over a miniature of the same sky dome. This is what puts real
   reflections in the glazing, the cars, the water and the polished floors, and
   it costs nothing at run time. */
/* Sky dome only. Putting a ground disc in this scene makes the resulting PMREM
   texture black out every standard material it lights, so the horizon colour of
   the sky shader stands in for the ground instead. */
var envScene = new T.Scene();
envScene.add(new T.Mesh(new T.SphereGeometry(100, 32, 20), skyMat));
var envRT = null, envPM = null;
function buildEnv(){
  /* A fresh generator every time, and the old one released only after the new
     texture is in place. Disposing first, or reusing one generator across
     rebuilds, yields a target that renders every lit surface black - which is
     what the Dusk toggle used to do. */
  var pm = new T.PMREMGenerator(renderer);
  var rt = pm.fromScene(envScene, 0.02, 0.5, 150);
  scene.environment = rt.texture;
  if(envRT) envRT.dispose();
  if(envPM) envPM.dispose();
  envRT = rt; envPM = pm;
}
buildEnv();

/* ---------- collision + floor registries ---------- */
var COLLIDERS = [];
var FLOORS    = [];
/* Colliders and floors carry the tag that was current when they were built.
   The BQ and the sports court are mutually exclusive, so their physics has to
   switch with them - otherwise you walk into a wall that isn't drawn. */
var CTAG = null;
var CTOFF = {};                                  /* tag -> true when disabled */
function tagged(fn, tag){ var p = CTAG; CTAG = tag; fn(); CTAG = p; }
function addCollider(x0,x1,z0,z1,y0,y1){ COLLIDERS.push({x0:x0,x1:x1,z0:z0,z1:z1,y0:y0,y1:y1,t:CTAG}); }
/* Drop the colliders that sit wholly inside a region. Used for the very small
   service rooms (BQ bathrooms and kitchenettes) where the fittings are correct
   at full size but leave a walker no room to stand - the fittings stay visible,
   you just can't bump into them. Walls straddle the boundary and are kept. */
function clearColliders(x0,z0,x1,z1){
  var ax0=Math.min(x0,x1), ax1=Math.max(x0,x1), az0=Math.min(z0,z1), az1=Math.max(z0,z1);
  COLLIDERS = COLLIDERS.filter(function(c){
    return !(c.x0>=ax0 && c.x1<=ax1 && c.z0>=az0 && c.z1<=az1);
  });
}
function addFloor(x0,x1,z0,z1,y){ FLOORS.push({x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),y:y,t:CTAG}); }

var BOXG = new T.BoxGeometry(1,1,1);
/* Every box is one shared unit cube scaled to size, so its UVs would stretch
   with it. For textured materials we hand out a per-size clone whose UVs are
   rescaled to the material's tile size in metres - cached, because the same
   handful of sizes recurs hundreds of times. */
var GEOCACHE = {};
function tiledBoxGeo(w,h,d,tile){
  var key = w.toFixed(3)+"|"+h.toFixed(3)+"|"+d.toFixed(3)+"|"+tile;
  if(GEOCACHE[key]) return GEOCACHE[key];
  var g = BOXG.clone();
  var uv = g.attributes.uv;
  /* three.js box face order: +X, -X, +Y, -Y, +Z, -Z */
  var f = [[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
  for(var i=0;i<6;i++){
    var su=f[i][0]/tile, sv=f[i][1]/tile;
    for(var k=0;k<4;k++){
      var j=i*4+k;
      uv.setXY(j, uv.getX(j)*su, uv.getY(j)*sv);
    }
  }
  uv.needsUpdate = true;
  g.setAttribute("uv2", uv);          /* aoMap samples uv2, not uv */
  GEOCACHE[key] = g;
  return g;
}
/* Cylinders, spheres, cones and the hand-built roof planes never got a second
   UV set. Run once after the whole model is built: any geometry that has uv
   but no uv2 shares the one it has, which is what we want since the AO comes
   from the same packed texture as the roughness. */
function fixUV2(root){
  root.traverse(function(o){
    var g = o.geometry;
    if(g && g.attributes && g.attributes.uv && !g.attributes.uv2)
      g.setAttribute("uv2", g.attributes.uv);
  });
}
function addBox(w,h,d,x,y,z,mat,group,o){
  o = o||{};
  var tile = (mat && mat.userData) ? mat.userData.tile : null;
  var m = new T.Mesh(tile ? tiledBoxGeo(w,h,d,tile) : BOXG, mat);
  m.scale.set(w,h,d); m.position.set(x,y,z);
  m.castShadow    = o.cast !== false;
  m.receiveShadow = o.recv !== false;
  (group||gSite).add(m);
  if(o.solid) addCollider(x-w/2,x+w/2,z-d/2,z+d/2,y-h/2,y+h/2);
  if(o.furn){ FURN.push(m); }
  return m;
}
function addCyl(r1,r2,h,x,y,z,mat,group,seg,o){
  o=o||{};
  var m = new T.Mesh(new T.CylinderGeometry(r1,r2,h,seg||18), mat);
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true;
  (group||gSite).add(m);
  if(o.furn) FURN.push(m);
  return m;
}
function addSphere(r,x,y,z,mat,group,o){
  o=o||{};
  var m = new T.Mesh(new T.SphereGeometry(r,18,13), mat);
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true;
  (group||gSite).add(m);
  if(o.furn) FURN.push(m);
  return m;
}

/* ---------- slab: visual floor + walkable region ---------- */
function slab(x0,z0,x1,z1,topY,thk,mat,group,o){
  o=o||{};
  var w = Math.abs(x1-x0), d = Math.abs(z1-z0);
  addBox(w,thk,d,(x0+x1)/2, topY-thk/2, (z0+z1)/2, mat, group, {cast:o.cast!==false});
  if(o.walk!==false) addFloor(x0,x1,z0,z1,topY);
}

/* ---------- wall with openings ---------- */
function wall(x0,z0,x1,z1,o){
  o = o||{};
  var h = o.h!=null?o.h:CH, t = o.t!=null?o.t:0.20, y = o.y!=null?o.y:GF;
  var mat = o.mat || MAT.wallInt, g = o.group || gGF;
  var horiz = Math.abs(z1-z0) < 1e-6;
  var A = horiz ? Math.min(x0,x1) : Math.min(z0,z1);
  var B = horiz ? Math.max(x0,x1) : Math.max(z0,z1);
  var cross = horiz ? z0 : x0;
  var ops = (o.openings||[]).slice().sort(function(p,q){return p.a-q.a;});
  var solids = [], cur = A;
  ops.forEach(function(op){
    var a = Math.max(A, op.a), b = Math.min(B, op.b);
    if(b<=a) return;
    if(a>cur) solids.push({a:cur,b:a,y0:y,y1:y+h});
    var sill = op.sill||0, top = op.top!=null?op.top:2.35;
    if(sill>0.001) solids.push({a:a,b:b,y0:y,y1:y+sill});
    if(top < h-0.001) solids.push({a:a,b:b,y0:y+top,y1:y+h});
    cur = b;
    if(sill>0.001 || op.glass===true){
      var gw = horiz ? (b-a) : 0.06, gd = horiz ? 0.06 : (b-a);
      var gm = new T.Mesh(BOXG, MAT.glass);
      gm.scale.set(gw, top-sill, gd);
      gm.position.set(horiz?(a+b)/2:cross, y+(sill+top)/2, horiz?cross:(a+b)/2);
      gm.castShadow=false; gm.receiveShadow=false; g.add(gm);
      var fm = o.frameMat || MAT.accent;
      addBox(horiz?(b-a):0.09, 0.06, horiz?0.09:(b-a), horiz?(a+b)/2:cross, y+sill+0.03, horiz?cross:(a+b)/2, fm, g, {cast:false});
      addBox(horiz?(b-a):0.09, 0.06, horiz?0.09:(b-a), horiz?(a+b)/2:cross, y+top-0.03, horiz?cross:(a+b)/2, fm, g, {cast:false});
      /* jambs, so the reveal reads as a real frame and not a hole */
      addBox(horiz?0.06:0.09, top-sill, horiz?0.09:0.06, horiz?a+0.03:cross, y+(sill+top)/2, horiz?cross:a+0.03, fm, g, {cast:false});
      addBox(horiz?0.06:0.09, top-sill, horiz?0.09:0.06, horiz?b-0.03:cross, y+(sill+top)/2, horiz?cross:b-0.03, fm, g, {cast:false});
      if((b-a) > 1.4){
        addBox(horiz?0.07:0.09, top-sill, horiz?0.09:0.07, horiz?(a+b)/2:cross, y+(sill+top)/2, horiz?cross:(a+b)/2, fm, g, {cast:false});
      }
    }
  });
  if(cur < B) solids.push({a:cur,b:B,y0:y,y1:y+h});
  solids.forEach(function(s){
    var len = s.b-s.a, hh = s.y1-s.y0;
    if(len<=0.002 || hh<=0.002) return;
    addBox(horiz?len:t, hh, horiz?t:len,
           horiz?(s.a+s.b)/2:cross, (s.y0+s.y1)/2, horiz?cross:(s.a+s.b)/2,
           mat, g, {solid:true});
  });
}
function hwall(u0,v0,u1,v1,o){ wall(hx(u0),hz(v0),hx(u1),hz(v1),o); }
function bwall(u0,v0,u1,v1,o){ wall(bxf(u0),bzf(v0),bxf(u1),bzf(v1),o); }

/* ---------- hip roof ---------- */
function hipRoof(x0,z0,x1,z1,baseY,height,over,mat,group){
  over = over==null?0.5:over;
  var ax0=Math.min(x0,x1)-over, ax1=Math.max(x0,x1)+over;
  var az0=Math.min(z0,z1)-over, az1=Math.max(z0,z1)+over;
  var w = ax1-ax0, d = az1-az0;
  var cx=(ax0+ax1)/2, cz=(az0+az1)/2;
  var rA, rB;
  if(w >= d){ var ins = d/2; rA=[ax0+ins, baseY+height, cz]; rB=[ax1-ins, baseY+height, cz]; }
  else      { var ins2 = w/2; rA=[cx, baseY+height, az0+ins2]; rB=[cx, baseY+height, az1-ins2]; }
  var A=[ax0,baseY,az0], B=[ax1,baseY,az0], C=[ax1,baseY,az1], D=[ax0,baseY,az1];
  /* wound so that computeVertexNormals() gives outward (upward) normals */
  var v=[], tri=function(p,q,r){ v.push(r[0],r[1],r[2], q[0],q[1],q[2], p[0],p[1],p[2]); };
  if(w>=d){
    tri(A,B,rB); tri(A,rB,rA);
    tri(C,D,rA); tri(C,rA,rB);
    tri(D,A,rA);
    tri(B,C,rB);
  } else {
    tri(A,B,rA); tri(B,rB,rA);
    tri(C,D,rB); tri(D,rA,rB);
    tri(D,A,rA);
    tri(B,C,rB);
  }
  var geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.Float32BufferAttribute(v,3));
  /* planar UVs taken off the plan, so tile courses run true across every pitch */
  var mm0 = mat||MAT.roof;
  var mt = (mm0.userData && mm0.userData.tile) ? mm0.userData.tile : 1;
  var uv = [];
  for(var i=0;i<v.length;i+=3) uv.push(v[i]/mt, v[i+2]/mt);
  geo.setAttribute("uv", new T.Float32BufferAttribute(uv,2));
  geo.computeVertexNormals();
  var m = new T.Mesh(geo, mm0);
  m.castShadow=true; m.receiveShadow=true;
  (group||gRoof).add(m);
  var gg = group||gRoof;
  /* ridge cap, sized to the actual ridge */
  var rl = Math.abs(w-d);
  if(rl > 0.15){
    if(w>=d) addBox(rl+0.10, 0.10, 0.26, cx, baseY+height+0.03, cz, MAT.roof, gg, {});
    else     addBox(0.26, 0.10, rl+0.10, cx, baseY+height+0.03, cz, MAT.roof, gg, {});
  }
  addBox(w+0.02, 0.22, 0.06, cx, baseY-0.11, az0-0.02, MAT.fascia, gg, {});
  addBox(w+0.02, 0.22, 0.06, cx, baseY-0.11, az1+0.02, MAT.fascia, gg, {});
  addBox(0.06, 0.22, d+0.02, ax0-0.02, baseY-0.11, cz, MAT.fascia, gg, {});
  addBox(0.06, 0.22, d+0.02, ax1+0.02, baseY-0.11, cz, MAT.fascia, gg, {});
  return m;
}

/* ---------- balustrade ---------- */
function rail(x0,z0,x1,z1,y,group,mat){
  var horiz = Math.abs(z1-z0)<1e-6;
  var len = horiz? Math.abs(x1-x0) : Math.abs(z1-z0);
  var cx=(x0+x1)/2, cz=(z0+z1)/2;
  mat = mat||MAT.white;
  addBox(horiz?len:0.09, 0.09, horiz?0.09:len, cx, y+1.02, cz, MAT.wood, group, {});
  var n = Math.max(2, Math.round(len/0.16));
  for(var i=0;i<=n;i++){
    var f = i/n;
    addBox(0.035, 0.95, 0.035,
      horiz? (x0+(x1-x0)*f) : cx, y+0.52, horiz? cz : (z0+(z1-z0)*f), MAT.steel, group, {cast:false});
  }
  addCollider(Math.min(x0,x1)-0.08, Math.max(x0,x1)+0.08, Math.min(z0,z1)-0.08, Math.max(z0,z1)+0.08, y, y+1.05);
}
