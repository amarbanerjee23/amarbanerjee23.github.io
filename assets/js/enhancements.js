/* Enhancements layer — reveal on scroll, back-to-top. Additive only. */
(function () {
  "use strict";

  /* Load the shared Sora + Manrope editorial type system. */
  if (!document.querySelector('link[data-editorial-fonts]')) {
    var fonts = document.createElement("link");
    fonts.rel = "stylesheet";
    fonts.href = "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700&display=swap";
    fonts.setAttribute("data-editorial-fonts", "");
    document.head.appendChild(fonts);
  }

  /* Some legacy page scripts promote their styles at runtime. Keep this
     visual system last in the cascade after those scripts have completed. */
  var editorialStyles = document.querySelector('link[href*="assets/css/enhancements.css"]');
  if (editorialStyles) document.head.appendChild(editorialStyles);
  window.addEventListener("load", function () {
    window.setTimeout(function () {
      if (editorialStyles) document.head.appendChild(editorialStyles);
    }, 0);
  });

  /* Reveal on scroll: upgrades existing .reveal blocks and any
     .js-reveal / .js-reveal-stagger containers. */
  var revealEls = document.querySelectorAll(".js-reveal, .js-reveal-stagger > *");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* FAQ: close sibling answers when one opens (accordion behaviour). */
  document.querySelectorAll(".faq-list").forEach(function (list) {
    list.addEventListener("toggle", function (e) {
      if (e.target.open) {
        list.querySelectorAll("details[open]").forEach(function (d) {
          if (d !== e.target) d.open = false;
        });
      }
    }, true);
  });

  /* Back-to-top button. */
  var btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.type = "button";
  btn.setAttribute("aria-label", "Back to top");
  btn.textContent = "↑";
  document.body.appendChild(btn);
  var onScroll = function () {
    btn.classList.toggle("is-shown", window.scrollY > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* Readability pass: guarantee every text element has legible colour and size. */
(function () {
  var INK = "#102a20", IVORY = "#fbfaf5", MUTED = "#5c7167", MUTED_DARK = "#c6d5cb";

  function parse(c) {
    if (!c) return null;
    var srgb = c.indexOf("color(") === 0;
    var m = c.replace(/^color\(\s*srgb/, "").match(/[\d.]+/g);
    if (!m || m.length < 3) return null;
    var k = srgb ? 255 : 1;
    return { r: +m[0] * k, g: +m[1] * k, b: +m[2] * k, a: m.length > 3 ? parseFloat(m[3]) : 1 };
  }
  function lin(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  function lum(c) { return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b); }
  function ratio(a, b) {
    var l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  function bgOf(el) {
    var n = el;
    while (n && n.nodeType === 1) {
      var cs = getComputedStyle(n);
      var bi = cs.backgroundImage;
      if (bi && bi !== "none") {
        if (bi.indexOf("url(") !== -1) return null;
        var stops = bi.match(/rgba?\([^)]+\)/g) || [];
        var acc = null, count = 0;
        for (var k = 0; k < stops.length; k++) {
          var sc = parse(stops[k]);
          if (!sc || sc.a < 0.5) continue;
          acc = acc ? { r: acc.r + sc.r, g: acc.g + sc.g, b: acc.b + sc.b, a: 1 } : sc;
          count++;
        }
        if (acc && count) return { r: acc.r / count, g: acc.g / count, b: acc.b / count, a: 1 };
      }
      var c = parse(cs.backgroundColor);
      if (c && c.a > 0.5) return c;
      n = n.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }
  function hasText(el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3 && n.textContent.trim()) return true;
    }
    return false;
  }

  function fix() {
    var dark = document.documentElement.dataset.theme === "dark";
    var els = document.querySelectorAll("body *");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!hasText(el)) continue;
      var cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      var size = parseFloat(cs.fontSize);
      if (size && size < 12) el.style.setProperty("font-size", "12px", "important");
      var fg = parse(cs.color), bg = bgOf(el);
      if (!fg || !bg) continue;
      var weight = parseInt(cs.fontWeight, 10) || 400;
      var need = (size >= 24 || (size >= 18.66 && weight >= 700)) ? 3 : 4.5;
      if (ratio(fg, bg) >= need) continue;
      var onDark = lum(bg) < 0.4;
      var strong = weight >= 600 || size >= 18;
      var chosen = onDark ? (strong ? IVORY : MUTED_DARK) : (strong ? INK : MUTED);
      if (ratio(parse(chosen === IVORY ? "rgb(251,250,245)" : chosen === INK ? "rgb(16,42,32)" : chosen === MUTED ? "rgb(92,113,103)" : "rgb(167,185,175)"), bg) < need) {
        chosen = onDark ? IVORY : INK;
      }
      el.style.setProperty("color", chosen, "important");
    }
  }

  function schedule() {
    [0, 400, 1200, 2500].forEach(function (d) { setTimeout(fix, d); });
    if (window.MutationObserver) {
      var t = null;
      new MutationObserver(function () {
        clearTimeout(t);
        t = setTimeout(fix, 250);
      }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
    }
  }
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule);
  document.addEventListener("click", function () { setTimeout(fix, 120); }, true);
})();

/* Single primary action per page: demote duplicate primary buttons in main content. */
(function(){
  function demote(){
    var main = document.querySelector('main') || document.body;
    var btns = Array.prototype.slice.call(main.querySelectorAll('.btn.primary')).filter(function(b){ return !b.closest('form') && b.tagName !== 'BUTTON'; });
    btns.forEach(function(b,i){
      if(i===0) b.classList.remove('is-demoted');
      else b.classList.add('is-demoted');
    });
  }
  if(document.readyState !== 'loading') demote();
  else document.addEventListener('DOMContentLoaded', demote);
  window.addEventListener('load', function(){ setTimeout(demote, 600); });
})();

/* Compact header once the reader scrolls. */
(function(){
  var ticking=false;
  function update(){
    document.body.classList.toggle('is-scrolled', window.scrollY > 24);
    ticking=false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){ ticking=true; window.requestAnimationFrame(update); }
  }, {passive:true});
  update();
})();

