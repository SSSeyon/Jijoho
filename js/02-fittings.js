"use strict";
/* ============================================================
   PART 2  -  furniture & fitting library
   Every item registers a collider so you cannot walk through it.
   rot: 0 = headboard/back faces -Z, 1 = +X, 2 = +Z, 3 = -X
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

/* ---- bed: w x d footprint, headboard at local -Z ---- */
function bed(cx,cz,y,w,d,rq,g,linenMat){
  /* Low platform base and a soft upholstered headboard, both in the same
     family as the walls - the reference has no dark timber anywhere. */
  var D = dims(rq,w,d);
  fsolid(D[0], 0.34, D[1], cx, y+0.17, cz, MAT.joinery, g);
  var mw = dims(rq, w-0.1, d-0.1);
  fbox(mw[0], 0.26, mw[1], cx, y+0.47, cz, linenMat||MAT.linen, g);
  // headboard
  var hp = place(rq,cx,cz,0,-d/2-0.07);
  var hd = dims(rq, w+0.16, 0.14);
  fsolid(hd[0], 1.05, hd[1], hp[0], y+0.53, hp[1], MAT.fabric, g);
  // pillows
  var p1 = place(rq,cx,cz,-w*0.22,-d/2+0.38);
  var p2 = place(rq,cx,cz, w*0.22,-d/2+0.38);
  var pd = dims(rq, w*0.38, 0.34);
  fbox(pd[0],0.15,pd[1], p1[0], y+0.66, p1[1], MAT.white, g);
  if(w>1.3) fbox(pd[0],0.15,pd[1], p2[0], y+0.66, p2[1], MAT.white, g);
  // throw at foot
  var tp = place(rq,cx,cz,0,d*0.30);
  var td = dims(rq, w-0.08, d*0.30);
  fbox(td[0],0.06,td[1], tp[0], y+0.63, tp[1], MAT.fabric2, g);
  // side tables
  var s1 = place(rq,cx,cz,-w/2-0.32,-d/2+0.28);
  var sd = dims(rq,0.5,0.42);
  fsolid(sd[0],0.46,sd[1], s1[0], y+0.23, s1[1], MAT.joinery, g);
  addCyl(0.10,0.13,0.24, s1[0], y+0.56, s1[1], MAT.lamp, g, 10, {furn:true});
  if(w>1.3){
    var s2 = place(rq,cx,cz, w/2+0.32,-d/2+0.28);
    fsolid(sd[0],0.46,sd[1], s2[0], y+0.23, s2[1], MAT.joinery, g);
    addCyl(0.10,0.13,0.24, s2[0], y+0.56, s2[1], MAT.lamp, g, 10, {furn:true});
  }
}

/* ---- sofa: back at local -Z ----
   Modelled on the loft reference: a low modular seat that sits almost on the
   floor with no visible legs, a thin flat back cushion rather than a bolstered
   roll, and arms that stop level with the back. The old one was a 0.90 m deep
   block with 0.18 m arms and a 0.55 m back, which is a hotel-lobby sofa; this
   is 0.86 m deep overall and reads as a piece of furniture you could actually
   sit low in. */
