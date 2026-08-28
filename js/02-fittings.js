"use strict";
/* ============================================================
   PART 2  -  furniture & fitting library
   Every item registers a collider so you cannot walk through it.
   rot: 0 = headboard/back faces -Z, 1 = +X, 2 = +Z, 3 = -X

   ---------- on bulk ----------
   The complaint that drove this revision was that the rooms read as tight.
   They are not tight on paper: the master is 30.7 m2 and the guest room 23.0.
   What made them feel tight was the furniture, in three specific ways, and
   the fix for each is applied throughout:

     1. Footprints one size up from what the room needs. A 2.00 m wide bed is
        a super-king; 1.80 m is a king and gives 200 mm back to the floor
        without anyone noticing what they lost.
     2. Casegoods standing flat on the floor. A 0.62 m deep wardrobe meeting
        the tiles in a hard line reads as a wall. The same wardrobe on a
        recessed plinth, with the floor running visibly under it, reads as a
        piece of furniture - and you see more floor, which is most of what
        "spacious" means in a photograph.
     3. Height. Bed tops at 0.60 m, TV units at 0.36 m and headboards at
        1.05 m all sat in the eye's way. Everything horizontal has come down.

   Nothing here is small for its own sake - every piece is a real size you can
   buy - but the room now gets the benefit of the doubt.
   ============================================================ */

function fbox(w,h,d,x,y,z,mat,g){ return addBox(w,h,d,x,y,z,mat,g,{furn:true}); }
function fsolid(w,h,d,x,y,z,mat,g){ return addBox(w,h,d,x,y,z,mat,g,{solid:true,furn:true}); }

/* rotate a local (dx,dz) offset by quarter turns */
function rot(rq,dx,dz){
  if(rq===0) return [dx,dz];
  if(rq===1) return [-dz,dx];
  if(rq===2) return [-dx,-dz];
  return [dz,-dx];
}
function place(rq,cx,cz,dx,dz){ var r=rot(rq,dx,dz); return [cx+r[0], cz+r[1]]; }
function dims(rq,w,d){ return (rq===1||rq===3)?[d,w]:[w,d]; }

/* A recessed plinth. Draws a carcase floating on a base inset all round, so a
   shadow gap runs right under the piece and the floor reads as continuous
   beneath it. This one helper is most of the reason the rooms look larger
   than they did, and it costs one extra box per item. */
function onPlinth(w,h,d,cx,cy,cz,mat,g,inset,lift){
  inset = inset==null ? 0.055 : inset;
  lift  = lift==null  ? 0.075 : lift;
  fsolid(w-inset*2, lift, d-inset*2, cx, cy+lift/2, cz, MAT.black, g);
  return fsolid(w, h-lift, d, cx, cy+lift+(h-lift)/2, cz, mat, g);
}

/* ---- bed ----
   The beds and their side tables are downloaded .glb models now, for the same
   reason the cars and the trees are: an upholstered platform bed with a
   tailored headboard is a shape procedural boxes get about 70% of the way to
   and then stop.

   The box version below is still built, still correct, and still what you see
   on a slow connection or if the download fails - it goes up immediately in a
   noMerge group, and the group is thrown away the moment the real model lands.
   That is the whole trick: no loading gap, no empty bedrooms, and no reliance
   on a network request succeeding for the room to make sense. */
/* ============================================================
   DEFERRED MODELS

   Four pieces of furniture are downloaded .glb files rather than boxes, and
   they all need the same three things: a box stand-in up immediately, a
   normalisation that makes an asset authored at an arbitrary size land at the
   size the plan was drawn to, and one download per file however many instances
   the house wants. That machinery was written for the beds; it is here now
   because the sofas, the armchairs and the planters need every bit of it.

   Instances are queued as the floors are built and placed once, at the end, so
   each file is fetched exactly once and its scene graph is cloned per instance
   with the geometry and textures shared. ============================================================ */
var MODELQ = {};                       /* file -> [instance records] */
function queueModel(file, rec){ (MODELQ[file] || (MODELQ[file] = [])).push(rec); }

/* Normalise a downloaded model to a real-world size.

   `on` names which of the model's own dimensions the target refers to - "w"
   its X, "d" its Z, "h" its Y - and `turn` optionally swings its long
   horizontal axis onto a named axis first ("z" or "x"), for assets whose
   authored orientation is not the one the plan wants.

   The scale is always UNIFORM. Stretching one axis to hit two target
   dimensions is what makes downloaded furniture look subtly wrong without
   anyone being able to say why: a 2.05 m bed coming out 1.95 m long is the
   right kind of error, a 2.05 m bed with narrow cushions is not.

   Which dimension to measure on is a judgement per asset, not a default. A bed
   is scaled on its width because that is the number the plan means. A bedside
   table is scaled on its HEIGHT, because the widest thing in its bounding box
   is the lampshade and normalising on that gives a doll's-house table under a
   floor lamp. A planter is scaled on height for the same reason - the foliage
   is wider than the pot and it is the pot that has a real size.

   Returns a group standing on y = 0, centred in plan, carrying its measured
   size on userData.size. Anything that has to line up with a wall reads that
   size and slides the instance inside the group. */
function fitModel(src, target, on, turn){
  var inst = src.clone(true);
  var wrap = new T.Group();
  /* Downloaded geometry is interleaved and mergeBufferGeometries cannot take
     it. Without this the second merge pass - the one that runs after the
     models have landed - throws on every instance of every file. */
  wrap.userData.noMerge = true;
  if(turn){
    var b0 = new T.Box3().setFromObject(inst), s0 = b0.getSize(new T.Vector3());
    if((s0.z >= s0.x) !== (turn === "z")) inst.rotation.y = Math.PI/2;
  }
  wrap.add(inst);
  var b2 = new T.Box3().setFromObject(wrap), s2 = b2.getSize(new T.Vector3());
  var ref = (on === "h") ? s2.y : (on === "d") ? s2.z : s2.x;
  var k = target / Math.max(ref, 1e-6);
  wrap.scale.setScalar(k);
  var b3 = new T.Box3().setFromObject(wrap), c3 = b3.getCenter(new T.Vector3());
  inst.position.x -= c3.x / k;
  inst.position.z -= c3.z / k;
  inst.position.y -= b3.min.y / k;
  wrap.userData.size = s2.multiplyScalar(k);
  return wrap;
}

/* Load one file and hand the shadow-flagged scene to a placer. */
function loadModel(file, onSrc){
  MODELS.load(file, function(gl){
    var src = gl.scene || gl.scenes[0];
    src.traverse(function(o){ if(o.isMesh){ o.castShadow = true; o.receiveShadow = true; } });
    onSrc(src);
  });
}

/* The box stand-in has done its job. The COLLIDERS it registered are left
   alone deliberately - they are the physics of the piece, they were correct
   before the download and they are still correct after it, and rebuilding them
   from a downloaded bounding box would make what you can walk into depend on
   whether a network request succeeded. */
