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

/* The duplex sits 2.52 m further back than it first did. The original
   position left only 4.60 m between the boundary wall and the balcony edge,
   and a full-size pickup is 5.89 m long - the cars in the carport physically
   could not be driven in or out. Moving the house north buys a 7.32 m front
   yard, which is the shortest run that takes the longest vehicle plus the
   gate clearance in front of it. It cannot go back any further: the sports
   court is 8.0 m deep and pins the garden's front edge at z = 6.70, and the
   upper floor's rear cantilever now lands within 40 mm of it. */
var HX = -6.775, HZ = -7.24;             // duplex local origin
var HW = 13.55,  HD = 11.5;              // duplex footprint
var GF = 0.60;                           // ground floor level (raised plinth)
var FF = 3.90;                           // first floor level
var CH = 3.00;                           // clear ceiling height
var SLAB = 0.30;
var RF = FF + CH + SLAB;                 // 7.20  roof slab top

function hx(u){ return HX + u; }
function hz(v){ return HZ + v; }

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

/* ---------- sky ----------
   A gradient dome with a procedural cloud deck. The clouds are worth more than
   they look: the same material is rendered into the PMREM environment map
   below, so every window pane, the car, the water and the polished floor gets
   a sky with structure in it instead of a flat wash. That is most of what
   separates a render from a viewport. */
var skyMat = new T.ShaderMaterial({
  side: T.BackSide, depthWrite:false,
  uniforms:{ top:{value:new T.Color(0x2f7fc4)}, mid:{value:new T.Color(0x9fc9e6)},
             bot:{value:new T.Color(0xe9e2d2)}, sunv:{value:new T.Vector3(0.5,0.7,-0.4)},
             sunc:{value:new T.Color(0xfff0d0)}, sunI:{value:1.0},
             cLit:{value:new T.Color(0xffffff)}, cDark:{value:new T.Color(0xa9b4c2)},
             cCov:{value:0.50}, cAmt:{value:0.85}, uT:{value:0.0} },
  vertexShader:"varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
  fragmentShader:[
    "uniform vec3 top; uniform vec3 mid; uniform vec3 bot; uniform vec3 sunv; uniform vec3 sunc;",
    "uniform vec3 cLit; uniform vec3 cDark;",
    "uniform float sunI; uniform float cCov; uniform float cAmt; uniform float uT;",
    "varying vec3 vP;",
    "float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }",
    "float vn(vec2 p){",
    "  vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);",
    "  return mix(mix(h21(i),h21(i+vec2(1.0,0.0)),u.x), mix(h21(i+vec2(0.0,1.0)),h21(i+vec2(1.0,1.0)),u.x), u.y);",
    "}",
    "float fbm(vec2 p){",
    "  float v=0.0, a=0.5;",
    "  for(int i=0;i<5;i++){ v += a*vn(p); p = p*2.03 + 17.3; a *= 0.5; }",
    "  return v;",
    "}",
    "void main(){",
    "  vec3 d = normalize(vP);",
    "  float hgt = d.y;",
    "  vec3 c = hgt>0.0 ? mix(mid, top, pow(hgt,0.55)) : mix(mid, bot, pow(-hgt,0.35));",
    "  vec3 sv = normalize(sunv);",
    "  float s = max(0.0, dot(d, sv));",
    "  c += sunc * (pow(s, 110.0)*2.2 + pow(s, 7.0)*0.26) * sunI;",
    "  if(d.y > 0.015 && cAmt > 0.001){",
    "    vec2 cp = (d.xz / max(d.y, 0.015)) * 2.70 + vec2(uT*0.010, uT*0.004);",
    "    float n  = fbm(cp*1.05);",
    "    float n2 = fbm(cp*2.60 + 4.0);",
    "    float dens = smoothstep(cCov, cCov+0.26, n*0.78 + n2*0.22);",
    "    dens *= smoothstep(0.015, 0.26, d.y);",
    "    float sl = max(0.0, dot(normalize(vec3(d.x,0.0,d.z)+1e-5), normalize(vec3(sv.x,0.0,sv.z)+1e-5)));",
    "    vec3 cc = mix(cDark, cLit, clamp(pow(sl,1.6)*0.55 + n*0.62, 0.0, 1.0));",
    "    c = mix(c, cc, clamp(dens*cAmt, 0.0, 1.0));",
    "  }",
    "  gl_FragColor = vec4(c,1.0);",
    "}"].join("\n")
});
/* The cloud deck is a flat plane at a notional height: the view direction is
   projected onto it, which buys real perspective convergence towards the
   horizon for the cost of one divide. Past the horizon that projection
   stretches to infinity, so it is faded out below 15 degrees - otherwise the
   deck smears into a streak that reads as a bug rather than as distance. */
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

/* ---------- time of day ----------
   The model used to have exactly two lighting states, noon and dusk, and noon
   is the worst light a building can be shown in: the sun is overhead, nothing
   casts a shadow across a facade, and every surface flattens out.
   Architectural photography happens in the two hours before sunset, with the
   sun at twenty or thirty degrees, because that is when a wall shows its
   modelling. This turns those two states into one continuous parameter and
   defaults to the good end of it. */
var PAL = {
  night:{ top:0x0f1b31, mid:0x35456a, bot:0x8a6350, sunc:0xffb173,
          fog:0x2c3a4e, sunCol:0xffa863, sunI:0.26,
          ambCol:0x8ea6c8, ambI:0.20, hemiS:0x3c4c68, hemiG:0x241d18, hemiI:0.34,
          exp:1.17, cLit:0x6a6072, cDark:0x272c3e, cov:0.52, env:0.80 },
  gold:{  top:0x3d80bb, mid:0xa6c6dc, bot:0xf2d2a4, sunc:0xffd9a0,
          fog:0xe0d5c2, sunCol:0xffc287, sunI:1.46,
          ambCol:0xffe2c2, ambI:0.17, hemiS:0xbcd8f2, hemiG:0x7d6a50, hemiI:0.33,
          exp:1.07, cLit:0xfff0da, cDark:0xb0a096, cov:0.44, env:1.00 },
  noon:{  top:0x2f7fc4, mid:0x9fc9e6, bot:0xe9e2d2, sunc:0xfff0d0,
          fog:0xcfe0ea, sunCol:0xfff2d8, sunI:1.55,
          ambCol:0xffffff, ambI:0.17, hemiS:0xbfe0ff, hemiG:0x6b6350, hemiI:0.30,
          exp:1.02, cLit:0xffffff, cDark:0xa9b4c2, cov:0.50, env:1.00 }
};
var _c1 = new T.Color(), _c2 = new T.Color();
/* No convertSRGBToLinear() here, deliberately, and it is not an oversight.
   Material colours go through M() and are converted, because the shading maths
   needs them linear. These are light colours, fog and raw sky-shader uniforms,
   none of which three colour-manages in r136 - the old hard-coded values were
   authored against that behaviour and converting them here darkened the sky by
   a full stop. */
