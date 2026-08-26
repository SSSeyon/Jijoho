"use strict";
/* ============================================================
   PART 4  -  DUPLEX, GROUND FLOOR
   local u = 0..13.55 (across, west->east)
   local v = 0..11.50 (front/road -> rear)
   ============================================================ */
function opH(u0,u1,sill,top,gl){ return {a:hx(u0), b:hx(u1), sill:sill, top:top, glass:gl}; }
function opV(v0,v1,sill,top,gl){ return {a:hz(v0), b:hz(v1), sill:sill, top:top, glass:gl}; }
var EXT = {t:0.23, mat:MAT.wallExt}, INT = {t:0.15, mat:MAT.wallInt};

/* ---------- plinth + ground slab ---------- */
addBox(HW+0.36, GF, HD+0.36, hx(HW/2), GF/2, hz(HD/2), MAT.stone, gGF, {});
addCollider(hx(0), hx(HW), hz(0), hz(HD), 0, GF);
slab(hx(0),hz(0),hx(HW),hz(HD), GF, 0.12, MAT.tileF, gGF, {cast:false});
/* porch / terrace slab in front */
addBox(12.35, GF, 2.20, hx(6.75), GF/2, hz(-1.10), MAT.stone, gGF, {});
addCollider(hx(0.6), hx(12.95), hz(-2.20), hz(0), 0, GF);
slab(hx(0.6),hz(-2.20),hx(12.95),hz(0), GF, 0.10, MAT.paverWarm, gGF, {cast:false});

/* ---------- plinth band ----------
   The 600 mm raised plinth used to meet the wall in a single flush plane, so
   from outside the house looked as though it had been extruded straight out of
   the ground. A projecting band with a weathered top gives the building a base
   to stand on and throws a continuous shadow line right round it - the same
   trick as the sills, at building scale. */
(function(){
  var pb = 0.055, ph = 0.16, yb = GF - ph/2;
  [[0,0,HW,0],[0,HD,HW,HD]].forEach(function(r){
    addBox(HW + pb*2 + 0.20, ph, EXT.t + pb*2, hx(HW/2), yb, hz(r[1]), MAT.wallExt, gGF, {cast:false});
  });
  [[0,0,0,HD],[HW,0,HW,HD]].forEach(function(r){
    addBox(EXT.t + pb*2, ph, HD + pb*2, hx(r[0]), yb, hz(HD/2), MAT.wallExt, gGF, {cast:false});
  });
  /* the weathering: a thin dark chamfer under the band, which is what actually
     reads as a shadow at a distance */
  [[0,0,HW,0],[0,HD,HW,HD]].forEach(function(r){
    addBox(HW + pb*2 + 0.20, 0.022, EXT.t + pb*2 - 0.02, hx(HW/2), yb - ph/2 - 0.011, hz(r[1]), MAT.accent, gGF, {cast:false});
  });
  [[0,0,0,HD],[HW,0,HW,HD]].forEach(function(r){
    addBox(EXT.t + pb*2 - 0.02, 0.022, HD + pb*2, hx(r[0]), yb - ph/2 - 0.011, hz(HD/2), MAT.accent, gGF, {cast:false});
  });
})();

/* Suspended POP ceiling. Without it you look up at the underside of the first-
   floor slab and see the floor tiles of the storey above. */
[[0.0,0.0,5.0,11.5],[5.0,0.0,6.5,2.60],[5.0,7.36,6.5,11.5],[6.5,0.0,13.55,11.5]].forEach(function(r){
  addBox(r[2]-r[0]-0.02, 0.04, r[3]-r[1]-0.02, hx((r[0]+r[2])/2), GF+CH-0.02, hz((r[1]+r[3])/2), MAT.ceiling, gFF, {cast:false});
});
addBox(12.35, 0.04, 2.20, hx(6.75), GF+CH-0.02, hz(-1.10), MAT.ceiling, gFF, {cast:false});
/* both live in the first-floor group so "Upper floor off" lifts the ceiling too */
/* entrance steps - 400 mm treads, deep enough to stand on */
(function(){
  var x0=hx(4.85), x1=hx(9.15);
  addBox(x1-x0,0.40,0.40,(x0+x1)/2,0.20,hz(-2.00),MAT.stone,gGF,{});
  addFloor(x0,x1,hz(-2.20),hz(-1.80),0.40);
  addBox(x1-x0,0.20,0.40,(x0+x1)/2,0.10,hz(-2.40),MAT.stone,gGF,{});
  addFloor(x0,x1,hz(-2.60),hz(-2.20),0.20);
})();
/* rear steps to terrace */
(function(){
  var x0=hx(5.3), x1=hx(7.3);
  addBox(x1-x0,0.40,0.40,(x0+x1)/2,0.20,hz(11.70),MAT.stone,gGF,{});
  addFloor(x0,x1,hz(11.50),hz(11.90),0.40);
  addBox(x1-x0,0.20,0.40,(x0+x1)/2,0.10,hz(12.10),MAT.stone,gGF,{});
  addFloor(x0,x1,hz(11.90),hz(12.30),0.20);
})();

