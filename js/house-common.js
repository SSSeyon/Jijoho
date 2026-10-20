"use strict";
/* ============================================================
   HOUSE KIT  -  shared by every design
   ------------------------------------------------------------
   Loaded after the site and before whichever design the page was asked
   for (see the loader in index.html). Everything here works in the local
   u/v frame of the house: u across the plot west->east, v from the house's
   front wall back towards the rear. hx()/hz() turn u/v into world x/z, and a
   design sets HZ so that v = 0 lands on its own front wall.

   A design file has to leave four things behind for the shared code:
     - walls built through hwall(), so the plans, door leaves and schedules
       can be generated from them;
     - rooms pushed onto ZONES (in front of the shared outdoor ones);
     - DESIGN, describing its floor plates, stairs, roofed footprint and
       viewpoints - 06-plans.js and 07-controls.js read nothing else about
       the building;
     - a call to placeModels() once all its furniture is queued.
   ============================================================ */

function opH(u0,u1,sill,top,gl){ return {a:hx(u0), b:hx(u1), sill:sill, top:top, glass:gl}; }
function opV(v0,v1,sill,top,gl){ return {a:hz(v0), b:hz(v1), sill:sill, top:top, glass:gl}; }
var EXT = {t:0.23, mat:MAT.wallExt}, INT = {t:0.15, mat:MAT.wallInt};

/* rooms, in front of the shared outdoor zones */
function zonesU(list){
  ZONES.unshift.apply(ZONES, list.map(function(r){
    return Z(r[0], r[1], hx(r[2]), hz(r[3]), hx(r[4]), hz(r[5]));
  }));
}

/* ---------- ground ----------
   The 600 mm plinth under every enclosed or roofed part of a house: a stone
   base, a collider across its full height so it can only be climbed by its
   steps, and the floor finish on top. Courts are left out of the plinth and
   built a step lower with court(). */
function plinth(u0,v0,u1,v1,mat){
  var w = u1-u0, d = v1-v0;
  addBox(w+0.12, GF, d+0.12, hx((u0+u1)/2), GF/2, hz((v0+v1)/2), MAT.stone, gGF, {});
  addCollider(hx(u0), hx(u1), hz(v0), hz(v1), 0, GF);
  slab(hx(u0), hz(v0), hx(u1), hz(v1), GF, 0.10, mat || MAT.tileF, gGF, {cast:false});
}
/* an open court, one 150 mm step below the floor around it */
function court(u0,v0,u1,v1,mat){
  var y = GF - 0.15, w = u1-u0, d = v1-v0;
  addBox(w, y, d, hx((u0+u1)/2), y/2, hz((v0+v1)/2), MAT.stone, gGF, {});
  slab(hx(u0), hz(v0), hx(u1), hz(v1), y, 0.06, mat || MAT.paverWarm, gGF, {cast:false});
}
/* Two 200 mm risers down from the plinth to the ground. `side` is the
   direction you walk to go DOWN them: '-v' off the front, '+v' off the rear,
   '-u' off the west side, '+u' off the east. a0..a1 is the run along the edge. */
function steps(a0, a1, edge, side){
  var alongU = (side === '-v' || side === '+v'), s = (side === '-v' || side === '-u') ? -1 : 1;
  [[0.40, 0], [0.20, 0.40]].forEach(function(t){
    var h = t[0], c0 = edge + s*t[1], c1 = edge + s*(t[1]+0.40);
    var cMin = Math.min(c0,c1), cMax = Math.max(c0,c1);
    if(alongU){
      addBox(a1-a0, h, 0.40, hx((a0+a1)/2), h/2, hz((cMin+cMax)/2), MAT.stone, gGF, {});
      addFloor(hx(a0), hx(a1), hz(cMin), hz(cMax), h);
    } else {
      addBox(0.40, h, a1-a0, hx((cMin+cMax)/2), h/2, hz((a0+a1)/2), MAT.stone, gGF, {});
      addFloor(hx(cMin), hx(cMax), hz(a0), hz(a1), h);
    }
  });
}

