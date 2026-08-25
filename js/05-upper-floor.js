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
/* No porch or balcony columns in this option - the plate above is the roof
   deck itself stepping past the wall line, cantilevered on the floor
   structure with nothing visible holding its outer edge up. That absence is
   what reads as "cantilever" rather than "covered porch". */
/* balcony furniture */
armchair(hx(5.60), hz(-1.05), FF, 0, gFF);
armchair(hx(7.90), hz(-1.05), FF, 0, gFF);
addBox(0.5,0.45,0.5, hx(6.75), FF+0.23, hz(-1.05), MAT.wood, gFF, {});
potPlant(hx(1.7), hz(-1.15), FF, gFF, 1.1);
potPlant(hx(11.8), hz(-1.15), FF, gFF, 1.1);
armchair(hx(8.60), hz(-1.05), FF, 0, gFF);


/* ---------- fluted charcoal accents ----------
   Placed only where the wall is solid on BOTH floors, so each panel runs the
   full two storeys the way the reference elevation does. Split at the floor
   line into a gGF piece and a gFF piece purely so the "Upper floor off" toggle
   takes the top half away with the floor it belongs to; the two meet flush and
   read as one panel. Ribs face outwards on each elevation. */
(function(){
  var T0 = GF + 0.10, T1 = FF, T2 = FF + CH - 0.20;
  var wt = EXT.t/2 + 0.005;
  function panel(cx, cz, w, face){
    flutePanel(cx, (T0+T1)/2, cz, w, T1-T0, face, gGF);
    flutePanel(cx, (T1+T2)/2, cz, w, T2-T1, face, gFF);
  }
  /* front elevation, in the two piers between the window bays */
  panel(hx(5.30), hz(0) - wt, 1.50, "-z");
  panel(hx(8.80), hz(0) - wt, 1.35, "-z");
  /* east elevation */
  panel(hx(HW) + wt, hz(6.45), 0.95, "+x");
  panel(hx(HW) + wt, hz(9.65), 0.90, "+x");
  /* west elevation, the one the afternoon sun rakes across */
  panel(hx(0) - wt, hz(4.00), 1.20, "-x");
  panel(hx(0) - wt, hz(7.00), 1.20, "-x");
  panel(hx(0) - wt, hz(10.85), 1.30, "-x");
})();