function dropProc(rec){
  if(!rec.proc) return;
  rec.proc.traverse(function(o){
    var ix = FURN.indexOf(o); if(ix >= 0) FURN.splice(ix,1);
  });
  rec.proc.parent.remove(rec.proc);
  rec.proc = null;
}

var BEDQ = [];
function bed(cx,cz,y,w,d,rq,g,linenMat){
  var grp = new T.Group();
  grp.userData.noMerge = true;             /* so it can still be removed later */
  g.add(grp);
  bedProc(cx,cz,y,w,d,rq,grp,linenMat);
  BEDQ.push({cx:cx, cz:cz, y:y, w:w, d:d, rq:rq, g:g, proc:grp});
  /* Side tables go in g, the permanent group - NOT grp, which dropProc()
     deletes the moment bed.glb lands. They used to be safe in there because
     bedside.glb put its own back; now that the tables are procedural for good,
     anything drawn inside grp would vanish as soon as the bed downloaded. */
  var s1 = place(rq,cx,cz,-w/2-0.41,-d/2+0.26);
  bedsideProc(s1[0], s1[1], y, rq, g);
  if(w>1.3){
    var s2 = place(rq,cx,cz, w/2+0.41,-d/2+0.26);
    bedsideProc(s2[0], s2[1], y, rq, g);
  }
  planFurn("bed", cx, cz, w, d + 0.14, rq, y);
}

/* ---- bedside table ----
   bedside.glb was 21,692 triangles and there are eight of them in the house,
   which came to 9% of the scene for a box with two drawers in it. This is the
   same piece at about 220: a painted carcass on a recessed plinth, a pale ash
   top, two drawer fronts held proud so the reveals read as shadow lines, and a
   lamp. The reveals are the whole trick - a drawer front flush with its
   carcass is invisible, and one held 6 mm out is unmistakable.

   0.42 x 0.36 with the top at 0.46, which is where it belongs beside a
   mattress topping out at 0.52. */
function bedsideProc(cx, cz, y, rq, g){
  var W = 0.42, D = 0.36, i, p, dd;
  /* recessed plinth, so the floor runs visibly under it */
  dd = dims(rq, W-0.10, D-0.10);
  fsolid(dd[0], 0.06, dd[1], cx, y+0.03, cz, MAT.black, g);
  /* carcass and a pale ash top that oversails it slightly on every side */
  dd = dims(rq, W, D);
  fsolid(dd[0], 0.34, dd[1], cx, y+0.23, cz, MAT.joinery, g);
  dd = dims(rq, W+0.03, D+0.03);
  fbox(dd[0], 0.03, dd[1], cx, y+0.415, cz, MAT.woodPale, g);
  /* two drawer fronts, 6 mm proud of the carcass face, with a 10 mm gap
     between them. Front of the piece is local +Z, away from the headboard. */
  for(i=0;i<2;i++){
    p  = place(rq, cx, cz, 0, D/2+0.003);
    dd = dims(rq, W-0.05, 0.012);
    fbox(dd[0], 0.145, dd[1], p[0], y+0.115+i*0.155, p[1], MAT.joinery, g);
    /* a slim pull rather than a knob - the house is handleless everywhere else */
    p  = place(rq, cx, cz, 0, D/2+0.012);
    dd = dims(rq, 0.16, 0.014);
    fbox(dd[0], 0.014, dd[1], p[0], y+0.168+i*0.155, p[1], MAT.steel, g);
  }
  /* lamp: base, stem, shade. A cone shade, not a cylinder - the taper is the
     only thing that says lamp at this size. */
  addCyl(0.075, 0.085, 0.022, cx, y+0.442, cz, MAT.black, g, 12, {furn:true});
  addCyl(0.010, 0.010, 0.20,  cx, y+0.553, cz, MAT.black, g, 6,  {furn:true});
  addCyl(0.105, 0.068, 0.155, cx, y+0.730, cz, MAT.lamp,  g, 12, {furn:true});
  /* one book, which is the whole of the styling */
  p  = place(rq, cx, cz, 0.11, 0.06);
  dd = dims(rq, 0.13, 0.17);
  fbox(dd[0], 0.028, dd[1], p[0], y+0.444, p[1], MAT.cushion, g);
}

/* ---- procedural bed: w x d footprint, headboard at local -Z ----
   Platform base, mattress oversailing it on all four sides, and a slim
   upholstered headboard hung clear of the floor. Both in the same family as
   the walls - the reference has no dark timber anywhere. Everything here is
   the fallback that goes up before bed.glb lands, and dropProc() throws the
   whole group away the moment it does - which is exactly why the side tables
   are NOT drawn here any more but in bed(), into the permanent group. They
   used to be safe inside this one because bedside.glb put its own back; that
   file is gone, so anything drawn here would vanish when the bed arrives. */
