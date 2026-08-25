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
addBox(11.50, GF, 1.80, hx(6.75), GF/2, hz(-0.90), MAT.stone, gGF, {});
addCollider(hx(1.0), hx(12.5), hz(-1.80), hz(0), 0, GF);
slab(hx(1.0),hz(-1.80),hx(12.5),hz(0), GF, 0.10, MAT.paverWarm, gGF, {cast:false});

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
addBox(11.5, 0.04, 1.80, hx(6.75), GF+CH-0.02, hz(-0.90), MAT.ceiling, gFF, {cast:false});
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
hwall(8.55,6.4,HW,6.4,{h:CH,t:INT.t,mat:INT.mat,y:GF,group:gGF,openings:[ opH(10.9,11.8,0,2.20) ]});
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
/* --- living room --- */
rugMat(hx(2.6), hz(3.5), GF, 3.4, 2.6, gGF);
sofa(hx(1.05), hz(3.4), GF, 2.6, 3, gGF);
armchair(hx(2.6), hz(1.75), GF, 0, gGF);
armchair(hx(2.6), hz(5.1), GF, 2, gGF);
coffeeTable(hx(2.7), hz(3.5), GF, 1.15, 0.65, gGF);
tvUnit(hx(4.55), hz(3.5), GF, 2.0, 1, gGF);
potPlant(hx(0.55), hz(6.4), GF, gGF, 1.15);
artwork(hx(4.86), hz(1.6), GF+1.65, 1.2, 0.85, 1, gGF);
ceilingFan(hx(2.5), hz(3.5), GF+CH, gGF);
[[1.4,1.6],[3.8,1.6],[1.4,5.4],[3.8,5.4]].forEach(function(p){ downlight(hx(p[0]),hz(p[1]),GF+CH,gGF); });

/* --- dining --- */
rugMat(hx(2.5), hz(9.3), GF, 3.2, 2.2, gGF);
diningSet(hx(2.5), hz(9.3), GF, 8, 1, gGF);
pendant(hx(2.5), hz(9.3), GF+CH, gGF, 1.05);
fsolid(1.60,0.85,0.45, hx(0.85), GF+0.42, hz(9.3), MAT.wood, gGF);
addBox(0.90,0.90,0.04, hx(0.62), GF+1.75, hz(9.3), MAT.steel, gGF, {});
potPlant(hx(4.4), hz(11.0), GF, gGF, 1.0);

/* --- foyer --- */
rugMat(hx(6.75), hz(1.2), GF, 1.6, 2.2, gGF, MAT.fabric2);
fsolid(1.30,0.80,0.38, hx(8.28), GF+0.40, hz(1.3), MAT.woodDark, gGF);
addBox(0.05,1.10,0.85, hx(8.45), GF+1.85, hz(1.3), MAT.steel, gGF, {});
potPlant(hx(5.25), hz(0.55), GF, gGF, 1.2);
pendant(hx(6.75), hz(1.3), GF+CH, gGF, 1.3);
downlight(hx(7.5), hz(2.4), GF+CH, gGF);

/* --- guest bedroom  (u 8.55..13.55, v 0..4.6  =  23.0 m2) ---
   A guest room and nothing else now. The desk, the bookshelf and the sofa
   that made this a dual-purpose study have gone upstairs into the library,
   which is where a study belongs once there is one - a room that is half
   office and half spare bed is not much good as either when somebody is
   actually staying. Headboard against the east wall so the window and the
   door both stay clear, and the powder room next door serves it. */
