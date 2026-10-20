"use strict";
/* ============================================================
   OPTION C  -  THE COURTYARD HOUSE
   ------------------------------------------------------------
   The house turns inward round an impluvium court. You come in through a
   zaure - an entrance hall with a baffle wall that turns you before you see
   anything - step out onto a verandah, and only then find the court, where
   the roofs pour their rain onto a gravel bed over a cistern.

   Four parts, all on one 600 mm plinth:
     front wing   v 0..4.5,  single storey: reception, zaure, cloaks, WC
     west wing    u 0..3.8,  two storeys: guest suite below, bedroom 3 above
     east wing    u 10..13.55, single storey: the service wing - staff room,
                  dirty kitchen, pantry, then the clean kitchen on the court
     rear block   v 12..20.5, two storeys: study, double-height family
                  lounge, stair, dining, gym and covered terrace below;
                  master suite and bedroom 2 above
   The court is u 5.1..10, v 5.8..10.7, with a verandah on three sides and,
   on the west and north sides, an open gallery above it on the same columns.

   The roofs are monopitch and every one of them falls towards the court,
   which is the whole idea: the court is where the water goes.

   Local frame: u = 0 on the west wall, v = 0 on the front wall, which stands
   8.0 m back from the street boundary.
   ============================================================ */
HZ = Z0 + 8.0;
var DESIGN = { id:"C", name:"Courtyard house", siteLabel:"COURTYARD HOUSE", stairs:[], spots:[] };

function ew(u0,v0,u1,v1,trim,ops,o){ o=o||{};
  hwall(u0,v0,u1,v1,{h:o.h||CH, t:EXT.t, mat:EXT.mat, y:o.y||GF, group:o.g||gGF, trim:trim, openings:ops||[]}); }
function iw(u0,v0,u1,v1,ops,o){ o=o||{};
  hwall(u0,v0,u1,v1,{h:o.h||CH, t:INT.t, mat:INT.mat, y:o.y||GF, group:o.g||gGF, openings:ops||[]}); }
var TOP = GF + CH;                 /* 3.60, the top of a ground-floor wall */
var FTOP = FF + CH;                /* 6.90, the top of a first-floor wall */

/* ============================================================
   GROUND AND PLINTH
   ============================================================ */
plinth(0, 0, 13.55, 4.5);                         /* front wing */
plinth(0, 4.5, 3.8, 12);                          /* west wing */
plinth(10, 4.5, 13.55, 12);                       /* east wing */
plinth(3.8, 4.5, 10, 5.8, MAT.paverWarm);         /* verandah, south */
plinth(3.8, 5.8, 5.1, 10.7, MAT.paverWarm);       /* verandah, west */
plinth(3.8, 10.7, 10, 12, MAT.paverWarm);         /* verandah, north */
plinth(0, 12, 9, 20.5);                           /* rear block */
plinth(9, 12, 13.55, 15.6);                       /* dining */
plinth(9, 15.6, 13.55, 20.5, MAT.paverWarm);      /* covered terrace */
court(5.1, 5.8, 10, 10.7);

/* the impluvium: a gravel bed in the middle of the court, which is where the
   rain off every roof ends up, over the cistern that keeps it */
addBox(2.6, 0.05, 2.6, hx(7.55), GF-0.12, hz(8.25), MAT.soil, gGF, {cast:false});
plant("tree6", hx(7.55), hz(8.25), 3.6, gGF, GF-0.15);
addCollider(hx(7.25), hx(7.85), hz(7.95), hz(8.55), GF-0.15, GF+2.0);

/* steps down off the plinth */
steps(5.3, 7.3, 0, '-v');                         /* front door */
steps(0.3, 1.6, 13.55, '+u');                     /* staff door */
steps(6.8, 8.1, 13.55, '+u');                     /* pantry service door */
steps(0.4, 5.1, 20.5, '+v');                      /* lounge to garden */
steps(6.0, 8.5, 20.5, '+v');                      /* gym to garden */
steps(9.0, 13.55, 20.5, '+v');                    /* terrace to garden */
steps(15.6, 20.5, 13.55, '+u');                   /* terrace to the east path */

/* ============================================================
   ROOFS - every one falls towards the court
   ============================================================ */
