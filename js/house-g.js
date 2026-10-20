"use strict";
/* ============================================================
   OPTION G  -  TWO PAVILIONS
   ------------------------------------------------------------
   Day and night, separated by open air.

     front pavilion   v 0..8.5, single storey under one big hipped roof.
                      Its west part is the open reception and dining
                      pavilion, walled in folding glass screens on three
                      sides; its east part is solid - study, kitchen, and
                      the service rooms on the east path.
     the gap          v 8.5..12.5: a breezeway down the middle, widening
                      into an outdoor dining place on the west court; a
                      plunge pool in the east court; a guest WC pod.
     sleeping pavilion v 12.5..20, two storeys under a second hipped roof:
                      guest suite, gym, family lounge and plant room below,
                      three bedroom suites above. Its stair is a wind
                      tower, open at the top, pulling night air up through
                      the bedrooms without power.

   Local frame: u = 0 on the west wall, v = 0 on the front of the front
   pavilion, which stands 7.0 m back from the street boundary.
   ============================================================ */
HZ = Z0 + 7.0;
var DESIGN = { id:"G", name:"Two pavilions", siteLabel:"TWO PAVILIONS", stairs:[], spots:[] };

function ew(u0,v0,u1,v1,trim,ops,o){ o=o||{};
  hwall(u0,v0,u1,v1,{h:o.h||CH, t:EXT.t, mat:EXT.mat, y:o.y||GF, group:o.g||gGF, trim:trim, openings:ops||[]}); }
function iw(u0,v0,u1,v1,ops,o){ o=o||{};
  hwall(u0,v0,u1,v1,{h:o.h||CH, t:INT.t, mat:INT.mat, y:o.y||GF, group:o.g||gGF, openings:ops||[]}); }
var TOP = GF + CH, FTOP = FF + CH;

/* ============================================================
   GROUND AND PLINTH
   ============================================================ */
plinth(0, 0, 7.4, 8.5);                           /* reception and dining pavilion */
plinth(7.4, 0, 13.55, 8.5);                       /* study, kitchen, service */
plinth(5.5, 8.5, 8, 12.5, MAT.paverWarm);         /* breezeway */
plinth(3.5, 9.3, 5.5, 11.7, MAT.paverWarm);       /* outdoor dining */
plinth(8, 8.5, 9.3, 10.2);                        /* guest WC pod */
plinth(0, 12.5, 13.55, 20);                       /* sleeping pavilion */
court(0, 8.5, 5.5, 9.3, MAT.grassDark);
court(0, 9.3, 3.5, 11.7, MAT.grassDark);
court(0, 11.7, 5.5, 12.5, MAT.grassDark);
court(9.3, 8.5, 13.55, 12.5);
court(8, 10.2, 9.3, 12.5);

/* the plunge pool: water a little below the court, a stone coping, and a
   collider so the walk goes round it rather than into it. 2.1 m deep across
   the court, which is what leaves clear ground in front of both the kitchen's
   door on one side and the gym's glass on the other - the doorway check
   found the first, 2.8 m version standing in both. */
(function(){
  var u0 = 9.6, v0 = 9.6, u1 = 13.0, v1 = 11.7, cu = (u0+u1)/2, cv = (v0+v1)/2;
  /* the court is a solid slab, so the water sits on its surface inside a
     raised coping rather than in a hole the slab would fill */
  addBox(u1-u0-0.30, 0.04, v1-v0-0.30, hx(cu), GF-0.12, hz(cv), MAT.water, gGF, {cast:false});
  [[u0, v0, u1, v0+0.15], [u0, v1-0.15, u1, v1], [u0, v0, u0+0.15, v1], [u1-0.15, v0, u1, v1]].forEach(function(c){
    addBox(c[2]-c[0], 0.10, c[3]-c[1], hx((c[0]+c[2])/2), GF-0.10, hz((c[1]+c[3])/2), MAT.stone, gGF, {cast:false});
  });
  addCollider(hx(u0), hx(u1), hz(v0), hz(v1), 0, GF+0.6);
})();
plant("tree4", hx(1.8), hz(10.5), 3.4, gGF, GF-0.15);
addCollider(hx(1.5), hx(2.1), hz(10.2), hz(10.8), GF-0.15, GF+2.0);