function bedProc(cx,cz,y,w,d,rq,g,linenMat){
  var D  = dims(rq,w,d);
  var Di = dims(rq,w-0.20,d-0.20);
  var p, dd;
  /* base is 0.30 tall so the mattress lands straight on it - a base stopping
     short of the mattress leaves a lit gap that no amount of drapery hides */
  fbox(Di[0], 0.30, Di[1], cx, y+0.15, cz, MAT.joinery, g);
  /* mattress: top at 0.52, oversailing the base by 0.10 all round */
  fbox(D[0], 0.22, D[1], cx, y+0.41, cz, linenMat||MAT.linen, g);

  /* headboard: 0.85 tall, hung with a 0.10 shadow gap under it, and a panel
     held 12 mm proud of the face - one shadow line is the whole difference
     between an upholstered headboard and a slab of foam */
  p  = place(rq,cx,cz,0,-d/2-0.045);
  dd = dims(rq, w+0.10, 0.09);
  fsolid(dd[0], 0.85, dd[1], p[0], y+0.525, p[1], MAT.fabric, g);
  p  = place(rq,cx,cz,0,-d/2-0.012);
  dd = dims(rq, w-0.06, 0.02);
  fbox(dd[0], 0.74, dd[1], p[0], y+0.53, p[1], MAT.fabric, g);

  /* duvet, pulled to the foot and cascading over three edges. The drapes are
     what stop the bed reading as two stacked boxes from across the room. */
  var z0 = -d/2+0.55, z1 = d/2-0.01, zc = (z0+z1)/2, zl = z1-z0;
  p  = place(rq,cx,cz,0,zc);
  dd = dims(rq, w+0.04, zl);
  fbox(dd[0], 0.065, dd[1], p[0], y+0.5525, p[1], linenMat||MAT.linen, g);
  for(var s=-1;s<=1;s+=2){
    p  = place(rq,cx,cz, s*(w/2+0.015), zc);
    dd = dims(rq, 0.03, zl-0.04);
    fbox(dd[0], 0.25, dd[1], p[0], y+0.425, p[1], linenMat||MAT.linen, g);
  }
  p  = place(rq,cx,cz,0,d/2-0.02);
  dd = dims(rq, w+0.04, 0.04);
  fbox(dd[0], 0.25, dd[1], p[0], y+0.425, p[1], linenMat||MAT.linen, g);

  /* the turned-back top sheet, which is the one detail that stops a bed
     reading as a foam block with a cloth over it */
  p  = place(rq,cx,cz,0,-d/2+0.62);
  dd = dims(rq, w-0.02, 0.24);
  fbox(dd[0], 0.03, dd[1], p[0], y+0.60, p[1], MAT.white, g);

  // pillows
  var pd = dims(rq, w*0.40, 0.30);
  var p1 = place(rq,cx,cz,-w*0.23,-d/2+0.34);
  fbox(pd[0], 0.13, pd[1], p1[0], y+0.585, p1[1], MAT.white, g);
  if(w>1.3){
    var p2 = place(rq,cx,cz, w*0.23,-d/2+0.34);
    fbox(pd[0], 0.13, pd[1], p2[0], y+0.585, p2[1], MAT.white, g);
  }
  // the one saturated thing on the bed
  p  = place(rq,cx,cz,0,-d/2+0.50);
  dd = dims(rq, 0.36, 0.18);
  fbox(dd[0], 0.15, dd[1], p[0], y+0.63, p[1], MAT.cushion, g);
  // throw at foot
  p  = place(rq,cx,cz,0,d*0.31);
  dd = dims(rq, w-0.06, d*0.20);
  fbox(dd[0], 0.045, dd[1], p[0], y+0.607, p[1], MAT.fabric2, g);

  /* Side tables. 0.42 x 0.36 set 0.20 clear of the mattress, where they used
     to be 0.50 x 0.42 set 0.32 clear: the pair used to add 1.64 m to the bed's
     overall width and now add 1.24. Against a 3.2 m wall that is the
     difference between a bed with tables and a wall of furniture. */
  /* The base and mattress are both fbox, so the only thing stopping a walker
     is this: one collider on the real footprint, turned with the bed. The
     headboard carries its own. Nothing below y+0.38 is tested at all - see
     collides() - so the mattress top is what the height has to reach. */
  addCollider(cx-D[0]/2, cx+D[0]/2, cz-D[1]/2, cz+D[1]/2, y, y+0.52);
  /* no planFurn here: bed() already registers the plan symbol, headboard
     included, and a second entry draws the rectangle twice */
}


/* ---------- placing the downloaded pieces ----------
   Called once, after every floor has been built and every instance queued. */
function placeModels(){
  if(!MODELS.ok) return;

  /* ---- beds ----
     rq 0 and 2 lay the bed along z, 1 and 3 along x. Built in the bed's own
     frame - length along local Z, head at -Z, the same convention bedProc()
     uses - and then turned by rq. Note the sign: rot() turns local -Z to +X
     for rq = 1 and three.js rotation.y turns it to -X, so the quarter turns go
     the other way round here. */
  if(BEDQ.length) loadModel("bed.glb", function(src){
    for(var i=0; i<BEDQ.length; i++){
      var q = BEDQ[i];
      dropProc(q);
      var m = fitModel(src, q.w, "w", "z");
      /* Uniform scale means matching the width leaves the length wherever the
         model's own proportions put it. Rather than distort it, slide it back
         so the HEADBOARD lands on the plan's head line. That is the edge that
         has to be right: it is the one against the wall, and it is what the
         side tables line up with. */
      var len = m.userData.size.z;
      m.children[0].position.z -= (q.d - len) / (2 * m.scale.z);
      m.position.set(q.cx, q.y, q.cz);
      m.rotation.y = -q.rq * Math.PI/2;
      q.g.add(m); FURN.push(m);
    }
  });

  /* ---- bedside tables ----
     bedside.glb is gone. It was 21,692 triangles a copy and there are eight
     of them, which bought 9% of the scene's entire triangle budget for a box
     with two drawers in it. bedsideProc() draws the same piece for about 220
     and is built with the bed, so there is nothing to place here any more. */

  /* ---- sofas ----
     Aligned by their BACK rather than their centre, for the same reason the
     beds are aligned by the headboard: the back is the edge that goes against
     the wall, and it is the one the plan means. */
  if(SOFAQ.length) loadModel("sofa.glb", function(src){
    for(var i=0; i<SOFAQ.length; i++){
      var q = SOFAQ[i];
      dropProc(q);
      var m = fitModel(src, q.w, "w", q.turn);
      var dep = m.userData.size.z;
      m.children[0].position.z -= (q.d - dep) / (2 * m.scale.z);
      m.position.set(q.cx, q.y, q.cz);
      m.rotation.y = -q.rq * Math.PI/2;
      q.g.add(m); FURN.push(m);
    }
  });

  /* ---- planters ----
     pot.glb is gone too, and it was the worst of them: 72,912 triangles,
     nineteen copies, 75% of everything in the scene. potPlant() lathes the
     same turned form for 440 and caches it per size - see the note there. */
}
/* the old name, still called from the end of the first floor */
function placeBeds(){ placeModels(); }

/* ---- sofa: back at local -Z ----
   Modelled on the loft reference: a low modular seat that sits almost on the
   floor with no visible legs, a thin flat back cushion rather than a bolstered
   roll, and arms that stop level with the back. */
var SOFAQ = [], POTQ = [];
/* Sofas are the downloaded Velo; armchairs are built here.

   The armchairs WERE outchair.glb, and that was wrong. Its top-level bounding
   box is a plausible 1.14 x 0.98 x 1.17 m, which is all I checked, but inside
   it is a Sketchfab scene rather than a chair: twelve meshes, of which
   Object_4 (12,800 verts) and Object_24 (65,532 verts) share a material and
   occupy the same volume - two coincident copies of the same shell, both
   double-sided, which z-fight against each other. Nothing touches the floor
   except two small parts in diagonally opposite corners, so the shell reads as
   hanging in mid-air; and normalising the whole ASSEMBLY to 0.92 m puts the
   seat somewhere other than where the plan asked for a chair.

   It also costs 207,000 triangles. Twelve of them came to 2.49 million - 55 %
   of the entire model, against 580,000 for the building itself. This project
   merges 2,525 draw calls down to 438 on purpose; adding that much geometry
   without measuring it was the second mistake.

   So the cantilever chair is back until there is an asset that is one chair. */
function sofa(cx,cz,y,w,rq,g,mat){
  if(MODELS.ok && w >= 1.4){
    var grp = new T.Group();
    grp.userData.noMerge = true;
    g.add(grp);
    sofaProc(cx,cz,y,w,rq,grp,mat);
    /* the Velo's long axis is authored on X, so it is turned onto the plan's */
    SOFAQ.push({cx:cx, cz:cz, y:y, w:w, d:0.84, rq:rq, g:g, proc:grp, turn:"x"});
    return;
  }
  sofaProc(cx,cz,y,w,rq,g,mat);
}
/* ---- procedural sofa ----
   Low modular upholstery on a floating base. Three things carry it: the
   shadow slab under the plinth, the 12 mm gaps between cushion modules, and
   the seat cushion built as two boxes so the front edge reads as rolled
   rather than as a 90 degree corner. */