function sofa(cx,cz,y,w,rq,g,mat){
  mat = mat||MAT.fabric;
  var d = 0.86;
  /* plinth: the whole footprint, 60 mm off the floor, so the seat appears to
     float the way an upholstered platform does */
  var D = dims(rq,w,d);
  fsolid(D[0],0.30,D[1], cx, y+0.21, cz, mat, g);
  /* seat cushions, split into modules - a modular sofa's tell is the gaps */
  var n = Math.max(1, Math.round(w/0.85));
  var i, f, cp, cd;
  for(i=0;i<n;i++){
    f = -w/2 + w*(i+0.5)/n;
    cp = place(rq,cx,cz,f,0.07);
    cd = dims(rq, w/n-0.05, d-0.30);
    fbox(cd[0],0.15,cd[1], cp[0], y+0.435, cp[1], mat, g);
  }
  /* back: thin, flat, stopping at 0.62 - low enough to see over */
  var bp = place(rq,cx,cz,0,-d/2+0.10);
  var bd = dims(rq,w,0.19);
  fsolid(bd[0],0.31,bd[1], bp[0], y+0.465, bp[1], mat, g);
  for(i=0;i<n;i++){
    f = -w/2 + w*(i+0.5)/n;
    cp = place(rq,cx,cz,f,-d/2+0.11);
    cd = dims(rq, w/n-0.05, 0.16);
    fbox(cd[0],0.30,cd[1], cp[0], y+0.62, cp[1], mat, g);
  }
  /* arms only on a sofa wide enough to have them; a 0.95 m armchair keeps them */
  var ad = dims(rq,0.15,d);
  var a1 = place(rq,cx,cz,-w/2+0.075,0), a2 = place(rq,cx,cz, w/2-0.075,0);
  fsolid(ad[0],0.52,ad[1], a1[0], y+0.26, a1[1], mat, g);
  fsolid(ad[0],0.52,ad[1], a2[0], y+0.26, a2[1], mat, g);
  /* One accent cushion, muted, and only on a full sofa. Putting one on every
     armchair as well meant four of them in a room the reference furnishes with
     two, and repetition is what kills a restrained palette. */
  if(w > 1.4){
    var kp = place(rq,cx,cz,-w/2+0.42,-0.06);
    addSphere(0.17, kp[0], y+0.63, kp[1], MAT.cushion, g, {furn:true});
  }
  addCollider(cx-(rq===1||rq===3?d:w)/2, cx+(rq===1||rq===3?d:w)/2,
              cz-(rq===1||rq===3?w:d)/2, cz+(rq===1||rq===3?w:d)/2, y, y+0.62);
}
function armchair(cx,cz,y,rq,g,mat){ sofa(cx,cz,y,0.92,rq,g,mat||MAT.fabric2); }

/* ---- round coffee table: pale top on a chunky speckled-stone base ----
   The reference table is a disc of pale ash on three fat terrazzo blocks, and
   it is very low - 0.32 m, not the 0.44 m the old box-on-four-black-legs was.
   w is taken as the diameter; d is ignored and kept only so existing calls
   still work. */
function coffeeTable(cx,cz,y,w,d,g){
  var r = w/2;
  addCyl(r, r, 0.07, cx, y+0.325, cz, MAT.woodPale, g, 28, {furn:true});
  for(var i=0;i<3;i++){
    var a = i*2.0944 + 0.5;
    fbox(0.17,0.29,0.17, cx+Math.cos(a)*r*0.55, y+0.145, cz+Math.sin(a)*r*0.55, MAT.terrazzo, g);
  }
  /* a shallow bowl with two stones in it, which is the whole of the styling */
  addCyl(0.15,0.11,0.06, cx, y+0.39, cz, MAT.woodDark, g, 16, {furn:true});
  addSphere(0.05, cx-0.03, y+0.42, cz+0.02, MAT.stone, g, {furn:true});
  addCollider(cx-r, cx+r, cz-r, cz+r, y, y+0.36);
}
function rugMat(cx,cz,y,w,d,g,mat){ addBox(w,0.02,d,cx,y+0.011,cz,mat||MAT.rug,g,{cast:false,furn:true}); }

function tvUnit(cx,cz,y,w,rq,g){
  var D = dims(rq,w,0.42);
  fsolid(D[0],0.36,D[1], cx, y+0.20, cz, MAT.joinery, g);
  var sp = place(rq,cx,cz,0,0.02);
  var sd = dims(rq, Math.min(w-0.3,1.5), 0.06);
  fbox(sd[0],0.86,sd[1], sp[0], y+1.15, sp[1], MAT.black, g);
  fbox(sd[0]*0.96,0.80,0.02, sp[0], y+1.15, sp[1]+(rq===0?0.04:(rq===2?-0.04:0)), MAT.carGlass, g);
}

function wardrobe(cx,cz,y,w,rq,g){
  var D = dims(rq,w,0.62);
  fsolid(D[0],2.30,D[1], cx, y+1.15, cz, MAT.joinery, g);
  var n = Math.max(2,Math.round(w/0.55));
  for(var i=0;i<n;i++){
    var f=-w/2+w*(i+0.5)/n;
    var p=place(rq,cx,cz,f,0.32);
    fbox( (rq===1||rq===3)?0.03:w/n-0.04, 2.2, (rq===1||rq===3)?w/n-0.04:0.03, p[0], y+1.18, p[1], MAT.woodDark, g);
  }
}