function mixCol(target, a, b, t){
  _c1.setHex(a); _c2.setHex(b);
  target.copy(_c1).lerp(_c2, t);
  return target;
}
function lerpN(a,b,t){ return a + (b-a)*t; }
function blendPal(a, b, t){
  var o = {};
  o.top=[a.top,b.top,t]; o.mid=[a.mid,b.mid,t]; o.bot=[a.bot,b.bot,t];
  o.sunc=[a.sunc,b.sunc,t]; o.fog=[a.fog,b.fog,t]; o.sunCol=[a.sunCol,b.sunCol,t];
  o.ambCol=[a.ambCol,b.ambCol,t]; o.hemiS=[a.hemiS,b.hemiS,t]; o.hemiG=[a.hemiG,b.hemiG,t];
  o.cLit=[a.cLit,b.cLit,t]; o.cDark=[a.cDark,b.cDark,t];
  o.sunI=lerpN(a.sunI,b.sunI,t); o.ambI=lerpN(a.ambI,b.ambI,t); o.hemiI=lerpN(a.hemiI,b.hemiI,t);
  o.exp=lerpN(a.exp,b.exp,t); o.cov=lerpN(a.cov,b.cov,t); o.env=lerpN(a.env,b.env,t);
  return o;
}
var DAYENV = 1.0;
var DAYH = 17.3;                  /* the default: late afternoon, raking light */
var DAYE = 1.0;                   /* sin(elevation), 0 at the horizon */
var sunDir = new T.Vector3(0.5, 0.7, -0.4);
var sunOff = new T.Vector3(26, 42, -20);
function setSky(h, doEnv){
  DAYH = h;
  var frac = Math.max(0, Math.min(1, (h - 6.0) / 12.6));   /* 06:00 .. 18:36 */
  var arc  = Math.PI * frac;
  var elev = 1.30 * Math.sin(arc);          /* peak ~74 deg, near-equatorial */
  if(h < 6.05 || h > 18.55) elev = -0.16;   /* below the horizon: night */
  var e = Math.sin(elev);                   /* 0 at the horizon, 1 overhead */
  DAYE = e;

  /* the sun tracks east to west, leaning a little towards the road side */
  var hor = Math.cos(elev);
  sunDir.set(Math.cos(arc)*hor, Math.sin(elev), -0.34*hor).normalize();
  /* the light direction is allowed to drop to the horizon, but the light
     POSITION is not: below about eight degrees the shadow of a two-storey
     house runs off the end of the plot and the depth map runs out of range */
  sunOff.copy(sunDir); sunOff.y = Math.max(0.145, sunOff.y);
  sunOff.normalize().multiplyScalar(58);

  var p = (e <= 0.10)
    ? blendPal(PAL.night, PAL.gold, Math.max(0, Math.min(1, (e + 0.16) / 0.26)))
    : blendPal(PAL.gold,  PAL.noon, Math.min(1, (e - 0.10) / 0.92));

  mixCol(sun.color, p.sunCol[0], p.sunCol[1], p.sunCol[2]);
  sun.intensity = p.sunI;
  mixCol(amb.color,  p.ambCol[0], p.ambCol[1], p.ambCol[2]); amb.intensity  = p.ambI;
  mixCol(hemi.color, p.hemiS[0],  p.hemiS[1],  p.hemiS[2]);  hemi.intensity = p.hemiI;
  mixCol(hemi.groundColor, p.hemiG[0], p.hemiG[1], p.hemiG[2]);
  mixCol(scene.fog.color, p.fog[0], p.fog[1], p.fog[2]);

  var u = skyMat.uniforms;
  mixCol(u.top.value,  p.top[0],  p.top[1],  p.top[2]);
  mixCol(u.mid.value,  p.mid[0],  p.mid[1],  p.mid[2]);
  mixCol(u.bot.value,  p.bot[0],  p.bot[1],  p.bot[2]);
  mixCol(u.sunc.value, p.sunc[0], p.sunc[1], p.sunc[2]);
  mixCol(u.cLit.value,  p.cLit[0],  p.cLit[1],  p.cLit[2]);
  mixCol(u.cDark.value, p.cDark[0], p.cDark[1], p.cDark[2]);
  u.cCov.value = p.cov;
  u.sunv.value.copy(sunDir);
  u.sunI.value = Math.max(0.25, e*0.8 + 0.35);
  renderer.toneMappingExposure = p.exp;

  /* a low sun throws a long shadow, so the shadow frustum has to grow to hold
     it or the far end of the shadow is simply clipped off */
  var span = 30 + (1 - Math.max(0,e)) * 26;
  sc.left = -span; sc.right = span; sc.top = span + 4; sc.bottom = -(span + 4);
  sc.updateProjectionMatrix();
  /* a low sun also grazes surfaces, which is exactly when shadow acne shows */
  sun.shadow.normalBias = 0.022 + (1 - Math.max(0,e)) * 0.028;

  /* ---- lamps ----
     Every fitting in the model - interior, exterior, the new run on the
     outside of the boundary wall - shares MAT.lamp, so the whole compound
     switches on the sun going down from this one line. It used to sit at a
     fixed emissive of 0.9, which meant the lamps were lit at midday: not
     merely wrong, but the thing that made a dusk render look ordinary,
     because nothing came ON.
     On at 19:00, off at 06:00, with a few minutes of ramp at each end so
     dragging the slider does not snap. Sunset here is about 18:36, so 19:00
     is genuinely dark - which is the point: they are wanted after dark, not
     at dusk. The residual 0.05 by day is the fitting's own pale lens, not
     light: a switched-off lamp is still a light-coloured object. */
  var lf;
  if(h >= 18.75)     lf = Math.min(1, (h - 18.75) / 0.25);
  else if(h <= 5.90) lf = 1;
  else if(h <= 6.15) lf = Math.max(0, (6.15 - h) / 0.25);
  else               lf = 0;
  if(typeof MAT !== "undefined"){
    if(MAT.lamp) MAT.lamp.emissiveIntensity = 0.05 + 1.55 * lf;
    if(MAT.led)  MAT.led.emissiveIntensity  = 0.30 + 1.30 * lf;
    if(MAT.wash){ MAT.wash.opacity = 0.95 * lf; MAT.wash.visible = lf > 0.01; }
  }

  DAYENV = p.env;
  if(doEnv !== false && typeof buildEnv === "function") buildEnv();
  if(typeof envDim === "function") envDim(DAYENV);
}