var roofFront = shed(-0.9, -0.9, 10, 4.5, '+v', 5.8, 3.45, 0.20);
shed(3.8, 4.5, 10, 5.8, '+v', 5.8, 3.45, 0.20);                    /* over the south verandah */
var roofEast  = shed(10, -0.9, 14.45, 12, '-u', 9.9, 3.70, 0.20);
var roofWest  = shed(-0.9, 3.6, 5.1, 10.7, '+u', 5.1, 6.75, 0.20);  /* west wing and its gallery */
var roofRear  = shed(-0.9, 10.7, 14.45, 21.4, '-v', 10.7, 6.75, 0.18); /* rear block and the north gallery */
/* the west wing's roof stands higher than the rear roof where they meet:
   close the triangle between them */
wedge(-0.9, 10.7, 5.1, 10.7, roofRear(0,10.7), roofWest(-0.9,0) - roofRear(0,10.7), 0.02, 0.18, gRoof, MAT.wallExt);

/* ============================================================
   GROUND FLOOR WALLS
   ============================================================ */
/* -- outside walls -- */
ew(0, 0, 10, 0, -1, [opH(0.8,4.2,0.9,2.45), opH(5.7,6.9,0,2.40), opH(8.3,9.3,1.6,2.35)],
   {h: roofFront(0,0) - GF});
ew(10, 0, 13.55, 0, -1, [opH(10.8,12.8,0.9,2.45)]);
wedge(10, 0, 13.55, 0, TOP, roofEast(10,0) - TOP, roofEast(13.55,0) - TOP);
ew(0, 0, 0, 20.5, -1, [opV(1.0,3.5,0.9,2.45), opV(5.5,8.0,0.9,2.45), opV(9.8,11.4,1.6,2.35),
                       opV(12.6,14.0,0.9,2.45), opV(15.0,19.5,0.15,2.75,true)]);
wedge(0, 0, 0, 4.5, TOP, roofFront(0,0) - TOP, roofFront(0,4.5) - TOP);
/* The east wall stops either side of the dirty kitchen: that side of it is
   the breeze-block screen itself, which lets the smoke and heat straight out
   and keeps the yard in view. A wall with a doorway there would only have
   been a doorway blocked by a screen. */
ew(13.55, 0, 13.55, 3.8, 1, [opV(0.5,1.4,0,2.20), opV(2.0,3.3,1.1,2.35)], {h: roofEast(13.55,0) - GF});
ew(13.55, 6.6, 13.55, 12, 1, [opV(7.0,7.9,0,2.20), opV(9.0,11.4,1.0,2.40)], {h: roofEast(13.55,0) - GF});
ew(13.55, 12, 13.55, 15.6, 1, [opV(12.6,15.2,0.9,2.45)]);
ew(0, 20.5, 9, 20.5, 1, [opH(0.6,4.9,0,2.75,true), opH(6.2,8.3,0,2.40,true)]);

/* -- the front wing -- */
iw(0, 4.5, 3.8, 4.5);
ew(3.8, 4.5, 10, 4.5, 1, [opH(3.95,4.85,0,2.40,true), opH(5.4,7.2,0,2.60,true)]);
iw(5, 0, 5, 4.5, [opV(2.6,3.5,0,2.20)]);
iw(7.6, 0, 7.6, 4.5, [opV(2.9,3.7,0,2.20)]);
iw(7.6, 2.2, 10, 2.2, [opH(8.3,9.1,0,2.20)]);
/* the zaure's baffle: the front door opens onto a wall, and you turn */
iw(5.7, 1.3, 6.9, 1.3);

/* -- the east (service) wing -- */
iw(10, 0, 10, 3.8);
wedge(10, 0, 10, 4.5, TOP, roofFront(10,0) - TOP, roofFront(10,4.5) - TOP);
ew(10, 3.8, 10, 12, -1, [opV(8.6,10.4,0.9,2.45), opV(10.9,11.8,0,2.40,true)]);
iw(10, 3.8, 13.55, 3.8);
iw(10, 6.6, 13.55, 6.6, [opH(11.5,12.4,0,2.20)]);
iw(10, 8.4, 13.55, 8.4, [opH(10.4,11.2,0,2.20)]);

/* -- the west wing: the guest suite -- */
iw(0, 9, 3.8, 9, [opH(2.5,3.5,0,2.20)]);
ew(3.8, 4.5, 3.8, 12, 1, [opV(6.0,7.0,0,2.40,true), opV(7.3,8.6,0.9,2.45)]);