steps(5.6, 7.1, 0, '-v');                         /* the way in, off the front walk */
steps(0.3, 1.6, 13.55, '+u');                     /* staff door */
steps(4.4, 5.7, 13.55, '+u');                     /* pantry service door */
steps(12.8, 14.1, 13.55, '+u');                   /* plant room door */
steps(3.2, 4.6, 20, '+v');                        /* garden store */
steps(8.4, 13.2, 20, '+v');                       /* family lounge to the garden */

/* ============================================================
   ROOFS
   ============================================================ */
hipRoof(hx(0), hz(0), hx(13.55), hz(8.5), TOP, 2.2, 0.9, MAT.roof, gRoof);
hipRoof(hx(0), hz(12.5), hx(13.55), hz(20), FTOP, 2.0, 0.9, MAT.roof, gRoof);
/* the breezeway, the outdoor dining place and the WC pod sit under flat
   roofs tucked below both eaves */
addBox(2.5, 0.15, 4.0, hx(6.75), 3.32, hz(10.5), MAT.wallExt, gRoof, {});
addBox(2.0, 0.15, 2.4, hx(4.5), 3.32, hz(10.5), MAT.wallExt, gRoof, {});
addBox(1.5, 0.15, 1.9, hx(8.65), 3.67, hz(9.35), MAT.wallExt, gRoof, {});
[[5.5,10.5],[8,10.5],[8,12.5],[5.5,12.5],[3.5,9.3],[3.5,11.7]].forEach(function(p){
  column(p[0], p[1], 0, 3.25, gGF, 0.22);
});

/* the wind tower: the stairwell carried up through the sleeping pavilion's
   roof, louvred at the top on all four sides. Warm air rises out of it and
   draws cooler air in through the bedroom windows. */
(function(){
  var u0 = 5.5, u1 = 8, v0 = 16.5, v1 = 20, y0 = FTOP, y1 = FTOP + 2.05, cu = (u0+u1)/2, cv = (v0+v1)/2, k;
  addBox(0.20, y1-y0, v1-v0, hx(u0), (y0+y1)/2, hz(cv), MAT.wallExt, gRoof, {});
  addBox(0.20, y1-y0, v1-v0, hx(u1), (y0+y1)/2, hz(cv), MAT.wallExt, gRoof, {});
  addBox(u1-u0+0.2, y1-y0, 0.20, hx(cu), (y0+y1)/2, hz(v0), MAT.wallExt, gRoof, {});
  addBox(u1-u0+0.2, y1-y0, 0.20, hx(cu), (y0+y1)/2, hz(v1), MAT.wallExt, gRoof, {});
  [[u0,v0],[u1,v0],[u0,v1],[u1,v1]].forEach(function(c){
    addBox(0.22, 0.75, 0.22, hx(c[0]), y1 + 0.375, hz(c[1]), MAT.wallExt, gRoof, {});
  });
  for(k=0;k<5;k++){
    var y = y1 + 0.10 + k*0.13;
    addBox(0.06, 0.05, v1-v0, hx(u0), y, hz(cv), MAT.grille, gRoof, {cast:false});
    addBox(0.06, 0.05, v1-v0, hx(u1), y, hz(cv), MAT.grille, gRoof, {cast:false});
    addBox(u1-u0, 0.05, 0.06, hx(cu), y, hz(v0), MAT.grille, gRoof, {cast:false});
    addBox(u1-u0, 0.05, 0.06, hx(cu), y, hz(v1), MAT.grille, gRoof, {cast:false});
  }
  addBox(u1-u0+0.9, 0.16, v1-v0+0.9, hx(cu), y1 + 0.83, hz(cv), MAT.roof, gRoof, {});
})();

/* ============================================================
   GROUND FLOOR WALLS
   ============================================================ */
/* -- the open pavilion: walls of folding glass between slim piers -- */
ew(0, 0, 7.4, 0, -1, [opH(0.25,3.55,0,2.75,true), opH(3.85,7.15,0,2.75,true)]);
/* the west side looks onto the breeze-block screen and the side yard, so its
   glass is fixed, floor to near-ceiling, rather than doors you could open
   onto a screen 300 mm away */
