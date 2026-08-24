"use strict";
/* ============================================================
   PART 6  -  camera modes, controls, UI
   ============================================================ */

/* Every geometry in the model now has a second UV set, which is what the
   packed AO channel is sampled through. Done here, once, after parts 2-5
   have finished adding meshes. */
fixUV2(scene);

/* The court and the BQ occupy the same ground, so exactly one is up at a
   time. Start with the BQ, which is what the brief asked for. */
gSport.visible = false;
if(gSolar) gSolar.visible = false;
CTOFF.sport = true;

/* ---------- rooms for the location readout ---------- */
function Z(name, y, x0,z0,x1,z1){ return {n:name, y:y, x0:Math.min(x0,x1), x1:Math.max(x0,x1), z0:Math.min(z0,z1), z1:Math.max(z0,z1)}; }
var ZONES = [
  /* ground floor */
  Z("Living room", GF, hx(0),hz(0), hx(5.0),hz(7.0)),
  Z("Dining room", GF, hx(0),hz(7.0), hx(5.0),hz(11.5)),
  Z("Entrance foyer", GF, hx(5.0),hz(0), hx(8.55),hz(2.6)),
  Z("Staircase", GF, hx(5.0),hz(2.6), hx(6.5),hz(7.36)),
  Z("Stair hall", GF, hx(6.5),hz(2.6), hx(8.55),hz(7.36)),
  Z("Rear lobby / breakfast", GF, hx(5.0),hz(7.36), hx(8.55),hz(11.5)),
  Z("Study / guest room", GF, hx(8.55),hz(0), hx(13.55),hz(4.6)),
  Z("Guest cloakroom", GF, hx(8.55),hz(4.6), hx(10.4),hz(6.4)),
  Z("Store", GF, hx(10.4),hz(4.6), hx(13.55),hz(6.4)),
  Z("Kitchen", GF, hx(8.55),hz(6.4), hx(13.55),hz(10.2)),
  Z("Pantry / laundry", GF, hx(8.55),hz(10.2), hx(13.55),hz(11.5)),
  Z("Front porch", GF, hx(1.0),hz(-1.8), hx(12.5),hz(0)),
  /* first floor */
  Z("Master bedroom", FF, hx(0),hz(0), hx(5.0),hz(4.6)),
  Z("Walk-in closet", FF, hx(0),hz(4.6), hx(2.9),hz(7.0)),
  Z("Master bathroom", FF, hx(2.9),hz(4.6), hx(5.0),hz(7.0)),
  Z("Bedroom 2", FF, hx(0),hz(7.0), hx(5.0),hz(11.5)),
  Z("Upper landing", FF, hx(5.0),hz(0), hx(6.5),hz(2.6)),
  Z("Upstairs gallery", FF, hx(6.5),hz(0), hx(8.55),hz(7.36)),
  Z("Family lounge", FF, hx(5.0),hz(7.36), hx(8.55),hz(11.5)),
  Z("Bedroom 3", FF, hx(8.55),hz(0), hx(13.55),hz(5.0)),
  Z("Linen / plant store", FF, hx(8.55),hz(5.0), hx(13.55),hz(6.6)),
  Z("Bedroom 4", FF, hx(8.55),hz(6.6), hx(13.55),hz(11.5)),
  Z("Front balcony", FF, hx(1.0),hz(-1.8), hx(12.5),hz(0)),
  /* boys quarters */
  Z("BQ unit A - parlour", BF, bxf(0),bzf(0), bxf(5.0),bzf(3.0)),
  Z("BQ unit A - bedroom", BF, bxf(1.9),bzf(3.0), bxf(5.0),bzf(6.0)),
  Z("BQ unit A - kitchenette", BF, bxf(0),bzf(3.0), bxf(1.9),bzf(4.4)),
  Z("BQ unit A - bathroom", BF, bxf(0),bzf(4.4), bxf(1.9),bzf(6.0)),
  Z("Indoor games room", BF, bxf(5.0),bzf(0), bxf(8.55),bzf(6.0)),
  Z("BQ unit B - parlour", BF, bxf(8.55),bzf(0), bxf(13.55),bzf(3.0)),
  Z("BQ unit B - bedroom", BF, bxf(8.55),bzf(3.0), bxf(11.65),bzf(6.0)),
  Z("BQ unit B - kitchenette", BF, bxf(11.65),bzf(3.0), bxf(13.55),bzf(4.4)),
  Z("BQ unit B - bathroom", BF, bxf(11.65),bzf(4.4), bxf(13.55),bzf(6.0)),
  /* outdoors */
  Z("Gazebo", 0.22, -9.1,3.5, -5.6,7.1),
  Z("Driveway / carport", 0, -9.6,-16.7, -1.1,-11.2),
  Z("Front garden", 0, 0.2,-16.7, 9.7,-11.2),
  Z("Rear terrace", 0, -1.3,1.7, 4.9,4.2),
  Z("Rear lawn", 0, -9.7,1.7, 9.7,6.7),
  Z("BQ forecourt", 0, -9.7,6.6, 9.7,7.8),
  Z("Utility yard", 0, -9.7,15.0, 9.7,16.8),
  Z("West garden walk", 0, -9.7,-11.3, -6.8,7.8),
  Z("East service path", 0, 6.8,-11.3, 9.7,14.7)
];
/* The rear of the plot reads differently depending on which block is up, so
   the zones for each are tagged and filtered the same way the colliders are. */