/* ---------- groups (toggleable) ---------- */
var gSite = new T.Group();
var gGF   = new T.Group();
var gFF   = new T.Group();
var gRoof = new T.Group();
/* The rear of the plot is a landscaped garden, full stop. It used to be an
   either/or with a sports court that occupied exactly the same ground; the
   court has been taken out, so gGarden is now unconditional and there is no
   "sport" collision tag left to filter. */
var gGarden = new T.Group();
var gSolar = null;               /* PV on the main roof deck */
[gSite,gGF,gFF,gRoof,gGarden].forEach(function(g){ scene.add(g); });

/* ---------- the other roofs ----------
   gRoof only ever held the duplex's own roof deck, so "Roof off" lifted the
   lid on the house and left the carport canopy, the utility enclosure's
   pitched roof and the games tent's canvas sitting there with everything under
   them still hidden. From above that is the wrong picture: three of the four
   things you are looking down into stay shut.

   These two groups collect the other structures' roofs so the same toggle
   takes them all. They are children of the domains they belong to rather than
   of gRoof, because the merge is per-domain and moving a mesh between domains
   would change what it gets batched with. A child group is its own merge
   domain and survives the merge as a Group, so its visible flag still works
   afterwards - which is the whole reason this can be done with two groups
   instead of a list of individual meshes. */
var gRoofSite   = new T.Group(); gSite.add(gRoofSite);
var gRoofGarden = new T.Group(); gGarden.add(gRoofGarden);
var ROOFS = [gRoof, gRoofSite, gRoofGarden];
function setRoofs(v){ for(var i=0;i<ROOFS.length;i++) ROOFS[i].visible = v; }
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
/* Pale ash for the loft scheme. Much lower contrast than the board above and
   a lot less red in it: the reference's timber is almost bleached, and the
   moment the grain gets strong the same furniture reads as pine. */
reg("ash",       texBoard(211,[214,196,166]),               3.6, 0.006, {ns:0.30, ao:0.16, rv:0.10});
/* Upholstery. The old fabric was a cold slate blue and fabric2 a muddy khaki,
   which is what made every seat in the house read as office furniture. Both
   are now within a shade of the walls, as in the reference. */
reg("fabric",    texWeave(107,"#cfc7bb", true),             0.8, 0.020);
reg("fabric2",   texWeave(109,"#c3bcb1", true),             0.8, 0.020);
reg("linen",     texWeave(113,"#eee8dd", false),            0.7, 0.014);
/* the rug was a mid blue-grey; the reference's is a flat greige weave */
reg("rug",       texWeave(127,"#c6bfb4", true),             1.1, 0.030);
reg("leaf",      texLeaf(131,"#356b28"),                    1.1, 0.045);
reg("hedge",     texLeaf(137,"#2c5722"),                    0.9, 0.045);
reg("soil",      texSoil(139),                              0.9, 0.040);
reg("asphalt",   texAsphalt(149),                           3.6, 0.020);
reg("ripple",    texRipple(151),                            1.4, 0.006);
reg("scrub",     texScrub(167, "#5c6b40"),                  3.2, 0.020, {ns:0.55, ao:0.25, rv:0.10});

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
  trunk     : M(0xffffff, {r:0.95, t:"woodDark",  tint:0xc9b79c, tile:1.4}),
  leaf      : M(0xffffff, {r:0.92, t:"leaf",      env:0.5}),
  leaf2     : M(0xffffff, {r:0.92, t:"leaf",      tint:0xc8e0a8, tile:0.8, env:0.5}),
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

  /* ---- interior scheme, taken from the loft reference ----
     The whole room in that model sits inside about one and a half stops of
     value: warm off-white plaster, a pale warm floor, and upholstery a shade
     or two darker than the walls. Nothing is white and nothing is dark. The
     only saturated things in the entire space are one dusty mauve cushion and
     the green of a plant, which is why the accents below are so muted - the
     restraint IS the style, and a single bright object undoes it. */
  woodPale  : M(0xffffff, {r:0.46, t:"ash", tile:2.4, env:0.9}),
  terrazzo  : M(0xffffff, {r:0.62, t:"stone", tint:0xe8e2d6, tile:0.55, env:0.9}),
  cushion   : M(0xa89099, {r:0.92, env:0.4}),      /* the dusty mauve */
  plaster   : M(0xffffff, {r:0.94, t:"plasterIn", tint:0xf4efe6, tile:1.4, env:0.5}),
  /* Flat-slab handleless joinery: sideboards, casework, wardrobe carcasses.
     A matte painted panel, not a timber one - putting wood grain on a 1.5 m
     sideboard at furniture scale was turning it into a stack of planks. */
  joinery   : M(0xffffff, {r:0.72, t:"plasterIn", tint:0xeae4d9, tile:2.8, env:0.8}),
  grille    : M(0xe8e6e0, {r:0.72, env:0.7}),
  led       : M(0x7fe0a8, {r:0.4, emis:0x3fd08a, ei:1.6})
};

/* ---------- wall wash ----------
   An emissive fitting on its own does not read as a light that is ON. It reads
   as a small bright object, because nothing around it changes. What sells it is
   the pool the fitting throws on the wall behind it - and forty real point
   lights to produce forty pools is not affordable, so this is a painted one: a
   radial gradient on an additively-blended quad laid over the wall face.
   Additive is what makes it behave like light rather than like a decal - it can
   only brighten what is under it, so the wall texture still shows through. Its
   opacity is driven from setSky() along with the lamps. */