/* ---------- exterior walls ---------- */
hwall(0,0,HW,0,{h:CH,t:EXT.t,mat:EXT.mat,y:GF,group:gGF,trim:-1,openings:[
  opH(0.8,4.4,0.45,2.55), opH(6.2,8.0,0.0,2.50,true), opH(9.6,12.4,0.90,2.45)
]});
hwall(0,HD,HW,HD,{h:CH,t:EXT.t,mat:EXT.mat,y:GF,group:gGF,trim:1,openings:[
  opH(1.0,3.6,0.90,2.45), opH(5.6,7.0,0.0,2.45,true), opH(9.2,11.0,1.10,2.35), opH(11.9,12.9,0.0,2.35,true)
]});
hwall(0,0,0,HD,{h:CH,t:EXT.t,mat:EXT.mat,y:GF,group:gGF,trim:-1,openings:[
  opV(1.4,3.4,0.45,2.55), opV(4.6,6.4,0.45,2.55), opV(8.2,10.2,0.90,2.45)
]});
hwall(HW,0,HW,HD,{h:CH,t:EXT.t,mat:EXT.mat,y:GF,group:gGF,trim:1,openings:[
  opV(1.2,3.2,0.90,2.45), opV(5.0,5.9,1.60,2.35), opV(7.2,9.0,1.10,2.35)
]});

/* ---------- interior walls ---------- */
hwall(5.0,0,5.0,HD,{h:CH,t:INT.t,mat:INT.mat,y:GF,group:gGF,openings:[
  opV(1.0,2.0,0,2.20), opV(8.3,10.6,0,2.45)
]});
hwall(0,7.0,5.0,7.0,{h:CH,t:INT.t,mat:INT.mat,y:GF,group:gGF,openings:[ opH(1.0,4.0,0,2.45) ]});
hwall(8.55,0,8.55,HD,{h:CH,t:INT.t,mat:INT.mat,y:GF,group:gGF,openings:[
  opV(1.4,2.3,0,2.20), opV(4.85,5.65,0,2.20), opV(7.4,9.4,0,2.45)
]});
hwall(8.55,4.6,HW,4.6,{h:CH,t:INT.t,mat:INT.mat,y:GF,group:gGF});
/* The store door has moved 1.5 m east. It used to open at u 10.9-11.8, which
   is the middle of the kitchen's main worktop run: the leaf swung straight into
   the back of the counter and the cooker stood in the doorway. Nobody sees that
   in a walkthrough, because you can walk through a worktop. */
hwall(8.55,6.4,HW,6.4,{h:CH,t:INT.t,mat:INT.mat,y:GF,group:gGF,openings:[ opH(12.4,13.3,0,2.20) ]});
hwall(10.4,4.6,10.4,6.4,{h:CH,t:INT.t,mat:INT.mat,y:GF,group:gGF});
hwall(8.55,10.2,HW,10.2,{h:CH,t:INT.t,mat:INT.mat,y:GF,group:gGF,openings:[ opH(9.0,10.0,0,2.20) ]});

/* skirting accent on the foyer feature wall */
addBox(0.06,2.6,3.4, hx(8.47), GF+1.3, hz(1.3), MAT.stone, gGF, {});

/* ---------- staircase ---------- */
/* 18 risers of 183 mm; the 18th arrives on the first-floor slab itself,
   so only 17 treads are built and the flight lands exactly at v = 7.36 */
