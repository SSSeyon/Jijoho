"use strict";
/* ============================================================
   PART 6  -  camera modes, controls, UI
   ============================================================ */

/* Every geometry in the model now has a second UV set, which is what the
   packed AO channel is sampled through. Done here, once, after parts 2-5
   have finished adding meshes. */
fixUV2(scene);

/* The court and the garden occupy the same ground, so exactly one is up at a
   time. Start with the garden: it is the default reading of the plot, and the
   court is the thing you switch on. */
gSport.visible = false;
CTOFF.sport = true;

/* ---------- static geometry merge ----------
   The model was drawing 1,991 objects to put 93,000 triangles on screen -
   about fifty triangles per draw call. Nothing here is GPU-bound; it is all
   per-object overhead, paid once for the beauty pass and again for the shadow
   pass. That is why switching on a 1024 shadow map used to halve the frame
   rate, and why the Ultra preset was unusable.

   The cause is the way the model is authored: addBox() reuses one shared unit
   cube and scales it, so a wall, a step and a table leg are three draw calls
   sharing a geometry. Cheap to write, expensive to draw. This pass bakes each
   mesh's world matrix into a copy of its geometry and merges everything that
   shares a material into one mesh.

   What is deliberately left alone:
     - transparent materials, because merging them into one object destroys the
       per-object depth sort they rely on;
     - anything in a nested Group, which is merged separately into its own
       object so that group's independent visibility still works.
   Furniture is merged but bucketed separately, so the Empty toggle still has
   objects of its own to hide.

   The cost is memory - a shared cube becomes N copies of 24 vertices - and the
   loss of per-object frustum culling. At this scene size both are free. */