/* ---------- exterior walls ---------- */
hwall(0,0,HW,0,{h:CH,t:EXT.t,mat:EXT.mat,y:FF,group:gFF,trim:-1,openings:[
  opH(2.4,4.4,0,2.45,true), opH(6.6,7.8,0.90,2.40), opH(9.6,11.6,0,2.45,true)
]});
hwall(0,HD,HW,HD,{h:CH,t:EXT.t,mat:EXT.mat,y:FF,group:gFF,trim:1,openings:[
  opH(1.2,3.8,0.90,2.45), opH(5.6,7.8,0.90,2.45), opH(9.4,12.0,0.90,2.45)
]});
hwall(0,0,0,HD,{h:CH,t:EXT.t,mat:EXT.mat,y:FF,group:gFF,trim:-1,openings:[
  opV(1.2,3.4,0.90,2.45), opV(4.9,5.7,1.60,2.35), opV(7.6,9.6,0.90,2.45)
]});
hwall(HW,0,HW,HD,{h:CH,t:EXT.t,mat:EXT.mat,y:FF,group:gFF,trim:1,openings:[
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

/* ---------- roof slab + parapet ---------- */
slab(hx(0), hz(0), hx(HW), hz(HD), RF, SLAB, MAT.wallInt, gRoof, {walk:false});
parapetRoof(hx(0), hz(0), hx(HW), hz(HD), RF, 0.42, MAT.accent, MAT.white, gRoof);

/* ---------- cantilevered roof wing over the balcony ----------
   The move the whole redesign is named for: the roof deck stepping past the
   front wall on its own plate, wide enough to cover the balcony below and
   deep enough to still be shading it at midday, with nothing under its
   leading edge. */
addBox(12.2, 0.30, 2.10, hx(6.75), RF-0.15, hz(-1.05), MAT.wallExt, gRoof, {});
addBox(12.4, 0.07, 0.15, hx(6.75), RF-0.015, hz(-2.10), MAT.accent, gRoof, {});

/* ============================================================
   GAMES PAVILION  -  5.70 x 3.55 m, west side, always present
   ------------------------------------------------------------
   The boys' quarters are gone, and the indoor games space that used to sit
   between its two units had to go somewhere. It is a standalone garden room
   instead, on the ground the old open gazebo occupied: that keeps it out of
   the rear of the plot, so it survives whichever rear option is chosen rather
   than vanishing with one of them.

   The footprint is set by the table tennis table, which is the one piece of
   equipment here with a non-negotiable size. A 2.74 m table needs run-off at
   both ends to be playable at all, and 5.70 m external gives 5.40 m internal:
   1.33 m at each end. That is short of the 2 m a club would want and generous
   compared with the garage most people end up playing in.
   ============================================================ */
var PVX0 = -8.55, PVX1 = -2.85;      /* 5.70 m */
var PVZ0 =  2.75, PVZ1 =  6.30;      /* 3.55 m - stops 250 mm short of the
                                        court's house-side netting line */
var PVF  = 0.30;                     /* plinth, same reasoning as the house */
var PVCH = 2.85;
var PVR  = PVF + PVCH + 0.15;
function pvo(a,b,sill,top,gl){ return {a:a, b:b, sill:sill, top:top, glass:gl}; }

(function(){
  var cx = (PVX0+PVX1)/2, cz = (PVZ0+PVZ1)/2;
  var w = PVX1-PVX0, d = PVZ1-PVZ0;

  /* plinth and floor */
  addBox(w+0.30, PVF, d+0.30, cx, PVF/2, cz, MAT.stone, gPav, {});
  addCollider(PVX0, PVX1, PVZ0, PVZ1, 0, PVF);
  slab(PVX0, PVZ0, PVX1, PVZ1, PVF, 0.10, MAT.parquet, gPav, {cast:false});
  /* step up, on the house side */
  addBox(1.60, 0.15, 0.55, cx+1.20, 0.075, PVZ0-0.40, MAT.stone, gPav, {});
  addFloor(cx+0.40, cx+2.00, PVZ0-0.68, PVZ0+0.02, 0.15);

  /* Walls. The long house-facing side is mostly glazed - a games room that
     looks onto the garden is worth having, and it keeps the pavilion from
     reading as a shed parked on the lawn. */
  wall(PVX0, PVZ0, PVX1, PVZ0, {h:PVCH, t:0.20, mat:MAT.wallExt, y:PVF, group:gPav, openings:[
    pvo(PVX0+0.60, PVX0+2.40, 0.00, 2.35, true),      /* sliding doors */
    pvo(PVX0+3.30, PVX1-0.55, 0.00, 2.35, true)
  ]});
  wall(PVX0, PVZ1, PVX1, PVZ1, {h:PVCH, t:0.20, mat:MAT.wallExt, y:PVF, group:gPav, openings:[
    pvo(PVX0+1.30, PVX0+2.50, 1.35, 2.30, true),      /* high strip windows */
    pvo(PVX0+3.40, PVX0+4.60, 1.35, 2.30, true)
  ]});
  wall(PVX0, PVZ0, PVX0, PVZ1, {h:PVCH, t:0.20, mat:MAT.wallExt, y:PVF, group:gPav});
  wall(PVX1, PVZ0, PVX1, PVZ1, {h:PVCH, t:0.20, mat:MAT.wallExt, y:PVF, group:gPav, openings:[
    pvo(PVZ0+1.20, PVZ0+2.40, 1.30, 2.30, true)
  ]});

  /* roof: shallow hip, same tile as the house so it reads as one property */
  slab(PVX0, PVZ0, PVX1, PVZ1, PVR, 0.15, MAT.wallInt, gPav, {walk:false});
  hipRoof(PVX0, PVZ0, PVX1, PVZ1, PVR, 0.95, 0.50, MAT.roof, gPav);

  /* ---------- what is in it ---------- */
  /* table tennis, along the long axis */
  fsolid(2.74, 0.06, 1.52, cx, PVF+0.76, cz, M(0x1c5e3a,{r:0.75}), gPav);
  addBox(2.78, 0.02, 0.03, cx, PVF+0.80, cz, MAT.white, gPav, {});
  addBox(0.03, 0.02, 1.56, cx, PVF+0.80, cz, MAT.white, gPav, {});
  addBox(0.02, 0.16, 1.80, cx, PVF+0.87, cz, MAT.white, gPav, {});
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){
    addBox(0.07,0.72,0.07, cx+s[0]*1.25, PVF+0.38, cz+s[1]*0.66, MAT.black, gPav, {});
  });
  /* dartboard on the blank west wall */
  addCyl(0.24,0.24,0.06, PVX0+0.14, PVF+1.72, cz, M(0x2b2b2b,{r:0.9}), gPav, 18);
  addCyl(0.09,0.09,0.07, PVX0+0.15, PVF+1.72, cz, MAT.bloom1, gPav, 14);
  /* board-game corner */
  fsolid(0.95,0.06,0.95, PVX1-0.95, PVF+0.75, PVZ1-0.85, MAT.wood, gPav);
  fbox(0.50,0.70,0.50, PVX1-0.95, PVF+0.36, PVZ1-0.85, MAT.wood, gPav);
  addBox(0.58,0.03,0.58, PVX1-0.95, PVF+0.80, PVZ1-0.85, M(0x30507a,{r:0.85}), gPav, {});
  stool(PVX1-1.70, PVZ1-0.85, PVF, gPav);
  stool(PVX1-0.95, PVZ1-1.60, PVF, gPav);
  /* seating and shelving */
  sofa(PVX0+1.35, PVZ1-0.60, PVF, 1.7, 2, gPav, MAT.fabric);
  fsolid(1.20, 1.85, 0.38, PVX0+2.60, PVF+0.93, PVZ1-0.24, MAT.wood, gPav);
  rugMat(cx, cz, PVF, 3.2, 2.0, gPav, MAT.fabric2);
  pendant(cx-1.10, cz, PVF+PVCH, gPav, 0.70);
  pendant(cx+1.10, cz, PVF+PVCH, gPav, 0.70);
  downlight(PVX0+1.20, PVZ1-0.90, PVF+PVCH, gPav);
  downlight(PVX1-1.20, PVZ1-0.90, PVF+PVCH, gPav);
  ceilingFan(cx, PVZ0+0.95, PVF+PVCH, gPav);
  potPlant(PVX1-0.45, PVZ0+0.50, PVF, gPav, 0.9);

  /* Approach path, in gPav rather than in the garden group: the pavilion is
     there in both options, so the way to reach it has to be too. */
  var pz;
  for(pz = PVZ0 - 0.62; pz > 0.80; pz -= 0.78){
    surf(-4.78, pz, -4.22, pz+0.56, MAT.paverWarm, 0.035, gPav);
  }
})();


/* ============================================================
   THE GARDEN  -  the alternative to the sports court
   ------------------------------------------------------------
   The rear third of the plot, z 6.7 .. 15.0, roughly 19.5 x 8.3 m of it,
   laid out as a garden rather than left as the mown strip it used to be:
   a shaped lawn, deep planting on three sides, a paved path that actually
   goes somewhere, a pergola to sit under, an outdoor kitchen, and raised
   vegetable beds along the rear.

   Tagged "garden" so its paving, planting and structures leave the collision
   model together when the court replaces them.
   ============================================================ */
CTAG = "garden";
(function(){
  var GZ0 = 6.70, GZ1 = 15.00;         /* front and back of the garden */
  var GX0 = X0 + 0.55, GX1 = X1 - 0.55;

  planting(gGarden, function(){

  /* ---------- ground ----------
     Lawn over the whole area first, then the paving laid on top of it. The
     site-wide lawn already covers this ground, so this second pass is a
     slightly richer green: a watered, mown garden lawn against the tougher
     grass everywhere else. */
  surf(GX0, GZ0, GX1, GZ1, MAT.grassDark, 0.012, gGarden);

  /* the path: out of the rear terrace, along the east side, across the back.
     Laid as individual slabs with lawn showing between them, which is what
     makes it read as a garden path rather than a corridor. */
  (function(){
    var pz;
    for(pz = GZ0 + 0.35; pz < GZ1 - 1.4; pz += 0.78){
      surf(6.30, pz, 7.70, pz+0.56, MAT.paverWarm, 0.035, gGarden);
    }
    var px;
    for(px = -7.90; px < 6.20; px += 0.78){
      surf(px, GZ1-1.35, px+0.56, GZ1-0.65, MAT.paverWarm, 0.035, gGarden);
    }
  })();

  /* ---------- pergola and seating, west of centre ---------- */
  (function(){
    var gx = -5.20, gz = 9.60, hw = 2.10, hd = 1.80;
    surf(gx-hw-0.35, gz-hd-0.35, gx+hw+0.35, gz+hd+0.35, MAT.paverWarm, 0.10, gGarden);
    addFloor(gx-hw-0.35, gx+hw+0.35, gz-hd-0.35, gz+hd+0.35, 0.10);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(p){
      addBox(0.18, 2.55, 0.18, gx+p[0]*hw, 1.375, gz+p[1]*hd, MAT.wood, gGarden, {solid:true});
    });
    /* beams both ways, then close-spaced rafters - a pergola is mostly the
       shadow it throws, so the rafters have to be dense enough to cast one */
    addBox(hw*2+0.45, 0.20, 0.16, gx, 2.72, gz-hd, MAT.wood, gGarden, {});
    addBox(hw*2+0.45, 0.20, 0.16, gx, 2.72, gz+hd, MAT.wood, gGarden, {});
    var n = Math.round((hd*2)/0.34), i;
    for(i=0;i<=n;i++){
      addBox(hw*2+0.60, 0.11, 0.09, gx, 2.86, gz-hd + (hd*2)*(i/n), MAT.woodDark, gGarden, {});
    }
    /* a climber over the top */
    for(i=0;i<16;i++){
      var a = i*2.399;
      addSphere(0.26+((i*31)%7)/22, gx+Math.cos(a)*hw*0.85, 2.99+((i*17)%5)/26,
                gz+Math.sin(a)*hd*0.85, (i%3)?MAT.leaf:MAT.leaf2, gGarden);
    }
    sofa(gx, gz-hd+0.62, 0.10, 1.9, 0, gGarden, MAT.fabric2);
    armchair(gx-1.25, gz+0.90, 0.10, 1, gGarden);
    armchair(gx+1.25, gz+0.90, 0.10, 3, gGarden);
    coffeeTable(gx, gz+0.40, 0.10, 1.0, 0.6, gGarden);
    var pl = addCyl(0.15,0.08,0.18, gx, 3.02, gz, MAT.lamp, gGarden, 12); pl.castShadow = false;
  })();

  /* ---------- outdoor kitchen, east of the pergola ---------- */
  (function(){
    var kx = 2.60, kz = 7.90;
    surf(kx-2.30, kz-0.95, kx+2.30, kz+1.45, MAT.paver, 0.09, gGarden);
    addFloor(kx-2.30, kx+2.30, kz-0.95, kz+1.45, 0.09);
    /* masonry counter run against a low screen wall */
    addBox(4.40, 0.30, 0.24, kx, 1.55, kz+1.33, MAT.wallExt, gGarden, {solid:true});
    addBox(4.40, 1.40, 0.24, kx, 0.70, kz+1.33, MAT.stone, gGarden, {solid:true});
    addBox(4.30, 0.92, 0.68, kx, 0.55, kz+0.86, MAT.wallExt, gGarden, {solid:true});
    addBox(4.44, 0.07, 0.76, kx, 1.05, kz+0.86, MAT.counter, gGarden, {});
    /* the grill, sunk into the run */
    addBox(1.05, 0.10, 0.62, kx-1.20, 1.10, kz+0.86, MAT.black, gGarden, {});
    addBox(0.98, 0.03, 0.55, kx-1.20, 1.14, kz+0.86, MAT.steel, gGarden, {cast:false});
    addBox(1.10, 0.55, 0.10, kx-1.20, 1.42, kz+1.18, MAT.steel, gGarden, {cast:false});
    /* sink and a couple of doors */
    addBox(0.60, 0.04, 0.44, kx+1.05, 1.07, kz+0.86, MAT.steel, gGarden, {cast:false});
    [-0.20, 0.55, 1.85].forEach(function(d){
      addBox(0.68, 0.72, 0.03, kx+d, 0.60, kz+0.52, MAT.woodDark, gGarden, {});
    });
    /* breakfast bar and stools on the garden side */
    addBox(4.10, 0.07, 0.62, kx, 1.06, kz-0.10, MAT.wood, gGarden, {});
    [-1.45, -0.48, 0.48, 1.45].forEach(function(d){ stool(kx+d, kz-0.62, 0.09, gGarden); });
    /* and a light over it */
    var kl = addCyl(0.14,0.07,0.16, kx, 2.35, kz+0.60, MAT.lamp, gGarden, 12); kl.castShadow = false;
    addBox(0.06, 1.30, 0.06, kx, 1.85, kz+1.28, MAT.steel, gGarden, {});
  })();

  /* ---------- kitchen garden: raised beds along the rear ---------- */
  (function(){
    var bz = GZ1 - 0.60;   /* clear of the generator house behind */
    [-7.10, -4.60, -2.10].forEach(function(bx){
      addBox(2.20, 0.45, 1.05, bx, 0.225, bz, MAT.woodDark, gGarden, {solid:true});
      addBox(2.04, 0.10, 0.90, bx, 0.47, bz, MAT.soil, gGarden, {cast:false});
      for(var i=0;i<9;i++){
        var px = bx - 0.85 + (i%3)*0.85, pz = bz - 0.28 + Math.floor(i/3)*0.28;
        addSphere(0.13, px, 0.60, pz, (i%2)?MAT.hedge:MAT.leaf2, gGarden);
      }
    });
    /* three fruit trees, spaced so they will not shade the beds at 4 pm */
    tree(4.90, GZ1-1.00, 0.72);
    tree(7.30, GZ1-2.60, 0.66);
    tree(-8.30, GZ1-3.40, 0.70);
  })();

  /* ---------- planting: deep beds on three sides ---------- */
  flowerBed(-8.90, 7.10, -7.30, 9.40);
  flowerBed( 7.95, 8.20,  9.10, 11.60);
  flowerBed(-1.10, 13.30,  1.90, 14.35);
  hedgeRun(-8.95, 12.10, -8.95, 14.60, 0.95);
  hedgeRun(-2.60,  6.85,  0.90,  6.85, 0.70);
  hedgeRun( 3.40, 11.90,  6.40, 11.90, 0.80);
  palm(-8.20, 10.90, 5.6);
  palm( 8.70, 13.40, 6.1);
  tree(-1.80, 10.60, 0.92);
  tree( 5.60, 14.10, 0.78);
  [[-3.60, 8.10],[-1.20, 7.30],[0.70, 9.90],[-6.90, 12.90],[6.90, 7.20],
   [3.10, 13.10],[-4.20, 13.60],[8.60, 9.60]].forEach(function(p){
    shrub(p[0], p[1], 0.85 + ((p[0]*7+p[1]*3)%5)/9);
  });

  /* ---------- a birdbath where the two paths meet ---------- */
  (function(){
    var x = 6.95, z = GZ1-1.00;
    addCyl(0.34,0.42,0.14, x, 0.11, z, MAT.stone, gGarden, 18);
    addCyl(0.11,0.13,0.62, x, 0.45, z, MAT.stone, gGarden, 14);
    addCyl(0.42,0.30,0.16, x, 0.84, z, MAT.stone, gGarden, 20);
    addCyl(0.35,0.35,0.04, x, 0.90, z, MAT.water, gGarden, 20, {cast:false});
    addCollider(x-0.4, x+0.4, z-0.4, z+0.4, 0, 0.9);
  })();

  });   /* planting() */
})();
CTAG = null;

