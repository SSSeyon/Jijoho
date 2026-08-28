"use strict";
/* ============================================================
   PART 6  -  2D DRAWINGS, SCHEDULES AND CHECKS

   Everything in this file is derived. Nothing here describes the building a
   second time: it reads PLAN.walls and PLAN.furn (filled in as 04 and 05 run)
   and ZONES, and produces from them the floor plans, the site plan, the door
   and window schedules, the room areas, the wall and opening quantities, and
   the planning checks.

   That is the whole reason it exists. A drawing kept alongside a model always
   drifts from it; a drawing computed out of the model cannot. Move a wall in
   04-ground-floor.js and the plan moves, the room area changes, the door
   schedule renumbers itself and the quantities follow.

   It also does one thing to the 3D: it hangs the door leaves. Until now the
   house had none - door() existed in the fittings library and was never once
   called, so every doorway was a bare hole. The leaves are placed from the
   same classification that draws the swing arcs, which is why the two agree.
   ============================================================ */

/* ---------- what counts as what ----------
   The wall builder does not label its openings, but it does not have to: the
   dimensions say what each one is.

     sill above floor          -> a window
     sill on the floor, glazed -> a glazed door or screen; slides, no swing
     sill on the floor, solid  -> a door; swings

   A solid opening wider than 1.20 m is a pair of leaves. */
/* Drawn at 90 degrees, hung at 95. The plan has to check the full quarter turn
   because that is the space the door needs. The model wants a couple of
   degrees past it: a leaf at exactly 90 is square to the wall and reads as a
   panel standing in the room, and the extra five degrees is what a door
   actually does when you push it open and let go. */
var DOORSWING = 1.5708;
var LEAFOPEN  = 1.6581;

/* rooms whose job is to be walked through. A door between one of these and a
   real room swings into the real room, which is the rule every plan follows
   and the reason you never open a bedroom door into a corridor. */
var CIRC = /corridor|landing|foyer|hall|lobby|porch|balcony|stair/i;

function planZoneAt(u, v, y){
  var x = hx(u), z = hz(v), best = null;
  for(var i = 0; i < ZONES.length; i++){
    var Zi = ZONES[i];
    if(Math.abs(Zi.y - y) > 0.05) continue;
    if(x < Zi.x0 || x > Zi.x1 || z < Zi.z0 || z > Zi.z1) continue;
    /* smallest containing zone wins, so an en-suite beats the bedroom */
    if(!best || (Zi.x1-Zi.x0)*(Zi.z1-Zi.z0) < (best.x1-best.x0)*(best.z1-best.z0)) best = Zi;
  }
  return best;
}

/* ---------- classify every opening in the building ---------- */
var OPENINGS = (function(){
  var out = [];
  PLAN.walls.forEach(function(w){
    w.ops.forEach(function(op){
      var wid = op.b - op.a, mid = (op.a + op.b)/2;
      var o = {
        wall : w,
        a : op.a, b : op.b, w : wid,
        sill : op.sill, top : op.top, h : op.top - op.sill,
        y : w.y, ext : w.ext, t : w.t,
        horiz : w.horiz,
        /* u/v of the opening centre */
        u : w.horiz ? mid : w.u0,
        v : w.horiz ? w.v0 : mid
      };
      o.kind = op.sill > 0.001 ? "window" : (op.glass ? "screen" : "door");
      o.leaves = o.kind === "door" ? (wid > 1.20 ? 2 : 1) : 0;

      /* the two sides, half a metre off the wall face either way */
      var off = 0.55 + o.t/2;
      var nA = o.horiz ? [0,-1] : [-1,0];
      o.zA = planZoneAt(o.u + nA[0]*off, o.v + nA[1]*off, o.y);
      o.zB = planZoneAt(o.u - nA[0]*off, o.v - nA[1]*off, o.y);
      out.push(o);
    });
  });

  /* Marks, numbered in reading order per level so they follow the drawing.
     Doors D, glazed screens GD, windows W; ground floor 0xx, first floor 1xx. */
  var seq = {};
  out.sort(function(p,q){ return (p.y - q.y) || (p.v - q.v) || (p.u - q.u); });
  out.forEach(function(o){
    var pre = o.kind === "window" ? "W" : (o.kind === "screen" ? "GD" : "D");
    var lvl = o.y > (GF + FF)/2 ? 1 : 0;
    var key = pre + lvl;
    seq[key] = (seq[key] || 0) + 1;
    o.mark = pre + (lvl*100 + seq[key]);
  });
  return out;
})();

/* ---------- which way each door swings ----------
   Two decisions per door, both of them the ones a draughtsman makes without
   thinking, and both of them worth writing down because getting either wrong
   is a real fault on a real drawing.

   Side: into the room, away from circulation. If neither side is circulation
   the leaf goes into the larger room, because that is the one with somewhere
   for it to go.

   Hinge: at the jamb nearer the corner, so the open leaf lies back against a
   wall instead of standing out in the middle of the room. */
(function(){
  OPENINGS.forEach(function(o){
    if(o.kind !== "door") return;
    var A = o.zA, B = o.zB;
    /* nA is the -side normal in u/v */
    var nA = o.horiz ? [0,-1] : [-1,0];
    var intoA;
    if(A && B){
      var cA = CIRC.test(A.n), cB = CIRC.test(B.n);
      if(cA !== cB)      intoA = cB;                 /* away from the corridor */
      else               intoA = (A.x1-A.x0)*(A.z1-A.z0) >= (B.x1-B.x0)*(B.z1-B.z0);
    } else { intoA = !!A; }

    o.into = intoA ? A : B;
    o.n    = intoA ? nA : [-nA[0], -nA[1]];

    /* hinge at the jamb nearer the end of the room */
    var hu, hv, du, dv;
    if(o.into){
      var za0 = o.horiz ? o.into.x0 - HX : o.into.z0 - HZ;
      var za1 = o.horiz ? o.into.x1 - HX : o.into.z1 - HZ;
      o.hingeAtA = (o.a - za0) <= (za1 - o.b);
    } else o.hingeAtA = true;

    if(o.horiz){
      hu = o.hingeAtA ? o.a : o.b; hv = o.v;
      du = o.hingeAtA ? 1 : -1;    dv = 0;
    } else {
      hu = o.u; hv = o.hingeAtA ? o.a : o.b;
      du = 0;   dv = o.hingeAtA ? 1 : -1;
    }
    o.hu = hu; o.hv = hv; o.du = du; o.dv = dv;
    /* a pair of leaves is two half-width doors hinged at opposite jambs */
    o.leafW = o.w / o.leaves;
  });
})();

