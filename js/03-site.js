"use strict";
/* ============================================================
   PART 3  -  the site: ground, fence, gate, driveway, garden

   REVISION: hard-standing cut back hard. The first pass paved
   roughly 211 sqm of the compound - both side yards at full
   width, a deep rear terrace, a full-width rear apron and a fully
   paved utility yard - which left the plot reading as concrete
   with grass in the gaps. This pass keeps paving only where a
   car, a wheelbarrow or a bin actually has to run and hands the
   rest back to lawn.  Paved now: ~128 sqm.  Soft: ~290 sqm.
   ============================================================ */

/* ---------- terrain ---------- */
var groundGeo = new T.PlaneGeometry(400,400);
(function(){ /* scale the ground plane UVs so the scrub tiles at 3.2 m */
  var uv = groundGeo.attributes.uv, k = 400/3.2;
  for(var i=0;i<uv.count;i++) uv.setXY(i, uv.getX(i)*k, uv.getY(i)*k);
  uv.needsUpdate = true;
})();
var groundMesh = new T.Mesh(groundGeo, MAT.scrub);
groundMesh.rotation.x = -Math.PI/2; groundMesh.position.y = -0.02;
groundMesh.receiveShadow = true; gSite.add(groundMesh);
addFloor(-200,200,-200,200,0);

/* street in front */
addBox(120, 0.10, 7.4, 0, -0.05, Z0-1.6-3.7, MAT.asphalt, gSite, {cast:false});
addBox(120, 0.16, 1.5, 0, -0.02, Z0-0.75, MAT.paver, gSite, {cast:false});
addBox(120, 0.20, 0.14, 0, 0.02, Z0-1.52, MAT.white, gSite, {cast:false});   /* kerb */
for(var i=-5;i<=5;i++){
  addBox(2.4,0.02,0.16, i*6.0, 0.02, Z0-1.6-3.7, M(0xe8e2cf,{r:0.92}), gSite, {cast:false});
}
/* No neighbouring buildings. Everything standing in this model is on your
   plot; the land beyond the boundary wall is left as open ground so nothing
   in view can be mistaken for part of the property. */

/* ---------- plot surfaces ---------- */
function surf(x0,z0,x1,z1,mat,y,g){
  addBox(Math.abs(x1-x0), 0.06, Math.abs(z1-z0), (x0+x1)/2, (y||0)-0.03, (z0+z1)/2, mat, g||gSite, {cast:false});
}
/* lawn base over the whole plot; everything below is cut out of it */
surf(X0,Z0,X1,Z1,MAT.grass,0.005);

/* driveway + carport apron - three bays, cars reversed in   (48 sqm) */
surf(-9.475,-16.60,-1.15,-11.40, MAT.paver, 0.02);
/* The west bay runs 1.65 m deeper than the other two. A full-size pickup is
   5.89 m long and will not stand in the 4.90 m the other two bays have; there
   is room for it here only because the house wall stops at x = -6.775, so
   this strip is open ground the whole way to the front setback line. */
surf(-9.475,-11.40,-6.50,-9.90, MAT.paver, 0.02);
[-6.50,-3.75].forEach(function(x){ addBox(0.09,0.02,4.6,x,0.04,-13.9,MAT.white,gSite,{cast:false}); });

/* entrance walkway, 1.2 m wide, pedestrian gate straight to the porch (8.5 sqm) */
surf(-1.05,-16.60,0.15,-11.56, MAT.paverWarm, 0.02);
surf(-1.05,-12.30, 2.30,-11.56, MAT.paverWarm, 0.02);

/* east service path, 1.1 m - the only run a bin or a jerrycan needs  (28 sqm) */
surf( 7.95,-11.40, 9.05,14.20, MAT.paver, 0.02);

/* west side: stepping stones set into the lawn instead of a slab path (3 sqm) */
for(var sz=-9.60; sz<=3.20; sz+=0.78){
  addBox(0.55,0.07,0.55, -7.90, 0.015, sz, MAT.paverWarm, gSite, {cast:false});
}

/* rear terrace, pulled tight against the house   (14 sqm) */
surf(-1.20,1.74,4.80,4.10, MAT.paverWarm, 0.02);


