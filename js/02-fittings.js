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
  var D = dims(rq,w,d);
  fsolid(D[0], 0.42, D[1], cx, y+0.21, cz, MAT.woodDark, g);
  var mw = dims(rq, w-0.1, d-0.1);
  fbox(mw[0], 0.26, mw[1], cx, y+0.55, cz, linenMat||MAT.linen, g);
  // headboard
  var hp = place(rq,cx,cz,0,-d/2-0.06);
  var hd = dims(rq, w+0.16, 0.12);
  fsolid(hd[0], 1.15, hd[1], hp[0], y+0.58, hp[1], MAT.wood, g);
  // pillows
  var p1 = place(rq,cx,cz,-w*0.22,-d/2+0.38);
  var p2 = place(rq,cx,cz, w*0.22,-d/2+0.38);
  var pd = dims(rq, w*0.38, 0.34);
  fbox(pd[0],0.15,pd[1], p1[0], y+0.74, p1[1], MAT.white, g);
  if(w>1.3) fbox(pd[0],0.15,pd[1], p2[0], y+0.74, p2[1], MAT.white, g);
  // throw at foot
  var tp = place(rq,cx,cz,0,d*0.30);
  var td = dims(rq, w-0.08, d*0.30);
  fbox(td[0],0.06,td[1], tp[0], y+0.71, tp[1], MAT.fabric, g);
  // side tables
  var s1 = place(rq,cx,cz,-w/2-0.32,-d/2+0.28);
  var sd = dims(rq,0.5,0.42);
  fsolid(sd[0],0.5,sd[1], s1[0], y+0.25, s1[1], MAT.wood, g);
  addCyl(0.10,0.13,0.26, s1[0], y+0.63, s1[1], MAT.lamp, g, 10, {furn:true});
  if(w>1.3){
    var s2 = place(rq,cx,cz, w/2+0.32,-d/2+0.28);
    fsolid(sd[0],0.5,sd[1], s2[0], y+0.25, s2[1], MAT.wood, g);
    addCyl(0.10,0.13,0.26, s2[0], y+0.63, s2[1], MAT.lamp, g, 10, {furn:true});
  }
}

/* ---- sofa: back at local -Z ---- */
function sofa(cx,cz,y,w,rq,g,mat){
  mat = mat||MAT.fabric;
  var d = 0.9;
  var D = dims(rq,w,d);
  fsolid(D[0],0.36,D[1], cx, y+0.18, cz, mat, g);
  var bp = place(rq,cx,cz,0,-d/2+0.14);
  var bd = dims(rq,w,0.28);
  fsolid(bd[0],0.55,bd[1], bp[0], y+0.60, bp[1], mat, g);
  var seat = dims(rq, w-0.36, d-0.32);
  fbox(seat[0],0.16,seat[1], cx, y+0.44, cz, mat, g);
  var a1 = place(rq,cx,cz,-w/2+0.09,0), a2 = place(rq,cx,cz, w/2-0.09,0);
  var ad = dims(rq,0.18,d);
  fsolid(ad[0],0.62,ad[1], a1[0], y+0.31, a1[1], mat, g);
  fsolid(ad[0],0.62,ad[1], a2[0], y+0.31, a2[1], mat, g);
  // cushions
  var n = Math.max(2, Math.round(w/0.75));
  for(var i=0;i<n;i++){
    var f = -w/2 + w*(i+0.5)/n;
    var cp = place(rq,cx,cz,f,-0.08);
    var cd = dims(rq, w/n-0.14, 0.14);
    fbox(cd[0],0.36,cd[1], cp[0], y+0.66, cp[1], MAT.fabric2, g);
  }
}
function armchair(cx,cz,y,rq,g,mat){ sofa(cx,cz,y,0.95,rq,g,mat||MAT.fabric2); }

function coffeeTable(cx,cz,y,w,d,g){
  fsolid(w,0.08,d,cx,y+0.40,cz,MAT.woodDark,g);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){
    fbox(0.07,0.36,0.07, cx+s[0]*(w/2-0.1), y+0.18, cz+s[1]*(d/2-0.1), MAT.black, g);
  });
  fbox(0.26,0.10,0.26, cx, y+0.49, cz, MAT.bloom2, g);
}
function rugMat(cx,cz,y,w,d,g,mat){ addBox(w,0.02,d,cx,y+0.011,cz,mat||MAT.rug,g,{cast:false,furn:true}); }

