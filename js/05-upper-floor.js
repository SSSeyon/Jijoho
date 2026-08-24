"use strict";
/* ============================================================
   PART 5  -  DUPLEX FIRST FLOOR, BALCONY, ROOF
   ============================================================ */

/* ---------- first-floor slab (hole at the stairwell) ----------
   The slab itself is rendered concrete, because its edge is visible from the
   garden as a band across the elevation; the tiled finish is a separate thin
   plate laid on top of it. */
[[0.0,0.0,5.0,11.5],[5.0,0.0,6.5,2.60],[5.0,7.36,6.5,11.5],[6.5,0.0,13.55,11.5]].forEach(function(r){
  slab(hx(r[0]), hz(r[1]), hx(r[2]), hz(r[3]), FF, SLAB, MAT.wallExt, gFF, {});
  addBox(r[2]-r[0]-0.02, 0.03, r[3]-r[1]-0.02,
         hx((r[0]+r[2])/2), FF-0.010, hz((r[1]+r[3])/2), MAT.tileF, gFF, {cast:false});
});

/* ---------- balcony ---------- */
slab(hx(1.0), hz(-1.80), hx(12.5), hz(0.0), FF, SLAB, MAT.paverWarm, gFF, {});
rail(hx(1.0), hz(-1.80), hx(12.5), hz(-1.80), FF, gFF);
rail(hx(1.0), hz(-1.80), hx(1.0),  hz(0.0),  FF, gFF);
rail(hx(12.5),hz(-1.80), hx(12.5), hz(0.0),  FF, gFF);
/* porch columns below (ground level) */
[1.45, 4.40, 9.60, 12.10].forEach(function(u){
  addBox(0.28, FF-SLAB-GF, 0.28, hx(u), (GF+FF-SLAB)/2, hz(-1.45), MAT.accent, gGF, {solid:true});
});
/* balcony columns up to the shading canopy */
[1.45, 4.40, 9.60, 12.10].forEach(function(u){
  addBox(0.24, 2.70, 0.24, hx(u), FF+1.35, hz(-1.45), MAT.accent, gFF, {solid:true});
});
/* deep shading canopy over the balcony, set below the eaves so the hip roof reads above it */
addBox(11.9, 0.30, 2.05, hx(6.75), 6.75, hz(-0.9), MAT.wallExt, gRoof, {});
addBox(12.1, 0.18, 0.16, hx(6.75), 6.99, hz(-1.87), MAT.accent, gRoof, {});
/* balcony furniture */
armchair(hx(5.60), hz(-1.05), FF, 0, gFF);
armchair(hx(7.90), hz(-1.05), FF, 0, gFF);
addBox(0.5,0.45,0.5, hx(6.75), FF+0.23, hz(-1.05), MAT.wood, gFF, {});
potPlant(hx(1.7), hz(-1.15), FF, gFF, 1.1);
potPlant(hx(11.8), hz(-1.15), FF, gFF, 1.1);
armchair(hx(8.60), hz(-1.05), FF, 0, gFF);

/* ---------- exterior walls ---------- */
hwall(0,0,HW,0,{h:CH,t:EXT.t,mat:EXT.mat,y:FF,group:gFF,openings:[
  opH(2.4,4.4,0,2.45,true), opH(6.6,7.8,0.90,2.40), opH(9.6,11.6,0,2.45,true)
]});
hwall(0,HD,HW,HD,{h:CH,t:EXT.t,mat:EXT.mat,y:FF,group:gFF,openings:[
  opH(1.2,3.8,0.90,2.45), opH(5.6,7.8,0.90,2.45), opH(9.4,12.0,0.90,2.45)
]});
hwall(0,0,0,HD,{h:CH,t:EXT.t,mat:EXT.mat,y:FF,group:gFF,openings:[
  opV(1.2,3.4,0.90,2.45), opV(4.9,5.7,1.60,2.35), opV(7.6,9.6,0.90,2.45)
]});
hwall(HW,0,HW,HD,{h:CH,t:EXT.t,mat:EXT.mat,y:FF,group:gFF,openings:[
  opV(1.0,3.0,0.90,2.45), opV(3.7,4.5,1.60,2.35), opV(7.0,9.2,0.90,2.45), opV(10.1,10.9,1.60,2.35)
]});