function mergeStatics(){
  if(!THREE.BufferGeometryUtils || !THREE.BufferGeometryUtils.mergeBufferGeometries) return null;

  /* Furniture is merged too, but kept in separate buckets from the building, so
     the Empty toggle still has something to switch off. It works because no
     individual chair ever moves - only the whole set is ever hidden at once.
     FURN is rebuilt at the end to hold the merged meshes instead of the 784
     originals, which is where most of the draw calls actually were. */
  var isFurn = new Set ? new Set(FURN) : null;
  function furnish(m){ return isFurn ? isFurn.has(m) : FURN.indexOf(m) >= 0; }
  var newFurn = [];

  var before = 0, after = 0;

  function mergeDomain(root){
    var buckets = {};

    (function walk(o){
      for(var i=0; i<o.children.length; i++){
        var c = o.children[i];
        /* Imported .glb models and anything that moves at run time opt out of
           the merge: merging bakes world transforms and freezes the mesh, which
           is exactly wrong for a car that has to drive out of the gate. */
        if(c.isGroup){ if(!c.userData.noMerge) mergeDomain(c); continue; }
        if(!c.isMesh){ continue; }
        before++;
        var mat = c.material, fu = furnish(c);
        if(!mat || mat.transparent || Array.isArray(mat) || c.children.length ||
           !c.geometry || !c.geometry.attributes || !c.geometry.attributes.position){
          after++;
          if(fu) newFurn.push(c);
          continue;
        }
        /* Shadow flags are per-object, not per-material, so they have to be in
           the key or a merge would silently change what casts. Indexed and
           non-indexed geometry cannot merge together either, and mixing them
           makes mergeBufferGeometries return null rather than throw. */
        var key = (fu?"F":"S") + mat.uuid + "|" + (c.castShadow?1:0) + "|" + (c.receiveShadow?1:0) +
                  "|" + (c.renderOrder||0) + "|" + (c.geometry.index?1:0) +
                  "|" + Object.keys(c.geometry.attributes).sort().join(",");
        (buckets[key] || (buckets[key] = {mat:mat, furn:fu, cast:c.castShadow, recv:c.receiveShadow,
                                          order:c.renderOrder||0, list:[]})).list.push(c);
      }
    })(root);

    var keys = Object.keys(buckets), k, b, i;
    for(k=0; k<keys.length; k++){
      b = buckets[keys[k]];
      if(b.list.length < 2){
        after += b.list.length;
        if(b.furn) for(i=0; i<b.list.length; i++) newFurn.push(b.list[i]);
        continue;
      }
      var geos = [];
      for(i=0; i<b.list.length; i++){
        var m = b.list[i];
        m.updateWorldMatrix(true, false);
        var g = m.geometry.clone();
        g.applyMatrix4(m.matrixWorld);
        /* uv2 is usually the very same BufferAttribute object as uv; clone()
           keeps that aliasing, and the merge needs them to be separate arrays. */
        if(g.attributes.uv && g.attributes.uv2 === g.attributes.uv){
          g.setAttribute("uv2", g.attributes.uv.clone());
        }
        geos.push(g);
      }
      var merged = null;
      try { merged = THREE.BufferGeometryUtils.mergeBufferGeometries(geos, false); }
      catch(e){ merged = null; }
      for(i=0; i<geos.length; i++) geos[i].dispose();
      if(!merged){
        after += b.list.length;
        if(b.furn) for(i=0; i<b.list.length; i++) newFurn.push(b.list[i]);
        continue;
      }

      for(i=0; i<b.list.length; i++) b.list[i].parent.remove(b.list[i]);
      var mm = new T.Mesh(merged, b.mat);
      mm.castShadow = b.cast; mm.receiveShadow = b.recv; mm.renderOrder = b.order;
      mm.matrixAutoUpdate = false;      /* baked in world space, and static */
      root.add(mm);
      after++;
      if(b.furn) newFurn.push(mm);
    }
  }

  [gSite, gGF, gFF, gRoof, gSport, gGarden].forEach(mergeDomain);
  FURN.length = 0;
  for(var n=0; n<newFurn.length; n++) FURN.push(newFurn[n]);
  return {before:before, after:after, furn:FURN.length};
}
var MERGED = mergeStatics();

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
  Z("Guest bedroom", GF, hx(8.55),hz(0), hx(13.55),hz(4.6)),
  Z("Guest cloakroom", GF, hx(8.55),hz(4.6), hx(10.4),hz(6.4)),
  Z("Store", GF, hx(10.4),hz(4.6), hx(13.55),hz(6.4)),
  Z("Kitchen", GF, hx(8.55),hz(6.4), hx(13.55),hz(10.2)),
  Z("Pantry / laundry", GF, hx(8.55),hz(10.2), hx(13.55),hz(11.5)),
  Z("Front porch", GF, hx(0.6),hz(-2.2), hx(12.95),hz(0)),
  /* first floor */
  Z("Family room", FF, hx(0),hz(0), hx(6.5),hz(2.6)),
  Z("Study / library", FF, hx(0),hz(2.6), hx(5.0),hz(7.0)),
  Z("Upstairs corridor", FF, hx(6.5),hz(0), hx(8.3),hz(7.36)),
  Z("Upstairs landing", FF, hx(5.0),hz(7.36), hx(8.3),hz(10.2)),
  Z("Master bathroom", FF, hx(0),hz(7.0), hx(2.8),hz(10.2)),
  Z("Walk-in closet", FF, hx(2.8),hz(7.0), hx(5.0),hz(10.2)),
  Z("Master bedroom", FF, hx(0),hz(10.2), hx(8.3),hz(13.9)),
  Z("Bedroom 3", FF, hx(8.3),hz(0), hx(13.55),hz(4.6)),
  Z("Linen / plant store", FF, hx(8.3),hz(4.6), hx(10.8),hz(6.9)),
  Z("Bedroom 3 en-suite", FF, hx(10.8),hz(4.6), hx(13.55),hz(6.9)),
  Z("Bedroom 2 en-suite", FF, hx(8.3),hz(6.9), hx(10.8),hz(9.2)),
  Z("Bedroom 2 walk-in", FF, hx(10.8),hz(6.9), hx(13.55),hz(9.2)),
  Z("Bedroom 2", FF, hx(8.3),hz(9.2), hx(13.55),hz(13.9)),
  Z("Front balcony", FF, hx(0.6),hz(-2.2), hx(12.95),hz(0)),
  /* games tent - in the garden, so it goes with the garden */
  Z("Games tent", 0, -8.40, 11.10, -3.20, 14.70),
  /* outdoors */
  Z("Driveway / carport", 0, -9.6,-16.7, -1.1,-11.2),
  Z("Front garden", 0, 0.2,-16.7, 9.7,-11.2),
  Z("Rear terrace", 0, -1.3,1.7, 4.9,4.2),
  Z("Rear lawn", 0, -9.7,1.7, 9.7,6.7),
  Z("Utility yard", 0, -9.7,15.0, 9.7,16.8),
  Z("West garden walk", 0, -9.7,-11.3, -6.8,7.8),
  Z("East service path", 0, 6.8,-11.3, 9.7,14.7)
];
/* The rear of the plot reads differently depending on which option is up, so
   the zones for each are tagged and filtered the same way the colliders are. */
/* Listed broadest first: each unshift pushes in front of the last, so the
   general "Rear garden" ends up behind the specific places inside it and the
   more specific name wins. Same ordering trick as the court zones below. */