/* utility yard - a 1.4 m service strip hard against the rear wall.
   It used to run 3 m out from the wall, which put the generator and the tank
   stand in the middle of the only piece of ground big enough for a court.
   Pulled back, it still works and it clears z = 15.0 southwards. (14 sqm) */
surf(-6.60,15.10,-3.20,16.50, MAT.paver, 0.02);
surf(-0.60,15.10, 4.20,16.50, MAT.paver, 0.02);

/* ---------- perimeter fence ---------- */
var FH = 2.40, FT = 0.23;
function fenceRun(x0,z0,x1,z1){
  var horiz = Math.abs(z1-z0)<1e-6;
  var len = horiz?Math.abs(x1-x0):Math.abs(z1-z0);
  if(len<0.05) return;
  var cx=(x0+x1)/2, cz=(z0+z1)/2;
  addBox(horiz?len:FT, FH, horiz?FT:len, cx, FH/2, cz, MAT.fence, gSite, {solid:true});
  addBox(horiz?len:FT+0.10, 0.16, horiz?FT+0.10:len, cx, FH+0.08, cz, MAT.accent, gSite, {});
  var n = Math.max(1, Math.round(len/3.2));
  for(var i=0;i<=n;i++){
    var f=i/n;
    var px = horiz? x0+(x1-x0)*f : cx;
    var pz = horiz? cz : z0+(z1-z0)*f;
    addBox(0.36,FH+0.42,0.36, px, (FH+0.42)/2, pz, MAT.stone, gSite, {solid:true});
    addBox(0.44,0.10,0.44, px, FH+0.47, pz, MAT.accent, gSite, {});
  }
}
/* front wall with two gate openings */
fenceRun(X0, Z0, -8.60, Z0);
fenceRun(-4.10, Z0, -1.15, Z0);
fenceRun(0.25, Z0, X1, Z0);
fenceRun(X0, Z1, X1, Z1);
fenceRun(X0, Z0, X0, Z1);
fenceRun(X1, Z0, X1, Z1);

/* gate pillars */
function gatePillar(x,z,lamp){
  addBox(0.55,3.10,0.55,x,1.55,z,MAT.stone,gSite,{solid:true});
  addBox(0.68,0.14,0.68,x,3.17,z,MAT.accent,gSite,{});
  if(lamp){
    addBox(0.26,0.42,0.26,x,3.45,z,MAT.lamp,gSite,{cast:false});
    addBox(0.34,0.08,0.34,x,3.70,z,MAT.accent,gSite,{});
  }
}
gatePillar(-8.85,Z0,true); gatePillar(-3.85,Z0,true);
gatePillar(-1.30,Z0,false); gatePillar(0.40,Z0,false);

/* sliding vehicle gate (half open, parked to the left) */
(function(){
  var gx0=-8.60, gx1=-4.10, w=gx1-gx0;
  var open = 1.5;
  addBox(w-open, 0.16, 0.10, gx0+(w-open)/2, 2.32, Z0, MAT.gate, gSite, {});
  addBox(w-open, 0.16, 0.10, gx0+(w-open)/2, 0.14, Z0, MAT.gate, gSite, {});
  var n=Math.round((w-open)/0.19);
  for(var i=0;i<n;i++){
    addBox(0.10,2.22,0.09, gx0+0.1+i*0.19, 1.22, Z0, MAT.gate, gSite, {});
  }
  addCollider(gx0-0.1, gx0+(w-open)+0.1, Z0-0.12, Z0+0.12, 0, 2.4);
  addBox(4.9,0.06,0.16,-6.35,0.03,Z0+0.30,MAT.steel,gSite,{cast:false});
})();
/* pedestrian gate left open - you can walk out to the street */
(function(){
  var gx0=-1.15;
  var n=6;
  for(var i=0;i<n;i++) addBox(0.07,2.05,0.07, gx0-0.10, 1.05, Z0-0.10-i*0.16, MAT.gate, gSite, {});
  addBox(0.10,0.10,1.05, gx0-0.10, 2.12, Z0-0.55, MAT.gate, gSite, {});
})();
/* house number plaque */
addBox(0.46,0.30,0.04, -1.30, 1.85, Z0-0.30, MAT.accent, gSite, {});

