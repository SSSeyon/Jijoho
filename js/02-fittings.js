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

/* ---- bed: w x d footprint, headboard at local -Z ---- */
function bed(cx,cz,y,w,d,rq,g,linenMat){
  /* Low platform base, inset so the mattress oversails it on all four sides,
     and a slim upholstered headboard hung clear of the floor. Both in the same
     family as the walls - the reference has no dark timber anywhere. */
  var D  = dims(rq,w,d);
  var Di = dims(rq,w-0.20,d-0.20);
  fsolid(Di[0], 0.20, Di[1], cx, y+0.10, cz, MAT.joinery, g);
  /* mattress + duvet: top at 0.50, not the 0.60 it used to be */
  fbox(D[0], 0.24, D[1], cx, y+0.32, cz, linenMat||MAT.linen, g);
  /* the turned-back top sheet, which is the one detail that stops a bed
     reading as a foam block with a cloth over it */
  var sp = place(rq,cx,cz,0,-d*0.5+0.62);
  var sd = dims(rq, w-0.02, 0.30);
  fbox(sd[0],0.035,sd[1], sp[0], y+0.455, sp[1], MAT.white, g);
  /* headboard: 0.85 m tall, hung with a shadow gap under it */
  var hp = place(rq,cx,cz,0,-d/2-0.05);
  var hd = dims(rq, w+0.10, 0.09);
  fsolid(hd[0], 0.85, hd[1], hp[0], y+0.72, hp[1], MAT.fabric, g);
  // pillows
  var p1 = place(rq,cx,cz,-w*0.23,-d/2+0.34);
  var p2 = place(rq,cx,cz, w*0.23,-d/2+0.34);
  var pd = dims(rq, w*0.40, 0.30);
  fbox(pd[0],0.13,pd[1], p1[0], y+0.505, p1[1], MAT.white, g);
  if(w>1.3) fbox(pd[0],0.13,pd[1], p2[0], y+0.505, p2[1], MAT.white, g);
  // throw at foot
  var tp = place(rq,cx,cz,0,d*0.31);
  var td = dims(rq, w-0.06, d*0.26);
  fbox(td[0],0.05,td[1], tp[0], y+0.465, tp[1], MAT.fabric2, g);
  /* Side tables. 0.42 x 0.36 set 0.20 clear of the mattress, where they used
     to be 0.50 x 0.42 set 0.32 clear: the pair used to add 1.64 m to the bed's
     overall width and now add 1.24. Against a 3.2 m wall that is the
     difference between a bed with tables and a wall of furniture. */
  var sd2 = dims(rq,0.42,0.36);
  var s1 = place(rq,cx,cz,-w/2-0.41,-d/2+0.26);
  onPlinth(sd2[0],0.42,sd2[1], s1[0], y, s1[1], MAT.joinery, g, 0.045, 0.06);
  addCyl(0.09,0.115,0.22, s1[0], y+0.53, s1[1], MAT.lamp, g, 10, {furn:true});
  if(w>1.3){
    var s2 = place(rq,cx,cz, w/2+0.41,-d/2+0.26);
    onPlinth(sd2[0],0.42,sd2[1], s2[0], y, s2[1], MAT.joinery, g, 0.045, 0.06);
    addCyl(0.09,0.115,0.22, s2[0], y+0.53, s2[1], MAT.lamp, g, 10, {furn:true});
  }
  planFurn("bed", cx, cz, w, d + 0.14, rq, y);
}

/* ---- sofa: back at local -Z ----
   Modelled on the loft reference: a low modular seat that sits almost on the
   floor with no visible legs, a thin flat back cushion rather than a bolstered
   roll, and arms that stop level with the back. */