ZONES.forEach(function(Zi){
  if(Zi.n.indexOf("BQ ") === 0 || Zi.n === "Indoor games room" || Zi.n === "BQ forecourt") Zi.t = "bq";
});
/* unshifted, so the court reads ahead of the rear-lawn zone it overlaps.
   Listed back to front: after the unshifts the key ends up ahead of the court,
   which is what makes the more specific name win. */
[ Z("Courtside", 0, -8.75,4.60, 7.90,6.90),
  Z("Sports court", 0.12, -8.40,6.90, 7.80,14.90),
  Z("Basketball key", 0.12, -8.40,8.45, -2.60,13.35)
].forEach(function(Zi){ Zi.t = "sport"; ZONES.unshift(Zi); });

function zoneAt(x,z,y){
  var best=null;
  for(var i=0;i<ZONES.length;i++){
    var Zi=ZONES[i];
    if(Zi.t && CTOFF[Zi.t]) continue;
    if(x>=Zi.x0&&x<=Zi.x1&&z>=Zi.z0&&z<=Zi.z1&&Math.abs(Zi.y-y)<0.75){ best=Zi; break; }
  }
  if(best) return best.n;
  if(y>-0.2&&y<0.4){ return (z < Z0) ? "Street" : "Compound"; }
  return "";
}

/* ---------- player ---------- */
var player = { x:-0.45, y:0, z:-20.0, yaw:Math.PI, pitch:-0.03, vy:0 };
var EYE = 1.62, RAD = 0.28;

var STEP = 0.40;                 /* tallest thing you can step up onto */
function collides(x,z,y){
  var lo = y+0.38, hi = y+1.75;
  for(var i=0;i<COLLIDERS.length;i++){
    var c=COLLIDERS[i];
    if(c.t && CTOFF[c.t]) continue;
    if(c.y1<=lo || c.y0>=hi) continue;
    var cx = Math.max(c.x0, Math.min(x, c.x1));
    var cz = Math.max(c.z0, Math.min(z, c.z1));
    var dx = x-cx, dz = z-cz;
    if(dx*dx+dz*dz < RAD*RAD) return true;
  }
  return false;
}
function floorAt(x,z,y){
  var best = -999, lim = y+STEP;
  for(var i=0;i<FLOORS.length;i++){
    var f=FLOORS[i];
    if(f.t && CTOFF[f.t]) continue;
    if(x<f.x0||x>f.x1||z<f.z0||z>f.z1) continue;
    if(f.y<=lim && f.y>best) best=f.y;
  }
  return best===-999 ? 0 : best;
}
/* returns the y to stand at if the move is legal, else null.
   A blocked move is retried one step higher so stairs and kerbs are climbable. */
function tryMove(x,z,y){
  if(!collides(x,z,y)) return y;
  var fy = floorAt(x,z,y);
  if(fy > y + 0.001 && fy - y <= STEP + 0.001 && !collides(x,z,fy)) return fy;
  return null;
}

/* ---------- input ---------- */
var keys = {};
var mode = "walk";
var locked = false;
var canvas = renderer.domElement;
var touchMove = {active:false, id:-1, ox:0, oy:0, dx:0, dy:0};
var touchLook = {active:false, id:-1, lx:0, ly:0};
var isTouch = ("ontouchstart" in window) || navigator.maxTouchPoints>0;