function tvUnit(cx,cz,y,w,rq,g){
  var D = dims(rq,w,0.42);
  fsolid(D[0],0.45,D[1], cx, y+0.22, cz, MAT.woodDark, g);
  var sp = place(rq,cx,cz,0,0.02);
  var sd = dims(rq, Math.min(w-0.3,1.5), 0.06);
  fbox(sd[0],0.86,sd[1], sp[0], y+1.15, sp[1], MAT.black, g);
  fbox(sd[0]*0.96,0.80,0.02, sp[0], y+1.15, sp[1]+(rq===0?0.04:(rq===2?-0.04:0)), MAT.carGlass, g);
}

function wardrobe(cx,cz,y,w,rq,g){
  var D = dims(rq,w,0.62);
  fsolid(D[0],2.35,D[1], cx, y+1.175, cz, MAT.wood, g);
  var n = Math.max(2,Math.round(w/0.55));
  for(var i=0;i<n;i++){
    var f=-w/2+w*(i+0.5)/n;
    var p=place(rq,cx,cz,f,0.32);
    fbox( (rq===1||rq===3)?0.03:w/n-0.04, 2.2, (rq===1||rq===3)?w/n-0.04:0.03, p[0], y+1.18, p[1], MAT.woodDark, g);
  }
}

function desk(cx,cz,y,w,rq,g){
  var D=dims(rq,w,0.65);
  fsolid(D[0],0.06,D[1],cx,y+0.75,cz,MAT.wood,g);
  fbox(0.06,0.72,0.06,cx-(D[0]/2-0.08),y+0.36,cz-(D[1]/2-0.08),MAT.black,g);
  fbox(0.06,0.72,0.06,cx+(D[0]/2-0.08),y+0.36,cz-(D[1]/2-0.08),MAT.black,g);
  fbox(0.06,0.72,0.06,cx-(D[0]/2-0.08),y+0.36,cz+(D[1]/2-0.08),MAT.black,g);
  fbox(0.06,0.72,0.06,cx+(D[0]/2-0.08),y+0.36,cz+(D[1]/2-0.08),MAT.black,g);
  fbox(0.5,0.34,0.03,cx,y+0.97,cz-0.1,MAT.carGlass,g);
  chair(cx,cz+0.6,y,rq,g);
}
function chair(cx,cz,y,rq,g){
  fsolid(0.46,0.05,0.46,cx,y+0.45,cz,MAT.woodDark,g);
  var bp=place(rq,cx,cz,0,-0.21);
  var bd=dims(rq,0.44,0.05);
  fbox(bd[0],0.5,bd[1],bp[0],y+0.72,bp[1],MAT.woodDark,g);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){
    fbox(0.05,0.44,0.05,cx+s[0]*0.19,y+0.22,cz+s[1]*0.19,MAT.black,g);
  });
}

function diningSet(cx,cz,y,seats,rq,g){
  var w = seats>=8?2.4:2.0, d=1.0;
  var D=dims(rq,w,d);
  fsolid(D[0],0.08,D[1],cx,y+0.76,cz,MAT.woodDark,g);
  fbox(D[0]*0.55,0.68,D[1]*0.35,cx,y+0.38,cz,MAT.wood,g);
  var per = seats/2, i, f, p;
  for(i=0;i<per;i++){
    f = -w/2 + w*(i+0.5)/per;
    p = place(rq,cx,cz,f,-d/2-0.35); chair(p[0],p[1],y,rq,g);
    p = place(rq,cx,cz,f, d/2+0.35); chair(p[0],p[1],y,(rq+2)%4,g);
  }
  fbox(0.4,0.06,0.22,cx,y+0.83,cz,MAT.white,g);
  addSphere(0.10,cx,y+0.96,cz,MAT.bloom1,g,{furn:true});
  addSphere(0.09,cx+0.14,y+0.93,cz,MAT.bloom3,g,{furn:true});
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
function ceilingFan(cx,cz,y,g){
  addCyl(0.04,0.04,0.3,cx,y-0.15,cz,MAT.steel,g,8,{furn:true});
  addCyl(0.13,0.13,0.14,cx,y-0.36,cz,MAT.steel,g,12,{furn:true});
  for(var i=0;i<4;i++){
    var a=i*Math.PI/2;
    var m=fbox(0.62,0.03,0.16,cx+Math.cos(a)*0.42,y-0.38,cz+Math.sin(a)*0.42,MAT.woodDark,g);
    m.rotation.y=-a;
  }
}
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
function ac(cx,cz,y,rq,g){
  var D=dims(rq,0.95,0.22);
  fbox(D[0],0.30,D[1],cx,y,cz,MAT.white,g);
}
function door(cx,cz,w,rq,g,y){
  // an open leaf, hinged flat against the wall
  var D=dims(rq,0.05,w);
  fbox(D[0],2.10,D[1],cx,y+1.05,cz,MAT.wood,g);
}
