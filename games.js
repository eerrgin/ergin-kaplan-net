/* Ergin Kaplan Net — © Ergin Kaplan. İzinsiz kopyalanamaz. */
(async function(){
  const parts = ["g0.js","g1.js","g2.js","g3.js","g4.js","g5.js"];
  let code = "";
  for (const p of parts) {
    const r = await fetch(p);
    code += await r.text();
  }
  const s = document.createElement("script");
  s.textContent = code;
  document.body.appendChild(s);
})();