/* ---------- hang the leaves in the 3D model ---------- */
(function(){
  OPENINGS.forEach(function(o){
    var g = o.y > (GF + FF)/2 ? gFF : gGF;
    if(o.kind === "screen") return;             /* sliding; nothing to hang */
    if(o.kind === "window") return;
    /* the lining goes in every doorway, leaf or not */
    doorLining(hx(o.u), hz(o.v), o.w, o.horiz, o.t, o.y, g);
    if(o.w > 2.0) return;   /* a 2 m+ solid opening is a cased opening, not a door */

    for(var i = 0; i < o.leaves; i++){
      /* leaf i hinges at the jamb it is nearest */
      var atA = o.leaves === 1 ? o.hingeAtA : (i === 0);
      var hu = o.horiz ? (atA ? o.a : o.b) : o.u;
      var hv = o.horiz ? o.v : (atA ? o.a : o.b);
      var du = o.horiz ? (atA ? 1 : -1) : 0;
      var dv = o.horiz ? 0 : (atA ? 1 : -1);
      /* hand: +1 swings towards (-dv, du) - see the note in doorLeaf() */
      var hand = (o.n[0]*(-dv) + o.n[1]*du) > 0 ? 1 : -1;
      doorLeaf(hx(hu), hz(hv), du, dv, o.leafW, LEAFOPEN, hand, o.y, g);
    }
  });
})();

/* ---------- do the swings hit anything? ----------
   The check the 3D model could never make and the reason a plan is worth
   drawing: sweep each leaf through its quarter turn and see what is in the
   way. Sampled rather than solved, because a swept quarter-disc against a
   list of rectangles is a page of algebra to do exactly and three lines to do
   well enough at 40 mm resolution. */
var SWINGCLASH = (function(){
  var out = [];
  var IGNORE = /rug/;
  OPENINGS.forEach(function(o){
    if(o.kind !== "door" || !o.leaves || o.w > 2.0) return;
    var hits = {};
    for(var i = 0; i < o.leaves; i++){
      var atA = o.leaves === 1 ? o.hingeAtA : (i === 0);
      var hu = o.horiz ? (atA ? o.a : o.b) : o.u;
      var hv = o.horiz ? o.v : (atA ? o.a : o.b);
      var du = o.horiz ? (atA ? 1 : -1) : 0;
      var dv = o.horiz ? 0 : (atA ? 1 : -1);
      /* the normal the leaf swings towards */
      var nu = -dv * ((o.n[0]*(-dv) + o.n[1]*du) > 0 ? 1 : -1);
      var nv =  du * ((o.n[0]*(-dv) + o.n[1]*du) > 0 ? 1 : -1);
      for(var s = 1; s <= 9; s++){
        var ang = (s/9) * DOORSWING;
        var ca = Math.cos(ang), sa = Math.sin(ang);
        var ru = du*ca + nu*sa, rv = dv*ca + nv*sa;
        for(var r = 0.30; r <= o.leafW + 0.001; r += 0.12){
          var pu = hu + ru*r, pv = hv + rv*r;
          PLAN.furn.forEach(function(f){
            if(Math.abs(f.y - o.y) > 0.05 || IGNORE.test(f.k)) return;
            if(pu > f.u - f.w/2 && pu < f.u + f.w/2 &&
               pv > f.v - f.d/2 && pv < f.v + f.d/2) hits[f.k] = true;
          });
        }
      }
    }
    var k = Object.keys(hits);
    if(k.length) out.push({ mark:o.mark, room:o.into ? o.into.n : "-", hits:k });
  });
  return out;
})();

/* ---------- doorway clearance check ----------
   The swing check above asks whether a leaf can open. This asks the question
   that actually stops you: whether a person can get through the opening once
   it has. They are not the same test and neither catches the other's failures
   - a door with nothing in its arc can still have a washing machine standing
   half a metre inside it, and that is exactly what the pantry had.

   It works off COLLIDERS rather than the plan rectangles, because the things
   that block a door are not always things that got drawn on the plan: a
   built-in cupboard, a bath, a wire chair. For every door and glazed screen it
   sweeps a 0.28 m body - the same radius the walk uses - across the opening
   and 0.45 m either side of the wall, and reports the widest gap that body can
   actually pass through. Under 0.60 m and you cannot get through it. */
var DOORBLOCK = (function(){
  var out = [];
  var RAD = 0.28;
  function blocked(u, v, y){
    var x = hx(u), z = hz(v), lo = y + 0.38, hi = y + 1.75;
    for(var i = 0; i < COLLIDERS.length; i++){
      var c = COLLIDERS[i];
      if(c.y1 <= lo || c.y0 >= hi) continue;
      var cx = Math.max(c.x0, Math.min(x, c.x1)), cz = Math.max(c.z0, Math.min(z, c.z1));
      if((x-cx)*(x-cx) + (z-cz)*(z-cz) < RAD*RAD) return true;
    }
    return false;
  }
  OPENINGS.forEach(function(o){
    if(o.kind === "window") return;
    var N = 24, i, j, pass = [];
    for(i = 0; i <= N; i++){
      /* lateral position of the body centre, kept a body radius inside the
         reveals: a walker cannot stand with their shoulder in the jamb */
      var f = -(o.w/2 - RAD) + (o.w - 2*RAD) * (i/N);
      var ok = true;
      for(j = -1; j <= 1; j++){
        var t = j * 0.45;
        var u = o.horiz ? o.u + f : o.u + t;
        var v = o.horiz ? o.v + t : o.v + f;
        if(blocked(u, v, o.y)){ ok = false; break; }
      }
      pass.push(ok);
    }
    /* widest continuous run that a body can walk down */
    var run = 0, bestRun = 0;
    for(i = 0; i <= N; i++){
      if(pass[i]){ run++; bestRun = Math.max(bestRun, run); } else run = 0;
    }
    var clear = bestRun ? (bestRun-1)/N * (o.w - 2*RAD) + 2*RAD : 0;
    if(clear < 0.60){
      out.push({ mark:o.mark, w:o.w, clear:clear,
                 a:(o.zA ? o.zA.n : "outside"), b:(o.zB ? o.zB.n : "outside") });
    }
  });
  return out;
})();

/* ---------- room schedule ----------
   Clear area, not the grid rectangle: each zone edge that has a wall on it
   gives up half that wall's thickness. Which is why the living room comes out
   at 32.8 m2 and not the 35.0 its 5.0 x 7.0 grid would suggest. */