/* ---------- floors and ceilings ---------- */
function floorFF(u0,v0,u1,v1,mat){
  slab(hx(u0), hz(v0), hx(u1), hz(v1), FF, SLAB, MAT.wallExt, gFF, {});
  addBox(u1-u0-0.02, 0.03, v1-v0-0.02, hx((u0+u1)/2), FF-0.010, hz((v0+v1)/2), mat || MAT.tileF, gFF, {cast:false});
}
/* A flat POP ceiling. Under a first floor it goes in gFF, so "Upper floor"
   lifts it with the floor above; under a roof it goes in gRoof, so "Roof off"
   lets you look down into the room. */
function ceiling(u0,v0,u1,v1,y,g){
  addBox(u1-u0-0.02, 0.04, v1-v0-0.02, hx((u0+u1)/2), y-0.02, hz((v0+v1)/2), MAT.ceiling, g, {cast:false});
}
function downlights(u0,v0,u1,v1,y,g){
  var w = u1-u0, d = v1-v0, nu = w > 3.6 ? 2 : 1, nv = d > 3.6 ? 2 : 1, i, j;
  for(i=0;i<nu;i++) for(j=0;j<nv;j++){
    downlight(hx(u0 + w*(i+0.5)/nu), hz(v0 + d*(j+0.5)/nv), y, g);
  }
}

/* ---------- structure ---------- */
function column(u, v, y0, h, g, s){
  s = s || 0.26;
  addBox(s, h, s, hx(u), y0 + h/2, hz(v), MAT.white, g || gGF, {solid:true});
}

/* ---------- roofs ----------
   A monopitch plane, tilted so it falls towards one edge of its rectangle.
   `fall` names the low side: '+v', '-v', '+u' or '-u'. The plane passes
   through height `lowY` along the coordinate `lowAt` and rises at `slope`
   per metre away from it - so several pieces built with the same lowAt,
   lowY and slope are one continuous roof. Returns y(u,v) for that plane,
   which is what the wall infill above single-storey walls is cut to. */
function shed(u0,v0,u1,v1, fall, lowAt, lowY, slope, g, mat){
  var alongV = (fall === '+v' || fall === '-v');
  function y(u,v){
    var c = alongV ? v : u;
    return lowY + slope * Math.abs(c - lowAt);
  }
  var w = u1-u0, d = v1-v0, cu = (u0+u1)/2, cv = (v0+v1)/2;
  var run = alongV ? d : w, len = Math.sqrt(run*run + Math.pow(run*slope,2)), ang = Math.atan(slope);
  var th = 0.16;
  var m = addBox(alongV ? w : len, th, alongV ? len : d, hx(cu), y(cu,cv) + th/2, hz(cv), mat || MAT.roof, g || gRoof, {});
  if(fall === '+v') m.rotation.x =  ang;
  if(fall === '-v') m.rotation.x = -ang;
  if(fall === '+u') m.rotation.z = -ang;
  if(fall === '-u') m.rotation.z =  ang;
  /* a gutter along the low edge, which is the line the eye reads the roof by */
  var lowEdge = (fall === '+v') ? v1 : (fall === '-v') ? v0 : (fall === '+u') ? u1 : u0;
  if(alongV) addBox(w, 0.12, 0.14, hx(cu), y(cu, lowEdge) + 0.02, hz(lowEdge), MAT.accent, g || gRoof, {cast:false});
  else       addBox(0.14, 0.12, d, hx(lowEdge), y(lowEdge, cv) + 0.02, hz(cv), MAT.accent, g || gRoof, {cast:false});
  return y;
}

/* Wall infill under a sloping roof: a wall segment whose top runs from hA at
   (u0,v0) to hB at (u1,v1), standing on baseY. It closes the triangle between
   the top of a storey-high wall and the roof that slopes away above it. */