/* -- the rear block -- */
iw(0, 12, 3.8, 12);
ew(3.8, 12, 10, 12, -1, [opH(4.0,5.2,0,2.40,true), opH(5.6,8.95,0,2.60), opH(9.1,9.9,0,2.40,true)]);
iw(10, 12, 13.55, 12, [opH(10.4,13.1,0,2.60)]);
iw(5.5, 12, 5.5, 20.5, [opV(15.6,16.5,0,2.20)]);
iw(0, 14.5, 5.5, 14.5, [opH(0.8,3.0,0,2.60)]);
iw(9, 12, 9, 15.6, [opV(12.6,15.2,0,2.60)]);
ew(9, 15.6, 9, 20.5, 1, [opV(16.8,19.8,0,2.45,true)]);
iw(5.5, 16.6, 9, 16.6, [opH(6.0,6.9,0,2.20)]);
ew(9, 15.6, 13.55, 15.6, 1, [opH(9.5,13.0,0,2.45,true)]);

/* -- verandah columns on the court edge. On the west and north they carry
   the gallery as well, so they run up to the first floor; on the south the
   verandah is single storey and they stop under its roof. -- */
column(5.1, 5.8, 0, FF-0.30);
column(7.55, 5.8, 0, 3.45);
column(5.1, 8.25, 0, FF-0.30);
column(5.1, 10.7, 0, FF-0.30);
column(7.55, 10.7, 0, FF-0.30);
/* and their continuations, from the gallery floor up to the roof */
[[5.1,5.8,roofWest(5.1,0)], [5.1,8.25,roofWest(5.1,0)], [5.1,10.7,roofRear(0,10.7)],
 [7.55,10.7,roofRear(0,10.7)], [10,10.7,roofRear(0,10.7)]].forEach(function(p){
  column(p[0], p[1], FF, p[2] - FF, gFF, 0.18);
});
/* the covered terrace stands on columns at its open corners */
column(13.55, 20.5, 0, FF-0.30);
column(11.27, 20.5, 0, FF-0.30);
column(13.55, 18.05, 0, FF-0.30);

/* -- breeze-block screens: the whole west face, and the dirty kitchen -- */
screenWall(-0.32, -0.3, -0.32, 20.8, 0, TOP);
screenWall(13.55, 3.8, 13.55, 6.6, GF, roofEast(13.55,0) - GF);

/* -- the stair: a dog-leg starting from the court verandah, arriving
   upstairs onto the gallery over the same spot -- */
dogleg(5.5, 12, 7.9, 15.5, 'v0');

/* ============================================================
   FIRST FLOOR
   ============================================================ */
floorFF(0, 4.5, 3.8, 12);                         /* west wing */
floorFF(3.8, 5.8, 5.1, 10.7);                     /* gallery, west */
floorFF(3.8, 10.7, 10, 12);                       /* gallery, north */
floorFF(0, 12, 5.5, 14.5);                        /* reading gallery */
floorFF(5.5, 15.5, 7.9, 20.5);
floorFF(7.9, 12, 13.55, 20.5);

/* -- outside walls -- */
ew(0, 4.5, 0, 10.7, -1, [opV(5.2,7.6,0.9,2.45), opV(8.8,10.2,1.6,2.35)], {y:FF, g:gFF, h: roofWest(0,0) - FF});
ew(0, 10.7, 0, 12, -1, [], {y:FF, g:gFF});
ew(0, 4.5, 3.8, 4.5, -1, [opH(0.8,3.0,0.9,2.45)], {y:FF, g:gFF});
wedge(0, 4.5, 3.8, 4.5, FTOP, roofWest(0,0) - FTOP, roofWest(3.8,0) - FTOP, EXT.t, gFF);
ew(3.8, 4.5, 3.8, 12, 1, [opV(6.0,6.9,0,2.20), opV(7.1,8.2,0.9,2.40), opV(10.9,11.6,0,2.20)], {y:FF, g:gFF});
ew(0, 12, 0, 20.5, -1, [opV(12.5,14.0,0.9,2.45), opV(15.0,19.5,0,2.75,true)], {y:FF, g:gFF});
wedge(0, 12, 0, 20.5, FTOP, roofRear(0,12) - FTOP, roofRear(0,20.5) - FTOP, EXT.t, gFF);
ew(0, 20.5, 13.55, 20.5, 1, [opH(0.6,4.9,0,2.75,true), opH(6.0,8.8,0.9,2.45), opH(10.0,13.0,0.9,2.45)],
   {y:FF, g:gFF, h: roofRear(0,20.5) - FF});