var WASHTEX = (function(){
  var C = cv(128), g = C.x.createRadialGradient(64,64,1,64,64,63);
  g.addColorStop(0.00, "rgba(255,228,182,1.00)");
  g.addColorStop(0.30, "rgba(255,214,152,0.42)");
  g.addColorStop(0.62, "rgba(255,201,132,0.13)");
  g.addColorStop(1.00, "rgba(255,190,120,0.00)");
  C.x.fillStyle = g; C.x.fillRect(0,0,128,128);
  var t = new T.CanvasTexture(C.c);
  t.encoding = T.sRGBEncoding;
  return t;
})();
MAT.wash = new T.MeshBasicMaterial({
  map: WASHTEX, transparent:true, opacity:0, depthWrite:false,
  blending: T.AdditiveBlending, side: T.DoubleSide, toneMapped:false
});
MAT.wash.visible = false;
/* rq is a count of quarter turns and, for wall-mounted things, the direction
   the fitting faces. Read off the existing calls: the inside of the front wall
   is rq 2 and throws into the compound (+z), the inside of the west wall is
   rq 1 and throws +x. So: */
var RQDIR = [[0,-1],[1,0],[0,1],[-1,0]];
/* The ball-stop netting, the badminton net and the basketball net all went out
   with the sports court. NETTEX, MAT.netting, MAT.netWhite and MAT.netFine
   went with them - nothing else in the model used a net. */

/* ============================================================
   FOLIAGE  -  alpha-cut cards instead of clusters of spheres
   ------------------------------------------------------------
   Every tree, shrub and hedge in the model used to be a heap of
   MeshStandardMaterial spheres with a leaf texture painted on them. A leaf
   texture on a ball still reads as a ball, and it was the single most obvious
   "this is CG" tell left in the model - worse now that the whole rear of the
   plot is a garden you can stand in.

   The replacement is what games and archviz both actually use: a handful of
   intersecting quads carrying a cut-out leaf-clump texture. Three things make
   it work, and leaving any of them out is what makes card foliage look bad:

     1. alphaTest, not transparency. A cut-out is opaque - it writes depth, it
        sorts normally, and it can be merged with everything else. Blended
        transparency would need per-object sorting and could not be merged.
     2. Spherical normals. The normal at each vertex is pushed to point away
        from the centre of the canopy rather than square out of the flat card.
        The cards then shade as though they were the surface of a ball of
        leaves, which is what stops them reading as flat billboards.
     3. Enough cards, at enough angles, that no single view sees a card edge-on
        across the whole canopy.

   It is also cheaper than what it replaces: one canopy is one geometry of a
   few dozen triangles, against eleven spheres of a few hundred each. */

/* A clump of leaves on a transparent ground. Drawn as overlapping ellipses
   with a midrib, in a spread of greens, so the cut-out edge is ragged in the
   way a real clump is - a clean circular blob is instantly readable as fake. */
/* `size` is the length of one leaf as a fraction of the card it is drawn on,
   which is how the real-world leaf size is controlled: a 3.7 m tree canopy and
   a 0.7 m hedge card both sample 0..1 of their texture, so they need different
   relative leaf sizes to end up with leaves of a believable absolute size. */
function texLeafClump(seed, base, count, size){
  var n = 256, C = cv(n), g = C.x;
  var r = PRNG(seed);
  g.clearRect(0,0,n,n);
  var col = new T.Color(base);
  count = count || 130;
  size  = size  || 0.030;
  for(var i=0;i<count;i++){
    /* biased towards the middle so the clump has a dense core and a broken
       edge, rather than a uniform disc */
    var a  = r()*Math.PI*2;
    var rad = Math.pow(r(), 0.62) * n*0.46;
    var x = n/2 + Math.cos(a)*rad, y = n/2 + Math.sin(a)*rad;
    var len = n*size*(0.72 + r()*0.62), wid = len*(0.42 + r()*0.32);
    var sh = 0.62 + r()*0.62;                 /* per-leaf light and shade */
    var hs = (r()-0.5)*0.05;
    var lc = col.clone();
    lc.offsetHSL(hs, (r()-0.5)*0.10, (sh-1.0)*0.16);
    g.save();
    g.translate(x,y); g.rotate(r()*Math.PI*2);
    g.fillStyle = "#" + lc.getHexString();
    g.beginPath(); g.ellipse(0, 0, len, wid, 0, 0, Math.PI*2); g.fill();
    /* midrib: a slightly darker line, which is most of what tells the eye
       these are leaves and not confetti */
    lc.offsetHSL(0, 0, -0.09);
    g.strokeStyle = "#" + lc.getHexString();
    g.lineWidth = Math.max(1, len*0.055);
    g.beginPath(); g.moveTo(-len*0.92, 0); g.lineTo(len*0.92, 0); g.stroke();
    g.restore();
  }
  return C.c;
}
function leafTex_raw(canvas){
  var t = new T.CanvasTexture(canvas);
  t.anisotropy = ANISO;
  t.encoding = T.sRGBEncoding;
  return t;
}
function leafTex(seed, base, count, size){ return leafTex_raw(texLeafClump(seed, base, count, size)); }

/* Wind. One uniform, shared by every foliage material, updated once a frame.
   The phase comes from the WORLD position of the vertex, so each plant sways
   on its own beat - which matters because the merge pass bakes every canopy in
   the garden into a single mesh, and without a positional phase the whole
   garden would sway as one object. Amplitude is per-material: a mango tree
   moves, a clipped hedge barely does. */