document.addEventListener("keydown", function(e){
  keys[e.code]=true;
  if(e.code==="Space") e.preventDefault();
  if(e.code==="KeyV"){ setMode(mode==="walk"?"orbit":"walk"); }
  if(e.code==="KeyG"){ setGlass(MAT.glass.transmission > 0 ? false : true); }
  if(e.code==="KeyR"){ toggleBtn("btnRoof"); }
  if(e.code==="KeyF"){ toggleBtn("btnFloor"); }
  if(e.code==="Escape" && document.getElementById("infoPanel").classList.contains("open")) closeInfo();
});
document.addEventListener("keyup", function(e){ keys[e.code]=false; });

canvas.addEventListener("click", function(){
  if(mode==="walk" && !isTouch && !locked) canvas.requestPointerLock();
});
document.addEventListener("pointerlockchange", function(){
  locked = (document.pointerLockElement === canvas);
  document.getElementById("hint").style.display = (locked||mode==="orbit"||isTouch) ? "none" : "block";
});
document.addEventListener("mousemove", function(e){
  if(mode==="walk" && locked){
    player.yaw   -= e.movementX*0.0022;
    player.pitch -= e.movementY*0.0022;
    player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch));
  }
});

/* orbit state */
var orbit = { tx:0, ty:3.0, tz:0, dist:44, theta:-0.55, phi:0.98, dragging:false, panning:false, lx:0, ly:0 };
canvas.addEventListener("mousedown", function(e){
  if(mode!=="orbit") return;
  orbit.dragging = (e.button===0); orbit.panning = (e.button===2);
  orbit.lx=e.clientX; orbit.ly=e.clientY;
});
window.addEventListener("mouseup", function(){ orbit.dragging=false; orbit.panning=false; });
window.addEventListener("mousemove", function(e){
  if(mode!=="orbit") return;
  var dx=e.clientX-orbit.lx, dy=e.clientY-orbit.ly;
  orbit.lx=e.clientX; orbit.ly=e.clientY;
  if(orbit.dragging){
    orbit.theta -= dx*0.006;
    orbit.phi    = Math.max(0.12, Math.min(1.50, orbit.phi - dy*0.005));
  } else if(orbit.panning){
    var s = orbit.dist*0.0016;
    orbit.tx -= (dx*Math.cos(orbit.theta) - dy*0*1)*s;
    orbit.tz -= (dx*Math.sin(orbit.theta))*s;
    orbit.ty  = Math.max(0, orbit.ty + dy*s*0.8);
  }
});
canvas.addEventListener("contextmenu", function(e){ e.preventDefault(); });
canvas.addEventListener("wheel", function(e){
  if(mode!=="orbit") return;
  e.preventDefault();
  orbit.dist = Math.max(6, Math.min(160, orbit.dist * (1 + Math.sign(e.deltaY)*0.10)));
}, {passive:false});

/* touch */
canvas.addEventListener("touchstart", function(e){
  for(var i=0;i<e.changedTouches.length;i++){
    var t=e.changedTouches[i];
    if(mode==="walk"){
      if(t.clientX < window.innerWidth*0.45 && !touchMove.active){
        touchMove.active=true; touchMove.id=t.identifier; touchMove.ox=t.clientX; touchMove.oy=t.clientY; touchMove.dx=0; touchMove.dy=0;
        var st=document.getElementById("stick"); st.style.display="block";
        st.style.left=(t.clientX-60)+"px"; st.style.top=(t.clientY-60)+"px";
      } else if(!touchLook.active){
        touchLook.active=true; touchLook.id=t.identifier; touchLook.lx=t.clientX; touchLook.ly=t.clientY;
      }
    } else {
      if(!touchLook.active){ touchLook.active=true; touchLook.id=t.identifier; touchLook.lx=t.clientX; touchLook.ly=t.clientY; }
      else { touchMove.active=true; touchMove.id=t.identifier; touchMove.ox=t.clientX; touchMove.oy=t.clientY; }
    }
  }
}, {passive:true});
canvas.addEventListener("touchmove", function(e){
  e.preventDefault();
  for(var i=0;i<e.changedTouches.length;i++){
    var t=e.changedTouches[i];
    if(t.identifier===touchMove.id && touchMove.active){
      touchMove.dx = Math.max(-55, Math.min(55, t.clientX-touchMove.ox));
      touchMove.dy = Math.max(-55, Math.min(55, t.clientY-touchMove.oy));
      var k=document.getElementById("knob");
      k.style.transform = "translate("+touchMove.dx+"px,"+touchMove.dy+"px)";
      if(mode==="orbit"){ orbit.dist = Math.max(9, Math.min(150, orbit.dist + touchMove.dy*0.05)); }
    } else if(t.identifier===touchLook.id && touchLook.active){
      var dx=t.clientX-touchLook.lx, dy=t.clientY-touchLook.ly;
      touchLook.lx=t.clientX; touchLook.ly=t.clientY;
      if(mode==="walk"){
        player.yaw -= dx*0.006;
        player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch - dy*0.006));
      } else {
        orbit.theta -= dx*0.008;
        orbit.phi = Math.max(0.12, Math.min(1.50, orbit.phi - dy*0.006));
      }
    }
  }
}, {passive:false});
function endTouch(e){
  for(var i=0;i<e.changedTouches.length;i++){
    var t=e.changedTouches[i];
    if(t.identifier===touchMove.id){ touchMove.active=false; touchMove.id=-1; touchMove.dx=0; touchMove.dy=0;
      document.getElementById("stick").style.display="none";
      document.getElementById("knob").style.transform="translate(0,0)"; }
    if(t.identifier===touchLook.id){ touchLook.active=false; touchLook.id=-1; }
  }
}
canvas.addEventListener("touchend", endTouch, {passive:true});
canvas.addEventListener("touchcancel", endTouch, {passive:true});