var RISERS = 18, STEPS = 17, RISE = (FF-GF)/RISERS, TREAD = 0.28, SW0 = 5.0, SW1 = 6.5, SV0 = 2.6;
(function(){
  var x0=hx(SW0), x1=hx(SW1);
  for(var i=1;i<=STEPS;i++){
    var zA = hz(SV0 + TREAD*(i-1)), zB = hz(SV0 + TREAD*i);
    var topY = GF + RISE*i;
    addBox(x1-x0, topY-GF, TREAD, (x0+x1)/2, GF+(topY-GF)/2, (zA+zB)/2, i%2 ? MAT.tileF : MAT.tileF, gGF, {solid:true});
    addBox(x1-x0+0.02, 0.03, TREAD+0.03, (x0+x1)/2, topY+0.015, (zA+zB)/2 - 0.015, MAT.woodDark, gGF, {cast:false});
    addFloor(x0,x1,zA,zB,topY);
  }
  /* sloped handrail on the open side */
  var run=TREAD*STEPS;
  var zBot=hz(SV0), zTop=hz(SV0+run);
  var ang=Math.atan2(FF-GF, run);
  var len=Math.sqrt(run*run+Math.pow(FF-GF,2));
  var r=new T.Mesh(BOXG, MAT.wood);
  r.scale.set(0.09, 0.09, len);
  r.position.set(x1-0.05, (GF+FF)/2+0.98, (zBot+zTop)/2);
  r.rotation.x = ang; r.castShadow=true; gGF.add(r);
  for(var j=0;j<=RISERS;j+=1){
    var zz=hz(SV0+run*j/RISERS), yy=GF+RISE*j;
    addBox(0.035,0.95,0.035, x1-0.05, yy+0.50, zz, MAT.steel, gGF, {cast:false});
  }
  addCollider(x1-0.12,x1+0.02, zBot, zTop, GF, FF+1.0);
  /* under-stair store door */
  addBox(0.05,2.0,0.85, hx(SW1)-0.03, GF+1.0, hz(3.4), MAT.wood, gGF, {});
})();

/* ============================================================
   GROUND FLOOR FURNITURE
   ============================================================ */
/* --- living room  (u 0..5.0, v 0..7.0  =  32.8 m2 clear) ---
   One long sofa against the west wall facing the TV, one armchair, and the
   round low table between them. The second armchair has gone: two of them
   plus the sofa made a three-sided enclosure around a 1.15 m table in a room
   only 4.81 m wide, and the gap left to walk between the seating and the TV
   was under 700 mm. */
rugMat(hx(2.45), hz(3.5), GF, 3.2, 2.8, gGF);
sofa(hx(0.58), hz(3.40), GF, 2.40, 3, gGF);
armchair(hx(2.75), hz(1.65), GF, 0, gGF);
coffeeTable(hx(2.55), hz(3.50), GF, 0.95, 0.95, gGF);
tvUnit(hx(4.72), hz(3.50), GF, 1.90, 1, gGF);
potPlant(hx(0.62), hz(6.35), GF, gGF, 1.15);
artwork(hx(4.86), hz(1.6), GF+1.65, 1.2, 0.85, 1, gGF);
picLight(hx(4.80), hz(1.6), GF+2.42, 1.1, 1, gGF);
ac(hx(2.50), hz(0.20), GF+2.55, 0, gGF);
/* uplighters on the two long walls - the fittings that actually light a room
   like this, washing the wall and leaving the ceiling plane clean */
[2.10, 5.30].forEach(function(v){
  wallLight(hx(0.20), hz(v), GF+1.95, 1, gGF);
});
[[1.4,1.6],[3.8,1.6],[1.4,5.4],[3.8,5.4]].forEach(function(p){ downlight(hx(p[0]),hz(p[1]),GF+CH,gGF); });

/* --- dining  (u 0..5.0, v 7.0..11.5  =  21.1 m2 clear) ---
   A round six-seat table on a single pedestal, not the eight-seat oval that
   was here. The oval was 2.40 m long with chairs pulled out either side, and
   its west chairs stood inside the sideboard: 1.42..1.88 against a sideboard
   ending at 1.65. Round also means no corner to walk into on the way through
   to the rear lobby, which is the route everyone actually takes. */