[ Z("Rear garden", 0.012, -9.2,6.7, 9.2,15.0),
  Z("Garden path", 0, 5.9,6.7, 8.1,15.0),
  Z("Kitchen garden", 0, -8.3,13.2, 3.2,15.0),
  Z("Outdoor kitchen", 0, 0.3,6.55, 4.9,9.35),
  Z("Pergola", 0.10, -7.7,7.5, -2.7,11.8)
].forEach(function(Zi){ Zi.t = "garden"; ZONES.unshift(Zi); });
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
  if(m==="walk"){ gRoof.visible=true; gFF.visible=true;
    document.getElementById("btnRoof").classList.remove("on");
    document.getElementById("btnFloor").classList.remove("on"); }
}
function toggleBtn(id){ document.getElementById(id).click(); }
document.getElementById("btnWalk").onclick  = function(){ setMode("walk"); };
document.getElementById("btnOrbit").onclick = function(){ setMode("orbit"); };
document.getElementById("btnRoof").onclick = function(){
  var on = !this.classList.contains("on");
  this.classList.toggle("on", on);
  gRoof.visible = !on;
};
document.getElementById("btnFloor").onclick = function(){
  var on = !this.classList.contains("on");
  this.classList.toggle("on", on);
  gFF.visible = !on;
  if(on){ gRoof.visible=false; document.getElementById("btnRoof").classList.add("on"); }
};
document.getElementById("btnFurn").onclick = function(){
  var on = !this.classList.contains("on");
  this.classList.toggle("on", on);
  for(var i=0;i<FURN.length;i++) FURN[i].visible = !on;
};
/* ---------- garden or sports court ---------- */
/* The two share the rear of the plot, so this is an either/or, not a pair of
   independent switches: turning one on turns the other off, along with its
   colliders, its floors and its entries in the jump-to list. The games
   pavilion is outside the switch entirely - it is there in both. */
var rearBlock = "garden";
function setRear(which){
  rearBlock = which;
  var sport = (which === "sport");
  gSport.visible = sport;
  gGarden.visible = !sport;
  CTOFF.sport = !sport;
  CTOFF.garden = sport;
  document.getElementById("btnGarden").classList.toggle("on", !sport);
  document.getElementById("btnSport").classList.toggle("on", sport);
  buildGoto();
  /* If you were standing inside whichever block just vanished, step out to the
     lawn rather than being left floating in the replacement. */
  if(player.z > 6.4 && player.z < 15.2 && player.x > -8.8 && player.x < 8.2){
    player.x = 0.60; player.y = 0; player.z = 5.20; player.yaw = 0;
  }
}
document.getElementById("btnGarden").onclick = function(){ setRear("garden"); };
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

/* ---------- graphics quality ----------
   One place where every expensive setting is named and priced. Without this
   the model has to be built for the weakest machine that might open it, which
   means nobody sees what it can actually do; with it the phone gets a version
   that runs and the desktop gets the one worth looking at. Everything here is
   applied in place - no rebuild, no reload. */
var QUALITY = {
  low:   { pr:0.70, shadow:0,    soft:1, glass:false, aniso:2,  post:false, ao:false, dof:false, foliage:0.45 },
  medium:{ pr:1.00, shadow:1024, soft:2, glass:false, aniso:4,  post:false, ao:false, dof:false, foliage:0.70 },
  high:  { pr:1.50, shadow:2048, soft:2, glass:true,  aniso:8,  post:true,  ao:false, dof:false, foliage:1.00 },
  ultra: { pr:2.00, shadow:4096, soft:3, glass:true,  aniso:16, post:true,  ao:true,  dof:true,  foliage:1.00 }
};
var QNAME = "high";
var Q = QUALITY.high;
/* every distinct texture in the model, collected once, so filtering can be
   changed across the whole scene without hunting through the material table */
var ALLTEX = null;
function collectTex(){
  if(ALLTEX) return ALLTEX;
  ALLTEX = []; var seen = [];
  var slots = ["map","normalMap","roughnessMap","metalnessMap","aoMap","alphaMap","emissiveMap"];
  scene.traverse(function(o){
    var ms = o.material; if(!ms) return;
    if(!ms.length) ms = [ms];
    for(var i=0;i<ms.length;i++){
      for(var s=0;s<slots.length;s++){
        var t = ms[i][slots[s]];
        if(t && seen.indexOf(t) < 0){ seen.push(t); ALLTEX.push(t); }
      }
    }
  });
  return ALLTEX;
}
function setQuality(name){
  var q = QUALITY[name]; if(!q) return;
  QNAME = name; Q = q;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, q.pr));
  renderer.setSize(window.innerWidth, window.innerHeight);

  if(q.shadow === 0){
    renderer.shadowMap.enabled = false;
    sun.castShadow = false;
  } else {
    renderer.shadowMap.enabled = true;
    sun.castShadow = true;
    if(sun.shadow.mapSize.x !== q.shadow){
      /* the depth target is allocated at the old size; it has to be released
         before three will build a new one */
      if(sun.shadow.map){ sun.shadow.map.dispose(); sun.shadow.map = null; }
      sun.shadow.mapSize.set(q.shadow, q.shadow);
    }
    sun.shadow.radius = q.soft;
  }
  renderer.shadowMap.needsUpdate = true;

  setGlass(q.glass, true);
  applyPost(q);
  /* The presets change the pixel ratio, so the composer targets have to be
     resized with the canvas. Without this, switching preset leaves every post
     pass rendering at the previous resolution until the next window resize. */
  if(composer) composer.setSize(window.innerWidth, window.innerHeight);

  var tx = collectTex(), a = Math.min(q.aniso, ANISO);
  for(var i=0;i<tx.length;i++){
    if(tx[i].anisotropy !== a){ tx[i].anisotropy = a; tx[i].needsUpdate = true; }
  }

  var sel = document.getElementById("qual");
  if(sel && sel.value !== name) sel.value = name;
}