var WIND = { value: 0.0 };
var FOLIAGE_MATS = [];
function foliageMat(tex, sway, o){
  o = o || {};
  var m = new T.MeshStandardMaterial({
    map: tex,
    alphaTest: o.cut != null ? o.cut : 0.42,
    transparent: false,          /* a cut-out is opaque: it merges and it sorts */
    side: T.DoubleSide,
    roughness: 0.92,
    metalness: 0.0
  });
  m.envMapIntensity = o.env != null ? o.env : 0.45;
  m.onBeforeCompile = function(sh){
    sh.uniforms.uWind = WIND;
    sh.uniforms.uSway = { value: sway };
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>",
               "#include <common>\nuniform float uWind;\nuniform float uSway;")
      .replace("#include <begin_vertex>",
        [ "#include <begin_vertex>",
          "{",
          "  vec3 wP = (modelMatrix * vec4(transformed, 1.0)).xyz;",
          "  float ph = wP.x * 0.43 + wP.z * 0.31;",
          "  transformed.x += sin(uWind * 1.30 + ph) * uSway;",
          "  transformed.z += cos(uWind * 1.07 + ph * 1.27) * uSway * 0.78;",
          "}" ].join("\n"));
    m.userData.shader = sh;
  };
  /* three keys its shader cache on this string; without a distinct one, two
     materials with different sway would share a compiled program and the
     second sway value would be ignored. */
  m.customProgramCacheKey = function(){ return "foliage" + sway.toFixed(3) + m.alphaTest.toFixed(2); };
  FOLIAGE_MATS.push(m);
  return m;
}

/* A mango leaf is about 150 mm. On a 3.7 m canopy card that is 0.040 of the
   card; on a 0.7 m hedge card the same leaf is 0.21 of it. Getting this wrong
   is what makes card foliage look like a cartoon. */
var TX_LEAF  = leafTex(9301, 0x4e8f3a, 620, 0.030);
var TX_LEAF2 = leafTex(4517, 0x6aa845, 560, 0.032);
var TX_SHRUB = leafTex(3313, 0x5c9a3e, 380, 0.070);
var TX_HEDGE = leafTex(7723, 0x3f7a35, 330, 0.075);

MAT.foliage   = foliageMat(TX_LEAF,  0.045);
MAT.foliage2  = foliageMat(TX_LEAF2, 0.052, {env:0.5});
MAT.foliageHi = foliageMat(TX_HEDGE, 0.014, {cut:0.50, env:0.35});   /* hedges */
MAT.foliageLo = foliageMat(TX_SHRUB, 0.022, {env:0.4});              /* shrubs */

/* A pinnate frond: a rachis with leaflets combed off it at an angle, on a
   transparent ground. The palms were solid green blades before, which is the
   one shape in nature that is never solid. UV runs u along the length and v
   across the width, matching frondGeo(). */
function texFrondBlade(seed){
  var n = 256, C = cv(n), g = C.x;
  var r = PRNG(seed);
  g.clearRect(0,0,n,n);
  var col = new T.Color(0x3f7a35);
  /* rachis */
  g.strokeStyle = "#2f5c28"; g.lineWidth = n*0.026;
  g.beginPath(); g.moveTo(0, n/2); g.lineTo(n, n/2); g.stroke();
  var N = 46;
  for(var i=0;i<N;i++){
    var u = 0.03 + (i/N)*0.95;
    /* leaflets shorten towards the tip, and the whole blade tapers */
    var taper = Math.sin(Math.PI*Math.min(1, u*1.12+0.05));
    for(var s=-1;s<=1;s+=2){
      var lc = col.clone();
      lc.offsetHSL((r()-0.5)*0.04, (r()-0.5)*0.10, (r()-0.5)*0.13);
      g.save();
      g.translate(u*n, n/2);
      g.rotate(s * (0.62 + r()*0.16));      /* combed back towards the tip */
      g.fillStyle = "#" + lc.getHexString();
      g.beginPath();
      g.ellipse(0, s*n*0.20*taper, n*0.016, n*0.215*taper, 0, 0, Math.PI*2);
      g.fill();
      g.restore();
    }
  }
  return C.c;
}
/* replaces the flat DoubleSide blade that used to be in the MAT table */
MAT.palm = foliageMat(leafTex_raw(texFrondBlade(6151)), 0.030, {cut:0.38, env:0.5});

/* ---------- canopy geometry ----------
   n intersecting quads inside an ellipsoid, returned as one geometry centred
   on the origin. The normals are the point of the exercise: each is the
   direction from the canopy centre to that vertex, squashed by the ellipsoid,
   so the cards light like a mass of leaves rather than like flat panes. */
function canopyGeo(rx, ry, n, seed){
  var r = PRNG(seed || 1), pos = [], uv = [], nor = [];
  var q = new T.Quaternion(), e = new T.Euler();
  var ux = new T.Vector3(), uy = new T.Vector3(), o = new T.Vector3(), v = new T.Vector3();
  function push(p){
    pos.push(p.x, p.y, p.z);
    v.set(p.x / rx, p.y / ry, p.z / rx);
    if(v.lengthSq() < 1e-8) v.set(0,1,0);
    v.normalize();
    nor.push(v.x, v.y, v.z);
  }
  for(var i=0;i<n;i++){
    /* the golden angle keeps successive cards from stacking up on one side */
    e.set((r()-0.5)*1.15, i*2.399 + r()*0.35, (r()-0.5)*0.75);
    q.setFromEuler(e);
    var w = rx * (0.78 + r()*0.55), h = ry * (0.80 + r()*0.55);
    ux.set(1,0,0).applyQuaternion(q).multiplyScalar(w);
    uy.set(0,1,0).applyQuaternion(q).multiplyScalar(h);
    var d = Math.pow(r(), 0.7) * 0.42;
    o.set((r()-0.5)*rx*d*2, (r()-0.5)*ry*d*2, (r()-0.5)*rx*d*2);
    var a = o.clone().sub(ux).sub(uy), b = o.clone().add(ux).sub(uy),
        c = o.clone().add(ux).add(uy), dd = o.clone().sub(ux).add(uy);
    push(a); push(b); push(c);
    push(a); push(c); push(dd);
    uv.push(0,0, 1,0, 1,1,  0,0, 1,1, 0,1);
  }
  var g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal",   new T.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv",       new T.Float32BufferAttribute(uv, 2));
  return g;
}
/* Canopies are cached by their rounded dimensions: the garden has a lot of
   shrubs of nearly the same size, and there is no reason to build a fresh
   geometry for each when the merge pass is going to copy it anyway. */