ew(0, 0, 0, 8.5, -1, [opV(0.25,4.1,0.10,2.75), opV(4.4,8.25,0.10,2.75)]);
ew(0, 8.5, 7.4, 8.5, 1, [opH(0.25,5.25,0,2.75,true), opH(5.6,7.15,0,2.75,true)]);
iw(7.4, 0, 7.4, 3.5, [opV(0.9,1.8,0,2.20)]);
iw(7.4, 3.5, 7.4, 8.5, [opV(4.3,8.0,0,2.60)]);

/* -- the solid east part -- */
ew(7.4, 0, 13.55, 0, -1, [opH(8.0,10.4,0.9,2.45), opH(11.6,13.0,1.1,2.35)]);
/* the east wall stops at the dirty kitchen, whose east side is the screen */
ew(13.55, 0, 13.55, 6.2, 1, [opV(0.5,1.4,0,2.20), opV(2.2,3.6,1.1,2.35), opV(4.6,5.5,0,2.20)]);
ew(7.4, 8.5, 13.55, 8.5, 1, [opH(9.5,10.8,0,2.40,true)]);
iw(7.4, 3.5, 11, 3.5);
iw(11, 0, 11, 8.5, [opV(4.8,5.6,0,2.20), opV(6.8,7.7,0,2.20)]);
iw(11, 4.2, 13.55, 4.2);
iw(11, 6.2, 13.55, 6.2, [opH(11.5,12.4,0,2.20)]);

/* -- guest WC pod, off the breezeway -- */
ew(8, 8.5, 8, 10.2, -1, [opV(8.6,9.4,0,2.20)]);
ew(8, 10.2, 9.3, 10.2, 1, []);
ew(9.3, 8.5, 9.3, 10.2, 1, []);

/* -- the sleeping pavilion -- */
ew(0, 12.5, 13.55, 12.5, -1, [opH(1.0,2.4,0,2.40,true), opH(3.0,5.0,0.9,2.45), opH(5.9,7.6,0,2.40,true),
                              opH(8.4,11.4,0,2.45,true)]);
ew(0, 12.5, 0, 20, -1, [opV(13.2,15.8,0.9,2.45), opV(17.2,19.0,1.6,2.35)]);
ew(13.55, 12.5, 13.55, 20, 1, [opV(13.0,13.9,0,2.20), opV(16.4,19.2,0.9,2.45)]);
ew(0, 20, 13.55, 20, 1, [opH(3.4,4.4,0,2.20), opH(5.9,7.6,2.1,2.85), opH(8.6,13.0,0,2.75,true)]);
iw(5.5, 12.5, 5.5, 20, [opV(13.4,14.4,0,2.20)]);
iw(3, 16.5, 3, 20);
iw(0, 16.5, 5.5, 16.5, [opH(1.2,2.2,0,2.20)]);
iw(8, 12.5, 8, 20, [opV(13.2,14.1,0,2.20), opV(15.7,16.4,0,2.20)]);
iw(8, 15.6, 13.55, 15.6);
iw(11.8, 12.5, 11.8, 15.6);

/* -- breeze-block screens: both west faces, and the dirty kitchen -- */
screenWall(-0.32, -0.3, -0.32, 8.8, 0, TOP);
screenWall(-0.32, 12.2, -0.32, 20.3, 0, FTOP);
screenWall(13.55, 6.2, 13.55, 8.5, GF, CH);

/* -- the stair: a dog-leg at the north end of the hall, arriving upstairs
   at the south end of the landing -- */
dogleg(5.5, 16.5, 8, 20, 'v0');

/* ============================================================
   FIRST FLOOR
   ============================================================ */
floorFF(0, 12.5, 5.5, 20);
floorFF(5.5, 12.5, 8, 16.5);
floorFF(8, 12.5, 13.55, 20);

ew(0, 12.5, 13.55, 12.5, -1, [opH(0.6,3.3,0.9,2.45), opH(4.1,5.3,1.6,2.35), opH(5.8,7.7,0.9,2.45),
                              opH(8.4,10.1,1.6,2.35), opH(10.9,13.1,1.6,2.35)], {y:FF, g:gFF});
ew(0, 12.5, 0, 20, -1, [opV(13.0,15.5,0.9,2.45), opV(16.6,19.4,0.9,2.45)], {y:FF, g:gFF});
ew(13.55, 12.5, 13.55, 20, 1, [opV(13.0,14.4,1.6,2.35), opV(15.4,19.4,0.9,2.45)], {y:FF, g:gFF});
ew(0, 20, 13.55, 20, 1, [opH(0.6,3.3,0.9,2.45), opH(4.1,5.3,1.6,2.35), opH(5.9,7.6,1.0,2.60),
                         opH(8.6,13.0,0.9,2.45)], {y:FF, g:gFF});