rugMat(hx(2.55), hz(9.20), GF, 2.9, 2.9, gGF);
diningSet(hx(2.55), hz(9.20), GF, 6, 1, gGF);
pendant(hx(2.55), hz(9.20), GF+CH, gGF, 1.15);
/* sideboard against the west wall, now clear of the chairs by 300 mm */
fsolid(0.42,0.78,1.50, hx(0.34), GF+0.39, hz(9.20), MAT.joinery, gGF);
addBox(0.04,0.90,0.90, hx(0.14), GF+1.78, hz(9.20), MAT.steel, gGF, {});
wallLight(hx(0.20), hz(10.70), GF+1.95, 1, gGF);
potPlant(hx(4.45), hz(10.95), GF, gGF, 1.0);

/* --- foyer --- */
rugMat(hx(6.75), hz(1.2), GF, 1.6, 2.2, gGF, MAT.fabric2);
/* The console ran ACROSS door D2, not along a wall: 1.30 m of it laid out on
   the u axis, centred on u 8.28, so 380 mm of sideboard stood inside a door
   opening that runs v 1.40-2.30 in the u = 8.55 wall. Turned through 90 deg
   and moved up to the clear length of that wall above the door. */
fsolid(0.38,0.80,1.30, hx(8.36), GF+0.40, hz(0.72), MAT.woodDark, gGF);
addBox(0.05,1.10,0.85, hx(8.52), GF+1.85, hz(0.72), MAT.steel, gGF, {});
/* and the pot stood on the diagonal between the front door and D1, which is
   the single most walked line in the house. Into the corner behind it. */
potPlant(hx(5.45), hz(0.45), GF, gGF, 1.2);
pendant(hx(6.75), hz(1.3), GF+CH, gGF, 1.3);
downlight(hx(7.5), hz(2.4), GF+CH, gGF);

/* --- guest bedroom  (u 8.55..13.55, v 0..4.6  =  23.0 m2) ---
   A guest room and nothing else now. The desk, the bookshelf and the sofa
   that made this a dual-purpose study have gone upstairs into the library,
   which is where a study belongs once there is one - a room that is half
   office and half spare bed is not much good as either when somebody is
   actually staying. Headboard against the east wall so the window and the
   door both stay clear, and the powder room next door serves it. */
rugMat(hx(11.40), hz(2.30), GF, 3.2, 2.6, gGF);
bed(hx(12.25), hz(2.30), GF, 1.60, 2.00, 1, gGF, MAT.linen);
/* The wardrobe used to run to v = 4.66 against an inner wall face at 4.525,
   so 135 mm of it stood inside the wall. It is 600 mm deep now, set to its
   own face, and 2.00 m wide rather than 2.40 - which also opens the gap
   between it and the foot of the bed from 0.94 m to a usable 1.25 m. */
wardrobe(hx(10.30), hz(4.22), GF, 2.00, 2, gGF);
/* The reading chair used to stand at v = 1.30, directly in the arc of the
   bedroom door - see the swing check in 06-plans.js, which is what found it.
   Moved down the same wall, where it also gets the wall light above it. */
armchair(hx(9.10), hz(3.30), GF, 3, gGF);
fsolid(0.44,0.42,0.44, hx(10.05), GF+0.21, hz(3.30), MAT.woodPale, gGF);
artwork(hx(11.30), hz(4.44), GF+1.70, 1.1, 0.8, 2, gGF);
wallLight(hx(8.72), hz(3.30), GF+1.95, 1, gGF);
downlight(hx(10.2),hz(1.6),GF+CH,gGF); downlight(hx(12.3),hz(3.4),GF+CH,gGF);
ac(hx(11.0), hz(0.20), GF+2.55, 0, gGF);

/* --- powder room --- */
wc(hx(9.05), hz(5.9), GF, 2, gGF);
basin(hx(9.9), hz(4.95), GF, 0, gGF, 0.75);
/* 1.85 x 1.80 m, and a WC and a basin correct at full size leave a walker
   nowhere to stand in it. Same call the BQ bathrooms use: the fittings stay
   drawn, you just walk through them rather than into them. */
clearColliders(hx(8.62), hz(4.68), hx(10.33), hz(6.32));
addBox(1.85,0.02,1.80, hx(9.475), GF+0.011, hz(5.5), MAT.tileWet, gGF, {cast:false});
downlight(hx(9.5),hz(5.5),GF+CH,gGF);