/* rear service gate in the boundary wall (utility yard) */
addBox(1.10,2.05,0.08, 8.30, 1.02, Z1-0.02, MAT.gate, gSite, {});

/* ---------- carport ---------- */
(function(){
  var cx0=-9.40, cx1=-1.15, cz0=-16.50, cz1=-11.60;
  var cy=3.05;
  /* main canopy, three bays wide */
  addBox(cx1-cx0+0.5, 0.16, cz1-cz0+0.5, (cx0+cx1)/2, cy, (cz0+cz1)/2, MAT.accent, gSite, {});
  addBox(cx1-cx0+0.3, 0.10, cz1-cz0+0.3, (cx0+cx1)/2, cy+0.11, (cz0+cz1)/2, MAT.fascia, gSite, {});
  /* the west bay's extension, deep enough to cover the pickup */
  var ex0=-9.40, ex1=-6.50, ez0=-11.60, ez1=-9.95;
  addBox(ex1-ex0+0.5, 0.16, ez1-ez0+0.30, (ex0+ex1)/2, cy, (ez0+ez1)/2, MAT.accent, gSite, {});
  addBox(ex1-ex0+0.3, 0.10, ez1-ez0+0.20, (ex0+ex1)/2, cy+0.11, (ez0+ez1)/2, MAT.fascia, gSite, {});
  [[cx0+0.2,cz0+0.2],[cx1-0.2,cz0+0.2],[cx1-0.2,cz1-0.2],[-3.75,cz1-0.2],
   [ex0+0.2,ez1-0.2],[ex1-0.2,ez1-0.2]].forEach(function(p){
    addBox(0.26,cy,0.26,p[0],cy/2,p[1],MAT.accent,gSite,{solid:true});
  });
  [[-7.95,-15.2],[-5.13,-15.2],[-2.45,-15.2],[-7.95,-11.0]].forEach(function(p){
    var m=addCyl(0.09,0.09,0.04,p[0],cy-0.10,p[1],MAT.lamp,gSite,12); m.castShadow=false;
  });
})();

/* ---------- vehicles ----------
   Three different silhouettes instead of one box repeated: a mid-size SUV, a
   low electric saloon and a full-size pickup, each built to the real
   vehicle's published length, width, height, wheelbase and ride height.

   These are massing studies at true size, not licensed models - no badge,
   grille or body pressing is reproduced, and nothing here would be mistaken
   for a manufacturer's own asset. What the drawing actually needs from them
   is the proportion: the pickup really is a metre longer than the SUV and
   the saloon really is 300 mm lower, and that difference is the whole reason
   the carport had to be redesigned around them. */
function wheelPair(g, cx, y, cz, halfTrack, r, w){
  [-1,1].forEach(function(s){
    var t=new T.Mesh(new T.CylinderGeometry(r,r,w,20), MAT.tyre);
    t.rotation.z=Math.PI/2; t.position.set(cx+s*halfTrack, y+r, cz);
    t.castShadow=true; g.add(t);
    var h=new T.Mesh(new T.CylinderGeometry(r*0.58,r*0.58,w+0.02,14), MAT.steel);
    h.rotation.z=Math.PI/2; h.position.set(cx+s*(halfTrack+0.012), y+r, cz); g.add(h);
  });
}
/* Cars are drawn reversed in - nose to the gate - which is both how most
   people park on a Lagos driveway and what puts the front of each vehicle
   where you actually see it from the street view. */