iw(3.9, 12.5, 3.9, 20, [opV(13.5,14.3,0,2.20), opV(15.1,15.9,0,2.20), opV(16.5,17.3,0,2.20), opV(18.4,19.2,0,2.20)], {y:FF, g:gFF});
iw(0, 16, 3.9, 16, [], {y:FF, g:gFF});
iw(3.9, 15, 5.5, 15, [], {y:FF, g:gFF});
iw(3.9, 17.5, 5.5, 17.5, [], {y:FF, g:gFF});
iw(5.5, 12.5, 5.5, 20, [opV(15.2,16.2,0,2.20)], {y:FF, g:gFF});
iw(8, 12.5, 8, 20, [opV(13.2,14.0,0,2.20), opV(15.3,16.2,0,2.20)], {y:FF, g:gFF});
iw(8, 14.8, 13.55, 14.8, [opH(8.6,9.5,0,2.20), opH(11.2,12.0,0,2.20)], {y:FF, g:gFF});
iw(10.5, 12.5, 10.5, 14.8, [opV(13.3,14.1,0,2.20)], {y:FF, g:gFF});

/* ============================================================
   CEILINGS AND LIGHT
   ============================================================ */
ceiling(0, 0, 13.55, 8.5, TOP, gRoof);
[[0,12.5,5.5,20],[8,12.5,13.55,20],[5.5,12.5,8,16.5]].forEach(function(r){
  ceiling(r[0],r[1],r[2],r[3], TOP, gFF);
  ceiling(r[0],r[1],r[2],r[3], FTOP, gRoof);
});

[[0,0,7.4,4.4],[0,4.4,7.4,8.5],[7.4,0,11,3.5],[11,0,13.55,4.2],[7.4,3.5,11,8.5],[11,4.2,13.55,6.2],[11,6.2,13.55,8.5]]
  .forEach(function(r){ downlights(r[0],r[1],r[2],r[3], TOP, gRoof); });
[[0,12.5,5.5,16.5],[0,16.5,3,20],[5.5,12.5,8,16.5],[8,12.5,11.8,15.6],[8,15.6,13.55,20]]
  .forEach(function(r){ downlights(r[0],r[1],r[2],r[3], TOP, gFF); });
[[0,12.5,3.9,16],[3.9,12.5,5.5,15],[3.9,15,5.5,17.5],[3.9,17.5,5.5,20],[0,16,3.9,20],[5.5,12.5,8,16.5],
 [8,12.5,10.5,14.8],[10.5,12.5,13.55,14.8],[8,14.8,13.55,20]]
  .forEach(function(r){ downlights(r[0],r[1],r[2],r[3], FTOP, gRoof); });
[[6.75,9.4],[6.75,11.6],[4.5,10.5]].forEach(function(p){ downlight(hx(p[0]), hz(p[1]), 3.25, gRoof); });

extLight(hx(13.72), hz(1.95), GF+2.1, 1, gGF);
extLight(hx(13.72), hz(13.45), GF+2.1, 1, gGF);
extLight(hx(3.9), hz(20.17), GF+2.3, 2, gGF);
extLight(hx(8.0), hz(20.17), GF+2.3, 2, gGF);

/* ============================================================
   FURNITURE
   ============================================================ */
/* -- reception pavilion -- */
rugMat(hx(3.0), hz(2.2), GF, 4.0, 3.0, gGF);
sofa(hx(3.0), hz(0.85), GF, 2.6, 0, gGF);
armchair(hx(1.0), hz(2.5), GF, 3, gGF);
armchair(hx(4.9), hz(2.5), GF, 1, gGF);
coffeeTable(hx(3.0), hz(2.4), GF, 1.1, 0.6, gGF);
potPlant(hx(0.5), hz(0.5), GF, gGF, 1.2);
potPlant(hx(7.0), hz(3.9), GF, gGF, 1.1);

/* -- dining pavilion -- */
diningSet(hx(3.4), hz(6.45), GF, 8, 0, gGF);
pendant(hx(2.6), hz(6.45), TOP, gRoof, 1.0);
pendant(hx(4.2), hz(6.45), TOP, gRoof, 1.0);