function sofaProc(cx,cz,y,w,rq,g,mat){
  mat = mat||MAT.fabric;
  var d = 0.84;
  var armW = 0.17, baseH = 0.20, seatY = 0.40, backY = 0.60;
  var i, f, p, dd;
  var D = dims(rq,w,d);

  /* plinth: 20 mm off the floor over a recessed dark slab, so the whole piece
     floats the way an upholstered platform does */
  dd = dims(rq, w-0.10, d-0.10);
  fbox(dd[0], 0.02, dd[1], cx, y+0.01, cz, MAT.black, g);
  fbox(D[0], baseH-0.02, D[1], cx, y+0.02+(baseH-0.02)/2, cz, mat, g);

  /* back: thin, flat, stopping at 0.60 - low enough to see over */
  p  = place(rq,cx,cz,0,-d/2+0.08);
  dd = dims(rq, w, 0.16);
  fbox(dd[0], backY-baseH, dd[1], p[0], y+baseH+(backY-baseH)/2, p[1], mat, g);

  /* arms, capped with a narrower box to fake a chamfer on the top edge */
  for(i=-1;i<=1;i+=2){
    p  = place(rq,cx,cz, i*(w/2-armW/2), 0);
    dd = dims(rq, armW, d);
    fbox(dd[0], 0.32, dd[1], p[0], y+0.36, p[1], mat, g);
    dd = dims(rq, armW-0.03, d-0.03);
    fbox(dd[0], 0.04, dd[1], p[0], y+0.54, p[1], mat, g);
  }

  /* cushion modules. The back cushions sit 120 mm PROUD of the backrest face
     at z = -0.26: tucked level with it they are geometry you pay for and
     never see. */
  var innerW = w - armW*2;
  var n  = Math.max(1, Math.round(innerW/0.75));
  var mw = innerW/n;
  for(i=0;i<n;i++){
    f = -innerW/2 + mw*(i+0.5);
    var cw  = mw - 0.012;                     /* the gap is the modular tell */
    var jog = (i%2) ? -0.006 : 0.006;         /* nothing upholstered is regular */
    p  = place(rq,cx,cz, f, 0.13+jog);
    dd = dims(rq, cw, 0.54);
    fbox(dd[0], 0.135, dd[1], p[0], y+baseH+0.0675, p[1], mat, g);
    p  = place(rq,cx,cz, f, 0.118+jog);
    dd = dims(rq, cw-0.01, 0.516);
    fbox(dd[0], 0.065, dd[1], p[0], y+seatY-0.0325, p[1], mat, g);
    p  = place(rq,cx,cz, f, -0.20);
    dd = dims(rq, cw, 0.12);
    fbox(dd[0], 0.14, dd[1], p[0], y+0.45, p[1], mat, g);
    p  = place(rq,cx,cz, f, -0.215);
    dd = dims(rq, cw-0.012, 0.10);
    fbox(dd[0], 0.07, dd[1], p[0], y+0.555, p[1], mat, g);
  }

  /* One accent cushion, muted, and only on a full sofa. Putting one on every
     armchair as well meant four of them in a room the reference furnishes with
     two, and repetition is what kills a restrained palette. */
  if(w > 1.4){
    p  = place(rq,cx,cz,-w/2+0.46,-0.09);
    dd = dims(rq, 0.40, 0.13);
    fbox(dd[0], 0.32, dd[1], p[0], y+0.54, p[1], MAT.cushion, g);
    /* a thinner box set back and up is the slump at the top of a cushion
       propped against a back - a sphere here read as a ball left on the sofa */
    p  = place(rq,cx,cz,-w/2+0.46,-0.12);
    dd = dims(rq, 0.36, 0.10);
    fbox(dd[0], 0.05, dd[1], p[0], y+0.715, p[1], MAT.cushion, g);
  }

  /* Every box above is fbox, so this is the only thing you can bump into.
     collides() ignores anything topping out below y+0.38, which is why it has
     to run to the back height and not to the plinth. */
  addCollider(cx-D[0]/2, cx+D[0]/2, cz-D[1]/2, cz+D[1]/2, y, y+backY);
  planFurn(w>1.4?"sofa":"chair", cx, cz, w, d, rq, y);
}

/* ---- armchair ----
   Its own piece rather than a 0.92 m sofa. A thin deck on tapered steel pins
   with a loose cushion on top reads as a chair; the same upholstery language
   as the sofa at chair scale reads as a sofa someone cut in half. */
function armchair(cx,cz,y,rq,g,mat){
  mat = mat||MAT.fabric2;
  var w = 0.86, d = 0.82, deckY = 0.24, seatY = 0.44, backY = 0.68;
  var lx = w/2-0.09, lz = d/2-0.09;
  var LEG = [[-lx,-lz],[lx,-lz],[-lx,lz],[lx,lz]];
  var i, p, dd;

  /* pin legs, tapering to a 20 mm foot */
  for(i=0;i<4;i++){
    p = place(rq,cx,cz,LEG[i][0],LEG[i][1]);
    addCyl(0.016, 0.010, 0.21, p[0], y+0.105, p[1], MAT.steel, g, 8, {furn:true});
  }
  /* the deck: thin and rigid, the opposite of the sofa's plinth */
  dd = dims(rq, w, d);
  fbox(dd[0], 0.05, dd[1], cx, y+deckY-0.025, cz, mat, g);

  /* slim arms, held well inside the seat width */
  for(i=-1;i<=1;i+=2){
    p  = place(rq,cx,cz, i*(w/2-0.04), 0);
    dd = dims(rq, 0.08, d);
    fbox(dd[0], 0.34, dd[1], p[0], y+0.41, p[1], mat, g);
  }
  /* back frame, stopping at 0.68 - taller than the sofa, still under eye */
  p  = place(rq,cx,cz,0,-d/2+0.045);
  dd = dims(rq, w-0.16, 0.09);
  fbox(dd[0], backY-deckY, dd[1], p[0], y+deckY+(backY-deckY)/2, p[1], mat, g);

  /* loose seat cushion: bulk plus a set-back puff, overhanging the deck */
  dd = dims(rq, w-0.13, d-0.10);
  p  = place(rq,cx,cz,0,0.03);
  fbox(dd[0], 0.16, dd[1], p[0], y+0.32, p[1], mat, g);
  dd = dims(rq, w-0.16, d-0.14);
  p  = place(rq,cx,cz,0,0.02);
  fbox(dd[0], 0.04, dd[1], p[0], y+0.42, p[1], mat, g);

  /* loose back pillow, proud of the frame */
  p  = place(rq,cx,cz,0,-d/2+0.16);
  dd = dims(rq, w-0.18, 0.14);
  fbox(dd[0], 0.24, dd[1], p[0], y+0.54, p[1], mat, g);

  addCollider(cx-dims(rq,w,d)[0]/2, cx+dims(rq,w,d)[0]/2,
              cz-dims(rq,w,d)[1]/2, cz+dims(rq,w,d)[1]/2, y, y+0.60);
  planFurn("chair", cx, cz, w, d, rq, y);
}


