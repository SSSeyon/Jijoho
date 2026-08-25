"use strict";
/* ============================================================
   PART 5  -  DUPLEX FIRST FLOOR, BALCONY, ROOF

   The upper floor is deliberately bigger than the ground floor. It runs
   2.40 m further north than the ground floor's rear wall and 2.40 m further
   south than its front wall, so it reads as a wide plate resting on a
   narrower base - and both overhangs earn their keep rather than being
   shape for its own sake. The front one roofs the balcony; the rear one
   roofs the terrace outside the kitchen.

        v = -2.40  ......  balcony, open, covered by the roof wing
        v =  0.00  ......  ground-floor front wall line
        v = 11.50  ......  ground-floor rear wall line
        v = 13.90  ......  upper floor rear edge (2.40 m cantilever)
   ============================================================ */
var UV1 = 13.90;      /* upper floor rear edge */
var UB  = -2.20;      /* balcony front edge    */

/* ---------- first-floor slab (hole at the stairwell) ----------
   The slab itself is rendered concrete, because its edge is visible from the
   garden as a band across the elevation; the tiled finish is a separate thin
   plate laid on top of it. */
[[0.0,0.0,5.0,UV1],[5.0,0.0,6.5,2.60],[5.0,7.36,6.5,UV1],[6.5,0.0,13.55,UV1]].forEach(function(r){
  slab(hx(r[0]), hz(r[1]), hx(r[2]), hz(r[3]), FF, SLAB, MAT.wallExt, gFF, {});
  addBox(r[2]-r[0]-0.02, 0.03, r[3]-r[1]-0.02,
         hx((r[0]+r[2])/2), FF-0.010, hz((r[1]+r[3])/2), MAT.tileF, gFF, {cast:false});
});
/* The rear cantilever's soffit. A 2.40 m projection is a real piece of
   engineering - it wants a downstand edge beam and top steel carried well
   back into the slab - so it is drawn with a visible beam rather than as a
   wafer of concrete floating in mid-air. */
addBox(HW+0.24, 0.46, 0.34, hx(HW/2), FF-SLAB-0.08, hz(UV1)-0.17, MAT.wallExt, gFF, {});

/* ---------- balcony ----------
   The "general balcony" of the brief: one continuous 2.40 m deep terrace
   across almost the whole frontage, not the token 1.80 m ledge the first
   version had. The family room and bedroom 3 both open straight onto it. */
slab(hx(0.6), hz(UB), hx(12.95), hz(0.0), FF, SLAB, MAT.paverWarm, gFF, {});
rail(hx(0.6),  hz(UB), hx(12.95), hz(UB),  FF, gFF);
rail(hx(0.6),  hz(UB), hx(0.6),   hz(0.0), FF, gFF);
rail(hx(12.95),hz(UB), hx(12.95), hz(0.0), FF, gFF);
/* No porch or balcony columns: the plate above is the roof deck itself
   stepping past the wall line, cantilevered on the floor structure with
   nothing visible holding its outer edge up. That absence is what reads as
   "cantilever" rather than "covered porch". */
/* balcony furniture - a sitting end, a dining end, and planting between */
sofa(hx(2.60), hz(-1.55), FF, 2.2, 0, gFF, MAT.fabric2);
armchair(hx(4.55), hz(-1.05), FF, 1, gFF);
coffeeTable(hx(3.10), hz(-0.95), FF, 1.0, 0.6, gFF);
diningSet(hx(9.90), hz(-1.25), FF, 4, 0, gFF);
potPlant(hx(1.20), hz(-1.95), FF, gFF, 1.15);
potPlant(hx(6.75), hz(-2.00), FF, gFF, 1.25);
potPlant(hx(12.40),hz(-1.95), FF, gFF, 1.15);

/* ---------- fluted charcoal accents ----------
   Placed only where the wall is solid on BOTH floors, so each panel runs the
   full two storeys the way the reference elevation does. Split at the floor
   line into a gGF piece and a gFF piece purely so the "Upper floor off"
   toggle takes the top half away with the floor it belongs to; the two meet
   flush and read as one panel. Ribs face outwards on each elevation. */