/* -- study -- */
desk(hx(9.2), hz(0.41), GF, 1.6, 0, gGF);
bookshelf(hx(9.2), hz(3.26), GF, 2.4, 2, gGF);

/* -- staff room -- */
bed(hx(12.6), hz(3.08), GF, 1.0, 2.0, 2, gGF, MAT.linen);
addBox(1.1, 0.02, 3.0, hx(11.6), GF+0.011, hz(1.6), MAT.tileWet, gGF, {cast:false});
shower(hx(11.1), hz(0.1), hx(12.1), hz(1.1), GF, gGF);
wc(hx(11.42), hz(1.7), GF, 3, gGF);
basin(hx(11.4), hz(2.7), GF, 3, gGF, 0.5);

/* -- kitchen -- */
counterRun(hx(7.6), hz(3.88), hx(10.8), hz(3.88), GF, gGF, true);
fridge(hx(7.9), hz(8.08), GF, 2, gGF);
island(hx(9.2), hz(6.0), GF, 2.0, 0.9, gGF);
pendant(hx(8.7), hz(6.0), TOP, gRoof, 1.0);
pendant(hx(9.7), hz(6.0), TOP, gRoof, 1.0);

/* -- pantry / laundry and the dirty kitchen -- */
fsolid(1.4, 2.0, 0.45, hx(12.4), GF+1.0, hz(4.5), MAT.wood, gGF);
fsolid(0.6, 0.85, 0.6, hx(12.9), GF+0.43, hz(5.85), MAT.white, gGF);
addBox(2.5, 0.02, 2.25, hx(12.27), GF+0.011, hz(7.35), MAT.paverWarm, gGF, {cast:false});
counterRun(hx(11.2), hz(8.12), hx(13.35), hz(8.12), GF, gGF, false);
addCyl(0.25, 0.22, 0.35, hx(12.6), GF+0.35, hz(6.8), MAT.steel, gGF, 14, {furn:true});

/* -- guest WC pod -- */
addBox(1.25, 0.02, 1.65, hx(8.65), GF+0.011, hz(9.35), MAT.tileWet, gGF, {cast:false});
wc(hx(9.0), hz(9.75), GF, 1, gGF);
basin(hx(9.05), hz(8.85), GF, 1, gGF, 0.45);

/* -- outdoor dining under the breezeway's wide middle -- */
diningSet(hx(4.5), hz(10.5), GF, 4, 0, gGF);

/* -- by the pool -- */
[8.65].forEach(function(u){
  fsolid(0.7, 0.32, 1.9, hx(u), GF-0.15+0.16, hz(11.35), MAT.white, gGF);
  var b = fbox(0.66, 0.06, 0.65, hx(u), GF-0.15+0.52, hz(12.1), MAT.cushion, gGF);
  b.rotation.x = -0.6;
});

/* -- guest suite, step-free -- */
rugMat(hx(1.9), hz(14.6), GF, 2.8, 2.6, gGF);
bed(hx(1.15), hz(14.6), GF, 1.6, 2.0, 3, gGF, MAT.linen);
wardrobe(hx(4.0), hz(16.13), GF, 2.0, 2, gGF);
ac(hx(5.38), hz(15.3), GF+2.55, 1, gGF);
addBox(2.9, 0.02, 3.4, hx(1.5), GF+0.011, hz(18.25), MAT.tileWet, gGF, {cast:false});
wc(hx(0.45), hz(18.0), GF, 3, gGF);
basin(hx(1.5), hz(19.67), GF, 2, gGF, 0.8);
shower(hx(1.9), hz(17.0), hx(2.9), hz(19.0), GF, gGF);
fsolid(0.45, 1.8, 2.4, hx(5.2), GF+0.9, hz(18.2), MAT.wood, gGF);

/* -- gym, looking out over the pool -- */
rugMat(hx(9.9), hz(14.05), GF, 3.6, 2.9, gGF, MAT.black);
gymKit(hx(8.75), hz(14.4), hx(10.6), hz(14.3), GF, gGF);
ac(hx(10.0), hz(15.48), GF+2.55, 2, gGF);

/* -- plant room: inverter and batteries for the PV on the carport -- */
fsolid(0.5, 1.8, 2.6, hx(12.13), GF+0.9, hz(14.05), MAT.white, gGF);
fbox(0.5, 0.7, 0.18, hx(12.6), GF+1.5, hz(12.68), MAT.accent, gGF);