/* ---------- time of day ----------
   Replaces the old two-state Dusk toggle. Dragging is cheap: the sun, the sky
   and the fill lights all move on every input event. Rebuilding the reflection
   probe is not, so that waits for you to let go of the slider. */
var todT = null;
function wireTOD(){
  var sl = document.getElementById("tod");
  var lb = document.getElementById("todLbl");
  if(!sl) return;
  function label(h){
    var hh = Math.floor(h), mm = Math.round((h-hh)*60);
    if(mm === 60){ hh++; mm = 0; }
    return (hh<10?"0":"") + hh + ":" + (mm<10?"0":"") + mm;
  }
  function paint(rebuild){
    var h = parseFloat(sl.value);
    setSky(h, rebuild);
    if(lb) lb.textContent = label(h);
  }
  sl.addEventListener("input",  function(){ paint(false); });
  sl.addEventListener("change", function(){ paint(true); });
  sl.value = DAYH;
  paint(true);
}

/* ---------- post-processing ----------
   Up to now the scene went straight to the canvas, which is why it always
   looked like a viewport rather than a photograph. This puts a composer in
   front of it:

     SSAO or Render  ->  Bloom  ->  Bokeh  ->  Grade  ->  SMAA  ->  screen

   Two things about the colour pipeline are worth stating, because getting
   them wrong is silent and looks merely "a bit off". First, three only
   applies outputEncoding when it renders to the canvas, so once the scene is
   rendered into a target it is LINEAR - the grade pass has to do the
   linear-to-sRGB conversion itself, and it is the only pass allowed to.
   Second, the canvas MSAA that antialias:true gives us does not apply to
   render targets, so the composer would lose every antialiased edge if SMAA
   were not on the end of the chain. */

/* A gentle photographic finish. None of this is dramatic on its own: a slight
   S-curve, a touch of saturation, corner falloff and a whisper of grain. Taken
   together they are most of the difference between a render and a screenshot,
   which is why they belong at the end rather than baked into the materials. */
var GradeShader = {
  uniforms: {
    tDiffuse:{value:null}, vig:{value:0.30}, grain:{value:0.020},
    sat:{value:1.06}, con:{value:0.16}, uTime:{value:0.0}
  },
  vertexShader: [
    "varying vec2 vUv;",
    "void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }"
  ].join("\n"),
  fragmentShader: [
    "uniform sampler2D tDiffuse; uniform float vig; uniform float grain;",
    "uniform float sat; uniform float con; uniform float uTime;",
    "varying vec2 vUv;",
    "vec3 lin2srgb(vec3 c){",
    "  vec3 lo = c * 12.92;",
    "  vec3 hi = 1.055 * pow(max(c, vec3(0.0)), vec3(0.41666)) - 0.055;",
    "  return mix(hi, lo, step(c, vec3(0.0031308)));",
    "}",
    "void main(){",
    "  vec3 c = texture2D(tDiffuse, vUv).rgb;",
    "  c = mix(c, c*c*(3.0-2.0*c), con);",              /* smoothstep as an S-curve */
    "  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));",
    "  c = mix(vec3(l), c, sat);",
    "  vec2 q = vUv - 0.5;",
    "  c *= clamp(1.0 - dot(q,q) * vig, 0.0, 1.0);",
    "  c = lin2srgb(c);",
    /* grain after the encoding, so it stays even across the tonal range
       instead of disappearing in the highlights */
    "  float n = fract(sin(dot(vUv + fract(uTime), vec2(12.9898, 78.233))) * 43758.5453);",
    "  c += (n - 0.5) * grain;",
    "  gl_FragColor = vec4(c, 1.0);",
    "}"
  ].join("\n")
};

var composer=null, pRender=null, pSSAO=null, pBloom=null, pBokeh=null, pGrade=null, pSMAA=null;
var POSTOK = (typeof THREE.EffectComposer === "function");