function vehicle(cx,cz,y,kind,mat){
  var g=new T.Group(); gSite.add(g);
  var b=function(w,h,d,x,yy,z,m){
    var q=new T.Mesh(BOXG,m); q.scale.set(w,h,d); q.position.set(x,yy,z);
    q.castShadow=true; q.receiveShadow=true; g.add(q); return q;
  };
  var L,W,gr,rw,hw;
  if(kind==="suv"){
    /* Ford Edge: 4.78 x 1.93 x 1.75 m, 2.85 m wheelbase */
    L=4.78; W=1.93; gr=0.19; rw=0.36; hw=1.425;
    b(W,      0.74, L,      cx, y+gr+0.37, cz, mat);
    b(W-0.06, 0.30, L-0.34, cx, y+gr+1.04, cz, mat);
    b(W-0.17, 0.60, L*0.48, cx, y+gr+1.30, cz-0.12, MAT.carGlass);
    b(W-0.11, 0.13, L*0.44, cx, y+gr+1.62, cz-0.14, mat);
    b(0.07,   0.05, L*0.32, cx-W/2+0.25, y+gr+1.71, cz-0.14, MAT.black);
    b(0.07,   0.05, L*0.32, cx+W/2-0.25, y+gr+1.71, cz-0.14, MAT.black);
  } else if(kind==="sedan"){
    /* BYD Seal: 4.80 x 1.88 x 1.46 m, 2.92 m wheelbase, fastback tail */
    L=4.80; W=1.88; gr=0.14; rw=0.34; hw=1.46;
    b(W,      0.56, L,      cx, y+gr+0.28, cz, mat);
    b(W-0.05, 0.24, L-0.62, cx, y+gr+0.66, cz+0.06, mat);
    b(W-0.19, 0.46, L*0.40, cx, y+gr+0.96, cz+0.14, MAT.carGlass);
    b(W-0.26, 0.08, L*0.26, cx, y+gr+1.20, cz+0.06, mat);
    /* the fastback: a raked pane running off the back of the roof, which is
       the one line that tells this apart from any other saloon */
    var fb=b(W-0.24, 0.05, L*0.30, cx, y+gr+1.08, cz+1.02, MAT.carGlass);
    fb.rotation.x = 0.40;
  } else {
    /* Ford F-150 SuperCrew: 5.89 x 2.03 x 1.99 m, 3.68 m wheelbase */
    L=5.89; W=2.03; gr=0.26; rw=0.40; hw=1.84;
    b(W,      0.80, L,    cx, y+gr+0.40, cz, mat);
    b(W-0.04, 0.48, 2.10, cx, y+gr+1.04, cz-1.08, mat);
    b(W-0.15, 0.58, 1.76, cx, y+gr+1.46, cz-1.05, MAT.carGlass);
    b(W-0.06, 0.13, 1.84, cx, y+gr+1.81, cz-1.05, mat);
    /* the open cargo box - four sides and a floor, so it reads as a load bed
       you could actually put something in rather than a filled-in tail */
    b(W,      0.09, 1.98, cx, y+gr+0.84, cz+1.22, mat);
    b(0.09,   0.54, 1.98, cx-W/2+0.05, y+gr+1.13, cz+1.22, mat);
    b(0.09,   0.54, 1.98, cx+W/2-0.05, y+gr+1.13, cz+1.22, mat);
    b(W,      0.54, 0.09, cx, y+gr+1.13, cz+2.17, mat);
    b(W-0.10, 0.60, 0.09, cx, y+gr+1.16, cz+0.24, mat);
  }
  /* lamps: heads at -z, tails at +z */
  b(0.62,0.15,0.06, cx-W*0.28, y+gr+0.62, cz-L/2+0.02, MAT.white);
  b(0.62,0.15,0.06, cx+W*0.28, y+gr+0.62, cz-L/2+0.02, MAT.white);
  b(0.56,0.13,0.06, cx-W*0.30, y+gr+0.68, cz+L/2-0.02, MAT.bloom1);
  b(0.56,0.13,0.06, cx+W*0.30, y+gr+0.68, cz+L/2-0.02, MAT.bloom1);
  b(W-0.05,0.20,0.16, cx, y+gr+0.28, cz-L/2+0.05, MAT.black);
  b(W-0.05,0.20,0.16, cx, y+gr+0.28, cz+L/2-0.05, MAT.black);
  wheelPair(g, cx, y, cz-hw, W/2-0.11, rw, 0.26);
  wheelPair(g, cx, y, cz+hw, W/2-0.11, rw, 0.26);
  addCollider(cx-W/2-0.05, cx+W/2+0.05, cz-L/2, cz+L/2, 0, y+gr+1.5);
}
var CAR_PEARL = M(0xdfe3e6, {r:0.15, m:0.72, env:2.6});
/* the deep bay takes the pickup; the two standard bays take the other two */
vehicle(-7.95, -13.55, 0, "pickup", MAT.carBody2);
vehicle(-5.13, -14.10, 0, "suv",    MAT.carBody);
vehicle(-2.45, -14.10, 0, "sedan",  CAR_PEARL);