var CANOPY = {};
function canopy(x, y, z, rx, ry, n, mat, group, seed){
  var k = rx.toFixed(2) + "_" + ry.toFixed(2) + "_" + n + "_" + ((seed||1) % 7);
  var g = CANOPY[k] || (CANOPY[k] = canopyGeo(rx, ry, n, seed || 1));
  var m = new T.Mesh(g, mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  (group || gSite).add(m);
  return m;
}

/* ---------- image-based lighting from the sky ---------- */
/* One PMREM pass over a miniature of the same sky dome. This is what puts real
   reflections in the glazing, the cars, the water and the polished floors, and
   it costs nothing at run time. */
/* Sky dome only. Putting a ground disc in this scene makes the resulting PMREM
   texture black out every standard material it lights, so the horizon colour of
   the sky shader stands in for the ground instead. */
var envScene = new T.Scene();
envScene.add(new T.Mesh(new T.SphereGeometry(100, 32, 20), skyMat));
var envRT = null, envPM = null, HDRI_READY = false;
function buildEnv(){
  /* Once the real captured sky (below) has loaded, reflections stay fixed to
     it - the time-of-day slider keeps driving the sun, the sky dome and every
     direct light, just not this pass. A photographed sky doesn't have a
     dusk-shifted twin to swap in, and re-tinting the PMREM output per frame
     costs far more than the mismatch is worth. */
  if(HDRI_READY) return;
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

/* Swap in a real captured sky for reflections as soon as it's downloaded.
   Everything glazed, wet or polished picks up actual cloud detail and
   horizon colour instead of the smooth procedural gradient. */
new T.RGBELoader().load("assets/sky.hdr", function(hdrTex){
  hdrTex.mapping = T.EquirectangularReflectionMapping;
  var pm = new T.PMREMGenerator(renderer);
  var rt = pm.fromEquirectangular(hdrTex);
  scene.environment = rt.texture;
  hdrTex.dispose();
  pm.dispose();
  if(envRT) envRT.dispose();
  envRT = null;
  HDRI_READY = true;
});

/* ---------- external model loader ----------
   Everything else in this model is generated in the browser, but trees and
   vehicles are the two things procedural geometry is genuinely bad at: a car
   built from boxes reads as a car-shaped box, and no amount of care fixes
   that. These arrive as .glb files instead.

   They are the only downloaded assets in the project and they are the reason
   the page is no longer instant on a slow connection, so they load
   asynchronously and the model is fully usable before any of them arrive. */
var MODELS = (function(){
  var loader = (typeof T.GLTFLoader === "function") ? new T.GLTFLoader() : null;
  var pending = 0, finished = 0, cbs = [];
  function tick(){
    if(finished >= pending) for(var i=0;i<cbs.length;i++) cbs[i]();
  }
  return {
    ok: !!loader,
    load: function(file, onDone){
      if(!loader){ console.warn("GLTFLoader missing; skipping " + file); return; }
      pending++;
      loader.load("assets/models/" + file,
        function(g){ finished++; try{ onDone(g); }catch(e){ console.warn("place failed: "+file, e); } tick(); },
        undefined,
        function(e){ finished++; console.warn("load failed: "+file, e); tick(); });
    },
    whenReady: function(f){ cbs.push(f); }
  };
})();

/* ---------- collision + floor registries ---------- */
var COLLIDERS = [];
var FLOORS    = [];
/* Which group new planting is added to. The five planting helpers below were
   written straight into gSite because everything green was permanent; the
   garden needs them to build into gGarden instead, so the target group is a
   parameter rather than a constant. */
var PGRP = null;                                 /* null means gSite */
function planting(g, fn){ var p = PGRP; PGRP = g; fn(); PGRP = p; }

/* CTOFF is gone. It was a tag -> bool map that let a whole rear option -
   the sports court, and before that the BQ - have its colliders, floors,
   room labels and viewpoints switched off in step with its geometry, so you
   never walked into a wall that was not drawn. Both options were removed,
   nothing ever wrote to the map again, and the six `if(x.t && CTOFF[x.t])
   continue;` guards that read it had been dead branches ever since.
   `tagged()` went with it: it was the helper that set CTAG for a block, and
   it had no callers left either.

   CTAG survives as a plain label. Colliders, floors, zones and viewpoints
   built inside the garden still carry t:"garden", which nothing currently
   reads - it is there so that if a rear option is ever reintroduced, the
   things it would have to switch are already marked. */
var CTAG = null;
/* Returns the collider it just pushed. Anything that moves after the model is
   built - the cars, the gate leaves - keeps that reference and edits it in
   place, so the thing you can walk into always matches the thing you can see. */
function addCollider(x0,x1,z0,z1,y0,y1){
  var c = {x0:x0,x1:x1,z0:z0,z1:z1,y0:y0,y1:y1,t:CTAG};
  COLLIDERS.push(c);
  return c;
}
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
  /* 18x13 is right for a cushion you stand next to. It is 468 triangles for a
     flower head 50 mm across, so anything that places a lot of small spheres
     should pass o.seg and buy a coarser one. */
  var sg = o.seg || 18;
  var m = new T.Mesh(new T.SphereGeometry(r, sg, Math.max(3, Math.round(sg*0.72))), mat);
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
      /* ---------- architrave, sill and drip ----------
         o.trim is the OUTWARD direction along the cross axis (+1 or -1). The
         reference elevation gets most of its crispness from these: a white
         band around each opening, and a sill that projects far enough to throw
         a shadow of its own. The groove under the sill is 20 mm of nothing,
         and it is the detail that stops rain tracking back along the underside
         and staining the wall below every window - worth drawing because it is
         worth building. */
      if(o.trim){
        var sgn = o.trim, face = cross + sgn*(t/2 + 0.024), tw = 0.105, ov = 0.085;
        var aa = a - tw, bb = b + tw;
        var band = function(u0, u1, yc, hh2){
          addBox(horiz ? (u1-u0) : 0.05, hh2, horiz ? 0.05 : (u1-u0),
                 horiz ? (u0+u1)/2 : face, yc, horiz ? face : (u0+u1)/2,
                 MAT.white, g, {cast:false});
        };
        band(aa, a,  y+(sill+top)/2 + tw/2, (top-sill) + tw);   /* left jamb  */
        band(b,  bb, y+(sill+top)/2 + tw/2, (top-sill) + tw);   /* right jamb */
        band(aa, bb, y+top+tw/2, tw);                           /* head       */
        /* sill: projects past the wall face, and past the jambs on both sides */
        addBox(horiz ? (bb-aa)+0.06 : ov*2, 0.065, horiz ? ov*2 : (bb-aa)+0.06,
               horiz ? (aa+bb)/2 : cross + sgn*(t/2 + ov*0.55), y+sill-0.020,
               horiz ? cross + sgn*(t/2 + ov*0.55) : (aa+bb)/2,
               MAT.white, g, {cast:false});
        addBox(horiz ? (bb-aa) : 0.022, 0.018, horiz ? 0.022 : (bb-aa),
               horiz ? (aa+bb)/2 : cross + sgn*(t/2 + ov*0.92), y+sill-0.062,
               horiz ? cross + sgn*(t/2 + ov*0.92) : (aa+bb)/2,
               MAT.accent, g, {cast:false});
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
    /* Skirting. Keyed off the material and the trim flag rather than a flag
       at each of the hundred-odd call sites: a partition gets a board on both
       faces, an external wall gets one on the inside only. Nobody consciously
       notices skirting; everybody notices a wall meeting a floor in a bare
       line. */
    if(hh > 1.6 && s.y0 <= y + 0.01){
      var faces = null;
      if(mat === MAT.wallInt)  faces = [-1, 1];   /* partition: both sides */
      else if(o.trim)          faces = [-o.trim]; /* exterior: the inside only */
      if(faces) for(var fi = 0; fi < faces.length; fi++){
        var sf = cross + faces[fi]*(t/2 + 0.009);
        addBox(horiz?len:0.018, 0.105, horiz?0.018:len,
               horiz?(s.a+s.b)/2:sf, s.y0 + 0.0525, horiz?sf:(s.a+s.b)/2,
               MAT.white, g, {cast:false});
      }
    }
  });
}
/* ---------- rooms ----------
   Lives here rather than with the controls that first used it, because the
   plans, the room schedule and the door-swing logic all need it and all of
   them are built before the controls file is parsed. 06-controls.js still
   adds the garden and court zones to the end of this list. */