ew(13.55, 12, 13.55, 20.5, 1, [opV(12.4,14.0,1.6,2.35), opV(15.5,19.5,0.9,2.45)], {y:FF, g:gFF});
wedge(13.55, 12, 13.55, 20.5, FTOP, roofRear(0,12) - FTOP, roofRear(0,20.5) - FTOP, EXT.t, gFF);
ew(9.4, 12, 13.55, 12, -1, [opH(11.8,13.0,1.6,2.35)], {y:FF, g:gFF});

/* -- inside -- */
iw(0, 8.4, 3.8, 8.4, [opH(2.7,3.5,0,2.20)], {y:FF, g:gFF});
iw(0, 10.6, 3.8, 10.6, [], {y:FF, g:gFF});
iw(0, 12, 3.8, 12, [], {y:FF, g:gFF});
iw(5.5, 14.5, 5.5, 20.5, [], {y:FF, g:gFF});
iw(5.5, 15.5, 9.4, 15.5, [opH(8.2,9.0,0,2.20)], {y:FF, g:gFF});
iw(7.6, 15.5, 7.6, 17.3, [opV(16.4,17.2,0,2.20)], {y:FF, g:gFF});
iw(5.5, 17.3, 9.4, 17.3, [opH(7.9,8.8,0,2.20)], {y:FF, g:gFF});
iw(9.4, 12, 9.4, 20.5, [opV(12.6,13.4,0,2.20)], {y:FF, g:gFF});
iw(9.4, 14.6, 13.55, 14.6, [opH(9.8,10.7,0,2.20), opH(11.7,12.5,0,2.20)], {y:FF, g:gFF});
iw(11.4, 12, 11.4, 14.6, [opV(13.0,13.8,0,2.20)], {y:FF, g:gFF});

/* -- guards: the gallery's open court edge, the drop into the double-height
   lounge, and the two open sides of the stairwell -- */
rail(hx(5.1), hz(5.8), hx(5.1), hz(10.7), FF, gFF);
rail(hx(5.1), hz(10.7), hx(10), hz(10.7), FF, gFF);
rail(hx(3.8), hz(5.8), hx(5.1), hz(5.8), FF, gFF);
rail(hx(10), hz(10.7), hx(10), hz(12), FF, gFF);
rail(hx(0), hz(14.5), hx(5.5), hz(14.5), FF, gFF);
rail(hx(5.5), hz(12), hx(5.5), hz(14.5), FF, gFF);
rail(hx(7.9), hz(12), hx(7.9), hz(15.5), FF, gFF);

/* ============================================================
   CEILINGS AND LIGHT
   ============================================================ */
/* under the first floor - lifted with it */
[[0,4.5,3.8,12],[3.8,5.8,5.1,10.7],[3.8,10.7,10,12],[0,12,5.5,14.5],[5.5,15.5,7.9,20.5],[7.9,12,13.55,20.5]]
  .forEach(function(r){ ceiling(r[0],r[1],r[2],r[3], TOP, gFF); });
/* under the single-storey roofs - lifted with the roof */
ceiling(0, 0, 10, 4.5, TOP, gRoof);
ceiling(10, 0, 13.55, 12, TOP, gRoof);
ceiling(3.8, 4.5, 10, 5.8, 3.38, gRoof);
/* the first floor's own ceiling, which also closes the top of the lounge */
ceiling(0, 4.5, 3.8, 12, FTOP, gRoof);
ceiling(0, 12, 13.55, 20.5, FTOP, gRoof);

[[0,0,5,4.5],[5,0,7.6,4.5],[7.6,0,10,4.5],[10,0,13.55,3.8],[10,3.8,13.55,6.6],[10,6.6,13.55,8.4],[10,8.4,13.55,12]]
  .forEach(function(r){ downlights(r[0],r[1],r[2],r[3], TOP, gRoof); });
[[0,4.5,3.8,9],[0,9,3.8,12],[0,12,5.5,14.5],[9,12,13.55,15.6],[5.5,16.6,9,20.5],[9,15.6,13.55,20.5],[3.8,10.7,10,12],[3.8,5.8,5.1,10.7]]
  .forEach(function(r){ downlights(r[0],r[1],r[2],r[3], TOP, gFF); });