function planWallOn(isU, at, lo, hi, y){
  for(var i = 0; i < PLAN.walls.length; i++){
    var w = PLAN.walls[i];
    if(Math.abs(w.y - y) > 0.05) continue;
    if(isU){
      if(w.horiz) continue;
      if(Math.abs(w.u0 - at) > 0.06) continue;
      if(Math.min(w.v0,w.v1) > hi - 0.05 || Math.max(w.v0,w.v1) < lo + 0.05) continue;
    } else {
      if(!w.horiz) continue;
      if(Math.abs(w.v0 - at) > 0.06) continue;
      if(Math.min(w.u0,w.u1) > hi - 0.05 || Math.max(w.u0,w.u1) < lo + 0.05) continue;
    }
    return w;
  }
  return null;
}
var ROOMS = (function(){
  return ZONES.filter(function(z){
    return Math.abs(z.y - GF) < 0.05 || Math.abs(z.y - FF) < 0.05;
  }).map(function(z){
    var u0 = z.x0 - HX, u1 = z.x1 - HX, v0 = z.z0 - HZ, v1 = z.z1 - HZ;
    var wl = planWallOn(true,  u0, v0, v1, z.y);
    var wr = planWallOn(true,  u1, v0, v1, z.y);
    var wf = planWallOn(false, v0, u0, u1, z.y);
    var wb = planWallOn(false, v1, u0, u1, z.y);
    var cw = (u1-u0) - (wl?wl.t/2:0) - (wr?wr.t/2:0);
    var cd = (v1-v0) - (wf?wf.t/2:0) - (wb?wb.t/2:0);
    return { n:z.n, y:z.y, u0:u0, u1:u1, v0:v0, v1:v1,
             w:cw, d:cd, area:cw*cd,
             lvl: z.y > (GF+FF)/2 ? "First" : "Ground" };
  }).sort(function(p,q){ return (p.y - q.y) || (p.v0 - q.v0) || (p.u0 - q.u0); });
})();

/* ---------- quantities ---------- */
var QUANT = (function(){
  var q = { extLen:0, intLen:0, extArea:0, intArea:0, openArea:0, glazedArea:0,
            doors:0, screens:0, windows:0, leaves:0 };
  PLAN.walls.forEach(function(w){
    var len = w.horiz ? Math.abs(w.u1-w.u0) : Math.abs(w.v1-w.v0);
    var oa = 0;
    w.ops.forEach(function(op){ oa += (op.b-op.a) * ((op.top!=null?op.top:2.35) - (op.sill||0)); });
    if(w.ext){ q.extLen += len; q.extArea += len*w.h - oa; }
    else     { q.intLen += len; q.intArea += len*w.h - oa; }
    q.openArea += oa;
  });
  OPENINGS.forEach(function(o){
    if(o.kind === "window"){ q.windows++;  q.glazedArea += o.w*o.h; }
    else if(o.kind === "screen"){ q.screens++; q.glazedArea += o.w*o.h; }
    else { q.doors++; q.leaves += o.leaves; }
  });
  q.gfArea  = HW * HD;
  q.ffArea  = HW * UV1;
  q.balcony = 12.35 * Math.abs(UB);
  q.porch   = 12.35 * 2.20;
  q.roof    = HW * UV1;
  return q;
})();

/* ---------- planning check ----------
   The required figures are typical Lagos State residential controls for a
   plot and building of this size. They are the one thing in this file that is
   NOT derived from the model, so they are stated as data, in one place, with
   their status: confirm them against the current Lagos State Physical
   Planning Permit Regulations and the layout scheme for the estate before
   anyone draws an approval set. What the check does prove is what the model
   actually measures, which is the part that used to be nobody's job. */
var PLANNING = (function(){
  var reqFront = 6.0, reqRear = 3.0, reqSide = 3.0, maxCover = 60;

  /* the deepest thing on each side, oversails included */
  var front = (hz(UB)  - Z0);                 /* balcony/roof wing edge */
  var rear  = (Z1 - hz(UV1));
  var west  = (hx(0) - X0);
  var east  = (X1 - hx(HW));

  /* Roofed things standing outside the house outline still count against
     site coverage. The tent is canvas and arguably should not, but it was
     already being counted and the gym pavilion is a block building with a
     concrete roof, so it certainly does. */
  var outA = 0;
  ZONES.forEach(function(z){
    if(z.n === "Games tent" || z.n === "Mini gym") outA += (z.x1-z.x0)*(z.z1-z.z0);
  });
  var tentA = outA;
  /* coverage is measured on the outline built over, so the first floor - not
     the smaller ground floor - is the number that counts, and the balcony
     counts with it because it is roofed */
  var cover = HW * (UV1 + Math.abs(UB)) + tentA;
  var plot  = PW * PD;

  function row(name, got, req, cmp){
    var ok = cmp === "min" ? got >= req - 0.005 : got <= req + 0.005;
    return { n:name, got:got, req:req, cmp:cmp, ok:ok,
             margin: cmp === "min" ? got - req : req - got };
  }
  return {
    plot: plot, cover: cover, coverPct: cover/plot*100, tentA: tentA,
    rows: [
      row("Front setback (to balcony edge)", front, reqFront, "min"),
      row("Rear setback (to cantilever edge)", rear,  reqRear,  "min"),
      row("West side setback",  west, reqSide, "min"),
      row("East side setback",  east, reqSide, "min"),
      row("Plot coverage (%)", cover/plot*100, maxCover, "max")
    ]
  };
})();

/* ============================================================
   THE DRAWINGS
   Drawn in metres. The SVG viewBox is the building in metres and every
   stroke, gap and letter is sized in metres too, so the whole sheet scales
   to whatever it is put in without a single number changing meaning.
   Screen X = u, screen Y = -v, which puts north up.
   ============================================================ */