function wedge(u0,v0,u1,v1, baseY, hA, hB, t, g, mat){
  if(hA < 0.02 && hB < 0.02) return;
  var alongV = Math.abs(u1-u0) < 1e-6;
  var len = alongV ? Math.abs(v1-v0) : Math.abs(u1-u0);
  var geo = new T.BoxGeometry(len, 1, t || EXT.t);
  var p = geo.attributes.position;
  for(var i=0;i<p.count;i++){
    var x = p.getX(i), f = (x + len/2) / len;
    p.setY(i, p.getY(i) > 0 ? Math.max(0.02, hA + (hB - hA)*f) : 0);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  var m = new T.Mesh(geo, mat || MAT.wallExt);
  m.position.set(hx((u0+u1)/2), baseY, hz((v0+v1)/2));
  /* local +x has to run from (u0,v0) to (u1,v1) */
  if(alongV) m.rotation.y = (v1 > v0) ? -Math.PI/2 : Math.PI/2;
  else if(u1 < u0) m.rotation.y = Math.PI;
  m.castShadow = true; m.receiveShadow = true;
  (g || gGF).add(m);
}

/* ---------- breeze-block screen ----------
   A pierced block screen stood a little off a facade: it shades the wall and
   the glass behind it, lets the air through, and takes the security that
   would otherwise be bars across the windows. Drawn as the lattice it reads
   as from a few metres away - fins and bars at block spacing. */
function screenWall(u0,v0,u1,v1, y0, h, g){
  g = g || gGF;
  var alongV = Math.abs(u1-u0) < 1e-6;
  var len = alongV ? Math.abs(v1-v0) : Math.abs(u1-u0), P = 0.30, i;
  var a0 = alongV ? Math.min(v0,v1) : Math.min(u0,u1);
  var n = Math.max(2, Math.round(len / P));
  for(i=0;i<=n;i++){
    var a = a0 + len*i/n;
    addBox(alongV ? 0.14 : 0.09, h, alongV ? 0.09 : 0.14,
           alongV ? hx(u0) : hx(a), y0 + h/2, alongV ? hz(a) : hz(v0), MAT.white, g, {});
  }
  var rows = Math.max(2, Math.round(h / P));
  for(i=0;i<=rows;i++){
    var yy = y0 + h*i/rows;
    addBox(alongV ? 0.14 : len, 0.07, alongV ? len : 0.14,
           alongV ? hx(u0) : hx(a0 + len/2), yy, alongV ? hz(a0 + len/2) : hz(v0), MAT.white, g, {});
  }
  if(alongV) addCollider(hx(u0)-0.08, hx(u0)+0.08, hz(a0), hz(a0+len), y0, y0+h);
  else       addCollider(hx(a0), hx(a0+len), hz(v0)-0.08, hz(v0)+0.08, y0, y0+h);
}

/* ---------- dog-leg stair ----------
   Eighteen risers between the floors in two flights of nine, side by side
   in a 2.4 m wide well, with a half landing at the far end. A dog-leg comes
   back on itself, so it arrives upstairs above the end it starts from.

   `start` is the end you set off from: 'v0' or 'v1'. Flight A climbs the
   west half away from it; flight B returns up the east half and steps off at
   the same end, upstairs. Treads are solid down to the floor - nothing
   walks under this stair - and every tread registers a floor so the walker
   climbs it. A spine wall between the flights carries the handrail. */
function dogleg(u0,v0,u1,v1,start,g){
  g = g || gGF;
  var R = 18, rise = (FF - GF) / R, T = 0.28, um = (u0+u1)/2;
  var dir = (start === 'v0') ? 1 : -1, s0 = (start === 'v0') ? v0 : v1;
  var land0 = s0 + dir*T*8, landEnd = (start === 'v0') ? v1 : v0;
  function tread(ua, ub, va, vb, top){
    var vMin = Math.min(va,vb), vMax = Math.max(va,vb);
    addBox(ub-ua, top-GF, vMax-vMin, hx((ua+ub)/2), GF + (top-GF)/2, hz((vMin+vMax)/2), MAT.tileF, g, {solid:true});
    addBox(ub-ua, 0.03, vMax-vMin, hx((ua+ub)/2), top+0.015, hz((vMin+vMax)/2), MAT.woodDark, g, {cast:false});
    addFloor(hx(ua), hx(ub), hz(vMin), hz(vMax), top);
  }
  var i;
  for(i=1;i<=8;i++) tread(u0, um-0.04, s0 + dir*T*(i-1), s0 + dir*T*i, GF + rise*i);
  tread(u0, u1, land0, landEnd, GF + rise*9);
  for(i=1;i<=8;i++) tread(um+0.04, u1, land0 - dir*T*(i-1), land0 - dir*T*i, GF + rise*(9+i));
  /* spine wall, carrying a timber handrail on top */
  var sv0 = Math.min(s0, land0), sv1 = Math.max(s0, land0);
  addBox(0.08, FF + 1.0 - GF, sv1-sv0, hx(um), GF + (FF + 1.0 - GF)/2, hz((sv0+sv1)/2), MAT.wallInt, g, {solid:true});
  addBox(0.10, 0.06, sv1-sv0, hx(um), FF + 1.03, hz((sv0+sv1)/2), MAT.wood, g, {cast:false});
  /* upstairs: guard the drop over the start of flight A */
  rail(hx(u0), hz(s0), hx(um), hz(s0), FF, gFF);
  DESIGN.stairs.push({u0:u0, v0:v0, u1:u1, v1:v1, start:start, risers:R, rise:rise, tread:T});
}

/* ---------- gym equipment ----------
   A treadmill running along z with its console at the -z end, and a flat
   bench under a two-post rack with a loaded bar across x. World positions. */
function gymKit(tx, tz, bx, bz, y, g){
  var s, i;
  fsolid(0.78, 0.14, 1.72, tx, y+0.07, tz, MAT.black, g);
  fbox(0.52, 0.03, 1.52, tx, y+0.155, tz, MAT.asphalt, g);
  for(s=-1;s<=1;s+=2){
    fbox(0.12, 0.05, 1.52, tx+s*0.32, y+0.165, tz, MAT.white, g);
    addCyl(0.026,0.026,1.02, tx+s*0.30, y+0.62, tz-0.72, MAT.steel, g, 8, {furn:true});
    fbox(0.055, 0.05, 0.40, tx+s*0.30, y+1.00, tz-0.53, MAT.steel, g);
  }
  fbox(0.64, 0.28, 0.10, tx, y+1.20, tz-0.76, MAT.black, g);
  fbox(0.44, 0.18, 0.02, tx, y+1.22, tz-0.70, MAT.accent, g);

  fsolid(0.32, 0.11, 1.22, bx, y+0.455, bz, MAT.black, g);
  fbox(0.14, 0.34, 0.86, bx, y+0.23, bz, MAT.steel, g);
  for(i=-1;i<=1;i+=2) fbox(0.44, 0.06, 0.10, bx, y+0.03, bz+i*0.54, MAT.black, g);
  for(i=-1;i<=1;i+=2){
    addCyl(0.034,0.040,1.22, bx+i*0.46, y+0.61, bz+0.42, MAT.steel, g, 8, {furn:true});
    fbox(0.10,0.09,0.16, bx+i*0.46, y+1.20, bz+0.36, MAT.black, g);
  }
  var bar = addCyl(0.017,0.017,1.62, bx, y+1.24, bz+0.42, MAT.steel, g, 8, {furn:true});
  bar.rotation.z = Math.PI/2;
  [0.60, 0.68].forEach(function(o){
    for(i=-1;i<=1;i+=2){
      var pl = addCyl(0.21,0.21,0.045, bx+i*o, y+1.24, bz+0.42, MAT.black, g, 14, {furn:true});
      pl.rotation.z = Math.PI/2;
    }
  });
}

/* ---------- the carport roof becomes the solar array ----------
   PV on the carport rather than the house: it is easier to reach and clean,
   it shades the cars, and it frees the house roof to be a roof. 21 panels
   at about 400 W is roughly 8 kWp. */
function solarCarport(){
  gSolar = new T.Group();
  gRoofSite.add(gSolar);
  var pv = M(0x1a2740,{r:0.25,m:0.4}), frame = MAT.steel;
  for(var i=0;i<7;i++) for(var j=0;j<3;j++){
    var x = -8.85 + i*1.13, z = -15.7 + j*1.85;
    var p = addBox(1.04, 0.04, 1.74, x, 3.30, z, pv, gSolar, {cast:false});
    p.rotation.x = -0.06;
    addBox(1.08, 0.03, 0.04, x, 3.26, z - 0.88, frame, gSolar, {cast:false});
  }
}