/* ---------- on-screen navigation pad ---------- */
/* Held-down buttons that feed the same movement path as the keyboard, so the
   whole model is drivable with nothing but a mouse or a thumb. */
var nav = {fwd:0, back:0, left:0, right:0, tl:0, tr:0, up:0, dn:0, zin:0, zout:0};
var running = false;
var FOV0 = 62, fov = FOV0;
(function(){
  var btns = document.querySelectorAll("#nav .nb");
  for(var i=0;i<btns.length;i++){
    (function(el){
      var a = el.getAttribute("data-a");
      if(a==="run"){
        el.addEventListener("click", function(){
          running = !running; el.classList.toggle("hold", running);
        });
        return;
      }
      if(a==="reset"){
        el.addEventListener("click", function(){
          fov = FOV0; camera.fov = fov; camera.updateProjectionMatrix();
          player.pitch = -0.03;
          orbit.dist = 44; orbit.phi = 0.98;
        });
        return;
      }
      var press = function(e){ e.preventDefault(); nav[a]=1; el.classList.add("down"); };
      var release= function(){ nav[a]=0; el.classList.remove("down"); };
      el.addEventListener("pointerdown", press);
      el.addEventListener("pointerup", release);
      el.addEventListener("pointerleave", release);
      el.addEventListener("pointercancel", release);
      el.addEventListener("contextmenu", function(e){ e.preventDefault(); });
    })(btns[i]);
  }
  /* a button held while the window loses focus must not stick down */
  window.addEventListener("blur", function(){
    for(var k in nav) nav[k]=0;
    var d=document.querySelectorAll("#nav .nb.down");
    for(var j=0;j<d.length;j++) d[j].classList.remove("down");
  });
})();

/* ---------- UI ---------- */
function setMode(m){
  mode = m;
  document.getElementById("btnWalk").classList.toggle("on", m==="walk");
  document.getElementById("btnOrbit").classList.toggle("on", m==="orbit");
  document.getElementById("hint").style.display = (m==="walk" && !locked && !isTouch) ? "block" : "none";
  document.getElementById("cross").style.display = (m==="walk" && !isTouch) ? "block" : "none";
  document.getElementById("mobileHelp").style.display = (isTouch) ? "block" : "none";
  document.getElementById("navLbl").textContent = (m==="walk")
    ? "move · look & zoom" : "pan · orbit & zoom";
  fov = FOV0; camera.fov = fov; camera.updateProjectionMatrix();
  if(m==="orbit" && locked) document.exitPointerLock();
  if(m==="walk"){ gRoof.visible=true; gBQR.visible=(rearBlock==="bq"); gFF.visible=true;
    document.getElementById("btnRoof").classList.remove("on");
    document.getElementById("btnFloor").classList.remove("on"); }
}
function toggleBtn(id){ document.getElementById(id).click(); }
document.getElementById("btnWalk").onclick  = function(){ setMode("walk"); };
document.getElementById("btnOrbit").onclick = function(){ setMode("orbit"); };
document.getElementById("btnRoof").onclick = function(){
  var on = !this.classList.contains("on");
  this.classList.toggle("on", on);
  gRoof.visible = !on; gBQR.visible = !on && (rearBlock==="bq");
};
document.getElementById("btnFloor").onclick = function(){
  var on = !this.classList.contains("on");
  this.classList.toggle("on", on);
  gFF.visible = !on;
  if(on){ gRoof.visible=false; gBQR.visible=false; document.getElementById("btnRoof").classList.add("on"); }
};
document.getElementById("btnFurn").onclick = function(){
  var on = !this.classList.contains("on");
  this.classList.toggle("on", on);
  for(var i=0;i<FURN.length;i++) FURN[i].visible = !on;
};
/* ---------- BQ or sports court ---------- */
/* The two share the rear of the plot, so this is an either/or, not a pair of
   independent switches: turning one on turns the other off, along with its
   colliders, its floors and its entries in the jump-to list. */