/* One simple, consistent primary navigation on every page. */
(function(){
  var file = location.pathname.split('/').pop() || 'index.html';
  var page = file === 'workshops.html' ? 'workshops'
    : file === 'facilitation-gallery.html' ? 'gallery'
    : file === 'academic-partnerships.html' ? 'academic'
    : file === 'research-ip.html' ? 'research'
    : file === 'profile.html' ? 'profile' : 'home';
  var items = [
    ['Home', 'index.html', ['home']],
    ['Programs', 'workshops.html', ['workshops','gallery']],
    ['Research & IP', 'research-ip.html', ['research']],
    ['Partnerships', 'academic-partnerships.html', ['academic']],
    ['About', 'profile.html', ['profile']]
  ];
  var html = items.map(function(it){
    var current = it[2].indexOf(page) > -1;
    var href = (current && page === 'home') ? '#overview' : it[1];
    return '<a href="' + href + '"' + (current ? ' aria-current="page"' : '') + '>' + it[0] + '</a>';
  }).join('');
  html += '<a class="nav-cta" href="' + (page === 'academic' ? '#conversation' : 'academic-partnerships.html#conversation') + '">Start a conversation</a>';

  var applies = 0;
  function apply(){
    var nav = document.querySelector('#nav') || document.querySelector('.nav');
    if(!nav || applies > 60) return;
    if(nav.innerHTML.trim() !== html){ applies++; nav.innerHTML = html; }
  }
  var pending = false;
  function queue(){
    if(pending) return;
    pending = true;
    setTimeout(function(){ pending = false; apply(); }, 60);
  }
  function watch(){
    if(!window.MutationObserver || !document.body) return;
    new MutationObserver(function(muts){
      for(var i=0;i<muts.length;i++){
        var t = muts[i].target;
        if(t && t.closest && (t.closest('#nav') || t.closest('.site-header'))){ queue(); return; }
      }
    }).observe(document.body, {childList:true, subtree:true});
  }
  function closeOnClick(e){
    if(!e.target.closest || !e.target.closest('#nav a')) return;
    var nav = document.querySelector('#nav');
    if(nav) nav.classList.remove('open');
    document.body.classList.remove('nav-open');
    var t = document.querySelector('.nav-toggle');
    if(t) t.setAttribute('aria-expanded','false');
  }
  function init(){ apply(); watch(); document.addEventListener('click', closeOnClick); }
  if(document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
  [200,600,1200,2000,3200,5000].forEach(function(ms){ setTimeout(apply, ms); });

})();
