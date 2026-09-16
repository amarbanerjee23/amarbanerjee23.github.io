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