var PLANSVG = (function(){
  /* Drawn on paper, not on the dark chrome the rest of the app uses. A plan
     is read, not looked at: solid poche on white is the convention because it
     is the highest-contrast way to show what is wall and what is not, and a
     drawing that reverses it to match a UI theme is harder to use and prints
     to a black page. */
  var C = {
    sheet  : "#eae7e0",
    floor  : "#ffffff",
    poche  : "#14181c",
    line   : "#4a545c",
    thin   : "#96a0a8",
    furn   : "#7c8891",
    glass  : "#2b7fa8",
    swing  : "#a8703a",
    txt    : "#14181c",
    dim    : "#5c666e",
    void_  : "#d8d4cc",
    warn   : "#b03a1e"
  };
  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
  function n(x){ return (Math.round(x*1000)/1000); }
  function X(u){ return n(u); }
  function Y(v){ return n(-v); }

  /* Everything on these sheets is sized in metres, which is what lets one set
     of drawing routines serve both scales. The catch is that a letter sized in
     metres shrinks when the sheet covers more ground: 240 mm lettering is
     right at 1:100 and invisible at 1:200. K is the pen weight - set once per
     drawing, multiplied into every line width and letter height, so the site
     plan reads at the same size on screen as the floor plans do. */
  var K = 1;

  function txt(s, u, v, size, col, anchor, extra){
    size = n(size*K);
    return '<text x="'+X(u)+'" y="'+Y(v)+'" font-size="'+size+'" fill="'+(col||C.txt)+'"'+
           ' text-anchor="'+(anchor||"middle")+'" font-family="ui-sans-serif,system-ui,sans-serif"'+
           (extra||"")+'>'+esc(s)+'</text>';
  }
  /* Room names sit on top of the furniture that fills the room, so they get a
     halo of the floor colour painted behind the glyphs. Without it every label
     over a table or a bed is read through the line work under it. */
  function halo(s, u, v, size, col, anchor){
    return txt(s, u, v, size, col, anchor,
               ' stroke="'+C.floor+'" stroke-width="'+n(size*0.34)+
               '" stroke-linejoin="round" paint-order="stroke"');
  }
  function rect(u0,v0,u1,v1,fill,stroke,sw,extra){
    return '<rect x="'+X(Math.min(u0,u1))+'" y="'+Y(Math.max(v0,v1))+
           '" width="'+n(Math.abs(u1-u0))+'" height="'+n(Math.abs(v1-v0))+
           '" fill="'+(fill||"none")+'"'+
           (stroke?' stroke="'+stroke+'" stroke-width="'+n((sw||0.02)*K)+'"':"")+
           (extra||"")+'/>';
  }
  function line(u0,v0,u1,v1,col,sw,extra){
    return '<line x1="'+X(u0)+'" y1="'+Y(v0)+'" x2="'+X(u1)+'" y2="'+Y(v1)+
           '" stroke="'+col+'" stroke-width="'+n(sw*K)+'"'+(extra||"")+'/>';
  }

  /* ---- a wall drawn as the solid lengths left between its openings ----
     Exactly the subtraction the 3D wall builder does, which is why the plan
     and the model can never disagree about where a hole is. */
  function wallPath(w){
    var A = w.horiz ? Math.min(w.u0,w.u1) : Math.min(w.v0,w.v1);
    var B = w.horiz ? Math.max(w.u0,w.u1) : Math.max(w.v0,w.v1);
    var cross = w.horiz ? w.v0 : w.u0, t = w.t/2;
    var ops = w.ops.slice().sort(function(p,q){ return p.a - q.a; });
    var out = "", cur = A;
    ops.forEach(function(op){
      var a = Math.max(A, op.a), b = Math.min(B, op.b);
      if(b <= a) return;
      if(a > cur + 0.002) out += seg(cur, a);
      cur = b;
    });
    if(cur < B - 0.002) out += seg(cur, B);
    return out;
    function seg(p, q){
      return w.horiz ? rect(p, cross-t, q, cross+t, C.poche)
                     : rect(cross-t, p, cross+t, q, C.poche);
    }
  }

  /* ---- opening symbols ---- */
  function openingSym(o){
    var s = "", cross = o.horiz ? o.v : o.u, t = o.t/2;
    if(o.kind === "window"){
      /* the pane, and the two reveal lines that close the hole */
      if(o.horiz){
        s += rect(o.a, cross-t, o.b, cross+t, C.void_);
        s += line(o.a, cross, o.b, cross, C.glass, 0.045);
        s += line(o.a, cross-t, o.a, cross+t, C.thin, 0.02);
        s += line(o.b, cross-t, o.b, cross+t, C.thin, 0.02);
      } else {
        s += rect(cross-t, o.a, cross+t, o.b, C.void_);
        s += line(cross, o.a, cross, o.b, C.glass, 0.045);
        s += line(cross-t, o.a, cross+t, o.a, C.thin, 0.02);
        s += line(cross-t, o.b, cross+t, o.b, C.thin, 0.02);
      }
      return s;
    }
    if(o.kind === "screen"){
      /* sliding: two panels overlapping, offset to the two faces */
      var m = (o.a + o.b)/2;
      if(o.horiz){
        s += line(o.a, cross-t*0.45, m+0.12, cross-t*0.45, C.glass, 0.05);
        s += line(m-0.12, cross+t*0.45, o.b, cross+t*0.45, C.glass, 0.05);
      } else {
        s += line(cross-t*0.45, o.a, cross-t*0.45, m+0.12, C.glass, 0.05);
        s += line(cross+t*0.45, m-0.12, cross+t*0.45, o.b, C.glass, 0.05);
      }
      return s;
    }
    /* a door: threshold, then a leaf and an arc per leaf */
    if(o.w > 2.0){
      /* cased opening - no leaf, so say so */
      return s;
    }
    for(var i = 0; i < o.leaves; i++){
      var atA = o.leaves === 1 ? o.hingeAtA : (i === 0);
      var hu = o.horiz ? (atA ? o.a : o.b) : o.u;
      var hv = o.horiz ? o.v : (atA ? o.a : o.b);
      var du = o.horiz ? (atA ? 1 : -1) : 0;
      var dv = o.horiz ? 0 : (atA ? 1 : -1);
      var sgn = (o.n[0]*(-dv) + o.n[1]*du) > 0 ? 1 : -1;
      var nu = -dv*sgn, nv = du*sgn;
      var L  = o.leafW;
      var cu = hu + du*L, cv = hv + dv*L;      /* closed */
      var ou = hu + nu*L, ov = hv + nv*L;      /* open   */
      /* sweep flag in screen space, where y runs down */
      var cross2 = (X(cu)-X(hu))*(Y(ov)-Y(hv)) - (Y(cv)-Y(hv))*(X(ou)-X(hu));
      s += '<path d="M '+X(cu)+' '+Y(cv)+' A '+n(L)+' '+n(L)+' 0 0 '+(cross2>0?1:0)+' '+
           X(ou)+' '+Y(ov)+'" fill="none" stroke="'+C.swing+'" stroke-width="0.018"'+
           ' stroke-dasharray="0.10 0.07"/>';
      s += line(hu, hv, ou, ov, C.swing, 0.05);
    }
    return s;
  }

  /* ---- furniture, drawn as plan symbols ---- */
  function furnSym(f){
    var u0 = f.u - f.w/2, u1 = f.u + f.w/2, v0 = f.v - f.d/2, v1 = f.v + f.d/2;
    var s = "";
    if(f.k === "wc" || f.k === "basin"){
      s += '<ellipse cx="'+X(f.u)+'" cy="'+Y(f.v)+'" rx="'+n(f.w/2)+'" ry="'+n(f.d/2)+
           '" fill="none" stroke="'+C.furn+'" stroke-width="0.022"/>';
      return s;
    }
    if(f.k === "table" && Math.abs(f.w - f.d) < 0.02){
      s += '<circle cx="'+X(f.u)+'" cy="'+Y(f.v)+'" r="'+n(f.w/2)+
           '" fill="none" stroke="'+C.furn+'" stroke-width="0.022"/>';
      return s;
    }
    s += rect(u0, v0, u1, v1, "none", C.furn, 0.022);
    if(f.k === "bed"){
      /* the pillow line, which is what makes a rectangle read as a bed */
      s += line(u0+0.06, v1-0.42, u1-0.06, v1-0.42, C.furn, 0.018);
    }
    if(f.k === "shower"){
      s += line(u0, v0, u1, v1, C.furn, 0.018);
      s += line(u0, v1, u1, v0, C.furn, 0.018);
    }
    if(f.k === "bath"){
      s += rect(u0+0.08, v0+0.08, u1-0.08, v1-0.08, "none", C.furn, 0.016);
    }
    return s;
  }

  /* ---- dimension string ----
     `vals` are positions along the axis; the string is drawn `at` on the
     other axis with ticks and a figure in each bay. */
  function dimString(vals, at, isU, size, side){
    var s = "", i;
    var ext = side*0.16*K;
    for(i = 0; i < vals.length; i++){
      var p = vals[i];
      if(isU){
        s += line(p, at - ext, p, at + ext, C.dim, 0.014);
      } else {
        s += line(at - ext, p, at + ext, p, C.dim, 0.014);
      }
    }
    if(isU) s += line(vals[0], at, vals[vals.length-1], at, C.dim, 0.014);
    else    s += line(at, vals[0], at, vals[vals.length-1], C.dim, 0.014);
    for(i = 0; i < vals.length - 1; i++){
      var a = vals[i], b = vals[i+1], m = (a+b)/2, len = b - a;
      if(len < 0.30) continue;
      var lbl = (Math.round(len*1000)) + "";
      if(isU){
        s += txt(lbl, m, at + side*0.10*K, size, C.dim, "middle");
      } else {
        s += '<g transform="rotate(-90 '+X(at + side*0.10*K)+' '+Y(m)+')">'+
             txt(lbl, at + side*0.10*K, m, size, C.dim, "middle")+'</g>';
      }
    }
    return s;
  }

  function axisVals(level, isU){
    var set = [];
    PLAN.walls.forEach(function(w){
      if(Math.abs(w.y - level) > 0.05) return;
      if(isU && !w.horiz) set.push(w.u0);
      if(!isU && w.horiz) set.push(w.v0);
    });
    set.sort(function(a,b){ return a-b; });
    /* Walls 100 mm apart get one dimension between them, not two. The point of
       a dimension chain is that it adds up to the overall, so a bay too small
       to letter cannot simply be dropped - that breaks the chain, which on a
       real drawing is a fault and not a cosmetic problem. */
    var out = [];
    set.forEach(function(v){
      if(!out.length || v - out[out.length-1] > 0.17) out.push(v);
      else out[out.length-1] = (out[out.length-1] + v)/2;
    });
    return out;
  }

  /* ---- north arrow, scale bar, title block ---- */
  function northArrow(u, v, r){
    return '<g><circle cx="'+X(u)+'" cy="'+Y(v)+'" r="'+n(r)+'" fill="none" stroke="'+C.line+
           '" stroke-width="'+n(0.02*K)+'"/>'+
           '<path d="M '+X(u)+' '+Y(v+r*0.82)+' L '+X(u-r*0.34)+' '+Y(v-r*0.55)+' L '+X(u)+' '+
           Y(v-r*0.18)+' Z" fill="'+C.txt+'"/>'+
           '<path d="M '+X(u)+' '+Y(v+r*0.82)+' L '+X(u+r*0.34)+' '+Y(v-r*0.55)+' L '+X(u)+' '+
           Y(v-r*0.18)+' Z" fill="none" stroke="'+C.line+'" stroke-width="'+n(0.02*K)+'"/>'+
           txt("N", u, v + r*1.05 + 0.30, 0.34, C.txt)+'</g>';
  }
  function scaleBar(u, v, metres){
    var s = line(u, v, u+metres, v, C.line, 0.03), i;
    for(i = 0; i <= metres; i++){
      s += line(u+i, v-0.09*K, u+i, v+0.09*K, C.line, 0.022);
      if(i % (metres >= 10 ? 5 : 1) === 0) s += txt(i+"", u+i, v-0.36*K, 0.24, C.dim);
    }
    s += txt("metres", u + metres/2, v + 0.34*K, 0.24, C.dim);
    return s;
  }
  function titleBlock(u, v, w, title, sub){
    var s = rect(u, v, u+w, v+1.55*K, "#ffffff", C.line, 0.02);
    s += txt("JIJOHO RESIDENCE", u+0.22*K, v+1.14*K, 0.30, C.dim, "start");
    s += txt(title, u+0.22*K, v+0.72*K, 0.40, C.txt, "start", ' font-weight="650"');
    s += txt(sub, u+0.22*K, v+0.30*K, 0.24, C.dim, "start");
    s += txt("Generated from the 3D model", u+w-0.22*K, v+1.14*K, 0.22, C.dim, "end");
    s += txt("Not for construction", u+w-0.22*K, v+0.78*K, 0.22, C.warn, "end");
    s += txt(new Date().toISOString().slice(0,10), u+w-0.22*K, v+0.42*K, 0.22, C.dim, "end");
    return s;
  }

  /* ---------- a floor plan ---------- */
  function floorPlan(level){
    K = 1;
    var isFF = level > (GF+FF)/2;
    var body = "";

    /* floor plate, so the rooms read as inside */
    if(isFF){
      body += rect(0, UB, HW, UV1, C.floor);
      body += rect(0.6, UB, 12.95, 0, "#f4f1ea");
    } else {
      body += rect(0, 0, HW, HD, C.floor);
      body += rect(0.6, -2.20, 12.95, 0, "#f4f1ea");
    }

    /* the stairwell, drawn on both floors because it is on both floors */
    if(isFF){
      body += rect(SW0, SV0, SW1, 7.36, C.void_);
      body += txt("VOID", (SW0+SW1)/2, 5.4, 0.22, C.dim);
    }

    /* walls */
    PLAN.walls.forEach(function(w){
      if(Math.abs(w.y - level) > 0.05) return;
      body += wallPath(w);
    });

    /* openings */
    OPENINGS.forEach(function(o){
      if(Math.abs(o.y - level) > 0.05) return;
      body += openingSym(o);
    });

    /* stair, from the same numbers that build it */
    if(!isFF){
      var i;
      for(i = 1; i <= STEPS; i++){
        body += line(SW0, SV0 + TREAD*i, SW1, SV0 + TREAD*i, C.thin, 0.016);
      }
      body += line(SW1-0.05, SV0, SW1-0.05, SV0+TREAD*STEPS, C.line, 0.03);
      body += line((SW0+SW1)/2, SV0+0.35, (SW0+SW1)/2, SV0+TREAD*STEPS-0.35, C.txt, 0.025);
      body += '<path d="M '+X((SW0+SW1)/2)+' '+Y(SV0+TREAD*STEPS-0.20)+' l -0.12 -0.28 l 0.24 0 Z" fill="'+C.txt+'"/>';
      body += txt("UP  " + RISERS + "R @ " + Math.round(RISE*1000) + " / " +
                  Math.round(TREAD*1000), (SW0+SW1)/2, SV0 - 0.34, 0.20, C.dim);
    }

    /* furniture */
    PLAN.furn.forEach(function(f){
      if(Math.abs(f.y - level) > 0.05) return;
      body += furnSym(f);
    });

    /* room names and clear areas */
    ROOMS.forEach(function(r){
      if(Math.abs(r.y - level) > 0.05) return;
      var cu = (r.u0+r.u1)/2, cv = (r.v0+r.v1)/2;
      /* the name has to fit the room it names, so the type size comes off the
         room's own width - a 2.8 m2 cloakroom cannot carry the same lettering
         as a 33 m2 living room, and setting it in one size everywhere is what
         makes a plan look automated */
      var fs = Math.max(0.13, Math.min(0.26, (r.w - 0.20) * 1.75 / Math.max(8, r.n.length)));
      body += halo(r.n, cu, cv + fs*0.45, fs, C.txt);
      body += halo(r.area.toFixed(1) + " m²", cu, cv - fs*0.85, fs*0.82, C.dim);
      if(r.area > 6.5)
        body += halo(r.w.toFixed(2) + " × " + r.d.toFixed(2), cu, cv - fs*2.1, fs*0.70, C.thin);
    });

    /* opening marks */
    OPENINGS.forEach(function(o){
      if(Math.abs(o.y - level) > 0.05) return;
      var mu = o.u + (o.horiz ? 0 : (o.ext ? (o.u < HW/2 ? -0.40 : 0.40) : 0.30));
      var mv = o.v + (o.horiz ? (o.ext ? (o.v < 5 ? -0.40 : 0.40) : 0.30) : 0);
      body += txt(o.mark, mu, mv - 0.06, 0.17, C.dim);
    });

    /* dimension strings: the wall grid on each axis, then the overall */
    var vTop = isFF ? UV1 : HD, vBot = isFF ? UB : -2.20;
    var us = axisVals(level, true), vs = axisVals(level, false);
    if(us.indexOf(0) < 0) us.unshift(0);
    body += dimString(us, vBot - 0.85, true, 0.20, -1);
    body += dimString([0, HW], vBot - 1.75, true, 0.24, -1);
    body += dimString(vs, -0.95, false, 0.20, -1);
    body += dimString([Math.min.apply(null,vs), Math.max.apply(null,vs)], -1.85, false, 0.24, -1);

    /* level note */
    body += txt("FFL +" + level.toFixed(2) + " m   ·   clear height " + CH.toFixed(2) + " m",
                HW, vTop + 0.55, 0.24, C.dim, "end");

    var minU = -3.4, maxU = HW + 1.2, minV = vBot - 4.6, maxV = vTop + 1.9;
    body += northArrow(maxU - 1.0, maxV - 1.2, 0.55);
    body += scaleBar(0, minV + 0.95, 5);
    body += titleBlock(minU + 0.2, minV + 0.1, maxU - minU - 0.4,
                       isFF ? "First floor plan" : "Ground floor plan",
                       "1:100 at A3  ·  dimensions in millimetres to wall centrelines");
    return svgWrap(minU, minV, maxU, maxV, body);
  }

  /* ---------- site plan ---------- */
  function sitePlan(){
    /* drawn in the same u/v frame, so the house sits where it sits */
    /* twice the pen weight of the floor plans, because this sheet covers
       two and a half times as much ground in the same width */
    K = 2.0;
    var pu0 = X0 - HX, pu1 = X1 - HX, pv0 = Z0 - HZ, pv1 = Z1 - HZ;
    var body = "";
    body += rect(pu0, pv0, pu1, pv1, "#f2f6f3", C.line, 0.06);

    /* the setback envelope */
    body += rect(pu0 + 3.0, pv0 + 6.0, pu1 - 3.0, pv1 - 3.0, "none", C.warn, 0.05,
                 ' stroke-dasharray="0.5 0.3"');
    body += txt("required building line  ·  6.0 front, 3.0 rear and sides",
                (pu0+pu1)/2, pv0 + 6.0 + 0.34, 0.21, C.warn);

    /* the outdoor rooms, from the same zone list the location readout uses */
    ZONES.forEach(function(z){
      if(Math.abs(z.y) > 0.15) return;
      var u0 = z.x0 - HX, u1 = z.x1 - HX, v0 = z.z0 - HZ, v1 = z.z1 - HZ;
      if((u1-u0) < 1.5 || (v1-v0) < 1.5) return;
      body += rect(u0, v0, u1, v1, "none", C.thin, 0.03, ' stroke-dasharray="0.28 0.22"');
      body += txt(z.n, (u0+u1)/2, (v0+v1)/2, 0.23, C.dim);
    });

    /* the building: ground floor solid, the oversailing first floor dashed */
    body += rect(0, 0, HW, HD, "#c9c4bb", C.poche, 0.10);
    body += rect(0, UB, HW, UV1, "none", C.txt, 0.05, ' stroke-dasharray="0.6 0.35"');
    body += txt("DUPLEX", HW/2, HD/2 + 0.5, 0.40, C.txt);
    body += txt("ground floor 155.8 m²  ·  first floor over", HW/2, HD/2 - 0.5, 0.21, C.dim);

    /* setback dimensions, measured not asserted */
    function sbDim(u0,v0,u1,v1,lbl,ok){
      var col = ok ? C.glass : C.warn;
      var s = line(u0,v0,u1,v1,col,0.05);
      s += txt(lbl, (u0+u1)/2 + (Math.abs(u1-u0) < 0.01 ? 0.95 : 0),
               (v0+v1)/2 + (Math.abs(v1-v0) < 0.01 ? 0.42 : 0), 0.26, col);
      return s;
    }
    var R = {}; PLANNING.rows.forEach(function(r){ R[r.n] = r; });
    body += sbDim(HW/2, pv0, HW/2, UB, R["Front setback (to balcony edge)"].got.toFixed(2)+" m",
                  R["Front setback (to balcony edge)"].ok);
    body += sbDim(HW/2, UV1, HW/2, pv1, R["Rear setback (to cantilever edge)"].got.toFixed(2)+" m",
                  R["Rear setback (to cantilever edge)"].ok);
    body += sbDim(pu0, HD/2, 0, HD/2, R["West side setback"].got.toFixed(2)+" m",
                  R["West side setback"].ok);
    body += sbDim(HW, HD/2, pu1, HD/2, R["East side setback"].got.toFixed(2)+" m",
                  R["East side setback"].ok);

    /* plot dimensions */
    body += dimString([pu0, pu1], pv0 - 1.5, true, 0.26, -1);
    body += dimString([pv0, pv1], pu0 - 1.5, false, 0.26, -1);
    body += txt("ROAD", (pu0+pu1)/2, pv0 - 3.0, 0.30, C.dim);
    body += line(pu0 - 1.0, pv0 - 3.9, pu1 + 1.0, pv0 - 3.9, C.thin, 0.08);

    var minU = pu0 - 5.0, maxU = pu1 + 2.2, minV = pv0 - 10.0, maxV = pv1 + 3.4;
    body += northArrow(maxU - 1.6, maxV - 2.2, 0.85);
    body += scaleBar(pu0, minV + 4.6, 10);
    body += titleBlock(minU + 0.3, minV + 0.3, maxU - minU - 0.6, "Site plan",
                       "1:200 at A3  ·  plot 19.55 × 33.52 m = 655.1 m²  ·  "+
                       "coverage " + PLANNING.coverPct.toFixed(1) + " %");
    return svgWrap(minU, minV, maxU, maxV, body);
  }

  function svgWrap(minU, minV, maxU, maxV, body){
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+
           n(minU)+' '+n(-maxV)+' '+n(maxU-minU)+' '+n(maxV-minV)+
           '" width="100%" style="max-height:calc(100vh - 190px)">'+
           '<rect x="'+n(minU)+'" y="'+n(-maxV)+'" width="'+n(maxU-minU)+'" height="'+
           n(maxV-minV)+'" fill="'+C.sheet+'"/>'+ body +'</svg>';
  }

  return { ground: function(){ return floorPlan(GF); },
           first : function(){ return floorPlan(FF); },
           site  : sitePlan };
})();