[[0,4.5,3.8,8.4],[0,8.4,3.8,10.6],[0,12,5.5,14.5],[7.9,12,9.4,15.5],[5.5,15.5,7.6,17.3],[5.5,17.3,9.4,20.5],
 [9.4,12,11.4,14.6],[11.4,12,13.55,14.6],[9.4,14.6,13.55,20.5]]
  .forEach(function(r){ downlights(r[0],r[1],r[2],r[3], FTOP, gRoof); });

extLight(hx(5.2), hz(-0.17), GF+2.1, 0, gGF);
extLight(hx(7.4), hz(-0.17), GF+2.1, 0, gGF);
extLight(hx(13.72), hz(1.95), GF+2.1, 1, gGF);
extLight(hx(13.72), hz(8.4), GF+2.1, 1, gGF);
extLight(hx(5.35), hz(20.67), GF+2.3, 2, gGF);

/* ============================================================
   FURNITURE
   ============================================================ */
/* -- reception -- */
rugMat(hx(2.1), hz(2.25), GF, 3.0, 2.8, gGF);
sofa(hx(0.55), hz(2.25), GF, 2.4, 3, gGF);
armchair(hx(3.35), hz(1.25), GF, 1, gGF);
armchair(hx(3.35), hz(3.25), GF, 1, gGF);
coffeeTable(hx(1.95), hz(2.25), GF, 1.0, 0.6, gGF);
potPlant(hx(0.5), hz(0.45), GF, gGF, 1.1);
artwork(hx(4.89), hz(1.3), GF+1.6, 1.0, 0.75, 1, gGF);
pendant(hx(1.95), hz(2.25), TOP, gRoof, 1.0);
ac(hx(2.4), hz(4.37), GF+2.55, 2, gGF);

/* -- the zaure: an artwork on the baffle is the first thing you see -- */
artwork(hx(6.3), hz(1.2), GF+1.6, 1.0, 0.7, 2, gGF);
potPlant(hx(5.35), hz(4.1), GF, gGF, 1.1);
potPlant(hx(7.25), hz(4.1), GF, gGF, 1.1);

/* -- guest WC and cloaks -- */
addBox(2.3, 0.02, 2.1, hx(8.8), GF+0.011, hz(1.1), MAT.tileWet, gGF, {cast:false});
wc(hx(9.55), hz(1.1), GF, 1, gGF);
basin(hx(8.05), hz(1.1), GF, 3, gGF, 0.6);
wardrobe(hx(8.8), hz(4.13), GF, 2.0, 2, gGF);

/* -- staff room, with its own shower and WC -- */
bed(hx(12.25), hz(2.68), GF, 1.0, 2.0, 2, gGF, MAT.linen);
addBox(1.2, 0.02, 3.0, hx(10.65), GF+0.011, hz(1.6), MAT.tileWet, gGF, {cast:false});
shower(hx(10.1), hz(0.1), hx(11.15), hz(1.15), GF, gGF);
wc(hx(10.42), hz(1.75), GF, 3, gGF);
basin(hx(10.4), hz(2.85), GF, 3, gGF, 0.55);
ac(hx(12.2), hz(0.16), GF+2.45, 0, gGF);

/* -- dirty kitchen: the heavy cooking, out of the house -- */
addBox(3.5, 0.02, 2.75, hx(11.78), GF+0.011, hz(5.2), MAT.paverWarm, gGF, {cast:false});
counterRun(hx(10.38), hz(4.0), hx(10.38), hz(6.4), GF, gGF, false);
cooker(hx(13.0), hz(6.22), GF, 2, gGF);
addCyl(0.25, 0.22, 0.35, hx(11.4), GF+0.35, hz(4.4), MAT.steel, gGF, 14, {furn:true});

/* -- pantry / laundry -- */
fsolid(0.45, 2.0, 1.6, hx(10.3), GF+1.0, hz(7.5), MAT.wood, gGF);
fsolid(0.6, 0.85, 0.6, hx(12.0), GF+0.43, hz(8.02), MAT.white, gGF);