function Z(name, y, x0,z0,x1,z1){ return {n:name, y:y, x0:Math.min(x0,x1), x1:Math.max(x0,x1), z0:Math.min(z0,z1), z1:Math.max(z0,z1)}; }
var ZONES = [
  /* ground floor */
  Z("Living room", GF, hx(0),hz(0), hx(5.0),hz(7.0)),
  Z("Dining room", GF, hx(0),hz(7.0), hx(5.0),hz(11.5)),
  Z("Entrance foyer", GF, hx(5.0),hz(0), hx(8.55),hz(2.6)),
  Z("Staircase", GF, hx(5.0),hz(2.6), hx(6.5),hz(7.36)),
  Z("Stair hall", GF, hx(6.5),hz(2.6), hx(8.55),hz(7.36)),
  Z("Rear lobby / breakfast", GF, hx(5.0),hz(7.36), hx(8.55),hz(11.5)),
  Z("Guest bedroom", GF, hx(8.55),hz(0), hx(13.55),hz(4.6)),
  Z("Guest cloakroom", GF, hx(8.55),hz(4.6), hx(10.4),hz(6.4)),
  Z("Store", GF, hx(10.4),hz(4.6), hx(13.55),hz(6.4)),
  Z("Kitchen", GF, hx(8.55),hz(6.4), hx(13.55),hz(10.2)),
  Z("Pantry / laundry", GF, hx(8.55),hz(10.2), hx(13.55),hz(11.5)),
  Z("Front porch", GF, hx(0.6),hz(-2.2), hx(12.95),hz(0)),
  /* first floor */
  /* The first floor was replanned when the master moved to the entrance side -
     see the long note at the top of the wall block in 05-upper-floor.js. The
     family room is the only L-shaped room in the house, so it takes two
     entries; the more specific one has to come first for zoneAt() to find it,
     and both carry the same name so the label reads as one room. */
  Z("Family room", FF, hx(0),hz(2.6), hx(5.0),hz(4.0)),
  Z("Family room", FF, hx(0),hz(0), hx(6.5),hz(2.6)),
  Z("Study / library", FF, hx(0),hz(4.0), hx(5.0),hz(7.0)),
  Z("Upstairs corridor", FF, hx(6.5),hz(0), hx(8.3),hz(7.36)),
  Z("Upstairs landing", FF, hx(5.0),hz(7.36), hx(8.3),hz(10.2)),
  Z("Upstairs sitting area", FF, hx(5.0),hz(10.2), hx(8.3),hz(13.9)),
  Z("Bedroom 3 bathroom", FF, hx(0),hz(7.0), hx(2.8),hz(10.2)),
  Z("Bedroom 3 walk-in", FF, hx(2.8),hz(7.0), hx(5.0),hz(10.2)),
  Z("Bedroom 3", FF, hx(0),hz(10.2), hx(5.0),hz(13.9)),
  Z("Master bedroom", FF, hx(8.3),hz(0), hx(13.55),hz(5.25)),
  Z("Walk-in closet", FF, hx(8.3),hz(5.25), hx(10.8),hz(7.65)),
  Z("Master bathroom", FF, hx(10.8),hz(5.25), hx(13.55),hz(7.65)),
  Z("Bedroom 2 en-suite", FF, hx(8.3),hz(7.65), hx(10.8),hz(9.9)),
  Z("Linen / plant store", FF, hx(10.8),hz(7.65), hx(13.55),hz(9.9)),
  Z("Bedroom 2", FF, hx(8.3),hz(9.9), hx(13.55),hz(13.9)),
  Z("Front balcony", FF, hx(0.6),hz(-2.2), hx(12.95),hz(0)),
  /* games tent - in the garden, so it goes with the garden */
  Z("Games tent", 0, -8.40, 11.10, -3.20, 14.70),
  /* outdoors */
  Z("Driveway / carport", 0, -9.6,-16.7, -1.1,-11.2),
  Z("Front garden", 0, 0.2,-16.7, 9.7,-11.2),
  /* The terrace and the lawn moved north with the house; the zone boxes did
     not, so both still sat over ground that is now under the building. You
     were standing on the terrace and being told you were in the rear lobby. */
  Z("Rear terrace", 0, -1.3,4.3, 4.9,6.7),
  Z("Rear lawn", 0, -9.7,6.7, 9.7,11.1),
  Z("Utility yard", 0, -9.7,15.0, 9.7,16.8),
  Z("West garden walk", 0, -9.7,-11.3, -6.8,7.8),
  Z("East service path", 0, 6.8,-11.3, 9.7,14.7)
];