rugMat(hx(11.30), hz(2.30), GF, 3.4, 2.8, gGF);
bed(hx(12.30), hz(2.30), GF, 1.60, 2.10, 1, gGF, MAT.linen);
fsolid(0.48,0.55,0.42, hx(12.95), GF+0.28, hz(1.05), MAT.woodDark, gGF);
fsolid(0.48,0.55,0.42, hx(12.95), GF+0.28, hz(3.55), MAT.woodDark, gGF);
wardrobe(hx(10.20), hz(4.35), GF, 2.4, 2, gGF);
armchair(hx(9.35), hz(1.35), GF, 1, gGF);
fsolid(0.5,0.45,0.5, hx(9.35), GF+0.23, hz(2.25), MAT.wood, gGF);
artwork(hx(11.30), hz(4.48), GF+1.70, 1.1, 0.8, 2, gGF);
downlight(hx(10.2),hz(1.6),GF+CH,gGF); downlight(hx(12.3),hz(3.4),GF+CH,gGF);
ac(hx(11.0), hz(0.20), GF+2.55, 0, gGF);

/* --- powder room --- */
wc(hx(9.05), hz(5.9), GF, 2, gGF);
basin(hx(9.9), hz(4.95), GF, 0, gGF, 0.75);
addBox(1.85,0.02,1.80, hx(9.475), GF+0.011, hz(5.5), MAT.tileWet, gGF, {cast:false});
downlight(hx(9.5),hz(5.5),GF+CH,gGF);

/* --- store --- */
fsolid(2.90,2.10,0.45, hx(11.95), GF+1.05, hz(4.9), MAT.wood, gGF);

/* --- kitchen --- */
addBox(5.00,0.02,3.80, hx(11.05), GF+0.011, hz(8.3), MAT.tileWet, gGF, {cast:false});
counterRun(hx(9.0), hz(6.75), hx(13.2), hz(6.75), GF, gGF, true);
counterRun(hx(13.1), hz(7.3), hx(13.1), hz(9.0), GF, gGF, false);
cooker(hx(11.4), hz(6.78), GF, 0, gGF);
fridge(hx(12.85), hz(9.70), GF, 2, gGF);
island(hx(10.9), hz(8.9), GF, 2.20, 0.95, gGF);
pendant(hx(10.3), hz(8.85), GF+CH, gGF, 1.1);
pendant(hx(11.5), hz(8.85), GF+CH, gGF, 1.1);
[[9.6,7.4],[12.6,7.4],[9.6,9.8],[12.6,9.8]].forEach(function(p){ downlight(hx(p[0]),hz(p[1]),GF+CH,gGF); });

/* --- pantry / laundry --- */
fsolid(2.20,2.10,0.50, hx(12.3), GF+1.05, hz(10.9), MAT.wood, gGF);
fsolid(0.62,0.85,0.62, hx(9.35), GF+0.42, hz(10.85), MAT.white, gGF);
addBox(0.42,0.42,0.03, hx(9.35), GF+0.55, hz(10.53), MAT.carGlass, gGF, {});
downlight(hx(10.8),hz(10.8),GF+CH,gGF);

/* --- rear lobby / breakfast --- */
/* a breakfast bar against the left wall keeps the run from the kitchen
   to the rear door completely clear */
rugMat(hx(6.40), hz(8.6), GF, 1.8, 2.0, gGF, MAT.rug);
fsolid(0.60, 0.78, 1.40, hx(5.45), GF+0.39, hz(8.45), MAT.woodDark, gGF);
addBox(0.70, 0.06, 1.50, hx(5.45), GF+0.81, hz(8.45), MAT.counter, gGF, {furn:true});
stool(hx(5.75), hz(8.10), GF, gGF);
stool(hx(5.75), hz(8.80), GF, gGF);
potPlant(hx(5.45), hz(11.0), GF, gGF, 1.1);
downlight(hx(6.75),hz(8.2),GF+CH,gGF);
pendant(hx(5.75), hz(8.45), GF+CH, gGF, 1.0);

/* --- porch --- */
potPlant(hx(2.2), hz(-1.05), GF, gGF, 1.35);
potPlant(hx(11.4), hz(-1.05), GF, gGF, 1.35);
armchair(hx(3.9), hz(-0.95), GF, 0, gGF);
armchair(hx(9.9), hz(-0.95), GF, 0, gGF);
addBox(0.55,0.55,0.55, hx(4.9), GF+0.28, hz(-0.95), MAT.wood, gGF, {});