/* -- the clean kitchen, on the court -- */
fridge(hx(12.95), hz(8.83), GF, 0, gGF);
counterRun(hx(13.17), hz(9.4), hx(13.17), hz(11.85), GF, gGF, false);
island(hx(11.4), hz(10.45), GF, 1.8, 0.9, gGF);
pendant(hx(11.0), hz(10.45), TOP, gRoof, 1.0);
pendant(hx(11.8), hz(10.45), TOP, gRoof, 1.0);

/* -- guest suite, step-free throughout -- */
rugMat(hx(1.6), hz(6.75), GF, 2.8, 2.4, gGF);
bed(hx(1.2), hz(6.75), GF, 1.6, 2.0, 3, gGF, MAT.linen);
wardrobe(hx(2.0), hz(4.87), GF, 2.0, 0, gGF);
ac(hx(1.9), hz(8.84), GF+2.55, 2, gGF);
addBox(3.6, 0.02, 2.8, hx(1.9), GF+0.011, hz(10.5), MAT.tileWet, gGF, {cast:false});
wc(hx(0.45), hz(10.1), GF, 3, gGF);
basin(hx(1.6), hz(11.67), GF, 2, gGF, 0.8);
shower(hx(2.3), hz(10.5), hx(3.7), hz(11.9), GF, gGF);

/* -- verandah -- */
/* one pot, in the corner nothing opens onto - the reception's verandah door
   is at the other end, and the doorway check found the first attempt in it */
potPlant(hx(9.6), hz(5.2), GF, gGF, 1.0);
armchair(hx(4.45), hz(7.3), GF, 3, gGF);
armchair(hx(4.45), hz(9.2), GF, 3, gGF);

/* -- study, under the reading gallery -- */
desk(hx(0.41), hz(13.3), GF, 1.6, 3, gGF);
bookshelf(hx(2.6), hz(12.24), GF, 2.4, 0, gGF);

/* -- family lounge, double height, facing the garden -- */
rugMat(hx(2.75), hz(17.2), GF, 3.4, 3.0, gGF);
sofa(hx(2.75), hz(15.95), GF, 2.6, 0, gGF);
coffeeTable(hx(2.75), hz(17.3), GF, 1.0, 0.6, gGF);
armchair(hx(0.75), hz(17.6), GF, 3, gGF);
armchair(hx(4.75), hz(17.6), GF, 1, gGF);
pendant(hx(2.75), hz(17.3), FTOP, gRoof, 2.4);
wallLight(hx(5.35), hz(18.6), GF+1.95, 1, gGF);
ac(hx(5.38), hz(19.6), GF+2.55, 1, gGF);
potPlant(hx(0.5), hz(20.0), GF, gGF, 1.2);

/* -- stair hall -- */
potPlant(hx(8.6), hz(16.2), GF, gGF, 1.0);

/* -- dining -- */
diningSet(hx(11.3), hz(13.8), GF, 6, 0, gGF);
pendant(hx(11.3), hz(13.8), TOP, gFF, 1.1);
fsolid(0.42, 0.78, 1.6, hx(13.22), GF+0.39, hz(13.8), MAT.joinery, gGF);

/* -- gym, on the ground, looking out to the garden -- */
rugMat(hx(7.25), hz(18.55), GF, 3.3, 3.7, gGF, MAT.black);
addBox(1.9, 1.9, 0.03, hx(7.85), GF+1.25, hz(16.7), MAT.steel, gGF, {cast:false});
gymKit(hx(6.3), hz(18.2), hx(8.1), hz(18.6), GF, gGF);
ac(hx(5.62), hz(19.8), GF+2.55, 3, gGF);

/* -- covered terrace -- */
diningSet(hx(11.3), hz(18.2), GF, 4, 0, gGF);
potPlant(hx(13.1), hz(20.1), GF, gGF, 1.2);

/* -- bedroom 3 -- */
bed(hx(1.11), hz(6.4), FF, 1.4, 2.0, 3, gFF, MAT.fabric2);
wardrobe(hx(1.3), hz(8.03), FF, 1.8, 2, gFF);
ac(hx(3.68), hz(5.4), FF+2.55, 1, gFF);
addBox(3.6, 0.02, 2.0, hx(1.9), FF+0.011, hz(9.5), MAT.tileWet, gFF, {cast:false});
shower(hx(0.1), hz(8.55), hx(1.2), hz(10.5), FF, gFF);
basin(hx(2.4), hz(10.27), FF, 2, gFF, 0.8);
wc(hx(3.37), hz(9.75), FF, 1, gFF);
fsolid(0.5, 2.1, 1.2, hx(0.37), FF+1.05, hz(11.3), MAT.wood, gFF);