/* ---- round coffee table: pale top on a turned terrazzo pedestal ----
   The reference table is very low - 0.32 m, not the 0.44 m a box on four black
   legs wants to be. w is taken as the diameter; d is ignored and kept only so
   existing calls still work. */
function coffeeTable(cx,cz,y,w,d,g){
  var r = w/2, h = 0.32;
  /* base in three parts - foot, waist, collar - so it reads as turned stone
     rather than as a pipe */
  addCyl(r*0.40, r*0.46, 0.06, cx, y+0.03, cz, MAT.terrazzo, g, 16, {furn:true});
  addCyl(r*0.26, r*0.36, h-0.08, cx, y+0.06+(h-0.08)/2, cz, MAT.terrazzo, g, 16, {furn:true});
  addCyl(r*0.36, r*0.26, 0.02, cx, y+h-0.01, cz, MAT.terrazzo, g, 16, {furn:true});
  /* top in two discs: the lower one steps back sharply, which is a bevelled
     edge from every angle you actually see the table from */
  addCyl(r*0.95, r*0.80, 0.015, cx, y+h-0.0075, cz, MAT.woodPale, g, 24, {furn:true});
  addCyl(r, r*0.95, 0.015, cx, y+h+0.0075, cz, MAT.woodPale, g, 24, {furn:true});
  /* a shallow bowl with two stones in it, which is the whole of the styling */
  addCyl(0.15,0.11,0.06, cx, y+h+0.045, cz, MAT.woodDark, g, 16, {furn:true});
  addSphere(0.05, cx-0.03, y+h+0.075, cz+0.02, MAT.stone, g, {furn:true, seg:10});
  addCollider(cx-r, cx+r, cz-r, cz+r, y, y+h);
  planFurn("table", cx, cz, w, w, 0, y);
}

function rugMat(cx,cz,y,w,d,g,mat){ addBox(w,0.02,d,cx,y+0.011,cz,mat||MAT.rug,g,{cast:false,furn:true}); }

/* ---- TV unit ----
   0.34 deep and 0.30 high on a recessed plinth, where it used to be 0.42 and
   0.36 standing on the floor. Under a wall-hung screen the unit is a shelf,
   not a sideboard, and the lower and shallower it is the wider the room. */
function tvUnit(cx,cz,y,w,rq,g){
  var D = dims(rq,w,0.34);
  onPlinth(D[0],0.30,D[1], cx, y, cz, MAT.joinery, g, 0.05, 0.065);
  /* The screen face is offset through place() like everything else. It used to
     be nudged with `sp[1] + (rq===0 ? 0.035 : rq===2 ? -0.035 : 0)`, which is
     an offset along z whatever the unit is facing: on the two side walls the
     glass got no offset at all and sat buried inside the black panel. */
  var sw2 = Math.min(w-0.3, 1.5);
  var sp = place(rq,cx,cz,0,0.02);
  var sd = dims(rq, sw2, 0.05);
  fbox(sd[0],0.82,sd[1], sp[0], y+1.12, sp[1], MAT.black, g);
  var gp = place(rq,cx,cz,0,0.055);
  var gd = dims(rq, sw2*0.96, 0.02);
  fbox(gd[0],0.76,gd[1], gp[0], y+1.12, gp[1], MAT.carGlass, g);
  planFurn("unit", cx, cz, w, 0.34, rq, y);
}

/* ---- wardrobe ----
   0.58 deep on a 60 mm recessed plinth, with the doors expressed as shadow
   gaps rather than as dark timber panels standing proud. The old version put
   a 30 mm woodDark box on the face of every leaf, which at 2.4 m wide read as
   a slab of dark furniture; a groove reads as joinery. */
function wardrobe(cx,cz,y,w,rq,g){
  var D = dims(rq,w,0.58);
  onPlinth(D[0],2.24,D[1], cx, y, cz, MAT.joinery, g, 0.05, 0.06);
  var n = Math.max(2,Math.round(w/0.55));
  for(var i=1;i<n;i++){
    var f = -w/2 + w*i/n;
    var p = place(rq,cx,cz,f,0.29);
    fbox( (rq===1||rq===3)?0.012:0.014, 2.02, (rq===1||rq===3)?0.014:0.012,
          p[0], y+1.14, p[1], MAT.black, g);
  }
  /* a single continuous recessed pull, at hand height across the whole run */
  var hp = place(rq,cx,cz,0,0.292);
  var hd = dims(rq, w-0.10, 0.02);
  fbox(hd[0],0.022,hd[1], hp[0], y+1.05, hp[1], MAT.steel, g);
  planFurn("wardrobe", cx, cz, w, 0.58, rq, y);
}

function desk(cx,cz,y,w,rq,g){
  var D=dims(rq,w,0.58);
  fsolid(D[0],0.045,D[1],cx,y+0.755,cz,MAT.woodPale,g);
  fbox(0.04,0.73,0.04,cx-(D[0]/2-0.07),y+0.365,cz-(D[1]/2-0.07),MAT.steel,g);
  fbox(0.04,0.73,0.04,cx+(D[0]/2-0.07),y+0.365,cz-(D[1]/2-0.07),MAT.steel,g);
  fbox(0.04,0.73,0.04,cx-(D[0]/2-0.07),y+0.365,cz+(D[1]/2-0.07),MAT.steel,g);
  fbox(0.04,0.73,0.04,cx+(D[0]/2-0.07),y+0.365,cz+(D[1]/2-0.07),MAT.steel,g);
  fbox(0.5,0.32,0.02,cx,y+0.955,cz-0.09,MAT.carGlass,g);
  /* The chair used to be placed at cz + 0.58 whatever way the desk faced, and
     turned to face the same way the desk did. So on the two desks that stand
     against a side wall it sat beside the desk rather than at it, and on all
     of them it had its back to the work surface. In front of the desk, turned
     to face it. */
  var cp = place(rq,cx,cz,0,0.58);
  chair(cp[0],cp[1],y,(rq+2)%4,g);
  planFurn("desk", cx, cz, w, 0.58, rq, y);
}
/* ---- dining chair ----
   Four tapered legs, an upholstered pad, and a back built as a five step
   faceted arc. There is no arbitrary rotation in this model - every box is
   axis aligned - so a curved shell has to be stepped, and five 20 mm steps
   read as a curve from anywhere in the room. The two stiles are not optional:
   without them the back floats off the seat with nothing carrying it. */