/* ---------- interior walls ---------- */
hwall(5.0,0,5.0,7.0,   {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF,openings:[ opV(1.0,1.9,0,2.20) ]});
hwall(5.0,7.0,5.0,HD,  {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF,openings:[ opV(8.4,9.3,0,2.20) ]});
hwall(6.5,2.6,6.5,7.36,{h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(0,4.6,5.0,4.6,   {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF,openings:[ opH(0.8,1.7,0,2.20), opH(3.4,4.3,0,2.20) ]});
hwall(2.9,4.6,2.9,7.0, {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(0,7.0,5.0,7.0,   {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(0,9.7,2.1,9.7,   {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF,openings:[ opH(0.8,1.7,0,2.20) ]});
hwall(2.1,9.7,2.1,HD,  {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(8.55,0,8.55,HD,  {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF,openings:[
  opV(1.4,2.3,0,2.20), opV(5.4,6.2,0,2.20), opV(8.2,9.1,0,2.20)
]});
hwall(8.55,5.0,HW,5.0, {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(8.55,6.6,HW,6.6, {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(11.5,3.3,11.5,5.0,{h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(11.5,3.3,HW,3.3, {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF,openings:[ opH(11.9,12.8,0,2.20) ]});
hwall(11.5,9.8,11.5,HD,{h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(11.5,9.8,HW,9.8, {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF,openings:[ opH(11.9,12.8,0,2.20) ]});

/* ============================================================
   FIRST FLOOR FURNITURE
   ============================================================ */
/* --- master bedroom  (u 0..5.0, v 0..4.6) --- */
/* headboard on the side wall so the balcony door stays clear */
rugMat(hx(2.9), hz(2.5), FF, 3.4, 2.8, gFF);
bed(hx(1.55), hz(2.30), FF, 1.95, 2.15, 3, gFF);
tvUnit(hx(4.55), hz(2.30), FF, 1.7, 1, gFF);
armchair(hx(4.60), hz(3.90), FF, 0, gFF);
ceilingFan(hx(2.9), hz(2.5), FF+CH, gFF);
downlight(hx(1.2),hz(1.0),FF+CH,gFF); downlight(hx(3.8),hz(1.0),FF+CH,gFF);
downlight(hx(1.2),hz(4.0),FF+CH,gFF); downlight(hx(3.8),hz(4.0),FF+CH,gFF);
ac(hx(4.0), hz(0.20), FF+2.55, 0, gFF);
artwork(hx(0.18), hz(2.30), FF+1.95, 1.3, 0.9, 3, gFF);

/* --- walk-in closet (u 0..2.9, v 4.6..7.0) --- */
wardrobe(hx(1.45), hz(6.85), FF, 2.5, 2, gFF);
wardrobe(hx(0.35), hz(5.8), FF, 1.9, 1, gFF);
fsolid(0.9,0.55,0.5, hx(2.2), FF+0.28, hz(5.5), MAT.wood, gFF);
downlight(hx(1.45),hz(5.8),FF+CH,gFF);

/* --- master bathroom (u 2.9..5.0, v 4.6..7.0) --- */
addBox(2.10,0.02,2.40, hx(3.95), FF+0.011, hz(5.8), MAT.tileWet, gFF, {cast:false});
basin(hx(4.0), hz(4.90), FF, 0, gFF, 1.30);
wc(hx(3.28), hz(6.68), FF, 2, gFF);
shower(hx(4.05), hz(6.05), hx(4.95), hz(6.95), FF, gFF);
downlight(hx(3.6),hz(5.3),FF+CH,gFF); downlight(hx(4.5),hz(6.4),FF+CH,gFF);

/* --- bedroom 2 (u 0..5.0, v 7.0..11.5) --- */
rugMat(hx(3.2), hz(9.0), FF, 3.0, 2.6, gFF);
bed(hx(3.3), hz(8.6), FF, 1.55, 2.05, 0, gFF, MAT.fabric2);
wardrobe(hx(3.6), hz(11.15), FF, 2.2, 2, gFF);
desk(hx(0.55), hz(8.1), FF, 1.3, 1, gFF);
ceilingFan(hx(3.2), hz(9.0), FF+CH, gFF);
downlight(hx(1.2),hz(8.2),FF+CH,gFF); downlight(hx(4.2),hz(10.4),FF+CH,gFF);
ac(hx(3.4), hz(7.20), FF+2.55, 0, gFF);
/* bedroom 2 en-suite */
addBox(2.10,0.02,1.80, hx(1.05), FF+0.011, hz(10.6), MAT.tileWet, gFF, {cast:false});
wc(hx(0.42), hz(11.15), FF, 2, gFF);
basin(hx(1.55), hz(10.05), FF, 0, gFF, 0.8);
shower(hx(1.25), hz(10.75), hx(2.00), hz(11.45), FF, gFF);
downlight(hx(1.05),hz(10.6),FF+CH,gFF);

/* --- corridor / gallery --- */
rugMat(hx(7.5), hz(4.0), FF, 1.3, 5.5, gFF, MAT.fabric2);
artwork(hx(8.46), hz(3.6), FF+1.75, 0.9, 0.7, 1, gFF);
artwork(hx(6.60), hz(1.4), FF+1.75, 0.9, 0.7, 3, gFF);
potPlant(hx(7.9), hz(0.6), FF, gFF, 1.1);
fsolid(1.10,0.78,0.36, hx(7.9), FF+0.39, hz(6.9), MAT.wood, gFF);
[[7.5,1.2],[7.5,3.4],[7.5,5.6],[7.5,7.0]].forEach(function(p){ downlight(hx(p[0]),hz(p[1]),FF+CH,gFF); });
/* stairwell head - glazed clerestory into the corridor */
addBox(0.04,0.75,1.6, hx(6.5), FF+2.45, hz(4.6), MAT.glass, gFF, {cast:false});

/* --- family lounge (u 5.0..8.55, v 7.36..11.5) ---
   kept clear at v 7.36-8.6 so you step off the stairs into open floor */
rugMat(hx(6.90), hz(10.4), FF, 2.6, 2.0, gFF);
sofa(hx(6.60), hz(11.00), FF, 2.5, 2, gFF);
armchair(hx(5.60), hz(9.90), FF, 3, gFF);
coffeeTable(hx(6.90), hz(10.30), FF, 1.0, 0.6, gFF);
tvUnit(hx(8.30), hz(9.80), FF, 1.5, 1, gFF);
bookshelf(hx(8.15), hz(10.70), FF, 1.3, 1, gFF);
ceilingFan(hx(6.90), hz(10.2), FF+CH, gFF);
downlight(hx(5.8),hz(8.2),FF+CH,gFF); downlight(hx(7.8),hz(10.8),FF+CH,gFF);

/* --- bedroom 3 (u 8.55..13.55, v 0..5.0) --- */
rugMat(hx(10.6), hz(2.4), FF, 3.0, 2.6, gFF);
bed(hx(10.5), hz(2.6), FF, 1.55, 2.05, 3, gFF, MAT.fabric2);
wardrobe(hx(10.0), hz(4.75), FF, 2.4, 2, gFF);
desk(hx(12.9), hz(1.4), FF, 1.2, 3, gFF);
ceilingFan(hx(10.6), hz(2.4), FF+CH, gFF);
downlight(hx(9.4),hz(1.4),FF+CH,gFF); downlight(hx(12.4),hz(4.0),FF+CH,gFF);
ac(hx(10.2), hz(0.20), FF+2.55, 0, gFF);
/* bedroom 3 en-suite */
addBox(2.05,0.02,1.70, hx(12.5), FF+0.011, hz(4.15), MAT.tileWet, gFF, {cast:false});
wc(hx(11.95), hz(4.72), FF, 2, gFF);
basin(hx(12.9), hz(3.62), FF, 0, gFF, 0.8);
shower(hx(12.75), hz(4.30), hx(13.45), hz(4.95), FF, gFF);
downlight(hx(12.5),hz(4.15),FF+CH,gFF);

/* --- linen / plant store --- */
fsolid(4.60,2.20,0.45, hx(10.9), FF+1.10, hz(6.375), MAT.wood, gFF);
downlight(hx(10.9),hz(5.8),FF+CH,gFF);

/* --- bedroom 4 (u 8.55..13.55, v 6.6..11.5) --- */
rugMat(hx(10.4), hz(8.8), FF, 3.0, 2.6, gFF);
bed(hx(10.4), hz(8.5), FF, 1.55, 2.05, 0, gFF, MAT.fabric2);
wardrobe(hx(9.8), hz(11.15), FF, 2.2, 2, gFF);
desk(hx(9.0), hz(9.6), FF, 1.2, 1, gFF);
ceilingFan(hx(10.4), hz(8.8), FF+CH, gFF);
downlight(hx(9.4),hz(7.6),FF+CH,gFF); downlight(hx(12.4),hz(8.8),FF+CH,gFF);
ac(hx(10.2), hz(6.80), FF+2.55, 0, gFF);
/* bedroom 4 en-suite */
addBox(2.05,0.02,1.70, hx(12.5), FF+0.011, hz(10.65), MAT.tileWet, gFF, {cast:false});
wc(hx(11.95), hz(11.20), FF, 2, gFF);
basin(hx(12.9), hz(10.12), FF, 0, gFF, 0.8);
shower(hx(12.75), hz(10.80), hx(13.45), hz(11.45), FF, gFF);
downlight(hx(12.5),hz(10.65),FF+CH,gFF);

/* ---------- roof slab + hip roof ---------- */
slab(hx(0), hz(0), hx(HW), hz(HD), RF, SLAB, MAT.wallInt, gRoof, {walk:false});
hipRoof(hx(0), hz(0), hx(HW), hz(HD), RF, 2.35, 0.68, MAT.roof, gRoof);

/* ============================================================
   BOYS QUARTERS  -  unit A | games room | unit B
   local u 0..13.55, v 0..6.0   (v = 0 faces the house)
   ============================================================ */
function bopH(u0,u1,sill,top,gl){ return {a:bxf(u0), b:bxf(u1), sill:sill, top:top, glass:gl}; }
function bopV(v0,v1,sill,top,gl){ return {a:bzf(v0), b:bzf(v1), sill:sill, top:top, glass:gl}; }
var BRF = BF + BCH + 0.15;   /* 3.50 */

/* Everything from here to the end of the BQ is tagged, so that turning the
   block off takes its walls and floors out of the collision model with it. */
CTAG = "bq";

addBox(BW+0.30, BF, BD+0.30, bxf(BW/2), BF/2, bzf(BD/2), MAT.stone, gBQ, {});
addCollider(bxf(0), bxf(BW), bzf(0), bzf(BD), 0, BF);
slab(bxf(0), bzf(0), bxf(BW), bzf(BD), BF, 0.10, MAT.tileF, gBQ, {cast:false});
/* step at each entrance */
[1.65, 6.75, 11.90].forEach(function(u){
  addBox(1.7,0.22,0.50, bxf(u), 0.11, bzf(-0.40), MAT.stone, gBQ, {});
  addFloor(bxf(u)-0.85, bxf(u)+0.85, bzf(-0.65), bzf(0.02), 0.22);
});

/* exterior walls */
bwall(0,0,BW,0,{h:BCH,t:0.23,mat:MAT.wallExt,y:BF,group:gBQ,openings:[
  bopH(1.20,2.10,0,2.20,true), bopH(3.00,4.40,1.00,2.25),
  bopH(6.10,7.40,0,2.30,true),
  bopH(9.15,10.55,1.00,2.25), bopH(11.45,12.35,0,2.20,true)
]});
bwall(0,BD,BW,BD,{h:BCH,t:0.23,mat:MAT.wallExt,y:BF,group:gBQ,openings:[
  bopH(2.60,4.20,1.05,2.25), bopH(0.35,1.45,1.55,2.25),
  bopH(5.80,7.80,1.05,2.25),
  bopH(9.35,10.95,1.05,2.25), bopH(12.10,13.20,1.55,2.25)
]});
bwall(0,0,0,BD,{h:BCH,t:0.23,mat:MAT.wallExt,y:BF,group:gBQ,openings:[
  bopV(1.00,2.40,1.00,2.25), bopV(3.30,4.10,1.20,2.25), bopV(4.90,5.60,1.55,2.25)
]});
bwall(BW,0,BW,BD,{h:BCH,t:0.23,mat:MAT.wallExt,y:BF,group:gBQ,openings:[
  bopV(1.00,2.40,1.00,2.25), bopV(3.30,4.10,1.20,2.25), bopV(4.90,5.60,1.55,2.25)
]});
/* party walls */
bwall(5.00,0,5.00,BD,{h:BCH,t:0.20,mat:MAT.wallExt,y:BF,group:gBQ});
bwall(8.55,0,8.55,BD,{h:BCH,t:0.20,mat:MAT.wallExt,y:BF,group:gBQ});
/* unit A internal */
bwall(0,3.0,5.0,3.0,{h:BCH,t:0.12,mat:MAT.wallInt,y:BF,group:gBQ,openings:[
  bopH(0.40,1.50,0,2.30), bopH(3.30,4.20,0,2.20)
]});
bwall(1.90,3.0,1.90,BD,{h:BCH,t:0.12,mat:MAT.wallInt,y:BF,group:gBQ,openings:[ bopV(4.80,5.60,0,2.20) ]});
bwall(0,4.40,1.90,4.40,{h:BCH,t:0.12,mat:MAT.wallInt,y:BF,group:gBQ});
/* unit B internal (mirrored) */
bwall(8.55,3.0,13.55,3.0,{h:BCH,t:0.12,mat:MAT.wallInt,y:BF,group:gBQ,openings:[
  bopH(12.05,13.15,0,2.30), bopH(9.35,10.25,0,2.20)
]});
bwall(11.65,3.0,11.65,BD,{h:BCH,t:0.12,mat:MAT.wallInt,y:BF,group:gBQ,openings:[ bopV(4.80,5.60,0,2.20) ]});
bwall(11.65,4.40,13.55,4.40,{h:BCH,t:0.12,mat:MAT.wallInt,y:BF,group:gBQ});

/* --- unit A fittings --- */
sofa(bxf(4.45), bzf(1.50), BF, 1.9, 1, gBQ);
armchair(bxf(3.10), bzf(0.55), BF, 0, gBQ);
tvUnit(bxf(2.20), bzf(2.75), BF, 1.2, 2, gBQ);
rugMat(bxf(3.40), bzf(1.60), BF, 2.0, 1.6, gBQ, MAT.fabric2);
bed(bxf(3.80), bzf(4.60), BF, 1.45, 2.00, 1, gBQ, MAT.fabric2);
wardrobe(bxf(2.60), bzf(3.35), BF, 1.2, 0, gBQ);
counterRun(bxf(0.30), bzf(3.35), bxf(0.30), bzf(4.20), BF, gBQ, true);
cooker(bxf(1.45), bzf(3.45), BF, 3, gBQ);
addBox(1.90,0.02,1.60, bxf(0.95), BF+0.011, bzf(5.20), MAT.tileWet, gBQ, {cast:false});
wc(bxf(1.45), bzf(5.62), BF, 2, gBQ);
basin(bxf(0.45), bzf(4.75), BF, 0, gBQ, 0.7);
shower(bxf(0.20), bzf(5.10), bxf(0.95), bzf(5.85), BF, gBQ);
downlight(bxf(2.5),bzf(1.5),BF+BCH,gBQ); downlight(bxf(3.4),bzf(4.6),BF+BCH,gBQ);
downlight(bxf(1.0),bzf(3.7),BF+BCH,gBQ); downlight(bxf(0.95),bzf(5.2),BF+BCH,gBQ);
ceilingFan(bxf(3.40), bzf(1.60), BF+BCH, gBQ);

/* --- unit B fittings (mirrored) --- */
sofa(bxf(9.10), bzf(1.50), BF, 1.9, 3, gBQ);
armchair(bxf(10.45), bzf(0.55), BF, 0, gBQ);
tvUnit(bxf(11.35), bzf(2.75), BF, 1.2, 2, gBQ);
rugMat(bxf(10.15), bzf(1.60), BF, 2.0, 1.6, gBQ, MAT.fabric2);
bed(bxf(9.75), bzf(4.60), BF, 1.45, 2.00, 3, gBQ, MAT.fabric2);
wardrobe(bxf(10.95), bzf(3.35), BF, 1.2, 0, gBQ);
counterRun(bxf(13.25), bzf(3.35), bxf(13.25), bzf(4.20), BF, gBQ, true);
cooker(bxf(12.10), bzf(3.45), BF, 1, gBQ);
addBox(1.90,0.02,1.60, bxf(12.60), BF+0.011, bzf(5.20), MAT.tileWet, gBQ, {cast:false});
wc(bxf(12.10), bzf(5.62), BF, 2, gBQ);
basin(bxf(13.10), bzf(4.75), BF, 0, gBQ, 0.7);
shower(bxf(12.60), bzf(5.10), bxf(13.35), bzf(5.85), BF, gBQ);
downlight(bxf(11.0),bzf(1.5),BF+BCH,gBQ); downlight(bxf(10.1),bzf(4.6),BF+BCH,gBQ);
downlight(bxf(12.5),bzf(3.7),BF+BCH,gBQ); downlight(bxf(12.6),bzf(5.2),BF+BCH,gBQ);
ceilingFan(bxf(10.15), bzf(1.60), BF+BCH, gBQ);

/* --- indoor games room (u 5.0..8.55) --- */
(function(){
  var cx = bxf(6.775), cz = bzf(3.30);
  /* table tennis table */
  fsolid(1.52, 0.06, 2.74, cx, BF+0.76, cz, M(0x1c5e3a,{r:0.75}), gBQ);
  addBox(1.56,0.02,0.03, cx, BF+0.80, cz, MAT.white, gBQ, {});
  addBox(0.03,0.02,2.78, cx, BF+0.80, cz, MAT.white, gBQ, {});
  addBox(1.80,0.16,0.02, cx, BF+0.87, cz, MAT.white, gBQ, {});
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){
    addBox(0.07,0.72,0.07, cx+s[0]*0.66, BF+0.38, cz+s[1]*1.25, MAT.black, gBQ, {});
  });
  /* dartboard */
  addCyl(0.24,0.24,0.06, bxf(8.45), BF+1.72, bzf(2.20), M(0x2b2b2b,{r:0.9}), gBQ, 18);
  addCyl(0.09,0.09,0.07, bxf(8.45), BF+1.72, bzf(2.20), MAT.bloom1, gBQ, 14);
  /* board-game table + stools */
  fsolid(1.05,0.06,1.05, bxf(5.85), BF+0.75, bzf(5.15), MAT.wood, gBQ);
  fbox(0.55,0.70,0.55, bxf(5.85), BF+0.36, bzf(5.15), MAT.wood, gBQ);
  addBox(0.62,0.03,0.62, bxf(5.85), BF+0.80, bzf(5.15), M(0x30507a,{r:0.85}), gBQ, {});
  stool(bxf(5.85), bzf(4.35), BF, gBQ); stool(bxf(5.85), bzf(5.95), BF, gBQ);
  /* shelving + small sofa */
  fsolid(0.40, 1.90, 1.30, bxf(8.05), BF+0.95, bzf(4.90), MAT.wood, gBQ);
  sofa(bxf(8.00), bzf(0.75), BF, 1.0, 0, gBQ, MAT.fabric);
  rugMat(bxf(6.775), bzf(3.30), BF, 2.6, 3.4, gBQ, MAT.fabric2);
  pendant(cx, cz, BF+BCH, gBQ, 0.75);
  downlight(bxf(5.9),bzf(1.2),BF+BCH,gBQ); downlight(bxf(7.7),bzf(1.2),BF+BCH,gBQ);
  downlight(bxf(5.9),bzf(5.4),BF+BCH,gBQ); downlight(bxf(7.7),bzf(5.4),BF+BCH,gBQ);
  ceilingFan(bxf(6.775), bzf(2.20), BF+BCH, gBQ);
})();

/* BQ roof */
slab(bxf(0), bzf(0), bxf(BW), bzf(BD), BRF, 0.15, MAT.wallInt, gBQR, {walk:false});
hipRoof(bxf(0), bzf(0), bxf(BW), bzf(BD), BRF, 1.55, 0.55, MAT.roof, gBQR);
/* solar array on the rear slope */
(function(){
  var pitch = Math.atan2(1.55, (BD+1.1)/2);
  for(var i=0;i<8;i++){
    var col = i%4, row = Math.floor(i/4);
    var px = bxf(2.4 + col*2.05);
    var off = 1.15 + row*1.15;
    var pz = bzf(BD/2) + off;
    var py = BRF + 1.55 - (off/((BD+1.1)/2))*1.55 + 0.10;
    var p = addBox(1.85, 0.06, 1.05, px, py, pz, M(0x1a2740,{r:0.25,m:0.4}), gBQR, {});
    p.rotation.x = -pitch;
  }
})();

/* the four small BQ service rooms: fittings stay visible but stop blocking,
   so the walkthrough can step inside a 3 sqm bathroom */
clearColliders(bxf(0.05), bzf(3.05), bxf(1.85), bzf(5.95));
clearColliders(bxf(11.70), bzf(3.05), bxf(13.50), bzf(5.95));


/* ============================================================
   SPORTS COURT  -  the alternative to the BQ, on the same ground
   ------------------------------------------------------------
   Only one of the two can exist: the court needs the whole rear of the
   plot, which is exactly what the BQ stands on. Toggled in part 6.

   The playing surface is 16.20 x 8.00 m of acrylic over concrete, marked
   for three games:
     badminton / pickleball  13.40 x 6.10 m, full size, net across the middle
     basketball half court   hoop on the west baseline, key and clipped arc
     kickabout               a 3.0 x 2.0 m goal on the east baseline

   Run-off is 1.40 m at the ends and 0.95 m at the sides. A club would want
   1.50 m minimum at the sides; this plot does not have it, and nothing that
   keeps the four-bedroom footprint would.
   ============================================================ */
CTAG = "sport";

/* An alpha-cut grid on a flat quad: you see the court through it, it still
   reads as a barrier, and it costs two triangles instead of a few thousand
   cylinders. `tile` is the size in metres of one square of mesh. */
function netPanel(ax,az,bx,bz,y0,y1,mat,group,tile){
  var w = Math.sqrt((bx-ax)*(bx-ax)+(bz-az)*(bz-az)), h = y1-y0;
  if(w<0.01 || h<0.01) return null;
  var g = new THREE.PlaneGeometry(w, h);
  var uv = g.attributes.uv;
  for(var i=0;i<uv.count;i++) uv.setXY(i, uv.getX(i)*w/tile, uv.getY(i)*h/tile);
  uv.needsUpdate = true;
  g.setAttribute("uv2", uv);
  var m = new THREE.Mesh(g, mat);
  m.position.set((ax+bx)/2, (y0+y1)/2, (az+bz)/2);
  m.rotation.y = Math.atan2(-(bz-az), bx-ax);
  m.castShadow = false; m.receiveShadow = false;
  (group||gSite).add(m);
  return m;
}

(function(){
  var CX = -0.30, CZ = 10.90;          /* court centre */
  var HWx = 8.10, HWz = 4.00;          /* half extents of the paved surface */
  var CY = 0.12;                       /* finished court level */
  var x0 = CX-HWx, x1 = CX+HWx, z0 = CZ-HWz, z1 = CZ+HWz;

  /* ---------- surface ---------- */
  /* 150 mm concrete raft with a thickened edge, then the coloured coats */
  addBox(HWx*2+0.30, 0.30, HWz*2+0.30, CX, CY-0.15, CZ, MAT.stone, gSport, {cast:false});
  addBox(HWx*2, 0.05, HWz*2, CX, CY-0.025, CZ, MAT.courtOut, gSport, {cast:false});
  addFloor(x0, x1, z0, z1, CY);
  /* in-bounds rectangle in the darker coat */
  addBox(13.40, 0.05, 6.10, CX, CY-0.018, CZ, MAT.courtIn, gSport, {cast:false});
  /* basketball key, shaded a third colour the way a painted court is */
  addBox(5.80, 0.05, 4.90, CX-HWx+2.90, CY-0.012, CZ, MAT.courtKey, gSport, {cast:false});

  /* ---------- line marking ---------- */
  function mark(ax,az,bx,bz,w){
    var dx=bx-ax, dz=bz-az, len=Math.sqrt(dx*dx+dz*dz);
    if(len < 0.01) return;
    var m = addBox(len, 0.014, w||0.05, (ax+bx)/2, CY+0.004, (az+bz)/2,
                   MAT.courtLine, gSport, {cast:false});
    m.rotation.y = Math.atan2(-dz, dx);
  }
  function rect(ax,az,bx,bz,w){
    mark(ax,az,bx,az,w); mark(ax,bz,bx,bz,w);
    mark(ax,az,ax,bz,w); mark(bx,az,bx,bz,w);
  }
  function arcline(cx,cz,r,a0,a1,w){
    var n = Math.max(6, Math.round(Math.abs(a1-a0)*14));
    for(var i=0;i<n;i++){
      var t0=a0+(a1-a0)*i/n, t1=a0+(a1-a0)*(i+1)/n;
      mark(cx+Math.cos(t0)*r, cz+Math.sin(t0)*r,
           cx+Math.cos(t1)*r, cz+Math.sin(t1)*r, w);
    }
  }

  /* badminton: doubles boundary, singles sidelines, service lines, centre line */
  rect(CX-6.70, CZ-3.05, CX+6.70, CZ+3.05, 0.05);
  mark(CX-6.70, CZ-2.59, CX+6.70, CZ-2.59, 0.04);
  mark(CX-6.70, CZ+2.59, CX+6.70, CZ+2.59, 0.04);
  [-1.98, 1.98, -5.94, 5.94].forEach(function(d){
    mark(CX+d, CZ-3.05, CX+d, CZ+3.05, 0.04);
  });
  mark(CX-6.70, CZ, CX-1.98, CZ, 0.04);
  mark(CX+1.98, CZ, CX+6.70, CZ, 0.04);

  /* basketball: key, free-throw circle, three-point arc off the west baseline */
  var BL  = CX-HWx;                        /* baseline */
  var BSK = BL + 0.58;                     /* rim centre, 0.58 m in from the edge */
  rect(BL, CZ-2.45, BL+5.80, CZ+2.45, 0.05);
  arcline(BL+5.80, CZ, 1.80, -Math.PI/2, Math.PI/2, 0.05);
  (function(){
    /* corner-three straights out to where the 6.75 m arc meets them, then the arc */
    var cz = 3.90, r = 6.75;
    var ax = Math.sqrt(r*r - cz*cz);       /* 5.51 m from the basket */
    mark(BL, CZ-cz, BSK+ax, CZ-cz, 0.05);
    mark(BL, CZ+cz, BSK+ax, CZ+cz, 0.05);
    var th = Math.acos(ax/r);
    arcline(BSK, CZ, r, -th, th, 0.05);
  })();

  /* ---------- badminton net ---------- */
  [-3.05, 3.05].forEach(function(d){
    addBox(0.09, 1.60, 0.09, CX, CY+0.80, CZ+d, MAT.steel, gSport, {solid:true});
  });
  netPanel(CX, CZ-3.05, CX, CZ+3.05, CY+0.76, CY+1.55, MAT.netFine, gSport, 0.30);
  /* vertical cords at the posts and the centre, which is what your eye reads */
  [-3.02, -0.01, 3.02].forEach(function(d){
    addBox(0.05, 0.83, 0.05, CX, CY+1.16, CZ+d, MAT.white, gSport, {cast:false});
  });
  addBox(0.11, 0.075, 6.10, CX, CY+1.585, CZ, MAT.white, gSport, {cast:false});

  /* ---------- basketball hoop ---------- */
  (function(){
    var px = BL-0.55;                      /* post stands off the court */
    addBox(0.26,4.15,0.26, px, 2.07, CZ, MAT.black, gSport, {solid:true});
    addBox(0.55,0.55,0.55, px, 0.14, CZ, MAT.stone, gSport, {});
    /* cranked arm out to the board */
    addBox(1.05,0.16,0.16, px+0.52, 3.72, CZ, MAT.black, gSport, {});
    var bx = px+1.02;
    addBox(0.07,1.05,1.80, bx, 3.42, CZ, MAT.backboard, gSport, {});
    addBox(0.02,0.45,0.59, bx+0.045, 3.13, CZ, MAT.hoopRim, gSport, {cast:false});
    /* rim + net */
    addCyl(0.2286,0.2286,0.03, bx+0.42, 3.05, CZ, MAT.hoopRim, gSport, 20);
    netPanel(bx+0.20, CZ, bx+0.64, CZ, 2.62, 3.05, MAT.netWhite, gSport, 0.11);
    netPanel(bx+0.42, CZ-0.22, bx+0.42, CZ+0.22, 2.62, 3.05, MAT.netWhite, gSport, 0.11);
  })();

  /* ---------- kickabout goal on the east baseline ---------- */
  (function(){
    var gx = CX+7.55, gw = 1.50, gh = 2.00;
    [-gw, gw].forEach(function(d){
      addBox(0.10,gh,0.10, gx, CY+gh/2, CZ+d, MAT.white, gSport, {solid:true});
    });
    addBox(0.10,0.10,gw*2, gx, CY+gh, CZ, MAT.white, gSport, {});
    netPanel(gx, CZ-gw, gx, CZ+gw, CY, CY+gh, MAT.netting, gSport, 0.16);
    netPanel(gx, CZ-gw, gx+0.75, CZ-gw, CY, CY+gh, MAT.netting, gSport, 0.16);
    netPanel(gx, CZ+gw, gx+0.75, CZ+gw, CY, CY+gh, MAT.netting, gSport, 0.16);
  })();

  /* ---------- ball-stop netting ---------- */
  /* 4 m on three sides. Only 2.6 m on the house side, so the court does not
     read as a cage from the terrace and the rear elevation stays visible. */
  (function(){
    var nx0 = x0-0.35, nx1 = x1+0.35, nz0 = z0-0.35, nz1 = z1+0.35;
    function run(ax,az,bx,bz,h){
      var len = Math.sqrt((bx-ax)*(bx-ax)+(bz-az)*(bz-az));
      var n = Math.max(1, Math.round(len/4.1));
      for(var i=0;i<=n;i++){
        var f=i/n, px=ax+(bx-ax)*f, pz=az+(bz-az)*f;
        addBox(0.11,h,0.11, px, h/2, pz, MAT.steel, gSport, {solid:true});
      }
      netPanel(ax,az,bx,bz, 0.10, h, MAT.netting, gSport, 0.80);
      var m = addBox(len,0.06,0.06,(ax+bx)/2, h, (az+bz)/2, MAT.steel, gSport, {cast:false});
      m.rotation.y = Math.atan2(-(bz-az), bx-ax);
    }
    run(nx0,nz1,nx1,nz1,3.0);    /* rear - the 2.4 m boundary wall is behind it */
    run(nx0,nz0,nx0,nz1,4.0);    /* west */
    run(nx1,nz0,nx1,nz1,4.0);    /* east */
    run(nx0,nz0,nx1,nz0,2.6);    /* house side */
  })();

  /* ---------- floodlights ---------- */
  [[x0-0.35, z1+0.35],[x1+0.35, z1+0.35],[x0-0.35, z0-0.35],[x1+0.35, z0-0.35]].forEach(function(p){
    addCyl(0.09,0.12,6.0, p[0], 3.0, p[1], MAT.steel, gSport, 12);
    var ox = (p[0] < CX ? 0.34 : -0.34), oz = (p[1] < CZ ? 0.20 : -0.20);
    var head = addBox(0.62,0.30,0.40, p[0]+ox, 5.95, p[1]+oz, MAT.black, gSport, {});
    head.rotation.x = 0.42 * (p[1] < CZ ? -1 : 1);
    addBox(0.54,0.06,0.32, p[0]+ox*1.3, 5.86, p[1]+oz*1.3, MAT.lamp, gSport, {cast:false});
  });

  /* ---------- solar array ----------
     In BQ mode the panels sit on the BQ roof. With the BQ gone they have to go
     somewhere, and the rear slope of the main hip roof is the better place
     anyway: bigger, higher, and nothing shades it.
     It lives inside gRoof rather than gSport so that "Roof off" takes it away
     with the roof it is bolted to; setRear() switches it on and off. */
  (function(){
    gSolar = new THREE.Group();
    gRoof.add(gSolar);
    var pitch = Math.atan2(2.35, (HD+1.36)/2);
    var ridgeZ = hz(HD/2);
    var pv = M(0x1a2740,{r:0.25,m:0.4});
    for(var i=0;i<6;i++){
      var off = 3.70;
      var pz  = ridgeZ + off;
      var py  = RF + 2.35 - (off/((HD+1.36)/2))*2.35 + 0.055;
      var p = addBox(1.72, 0.05, 1.02, hx(1.90 + i*1.82), py, pz, pv, gSolar, {});
      p.rotation.x = -pitch;
    }
  })();

  /* ---------- courtside ---------- */
  [-4.60, 2.80].forEach(function(bx){
    addBox(1.90,0.09,0.42, bx, 0.50, z0-1.15, MAT.wood, gSport, {solid:true});
    addBox(1.90,0.09,0.40, bx, 0.86, z0-1.42, MAT.wood, gSport, {cast:false});
    [-0.82,0.82].forEach(function(d){
      addBox(0.09,0.46,0.40, bx+d, 0.24, z0-1.15, MAT.black, gSport, {});
      addBox(0.09,0.42,0.09, bx+d, 0.68, z0-1.42, MAT.black, gSport, {});
    });
  });
  /* equipment locker */
  addBox(1.30,1.55,0.62, x1-1.10, 0.775, z0-1.30, MAT.accent, gSport, {solid:true});
  addBox(1.38,0.09,0.70, x1-1.10, 1.58, z0-1.30, MAT.black, gSport, {});
  /* a couple of balls left out */
  addSphere(0.122, CX+2.20, CY+0.122, CZ-2.10, MAT.hoopRim, gSport, {});
  addSphere(0.110, CX-5.40, CY+0.110, CZ+2.60, MAT.white, gSport, {});
})();
CTAG = null;