function sofa(cx,cz,y,w,rq,g,mat){
  mat = mat||MAT.fabric;
  var d = 0.84;
  /* plinth: the whole footprint, 60 mm off the floor, so the seat appears to
     float the way an upholstered platform does */
  var D = dims(rq,w,d);
  fsolid(D[0],0.29,D[1], cx, y+0.205, cz, mat, g);
  /* seat cushions, split into modules - a modular sofa's tell is the gaps */
  var n = Math.max(1, Math.round(w/0.85));
  var i, f, cp, cd;
  for(i=0;i<n;i++){
    f = -w/2 + w*(i+0.5)/n;
    cp = place(rq,cx,cz,f,0.07);
    cd = dims(rq, w/n-0.05, d-0.30);
    fbox(cd[0],0.15,cd[1], cp[0], y+0.425, cp[1], mat, g);
  }
  /* back: thin, flat, stopping at 0.60 - low enough to see over */
  var bp = place(rq,cx,cz,0,-d/2+0.10);
  var bd = dims(rq,w,0.19);
  fsolid(bd[0],0.30,bd[1], bp[0], y+0.455, bp[1], mat, g);
  for(i=0;i<n;i++){
    f = -w/2 + w*(i+0.5)/n;
    cp = place(rq,cx,cz,f,-d/2+0.11);
    cd = dims(rq, w/n-0.05, 0.16);
    fbox(cd[0],0.29,cd[1], cp[0], y+0.60, cp[1], mat, g);
  }
  /* arms only on a sofa wide enough to have them; a 0.92 m armchair keeps them */
  var ad = dims(rq,0.14,d);
  var a1 = place(rq,cx,cz,-w/2+0.07,0), a2 = place(rq,cx,cz, w/2-0.07,0);
  fsolid(ad[0],0.50,ad[1], a1[0], y+0.25, a1[1], mat, g);
  fsolid(ad[0],0.50,ad[1], a2[0], y+0.25, a2[1], mat, g);
  /* One accent cushion, muted, and only on a full sofa. Putting one on every
     armchair as well meant four of them in a room the reference furnishes with
     two, and repetition is what kills a restrained palette. */
  if(w > 1.4){
    var kp = place(rq,cx,cz,-w/2+0.42,-0.06);
    addSphere(0.17, kp[0], y+0.61, kp[1], MAT.cushion, g, {furn:true});
  }
  addCollider(cx-(rq===1||rq===3?d:w)/2, cx+(rq===1||rq===3?d:w)/2,
              cz-(rq===1||rq===3?w:d)/2, cz+(rq===1||rq===3?w:d)/2, y, y+0.60);
  planFurn(w>1.4?"sofa":"chair", cx, cz, w, d, rq, y);
}
function armchair(cx,cz,y,rq,g,mat){ sofa(cx,cz,y,0.92,rq,g,mat||MAT.fabric2); }

/* ---- round coffee table: pale top on a chunky speckled-stone base ----
   The reference table is a disc of pale ash on three fat terrazzo blocks, and
   it is very low - 0.32 m, not the 0.44 m the old box-on-four-black-legs was.
   w is taken as the diameter; d is ignored and kept only so existing calls
   still work. */
function coffeeTable(cx,cz,y,w,d,g){
  var r = w/2;
  addCyl(r, r, 0.06, cx, y+0.325, cz, MAT.woodPale, g, 28, {furn:true});
  for(var i=0;i<3;i++){
    var a = i*2.0944 + 0.5;
    fbox(0.15,0.29,0.15, cx+Math.cos(a)*r*0.55, y+0.145, cz+Math.sin(a)*r*0.55, MAT.terrazzo, g);
  }
  /* a shallow bowl with two stones in it, which is the whole of the styling */
  addCyl(0.15,0.11,0.06, cx, y+0.385, cz, MAT.woodDark, g, 16, {furn:true});
  addSphere(0.05, cx-0.03, y+0.415, cz+0.02, MAT.stone, g, {furn:true});
  addCollider(cx-r, cx+r, cz-r, cz+r, y, y+0.36);
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
  chair(cx,cz+0.58,y,rq,g);
  planFurn("desk", cx, cz, w, 0.58, rq, y);
}
/* ---- cantilever chair ----
   The reference chairs are the classic tubular sled: a single bent steel tube
   running under the seat and up the back, no back legs at all. Modelled as the
   two side frames plus the seat and back pads. 0.42 m square seat, 0.45 high. */
function chair(cx,cz,y,rq,g){
  var s;
  for(s=-1;s<=1;s+=2){
    var side = place(rq,cx,cz,s*0.20,0);
    /* the runner on the floor and the one under the seat */
    var rd = dims(rq,0.032,0.44);
    fbox(rd[0],0.032,rd[1], side[0], y+0.02, side[1], MAT.steel, g);
    fbox(rd[0],0.032,rd[1], side[0], y+0.42, side[1], MAT.steel, g);
    /* the front bend that carries the load, and the back upright */
    var fp = place(rq,cx,cz,s*0.20,0.20), bp2 = place(rq,cx,cz,s*0.20,-0.20);
    addCyl(0.017,0.017,0.42, fp[0], y+0.22, fp[1], MAT.steel, g, 8, {furn:true});
    addCyl(0.017,0.017,0.40, bp2[0], y+0.62, bp2[1], MAT.steel, g, 8, {furn:true});
  }
  fsolid(dims(rq,0.42,0.42)[0], 0.06, dims(rq,0.42,0.42)[1], cx, y+0.465, cz, MAT.fabric2, g);
  var bp = place(rq,cx,cz,0,-0.20);
  var bd = dims(rq,0.40,0.06);
  fbox(bd[0],0.29,bd[1], bp[0], y+0.70, bp[1], MAT.fabric2, g);
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
