/* Ergin Kaplan Net · 2003 oyun salonu
   Ergin Lab / özgün tarayıcı oyunları · © Ergin Kaplan */
(function () {
  "use strict";
  const E = globalThis.EKN;
  if (!E) return;
  const K = E.keys, P = E.pressed, M = E.pointer, W = E.W, H = E.H;
  const hit = function (code) {
    if (!P[code]) return false;
    delete P[code];
    return true;
  };
  const click = function () {
    if (!M.click) return false;
    M.click = false;
    return true;
  };
  const rightClick = function () {
    if (!M.right) return false;
    M.right = false;
    return true;
  };
  const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function finish(id, score, title, message) {
    E.remember(id, score);
    E.showEnd(title, message);
  }

  /* 10 · Nöbet Labirenti */
  E.starters.labirent = function () {
    const cols = 21, rows = 13, cell = 26, ox = 47, oy = 28;
    const maze = Array.from({length:rows}, function(){return Array(cols).fill(1);});
    const stack = [{x:1,y:1}], seen = new Set(["1,1"]);
    maze[1][1] = 0;
    while (stack.length) {
      const cur = stack[stack.length - 1];
      const dirs = [[2,0],[-2,0],[0,2],[0,-2]].sort(function(){return Math.random()-0.5;});
      let moved = false;
      for (const d of dirs) {
        const nx=cur.x+d[0], ny=cur.y+d[1], key=nx+","+ny;
        if(nx>0&&nx<cols-1&&ny>0&&ny<rows-1&&!seen.has(key)){
          seen.add(key);maze[cur.y+d[1]/2][cur.x+d[0]/2]=0;maze[ny][nx]=0;stack.push({x:nx,y:ny});moved=true;break;
        }
      }
      if(!moved)stack.pop();
    }
    const player={x:1,y:1}, exit={x:19,y:11}, coins=[];
    while(coins.length<4){
      const x=E.irand(1,cols-2),y=E.irand(1,rows-2);
      if(maze[y][x]===0&&(x!==1||y!==1)&&!(x===exit.x&&y===exit.y)&&!coins.some(function(c){return c.x===x&&c.y===y;}))coins.push({x:x,y:y,got:false});
    }
    let score=0,moves=0,elapsed=0;
    E.loop(function(dt){
      elapsed+=dt;
      let dx=0,dy=0;
      if(hit("ArrowUp")||hit("KeyW"))dy=-1;
      else if(hit("ArrowDown")||hit("KeyS"))dy=1;
      else if(hit("ArrowLeft")||hit("KeyA"))dx=-1;
      else if(hit("ArrowRight")||hit("KeyD"))dx=1;
      if(dx||dy){const nx=player.x+dx,ny=player.y+dy;if(maze[ny]&&maze[ny][nx]===0){player.x=nx;player.y=ny;moves++;}}
      coins.forEach(function(c){if(!c.got&&c.x===player.x&&c.y===player.y){c.got=true;score+=50;E.sfx(620,0.07,"triangle",0.03);}});
      E.setScore(score+" fiş · "+coins.filter(function(c){return c.got;}).length+"/4");
      if(player.x===exit.x&&player.y===exit.y&&coins.every(function(c){return c.got;}))finish("Çıkışı buldun",score+ " puan · "+moves+" adım · "+Math.round(elapsed)+" saniye","Nöbet Labirenti");
    },function(){
      E.clear("#09140e");
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
        E.rect(ox+x*cell,oy+y*cell,cell-1,cell-1,maze[y][x]?"#26382b":"#0e1e14");
        if(maze[y][x])E.rect(ox+x*cell+4,oy+y*cell+4,cell-9,cell-9,"#1b2a20");
      }
      coins.forEach(function(c){if(!c.got){E.rect(ox+c.x*cell+9,oy+c.y*cell+9,8,8,"#e8b44d");E.rect(ox+c.x*cell+12,oy+c.y*cell+5,3,16,"#fff0a3");}});
      E.rect(ox+exit.x*cell+4,oy+exit.y*cell+4,18,18,coins.every(function(c){return c.got;})?"#4ebc79":"#8c4d3e");
      E.rect(ox+player.x*cell+5,oy+player.y*cell+5,16,16,"#7ee0d2");E.rect(ox+player.x*cell+10,oy+player.y*cell+8,6,5,"#123b3a");
      E.text("NÖBET / 4 FİŞİ TOPLA, ÇIKIŞI BUL",320,6,11,"#a9c59e","center");E.panel();
    });
  };

  /* 11 · Mayın Tarlası */
  E.starters.mayin = function () {
    const cols=10,rows=8,cell=34,ox=150,oy=56,mines=12;
    let board=Array.from({length:rows},function(){return Array.from({length:cols},function(){return {mine:false,n:0,open:false,flag:false};});});
    let ready=false,over=false,score=0,opened=0,flags=0;
    function build(sx,sy){
      let placed=0;
      while(placed<mines){const x=E.irand(0,cols-1),y=E.irand(0,rows-1);if(board[y][x].mine||(x===sx&&y===sy))continue;board[y][x].mine=true;placed++;}
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(!board[y][x].mine){
        let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const yy=y+dy,xx=x+dx;if(board[yy]&&board[yy][xx]&&board[yy][xx].mine)n++;}
        board[y][x].n=n;
      }
      ready=true;
    }
    function reveal(x,y){
      const c=board[y]&&board[y][x];if(!c||c.open||c.flag||over)return;
      if(!ready)build(x,y);
      if(c.mine){c.open=true;over=true;finish("Mayına bastın", "Açılan kare: "+opened+" · İşaret: "+flags,"Mayın Tarlası","Mayın sayısı: "+mines);return;}
      const queue=[[x,y]];
      while(queue.length){const p=queue.pop(),q=board[p[1]][p[0]];if(!q||q.open||q.flag||q.mine)continue;q.open=true;opened++;if(q.n===0){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=p[0]+dx,ny=p[1]+dy;if(board[ny]&&board[ny][nx]&&!board[ny][nx].open)queue.push([nx,ny]);}}}
      score=opened*5;E.sfx(360,0.04,"triangle",0.02);
      if(opened===cols*rows-mines){over=true;finish("Alan temizlendi", "Bütün güvenli kareleri buldun. "+score+" puan.","Mayın Tarlası");}
    }
    E.loop(function(){
      if(click()||rightClick()){
        const x=Math.floor((M.x-ox)/cell),y=Math.floor((M.y-oy)/cell);
        if(x>=0&&x<cols&&y>=0&&y<rows&&!over){
          if(M.right){M.right=false;if(!board[y][x].open){board[y][x].flag=!board[y][x].flag;flags+=board[y][x].flag?1:-1;}}
          else reveal(x,y);
        }
      }
      E.setScore(opened+" açık · "+flags+" bayrak · "+mines+" mayın");
    },function(){
      E.clear("#101820");E.text("MAYIN TARLASI  /  İLK AÇILIŞ GÜVENLİ",320,12,12,"#d7c18a","center");
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
        const c=board[y][x],px=ox+x*cell,py=oy+y*cell;
        E.rect(px,py,cell-2,cell-2,c.open?"#253b3c":"#65746a");
        if(c.open&&c.mine){E.ctx.fillStyle="#e25b4a";E.ctx.beginPath();E.ctx.arc(px+16,py+16,8,0,Math.PI*2);E.ctx.fill();}
        else if(c.open&&c.n)E.text(c.n,px+16,py+7,17,["","#6ec2dc","#78d19b","#e8b44d","#d78b8b","#a68ad5","#7dd4cf","#f2c36d","#ffffff"][c.n],"center");
        else if(c.flag)E.text("⚑",px+16,py+5,18,"#e8a838","center");
        else if(c.open)E.rect(px+4,py+4,cell-10,cell-10,"#2e4742");
      }
      if(over)E.text("MAYIN PATLADI",320,360,15,"#ff9c81","center");
      E.panel();
    });
  };

  /* 12 · Renk Patlat */
  E.starters.renk = function () {
    const size=8,cell=39,ox=164,oy=42,colors=["#e25b4a","#e8a838","#5a9db1","#7eaa65","#9c7dbb","#d7d1b8"];
    let board=Array.from({length:size},function(){return Array.from({length:size},function(){return E.irand(0,5);});});
    let selected=null,score=0,moves=0,flash=0;
    function matches(){
      const mark=new Set();
      for(let y=0;y<size;y++){let x=0;while(x<size){let end=x+1;while(end<size&&board[y][end]===board[y][x])end++;if(end-x>=3)for(let i=x;i<end;i++)mark.add(y+","+i);x=end;}}
      for(let x=0;x<size;x++){let y=0;while(y<size){let end=y+1;while(end<size&&board[end][x]===board[y][x])end++;if(end-y>=3)for(let i=y;i<end;i++)mark.add(i+","+x);y=end;}}
      return Array.from(mark).map(function(k){return k.split(",").map(Number);});
    }
    function settle(){
      let found=matches(),guard=0;
      while(found.length&&guard++<12){
        score+=found.length*10;found.forEach(function(p){board[p[0]][p[1]]=-1;});
        for(let x=0;x<size;x++){let col=[];for(let y=size-1;y>=0;y--)if(board[y][x]>=0)col.push(board[y][x]);while(col.length<size)col.push(E.irand(0,5));for(let y=size-1;y>=0;y--)board[y][x]=col[size-1-y];}
        found=matches();
      }
    }
    E.loop(function(dt){
      flash=Math.max(0,flash-dt);
      if(click()){
        const x=Math.floor((M.x-ox)/cell),y=Math.floor((M.y-oy)/cell);
        if(x>=0&&x<size&&y>=0&&y<size){
          if(!selected)selected={x:x,y:y};
          else if(selected.x===x&&selected.y===y)selected=null;
          else if(Math.abs(selected.x-x)+Math.abs(selected.y-y)===1){
            const a=board[selected.y][selected.x];board[selected.y][selected.x]=board[y][x];board[y][x]=a;
            if(matches().length){moves++;settle();flash=0.2;E.sfx(520,0.06,"triangle",0.025);}
            else{const b=board[selected.y][selected.x];board[selected.y][selected.x]=board[y][x];board[y][x]=b;}
            selected=null;
          }else selected={x:x,y:y};
        }else selected=null;
      }
      E.setScore(score+" puan · "+moves+" hamle");
    },function(){
      E.clear("#11151d");E.text("RENK PATLAT  /  ÜÇLÜLERİ YAN YANA GETİR",320,8,12,"#d8c69a","center");
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const px=ox+x*cell,py=oy+y*cell,v=board[y][x];
        E.rect(px,py,cell-3,cell-3,"#202b32");
        E.rect(px+5,py+5,cell-13,cell-13,colors[v]);
        E.rect(px+10,py+9,7,5,"rgba(255,255,255,.34)");
        if(selected&&selected.x===x&&selected.y===y){E.ctx.strokeStyle="#ffffff";E.ctx.lineWidth=3;E.ctx.strokeRect(px+2,py+2,cell-7,cell-7);}
      }
      E.text("Takas için komşu iki taşı seç",320,365,11,"#91a69a","center");E.panel();
    });
  };

  /* 13 · Hafıza Kartları */
  E.starters.hafiza = function () {
    const symbols=["A","B","C","D","E","F","G","H"];
    const deck=symbols.concat(symbols).sort(function(){return Math.random()-0.5;});
    let cards=deck.map(function(v){return {v:v,open:false,done:false};});
    let first=-1,second=-1,wait=0,moves=0,pairs=0,score=0;
    E.loop(function(dt){
      wait=Math.max(0,wait-dt);
      if(wait===0&&second>=0){cards[first].open=false;cards[second].open=false;first=-1;second=-1;}
      if(click()&&wait===0){
        const x=Math.floor((M.x-122)/99),y=Math.floor((M.y-75)/103),idx=y*4+x;
        if(x>=0&&x<4&&y>=0&&y<4){
          const c=cards[idx];
          if(!c.done&&!c.open){
            c.open=true;
            if(first<0)first=idx;
            else{second=idx;moves++;if(cards[first].v===cards[second].v){cards[first].done=true;cards[second].done=true;pairs++;score+=100;first=-1;second=-1;E.sfx(600,0.08,"sine",0.03);}
              else wait=0.8;}
          }
        }
      }
      E.setScore(pairs+" / 8 çift · "+moves+" hamle");
      if(pairs===8)finish("Hepsi eşleşti", "Sekiz çift "+moves+" hamlede bulundu. Puan: "+score,"Hafıza Kartları");
    },function(){
      E.clear("#15131b");E.text("HAFIZA / MASANIN ÜSTÜNDEKİ KARTLAR",320,15,12,"#d4bf8d","center");
      cards.forEach(function(c,i){const x=122+(i%4)*99,y=75+Math.floor(i/4)*103;E.rect(x,y,82,87,c.done?"#31493b":"#3b3030");E.rect(x+4,y+4,74,79,c.done?"#192c24":c.open?"#292d34":"#1d222c");if(c.open||c.done){E.text(c.v,x+41,y+26,28,c.done?"#8de0a4":"#e8c889","center");E.rect(x+25,y+65,32,2,"#8c8062");}else{E.rect(x+18,y+20,46,46,"#563b32");E.text("EK",x+41,y+31,17,"#e8a838","center");}});
      E.text("ÇİFTLERİ BUL / SABIR KAZANDIRIR",320,390,11,"#91a69a","center");E.panel();
    });
  };

  /* 14 · Lira Yığ */
  E.starters.lira = function () {
    let board=Array.from({length:4},function(){return [0,0,0,0];}),score=0,turns=0,dead=false;
    function spawn(){const free=[];for(let y=0;y<4;y++)for(let x=0;x<4;x++)if(!board[y][x])free.push([x,y]);if(free.length){const p=free[E.irand(0,free.length-1)];board[p[1]][p[0]]=Math.random()<0.88?2:4;}}
    function moveLine(line){
      const a=line.filter(Boolean);for(let i=0;i<a.length-1;i++)if(a[i]===a[i+1]){a[i]*=2;score+=a[i];a.splice(i+1,1);}
      while(a.length<4)a.push(0);return a;
    }
    function move(dir){
      const before=JSON.stringify(board);
      for(let i=0;i<4;i++){
        let line=[];
        for(let j=0;j<4;j++){let x=dir==="left"?j:dir==="right"?3-j:i;let y=dir==="up"?j:dir==="down"?3-j:i;line.push(board[y][x]);}
        const merged=moveLine(line);
        for(let j=0;j<4;j++){let x=dir==="left"?j:dir==="right"?3-j:i;let y=dir==="up"?j:dir==="down"?3-j:i;board[y][x]=merged[j];}
      }
      if(JSON.stringify(board)!==before){turns++;spawn();E.sfx(260,0.035,"square",0.02);}
    }
    function canMove(){for(let y=0;y<4;y++)for(let x=0;x<4;x++)if(!board[y][x]||(x<3&&board[y][x]===board[y][x+1])||(y<3&&board[y][x]===board[y+1][x]))return true;return false;}
    spawn();spawn();
    E.loop(function(){
      if(hit("ArrowLeft")||hit("KeyA"))move("left");
      else if(hit("ArrowRight")||hit("KeyD"))move("right");
      else if(hit("ArrowUp")||hit("KeyW"))move("up");
      else if(hit("ArrowDown")||hit("KeyS"))move("down");
      E.setScore(score.toLocaleString("tr-TR")+" TL · "+turns+" hamle");
      if(!canMove())finish("Kasa doldu", "Toplam birikim: "+score+" eski lira.","Lira Yığ");
    },function(){
      E.clear("#15120f");E.text("LİRA YIĞ  /  AYNI DEĞERLERİ BİRLEŞTİR",320,12,12,"#e5c78e","center");
      for(let y=0;y<4;y++)for(let x=0;x<4;x++){
        const v=board[y][x],px=158+x*82,py=54+y*82;E.rect(px,py,74,74,"#2a2723");
        if(v){const power=Math.min(5,Math.log2(v)/2);const cols=["#b58d55","#c9a36b","#d9b77c","#e5c98b","#e5a35f","#e27453"];E.rect(px+4,py+4,66,66,cols[power|0]);E.text(v.toLocaleString("tr-TR"),px+37,py+27,v>1000?15:19,"#2d2117","center");}
      }
      E.text("2 → 4 → 8 → 16 → ...",320,395,11,"#b8a27c","center");E.panel();
    });
  };
})();