function chair(cx,cz,y,rq,g){
  var W = 0.44, D = 0.50;
  var lx = W/2-0.035, lz = D/2-0.045;
  var LEG = [[-lx,-lz],[lx,-lz],[-lx,lz],[lx,lz]];
  var i, s, p, dd;

  for(i=0;i<4;i++){
    p = place(rq,cx,cz,LEG[i][0],LEG[i][1]);
    addCyl(0.020, 0.013, 0.375, p[0], y+0.1875, p[1], MAT.woodPale, g, 8, {furn:true});
  }
  /* timber deck, then the pad on top of it - the 30 mm reveal between the two
     is what tells you the seat is upholstered and not painted */
  dd = dims(rq, W, D-0.06);
  fbox(dd[0], 0.03, dd[1], cx, y+0.39, cz, MAT.woodPale, g);
  dd = dims(rq, W-0.02, D-0.08);
  fsolid(dd[0], 0.045, dd[1], cx, y+0.4275, cz, MAT.fabric2, g);
  /* rolled front edge */
  p  = place(rq,cx,cz,0,(D-0.08)/2-0.005);
  dd = dims(rq, W-0.03, 0.03);
  fbox(dd[0], 0.03, dd[1], p[0], y+0.408, p[1], MAT.fabric2, g);

  /* stiles carrying the back up to 0.80 - above the 0.76 dining top, so the
     backs still read against the room instead of vanishing behind the table */
  for(s=-1;s<=1;s+=2){
    p = place(rq,cx,cz, s*0.19, -D/2+0.045);
    addCyl(0.017, 0.017, 0.425, p[0], y+0.5875, p[1], MAT.woodPale, g, 8, {furn:true});
  }
  /* the shell: centre panel, then two pairs stepped forward and narrowing */
  p  = place(rq,cx,cz,0,-D/2+0.038);
  dd = dims(rq, 0.20, 0.022);
  fbox(dd[0], 0.24, dd[1], p[0], y+0.68, p[1], MAT.fabric2, g);
  for(s=-1;s<=1;s+=2){
    p  = place(rq,cx,cz, s*0.145, -D/2+0.052);
    dd = dims(rq, 0.09, 0.028);
    fbox(dd[0], 0.235, dd[1], p[0], y+0.6775, p[1], MAT.fabric2, g);
    p  = place(rq,cx,cz, s*0.195, -D/2+0.070);
    dd = dims(rq, 0.05, 0.030);
    fbox(dd[0], 0.225, dd[1], p[0], y+0.6725, p[1], MAT.fabric2, g);
  }
  /* no planFurn: six chair rectangles round every table turned the plans into
     a diagram of chairs. The table symbol carries the setting. */
}


/* ---- dining ----
   Round for six or fewer, on a single fat plaster pedestal, which is what the
   reference uses and what actually suits a square-ish room: a round table has
   no corners to walk into and seats an extra person at a pinch. Anything over
   six goes back to an oval, because a round table for eight would be 1.8 m
   across and would not fit these rooms. */
function diningSet(cx,cz,y,seats,rq,g){
  var i, a, p;
  if(seats<=6){
    var r = seats<=4 ? 0.54 : 0.66;
    addCyl(r, r, 0.05, cx, y+0.735, cz, MAT.woodPale, g, 32, {furn:true});
    addCyl(0.16, 0.25, 0.71, cx, y+0.355, cz, MAT.terrazzo, g, 22, {furn:true});
    addCollider(cx-r, cx+r, cz-r, cz+r, y, y+0.78);
    planFurn("table", cx, cz, r*2, r*2, 0, y);
    for(i=0;i<seats;i++){
      a = (i/seats)*Math.PI*2 + Math.PI/seats;
      p = [cx + Math.sin(a)*(r+0.35), cz + Math.cos(a)*(r+0.35)];
      /* chairs face the table, snapped to the nearest quarter turn */
      chair(p[0], p[1], y, (Math.round(a/(Math.PI/2))+2)%4, g);
    }
  } else {
    var w = 2.30, d = 1.00;
    var D = dims(rq,w,d);
    fsolid(D[0],0.05,D[1], cx, y+0.735, cz, MAT.woodPale, g);
    planFurn("table", cx, cz, w, d, rq, y);
    for(i=-1;i<=1;i+=2){
      p = place(rq,cx,cz,i*w*0.28,0);
      addCyl(0.15, 0.22, 0.71, p[0], y+0.355, p[1], MAT.terrazzo, g, 20, {furn:true});
    }
    var per = seats/2, f;
    for(i=0;i<per;i++){
      f = -w/2 + w*(i+0.5)/per;
      p = place(rq,cx,cz,f,-d/2-0.31); chair(p[0],p[1],y,rq,g);
      p = place(rq,cx,cz,f, d/2+0.31); chair(p[0],p[1],y,(rq+2)%4,g);
    }
  }
  /* a single stem vase, as in the reference - no fruit bowl, no candles */
  addCyl(0.055,0.075,0.24, cx, y+0.885, cz, MAT.white, g, 14, {furn:true});
  for(i=0;i<5;i++){
    a = i*1.257;
    addSphere(0.055, cx+Math.cos(a)*0.09, y+1.055+((i*7)%3)*0.05, cz+Math.sin(a)*0.09, MAT.leaf, g, {furn:true});
  }
}

/* ---- kitchen run along a wall ---- */
function counterRun(x0,z0,x1,z1,y,g,withUppers){
  var horiz = Math.abs(z1-z0)<1e-6;
  var len = horiz?Math.abs(x1-x0):Math.abs(z1-z0);
  var cx=(x0+x1)/2, cz=(z0+z1)/2;
  var w = horiz?len:0.60, d = horiz?0.60:len;
  /* the carcase lifted on a recessed toe kick, which is how a fitted kitchen
     is actually built and which every previous version left out */
  fsolid(horiz?w:w-0.11, 0.11, horiz?d-0.11:d, cx, y+0.055, cz, MAT.black, g);
  fsolid(w,0.75,d,cx,y+0.485,cz,MAT.white,g);
  fbox(w+0.03,0.04,d+0.03,cx,y+0.88,cz,MAT.counter,g);
  var n=Math.max(2,Math.round(len/0.6));
  for(var i=0;i<n;i++){
    var f=-len/2+len*(i+0.5)/n;
    fbox(horiz?len/n-0.03:0.02, 0.70, horiz?0.02:len/n-0.03,
         horiz?cx+f:cx-0.30, y+0.485, horiz?cz-0.30:cz+f, MAT.linen, g);
  }
  if(withUppers){
    fsolid(horiz?len*0.75:0.33, 0.72, horiz?0.33:len*0.75, cx, y+1.86, cz, MAT.white, g);
  }
  planFurn("counter", cx, cz, w, d, 0, y);
}
function fridge(cx,cz,y,rq,g){
  var D=dims(rq,0.80,0.70);
  fsolid(D[0],1.85,D[1],cx,y+0.925,cz,MAT.steel,g);
  var p=place(rq,cx,cz,0,0.36);
  fbox(dims(rq,0.78,0.025)[0],0.035,dims(rq,0.78,0.025)[1],p[0],y+1.05,p[1],MAT.black,g);
  planFurn("appliance", cx, cz, 0.80, 0.70, rq, y);
}
function cooker(cx,cz,y,rq,g){
  var D=dims(rq,0.75,0.60);
  fsolid(D[0],0.86,D[1],cx,y+0.43,cz,MAT.black,g);
  fbox(D[0]-0.06,0.03,D[1]-0.06,cx,y+0.88,cz,MAT.carGlass,g);
  var p=place(rq,cx,cz,0,-0.29);
  fbox(dims(rq,0.7,0.14)[0],0.52,dims(rq,0.7,0.14)[1],p[0],y+2.05,p[1],MAT.steel,g);
  planFurn("appliance", cx, cz, 0.75, 0.60, rq, y);
}
function island(cx,cz,y,w,d,g){
  fsolid(w-0.11,0.11,d-0.11,cx,y+0.055,cz,MAT.black,g);
  fsolid(w,0.77,d,cx,y+0.495,cz,MAT.white,g);
  fbox(w+0.12,0.05,d+0.12,cx,y+0.905,cz,MAT.counter,g);
  addCyl(0.03,0.03,0.26,cx-0.3,y+1.05,cz,MAT.steel,g,8,{furn:true});
  for(var i=0;i<2;i++) stool(cx-0.35+i*0.7, cz+d/2+0.40, y, g);
  planFurn("counter", cx, cz, w, d, 0, y);
}
function stool(cx,cz,y,g){
  addCyl(0.16,0.16,0.05,cx,y+0.675,cz,MAT.wood,g,12,{furn:true});
  addCyl(0.04,0.05,0.65,cx,y+0.325,cz,MAT.steel,g,10,{furn:true});
  addCyl(0.19,0.19,0.03,cx,y+0.02,cz,MAT.steel,g,12,{furn:true});
  addCollider(cx-0.19,cx+0.19,cz-0.19,cz+0.19,y,y+0.71);
}