/* ---------- planting ---------- */
/* palm fronds are drooping strips of quads rather than flat planks, which is
   most of the difference between reading as a diagram and reading as a tree */
function frondGeo(len, wid, droop, segs){
  var pos=[], uvs=[];
  for(var i=0;i<segs;i++){
    var t0=i/segs, t1=(i+1)/segs;
    var y0=-droop*t0*t0*len, y1=-droop*t1*t1*len;
    var x0=t0*len, x1=t1*len;
    var w0=wid*Math.sin(Math.PI*Math.min(1,t0*1.15+0.08));
    var w1=wid*Math.sin(Math.PI*Math.min(1,t1*1.15+0.08));
    pos.push(x0,y0,-w0, x1,y1,-w1, x1,y1,w1);
    pos.push(x0,y0,-w0, x1,y1,w1, x0,y0,w0);
    uvs.push(t0,0, t1,0, t1,1, t0,0, t1,1, t0,1);
  }
  var g=new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(pos,3));
  g.setAttribute("uv", new T.Float32BufferAttribute(uvs,2));
  g.computeVertexNormals();
  return g;
}
var FROND = frondGeo(2.05, 0.30, 0.55, 7);
function palm(x,z,h){
  h=h||6.2;
  var lean = (Math.random()-0.5)*0.10;
  for(var s=0;s<7;s++){
    var t=s/7, r0=0.22-0.11*t;
    var m=addCyl(r0*0.94, r0, h/7+0.02, x+lean*t*h*0.16, h*(t+0.5/7), z, MAT.trunk, (PGRP||gSite), 12);
    m.rotation.z = -lean*0.5;
  }
  var top = h+0.05, tx = x+lean*h*0.16;
  for(var i=0;i<13;i++){
    var a=i*(Math.PI*2/13)+Math.random()*0.12, tilt=0.30+(i%4)*0.20;
    var f=new T.Mesh(FROND, MAT.palm);
    f.position.set(tx, top, z);
    f.rotation.y=-a; f.rotation.z=-tilt;
    f.castShadow=true; f.receiveShadow=true;
    (PGRP||gSite).add(f);
  }
  /* the crown shoot, and a ring of coconuts under the fronds */
  canopy(tx, top+0.10, z, 0.30, 0.34, 3, MAT.foliage2, (PGRP||gSite), Math.floor(x*11+z*5)+1);
  for(var c=0;c<5;c++){
    addSphere(0.11, tx+Math.cos(c*1.3)*0.30, top-0.16, z+Math.sin(c*1.3)*0.30, MAT.leaf2, (PGRP||gSite));
  }
  addCollider(x-0.28,x+0.28,z-0.28,z+0.28,0,2.5);
}
/* broadleaf: a trunk, three limbs and a canopy of intersecting leaf cards */
function tree(x,z,s){
  s=s||1;
  addCyl(0.15*s,0.28*s,2.4*s,x,1.20*s,z,MAT.trunk,(PGRP||gSite),12);
  [[0.5,0.7,1.9],[-0.6,0.5,2.1],[0.1,-0.7,2.0]].forEach(function(b){
    var m=addCyl(0.07*s,0.11*s,1.1*s, x+b[0]*0.45*s, b[2]*s, z+b[1]*0.45*s, MAT.trunk, (PGRP||gSite), 8);
    m.rotation.z = -b[0]*0.45; m.rotation.x = b[1]*0.45;
  });
  var seed = Math.floor(Math.abs(Math.sin(x*12.9898+z*78.233))*43758.5453);
  /* Two overlapping canopies rather than one: a big mass, and a smaller one
     offset and turned, which breaks the ellipsoid silhouette that a single
     card cluster still has when you see it against the sky. */
  canopy(x, 3.05*s, z, 1.85*s, 1.30*s, 9, MAT.foliage,  (PGRP||gSite), seed);
  canopy(x + 0.42*s, 3.65*s, z - 0.30*s, 1.15*s, 0.86*s, 6, MAT.foliage2, (PGRP||gSite), seed+37);
  addCollider(x-0.35*s,x+0.35*s,z-0.35*s,z+0.35*s,0,2.4*s);
}
function shrub(x,z,s){
  s=s||1;
  var seed = Math.floor(Math.abs(Math.sin(x*31.7+z*17.3))*9781);
  canopy(x, 0.42*s, z, 0.48*s, 0.40*s, 5, MAT.foliageLo, (PGRP||gSite), seed);
}
function hedgeRun(x0,z0,x1,z1,h){
  h=h||0.85;
  var horiz=Math.abs(z1-z0)<1e-6;
  var len=horiz?Math.abs(x1-x0):Math.abs(z1-z0);
  /* The clipped body stays a box - a hedge really is a box, and it is what
     stops you walking through it. Only the top and the two long faces get
     cards, which is where the eye reads the leaf texture and the soft edge. */
  addBox(horiz?len:0.52, h, horiz?0.52:len, (x0+x1)/2, h/2, (z0+z1)/2, MAT.hedge, (PGRP||gSite), {solid:true});
  var n=Math.max(2,Math.round(len/0.62));
  for(var i=0;i<n;i++){
    var f=(i+0.5)/n;
    var cx = horiz?(x0+(x1-x0)*f):(x0+x1)/2;
    var cz = horiz?(z0+z1)/2:(z0+(z1-z0)*f);
    canopy(cx, h-0.05, cz, 0.36, 0.26, 4, MAT.foliageHi, (PGRP||gSite), i*13+1);
  }
}
function flowerBed(x0,z0,x1,z1){
  var w=Math.abs(x1-x0), d=Math.abs(z1-z0), cx=(x0+x1)/2, cz=(z0+z1)/2;
  addBox(w,0.30,d,cx,0.15,cz,MAT.soil,(PGRP||gSite),{cast:false});
  addBox(w+0.12,0.34,0.12,cx,0.17,cz-d/2,MAT.planter,(PGRP||gSite),{});
  addBox(w+0.12,0.34,0.12,cx,0.17,cz+d/2,MAT.planter,(PGRP||gSite),{});
  addBox(0.12,0.34,d,cx-w/2,0.17,cz,MAT.planter,(PGRP||gSite),{});
  addBox(0.12,0.34,d,cx+w/2,0.17,cz,MAT.planter,(PGRP||gSite),{});
  var cols=[MAT.bloom1,MAT.bloom2,MAT.bloom3,MAT.leaf2];
  var n=Math.max(6,Math.round(w*d*3.0));
  for(var i=0;i<n;i++){
    var px=cx+(Math.random()-0.5)*(w-0.35);
    var pz=cz+(Math.random()-0.5)*(d-0.35);
    canopy(px, 0.40+Math.random()*0.12, pz, 0.20+Math.random()*0.07, 0.17+Math.random()*0.06,
           3, MAT.foliageLo, (PGRP||gSite), i*29+7);
    /* the bloom stays a small solid: a flower head at this size is a blob of
       colour, and a cut-out card would only alias */
    addSphere(0.075+Math.random()*0.055, px+0.06, 0.56+Math.random()*0.14, pz, cols[i%4], (PGRP||gSite));
  }
  addCollider(cx-w/2,cx+w/2,cz-d/2,cz+d/2,0,0.5);
}
function potPlant(x,z,y,g,s){
  s=s||1;
  addCyl(0.24*s,0.19*s,0.44*s,x,y+0.22*s,z,MAT.planter,g,14,{furn:true});
  var pc = canopy(x, y+0.74*s, z, 0.38*s, 0.32*s, 5, MAT.foliageLo, g, Math.floor(x*7+z*13)+3);
  FURN.push(pc);
  addCollider(x-0.3*s,x+0.3*s,z-0.3*s,z+0.3*s,y,y+0.6*s);
}