var rearBlock = "bq";
function setRear(which){
  rearBlock = which;
  var sport = (which === "sport");
  gSport.visible = sport;
  gBQ.visible = !sport;
  gBQR.visible = !sport && !document.getElementById("btnRoof").classList.contains("on");
  if(gSolar) gSolar.visible = sport;
  CTOFF.sport = !sport;
  CTOFF.bq = sport;
  document.getElementById("btnBQ").classList.toggle("on", !sport);
  document.getElementById("btnSport").classList.toggle("on", sport);
  buildGoto();
  /* If you were standing inside whichever block just vanished, step out to the
     lawn rather than being left floating in the replacement. */
  if(player.z > 6.4 && player.z < 15.2 && player.x > -8.8 && player.x < 8.2){
    player.x = 0.60; player.y = 0; player.z = 5.20; player.yaw = 0;
  }
}
document.getElementById("btnBQ").onclick    = function(){ setRear("bq"); };
document.getElementById("btnSport").onclick = function(){ setRear("sport"); };

/* every distinct standard material in the scene, with its authored reflection
   strength, so the whole model's specular can be dimmed in one pass */
var ENVMATS = null;
function envDim(f){
  if(!ENVMATS){
    ENVMATS = [];
    var seen = [];
    scene.traverse(function(o){
      var m = o.material;
      if(m && m.isMeshStandardMaterial && seen.indexOf(m) < 0){
        seen.push(m);
        ENVMATS.push({m:m, e:(m.envMapIntensity!=null ? m.envMapIntensity : 1)});
      }
    });
  }
  for(var i=0;i<ENVMATS.length;i++) ENVMATS[i].m.envMapIntensity = ENVMATS[i].e * f;
}

var dusk=false;
document.getElementById("btnDusk").onclick = function(){
  dusk = !dusk;
  this.classList.toggle("on", dusk);
  if(dusk){
    sun.position.set(-38, 9, -14); sun.intensity=0.95; sun.color.set(0xffa863);
    scene.fog.color.set(0x2c3a4e); skyMat.uniforms.top.value.set(0x16233c);
    skyMat.uniforms.mid.value.set(0x4a5c78); skyMat.uniforms.bot.value.set(0xd88a4e);
    skyMat.uniforms.sunv.value.set(-0.92, 0.12, -0.34);
    skyMat.uniforms.sunc.value.set(0xffb173);
    renderer.toneMappingExposure = 1.14;
    /* the dusk sky is far too dim to light the scene through the environment map
       alone, so the fill lights carry it instead */
    amb.intensity = 0.16; hemi.intensity = 0.30; amb.color.set(0x8ea6c8);
    hemi.color.set(0x3c4c68); hemi.groundColor.set(0x241d18);
  } else {
    sun.position.set(26,42,-20); sun.intensity=1.55; sun.color.set(0xfff2d8);
    scene.fog.color.set(0xcfe0ea); skyMat.uniforms.top.value.set(0x2f7fc4);
    skyMat.uniforms.mid.value.set(0x9fc9e6); skyMat.uniforms.bot.value.set(0xe9e2d2);
    skyMat.uniforms.sunv.value.set(0.5, 0.7, -0.4);
    skyMat.uniforms.sunc.value.set(0xfff0d0);
    renderer.toneMappingExposure = 1.02;
    amb.intensity = 0.17; hemi.intensity = 0.30; amb.color.set(0xffffff);
    hemi.color.set(0xbfe0ff); hemi.groundColor.set(0x6b6350);
  }
  /* The environment map stays the daytime one. Regenerating the PMREM from a
     dark sky produces a target that renders every lit surface black in r128,
     so the reflections are dimmed instead of rebuilt - the glazing keeps a
     slightly optimistic sky in it after dark, which is the cheaper error. */
  envDim(dusk ? 0.28 : 1.0);
};