/* ---- bathroom fittings; wall side given by rq (fitting backs onto -Z local) ---- */
function wc(cx,cz,y,rq,g){
  var D=dims(rq,0.38,0.60);
  fsolid(D[0],0.40,D[1],cx,y+0.20,cz,MAT.white,g);
  var p=place(rq,cx,cz,0,-0.33);
  fbox(dims(rq,0.40,0.16)[0],0.60,dims(rq,0.40,0.16)[1],p[0],y+0.30,p[1],MAT.white,g);
  fbox(D[0]+0.03,0.05,D[1]*0.7,cx,y+0.42,cz+0.02,MAT.linen,g);
  planFurn("wc", cx, cz, 0.38, 0.68, rq, y);
}
function basin(cx,cz,y,rq,g,w){
  w=w||0.9;
  var D=dims(rq,w,0.50);
  /* wall-hung: the vanity floats 0.28 clear of the floor, which in a small
     bathroom is worth more than the cupboard it gives up */
  fsolid(D[0],0.50,D[1],cx,y+0.53,cz,MAT.wood,g);
  fbox(D[0]+0.03,0.05,D[1]+0.03,cx,y+0.805,cz,MAT.white,g);
  addCyl(0.02,0.02,0.22,cx,y+0.915,cz-0.13,MAT.steel,g,8,{furn:true});
  var p=place(rq,cx,cz,0,-0.26);
  fbox(dims(rq,w*0.8,0.025)[0],0.95,dims(rq,w*0.8,0.025)[1],p[0],y+1.55,p[1],MAT.carGlass,g);
  planFurn("basin", cx, cz, w, 0.50, rq, y);
}
function shower(x0,z0,x1,z1,y,g){
  var w=Math.abs(x1-x0), d=Math.abs(z1-z0), cx=(x0+x1)/2, cz=(z0+z1)/2;
  addBox(w,0.06,d,cx,y+0.03,cz,MAT.tileWet,g,{cast:false,furn:true});
  addBox(0.04,2.05,d,x1,y+1.03,cz,MAT.glass,g,{cast:false,furn:true});
  addCollider(x1-0.04,x1+0.04,z0,z1,y,y+2.05);
  addCyl(0.09,0.09,0.05,cx,y+2.15,cz,MAT.steel,g,10,{furn:true});
  addCyl(0.025,0.025,0.35,cx,y+2.35,cz,MAT.steel,g,8,{furn:true});
  planFurn("shower", cx, cz, w, d, 0, y);
}
function bathtub(cx,cz,y,w,d,g){
  fsolid(w,0.53,d,cx,y+0.265,cz,MAT.white,g);
  fbox(w-0.14,0.05,d-0.14,cx,y+0.51,cz,MAT.tileWet,g);
  planFurn("bath", cx, cz, w, d, 0, y);
}

function bookshelf(cx,cz,y,w,rq,g){
  var D=dims(rq,w,0.32);
  onPlinth(D[0],2.02,D[1], cx, y, cz, MAT.wood, g, 0.045, 0.06);
  var cols=[0xb8503f,0x3f6bb8,0xd8b23f,0x4b8f5a,0x8a4b9a];
  for(var s=0;s<4;s++){
    for(var i=0;i<Math.round(w/0.09);i++){
      var f=-w/2+0.06+i*0.09;
      var p=place(rq,cx,cz,f,0.02);
      var m = M(cols[(i+s)%5], {r:0.9});
      fbox(dims(rq,0.07,0.22)[0], 0.25, dims(rq,0.07,0.22)[1], p[0], y+0.36+s*0.48, p[1], m, g);
    }
  }
  planFurn("shelf", cx, cz, w, 0.32, rq, y);
}
function artwork(cx,cz,y,w,h,rq,g){
  var D=dims(rq,w,0.05);
  fbox(D[0],h,D[1],cx,y,cz,MAT.woodDark,g);
  var pal=[0xc06a4a,0x4a7fc0,0xd6b45a,0x5d8f6a];
  var m=M(pal[Math.floor(Math.random()*4)],{r:0.9});
  /* same fix as tvUnit: offset through place(), so a canvas hung on a side
     wall gets its face in front of its frame rather than inside it */
  var D2=dims(rq,w-0.1,0.02);
  var p2=place(rq,cx,cz,0,0.03);
  fbox(D2[0],h-0.1,D2[1],p2[0],y,p2[1],m,g);
}
/* ceilingFan() is gone. Every room that had one now has a wall-mounted split
   AC instead - see ac() below. A ceiling fan and a split unit fighting each
   other in the same 3.0 m room is a thing people do build, but it is not what
   was asked for and the fan was the cheaper-looking of the two. */
function downlight(cx,cz,y,g){
  var m=addCyl(0.07,0.07,0.03,cx,y-0.02,cz,MAT.lamp,g,10,{furn:true});
  m.castShadow=false; return m;
}
function pendant(cx,cz,y,g,drop){
  drop=drop||0.9;
  addCyl(0.012,0.012,drop,cx,y-drop/2,cz,MAT.black,g,6,{furn:true});
  var m=addCyl(0.20,0.09,0.22,cx,y-drop-0.11,cz,MAT.lamp,g,12,{furn:true});
  m.castShadow=false;
}
/* ---- split-unit AC, high on a wall ----
   A 1.0 m indoor unit: the body, the return grille across the top face and the
   angled discharge louvre along the bottom edge. rq gives the wall it backs
   onto, same convention as everything else - the unit faces local +Z. */