function desk(cx,cz,y,w,rq,g){
  var D=dims(rq,w,0.65);
  fsolid(D[0],0.06,D[1],cx,y+0.75,cz,MAT.woodPale,g);
  fbox(0.05,0.72,0.05,cx-(D[0]/2-0.08),y+0.36,cz-(D[1]/2-0.08),MAT.steel,g);
  fbox(0.05,0.72,0.05,cx+(D[0]/2-0.08),y+0.36,cz-(D[1]/2-0.08),MAT.steel,g);
  fbox(0.05,0.72,0.05,cx-(D[0]/2-0.08),y+0.36,cz+(D[1]/2-0.08),MAT.steel,g);
  fbox(0.05,0.72,0.05,cx+(D[0]/2-0.08),y+0.36,cz+(D[1]/2-0.08),MAT.steel,g);
  fbox(0.5,0.34,0.03,cx,y+0.97,cz-0.1,MAT.carGlass,g);
  chair(cx,cz+0.6,y,rq,g);
}
/* ---- cantilever chair ----
   The reference chairs are the classic tubular sled: a single bent steel tube
   running under the seat and up the back, no back legs at all. Modelled as the
   two side frames plus the seat and back pads. 0.46 m square seat, 0.45 high. */
function chair(cx,cz,y,rq,g){
  var s;
  for(s=-1;s<=1;s+=2){
    var side = place(rq,cx,cz,s*0.21,0);
    /* the runner on the floor and the one under the seat */
    var rd = dims(rq,0.035,0.46);
    fbox(rd[0],0.035,rd[1], side[0], y+0.02, side[1], MAT.steel, g);
    fbox(rd[0],0.035,rd[1], side[0], y+0.43, side[1], MAT.steel, g);
    /* the front bend that carries the load, and the back upright */
    var fp = place(rq,cx,cz,s*0.21,0.21), bp2 = place(rq,cx,cz,s*0.21,-0.21);
    addCyl(0.018,0.018,0.44, fp[0], y+0.23, fp[1], MAT.steel, g, 8, {furn:true});
    addCyl(0.018,0.018,0.42, bp2[0], y+0.64, bp2[1], MAT.steel, g, 8, {furn:true});
  }
  fsolid(dims(rq,0.44,0.44)[0], 0.07, dims(rq,0.44,0.44)[1], cx, y+0.475, cz, MAT.fabric2, g);
  var bp = place(rq,cx,cz,0,-0.21);
  var bd = dims(rq,0.42,0.07);
  fbox(bd[0],0.30,bd[1], bp[0], y+0.72, bp[1], MAT.fabric2, g);
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
    var r = seats<=4 ? 0.55 : 0.68;
    addCyl(r, r, 0.06, cx, y+0.74, cz, MAT.woodPale, g, 32, {furn:true});
    addCyl(0.17, 0.26, 0.71, cx, y+0.355, cz, MAT.terrazzo, g, 22, {furn:true});
    addCollider(cx-r, cx+r, cz-r, cz+r, y, y+0.78);
    for(i=0;i<seats;i++){
      a = (i/seats)*Math.PI*2 + Math.PI/seats;
      p = [cx + Math.sin(a)*(r+0.36), cz + Math.cos(a)*(r+0.36)];
      /* chairs face the table, snapped to the nearest quarter turn */
      chair(p[0], p[1], y, (Math.round(a/(Math.PI/2))+2)%4, g);
    }
  } else {
    var w = 2.30, d = 1.00;
    var D = dims(rq,w,d);
    fsolid(D[0],0.06,D[1], cx, y+0.74, cz, MAT.woodPale, g);
    for(i=-1;i<=1;i+=2){
      p = place(rq,cx,cz,i*w*0.28,0);
      addCyl(0.15, 0.23, 0.71, p[0], y+0.355, p[1], MAT.terrazzo, g, 20, {furn:true});
    }
    var per = seats/2, f;
    for(i=0;i<per;i++){
      f = -w/2 + w*(i+0.5)/per;
      p = place(rq,cx,cz,f,-d/2-0.32); chair(p[0],p[1],y,rq,g);
      p = place(rq,cx,cz,f, d/2+0.32); chair(p[0],p[1],y,(rq+2)%4,g);
    }
  }
  /* a single stem vase, as in the reference - no fruit bowl, no candles */
  addCyl(0.055,0.075,0.24, cx, y+0.89, cz, MAT.white, g, 14, {furn:true});
  for(i=0;i<5;i++){
    a = i*1.257;
    addSphere(0.055, cx+Math.cos(a)*0.09, y+1.06+((i*7)%3)*0.05, cz+Math.sin(a)*0.09, MAT.leaf, g, {furn:true});
  }
}