/* ---------- teleports ---------- */
var SPOTS = [
  ["Street view (outside the gate)",  -0.40, 0,    -22.00, Math.PI],
  ["At the gate",                     -1.05, 0,    -15.60, Math.PI],
  ["Driveway & carport",              -2.80, 0,    -13.90, -Math.PI/2],
  ["Front porch",                      0.20, GF,   -10.50, Math.PI],
  ["Entrance foyer",                   0.17, GF,    -8.36, Math.PI],
  ["Living room",                     -5.93, GF,    -9.36, 4.497],
  ["Dining room",                     -2.83, GF,    -1.86, 1.422],
  ["Kitchen",                          1.93, GF,    -1.96, -Math.PI/2],
  ["Study / guest room",               4.53, GF,    -7.96, Math.PI],
  ["Rear lobby / breakfast",           0.12, GF,    -1.26, Math.PI],
  ["Foot of the stairs",               0.17, GF,    -7.76, Math.PI],
  ["Upstairs gallery",                 0.12, FF,    -2.56, 0],
  ["Master bedroom",                  -2.98, FF,    -5.86, 0.262],
  ["Walk-in closet",                  -5.53, FF,    -3.56, 0],
  ["Master bathroom",                 -2.38, FF,    -3.16, 0.785],
  ["Bedroom 2",                       -2.38, FF,    -1.06, -Math.PI/2],
  ["Bedroom 3",                        2.17, FF,    -9.26, -Math.PI/2],
  ["Bedroom 4",                        2.17, FF,    -2.71, -Math.PI/2],
  ["Family lounge",                    0.17, FF,    -0.81, 0.000],
  ["Front balcony",                   -4.00, FF,   -10.60, 0.15],
  ["Rear terrace",                     3.40, 0,      4.85, 1.467],
  ["Rear lawn (looking at the house)", 0.60, 0,      6.20, 0.300],
  ["Gazebo",                          -6.60, 0.22,   6.30,-0.900],
  ["BQ unit A (parlour)",             -4.58, BF,     9.84, 0.262, "bq"],
  ["BQ unit A (bedroom)",             -2.83, BF,    11.24, 0.524, "bq"],
  ["Indoor games room",                0.00, BF,     9.34, 0,     "bq"],
  ["BQ unit B (parlour)",              4.97, BF,     9.64, 0,     "bq"],
  /* court viewpoints - only listed when the court is the block that is up */
  ["Court, from the baseline",        -7.10, 0.12,  10.90, -Math.PI/2, "sport"],
  ["Court, under the hoop",           -5.20, 0.12,  10.90,  Math.PI/2, "sport"],
  ["Court, at the net",                0.60, 0.12,  10.90,  Math.PI/2, "sport"],
  ["Court, from the goal end",         6.40, 0.12,  10.90,  Math.PI/2, "sport"],
  ["Courtside bench",                 -4.60, 0,      4.85,  Math.PI,   "sport"],
  ["Court, from the terrace",          5.60, 0,      4.30,  Math.PI,   "sport"],
  ["Utility yard (gen. & tanks)",     -2.30, 0,     15.70, -Math.PI/2]
];
function buildGoto(){
  var sel = document.getElementById("goto");
  while(sel.options.length > 1) sel.remove(1);
  SPOTS.forEach(function(s,i){
    if(s[5] && CTOFF[s[5]]) return;
    var o=document.createElement("option"); o.value=i; o.textContent=s[0]; sel.appendChild(o);
  });
}
(function(){
  var sel = document.getElementById("goto");
  buildGoto();
  sel.onchange = function(){
    var s = SPOTS[parseInt(this.value,10)];
    if(!s) return;
    player.x=s[1]; player.y=s[2]; player.z=s[3]; player.yaw=s[4]; player.pitch=-0.03;
    orbit.tx=s[1]; orbit.ty=s[2]+2.0; orbit.tz=s[3];
    if(mode==="orbit") orbit.dist=Math.min(orbit.dist, 26);
    this.selectedIndex=0; this.blur();
  };
})();