/* -- family lounge, on the garden -- */
rugMat(hx(10.8), hz(17.4), GF, 3.8, 3.0, gGF);
sofa(hx(10.8), hz(16.1), GF, 2.6, 0, gGF);
coffeeTable(hx(10.8), hz(17.5), GF, 1.1, 0.6, gGF);
armchair(hx(8.9), hz(17.8), GF, 3, gGF);
armchair(hx(12.7), hz(17.8), GF, 1, gGF);
ac(hx(12.6), hz(15.72), GF+2.55, 0, gGF);

/* -- stair hall -- */
potPlant(hx(7.6), hz(12.95), GF, gGF, 1.0);

/* -- bedroom 2 and its en-suite -- */
bed(hx(1.11), hz(14.25), FF, 1.4, 2.0, 3, gFF, MAT.fabric2);
ac(hx(1.95), hz(15.88), FF+2.55, 2, gFF);
addBox(1.5, 0.02, 2.4, hx(4.7), FF+0.011, hz(13.75), MAT.tileWet, gFF, {cast:false});
shower(hx(4.0), hz(12.6), hx(5.4), hz(13.6), FF, gFF);
wc(hx(5.1), hz(14.3), FF, 1, gFF);
basin(hx(4.4), hz(14.68), FF, 2, gFF, 0.6);

/* -- bedroom 3 and its en-suite -- */
bed(hx(1.11), hz(18.0), FF, 1.4, 2.0, 3, gFF, MAT.fabric2);
ac(hx(1.95), hz(16.12), FF+2.55, 0, gFF);
addBox(1.5, 0.02, 2.4, hx(4.7), FF+0.011, hz(18.75), MAT.tileWet, gFF, {cast:false});
shower(hx(4.0), hz(18.9), hx(5.4), hz(19.9), FF, gFF);
wc(hx(5.1), hz(18.2), FF, 1, gFF);
basin(hx(4.4), hz(17.82), FF, 0, gFF, 0.6);

/* -- landing -- */
potPlant(hx(5.9), hz(12.9), FF, gFF, 1.0);
artwork(hx(7.88), hz(14.9), FF+1.6, 0.9, 0.7, 1, gFF);

/* -- master suite -- */
wardrobe(hx(9.6), hz(12.87), FF, 1.4, 0, gFF);
addBox(2.9, 0.02, 2.2, hx(12.03), FF+0.011, hz(13.65), MAT.tileWet, gFF, {cast:false});
shower(hx(12.45), hz(12.6), hx(13.45), hz(13.7), FF, gFF);
wc(hx(13.17), hz(14.35), FF, 1, gFF);
basin(hx(11.6), hz(12.83), FF, 0, gFF, 0.9);
rugMat(hx(11.0), hz(17.4), FF, 3.0, 3.0, gFF);
bed(hx(12.41), hz(17.4), FF, 1.8, 2.05, 1, gFF);
tvUnit(hx(8.25), hz(18.0), FF, 1.6, 3, gFF);
armchair(hx(9.0), hz(19.5), FF, 2, gFF);
ac(hx(10.4), hz(19.88), FF+2.55, 2, gFF);

/* ============================================================
   GARDEN AND SOLAR
   ============================================================ */
palm(hx(-1.4), hz(22.5), 6.2);
tree(hx(11.2), hz(23.0), 0.75);
shrub(hx(2.0), hz(21.6)); shrub(hx(7.4), hz(22.4)); shrub(hx(14.2), hz(21.0));
flowerBed(hx(1.0), hz(22.4), hx(4.0), hz(23.1));
solarCarport();

/* ============================================================
   ROOMS AND VIEWPOINTS
   ============================================================ */