function buildComposer(){
  if(!POSTOK || composer) return;
  var w = window.innerWidth, h = window.innerHeight;
  composer = new T.EffectComposer(renderer);
  composer.setSize(w, h);

  pRender = new T.RenderPass(scene, camera);

  /* SSAO renders the scene itself - beauty, normals and depth - so it stands
     in for the render pass rather than following it. That is three passes over
     the model instead of one, which is why it is an Ultra-only setting. What
     it buys is the darkening in every internal corner and where furniture
     meets floor: the texture-space AO map cannot know about geometry, so
     without this everything appears to hover very slightly. */
  pSSAO = new T.SSAOPass(scene, camera, w, h);
  /* These three are easy to get silently wrong. kernelRadius is in metres -
     the reach of the occlusion, so roughly the width of the shadow wanted in a
     corner. minDistance and maxDistance are NOT metres: they are differences
     in linear depth normalised across the camera's near-to-far range, and with
     far = 500 that makes one metre equal 1/500 = 0.002. The three.js defaults
     assume a scene hundreds of units across; carried over unchanged they
     reject every real depth difference in a house and the AO buffer comes out
     pure white, which is exactly what happened on the first attempt. */
  pSSAO.kernelRadius = 0.90;      /* metres */
  pSSAO.minDistance  = 0.00003;   /* ~15 mm - under this it is depth noise */
  pSSAO.maxDistance  = 0.0032;    /* ~1.6 m - past this it is not contact */

  /* Deliberately weak. Bloom's job here is the sun catching a roof edge and
     the lamps at dusk, not a glow filter over the whole model. */
  pBloom = new T.UnrealBloomPass(new T.Vector2(w, h), 0.26, 0.62, 0.92);

  /* Depth of field belongs in the dollhouse view and nowhere else: blur in
     first person fights your ability to see where you are walking. */
  pBokeh = new T.BokehPass(scene, camera, { focus:30.0, aperture:0.00060, maxblur:0.007, width:w, height:h });
  pBokeh.enabled = false;

  pGrade = new T.ShaderPass(GradeShader);
  pSMAA  = new T.SMAAPass(w, h);
  pSMAA.renderToScreen = true;

  composer.addPass(pRender);
  composer.addPass(pSSAO);
  composer.addPass(pBloom);
  composer.addPass(pBokeh);
  composer.addPass(pGrade);
  composer.addPass(pSMAA);
}

/* Which passes are live for the current preset. Passes are never added or
   removed after the chain is built - flipping `enabled` is free, rebuilding
   the composer is not. */
function applyPost(q){
  if(!POSTOK) return;
  if(q.post) buildComposer();
  if(!composer) return;
  pRender.enabled = !q.ao;          /* SSAO does its own beauty render */
  pSSAO.enabled   = !!q.ao;
  pBloom.enabled  = true;
  pGrade.enabled  = true;
  pSMAA.enabled   = true;
}

/* ---------- teleports ---------- */
/* Every interior position below was found by sweeping the room for the point
   furthest from any collider, then given a heading that faces the thing worth
   looking at. They were all recomputed after the house moved 2.52 m north -
   the previous set was measured off the old position and half of them ended
   up standing inside a wall. */