/* info panel */
function openInfo(){ document.getElementById("infoPanel").classList.add("open"); if(locked) document.exitPointerLock(); }
function closeInfo(){ document.getElementById("infoPanel").classList.remove("open"); }
document.getElementById("btnInfo").onclick = openInfo;
document.getElementById("infoClose").onclick = closeInfo;

/* ---------- loop ---------- */
var clock = new T.Clock();
var bob = 0;
function animate(){
  requestAnimationFrame(animate);
  var dt = Math.min(0.05, clock.getDelta());


  if(mode==="walk"){
    var fwd=0, strafe=0;
    if(keys.KeyW||keys.ArrowUp)    fwd += 1;
    if(keys.KeyS||keys.ArrowDown)  fwd -= 1;
    if(keys.KeyA||keys.ArrowLeft)  strafe -= 1;
    if(keys.KeyD||keys.ArrowRight) strafe += 1;
    if(touchMove.active){ fwd += -touchMove.dy/55; strafe += touchMove.dx/55; }
    if(nav.fwd)   fwd += 1;
    if(nav.back)  fwd -= 1;
    if(nav.left)  strafe -= 1;
    if(nav.right) strafe += 1;
    if(nav.tl||nav.tr) player.yaw += (nav.tl - nav.tr) * 1.7 * dt;
    if(nav.up||nav.dn) player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch + (nav.up - nav.dn)*1.2*dt));
    if(nav.zin||nav.zout){
      fov = Math.max(24, Math.min(88, fov - (nav.zin - nav.zout)*34*dt));
      camera.fov = fov; camera.updateProjectionMatrix();
    }
    var speed = (keys.ShiftLeft||keys.ShiftRight||running) ? 5.4 : 2.3;
    var len = Math.hypot(fwd,strafe);
    if(len>1){ fwd/=len; strafe/=len; }
    var sinY=Math.sin(player.yaw), cosY=Math.cos(player.yaw);
    var vx = (-sinY*fwd + cosY*strafe) * speed * dt;
    var vz = (-cosY*fwd - sinY*strafe) * speed * dt;

    if(vx!==0){ var ry = tryMove(player.x+vx, player.z, player.y);
                if(ry!==null){ player.x += vx; player.y = ry; } }
    if(vz!==0){ var rz = tryMove(player.x, player.z+vz, player.y);
                if(rz!==null){ player.z += vz; player.y = rz; } }
    player.x = Math.max(-34, Math.min(34, player.x));
    player.z = Math.max(-30, Math.min(24, player.z));

    var target = floorAt(player.x, player.z, player.y);
    if(target > player.y){ player.y = Math.min(target, player.y + Math.max(0.02, (target-player.y))*Math.min(1, dt*16)); if(target-player.y<0.02) player.y=target; }
    else { player.vy -= 22*dt; player.y += player.vy*dt;
           if(player.y <= target){ player.y = target; player.vy = 0; } }
    if(Math.abs(target-player.y)<0.001) player.vy=0;

    if(len>0.05) bob += dt*speed*2.2; else bob *= 0.9;
    camera.position.set(player.x, player.y + EYE + Math.sin(bob)*0.028, player.z);
    camera.rotation.set(0,0,0);
    camera.rotateY(player.yaw);
    camera.rotateX(player.pitch);
  } else {
    var sp = Math.sin(orbit.phi), cp = Math.cos(orbit.phi);
    camera.position.set(
      orbit.tx + orbit.dist*sp*Math.sin(orbit.theta),
      orbit.ty + orbit.dist*cp,
      orbit.tz + orbit.dist*sp*Math.cos(orbit.theta)
    );
    camera.up.set(0,1,0);
    camera.lookAt(orbit.tx, orbit.ty, orbit.tz);
    if(keys.KeyW||keys.ArrowUp)   orbit.dist = Math.max(6, orbit.dist - 20*dt);
    if(keys.KeyS||keys.ArrowDown) orbit.dist = Math.min(160, orbit.dist + 20*dt);
    if(keys.KeyA||keys.ArrowLeft)  orbit.theta += 0.6*dt;
    if(keys.KeyD||keys.ArrowRight) orbit.theta -= 0.6*dt;
    /* the same pad drives the dollhouse: pan the pivot, orbit it, zoom it */
    if(nav.zin)  orbit.dist = Math.max(6,   orbit.dist - orbit.dist*1.1*dt);
    if(nav.zout) orbit.dist = Math.min(160, orbit.dist + orbit.dist*1.1*dt);
    if(nav.tl)   orbit.theta += 0.85*dt;
    if(nav.tr)   orbit.theta -= 0.85*dt;
    if(nav.up)   orbit.phi = Math.max(0.12, orbit.phi - 0.7*dt);
    if(nav.dn)   orbit.phi = Math.min(1.50, orbit.phi + 0.7*dt);
    var pf = (nav.fwd - nav.back), ps = (nav.right - nav.left);
    if(pf||ps){
      var pv = orbit.dist * 0.42 * dt;
      orbit.tx += (-Math.sin(orbit.theta)*pf + Math.cos(orbit.theta)*ps) * pv;
      orbit.tz += (-Math.cos(orbit.theta)*pf - Math.sin(orbit.theta)*ps) * pv;
      orbit.tx = Math.max(-40, Math.min(40, orbit.tx));
      orbit.tz = Math.max(-40, Math.min(40, orbit.tz));
    }
  }

  sun.position.set(camera.position.x + (dusk?-38:26), (dusk?9:42), camera.position.z + (dusk?-14:-20));
  sun.target.position.set(camera.position.x, 0, camera.position.z);
  sun.target.updateMatrixWorld();

  var rn = (mode==="walk") ? zoneAt(player.x, player.z, player.y) : "Dollhouse view";
  var el = document.getElementById("where");
  if(el.textContent !== rn) el.textContent = rn;

  var cmp = document.getElementById("needle");
  var ang = (mode==="walk") ? player.yaw : (orbit.theta + Math.PI);
  cmp.style.transform = "rotate(" + (ang*180/Math.PI) + "deg)";

  renderer.render(scene, camera);
  glassWatch(dt);
}