/* ---------- the plan registry ----------
   Every wall the house is built from is recorded here as it is built, in the
   same u/v coordinates the call site used. The 2D drawings are generated from
   this list, which is the whole point: there is no second description of the
   building to fall out of step with the first. Move a wall in 04/05 and the
   plan, the door schedule and the quantities all move with it.

   Openings arrive from opH/opV in world coordinates, so they are converted
   back to local u/v on the way in. */
var PLAN = { walls: [], furn: [] };

function hwall(u0,v0,u1,v1,o){
  o = o || {};
  var horiz = Math.abs(v1 - v0) < 1e-6;
  PLAN.walls.push({
    u0:u0, v0:v0, u1:u1, v1:v1,
    horiz : horiz,
    t     : o.t != null ? o.t : 0.20,
    h     : o.h != null ? o.h : CH,
    y     : o.y != null ? o.y : GF,
    ext   : o.mat === MAT.wallExt,
    ops   : (o.openings || []).map(function(op){
      return { a    : op.a - (horiz ? HX : HZ),
               b    : op.b - (horiz ? HX : HZ),
               sill : op.sill || 0,
               top  : op.top != null ? op.top : 2.35,
               glass: op.glass === true };
    })
  });
  wall(hx(u0),hz(v0),hx(u1),hz(v1),o);
}

/* Fixed furniture and sanitaryware register their footprint so the plans can
   draw them and the door swings can be checked against them. w/d are the
   unrotated footprint; rq turns it the same way dims() does. */
function planFurn(kind, cx, cz, w, d, rq, y){
  var D = (rq === 1 || rq === 3) ? [d, w] : [w, d];
  PLAN.furn.push({ k:kind, u:cx - HX, v:cz - HZ, w:D[0], d:D[1],
                   y: y != null ? y : GF });
}

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

/* ---------- flat roof with parapet ----------
   The cantilevered-stack option's roofline: a dark parapet flush with the
   wall line, capped in a light coping, with no eave overhang of its own. Any
   projection the design wants - the balcony wing being the one that matters
   here - is built as its own cantilevered plate rather than a uniform eave,
   because a contemporary flat roof reads through a couple of confident
   projections, not one overhang running the whole way round. */
function parapetRoof(x0,z0,x1,z1,baseY,h,mat,copeMat,group){
  var w=Math.abs(x1-x0), d=Math.abs(z1-z0), cx=(x0+x1)/2, cz=(z0+z1)/2;
  var t=0.15, ct=t+0.06;
  addBox(w+t, h, t, cx, baseY+h/2, z0-t/2, mat, group, {cast:false});
  addBox(w+t, h, t, cx, baseY+h/2, z1+t/2, mat, group, {cast:false});
  addBox(t, h, d+t, x0-t/2, baseY+h/2, cz, mat, group, {cast:false});
  addBox(t, h, d+t, x1+t/2, baseY+h/2, cz, mat, group, {cast:false});
  addBox(w+ct, 0.05, ct, cx, baseY+h+0.025, z0-t/2, copeMat, group, {cast:false});
  addBox(w+ct, 0.05, ct, cx, baseY+h+0.025, z1+t/2, copeMat, group, {cast:false});
  addBox(ct, 0.05, d+ct, x0-t/2, baseY+h+0.025, cz, copeMat, group, {cast:false});
  addBox(ct, 0.05, d+ct, x1+t/2, baseY+h+0.025, cz, copeMat, group, {cast:false});
}

/* ---------- balustrade ---------- */
/* ---------- fluted charcoal panels ----------
   The one detail that most separates the reference elevation from a plain
   rendered box. A flat charcoal rectangle painted on a wall reads as paint; a
   fluted one reads as a material, because the ribs catch the low sun on one
   side and shade on the other. It only works with a raking sun, which is
   exactly what the time-of-day default now gives.

   Ribs are half-round, 90 mm wide at 110 mm centres, standing 45 mm proud of a
   charcoal backing board. Each rib is a low-segment cylinder rather than a
   box: at this size the difference between a flat chamfer and a real curve is
   the difference between a shadow line and a gradient. */
function flutePanel(cx, cy, cz, w, h, face, group){
  /* `face` is the outward direction of the wall the panel sits on: "+z", "-z",
     "+x" or "-x". It has to be the outward one - ribs pushed into the wall
     instead of out of it are invisible, and silently so. */
  var alongZ = (face === "+x" || face === "-x");
  var sgn = (face === "-z" || face === "-x") ? -1 : 1;
  var back = 0.05, prj = 0.045, rr = 0.045, pitch = 0.110;
  group = group || gGF;

  /* backing board, slightly proud of the render so the panel has an edge */
  addBox(alongZ ? back*2 : w, h, alongZ ? w : back*2,
         cx, cy, cz, MAT.accent, group, {cast:false});

  var n = Math.max(2, Math.floor(w / pitch));
  var span = (n - 1) * pitch;
  for(var i=0;i<n;i++){
    var off = -span/2 + i*pitch;
    var rx = alongZ ? cx + sgn*(back + prj*0.5) : cx + off;
    var rz = alongZ ? cz + off                  : cz + sgn*(back + prj*0.5);
    var m = addCyl(rr, rr, h, rx, cy, rz, MAT.accent, group, 7, {cast:false});
    /* squash the cylinder into a half-round standing off the board */
    m.scale.z = alongZ ? 1 : 0.62;
    m.scale.x = alongZ ? 0.62 : 1;
  }
}

/* ---------- stone-clad column ----------
   A structural column in a charcoal casing, wrapped in split-face stone with a
   rendered cap and base band - the porch columns in the reference. The bands
   matter as much as the stone: without them the cladding runs into the slab
   and the column loses its base. */
function stoneColumn(x, y0, y1, z, core, group){
  var h = y1 - y0, cy = (y0 + y1) / 2;
  var band = 0.13, cw = core + 0.20;
  addBox(core, h, core, x, cy, z, MAT.accent, group, {solid:true});
  addBox(cw, h - band*2, cw, x, cy, z, MAT.stone, group, {cast:false});
  addBox(cw + 0.06, band, cw + 0.06, x, y0 + band/2, z, MAT.white, group, {cast:false});
  addBox(cw + 0.06, band, cw + 0.06, x, y1 - band/2, z, MAT.white, group, {cast:false});
}

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