(function(){
  var T0 = GF + 0.10, T1 = FF, T2 = FF + CH - 0.20;
  var wt = EXT.t/2 + 0.005;
  function panel(cx, cz, w, face){
    flutePanel(cx, (T0+T1)/2, cz, w, T1-T0, face, gGF);
    flutePanel(cx, (T1+T2)/2, cz, w, T2-T1, face, gFF);
  }
  /* east elevation */
  panel(hx(HW) + wt, hz(6.45), 0.95, "+x");
  panel(hx(HW) + wt, hz(9.65), 0.90, "+x");
  /* west elevation, the one the afternoon sun rakes across */
  panel(hx(0) - wt, hz(4.00), 1.20, "-x");
  panel(hx(0) - wt, hz(7.00), 1.20, "-x");
  panel(hx(0) - wt, hz(10.85), 1.30, "-x");
})();
/* Single-storey fluting on the upper floor only, where it stands clear of the
   ground floor over the two cantilevers - there is no wall below to continue
   it down to. */
(function(){
  var T1 = FF, T2 = FF + CH - 0.20, wt = EXT.t/2 + 0.005;
  flutePanel(hx(2.20), (T1+T2)/2, hz(UV1) + wt, 1.30, T2-T1, "+z", gFF);
  flutePanel(hx(10.90),(T1+T2)/2, hz(UV1) + wt, 1.20, T2-T1, "+z", gFF);
})();

/* ---------- exterior walls ---------- */
hwall(0,0,HW,0,{h:CH,t:EXT.t,mat:EXT.mat,y:FF,group:gFF,trim:-1,openings:[
  opH(1.4,4.4,0,2.45,true), opH(6.9,7.9,0.90,2.40), opH(9.6,12.6,0,2.45,true)
]});
hwall(0,UV1,HW,UV1,{h:CH,t:EXT.t,mat:EXT.mat,y:FF,group:gFF,trim:1,openings:[
  opH(1.2,3.6,0.90,2.45), opH(5.2,7.6,0.90,2.45), opH(9.6,12.4,0.90,2.45)
]});
hwall(0,0,0,UV1,{h:CH,t:EXT.t,mat:EXT.mat,y:FF,group:gFF,trim:-1,openings:[
  opV(0.8,2.2,0.90,2.45), opV(3.4,6.2,0.90,2.45), opV(7.6,9.4,1.60,2.35), opV(10.8,13.2,0.90,2.45)
]});
hwall(HW,0,HW,UV1,{h:CH,t:EXT.t,mat:EXT.mat,y:FF,group:gFF,trim:1,openings:[
  opV(1.2,3.6,0.90,2.45), opV(5.0,6.4,1.60,2.35), opV(7.4,8.8,1.60,2.35), opV(10.4,13.0,0.90,2.45)
]});

/* ---------- interior walls ----------
   The stairwell void is u 5.00-6.50, v 2.60-7.36, and it is what shapes this
   plan: it blocks the middle of the floor between the front rooms and the
   landing, so the corridor has to run east of it. */