/* ---- kitchen run along a wall ---- */
function counterRun(x0,z0,x1,z1,y,g,withUppers){
  var horiz = Math.abs(z1-z0)<1e-6;
  var len = horiz?Math.abs(x1-x0):Math.abs(z1-z0);
  var cx=(x0+x1)/2, cz=(z0+z1)/2;
  var w = horiz?len:0.62, d = horiz?0.62:len;
  fsolid(w,0.86,d,cx,y+0.43,cz,MAT.white,g);
  fbox(w+0.04,0.05,d+0.04,cx,y+0.885,cz,MAT.counter,g);
  var n=Math.max(2,Math.round(len/0.6));
  for(var i=0;i<n;i++){
    var f=-len/2+len*(i+0.5)/n;
    fbox(horiz?len/n-0.03:0.03, 0.78, horiz?0.03:len/n-0.03,
         horiz?cx+f:cx-0.31, y+0.44, horiz?cz-0.31:cz+f, MAT.linen, g);
  }
  if(withUppers){
    fsolid(horiz?len*0.75:0.36, 0.75, horiz?0.36:len*0.75, cx, y+1.85, cz, MAT.white, g);
  }
}
function fridge(cx,cz,y,rq,g){
  var D=dims(rq,0.85,0.72);
  fsolid(D[0],1.85,D[1],cx,y+0.925,cz,MAT.steel,g);
  var p=place(rq,cx,cz,0,0.37);
  fbox(dims(rq,0.82,0.03)[0],0.04,dims(rq,0.82,0.03)[1],p[0],y+1.05,p[1],MAT.black,g);
}
function cooker(cx,cz,y,rq,g){
  var D=dims(rq,0.75,0.62);
  fsolid(D[0],0.88,D[1],cx,y+0.44,cz,MAT.black,g);
  fbox(D[0]-0.06,0.03,D[1]-0.06,cx,y+0.90,cz,MAT.carGlass,g);
  var p=place(rq,cx,cz,0,-0.30);
  fbox(dims(rq,0.7,0.16)[0],0.55,dims(rq,0.7,0.16)[1],p[0],y+2.05,p[1],MAT.steel,g);
}
function island(cx,cz,y,w,d,g){
  fsolid(w,0.88,d,cx,y+0.44,cz,MAT.white,g);
  fbox(w+0.14,0.06,d+0.14,cx,y+0.91,cz,MAT.counter,g);
  addCyl(0.03,0.03,0.28,cx-0.3,y+1.06,cz,MAT.steel,g,8,{furn:true});
  for(var i=0;i<2;i++) stool(cx-0.35+i*0.7, cz+d/2+0.42, y, g);
}
function stool(cx,cz,y,g){
  addCyl(0.17,0.17,0.06,cx,y+0.68,cz,MAT.wood,g,12,{furn:true});
  addCyl(0.04,0.05,0.66,cx,y+0.33,cz,MAT.steel,g,10,{furn:true});
  addCyl(0.20,0.20,0.03,cx,y+0.02,cz,MAT.steel,g,12,{furn:true});
  addCollider(cx-0.2,cx+0.2,cz-0.2,cz+0.2,y,y+0.72);
}

