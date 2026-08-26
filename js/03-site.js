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
[-6.32,-3.81].forEach(function(x){ addBox(0.09,0.02,6.1,x,0.04,-13.35,MAT.white,gSite,{cast:false}); });

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

/* ---------- carport ----------
   Now a cantilever off the boundary wall rather than a table on five legs.

   The five posts it used to stand on included three along the house side, and
   those three were the problem: they stood directly in the path a car takes
   swinging out of its bay towards the gate. Taking them out is not just tidier,
   it is what makes the manoeuvre in updateCars() honest.

   So the canopy is carried entirely from the front. The two posts that remain
   are hard against the boundary wall at cz0, where they act as the wall's own
   piers, and the deck runs 6.50 m back off them into the compound with nothing
   underneath it.

   That is a real 6.5 m cantilever, which is a serious piece of engineering: it
   wants a steel frame with the beams tailed back into the wall and a proper
   counterweight, not the flat concrete slab this is drawn as. Structurally the
   honest way to build it is tapered steel cantilever beams at 2.75 m centres
   off a reinforced pier in the wall - deeper at the wall, thinner at the tip -
   which is what the taper below is standing in for. It is drawn thicker at the
   root and thinner at the free end for exactly that reason. */
(function(){
  var cx0=-9.40, cx1=-1.15, cz0=-16.50, cz1=-10.00;
  var cy=3.05, w=cx1-cx0, d=cz1-cz0;

  /* three tapered beams, root to tip. Each is a box tilted a fraction of a
     degree so the underside falls away from the wall - the taper is what stops
     a 6.5 m overhang reading as a floating slab. */
  /* The canopy - beams, deck, fascias and the lights slung under it - lives in
     gRoofSite, so "Roof off" takes the carport's lid off along with the
     house's. The two piers below stay: they are the wall's own structure and
     what is left standing tells you where the canopy was. */
  [cx0+0.55, (cx0+cx1)/2, cx1-0.55].forEach(function(bx){
    var b = addBox(0.22, 0.44, d+0.30, bx, cy-0.20, (cz0+cz1)/2, MAT.accent, gRoofSite, {});
    b.rotation.x = -0.019;                    /* ~35 mm of fall over 6.5 m */
  });
  /* the deck itself, thin because the beams carry it */
  addBox(w+0.5, 0.09, d+0.5, (cx0+cx1)/2, cy+0.06, (cz0+cz1)/2, MAT.accent, gRoofSite, {});
  addBox(w+0.3, 0.07, d+0.3, (cx0+cx1)/2, cy+0.14, (cz0+cz1)/2, MAT.fascia, gRoofSite, {});
  /* a deeper fascia at the free end - the tip of a cantilever is where the eye
     looks for reassurance, and a blade edge there looks wrong */
  addBox(w+0.5, 0.26, 0.10, (cx0+cx1)/2, cy-0.03, cz1+0.25, MAT.fascia, gRoofSite, {});

  /* the two piers, in the plane of the boundary wall */
  [cx0+0.2, cx1-0.2].forEach(function(px){
    addBox(0.30,cy,0.30,px,cy/2,cz0+0.15,MAT.accent,gSite,{solid:true});
  });

  /* lights under the deck, one over each bay plus one at the open end so you
     are not reversing into a dark hole */
  [[-7.76,-15.4],[-5.07,-15.4],[-2.58,-15.4],[-5.07,-11.0]].forEach(function(p){
    var m=addCyl(0.09,0.09,0.04,p[0],cy-0.44,p[1],MAT.lamp,gRoofSite,12); m.castShadow=false;
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
/* Bay centres, re-spaced after the headlight-glow fix.

   Stripping the glow meshes changed these numbers, because the truck had been
   scaled off its light beam rather than its body and was coming out 24% under
   size. At its true length the F-150 measures 2.48 m across the mirrors, and
   the three vehicles together take 6.65 m of the 8.25 m apron.

   The old centres were evenly spaced at 2.67 m, which was fine for a truck
   that was secretly too small and left only 210 mm between the real one and
   the west edge of the apron. These centres divide the 1.60 m of slack into
   four equal 400 mm gaps instead - two between vehicles and one at each end.
   400 mm is not generous. It is enough to walk down and enough to open a door
   part way, and it is what a three-car bay on a 19.55 m frontage actually
   gives you. Two vehicles here would be comfortable; three is deliberate. */
var CAR_SPECS = [
  { file:"truck.glb",     x:-7.76, len:5.89, name:"Ford F-150" },
  { file:"suv.glb",       x:-5.07, len:4.78, name:"SUV" },
  { file:"car-hatch.glb", x:-2.58, len:4.34, name:"Hyundai i30 N" }
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
  /* Strip the baked light "glows" for the same reasons, plus one worse one.

     Two of the three models carry meshes named lights_*_glows_*: flat fans of
     geometry projecting out of the headlights and tail lights to fake a beam.
     They are authored for an unlit renderer, so under this scene's PBR
     materials they get no emission and render as solid black wedges hanging
     off the front of the car. That is the black projection you can see from
     the headlights.

     The scaling damage is the bigger problem. The truck's beams run 6.20 m
     nose to tail against a body of 4.80 m, so "scale until the long axis is
     5.89 m" was sizing the BEAM to 5.89 m and leaving the actual F-150 at
     4.50 m - a quarter under size. The hatchback was 21% under for the same
     reason. Both come out right once the glows are gone, which also means the
     carport clearances measured off them are only now true.

     The lens glass itself is a separate mesh (glasses_*) and stays. */
  var kill = [];
  root.traverse(function(o){
    if(o.isMesh && /shadow|glow/i.test(o.name || "")) kill.push(o);
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
  /* clone(true) deep-copies userData, so every palm placed from this
     prototype carries the flag and folds into the second merge pass */
  PALM_SRC.userData.flatten = true;
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
  /* Added straight into the site group, not into a noMerge wrapper. The
     wrapper was there because the palms arrive after the first merge pass and
     merging them then would have been merging a moving target; there is a
     second pass now that runs once every model is in, so they can and should
     be folded in with everything else. */
  (p.grp || gSite).add(m);
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
/* ---------- broadleaf trees and bushes, from downloaded models ----------
   The alpha-card canopies these replace were a good trick and looked fine at
   distance, but they were still clusters of intersecting quads: walk up to one
   and the illusion falls apart, because there is no branch structure behind
   the leaves. These are real meshes with bark and boughs.

   Two prototypes come out of trees.glb - the file contains two different
   trees, one tall and open and one shorter and rounder - and one out of
   bush.glb. Everything is cloned from those three, so the whole planting
   scheme costs three imports no matter how many plants are placed.

   Note these are NOT wrapped in noMerge groups the way the palms are. Clones
   of one prototype share geometry layout and material, so mergeStatics() folds
   every bush in the compound into a single draw call and each tree species
   into two. That is the difference between roughly 90 extra draw calls and
   about six. The palms stay unmerged only because they are placed from a
   queue that can still be filling when the merge runs. */
var PLANT_SRC = {};              /* name -> prepared prototype Group */
var PLANT_QUEUE = [];            /* placements waiting for their model */

function preparePlant(node){
  /* Lift the node out of its file's transform stack, then measure it so every
     later clone can be scaled to a height in metres rather than to whatever
     unit the author happened to model in. */
  node.position.set(0,0,0);
  var wrap = new T.Group();
  wrap.add(node);
  wrap.updateMatrixWorld(true);
  node.traverse(function(o){
    if(!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    var m = o.material;
    if(m){
      /* Leaf cards arrive as alpha-blended in some exports, which both sorts
         badly against itself and blocks the merge. Alpha-test instead: it is
         what foliage wants anyway, and it keeps the material opaque. */
      if(m.transparent){ m.transparent = false; m.alphaTest = Math.max(m.alphaTest||0, 0.45); }
      m.side = T.DoubleSide;
    }
  });
  var b = new T.Box3().setFromObject(wrap);
  wrap.userData.flatten = true;
  wrap.userData.h  = Math.max(b.max.y - b.min.y, 1e-6);
  wrap.userData.y0 = b.min.y;
  wrap.userData.cx = (b.min.x + b.max.x)/2;
  wrap.userData.cz = (b.min.z + b.max.z)/2;
  wrap.userData.rad = Math.max(b.max.x-b.min.x, b.max.z-b.min.z)/2;
  return wrap;
}
MODELS.load("trees.glb", function(gltf){
  gltf.scene.updateMatrixWorld(true);
  /* The two tree models are baked much lighter and yellower than everything
     else planted here: sampling their leaf maps gives an average of #84983a
     against the bush's #4a5d15. Side by side the trees read as a different,
     slightly sickly species rather than as the same garden, and at small sizes
     the pale canopy on a bare pale stem reads as dead.
     Tinting is the right lever rather than swapping the texture: multiplying
     through material.color keeps every leaf's own variation and only moves the
     overall cast. The factors below land the leaves at about #53661b - a shade
     lighter than the bushes, which is what a tree should be - and take the
     bark from grey #776e6e to a brown that does not flare white in sunlight. */
  ["tree4","tree6"].forEach(function(nm){
    var n = gltf.scene.getObjectByName(nm);
    if(n) PLANT_SRC[nm] = preparePlant(n.clone(true));
  });
  ["tree4","tree6"].forEach(function(nm){
    if(!PLANT_SRC[nm]) return;
    PLANT_SRC[nm].traverse(function(o){
      if(!o.isMesh || !o.material) return;
      var nmm = (o.material.name||"").toLowerCase();
      if(nmm.indexOf("leaf") >= 0 || nmm.indexOf("leaves") >= 0) o.material.color.setHex(0xa0ab75);
      else if(nmm.indexOf("bark") >= 0 || nmm.indexOf("trunk") >= 0) o.material.color.setHex(0xc9b6a4);
    });
  });
  flushPlants();
});
MODELS.load("bush.glb", function(gltf){
  gltf.scene.updateMatrixWorld(true);
  PLANT_SRC.bush = preparePlant(gltf.scene.clone(true));
  flushPlants();
});
function flushPlants(){
  var left = [];
  for(var i=0;i<PLANT_QUEUE.length;i++){
    if(PLANT_SRC[PLANT_QUEUE[i].k]) placePlant(PLANT_QUEUE[i]); else left.push(PLANT_QUEUE[i]);
  }
  PLANT_QUEUE = left;
}
function placePlant(p){
  var src = PLANT_SRC[p.k];
  var u = src.userData;
  var k = p.h / u.h;
  var m = src.clone(true);
  /* There is one bush mesh in the file, so a bed of sixteen is the same
     silhouette sixteen times and the eye picks that up immediately. Heading
     alone does not break it up, because the bush is close to round in plan.
     A little independent width and a degree or two of lean does, and costs
     nothing: it is the same geometry with a different matrix. */
  m.scale.set(k*(p.wx||1), k, k*(p.wz||1));
  m.position.set(p.x - u.cx*k*(p.wx||1), (p.y||0) - u.y0*k, p.z - u.cz*k*(p.wz||1));
  m.rotation.set(p.tlt?p.tlt[0]:0, p.rot, p.tlt?p.tlt[1]:0);
  (p.grp || gSite).add(m);
}
function plant(kind, x, z, h, grp, y, o){
  /* one hash, reused for species pick and heading, so a plant at a given spot
     always comes out the same way round however often the page is reloaded */
  o = o||{};
  var seed = Math.abs(Math.sin(x*12.9898 + z*78.233) * 43758.5453);
  var p = { k:kind, x:x, z:z, h:h, y:y||0, rot:(seed % 1)*Math.PI*2, grp:grp || (PGRP||gSite),
            wx:o.wx, wz:o.wz, tlt:o.tlt };
  if(PLANT_SRC[kind]) placePlant(p); else PLANT_QUEUE.push(p);
  return seed;
}
function tree(x,z,s){
  s = s||1;
  var seed = Math.abs(Math.sin(x*4.117 + z*9.733) * 2381.19);
  /* alternate the two species so a row of trees is not a row of one tree */
  var kind = ((seed*13) % 1) < 0.5 ? "tree4" : "tree6";
  plant(kind, x, z, 5.2*s);
  addCollider(x-0.32*s, x+0.32*s, z-0.32*s, z+0.32*s, 0, 2.4*s);
}
function shrub(x,z,s){
  s = s||1;
  plant("bush", x, z, 0.86*s);
}
/* ---------- hedge ----------
   The clipped body stays a solid box, because a hedge really is a box and it
   is what stops you walking through it. What has changed is the surface: the
   alpha cards along the top have become real bushes, packed tightly enough
   along the run to close up into a continuous mass, with the box shrunk to sit
   just inside them so it never shows through. */
function hedgeRun(x0,z0,x1,z1,h){
  h = h||0.85;
  var horiz = Math.abs(z1-z0)<1e-6;
  var len = horiz?Math.abs(x1-x0):Math.abs(z1-z0);
  /* The box carries almost the full height. The bushes are NOT scaled to the
     hedge height - that was the first attempt and it was wrong twice over: a
     0.90 m tall bush is 1.11 m WIDE, so a 0.52 m hedge came out bulging more
     than a metre across, and at that size they cost a fortune in triangles.
     They are placed at their own natural size instead, straddling the top of
     the box, which is where the eye reads the soft edge and the leaf texture.
     Everything below that line is a clipped face and a box is a perfectly good
     clipped face. */
  var body = h*0.80;
  addBox(horiz?len:0.44, body, horiz?0.44:len, (x0+x1)/2, body/2, (z0+z1)/2,
         MAT.hedge, (PGRP||gSite), {solid:true});
  /* Spacing matters more than it looks. At 0.40 m the two 24 m boundary runs
     alone came to 121 bushes and the bush mesh reached 56,000 triangles - more
     than a third of the whole model - for a hedge you mostly see edge on. */
  var top = h*0.55;                     /* bush height: about a real one */
  var n = Math.max(2, Math.round(len/0.78));
  for(var i=0;i<n;i++){
    var f = (i+0.5)/n;
    var cx = horiz?(x0+(x1-x0)*f):(x0+x1)/2;
    var cz = horiz?(z0+z1)/2:(z0+(z1-z0)*f);
    /* a little height jitter, because a hedge clipped by hand is never flat */
    plant("bush", cx, cz, top*(0.94 + ((i*37)%6)/40), null, body - top*0.42);
  }
}
/* ---------- flower bed ----------
   Rebuilt on the same bush model the hedges use, so a bed reads as the same
   planting as the rest of the compound instead of the alpha-card clumps it was
   made of. Four things do the work:
     - a kerb in two courses, a body and a capping that oversails it, so the
       edge is a built thing rather than four thin boxes standing in the soil
     - the soil set down below that capping, which is what a filled bed looks
       like from standing height; the old one was flush and read as a painted
       rectangle
     - the planting graded, tallest along the spine and dropping toward the
       kerb, so the mass mounds; and graded only on axes deep enough to have
       more than one rank, so a 650 mm strip stays an even run
     - the flower heads carried ON the plants in small clusters, not floating
       between them, and mostly one colour to a bed
   Layout is seeded off the bed's own corners. The old version dealt itself a
   new arrangement from Math.random() on every reload, so the garden was never
   twice the same and nothing about it could be checked against a screenshot. */
function flowerBed(x0,z0,x1,z1){
  var w=Math.abs(x1-x0), d=Math.abs(z1-z0), cx=(x0+x1)/2, cz=(z0+z1)/2;
  var G = (PGRP||gSite);
  var r = PRNG(Math.round((x0*137.7 + z0*911.3 + w*57.1 + d*23.9)*16) + 7);

  /* ---- kerb ---- */
  var KB=0.14, kerbH=0.30, capH=0.07, capO=0.035;
  [[w+KB*2, KB, cx, cz-d/2-KB/2],
   [w+KB*2, KB, cx, cz+d/2+KB/2],
   [KB, d, cx-w/2-KB/2, cz],
   [KB, d, cx+w/2+KB/2, cz]].forEach(function(q){
    addBox(q[0], kerbH, q[1], q[2], kerbH/2, q[3], MAT.planter, G, {});
    addBox(q[0]+capO*2, capH, q[1]+capO*2, q[2], kerbH+capH/2, q[3], MAT.stone, G, {});
  });

  /* soil sits ~110 mm down inside the kerb, not level with the top of it */
  var soil = kerbH - 0.04;
  addBox(w, soil, d, cx, soil/2, cz, MAT.soil, G, {cast:false});

  /* ---- planting ---- */
  var SP=0.50;                                   /* a 0.45 m bush is ~0.55 wide */
  var nx=Math.max(1,Math.round(w/SP)), nz=Math.max(1,Math.round(d/SP));
  var sx=w/nx, sz=d/nz;
  /* one colour carries the bed and a second appears in about a fifth of the
     plants. Three at once, which is what the old bed did, reads as confetti. */
  var cols=[MAT.bloom1,MAT.bloom2,MAT.bloom3];
  var mi=Math.floor(r()*3), main=cols[mi], alt=cols[(mi+1+Math.floor(r()*2))%3];

  for(var ix=0; ix<nx; ix++) for(var iz=0; iz<nz; iz++){
    var px = cx - w/2 + (ix+0.5)*sx + (r()-0.5)*sx*0.34;
    var pz = cz - d/2 + (iz+0.5)*sz + (r()-0.5)*sz*0.34;
    /* 0 on the spine, 1 at the kerb - but only on an axis with ranks to grade */
    var u = Math.max(nx>1 ? Math.abs(px-cx)/(w/2) : 0,
                     nz>1 ? Math.abs(pz-cz)/(d/2) : 0);
    var h = 0.50 * (1 - 0.42*u*u) * (0.90 + r()*0.22);
    /* Let the outer rank sit over the kerb. Planting held strictly inside the
       rectangle gives a ruled line where the soil meets the stone, which is
       the one thing that still said "box of shrubs" rather than "bed". */
    if(nx>1 && (ix===0 || ix===nx-1)) px += (ix?1:-1)*(0.05 + r()*0.05);
    if(nz>1 && (iz===0 || iz===nz-1)) pz += (iz?1:-1)*(0.05 + r()*0.05);
    /* set into the soil rather than balanced on it */
    plant("bush", px, pz, h, G, soil - h*0.10,
          { wx:0.86+r()*0.30, wz:0.86+r()*0.30, tlt:[(r()-0.5)*0.13, (r()-0.5)*0.13] });

    /* Flower heads: 50-85 mm across, several to a plant, sitting DOWN in the
       upper half of the foliage. The first attempt put two or three 150 mm
       balls on top of the crown and they read as fruit hanging over the bush,
       which is exactly what these beds looked like before. A flower head is
       small and there are a lot of them; that is the whole difference. */
    if(r() < 0.75){
      var nb = 3 + Math.floor(r()*3);
      var bm = r()<0.80 ? main : alt;
      for(var b=0;b<nb;b++){
        var a=r()*Math.PI*2, rr=h*(0.10 + r()*0.28);
        var fh = addSphere(0.026 + r()*0.016,
                  px+Math.cos(a)*rr, soil + h*(0.55 + r()*0.25), pz+Math.sin(a)*rr,
                  bm, G, {seg:7});
        /* squashed, because a flower head is a disc of petals seen from above
           and a true sphere at this size reads as a berry */
        fh.scale.y = 0.58 + r()*0.18;
      }
    }
  }

  /* One accent plant standing above the mass, where the bed is deep enough to
     carry it. A bed of one species at one height is a block of green.
     This is the bush again at roughly twice the height of its neighbours, NOT
     one of the tree models: tried both of those at 1.2 m and they read as
     lollipops - a pale canopy on a bare stem, several shades lighter than the
     bush foliage they were meant to rise out of. They look right at 5 m and
     wrong at 1.2 m. Skipped on the 650 mm front strip. */
  if(Math.min(w,d) >= 1.0){
    var sxp = cx + (r()-0.5)*w*0.36, szp = cz + (r()-0.5)*d*0.36;
    var sh  = 0.82 + r()*0.14;
    plant("bush", sxp, szp, sh, G, soil - sh*0.08,
          { wx:0.80+r()*0.16, wz:0.80+r()*0.16, tlt:[(r()-0.5)*0.10,(r()-0.5)*0.10] });
    for(var s=0;s<5;s++){
      var sa=r()*Math.PI*2, sr=sh*(0.08+r()*0.24);
      var sfh = addSphere(0.028 + r()*0.016,
                          sxp+Math.cos(sa)*sr, soil + sh*(0.55 + r()*0.28), szp+Math.sin(sa)*sr,
                          main, G, {seg:7});
      sfh.scale.y = 0.58 + r()*0.18;
    }
  }
  addCollider(cx-w/2-KB, cx+w/2+KB, cz-d/2-KB, cz+d/2+KB, 0, 0.55);
}
/* ---- potted plant ----
   Every one of these is the same downloaded planter at a different size, which
   is what s is for: s = 0.90 beside the upstairs seating, s = 1.35 flanking
   the front door, and the model is scaled to 1.10 * s metres tall in each
   case. Scaling on height rather than on width matters here for the same
   reason it does on the bedside tables - the foliage is half again as wide as
   the pot, and normalising a planter on the spread of its leaves gives you a
   thimble under a bush.

   The turned cone and blob of canopy below still go up first and are still
   what you see if the download fails. The rotation is derived from the
   position so that four pots in a row are not four identical pots, and so
   that the same pot is at the same angle on every reload. */
function potPlant(x,z,y,g,s){
  s=s||1;
  var grp = new T.Group();
  grp.userData.noMerge = true;
  g.add(grp);
  addCyl(0.24*s,0.19*s,0.44*s,x,y+0.22*s,z,MAT.planter,grp,14,{furn:true});
  var pc = canopy(x, y+0.74*s, z, 0.38*s, 0.32*s, 5, MAT.foliageLo, grp, Math.floor(x*7+z*13)+3);
  FURN.push(pc);
  addCollider(x-0.3*s,x+0.3*s,z-0.3*s,z+0.3*s,y,y+0.6*s);
  if(MODELS.ok)
    POTQ.push({x:x, z:z, y:y, s:s, g:g, proc:grp,
               rot:((Math.abs(x)*37 + Math.abs(z)*61) % 6.2832)});
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
  /* ---------- generator house ----------
     This is the small thing with a pitched roof standing behind the games
     tent. It is the genset enclosure - a 2.60 x 1.40 m block against the rear
     wall housing the standby generator, which on this axis is not an optional
     extra: mains supply is intermittent and everything in the house that
     matters, the ACs included, is on it.

     It read as an anonymous shed before, which is why it was not obvious what
     it was. It now has the three things that make a generator house legible at
     a glance: a full-height louvred intake, an exhaust stack up past the roof
     line, and an acoustic lining you can see inside the vent. */
  addBox(2.60,2.35,1.40, -4.90, 1.175, 15.80, MAT.wallExt, gSite, {solid:true});
  /* the pitched roof goes in gRoofSite so "Roof off" lifts it too */
  hipRoof(-6.20,15.10,-3.60,16.50, 2.35, 0.50, 0.28, MAT.roof, gRoofSite);
  /* louvred intake across most of the front face */
  addBox(1.70,1.35,0.05, -4.90, 1.05, 15.08, MAT.black, gSite, {});
  for(var lv=0; lv<9; lv++){
    var b = addBox(1.62, 0.10, 0.05, -4.90, 0.48 + lv*0.145, 15.05, MAT.grille, gSite, {cast:false});
    b.rotation.x = 0.40;
  }
  /* discharge louvre on the east return, so air actually crosses the set */
  addBox(0.05,0.85,0.80, -3.62, 1.30, 15.80, MAT.grille, gSite, {});
  /* exhaust stack, out of the back and up clear of the roof */
  addCyl(0.075,0.075,2.35, -5.95, 2.10, 16.20, MAT.steel, gSite, 10);
  addCyl(0.10,0.10,0.14, -5.95, 3.32, 16.20, MAT.black, gSite, 10);
  addBox(0.30,0.06,0.06, -5.78, 1.95, 16.20, MAT.steel, gSite, {cast:false});
  /* access door on the west end */
  addBox(0.05,1.95,0.80, -6.18, 0.98, 15.80, MAT.gate, gSite, {});
  /* changeover panel on the wall beside it */
  addBox(0.42,0.55,0.14, -5.60, 1.45, 15.03, MAT.accent, gSite, {});
  extLight(-4.90, 15.02, 2.42, 2, gSite);
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

/* ---------- exterior wall lighting ----------
   Up-and-down bulkheads at 2.10 m, which is the height they go at: high enough
   not to be walked into, low enough that the downward throw actually lands on
   the path you are walking. Spaced about 6 m, which is roughly where the pools
   of light from two of them meet at ground level.

   The runs are: the perimeter wall on all four sides, the two side walks
   between the house and the boundary, and the utility yard. The porch, the
   balcony soffit and the garden get theirs with the structures they belong to.

   All of it is on the same emissive material as the interior lamps, so it
   comes up together as the sun goes down. */
(function(){
  var Y = 2.10;
  /* front wall, either side of the gate opening */
  [-9.30, -2.35, 1.60, 5.20, 8.80].forEach(function(x){
    extLight(x, Z0+0.13, Y, 2, gSite);
  });
  /* the two side walls, facing in */
  [-11.60, -5.20, 1.20, 7.60, 13.90].forEach(function(z){
    extLight(X0+0.13, z, Y, 1, gSite);
    extLight(X1-0.13, z, Y, 3, gSite);
  });
  /* rear wall */
  [-6.40, -1.20, 4.60, 8.60].forEach(function(x){
    extLight(x, Z1-0.13, Y, 0, gSite);
  });
  /* the house's own flanks, lighting the side walks from the other side */
  [-4.20, 0.60, 5.40].forEach(function(z){
    extLight(hx(0)-0.14, z, Y+0.20, 3, gSite);
    extLight(hx(HW)+0.14, z, Y+0.20, 1, gSite);
  });
  /* over the two exterior doors */
  extLight(4.80, hz(HD)+0.16, Y+0.35, 2, gSite);
  /* and one on each carport pier, aimed down the driveway */
  [-9.20, -1.35].forEach(function(x){ extLight(x, -16.20, Y, 2, gSite); });

  /* ---- the OUTSIDE face of the boundary wall ----
     Everything above lights the compound from within its own wall, which does
     nothing for the street: from outside, the plot went dark at the wall line.
     This run is mounted on the outer face at the same 2.10 m.
     It is denser on the frontage, where it lights the approach and the gate,
     and sparse down the flanks and across the rear, which face neighbours
     rather than a road - lighting those at full spacing would be paying to
     floodlight someone else's yard. Worth knowing it is not free: about
     thirty bulkheads at 12 W is a further 360 W on the generator, all of it
     drawn through the hours the generator is least likely to be running. */
  [-9.30, -6.60, -3.90, -1.20, 1.60, 4.20, 6.80, 9.20].forEach(function(x){
    extLight(x, Z0-0.13, Y, 0, gSite);
  });
  [-11.60, -5.20, 1.20, 7.60, 13.90].forEach(function(z){
    extLight(X0-0.13, z, Y, 3, gSite);
    extLight(X1+0.13, z, Y, 1, gSite);
  });
  [-6.40, 1.20, 8.60].forEach(function(x){
    extLight(x, Z1+0.13, Y, 2, gSite);
  });
})();

/* ---------- the solar array now sits on the main roof, in part 5 ---------- */