hwall(6.5,0,6.5,7.36, {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF,openings:[ opV(0.9,1.8,0,2.20) ]});
hwall(0,2.6,5.0,2.6,  {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF,openings:[ opH(1.4,2.3,0,2.20) ]});
hwall(5.0,2.6,5.0,7.36,{h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(5.0,2.6,6.5,2.6, {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(0,7.0,5.0,7.0,  {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(2.8,7.0,2.8,10.2,{h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(5.0,7.36,5.0,10.2,{h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(0,10.2,8.3,10.2,{h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF,openings:[
  opH(0.8,1.7,0,2.20), opH(3.4,4.3,0,2.20), opH(5.6,6.5,0,2.20)
]});
hwall(8.3,0,8.3,UV1,  {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF,openings:[
  opV(1.4,2.3,0,2.20), opV(5.2,6.1,0,2.20), opV(9.3,10.1,0,2.20)
]});
hwall(8.3,4.6,HW,4.6, {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF,openings:[ opH(11.5,12.4,0,2.20) ]});
hwall(10.8,4.6,10.8,9.2,{h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(8.3,6.9,HW,6.9, {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF});
hwall(8.3,9.2,HW,9.2, {h:CH,t:INT.t,mat:INT.mat,y:FF,group:gFF,openings:[
  opH(9.0,9.9,0,2.20), opH(11.6,12.5,0,2.20)
]});

/* ============================================================
   FIRST FLOOR FURNITURE
   ============================================================ */
/* --- family room  (u 0..6.5, v 0..2.6) ---
   Sits directly behind the balcony doors, so in use the two read as one
   17 + 30 m2 room with a glass wall in the middle of it. */
rugMat(hx(3.10), hz(1.35), FF, 3.6, 2.0, gFF);
sofa(hx(3.00), hz(0.55), FF, 2.6, 0, gFF);
armchair(hx(5.55), hz(1.60), FF, 1, gFF);
coffeeTable(hx(3.10), hz(1.45), FF, 1.2, 0.65, gFF);
tvUnit(hx(1.10), hz(2.32), FF, 2.0, 2, gFF);
ceilingFan(hx(3.10), hz(1.35), FF+CH, gFF);
[[1.3,0.7],[4.6,0.7],[1.3,2.1],[4.6,2.1]].forEach(function(p){ downlight(hx(p[0]),hz(p[1]),FF+CH,gFF); });
ac(hx(5.90), hz(0.22), FF+2.55, 0, gFF);

/* --- study / library  (u 0..5.0, v 2.6..7.0) ---
   Entered from the family room, and deliberately a back room: no through
   route passes it, which is the whole point of a room meant for reading.
   Shelving on the two long walls, the desk under the west window. */
bookshelf(hx(0.30), hz(3.60), FF, 1.7, 1, gFF);
bookshelf(hx(0.30), hz(6.10), FF, 1.7, 1, gFF);
bookshelf(hx(2.40), hz(6.88), FF, 2.6, 2, gFF);
bookshelf(hx(4.70), hz(4.30), FF, 2.2, 3, gFF);
desk(hx(1.55), hz(4.90), FF, 1.6, 1, gFF);
chair(hx(2.35), hz(4.90), FF, 3, gFF);
armchair(hx(3.65), hz(3.35), FF, 0, gFF);
rugMat(hx(2.50), hz(4.60), FF, 2.6, 2.2, gFF, MAT.fabric2);
potPlant(hx(4.55), hz(2.95), FF, gFF, 1.0);
downlight(hx(1.4),hz(3.4),FF+CH,gFF); downlight(hx(3.8),hz(3.4),FF+CH,gFF);
downlight(hx(1.4),hz(6.2),FF+CH,gFF); downlight(hx(3.8),hz(6.2),FF+CH,gFF);
pendant(hx(2.50), hz(4.60), FF+CH, gFF, 0.95);

/* --- corridor + landing --- */
rugMat(hx(7.40), hz(3.6), FF, 1.3, 6.0, gFF, MAT.fabric2);
artwork(hx(8.22), hz(3.2), FF+1.75, 0.9, 0.7, 1, gFF);
artwork(hx(6.58), hz(5.4), FF+1.75, 0.9, 0.7, 3, gFF);
potPlant(hx(7.90), hz(0.70), FF, gFF, 1.1);
fsolid(1.10,0.78,0.36, hx(7.75), FF+0.39, hz(9.85), MAT.wood, gFF);
artwork(hx(7.75), hz(10.10), FF+1.70, 1.1, 0.8, 2, gFF);
[[7.4,1.2],[7.4,3.6],[7.4,6.0],[6.6,8.6],[7.9,9.4]].forEach(function(p){ downlight(hx(p[0]),hz(p[1]),FF+CH,gFF); });
/* stairwell head - glazed clerestory borrowing light into the corridor */
addBox(0.04,0.75,1.6, hx(6.5), FF+2.45, hz(4.6), MAT.glass, gFF, {cast:false});
/* void balustrade, north edge of the stairwell where the flight arrives */
rail(hx(5.0), hz(7.36), hx(6.5), hz(7.36), FF, gFF);

/* --- master bedroom  (u 0..8.3, v 10.2..13.9  =  30.7 m2) ---
   The brief asked for a much bigger master and this is where the extra floor
   area went: 8.30 m wide, running the full width of the west side and out
   over the rear cantilever, with the bed floating off the party wall rather
   than pushed into a corner. */
rugMat(hx(4.05), hz(12.10), FF, 4.6, 3.4, gFF);
bed(hx(4.05), hz(11.70), FF, 2.00, 2.20, 0, gFF);
fsolid(0.55,0.58,0.45, hx(2.70), FF+0.29, hz(10.62), MAT.woodDark, gFF);
fsolid(0.55,0.58,0.45, hx(5.40), FF+0.29, hz(10.62), MAT.woodDark, gFF);
tvUnit(hx(4.05), hz(13.60), FF, 2.2, 0, gFF);
armchair(hx(1.05), hz(13.10), FF, 3, gFF);
armchair(hx(7.40), hz(12.90), FF, 1, gFF);
fsolid(0.5,0.45,0.5, hx(1.05), FF+0.23, hz(12.20), MAT.wood, gFF);
ceilingFan(hx(4.05), hz(12.10), FF+CH, gFF);
[[1.6,10.9],[6.4,10.9],[1.6,13.2],[6.4,13.2],[4.05,12.1]].forEach(function(p){ downlight(hx(p[0]),hz(p[1]),FF+CH,gFF); });
ac(hx(6.90), hz(10.42), FF+2.55, 0, gFF);
artwork(hx(4.05), hz(10.45), FF+1.95, 1.5, 1.0, 0, gFF);

/* --- master bathroom  (u 0..2.8, v 7.0..10.2) --- */
addBox(2.80,0.02,3.20, hx(1.40), FF+0.011, hz(8.60), MAT.tileWet, gFF, {cast:false});
basin(hx(1.30), hz(7.25), FF, 0, gFF, 1.60);
wc(hx(0.42), hz(9.70), FF, 2, gFF);
bathtub(hx(1.65), hz(9.60), FF, 1.70, 0.78, gFF);
shower(hx(2.00), hz(7.55), hx(2.72), hz(8.55), FF, gFF);
downlight(hx(0.9),hz(7.8),FF+CH,gFF); downlight(hx(2.1),hz(9.4),FF+CH,gFF);

/* --- master walk-in closet  (u 2.8..5.0, v 7.0..10.2) --- */
wardrobe(hx(3.95), hz(7.20), FF, 2.0, 0, gFF);
wardrobe(hx(3.05), hz(8.90), FF, 2.4, 3, gFF);
wardrobe(hx(4.80), hz(8.90), FF, 2.4, 1, gFF);
fsolid(1.0,0.55,0.55, hx(3.95), FF+0.28, hz(9.20), MAT.wood, gFF);
downlight(hx(3.9),hz(8.6),FF+CH,gFF);

/* --- bedroom 2  (u 8.3..13.55, v 9.2..13.9) --- */
rugMat(hx(10.90), hz(11.90), FF, 3.2, 2.8, gFF);
bed(hx(10.90), hz(11.60), FF, 1.60, 2.10, 0, gFF, MAT.fabric2);
fsolid(0.48,0.55,0.42, hx(9.85), FF+0.28, hz(10.35), MAT.woodDark, gFF);
fsolid(0.48,0.55,0.42, hx(11.95),FF+0.28, hz(10.35), MAT.woodDark, gFF);
desk(hx(13.00), hz(12.70), FF, 1.3, 1, gFF);
tvUnit(hx(10.90), hz(13.62), FF, 1.6, 0, gFF);
ceilingFan(hx(10.90), hz(11.90), FF+CH, gFF);
downlight(hx(9.4),hz(10.6),FF+CH,gFF); downlight(hx(12.6),hz(13.0),FF+CH,gFF);
ac(hx(12.60), hz(9.42), FF+2.55, 0, gFF);
/* bedroom 2 en-suite (u 8.3..10.8, v 6.9..9.2) */
addBox(2.50,0.02,2.30, hx(9.55), FF+0.011, hz(8.05), MAT.tileWet, gFF, {cast:false});
wc(hx(8.72), hz(7.30), FF, 0, gFF);
basin(hx(9.90), hz(7.15), FF, 0, gFF, 0.95);
shower(hx(9.60), hz(8.30), hx(10.70), hz(9.10), FF, gFF);
downlight(hx(9.6),hz(8.1),FF+CH,gFF);
/* bedroom 2 walk-in (u 10.8..13.55, v 6.9..9.2) */
wardrobe(hx(12.20), hz(7.15), FF, 2.4, 0, gFF);
wardrobe(hx(11.05), hz(8.30), FF, 1.8, 3, gFF);
downlight(hx(12.2),hz(8.2),FF+CH,gFF);

/* --- bedroom 3  (u 8.3..13.55, v 0..4.6) ---
   The second-biggest bedroom, and the other one that opens onto the balcony. */
rugMat(hx(10.90), hz(2.40), FF, 3.2, 2.8, gFF);
bed(hx(10.90), hz(2.75), FF, 1.60, 2.10, 2, gFF, MAT.fabric2);
fsolid(0.48,0.55,0.42, hx(9.85), FF+0.28, hz(4.10), MAT.woodDark, gFF);
fsolid(0.48,0.55,0.42, hx(11.95),FF+0.28, hz(4.10), MAT.woodDark, gFF);
desk(hx(13.00), hz(1.60), FF, 1.3, 1, gFF);
wardrobe(hx(9.30), hz(1.30), FF, 2.0, 3, gFF);
ceilingFan(hx(10.90), hz(2.40), FF+CH, gFF);
downlight(hx(9.4),hz(1.2),FF+CH,gFF); downlight(hx(12.6),hz(3.6),FF+CH,gFF);
ac(hx(12.60), hz(4.38), FF+2.55, 2, gFF);
/* bedroom 3 en-suite (u 10.8..13.55, v 4.6..6.9) */
addBox(2.75,0.02,2.30, hx(12.18), FF+0.011, hz(5.75), MAT.tileWet, gFF, {cast:false});
wc(hx(13.10), hz(5.05), FF, 0, gFF);
basin(hx(11.60), hz(4.90), FF, 0, gFF, 0.95);
shower(hx(11.00), hz(5.95), hx(12.10), hz(6.80), FF, gFF);
downlight(hx(12.2),hz(5.8),FF+CH,gFF);

/* --- linen / plant store (u 8.3..10.8, v 4.6..6.9) --- */
fsolid(2.30,2.20,0.50, hx(9.55), FF+1.10, hz(4.90), MAT.wood, gFF);
fsolid(0.70,1.60,0.70, hx(10.35), FF+0.80, hz(6.45), MAT.steel, gFF);
downlight(hx(9.6),hz(5.9),FF+CH,gFF);

/* ---------- roof slab + parapet ---------- */
slab(hx(0), hz(0), hx(HW), hz(UV1), RF, SLAB, MAT.wallInt, gRoof, {walk:false});
parapetRoof(hx(0), hz(0), hx(HW), hz(UV1), RF, 0.42, MAT.accent, MAT.white, gRoof);

/* ---------- cantilevered roof wing over the balcony ----------
   The move the whole redesign is named for: the roof deck stepping past the
   front wall on its own plate, wide enough to cover the balcony below and
   deep enough to still be shading it at midday, with nothing under its
   leading edge. */
addBox(12.75, 0.30, 2.20, hx(6.75), RF-0.15, hz(-1.10), MAT.wallExt, gRoof, {});
addBox(12.95, 0.07, 0.15, hx(6.75), RF-0.015, hz(UB), MAT.accent, gRoof, {});

/* ---------- water tanks, on the roof ----------
   They used to sit in the utility yard on a 3.2 m steel tower, which is the
   usual Lagos answer and a poor one: the tower is ugly, it eats the only
   piece of service ground on the plot, and 3.2 m of head is barely enough to
   run an upstairs shower properly.

   On the roof deck they start 7.2 m above the ground, which gives roughly
   0.75 bar at the ground-floor taps and about 0.4 bar at the first-floor
   showers - a real difference you can feel. They stand on a low plinth behind
   the parapet, so from the street and the garden you see the parapet line and
   not the tanks. */
(function(){
  var tx = hx(11.30), tz = hz(11.60);
  addBox(3.40, 0.22, 2.40, tx, RF + 0.11, tz, MAT.wallInt, gRoof, {});
  [[-1.10, 0], [1.10, 0]].forEach(function(p){
    var cx = tx + p[0];
    addCyl(0.70, 0.70, 1.30, cx, RF + 0.87, tz, M(0x2f5f8f,{r:0.45,m:0.10,env:1.4}), gRoof, 20);
    addCyl(0.75, 0.75, 0.09, cx, RF + 1.56, tz, M(0x24476b,{r:0.45,m:0.10}), gRoof, 20);
    /* the down-main, dropping through the slab into the plant store below */
    addCyl(0.045,0.045, 0.95, cx + 0.62, RF - 0.30, tz + 0.72, MAT.steel, gRoof, 8);
  });
  /* access ladder up the parapet from the roof hatch */
  (function(){
    var lx = tx - 2.05;
    [-0.24, 0.24].forEach(function(o){
      addCyl(0.028,0.028, 1.45, lx + o, RF + 0.72, tz - 1.55, MAT.steel, gRoof, 6);
    });
    for(var i=0;i<5;i++){
      var r = addCyl(0.018,0.018, 0.48, lx, RF + 0.16 + i*0.28, tz - 1.55, MAT.steel, gRoof, 6);
      r.rotation.z = Math.PI/2;
    }
  })();
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

  /* ---------- games tent ----------
     What used to be a 20 m2 glazed pavilion with block walls, a hip roof and
     a plinth. It is a tent now: four poles, a peaked canvas and the table
     tennis under it. That is a straight trade of about 8-10 million naira of
     building for a few hundred thousand of fabric, and it hands the ground it
     stood on back to the garden.

     The honest catch is that it belongs to the garden now. It is drawn inside
     gGarden, so switching to the sports court takes it away with everything
     else back here - the old pavilion survived both options because it was a
     building on its own foundation, and a tent in the middle of a badminton
     court is not a thing you can have. */
  (function(){
    var tx = -5.80, tz = 12.90;          /* centre */
    var hw = 2.60, hd = 1.80;            /* 5.20 x 3.60 m */
    var eave = 2.30, ridge = 3.15;
    var canvas = M(0xf6f2e8, {r:0.88, env:0.5});
    var mast   = M(0x8b8f93, {r:0.35, m:0.65, env:1.4});

    surf(tx-hw-0.30, tz-hd-0.30, tx+hw+0.30, tz+hd+0.30, MAT.paverWarm, 0.08, gGarden);
    addFloor(tx-hw-0.30, tx+hw+0.30, tz-hd-0.30, tz+hd+0.30, 0.08);

    /* four legs, guyed back to pegs so it reads as a tent and not a carport */
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(p){
      addCyl(0.055, 0.065, eave, tx+p[0]*hw, eave/2, tz+p[1]*hd, mast, gGarden, 10);
      addCollider(tx+p[0]*hw-0.09, tx+p[0]*hw+0.09, tz+p[1]*hd-0.09, tz+p[1]*hd+0.09, 0, eave);
      var gx2 = tx + p[0]*(hw+0.75), gz2 = tz + p[1]*(hd+0.55);
      var gl = addCyl(0.012, 0.012, 2.05, (tx+p[0]*hw+gx2)/2, eave*0.55, (tz+p[1]*hd+gz2)/2, mast, gGarden, 5);
      gl.rotation.z = p[0]*0.36; gl.rotation.x = -p[1]*0.28;
      addBox(0.07,0.16,0.07, gx2, 0.06, gz2, MAT.black, gGarden, {cast:false});
    });
    /* ridge bar */
    addCyl(0.045,0.045, hw*2, tx, ridge, tz, mast, gGarden, 8).rotation.z = Math.PI/2;

    /* the canvas: two sloping panels and two gable triangles, double-sided so
       you see the underside of the fabric from below */
    (function(){
      var v = [], uv = [];
      function tri(a,b,c, ua,ub,uc){
        v.push(a[0],a[1],a[2], b[0],b[1],b[2], c[0],c[1],c[2]);
        uv.push(ua[0],ua[1], ub[0],ub[1], uc[0],uc[1]);
      }
      var x0=tx-hw, x1=tx+hw, z0=tz-hd, z1=tz+hd;
      /* slope to -z */
      tri([x0,eave,z0],[x1,eave,z0],[x1,ridge,tz], [0,0],[1,0],[1,1]);
      tri([x0,eave,z0],[x1,ridge,tz],[x0,ridge,tz], [0,0],[1,1],[0,1]);
      /* slope to +z */
      tri([x1,eave,z1],[x0,eave,z1],[x0,ridge,tz], [0,0],[1,0],[1,1]);
      tri([x1,eave,z1],[x0,ridge,tz],[x1,ridge,tz], [0,0],[1,1],[0,1]);
      /* gable ends */
      tri([x0,eave,z0],[x0,ridge,tz],[x0,eave,z1], [0,0],[0.5,1],[1,0]);
      tri([x1,eave,z1],[x1,ridge,tz],[x1,eave,z0], [0,0],[0.5,1],[1,0]);
      var g = new T.BufferGeometry();
      g.setAttribute("position", new T.Float32BufferAttribute(v,3));
      g.setAttribute("uv", new T.Float32BufferAttribute(uv,2));
      g.computeVertexNormals();
      canvas.side = T.DoubleSide;
      var m = new T.Mesh(g, canvas);
      m.castShadow = true; m.receiveShadow = true;
      gGarden.add(m);
      /* a scalloped valance along both eaves - the detail that stops the
         canopy reading as a folded sheet of card */
      [z0, z1].forEach(function(zz){
        addBox(hw*2, 0.22, 0.02, tx, eave-0.11, zz, canvas, gGarden, {cast:false});
      });
    })();

    /* table tennis, and the run-off it finally has */
    fsolid(2.74, 0.06, 1.52, tx, 0.84, tz, M(0x1c5e3a,{r:0.75}), gGarden);
    addBox(2.78, 0.02, 0.03, tx, 0.88, tz, MAT.white, gGarden, {});
    addBox(0.03, 0.02, 1.56, tx, 0.88, tz, MAT.white, gGarden, {});
    addBox(0.02, 0.16, 1.80, tx, 0.95, tz, MAT.white, gGarden, {});
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){
      addBox(0.07,0.72,0.07, tx+s[0]*1.25, 0.46, tz+s[1]*0.66, MAT.black, gGarden, {});
    });
    /* two chairs and a drinks table at the end of the tent */
    armchair(tx-2.05, tz+1.25, 0.08, 1, gGarden);
    armchair(tx+2.05, tz+1.25, 0.08, 3, gGarden);
    var tl = addCyl(0.14,0.07,0.16, tx, ridge-0.16, tz, MAT.lamp, gGarden, 12); tl.castShadow = false;
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
    tree(-1.90, GZ1-0.85, 0.70);          /* moved clear of the games tent */
  })();

  /* ---------- planting: deep beds on three sides ---------- */
  flowerBed(-8.90, 7.10, -7.30, 9.40);
  flowerBed( 7.95, 8.20,  9.10, 11.60);
  flowerBed(-1.10, 13.30,  1.90, 14.35);
  hedgeRun(-8.95, 13.40, -8.95, 14.80, 0.95);
  hedgeRun(-2.60,  6.85,  0.90,  6.85, 0.70);
  hedgeRun( 3.40, 11.90,  6.40, 11.90, 0.80);
  palm(-8.20, 10.90, 5.6);
  palm( 8.70, 13.40, 6.1);
  palm(-1.80, 10.60, 6.6);
  palm( 5.60, 14.10, 5.9);
  /* the two that used to stand at (-6.90, 12.90) and (-4.20, 13.60) are gone:
     the games tent is on that ground now */
  [[-3.60, 8.10],[-1.20, 7.30],[0.70, 9.90],[6.90, 7.20],
   [3.10, 13.10],[8.60, 9.60],[-8.40, 9.90]].forEach(function(p){
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
    /* These used to stop short of the games pavilion, which stood off the
       south-west corner and was present in both options. The pavilion is gone
       - it is a tent in the garden now, and the garden is the thing this court
       replaces - so the netting finally runs the full way round. */
    run(nx0,nz1,nx1,nz1,3.0);          /* rear - the 2.4 m boundary wall is behind it */
    run(nx0,nz0,nx0,nz1,4.0);          /* west */
    run(nx1,nz0,nx1,nz1,4.0);          /* east */
    run(nx0,nz0,nx1,nz0,2.6);          /* house side */
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
  /* Pushed out to the flanks. They used to sit at x -0.40 and 4.60, which is
     exactly where the rear terrace and its dining table now are - and the
     terrace is present in both options, so they would have been standing in
     each other in court mode. */
  [-3.90, 6.90].forEach(function(bx){
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
