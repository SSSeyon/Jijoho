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

/* driveway + carport apron - three bays 6.50 m deep, cars reversed in (54 sqm) */
surf(-9.475,-16.60,-1.15,-10.00, MAT.paver, 0.02);
[-6.50,-3.75].forEach(function(x){ addBox(0.09,0.02,6.1,x,0.04,-13.35,MAT.white,gSite,{cast:false}); });

/* entrance walkway, 1.2 m wide, pedestrian gate straight to the porch (8.5 sqm) */
surf(-1.05,-16.60,0.15,-9.44, MAT.paverWarm, 0.02);
surf(-1.05,-10.20, 2.30,-9.44, MAT.paverWarm, 0.02);

/* east service path, 1.1 m - the only run a bin or a jerrycan needs  (28 sqm) */
surf( 7.95,-9.40, 9.05,14.20, MAT.paver, 0.02);

/* west side: stepping stones set into the lawn instead of a slab path (3 sqm) */
for(var sz=-7.00; sz<=5.60; sz+=0.78){
  addBox(0.55,0.07,0.55, -7.90, 0.015, sz, MAT.paverWarm, gSite, {cast:false});
}

/* rear terrace - now entirely under the upper floor cantilever, so it is a
   covered outdoor room rather than an exposed apron  (17 sqm) */
surf(-1.20,4.26,5.60,6.66, MAT.paverWarm, 0.02);


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

/* ---------- vehicle gate: two leaves, hinged, opening outward ----------
   It used to be a sliding gate frozen half-open, which was a cheat - a 4.5 m
   sliding leaf needs 4.5 m of fence to park against and this frontage does
   not have it on either side of the opening.

   Two swing leaves hinged on the pillars solve that and are what most
   compounds on this axis actually have. They open OUTWARD, onto the street,
   because inward-swinging leaves would sweep straight through the parked
   cars - the front bumpers stand 460 mm inside the gate line. */