/* -- the galleries -- */
potPlant(hx(4.8), hz(9.2), FF, gFF, 1.0);       /* clear of bedroom 3's door */
bookshelf(hx(1.9), hz(12.24), FF, 3.0, 0, gFF);
armchair(hx(1.3), hz(13.6), FF, 0, gFF);
armchair(hx(3.3), hz(13.6), FF, 0, gFF);
artwork(hx(9.3), hz(14.3), FF+1.6, 0.9, 0.7, 1, gFF);

/* -- bedroom 2 -- */
addBox(2.0, 0.02, 1.7, hx(6.55), FF+0.011, hz(16.4), MAT.tileWet, gFF, {cast:false});
shower(hx(5.6), hz(15.6), hx(6.55), hz(16.55), FF, gFF);
wc(hx(5.95), hz(16.89), FF, 2, gFF);
basin(hx(7.0), hz(15.8), FF, 0, gFF, 0.5);
bed(hx(6.66), hz(19.0), FF, 1.4, 2.0, 3, gFF, MAT.fabric2);
wardrobe(hx(9.03), hz(19.2), FF, 1.8, 1, gFF);
ac(hx(5.62), hz(18.0), FF+2.55, 3, gFF);

/* -- master suite -- */
wardrobe(hx(10.9), hz(12.37), FF, 0.9, 0, gFF);  /* past the swing of the corridor door */
addBox(2.1, 0.02, 2.5, hx(12.48), FF+0.011, hz(13.3), MAT.tileWet, gFF, {cast:false});
shower(hx(12.3), hz(12.1), hx(13.45), hz(13.4), FF, gFF);
wc(hx(11.75), hz(12.45), FF, 0, gFF);
basin(hx(13.18), hz(14.05), FF, 1, gFF, 0.9);
rugMat(hx(11.4), hz(17.6), FF, 3.0, 3.0, gFF);
bed(hx(12.41), hz(17.6), FF, 1.8, 2.05, 1, gFF);
tvUnit(hx(9.65), hz(17.6), FF, 1.6, 3, gFF);
armchair(hx(10.2), hz(19.8), FF, 2, gFF);
ac(hx(9.52), hz(15.4), FF+2.55, 3, gFF);

/* ============================================================
   GARDEN AND SOLAR
   ============================================================ */
palm(hx(-1.4), hz(23.0), 6.2);
tree(hx(11.6), hz(23.4), 0.75);
shrub(hx(2.0), hz(22.6)); shrub(hx(8.2), hz(23.0)); shrub(hx(14.2), hz(21.5));
flowerBed(hx(3.0), hz(22.8), hx(6.0), hz(23.5));
solarCarport();

/* ============================================================
   ROOMS AND VIEWPOINTS
   ============================================================ */
zonesU([
  ["Reception", GF, 0,0,5,4.5], ["Zaure entrance", GF, 5,0,7.6,4.5],
  ["Guest WC", GF, 7.6,0,10,2.2], ["Cloaks + store", GF, 7.6,2.2,10,4.5],
  ["Staff room", GF, 10,0,13.55,3.8], ["Dirty kitchen", GF, 10,3.8,13.55,6.6],
  ["Pantry / laundry", GF, 10,6.6,13.55,8.4], ["Kitchen", GF, 10,8.4,13.55,12],
  ["Guest bedroom", GF, 0,4.5,3.8,9], ["Guest shower room", GF, 0,9,3.8,12],
  ["Verandah", GF, 3.8,4.5,10,5.8], ["Verandah", GF, 3.8,5.8,5.1,10.7], ["Verandah", GF, 3.8,10.7,10,12],
  ["Study", GF, 0,12,5.5,14.5], ["Family lounge", GF, 0,14.5,5.5,20.5],
  ["Stair hall", GF, 5.5,12,9,16.6], ["Dining room", GF, 9,12,13.55,15.6],
  ["Gym", GF, 5.5,16.6,9,20.5], ["Covered terrace", GF, 9,15.6,13.55,20.5],
  ["Impluvium court", GF-0.15, 5.1,5.8,10,10.7],
  ["Bedroom 3", FF, 0,4.5,3.8,8.4], ["Bedroom 3 en-suite", FF, 0,8.4,3.8,10.6],
  ["Linen store", FF, 0,10.6,3.8,12],
  ["Gallery", FF, 3.8,5.8,5.1,10.7], ["Gallery", FF, 3.8,10.7,10,12],
  ["Reading gallery", FF, 0,12,5.5,14.5], ["Upstairs corridor", FF, 7.9,12,9.4,15.5],
  ["Bedroom 2 en-suite", FF, 5.5,15.5,7.6,17.3], ["Bedroom 2 lobby", FF, 7.6,15.5,9.4,17.3],
  ["Bedroom 2", FF, 5.5,17.3,9.4,20.5],
  ["Master dressing room", FF, 9.4,12,11.4,14.6], ["Master bathroom", FF, 11.4,12,13.55,14.6],
  ["Master bedroom", FF, 9.4,14.6,13.55,20.5],
  ["Rear garden", 0, -2.5,20.5,16.05,24.1]
]);

