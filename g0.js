/* Ergin Kaplan Net — © Ergin Kaplan */
const OWNER = "Ergin Kaplan";
const CAFE = "Ergin Kaplan Net";
const GAMES = [
  { id:"yilan", name:"Ergin Yılan", shelf:"arcade", blurb:"Çay bardağını kovala", hint:"Ok tuşları / kaydır." },
  { id:"tugla", name:"Tuğla Duvarı", shelf:"arcade", blurb:"Kaplan raketi", hint:"Mouse/parmakla raket. 3 can." },
  { id:"tenis", name:"Masa Tenisi", shelf:"arcade", blurb:"Rıza ile 7 sayı", hint:"W/S veya mouse." },
  { id:"devriye", name:"Kaplan Devriyesi", shelf:"arcade", blurb:"Gece vardiyası", hint:"Oklar, boşluk ateş." },
  { id:"vardiya", name:"Gece Vardiyası", shelf:"arcade", blurb:"Kaplan Sokak", hint:"A/D şerit." },
  { id:"balon", name:"Balon Patlat", shelf:"arcade", blurb:"Doğum günü", hint:"40 sn tıkla." },
  { id:"refleks", name:"Refleks", shelf:"arcade", blurb:"Hız testi", hint:"Hedef çıkınca tıkla." },
  { id:"hafiza", name:"Hafıza", shelf:"zeka", blurb:"Kartları eşleştir", hint:"İki kart aç." },
  { id:"lira", name:"Lira Yığ", shelf:"zeka", blurb:"2048 tarzı", hint:"Ok tuşları." },
  { id:"dort", name:"Dört Sıra", shelf:"masa", blurb:"Dört yan yana", hint:"Sütuna tıkla." },
  { id:"uctas", name:"Üç Taş", shelf:"masa", blurb:"Klasik", hint:"Boş kareye tıkla." },
  { id:"dart", name:"Dart", shelf:"masa", blurb:"Merkez hedef", hint:"Basılı tut, bırak." },
  { id:"penalti", name:"Penaltı", shelf:"masa", blurb:"Kale önü", hint:"Ok yön, güç bırak." }
];
const $=id=>document.getElementById(id);
const canvas=$("stage"),ctx=canvas.getContext("2d");
let current=null,loopId=0,keys={},best=JSON.parse(localStorage.getItem("ekn_best")||"{}");
function saveBest(id,s){if((best[id]||0)<s){best[id]=s;localStorage.setItem("ekn_best",JSON.stringify(best));}}
function setScore(n){$("g-score").textContent="Skor: "+n;}
function showEnd(t,m){$("ov-title").textContent=t;$("ov-msg").textContent=m;$("overlay").classList.add("show");}
function hideEnd(){$("overlay").classList.remove("show");}
function resizeCanvas(){const h=Math.max(280,Math.min(420,($("stage-wrap").clientHeight||360)));canvas.width=480;canvas.height=360;canvas.style.width="100%";canvas.style.height=h+"px";}
setInterval(()=>{$("clock").textContent=new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});},10000);
$("clock").textContent=new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});
function buildLobby(){for(const g of GAMES){const el=document.createElement("div");el.className="card";el.tabIndex=0;el.innerHTML=`<div class="name">${g.name}</div><div class="blurb">${g.blurb}</div>`;el.onclick=()=>startGame(g.id);$(g.shelf==="arcade"?"arcade":g.shelf==="zeka"?"zeka":"masa").appendChild(el);}}
function startGame(id){const g=GAMES.find(x=>x.id===id);if(!g)return;$("lobby").style.display="none";$("game-view").classList.add("active");$("g-title").textContent=g.name;$("g-hint").textContent=g.hint+(best[id]!=null?" · Rekor: "+best[id]:"");hideEnd();resizeCanvas();stopLoop();current=id;if(starters[id])starters[id]();}
function backLobby(){stopLoop();current=null;$("game-view").classList.remove("active");$("lobby").style.display="grid";hideEnd();}
function stopLoop(){if(loopId)cancelAnimationFrame(loopId);loopId=0;}
$("btn-back").onclick=backLobby;$("btn-restart").onclick=()=>{if(current)startGame(current);};$("ov-btn").onclick=()=>{hideEnd();if(current)startGame(current);};
window.addEventListener("keydown",e=>{keys[e.key]=true;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key))e.preventDefault();});
window.addEventListener("keyup",e=>{keys[e.key]=false;});
const starters={};