/* ---- bathroom fittings; wall side given by rq (fitting backs onto -Z local) ---- */
function wc(cx,cz,y,rq,g){
  var D=dims(rq,0.4,0.62);
  fsolid(D[0],0.40,D[1],cx,y+0.20,cz,MAT.white,g);
  var p=place(rq,cx,cz,0,-0.34);
  fbox(dims(rq,0.42,0.18)[0],0.62,dims(rq,0.42,0.18)[1],p[0],y+0.31,p[1],MAT.white,g);
  fbox(D[0]+0.03,0.05,D[1]*0.7,cx,y+0.42,cz+0.02,MAT.linen,g);
}
function basin(cx,cz,y,rq,g,w){
  w=w||0.9;
  var D=dims(rq,w,0.52);
  fsolid(D[0],0.78,D[1],cx,y+0.39,cz,MAT.wood,g);
  fbox(D[0]+0.04,0.06,D[1]+0.04,cx,y+0.81,cz,MAT.white,g);
  addCyl(0.02,0.02,0.22,cx,y+0.92,cz-0.14,MAT.steel,g,8,{furn:true});
  var p=place(rq,cx,cz,0,-0.27);
  fbox(dims(rq,w*0.8,0.03)[0],0.95,dims(rq,w*0.8,0.03)[1],p[0],y+1.55,p[1],MAT.carGlass,g);
}
function shower(x0,z0,x1,z1,y,g){
  var w=Math.abs(x1-x0), d=Math.abs(z1-z0), cx=(x0+x1)/2, cz=(z0+z1)/2;
  addBox(w,0.06,d,cx,y+0.03,cz,MAT.tileWet,g,{cast:false,furn:true});
  var gm=addBox(0.05,2.05,d,x1,y+1.03,cz,MAT.glass,g,{cast:false,furn:true});
  addCollider(x1-0.05,x1+0.05,z0,z1,y,y+2.05);
  addCyl(0.09,0.09,0.05,cx,y+2.15,cz,MAT.steel,g,10,{furn:true});
  addCyl(0.025,0.025,0.35,cx,y+2.35,cz,MAT.steel,g,8,{furn:true});
}
function bathtub(cx,cz,y,w,d,g){
  fsolid(w,0.55,d,cx,y+0.275,cz,MAT.white,g);
  fbox(w-0.16,0.06,d-0.16,cx,y+0.53,cz,MAT.tileWet,g);
}

function bookshelf(cx,cz,y,w,rq,g){
  var D=dims(rq,w,0.34);
  fsolid(D[0],2.05,D[1],cx,y+1.025,cz,MAT.wood,g);
  var cols=["0xb8503f","0x3f6bb8","0xd8b23f","0x4b8f5a","0x8a4b9a"];
  for(var s=0;s<4;s++){
    for(var i=0;i<Math.round(w/0.09);i++){
      var f=-w/2+0.06+i*0.09;
      var p=place(rq,cx,cz,f,0.02);
      var m = M(parseInt(cols[(i+s)%5]), {r:0.9});
      fbox(dims(rq,0.07,0.24)[0], 0.26, dims(rq,0.07,0.24)[1], p[0], y+0.34+s*0.5, p[1], m, g);
    }
  }
}
function artwork(cx,cz,y,w,h,rq,g){
  var D=dims(rq,w,0.05);
  fbox(D[0],h,D[1],cx,y,cz,MAT.woodDark,g);
  var pal=[0xc06a4a,0x4a7fc0,0xd6b45a,0x5d8f6a];
  var m=M(pal[Math.floor(Math.random()*4)],{r:0.9});
  var D2=dims(rq,w-0.1,0.02);
  fbox(D2[0],h-0.1,D2[1],cx,y,cz+(rq===0?0.03:(rq===2?-0.03:0)),m,g);
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
  var up   = addCyl(0.045,0.045,0.015, cx, y+0.135, cz, MAT.lamp, g, 10, {furn:true});
  var down = addCyl(0.045,0.045,0.015, cx, y-0.135, cz, MAT.lamp, g, 10, {furn:true});
  up.castShadow = false; down.castShadow = false;

}
function door(cx,cz,w,rq,g,y){
  // an open leaf, hinged flat against the wall
  var D=dims(rq,0.05,w);
  fbox(D[0],2.10,D[1],cx,y+1.05,cz,MAT.wood,g);
}