/* --- store --- */
fsolid(2.90,2.10,0.45, hx(11.95), GF+1.05, hz(4.9), MAT.wood, gGF);

/* --- kitchen --- */
addBox(5.00,0.02,3.80, hx(11.05), GF+0.011, hz(8.3), MAT.tileWet, gGF, {cast:false});
counterRun(hx(9.0), hz(6.75), hx(12.1), hz(6.75), GF, gGF, true);
counterRun(hx(13.1), hz(7.45), hx(13.1), hz(9.0), GF, gGF, false);
cooker(hx(10.6), hz(6.78), GF, 0, gGF);
fridge(hx(12.85), hz(9.70), GF, 2, gGF);
island(hx(10.9), hz(8.9), GF, 2.20, 0.95, gGF);
pendant(hx(10.3), hz(8.85), GF+CH, gGF, 1.1);
pendant(hx(11.5), hz(8.85), GF+CH, gGF, 1.1);
[[9.6,7.4],[12.6,7.4],[9.6,9.8],[12.6,9.8]].forEach(function(p){ downlight(hx(p[0]),hz(p[1]),GF+CH,gGF); });

/* --- pantry / laundry --- */
/* The pantry is a 5.00 x 1.30 m corridor with a door at each end - D8 from
   the kitchen at u 9.00-10.00, GD3 to the yard at u 11.90-12.90 - and both
   ends were built shut. The tall run stood 350 mm in front of GD3 and the
   machine stood in the middle of D8. Everything is now on the v = 10.20 side,
   which leaves an 800 mm lane the full length of the room. */
fsolid(2.20,2.10,0.50, hx(12.30), GF+1.05, hz(10.47), MAT.wood, gGF);
fsolid(0.62,0.85,0.62, hx(10.40), GF+0.42, hz(10.53), MAT.white, gGF);
addBox(0.42,0.42,0.03, hx(10.40), GF+0.55, hz(10.85), MAT.carGlass, gGF, {});
downlight(hx(10.8),hz(10.8),GF+CH,gGF);

/* --- rear lobby / breakfast --- */
/* a breakfast bar against the left wall keeps the run from the kitchen
   to the rear door completely clear */
rugMat(hx(6.40), hz(8.6), GF, 1.8, 2.0, gGF, MAT.rug);
/* "against the left wall" was the intention, but the left wall of this room
   is D7 - a 2.30 m opening running v 8.30-10.60 - so the bar was standing in
   the doorway to the dining room with its stools in the middle of it. It is
   on the kitchen wall now, below D6, and the pot has come off the rear door
   GD2 and gone into the one corner of the room nothing opens into. */
fsolid(0.60, 0.78, 1.40, hx(8.20), GF+0.39, hz(10.30), MAT.woodDark, gGF);
addBox(0.70, 0.06, 1.50, hx(8.20), GF+0.81, hz(10.30), MAT.counter, gGF, {furn:true});
stool(hx(7.60), hz(9.95), GF, gGF);
stool(hx(7.60), hz(10.65), GF, gGF);
potPlant(hx(5.45), hz(7.90), GF, gGF, 1.1);
downlight(hx(6.75),hz(8.2),GF+CH,gGF);
pendant(hx(7.90), hz(10.30), GF+CH, gGF, 1.0);

/* --- porch --- */
potPlant(hx(2.2), hz(-1.05), GF, gGF, 1.35);
potPlant(hx(11.4), hz(-1.05), GF, gGF, 1.35);
armchair(hx(3.9), hz(-0.95), GF, 0, gGF);
armchair(hx(9.9), hz(-0.95), GF, 0, gGF);
addBox(0.55,0.55,0.55, hx(4.9), GF+0.28, hz(-0.95), MAT.woodPale, gGF, {});
/* bulkheads on the front wall: one either side of the entrance doors, then
   one at each end of the porch so the whole 12.35 m of it is lit */
[1.20, 5.40, 8.80, 12.20].forEach(function(u){
  extLight(hx(u), hz(0.14), GF+2.05, 2, gGF);
});
/* and three in the porch soffit, over the steps */
[3.0, 6.75, 10.5].forEach(function(u){ downlight(hx(u), hz(-1.60), GF+CH, gGF); });