zonesU([
  ["Reception pavilion", GF, 0,0,7.4,4.4], ["Dining pavilion", GF, 0,4.4,7.4,8.5],
  ["Study", GF, 7.4,0,11,3.5], ["Staff room", GF, 11,0,13.55,4.2],
  ["Kitchen", GF, 7.4,3.5,11,8.5], ["Pantry / laundry", GF, 11,4.2,13.55,6.2],
  ["Dirty kitchen", GF, 11,6.2,13.55,8.5],
  ["Outdoor dining", GF, 3.5,9.3,5.5,11.7], ["Breezeway", GF, 5.5,8.5,8,12.5],
  ["Guest WC", GF, 8,8.5,9.3,10.2],
  ["West court", GF-0.15, 0,8.5,5.5,12.5], ["East court and pool", GF-0.15, 8,8.5,13.55,12.5],
  ["Guest bedroom", GF, 0,12.5,5.5,16.5], ["Guest shower room", GF, 0,16.5,3,20],
  ["Garden store", GF, 3,16.5,5.5,20], ["Stair hall", GF, 5.5,12.5,8,20],
  ["Gym", GF, 8,12.5,11.8,15.6], ["Plant room", GF, 11.8,12.5,13.55,15.6],
  ["Family lounge", GF, 8,15.6,13.55,20],
  ["Bedroom 2", FF, 0,12.5,3.9,16], ["Bedroom 2 en-suite", FF, 3.9,12.5,5.5,15],
  ["Upstairs hall", FF, 3.9,15,5.5,17.5], ["Bedroom 3 en-suite", FF, 3.9,17.5,5.5,20],
  ["Bedroom 3", FF, 0,16,3.9,20], ["Upstairs landing", FF, 5.5,12.5,8,16.5],
  ["Master dressing room", FF, 8,12.5,10.5,14.8], ["Master bathroom", FF, 10.5,12.5,13.55,14.8],
  ["Master bedroom", FF, 8,14.8,13.55,20],
  ["Rear garden", 0, -2.5,20,16.05,25.1]
]);

DESIGN.plates = {
  gf: [[0,0,13.55,6.2],[0,6.2,11,8.5],[8,8.5,9.3,10.2],[0,12.5,13.55,20]],
  ff: [[0,12.5,5.5,20],[5.5,12.5,8,16.5],[8,12.5,13.55,20]]
};
DESIGN.outdoor = { gf: [[11,6.2,13.55,8.5],[5.5,8.5,8,12.5],[3.5,9.3,5.5,11.7]], ff: [] };
DESIGN.voids = { ff: [[5.5,16.5,8,20,"STAIR / WIND TOWER"]] };
DESIGN.cover = [[0,0,13.55,8.5],[5.5,8.5,8,12.5],[3.5,9.3,5.5,11.7],[8,8.5,9.3,10.2],[0,12.5,13.55,20]];
DESIGN.extraQuant = [["Breezeway and outdoor dining (roofed, open)", 2.5*4.0 + 2.0*2.4],
                     ["Plunge pool", 3.4*2.1]];
DESIGN.spots = [
  ["Front of the pavilion",   hx(6.35), 0,       hz(-2.4), Math.PI],
  ["Reception pavilion",      hx(6.9),  GF,      hz(4.0),  0.79],
  ["Dining pavilion",         hx(6.8),  GF,      hz(8.0),  0.79],
  ["Kitchen",                 hx(10.6), GF,      hz(8.0),  0.79],
  ["Study",                   hx(10.7), GF,      hz(3.1),  0.79],
  ["Breezeway",               hx(6.75), GF,      hz(8.9),  Math.PI],
  ["Outdoor dining",          hx(5.3),  GF,      hz(11.5), 2.36],
  ["East court and pool",     hx(8.4),  GF-0.15, hz(12.2), -0.79],
  ["West court",              hx(0.6),  GF-0.15, hz(12.1), -0.79],
  ["Guest bedroom",           hx(5.1),  GF,      hz(15.5), 0.79],
  ["Family lounge",           hx(8.6),  GF,      hz(15.95),-2.36],
  ["Gym",                     hx(11.4), GF,      hz(15.2), 0.79],
  ["Foot of the stairs",      hx(6.1),  GF,      hz(13.0), Math.PI],
  ["Upstairs landing",        hx(6.75), FF,      hz(13.0), Math.PI],
  ["Master bedroom",          hx(8.5),  FF,      hz(15.3), -2.36],
  ["Master bathroom",         hx(11.0), FF,      hz(14.4), -2.36],
  ["Bedroom 2",               hx(3.4),  FF,      hz(12.9), 2.36],
  ["Bedroom 3",               hx(3.4),  FF,      hz(19.6), 0.79],
  ["Rear garden (looking at the house)", hx(6.8), 0, hz(23.5), 0]
];

placeModels();