/* ============================================================
   SPORTS COURT  -  the alternative to the garden, on the same ground
   ------------------------------------------------------------
   Only one of the two can exist: the court needs the whole rear of the
   plot, which is exactly the ground the garden is laid out on. Toggled
   in part 6.

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
    /* The games pavilion stands off the south-west corner and is there in both
       options, so two of these runs have to stop short of it rather than pass
       through its roof. On that stretch the pavilion wall is the ball stop. */
    var PVE = PVX1 + 0.55;       /* clear of the pavilion eaves */
    run(nx0,nz1,nx1,nz1,3.0);          /* rear - the 2.4 m boundary wall is behind it */
    run(nx0,nz0+0.45,nx0,nz1,4.0);     /* west, starting behind the pavilion */
    run(nx1,nz0,nx1,nz1,4.0);          /* east */
    run(PVE,nz0,nx1,nz0,2.6);          /* house side, east of the pavilion */
  })();

  /* ---------- floodlights ---------- */
  /* The south-west mast is pulled 1 m north of the corner: at the corner
     proper it would stand inside the games pavilion roof. */
  [[x0-0.35, z1+0.35],[x1+0.35, z1+0.35],[x0-0.35, z0+0.65],[x1+0.35, z0-0.35]].forEach(function(p){
    addCyl(0.09,0.12,6.0, p[0], 3.0, p[1], MAT.steel, gSport, 12);
    var ox = (p[0] < CX ? 0.34 : -0.34), oz = (p[1] < CZ ? 0.20 : -0.20);
    var head = addBox(0.62,0.30,0.40, p[0]+ox, 5.95, p[1]+oz, MAT.black, gSport, {});
    head.rotation.x = 0.42 * (p[1] < CZ ? -1 : 1);
    addBox(0.54,0.06,0.32, p[0]+ox*1.3, 5.86, p[1]+oz*1.3, MAT.lamp, gSport, {cast:false});
  });

  /* ---------- solar array ----------
     The panels used to live on the BQ roof; with that block gone for good they
     sit flat on the main roof deck in both options, tucked behind the parapet
     so they stay out of sight from the ground. Inside gRoof rather than
     gSport so that "Roof off" takes them away with the roof they sit on. */
  (function(){
    gSolar = new THREE.Group();
    gRoof.add(gSolar);
    var pv = M(0x1a2740,{r:0.25,m:0.4});
    var py = RF + 0.09;
    for(var i=0;i<6;i++){
      addBox(1.72, 0.05, 1.02, hx(1.90 + i*1.82), py, hz(HD/2), pv, gSolar, {});
    }
  })();

  /* ---------- courtside ---------- */
  /* benches east of the pavilion, which occupies the west end of this strip */
  [-0.40, 4.60].forEach(function(bx){
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