var SPOTS = [
  ["Street view (outside the gate)",  -0.40, 0,    -22.00, Math.PI],
  ["At the gate",                     -1.05, 0,    -15.60, Math.PI],
  ["Driveway & carport",              -4.16, 0,    -10.40, Math.PI],
  ["Front porch",                      0.62, GF,    -9.24, Math.PI],
  ["Entrance foyer",                  -0.28, GF,    -5.74, Math.PI],
  ["Living room",                     -4.57, GF,    -0.54, Math.PI],
  ["Dining room",                     -2.28, GF,     2.56, Math.PI/2],
  ["Kitchen",                          2.03, GF,     1.16, -Math.PI/2],
  ["Guest bedroom",                    3.52, GF,    -4.14, -Math.PI/2],
  ["Rear lobby / breakfast",           0.62, GF,     1.26, 0],
  ["Foot of the stairs",               0.62, GF,    -3.84, Math.PI],
  ["Family room",                     -5.88, FF,    -6.34, -Math.PI/2],
  ["Front balcony",                    1.12, FF,    -8.34, Math.PI],
  ["Study / library",                 -3.27, FF,    -1.64, Math.PI/2],
  ["Upstairs corridor",                0.72, FF,    -1.54, 0],
  ["Upstairs landing",                -0.38, FF,     1.46, 0],
  ["Master bedroom",                  -0.08, FF,     4.16, Math.PI/2],
  ["Walk-in closet",                  -2.87, FF,     0.86, 0],
  ["Master bathroom",                 -5.78, FF,     1.16, Math.PI],
  ["Bedroom 2",                        2.52, FF,     5.66, Math.PI],
  ["Bedroom 3",                        4.72, FF,    -6.64, 0],
  ["Rear terrace (covered)",           3.16, 0,      5.56, 0],
  ["Rear lawn (looking at the house)",-1.68, 0,      8.72, Math.PI],
  /* garden viewpoints - only listed when the garden is up */
  ["Games tent (at the table)",       -5.32, 0.08,  11.40, 0,     "garden"],
  ["Games tent (from the lawn)",      -3.10, 0,     10.60, 2.40,  "garden"],
  ["Pergola",                         -3.68, 0.10,   9.24, 3.10,  "garden"],
  ["Outdoor kitchen",                  3.56, 0,      7.86, 0.10,  "garden"],
  ["Kitchen garden (raised beds)",    -2.14, 0,     12.52, 2.95,  "garden"],
  ["Garden path (looking back)",       7.00, 0,     10.40, 2.95,  "garden"],
  /* court viewpoints - only listed when the court is up */
  ["Court, from the baseline",         6.28, 0.12,   7.64, 0,          "sport"],
  ["Court, under the hoop",           -5.20, 0.12,  10.90,  Math.PI/2, "sport"],
  ["Court, at the net",                0.60, 0.12,  10.90,  Math.PI/2, "sport"],
  ["Court, from the goal end",         6.40, 0.12,  10.90,  Math.PI/2, "sport"],
  ["Courtside bench",                 -2.40, 0,      6.10,  0,         "sport"],
  ["Court, from the terrace",         -2.00, 0.12,   7.98,  0,         "sport"],
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
/* ============================================================
   GATE + VEHICLE MOVEMENT

   The point of this is not the animation. It is that the question "can you
   actually get three cars in and out of this compound" has a demonstrable
   answer rather than an assured one, and the honest way to show that is to
   drive them along the real route and let the geometry either allow it or
   not. The path below is not a decorative curve - it is a two-stage move,
   straight back out of the bay and then a swing onto the gate centreline,
   and it only clears because the front yard is 7.32 m deep.
   ============================================================ */

/* ---------- gate ---------- */
var GATE_SPEED = 1.0 / 1.6;              /* full swing in 1.6 s */
function setGate(open){
  if(typeof GATE === "undefined") return;
  GATE.open = open;
  var b = document.getElementById("btnGate");
  if(b){ b.classList.toggle("on", open); b.textContent = open ? "Close gate" : "Open gate"; }
}
function updateGate(dt){
  if(typeof GATE === "undefined") return;
  var target = GATE.open ? 1 : 0;
  if(GATE.t === target) return;
  GATE.t += Math.sign(target - GATE.t) * Math.min(Math.abs(target - GATE.t), GATE_SPEED * dt);
  /* ease so the leaves settle rather than stopping dead */
  var e = GATE.t < 0.5 ? 2*GATE.t*GATE.t : 1 - Math.pow(-2*GATE.t + 2, 2)/2;
  var a = e * Math.PI * 0.52;             /* just past 90 degrees, outward */
  GATE.left.rotation.y  =  a;
  GATE.right.rotation.y = -a;
  /* the collider across the opening is only there while it is shut */
  var shut = GATE.t < 0.15;
  GATE.col.y1 = shut ? 2.4 : -1;          /* y1 below y0 = nothing can hit it */
}

/* ---------- vehicles ---------- */
/* Each car has two stops: its bay, and a space on the street. The drive
   between them is a path, not a lerp - the car has to back out of the bay
   before it can turn, exactly as it would in life. */
var CAR_SPEED = 1 / 4.2;                 /* one full move in 4.2 s */

function carPath(v, s){
  /* s: 0 = parked in the bay, 1 = out on the street.
     Stage 1 (s 0..0.45): reverse straight out of the bay to the gate line.
     Stage 2 (s 0.45..1):  swing onto the gate centreline and pull away. */
  var home = v.home, away = v.away;
  var gateX = (GATE.x0 + GATE.x1) / 2;
  var gateZ = Z0;
  var p = new THREE.Vector3(), yaw = 0;
  if(s <= 0.45){
    var k = s / 0.45;
    p.set(home.x, 0, home.z + (gateZ - 0.9 - home.z) * k);
    yaw = 0;
  } else {
    var k2 = (s - 0.45) / 0.55;
    /* quadratic bezier from the gate line, through the gate, out to the street */
    var p0 = new THREE.Vector3(home.x, 0, gateZ - 0.9);
    /* the control point sits just outside the gate and east of it, which is
       what turns the move into a real turn-out onto the road rather than a
       car driving backwards across the carriageway */
    var p1 = new THREE.Vector3(gateX + 1.2, 0, gateZ - 2.6);
    var p2 = new THREE.Vector3(away.x, 0, away.z);
    var im = 1 - k2;
    p.x = im*im*p0.x + 2*im*k2*p1.x + k2*k2*p2.x;
    p.z = im*im*p0.z + 2*im*k2*p1.z + k2*k2*p2.z;
    /* heading from the tangent, so the car points where it is going */
    var tx = 2*im*(p1.x-p0.x) + 2*k2*(p2.x-p1.x);
    var tz = 2*im*(p1.z-p0.z) + 2*k2*(p2.z-p1.z);
    yaw = Math.atan2(-tx, -tz);
  }
  return {pos:p, yaw:yaw};
}

function updateCars(dt){
  if(typeof VEHICLES === "undefined") return;
  for(var i=0;i<VEHICLES.length;i++){
    var v = VEHICLES[i];
    var target = v.out ? 1 : 0;
    if(v.t === target){ v.moving = false; continue; }
    /* a car will not drive through a shut gate; it waits for it */
    if(GATE.t < 0.75){ v.moving = false; continue; }
    v.moving = true;
    v.t += Math.sign(target - v.t) * Math.min(Math.abs(target - v.t), CAR_SPEED * dt);
    var r = carPath(v, v.t);
    v.pivot.position.set(r.pos.x, 0, r.pos.z);
    v.pivot.rotation.y = r.yaw;
    /* the collider follows only while it is home; once it is moving there is
       nothing to walk into, and a stale box in the driveway is worse than none */
    if(v.col){
      if(v.t < 0.02){
        v.col.x0 = v.home.x - v.dim.wid/2; v.col.x1 = v.home.x + v.dim.wid/2;
        v.col.z0 = v.home.z - v.dim.len/2; v.col.z1 = v.home.z + v.dim.len/2;
        v.col.y1 = v.dim.hgt;
      } else {
        v.col.y1 = -1;
      }
    }
  }
}

function toggleCar(i){
  var v = VEHICLES[i];
  if(!v) return;
  v.out = !v.out;
  if(v.out) setGate(true);          /* you cannot leave through a shut gate */
  refreshCarButtons();
}
function refreshCarButtons(){
  for(var i=0;i<VEHICLES.length;i++){
    var b = document.getElementById("car" + i);
    if(!b) continue;
    b.classList.toggle("on", VEHICLES[i].out);
    b.title = VEHICLES[i].name + (VEHICLES[i].out ? " - on the street" : " - parked");
  }
}

/* ---------- click a car to send it out ---------- */
(function(){
  var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  renderer.domElement.addEventListener("pointerdown", function(ev){
    if(mode !== "orbit") return;              /* walk mode uses the pointer to look */
    if(typeof VEHICLES === "undefined" || !VEHICLES.length) return;
    var r = renderer.domElement.getBoundingClientRect();
    ndc.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    for(var i=0;i<VEHICLES.length;i++){
      var hit = ray.intersectObject(VEHICLES[i].pivot, true);
      if(hit.length){ toggleCar(i); break; }
    }
  });
})();

/* ---------- toolbar ---------- */
(function(){
  var bar = document.getElementById("bar");
  if(!bar) return;
  var host = document.createElement("div");
  host.className = "grp";
  host.id = "driveGrp";
  var g = document.createElement("button");
  g.className = "b"; g.id = "btnGate"; g.textContent = "Open gate";
  g.onclick = function(){ setGate(!GATE.open); };
  host.appendChild(g);
  bar.insertBefore(host, document.getElementById("btnRoof"));

  /* one button per vehicle, filled in once the models have arrived */
  MODELS.whenReady(function(){
    for(var i=0;i<VEHICLES.length;i++){
      (function(idx){
        var b = document.createElement("button");
        b.className = "b"; b.id = "car" + idx;
        b.textContent = VEHICLES[idx].name.split(" ")[0];
        b.onclick = function(){ toggleCar(idx); };
        host.appendChild(b);
      })(i);
    }
    refreshCarButtons();
  });
})();

function animate(){
  requestAnimationFrame(animate);
  var dt = Math.min(0.05, clock.getDelta());
  skyMat.uniforms.uT.value += dt;      /* the cloud deck drifts, very slowly */
  WIND.value += dt;                    /* one clock for every foliage material */
  updateGate(dt);
  updateCars(dt);


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

  /* The shadow frustum follows what you are looking at rather than sitting on
     the middle of the plot, so the depth map is spent on the few metres in
     front of you instead of on the whole street. It follows the FOCUS, not the
     camera: in dollhouse view the camera sits forty metres off the site, and
     centring the frustum on it put the entire house outside the map - which is
     why the orbit view had no cast shadows at all. Clamped to the plot so it
     can never wander off the model again. */
  var fx = (mode==="walk") ? player.x : orbit.tx;
  var fz = (mode==="walk") ? player.z : orbit.tz;
  fx = Math.max(-13, Math.min(13, fx));
  fz = Math.max(-19, Math.min(19, fz));
  sun.position.set(fx + sunOff.x, sunOff.y, fz + sunOff.z);
  sun.target.position.set(fx, 0, fz);
  sun.target.updateMatrixWorld();

  var rn = (mode==="walk") ? zoneAt(player.x, player.z, player.y) : "Dollhouse view";
  var el = document.getElementById("where");
  if(el.textContent !== rn) el.textContent = rn;

  var cmp = document.getElementById("needle");
  var ang = (mode==="walk") ? player.yaw : (orbit.theta + Math.PI);
  cmp.style.transform = "rotate(" + (ang*180/Math.PI) + "deg)";

  if(composer && Q.post){
    /* Depth of field has to know what you are looking at, and in the dollhouse
       that is the orbit pivot - which moves as you zoom. */
    if(pBokeh){
      pBokeh.enabled = !!Q.dof && mode === "orbit";
      if(pBokeh.enabled) pBokeh.uniforms["focus"].value = orbit.dist;
    }
    if(pGrade) pGrade.uniforms.uTime.value = performance.now() * 0.001;
    composer.render(dt);
  } else {
    renderer.render(scene, camera);
  }
  perfWatch(dt);
}

/* Refracting glass costs an extra pass over the whole scene every frame. On a
   desktop GPU that is free; on a mid-range phone it is not. Watch the first
   four seconds of real frames and, if they are not keeping up, drop the same
   material back to a plain reflective pane in place - no mesh churn, no
   reload, and the model stays usable rather than becoming a slideshow. */
/* Refracting glass on or off, in place. `G` flips it by hand: the automatic
   downgrade below is a guess about your hardware, and you are entitled to
   overrule it in either direction. */
function setGlass(on, quiet){
  var g = MAT.glass;
  /* a manual glass choice only ends the glass side of the guessing */
  if(on){
    g.transmission = 0.92; g.transparent = false; g.envMapIntensity = 1.7;
  } else {
    g.transmission = 0; g.transparent = true; g.opacity = 0.30;
    g.roughness = 0.06; g.envMapIntensity = 2.6;
  }
  g.needsUpdate = true;
  if(quiet) return;                     /* the quality preset sets this too */
  var el = document.getElementById("where");
  if(el) el.textContent = on ? "refracting glass on" : "refracting glass off";
}
var gw = {t:0, n:0, done:false};
/* The preset chosen at startup is a guess from the user agent, and a user
   agent cannot tell a three-year-old laptop from a new one. This measures what
   the machine is actually managing and steps the preset down a level at a time
   until it holds up. It stops the moment you pick a preset yourself - being
   overruled by a watchdog after making a deliberate choice is infuriating. */
var QORDER = ["low", "medium", "high", "ultra"];
function perfWatch(dt){
  if(gw.done || gw.user) return;
  /* A backgrounded tab throttles rAF to a crawl, which looks exactly like a
     slow GPU. Only judge frames drawn while the page is on screen, and never
     on fewer than 30 of them. */
  if(document.hidden || dt <= 0 || dt > 0.25){ gw.t = 0; gw.n = 0; return; }
  gw.t += dt; gw.n++;
  if(gw.t < 3.0 || gw.n < 30) return;
  var fps = gw.n / gw.t;
  gw.t = 0; gw.n = 0;
  var i = QORDER.indexOf(QNAME);
  if(fps < 20 && i > 0){
    setQuality(QORDER[i-1]);       /* and measure the new one before settling */
    return;
  }
  gw.done = true;
}

window.addEventListener("resize", function(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if(composer) composer.setSize(window.innerWidth, window.innerHeight);
});

/* A first guess at what this machine can carry. A high pixel ratio on a touch
   screen is a phone, and a phone drawing 2.5x pixels with a 4k shadow map and
   a refraction pass will not hold 30 fps. Guessing is allowed to be wrong -
   the picker is right there, and the frame-rate watchdog still runs. */
var touchy = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
setQuality(touchy ? (window.devicePixelRatio >= 2 ? "medium" : "low") : "high");
document.getElementById("qual").onchange = function(){ gw.user = true; setQuality(this.value); };
wireTOD();

setMode("walk");
document.getElementById("loading").style.display = "none";
animate();

/* debug handle */
window.__J = { scene:scene, camera:camera, renderer:renderer, player:player, orbit:orbit,
  setMode:function(m){ setMode(m); }, zoneAt:zoneAt, floorAt:floorAt, collides:collides,
  COLLIDERS:COLLIDERS, FLOORS:FLOORS,
  groups:{gSite:gSite,gGF:gGF,gFF:gFF,gRoof:gRoof,gGarden:gGarden,gSport:gSport},
  setRear:setRear, rear:function(){ return rearBlock; }, CTOFF:CTOFF, MAT:MAT, SPOTS:SPOTS,
  hx:hx, hz:hz, EYE:EYE, MERGED:MERGED };