/* ---------- front garden: planting on the edges, the lawn left open ---------- */
palm(8.55,-15.90,5.4); palm(6.60,-16.15,6.0);
flowerBed(1.40,-16.35,4.60,-15.70);
/* low shrubs, not a hedge, between the drive and the walk: a hedge here reads
   well in plan but stands in the 1.2 m walkway once you are actually on it */
[-15.90,-14.60,-13.30,-12.00].forEach(function(z){ shrub(-1.62,z,0.85); });
hedgeRun(0.60,-11.30,7.40,-11.30,0.7);
palm(9.00,-12.90,5.2);
shrub(2.10,-12.20); shrub(3.40,-15.10); shrub(5.30,-12.60);

/* water feature, tucked into the corner clear of the lawn */
(function(){
  var x=8.35, z=-14.35;
  addCyl(1.20,1.30,0.55,x,0.27,z,MAT.stone,gSite,28);
  addCyl(1.04,1.04,0.10,x,0.52,z,MAT.water,gSite,28);
  addCyl(0.24,0.32,0.85,x,0.42,z,MAT.stone,gSite,18);
  addCyl(0.46,0.10,0.16,x,0.92,z,MAT.water,gSite,18);
  addCollider(x-1.4,x+1.4,z-1.4,z+1.4,0,0.6);
})();