function ac(cx,cz,y,rq,g){
  var D = dims(rq,1.00,0.21);
  fbox(D[0],0.29,D[1], cx, y, cz, MAT.white, g);
  /* return grille on top */
  var gd = dims(rq,0.92,0.17);
  fbox(gd[0],0.02,gd[1], cx, y+0.15, cz, MAT.grille, g);
  /* discharge louvre, tipped down at the front */
  var lp = place(rq,cx,cz,0,0.085);
  var ld = dims(rq,0.90,0.08);
  var lv = fbox(ld[0],0.03,ld[1], lp[0], y-0.13, lp[1], MAT.grille, g);
  lv.rotation.y = rq*Math.PI/2;
  lv.rotation.x = 0.45;
  /* status LED, because at this scale it is the only thing that says "on" */
  var dp = place(rq,cx,cz,-0.36,0.105);
  addSphere(0.012, dp[0], y-0.05, dp[1], MAT.led, g, {furn:true});
  addCollider(cx-D[0]/2, cx+D[0]/2, cz-D[1]/2, cz+D[1]/2, y-0.15, y+0.15);
}

/* ---- interior wall lights ----
   Two kinds, both from the reference. wallLight() is a plaster half-cylinder
   uplighter, which is the fitting that actually lights a room like this: it
   washes the wall above it and leaves the ceiling plane clean. picLight() is
   the slim linear bar over a framed panel. Both back onto the wall given by
   rq and face local +Z. */
function wallLight(cx,cz,y,rq,g){
  var D = dims(rq,0.22,0.11);
  fbox(D[0],0.30,D[1], cx, y, cz, MAT.plaster, g);
  /* the lit mouth, pointing up - unlit geometry, but it catches the bloom */
  var m = addCyl(0.085,0.085,0.02, cx, y+0.16, cz, MAT.lamp, g, 12, {furn:true});
  m.castShadow = false;

}
function picLight(cx,cz,y,w,rq,g){
  var D = dims(rq, w, 0.05);
  fbox(D[0],0.05,D[1], cx, y, cz, MAT.steel, g);
  var sp = place(rq,cx,cz,0,0.035);
  var sd = dims(rq, w-0.06, 0.03);
  var m = fbox(sd[0],0.015,sd[1], sp[0], y-0.03, sp[1], MAT.lamp, g);
  m.castShadow = false;

}

/* ---- exterior wall light ----
   A bulkhead that throws light up and down the wall face. Used on the porch,
   the balcony soffit, the gate piers and along the side walls. */
function extLight(cx,cz,y,rq,g){
  var D = dims(rq,0.11,0.09);
  fbox(D[0],0.26,D[1], cx, y, cz, MAT.accent, g);
  /* NOT furn:true. These were tagged as furniture, which had two consequences:
     the "Empty" toggle - meant to strip the house back to shell and finishes -
     switched off every exterior light in the compound, and each disc was held
     out of the merge for the privilege. A bulkhead screwed to a boundary wall
     is not furniture. */
  var up   = addCyl(0.045,0.045,0.015, cx, y+0.135, cz, MAT.lamp, g, 10);
  var down = addCyl(0.045,0.045,0.015, cx, y-0.135, cz, MAT.lamp, g, 10);
  up.castShadow = false; down.castShadow = false;

  /* the pool this throws on the wall behind it, sitting just proud of the wall
     face so it passes the depth test; see MAT.wash */
  var dir = RQDIR[rq % 4];
  var q = new T.Mesh(new T.PlaneGeometry(0.62, 1.85), MAT.wash);
  q.position.set(cx - dir[0]*0.006, y, cz - dir[1]*0.006);
  if(dir[0] !== 0) q.rotation.y = Math.PI/2;
  q.castShadow = false; q.receiveShadow = false;
  g.add(q);
}

/* ---- door leaf and lining ----
   Until now the house had no door leaves at all: door() existed but was never
   called once, so every doorway in the building was a bare hole in a wall.
   These are generated from the opening data in PLAN rather than placed by
   hand, so a leaf can never turn up in a hole that is not there, and the 3D
   leaves and the plan's swing arcs are guaranteed to agree - see 06-plans.js.

   (ux,uz) is the hinge point in world coordinates and (dx,dz) the unit vector
   along the wall from the hinge towards the far jamb. `open` is the opening
   angle in radians, `hand` is +1 or -1 for the side the leaf swings to.

   No collider on the leaf. At 72 degrees it stands close enough to the wall to
   walk past, and a door you cannot open is worse than a door you can walk
   through. */
function doorLeaf(ux, uz, dx, dz, w, open, hand, y, g){
  var grp = new T.Group();
  grp.position.set(ux, y, uz);
  grp.rotation.y = Math.atan2(dx, dz) - hand*open;

  /* joinery, not MAT.wood. The loft reference has no dark timber in it at all,
     and nineteen orange doors would have been the loudest thing in the house. */
  var leaf = new T.Mesh(BOXG, MAT.joinery);
  leaf.scale.set(0.042, 2.06, w - 0.01);
  leaf.position.set(0, 1.03, (w - 0.01)/2);
  leaf.castShadow = true; leaf.receiveShadow = true;
  grp.add(leaf);

  /* lever handle on the leading edge, one each side of the leaf */
  for(var s = -1; s <= 1; s += 2){
    var h = new T.Mesh(BOXG, MAT.steel);
    h.scale.set(0.028, 0.028, 0.13);
    h.position.set(s*0.035, 1.04, w - 0.10);
    grp.add(h);
  }
  /* flatten, not FURN: a door is part of the building, so the Empty toggle
     must not take it away, and its three meshes should merge with everything
     else in the group rather than become a merge domain of their own. */
  grp.userData.flatten = true;
  g.add(grp);
  return grp;
}
function doorLining(cx, cz, w, horiz, t, y, g){
  /* the frame in the reveal: two jambs and a head, in white to match the
     architraves outside */
  var j = 0.035;
  addBox(horiz ? j : t+0.02, 2.10, horiz ? t+0.02 : j,
         horiz ? cx-w/2+j/2 : cx, y+1.05, horiz ? cz : cz-w/2+j/2, MAT.white, g, {cast:false});
  addBox(horiz ? j : t+0.02, 2.10, horiz ? t+0.02 : j,
         horiz ? cx+w/2-j/2 : cx, y+1.05, horiz ? cz : cz+w/2-j/2, MAT.white, g, {cast:false});
  addBox(horiz ? w : t+0.02, j, horiz ? t+0.02 : w,
         cx, y+2.10+j/2, cz, MAT.white, g, {cast:false});
}