var GATE = (function(){
  var gx0=-8.60, gx1=-4.10, w=(gx1-gx0)/2;   /* two leaves of 2.25 m */
  function leaf(hingeX, dir){
    var g = new T.Group();
    g.userData.noMerge = true;
    g.position.set(hingeX, 0, Z0);
    gSite.add(g);
    /* built from the hinge outwards, so rotating the group swings it true */
    var m = dir * w/2;
    addBox(w, 0.16, 0.10, m, 2.32, 0, MAT.gate, g, {});
    addBox(w, 0.16, 0.10, m, 0.14, 0, MAT.gate, g, {});
    var n = Math.round(w/0.19);
    for(var i=0;i<n;i++){
      addBox(0.10, 2.22, 0.09, dir*(0.10 + i*0.19), 1.22, 0, MAT.gate, g, {});
    }
    return g;
  }
  var L = leaf(gx0, 1), R = leaf(gx1, -1);
  /* one collider spanning the closed opening, switched off while open */
  var col = addCollider(gx0-0.1, gx1+0.1, Z0-0.12, Z0+0.12, 0, 2.4);
  return {
    left:L, right:R, col:col,
    open:false,          /* target state */
    t:0,                 /* 0 closed .. 1 fully open */
    x0:gx0, x1:gx1
  };
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
/* One clean rectangle now, 8.25 x 6.50 m. The old L-shaped plan with a deeper
   west bay was a workaround for a front yard that was simply too short; with
   the house moved back the whole apron is deep enough for the pickup and the
   canopy can be the simple slab it should always have been. */
(function(){
  var cx0=-9.40, cx1=-1.15, cz0=-16.50, cz1=-10.00;
  var cy=3.05;
  addBox(cx1-cx0+0.5, 0.16, cz1-cz0+0.5, (cx0+cx1)/2, cy, (cz0+cz1)/2, MAT.accent, gSite, {});
  addBox(cx1-cx0+0.3, 0.10, cz1-cz0+0.3, (cx0+cx1)/2, cy+0.11, (cz0+cz1)/2, MAT.fascia, gSite, {});
  [[cx0+0.2,cz0+0.2],[cx1-0.2,cz0+0.2],[cx0+0.2,cz1-0.2],[cx1-0.2,cz1-0.2],
   [-5.28,cz1-0.2]].forEach(function(p){
    addBox(0.26,cy,0.26,p[0],cy/2,p[1],MAT.accent,gSite,{solid:true});
  });
  [[-7.95,-15.4],[-5.28,-15.4],[-2.60,-15.4],[-5.28,-11.4]].forEach(function(p){
    var m=addCyl(0.09,0.09,0.04,p[0],cy-0.10,p[1],MAT.lamp,gSite,12); m.castShadow=false;
  });
})();

/* ---------- vehicles ----------
   Real downloaded models now, not the box silhouettes that stood in for them.
   Each .glb arrives at whatever scale and facing its author happened to use,
   so every one is normalised the same way: measure the loaded bounding box,
   scale it uniformly until its LENGTH matches the real vehicle's published
   length, then sit it on the ground and centre it on its bay.

   Scaling on length rather than a fixed factor is deliberate. It means a
   model that arrives in centimetres, inches or arbitrary units all end up
   right, and it guarantees the thing you measure off the drawing - can this
   vehicle actually fits between the gate and the balcony - stays true even if a
   model is later swapped for a different one. */
var VEHICLES = [];                       /* populated as the models arrive */
/* Marked noMerge explicitly. The cars currently escape the static merge only
   because they load asynchronously and arrive after mergeStatics() has already
   run - which is true today and would stop being true the moment anything
   caches them or the merge is deferred. Saying so out loud costs nothing and
   removes a trap. */
var gCars = new T.Group(); gCars.userData.noMerge = true; gSite.add(gCars);

/* bay centres and the real length each vehicle is normalised to */
var CAR_SPECS = [
  { file:"truck.glb",     x:-7.95, len:5.89, name:"Ford F-150" },
  { file:"suv.glb",       x:-5.28, len:4.78, name:"SUV" },
  { file:"car-hatch.glb", x:-2.60, len:4.34, name:"Hyundai i30 N" }
];
/* Parked nose-to-gate. PARK_NOSE is where the front bumper sits; the car is
   placed so its own nose lands there whatever its length. */
var PARK_NOSE = -16.25;
var GATE_Z    = Z0;
var STREET_Z  = Z0 - 4.55;               /* the near lane, clear of the kerb */

function normaliseVehicle(root, targetLen){
  /* Strip baked contact-shadow planes before anything else. Several of these
     models ship a flat dark quad under the car to fake a shadow for renderers
     that have none. Here it does three bad things at once: it z-fights with
     the driveway, it double-darkens under a car that is already casting a
     real shadow, and - because it is wider and longer than the car itself -
     it silently poisons the bounding box the scaling is measured from. The
     SUV's was 2.50 m wide against a body of 1.77 m. */
  var kill = [];
  root.traverse(function(o){
    if(o.isMesh && /shadow/i.test(o.name || "")) kill.push(o);
  });
  for(var i=0;i<kill.length;i++) if(kill[i].parent) kill[i].parent.remove(kill[i]);

  /* uniform scale so the long axis matches the real vehicle */
  var b = new T.Box3().setFromObject(root);
  var s = b.getSize(new T.Vector3());
  var k = targetLen / Math.max(s.z, 1e-6);
  root.scale.setScalar(k);
  /* re-measure after scaling and drop it onto the ground, centred on x */
  b = new T.Box3().setFromObject(root);
  var c = b.getCenter(new T.Vector3());
  root.position.x -= c.x;
  root.position.y -= b.min.y;
  root.position.z -= c.z;
  b = new T.Box3().setFromObject(root);
  return { len: b.max.z - b.min.z, wid: b.max.x - b.min.x, hgt: b.max.y - b.min.y };
}

CAR_SPECS.forEach(function(spec, i){
  MODELS.load(spec.file, function(gltf){
    var pivot = new T.Group();           /* pivot is what we drive around */
    var root  = gltf.scene;
    pivot.add(root);
    var dim = normaliseVehicle(root, spec.len);
    /* nose at PARK_NOSE means the centre sits half a length behind it */
    var parkZ = PARK_NOSE + dim.len/2;
    pivot.position.set(spec.x, 0, parkZ);
    gCars.add(pivot);
    root.traverse(function(o){
      if(o.isMesh){ o.castShadow = true; o.receiveShadow = true; }
    });
    VEHICLES.push({
      pivot: pivot, name: spec.name, dim: dim,
      home: new T.Vector3(spec.x, 0, parkZ),
      /* they pull out and turn east along the road, spaced so three cars out
         at once do not stack on top of each other */
      away: new T.Vector3(2.5 + i*5.0, 0, STREET_Z),
      out: false, t: 0, moving: false
    });
    /* a collider only while it is parked; cleared the moment it drives off so
       you are not walking into a car that is no longer there */
    VEHICLES[VEHICLES.length-1].col =
      addCollider(spec.x - dim.wid/2, spec.x + dim.wid/2, parkZ - dim.len/2, parkZ + dim.len/2, 0, dim.hgt);
  });
});

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
/* ---------- coconut palm ----------
   A real model now. Every call is queued against the loaded .glb and cloned
   from it, so all fourteen palms share one geometry and one material pair -
   fourteen draw calls total rather than fourteen imports.

   Each is scaled to the height asked for, spun to a different heading and
   given a slight lean, because a row of identical palms at identical
   rotations is the single most obvious tell that planting was placed by a
   loop rather than by a gardener. */
var PALM_QUEUE = [], PALM_SRC = null;
MODELS.load("palm.glb", function(gltf){
  PALM_SRC = gltf.scene;
  /* measure once; every clone reuses the factor */
  var b = new T.Box3().setFromObject(PALM_SRC);
  PALM_SRC.userData.unitH = Math.max(b.max.y - b.min.y, 1e-6);
  PALM_SRC.userData.baseY = b.min.y;
  PALM_SRC.traverse(function(o){
    if(o.isMesh){ o.castShadow = true; o.receiveShadow = true; }
  });
  for(var i=0;i<PALM_QUEUE.length;i++) placePalm(PALM_QUEUE[i]);
  PALM_QUEUE.length = 0;
});
function placePalm(p){
  var m = PALM_SRC.clone(true);
  var k = p.h / PALM_SRC.userData.unitH;
  m.scale.setScalar(k);
  m.position.set(p.x, -PALM_SRC.userData.baseY * k, p.z);
  m.rotation.y = p.rot;
  m.rotation.z = p.lean;
  var g = new T.Group();
  g.userData.noMerge = true;
  g.add(m);
  (p.grp || gSite).add(g);
}
function palm(x,z,h){
  h = h || 6.2;
  var seed = Math.abs(Math.sin(x*12.9898 + z*78.233) * 43758.5453);
  var p = {
    x:x, z:z, h:h,
    rot:  (seed % 1) * Math.PI * 2,
    lean: ((seed*7) % 1 - 0.5) * 0.09,
    grp:  (PGRP || gSite)
  };
  if(PALM_SRC) placePalm(p); else PALM_QUEUE.push(p);
  addCollider(x-0.28, x+0.28, z-0.28, z+0.28, 0, 2.5);
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

/* Rear terrace furniture. It moved north with the house and with the terrace
   itself, which now sits at z 4.26..6.66 - entirely under the upper floor's
   rear cantilever. The parasol that used to stand here has gone: there is a
   2.40 m concrete soffit over this ground now, and a parasol under a roof is
   just a thing to walk into. */
diningSet(0.90,5.45,0.02,6,0,gSite);
/* barbecue against the house wall, clear of the rear door */
addBox(1.20,0.90,0.60,4.80,0.45,4.78,MAT.counter,gSite,{solid:true});
addBox(1.26,0.06,0.66,4.80,0.93,4.78,MAT.steel,gSite,{});


/* ---------- utility yard along the rear wall ---------- */
(function(){
  /* generator house, backed onto the rear wall */
  addBox(2.60,2.35,1.40, -4.90, 1.175, 15.80, MAT.wallExt, gSite, {solid:true});
  hipRoof(-6.20,15.10,-3.60,16.50, 2.35, 0.50, 0.28, MAT.roof, gSite);
  addBox(1.10,0.55,0.06, -4.90, 1.35, 15.09, MAT.steel, gSite, {});
  /* The overhead tanks used to stand here on a 3.2 m steel tower. They are on
     the roof now - see part 5 - which is both the better place for them and
     one less structure cluttering a 1.4 m service strip. */
  /* septic / soakaway covers - moved to the east strip, clear of the court */
  addBox(1.40,0.10,1.40, 8.40, 0.05, 15.60, MAT.paver, gSite, {cast:false});
  addBox(1.10,0.10,1.10, 8.45, 0.05, 13.60, MAT.paver, gSite, {cast:false});
  /* drying line, tucked against the rear wall */
  addCyl(0.06,0.06,2.0,-1.40,1.0,15.30,MAT.steel,gSite,10);
  addCyl(0.06,0.06,2.0,-1.40,1.0,16.50,MAT.steel,gSite,10);
  addBox(0.03,0.03,1.2,-1.40,1.95,15.90,MAT.white,gSite,{cast:false});
})();

/* ---------- the solar array is added with the court, on the main roof ---------- */