/* ---------- side yards ---------- */
hedgeRun(-9.35,-10.60,-9.35,13.60,0.9);
hedgeRun( 9.35,-10.60, 9.35,13.60,0.9);
[-6.0,-1.0,4.0,9.0].forEach(function(z){ potPlant(-9.50,z,0,gSite,1.05); });

/* ---------- rear garden: one clear lawn, everything on the perimeter ---------- */
palm(-8.90,0.60,6.4);
palm(-8.85,12.40,5.8);

shrub(7.30,2.40); shrub(7.30,5.60); shrub(-8.60,9.40);

/* rear terrace furniture, hard against the house */
diningSet(1.80,2.90,0.02,6,0,gSite);
(function(){ // parasol
  addCyl(0.05,0.05,2.35,1.80,1.20,2.90,MAT.steel,gSite,12);
  var c=new T.Mesh(new T.ConeGeometry(1.65,0.55,12), MAT.linen);
  c.position.set(1.80,2.55,2.90); c.castShadow=true; c.receiveShadow=true; gSite.add(c);
})();
/* barbecue against the house wall, clear of the rear door */
addBox(1.20,0.90,0.60,4.10,0.45,2.20,MAT.counter,gSite,{solid:true});
addBox(1.26,0.06,0.66,4.10,0.93,2.20,MAT.steel,gSite,{});


/* ---------- utility yard along the rear wall ---------- */
(function(){
  /* generator house, backed onto the rear wall */
  addBox(2.60,2.35,1.40, -4.90, 1.175, 15.80, MAT.wallExt, gSite, {solid:true});
  hipRoof(-6.20,15.10,-3.60,16.50, 2.35, 0.50, 0.28, MAT.roof, gSite);
  addBox(1.10,0.55,0.06, -4.90, 1.35, 15.09, MAT.steel, gSite, {});
  /* overhead water tanks on a stand */
  var tx=1.80, tz=15.85;
  [[-0.85,-0.50],[0.85,-0.50],[-0.85,0.50],[0.85,0.50]].forEach(function(p){
    addBox(0.14,3.20,0.14, tx+p[0], 1.60, tz+p[1], MAT.steel, gSite, {solid:true});
  });
  addBox(2.10,0.12,1.40, tx, 3.25, tz, MAT.steel, gSite, {});
  addCyl(0.72,0.72,1.35, tx-0.02, 4.00, tz, M(0x2f5f8f,{r:0.45,m:0.10,env:1.4}), gSite, 22);
  addCyl(0.78,0.78,0.10, tx-0.02, 4.72, tz, M(0x24476b,{r:0.45,m:0.10}), gSite, 22);
  /* septic / soakaway covers - moved to the east strip, clear of the court */
  addBox(1.40,0.10,1.40, 8.40, 0.05, 15.60, MAT.paver, gSite, {cast:false});
  addBox(1.10,0.10,1.10, 8.45, 0.05, 13.60, MAT.paver, gSite, {cast:false});
  /* drying line, tucked against the rear wall */
  addCyl(0.06,0.06,2.0,-1.40,1.0,15.30,MAT.steel,gSite,10);
  addCyl(0.06,0.06,2.0,-1.40,1.0,16.50,MAT.steel,gSite,10);
  addBox(0.03,0.03,1.2,-1.40,1.95,15.90,MAT.white,gSite,{cast:false});
})();

/* ---------- the solar array is added with the court, on the main roof ---------- */