/* ============================================================
   THE PANEL
   ============================================================ */
(function(){
  var el = document.getElementById("planPanel");
  if(!el) return;
  var view = document.getElementById("planView");
  var tabs = el.querySelectorAll("[data-plan]");
  var cur  = "ground";

  function tbl(head, rows){
    var s = '<table><tr>' + head.map(function(h){ return '<th>'+h+'</th>'; }).join("") + '</tr>';
    rows.forEach(function(r){
      s += '<tr>' + r.map(function(c,i){
        return '<td'+(i?' class="n"':'')+'>'+c+'</td>';
      }).join("") + '</tr>';
    });
    return s + '</table>';
  }

  function schedules(){
    var s = '<div class="doc" style="padding:4px 2px 30px">';

    s += '<h2>Planning check</h2>';
    s += '<p>Measured off the model. The required figures are typical Lagos State '+
         'residential controls and are the only numbers on this page not taken from the '+
         'building itself &mdash; confirm them against the current permit regulations and the '+
         'estate layout scheme before anyone draws an approval set.</p>';
    s += tbl(["Control","Required","Model","Margin","" ],
      PLANNING.rows.map(function(r){
        return [ r.n,
                 (r.cmp==="min"?"≥ ":"≤ ") + r.req.toFixed(2),
                 r.got.toFixed(2),
                 (r.margin >= 0 ? "+" : "") + r.margin.toFixed(2),
                 r.ok ? '<span style="color:#5fc2a4">pass</span>'
                      : '<span style="color:#e0673c">FAIL</span>' ];
      }));
    var tight = PLANNING.rows.filter(function(r){ return r.ok && r.margin < 0.20; });
    if(tight.length){
      s += '<div class="note"><b>Zero margin on '+tight.length+' control'+(tight.length>1?'s':'')+'.</b> '+
           tight.map(function(r){ return r.n.toLowerCase(); }).join(", ")+
           ' sit'+(tight.length>1?'':'s')+' exactly on the limit rather than inside it. '+
           'That passes, but it leaves nothing for a survey that comes back a few centimetres '+
           'different from the assumed boundary, and on this plot the sides are fixed by the '+
           'walls either way. Worth confirming the beacons before the foundation is set out.</div>';
    }

    s += '<h2>Door swing check</h2>';
    if(!SWINGCLASH.length){
      s += '<p>No leaf fouls a fixed piece of furniture or sanitaryware. '+
           'Every door swings through its full quarter turn.</p>';
    } else {
      s += '<p>Leaves that cannot open fully. Each is a real clash on the plan, not a '+
           'rendering artefact.</p>';
      s += tbl(["Door","Room","Fouls"], SWINGCLASH.map(function(c){
        return [c.mark, c.room, c.hits.join(", ")];
      }));
    }

    s += '<h2>Doorway clearance</h2>';
    if(!DOORBLOCK.length){
      s += '<p>Every door and glazed screen in the house has at least 600&nbsp;mm of '+
           'clear width with the furniture where it stands. Measured by sweeping the same '+
           '280&nbsp;mm body the walkthrough uses through each opening and 450&nbsp;mm '+
           'either side of it &mdash; which is a different question from the swing check '+
           'above, and the one that actually stops you: a door with nothing in its arc can '+
           'still have a washing machine standing half a metre inside it.</p>';
    } else {
      s += '<p>Openings a person cannot get through. This is furniture standing in a '+
           'doorway, not a fault in the plan &mdash; move the piece.</p>';
      s += tbl(["Opening","Between","Width","Clear"], DOORBLOCK.map(function(c){
        return [c.mark, c.a + " / " + c.b, c.w.toFixed(2), c.clear.toFixed(2)];
      }));
    }

    s += '<h2>Room schedule</h2>';
    s += '<p>Clear areas, wall thicknesses deducted &mdash; not the grid rectangle.</p>';
    /* A room that is not a rectangle is more than one zone - the family room
       wraps the stairwell and is two. Listing it twice would be arithmetic for
       the reader to do, so the parts are added up here and the size column
       says what shape it actually is. */
    var seen = {}, rows = [];
    ROOMS.forEach(function(r){
      var k = r.lvl + "|" + r.n;
      if(seen[k]){ seen[k].area += r.area; seen[k].parts++; return; }
      seen[k] = { n:r.n, lvl:r.lvl, w:r.w, d:r.d, area:r.area, parts:1 };
      rows.push(seen[k]);
    });
    s += tbl(["Room","Level","Clear size (m)","Area (m²)"], rows.map(function(r){
      return [r.n, r.lvl,
              r.parts > 1 ? "L-shaped, " + r.parts + " parts"
                          : r.w.toFixed(2)+" × "+r.d.toFixed(2),
              r.area.toFixed(1)];
    }));

    s += '<h2>Door schedule</h2>';
    s += tbl(["Mark","Size (mm)","Type","Leaves","Opens into"],
      OPENINGS.filter(function(o){ return o.kind !== "window"; }).map(function(o){
        var type = o.kind === "screen" ? "Glazed sliding screen"
                 : (o.w > 2.0 ? "Cased opening, no leaf"
                 : (o.leaves > 1 ? "Solid, double leaf" : "Solid, single leaf"));
        return [o.mark, Math.round(o.w*1000)+" × "+Math.round(o.h*1000), type,
                o.leaves || "–", o.into ? o.into.n : "–"];
      }));

    s += '<h2>Window schedule</h2>';
    s += tbl(["Mark","Size (mm)","Sill (mm)","Elevation","Area (m²)"],
      OPENINGS.filter(function(o){ return o.kind === "window"; }).map(function(o){
        var face = o.horiz ? (o.v < 5 ? "South" : "North") : (o.u < HW/2 ? "West" : "East");
        return [o.mark, Math.round(o.w*1000)+" × "+Math.round(o.h*1000),
                Math.round(o.sill*1000), face, (o.w*o.h).toFixed(2)];
      }));

    s += '<h2>Quantities</h2>';
    s += '<p>Taken off the model, so they move when it does. Wall areas are net of '+
         'openings and measured on the centreline, which is how a bill of quantities '+
         'measures blockwork.</p>';
    s += '<div class="kv">'+
      kv("External wall, net", QUANT.extArea.toFixed(1)+" m²") +
      kv("Internal partitions, net", QUANT.intArea.toFixed(1)+" m²") +
      kv("External wall run", QUANT.extLen.toFixed(1)+" m") +
      kv("Partition run", QUANT.intLen.toFixed(1)+" m") +
      kv("Openings, total", QUANT.openArea.toFixed(1)+" m²") +
      kv("Glazed area", QUANT.glazedArea.toFixed(1)+" m²") +
      kv("Doors", QUANT.doors + " (" + QUANT.leaves + " leaves)") +
      kv("Glazed screens", QUANT.screens) +
      kv("Windows", QUANT.windows) +
      kv("Ground floor slab", QUANT.gfArea.toFixed(1)+" m²") +
      kv("First floor slab", QUANT.ffArea.toFixed(1)+" m²") +
      kv("Roof slab", QUANT.roof.toFixed(1)+" m²") +
      kv("Balcony", QUANT.balcony.toFixed(1)+" m²") +
      kv("Porch", QUANT.porch.toFixed(1)+" m²") +
      '</div>';

    var glazedRatio = QUANT.glazedArea / (QUANT.gfArea + QUANT.ffArea) * 100;
    s += '<div class="note"><b>Daylight and ventilation.</b> Glazed area is '+
         glazedRatio.toFixed(1)+' % of the enclosed floor area. Most residential codes ask '+
         'for a window area of at least 10 % of the floor of each habitable room for light '+
         'and 5 % openable for ventilation, measured room by room rather than in total. '+
         'This figure says the building as a whole is comfortably glazed; it does not '+
         'certify any individual room, and the internal ones with no external wall '+
         '&mdash; the closets, the stores, the powder room &mdash; will need mechanical '+
         'ventilation.</div>';

    s += '<div class="note"><b>What these drawings are not.</b> There is no structure and '+
         'no services here: no foundations, no column or beam sizes, no reinforcement, no '+
         'electrical or plumbing layout. The 2.20 m roof cantilever over the balcony in '+
         'particular is a real piece of engineering and its depth is a calculation, not a '+
         'drawing decision. This is a design record accurate enough to brief a registered '+
         'architect and a structural engineer with. It is not an approval set and nobody '+
         'should build from it.</div>';

    return s + '</div>';
    function kv(a,b){ return '<div>'+a+'</div><div>'+b+'</div>'; }
  }

  function draw(){
    if(cur === "schedules") view.innerHTML = schedules();
    else if(cur === "site")  view.innerHTML = PLANSVG.site();
    else if(cur === "first") view.innerHTML = PLANSVG.first();
    else                     view.innerHTML = PLANSVG.ground();
    for(var i = 0; i < tabs.length; i++){
      tabs[i].classList.toggle("on", tabs[i].getAttribute("data-plan") === cur);
    }
  }

  for(var i = 0; i < tabs.length; i++){
    (function(b){
      b.onclick = function(){ cur = b.getAttribute("data-plan"); draw(); };
    })(tabs[i]);
  }

  document.getElementById("planDl").onclick = function(){
    if(cur === "schedules") return;
    var svg = view.innerHTML;
    var blob = new Blob([svg], {type:"image/svg+xml"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "jijoho-" + cur + "-plan.svg";
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
  };

  window.openPlans  = function(){ el.classList.add("open"); draw();
                                  if(typeof locked !== "undefined" && locked) document.exitPointerLock(); };
  window.closePlans = function(){ el.classList.remove("open"); };
  document.getElementById("btnPlans").onclick = window.openPlans;
  document.getElementById("planClose").onclick = window.closePlans;
})();
