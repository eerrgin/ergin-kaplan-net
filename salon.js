/* Ergin Kaplan Net — salon motoru
   Ergin Lab · © Ergin Kaplan. İzinsiz kopyalanamaz. */
globalThis.EKN = (function () {
  "use strict";
  const W = 640, H = 400;
  const $ = (id) => document.getElementById(id);
  const canvas = $("stage");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const GAMES = [
    { id: "yildiz", name: "Ergin Lab: Yıldız Koridoru", shelf: "lab", blurb: "Uç ve vur", hint: "Oklar veya sürükle. Basılı tutunca ateş. Çay = seri atış." },
    { id: "ring", name: "Ergin Lab: Ring Kaplan", shelf: "lab", blurb: "Karşılıklı dövüş", hint: "A/D yürü, W zıpla, F yumruk, G tekme, S blok. 2. oyuncu: oklar, K yumruk, L tekme, aşağı blok." },
    { id: "yilan", name: "Yılan", shelf: "arcade", blurb: "Klasik yılan", hint: "Oklar. Yem ye, kendini yeme." },
    { id: "tugla", name: "Tuğla Kırıcı", shelf: "arcade", blurb: "Breakout", hint: "Sol/sağ veya fare. Boşluk top." },
    { id: "tenis", name: "Masa Tenisi", shelf: "arcade", blurb: "Pong", hint: "W/S veya oklar." },
    { id: "tank", name: "Tank Savaşı", shelf: "arcade", blurb: "2 kişilik tank", hint: "WASD + F ateş / oklar + K ateş." },
    { id: "vardiya", name: "Vardiya", shelf: "arcade", blurb: "Trafik kaçış", hint: "Sol/sağ şerit değiştir." },
    { id: "balon", name: "Balon Patlat", shelf: "arcade", blurb: "Tıkla patlat", hint: "Fare veya dokun." },
    { id: "refleks", name: "Refleks", shelf: "zeka", blurb: "Hız testi", hint: "Yeşil olunca tıkla." },
    { id: "labirent", name: "Labirent", shelf: "zeka", blurb: "Çıkış bul", hint: "Oklar. Altın topla." },
    { id: "mayin", name: "Mayın Tarlası", shelf: "zeka", blurb: "Mayın tarla", hint: "Sol tık aç, sağ bayrak." },
    { id: "renk", name: "Renk Eşle", shelf: "zeka", blurb: "Match-3", hint: "Komşu takas et." },
    { id: "hafiza", name: "Hafıza", shelf: "zeka", blurb: "Kart eşle", hint: "İki kart aç." },
    { id: "lira", name: "Lira 2048", shelf: "zeka", blurb: "2048", hint: "Oklar kaydır." },
    { id: "dort", name: "Dört Taş", shelf: "masa", blurb: "Connect 4", hint: "Tıkla sütun." },
    { id: "uctas", name: "Üç Taş", shelf: "masa", blurb: "XOX", hint: "Tıkla kutu." },
    { id: "dart", name: "Dart", shelf: "masa", blurb: "Hedef atış", hint: "Boşluk / tıkla güç." },
    { id: "penalti", name: "Penaltı", shelf: "masa", blurb: "Gol at", hint: "Yön seç, güç." }
  ];

  const starters = Object.create(null);
  let best = {};
  try { best = JSON.parse(localStorage.getItem("ekn_best") || "{}") || {}; } catch (e) { best = {}; }

  const keys = Object.create(null);
  const pressed = Object.create(null);
  const pointer = { x: 0, y: 0, down: false, click: false, right: false, id: null };

  let current = null;
  let gen = 0;
  let raf = 0;
  let lastT = 0;
  let soundOn = true;
  let ac = null;

  function unlock() {
    if (ac) return;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
    } catch (e) {}
  }
  function sfx(freq, dur, type, vol) {
    if (!soundOn || !ac) return;
    try {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = type || "square";
      o.frequency.value = freq;
      g.gain.value = vol == null ? 0.04 : vol;
      o.connect(g); g.connect(ac.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + (dur || 0.08));
      o.stop(ac.currentTime + (dur || 0.08) + 0.02);
    } catch (e) {}
  }
  function boom() { sfx(60, 0.18, "sawtooth", 0.06); setTimeout(() => sfx(40, 0.12, "triangle", 0.04), 40); }

  function clear(col) {
    ctx.fillStyle = col || "#07110d";
    ctx.fillRect(0, 0, W, H);
  }
  function rect(x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
  }
  function text(str, x, y, size, col, align) {
    ctx.fillStyle = col || "#b7f5c8";
    ctx.font = (size || 14) + "px \"Courier New\",monospace";
    ctx.textAlign = align || "left";
    ctx.textBaseline = "top";
    ctx.fillText(String(str), x, y);
  }
  function panel() {
    ctx.strokeStyle = "rgba(183,245,200,.15)";
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, W - 8, H - 8);
  }
  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function irand(a, b) { return (a + Math.random() * (b - a + 1)) | 0; }
  function burst(parts, x, y, n, col) {
    for (let i = 0; i < n; i++) {
      parts.push({ x, y, vx: rand(-120, 120), vy: rand(-160, 40), life: rand(0.3, 0.8), col: col || "#e8a838" });
    }
  }
  function drawParts(parts, dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 280 * dt;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life * 1.4);
      rect(p.x, p.y, 3, 3, p.col);
      ctx.globalAlpha = 1;
    }
  }
  function paintIcon(id) {
    const c = document.createElement("canvas"); c.width = 64; c.height = 40;
    const g = c.getContext("2d"); g.imageSmoothingEnabled = false;
    g.fillStyle = "#06110c"; g.fillRect(0, 0, 64, 40);
    if (id === "yildiz") { g.fillStyle = "#7ee0d2"; g.fillRect(28, 28, 8, 6); g.fillStyle = "#e25b4a"; for (let i = 0; i < 5; i++) g.fillRect(8 + i * 10, 6 + (i % 3) * 4, 6, 6); }
    else if (id === "ring") { g.fillStyle = "#e8a838"; g.fillRect(12, 12, 14, 22); g.fillStyle = "#e25b4a"; g.fillRect(38, 12, 14, 22); }
    else if (id === "yilan") { g.fillStyle = "#3d9a4a"; for (let i = 0; i < 6; i++) g.fillRect(8 + i * 8, 16, 7, 7); g.fillStyle = "#e25b4a"; g.fillRect(52, 16, 7, 7); }
    else { g.fillStyle = "#8ea894"; g.fillRect(20, 12, 24, 16); g.fillStyle = "#e8a838"; g.fillRect(26, 16, 12, 8); }
    return c.toDataURL();
  }

  function setScore(s) {
    const el = $("g-score");
    if (el) el.textContent = "Skor: " + s;
  }
  function saveBest(id, val) {
    if (val == null || isNaN(val)) return;
    const prev = best[id];
    if (prev != null && val <= prev) return;
    best[id] = val;
    try { localStorage.setItem("ekn_best", JSON.stringify(best)); } catch (e) {}
    renderBests();
  }
  function remember(id, val) { saveBest(id, val); }

  function renderBests() {
    const el = $("bests");
    if (!el) return;
    const rows = GAMES.filter((g) => best[g.id] != null);
    if (!rows.length) { el.innerHTML = '<div class="best-row">Henüz yok</div>'; return; }
    el.innerHTML = rows.slice(0, 8).map((g) =>
      '<div class="best-row"><b>' + g.name.replace(/^Ergin Lab: /, "") + '</b> · ' + best[g.id] + '</div>'
    ).join("");
  }

  function buildLobby() {
    GAMES.forEach((g) => {
      if (g.shelf === "lab") {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "card lab";
        el.innerHTML = '<canvas width="64" height="40"></canvas><b>' + g.name.replace(/^Ergin Lab: /, "") + '</b><span>' + g.blurb + '</span>';
        const ic = el.querySelector("canvas");
        const img = new Image();
        img.onload = () => { const c = ic.getContext("2d"); c.drawImage(img, 0, 0); };
        img.src = paintIcon(g.id);
        el.addEventListener("click", () => startGame(g.id));
        const shelf = $("lab"); if (shelf) shelf.appendChild(el);
        return;
      }
      const el = document.createElement("button");
      el.type = "button";
      el.className = "card";
      el.innerHTML = '<b>' + g.name + '</b><span>' + g.blurb + '</span>';
      el.addEventListener("click", () => startGame(g.id));
      const shelf = $(g.shelf); if (shelf) shelf.appendChild(el);
    });
    $("count").textContent = GAMES.length + " oyun";
    renderBests();
  }

  function loop(update, draw) {
    const my = ++gen;
    lastT = performance.now();
    function frame(t) {
      if (my !== gen) return;
      let dt = (t - lastT) / 1000;
      lastT = t;
      if (dt > 0.05) dt = 0.05;
      update(dt);
      draw();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }
  function stopLoop() { gen++; if (raf) cancelAnimationFrame(raf); raf = 0; }

  function clearInput() {
    for (const k in pressed) delete pressed[k];
    pointer.click = false; pointer.right = false;
  }

  function startGame(id) {
    const g = GAMES.find((x) => x.id === id);
    if (!g || !starters[id]) return;
    unlock(); dismissBoot();
    $("lobby").style.display = "none";
    $("game-view").classList.add("on");
    $("g-title").textContent = g.name;
    $("g-hint").textContent = g.hint || "";
    $("overlay").classList.remove("on");
    current = id; updateTouch(); starters[id]();
  }
  function backLobby() {
    stopLoop(); clearInput();
    current = null;
    $("game-view").classList.remove("on");
    $("lobby").style.display = "";
    $("overlay").classList.remove("on");
    renderBests();
  }
  function showEnd(title, msg) {
    stopLoop();
    $("ov-title").textContent = title || "Bitti";
    $("ov-msg").textContent = msg || "";
    $("overlay").classList.add("on");
  }
  function hideEnd() { $("overlay").classList.remove("on"); }
  function dismissBoot() {
    const b = $("boot");
    if (b) b.classList.add("gone");
  }

  function updateTouch() {
    const t = $("touch");
    if (!t) return;
    const need = current && /yildiz|yilan|tugla|tenis|tank|vardiya|labirent|lira/.test(current);
    t.classList.toggle("on", !!need && ("ontouchstart" in window || navigator.maxTouchPoints > 0));
  }

  function boot() {
    buildLobby();
    function tickClock() {
      const d = new Date();
      const s = (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
      const c1 = $("clock"), c2 = $("clock2");
      if (c1) c1.textContent = s; if (c2) c2.textContent = s;
    }
    tickClock(); setInterval(tickClock, 15000);

    document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("on", x === b));
      document.querySelectorAll("[data-shelf]").forEach((s) => {
        s.hidden = s.getAttribute("data-shelf") !== b.getAttribute("data-tab");
      });
    }));

    document.querySelectorAll("[data-game]").forEach((b) => b.addEventListener("click", () => startGame(b.dataset.game)));
    $("btn-back").addEventListener("click", backLobby);
    $("btn-restart").addEventListener("click", () => { if (current) startGame(current); });
    $("ov-btn").addEventListener("click", () => { hideEnd(); if (current) startGame(current); });
    $("btn-random").addEventListener("click", () => startGame(GAMES[irand(0, GAMES.length - 1)].id));
    $("btn-clear").addEventListener("click", () => { best = {}; try { localStorage.removeItem("ekn_best"); } catch (e) {} renderBests(); });
    $("btn-sound").addEventListener("click", () => {
      soundOn = !soundOn; unlock();
      $("btn-sound").textContent = soundOn ? "Ses açık" : "Ses kapalı";
    });

    window.addEventListener("keydown", (e) => {
      keys[e.code] = true; keys[e.key] = true;
      if (!pressed[e.code]) pressed[e.code] = true;
      if (current && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    });
    window.addEventListener("keyup", (e) => { keys[e.code] = false; keys[e.key] = false; });

    canvas.addEventListener("pointerdown", (e) => {
      pointer.down = true; pointer.click = true; pointer.id = e.pointerId;
      const r = canvas.getBoundingClientRect();
      const rw = r.width || canvas.width, rh = r.height || canvas.height;
      pointer.x = (e.clientX - r.left) * (canvas.width / rw);
      pointer.y = (e.clientY - r.top) * (canvas.height / rh);
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    canvas.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      const rw = r.width || canvas.width, rh = r.height || canvas.height;
      pointer.x = (e.clientX - r.left) * (canvas.width / rw);
      pointer.y = (e.clientY - r.top) * (canvas.height / rh);
    });
    canvas.addEventListener("pointerup", (e) => {
      pointer.down = false;
      if (e.button === 2) pointer.right = true;
    });
    canvas.addEventListener("pointercancel", () => { pointer.down = false; });
    canvas.addEventListener("contextmenu", (e) => { if (!current) return; e.preventDefault(); pointer.right = true; });

    document.querySelectorAll("#touch button").forEach((b) => {
      const k = b.getAttribute("data-k");
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); keys[k] = true; pressed[k] = true; });
      b.addEventListener("pointerup", () => { keys[k] = false; });
      b.addEventListener("pointercancel", () => { keys[k] = false; });
    });

    setTimeout(dismissBoot, 900);
  }

  return {
    W, H, canvas, ctx, keys, pressed, pointer, starters, GAMES, loop, stopLoop,
    sfx, boom, clear, rect, text, panel, overlap, rand, irand, burst, drawParts,
    setScore, saveBest, remember, showEnd, hideEnd, startGame, backLobby, boot
  };
})();