DESIGN.plates = {
  gf: [[0,0,10,4.5],[10,0,13.55,3.8],[0,4.5,3.8,12],[10,6.6,13.55,12],[0,12,9,20.5],[9,12,13.55,15.6]],
  ff: [[0,4.5,3.8,12],[3.8,5.8,5.1,10.7],[3.8,10.7,10,12],[0,12,5.5,14.5],[5.5,15.5,7.9,20.5],[7.9,12,13.55,20.5]]
};
DESIGN.outdoor = {
  gf: [[3.8,4.5,10,5.8],[3.8,5.8,5.1,10.7],[3.8,10.7,10,12],[10,3.8,13.55,6.6],[9,15.6,13.55,20.5]],
  ff: []
};
DESIGN.voids = { ff: [[0,14.5,5.5,20.5,"OPEN TO LOUNGE"],[5.5,12,7.9,15.5,"STAIR"]] };
DESIGN.cover = [[0,0,13.55,5.8],[0,5.8,5.1,10.7],[10,5.8,13.55,10.7],[0,10.7,13.55,20.5]];
DESIGN.extraQuant = [["Verandahs (roofed, open)", 6.2*1.3 + 1.3*4.9 + 6.2*1.3],
                     ["Covered terrace", 4.55*4.9], ["Impluvium court (open)", 4.9*4.9]];
DESIGN.spots = [
  ["Front door (zaure)",      hx(6.3),  0,       hz(-2.2), Math.PI],
  ["Zaure entrance",          hx(6.3),  GF,      hz(0.6),  Math.PI],
  ["Reception",               hx(4.4),  GF,      hz(4.0),  0.75],
  ["Verandah",                hx(9.3),  GF,      hz(11.4), 0.79],
  ["Impluvium court",         hx(9.4),  GF-0.15, hz(6.3),  2.36],
  ["Kitchen",                 hx(10.6), GF,      hz(11.5), -0.8],
  ["Dining room",             hx(9.6),  GF,      hz(15.0), -0.8],
  ["Family lounge",           hx(4.9),  GF,      hz(15.2), 2.36],
  ["Study",                   hx(4.9),  GF,      hz(14.1), 0.79],
  ["Guest bedroom",           hx(3.3),  GF,      hz(8.4),  0.8],
  ["Gym",                     hx(8.5),  GF,      hz(17.1), 2.36],
  ["Covered terrace",         hx(13.0), GF,      hz(20.0), 0.79],
  ["Foot of the stairs",      hx(6.1),  GF,      hz(11.4), Math.PI],
  ["Gallery",                 hx(4.45), FF,      hz(10.0), -0.79],
  ["Reading gallery",         hx(5.0),  FF,      hz(13.9), 2.36],
  ["Master bedroom",          hx(9.9),  FF,      hz(15.2), -2.36],
  ["Master dressing room",    hx(9.8),  FF,      hz(13.4), -1.57],
  ["Bedroom 2",               hx(8.4),  FF,      hz(17.7), 2.36],
  ["Bedroom 3",               hx(3.3),  FF,      hz(7.9),  0.8],
  ["Upstairs corridor",       hx(8.65), FF,      hz(12.3), Math.PI],
  ["Rear garden (looking at the house)", hx(6.8), 0, hz(23.5), 0]
];

/* the downloaded beds and sofas, now every one is queued */
placeModels();