/* Refracting glass costs an extra pass over the whole scene every frame. On a
   desktop GPU that is free; on a mid-range phone it is not. Watch the first
   four seconds of real frames and, if they are not keeping up, drop the same
   material back to a plain reflective pane in place - no mesh churn, no
   reload, and the model stays usable rather than becoming a slideshow. */
/* Refracting glass on or off, in place. `G` flips it by hand: the automatic
   downgrade below is a guess about your hardware, and you are entitled to
   overrule it in either direction. */
function setGlass(on){
  var g = MAT.glass;
  gw.done = true;                       /* a manual choice ends the watchdog */
  if(on){
    g.transmission = 0.92; g.transparent = false; g.envMapIntensity = 1.7;
  } else {
    g.transmission = 0; g.transparent = true; g.opacity = 0.30;
    g.roughness = 0.06; g.envMapIntensity = 2.6;
  }
  g.needsUpdate = true;
  var el = document.getElementById("where");
  if(el) el.textContent = on ? "refracting glass on" : "refracting glass off";
}
var gw = {t:0, n:0, done:false};
function glassWatch(dt){
  if(gw.done) return;
  /* A backgrounded tab throttles rAF to a crawl, which looks exactly like a
     slow GPU. Only judge frames drawn while the page is actually on screen,
     and never on fewer than 40 of them. */
  if(document.hidden || dt<=0 || dt>0.25){ gw.t=0; gw.n=0; return; }
  gw.t += dt; gw.n++;
  if(gw.t < 4.0 || gw.n < 40) return;
  gw.done = true;
  if(gw.n/gw.t >= 22) return;
  var g = MAT.glass;
  g.transmission = 0;
  g.transparent  = true;
  g.opacity      = 0.30;
  g.roughness    = 0.06;
  g.envMapIntensity = 2.6;
  g.needsUpdate  = true;
}

window.addEventListener("resize", function(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setMode("walk");
document.getElementById("loading").style.display = "none";
animate();

/* debug handle */
window.__J = { scene:scene, camera:camera, renderer:renderer, player:player, orbit:orbit,
  setMode:function(m){ setMode(m); }, zoneAt:zoneAt, floorAt:floorAt, collides:collides,
  COLLIDERS:COLLIDERS, FLOORS:FLOORS,
  groups:{gSite:gSite,gGF:gGF,gFF:gFF,gRoof:gRoof,gBQ:gBQ,gBQR:gBQR,gSport:gSport},
  setRear:setRear, rear:function(){ return rearBlock; }, CTOFF:CTOFF, MAT:MAT, SPOTS:SPOTS,
  hx:hx, hz:hz, bxf:bxf, bzf:bzf, EYE:EYE };
