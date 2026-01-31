(function () {
  "use strict";

  var body = document.body;

  function initNav() {
    var hamburger = document.getElementById("hamburger");
    var siteNav = document.getElementById("site-nav") || document.querySelector(".site-nav");
    var navLinks = siteNav ? siteNav.querySelectorAll("a") : [];

    if (!hamburger || !siteNav) return;

    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-controls", "site-nav");

    function closeNav() {
      siteNav.classList.remove("is-open");
      body.classList.remove("nav-open");
      hamburger.setAttribute("aria-expanded", "false");
      body.style.overflow = "";
    }

    function openNav() {
      siteNav.classList.add("is-open");
      body.classList.add("nav-open");
      hamburger.setAttribute("aria-expanded", "true");
      body.style.overflow = "hidden";
    }

    function toggleNav(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (siteNav.classList.contains("is-open")) closeNav();
      else openNav();
    }

    hamburger.addEventListener("click", toggleNav);
    var navClose = document.getElementById("nav-close");
    if (navClose) navClose.addEventListener("click", function (e) { e.preventDefault(); closeNav(); });
    navLinks.forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && siteNav.classList.contains("is-open")) closeNav();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNav);
  } else {
    initNav();
  }

  /* Home page: solid nav when scrolled past hero */
  if (body.classList.contains("page-home")) {
    var siteHeader = document.querySelector(".site-header");
    var hero = document.querySelector(".hero");
    function updateHeaderScrolled() {
      if (!siteHeader || !hero) return;
      var rect = hero.getBoundingClientRect();
      var heroBottomInDoc = rect.bottom + (window.scrollY || window.pageYOffset);
      var scrolledPast = (window.scrollY || window.pageYOffset) > heroBottomInDoc - 20;
      siteHeader.classList.toggle("is-scrolled", scrolledPast);
    }
    window.addEventListener("scroll", updateHeaderScrolled, { passive: true });
    window.addEventListener("resize", updateHeaderScrolled);
    updateHeaderScrolled();
  }

  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.1 }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  var stickyCta = document.getElementById("sticky-mobile-cta");
  if (stickyCta) {
    function checkStickyCta() {
      var y = window.scrollY || window.pageYOffset;
      var visible = y > 250;
      stickyCta.classList.toggle("is-visible", visible);
      stickyCta.setAttribute("aria-hidden", visible ? "false" : "true");
    }
    window.addEventListener("scroll", checkStickyCta, { passive: true });
    checkStickyCta();
  }

  var faq = document.querySelector(".faq-accordion");
  if (faq) {
    var faqItems = faq.querySelectorAll(".faq-item");
    faqItems.forEach(function (item) {
      var btn = item.querySelector(".faq-question");
      var panel = item.querySelector(".faq-answer");
      if (!btn || !panel) return;
      var panelId = panel.id || "faq-panel-" + Math.random().toString(36).slice(2);
      if (!panel.id) panel.id = panelId;
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", panelId);
      panel.hidden = true;

      btn.addEventListener("click", function () {
        var isOpen = btn.getAttribute("aria-expanded") === "true";
        faqItems.forEach(function (other) {
          var oBtn = other.querySelector(".faq-question");
          var oPanel = other.querySelector(".faq-answer");
          if (oBtn && oPanel) {
            oBtn.setAttribute("aria-expanded", "false");
            oPanel.hidden = true;
            other.classList.remove("is-open");
          }
        });
        if (!isOpen) {
          btn.setAttribute("aria-expanded", "true");
          panel.hidden = false;
          item.classList.add("is-open");
        }
      });
    });
    var first = faq.querySelector(".faq-item");
    if (first) {
      var firstBtn = first.querySelector(".faq-question");
      var firstPanel = first.querySelector(".faq-answer");
      if (firstBtn && firstPanel) {
        firstBtn.setAttribute("aria-expanded", "true");
        firstPanel.hidden = false;
        first.classList.add("is-open");
      }
    }
  }

  function initCarousel(carousel) {
    if (!carousel) return;
    var track = carousel.querySelector(".carousel-track");
    var slides = carousel.querySelectorAll(".carousel-slide");
    var prevBtn = carousel.querySelector(".carousel-prev");
    var nextBtn = carousel.querySelector(".carousel-next");
    var dotsWrap = carousel.querySelector(".carousel-dots");
    var autoplayMs = 5000;
    var currentIndex = 0;
    var autoplayTimer = null;
    var touchStartX = 0;
    var touchEndX = 0;

    function goTo(index) {
      if (!slides.length) return;
      currentIndex = ((index % slides.length) + slides.length) % slides.length;
      if (track) track.style.transform = "translateX(-" + currentIndex * 100 + "%)";
      carousel.querySelectorAll(".carousel-dot").forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === currentIndex);
        dot.setAttribute("aria-current", i === currentIndex ? "true" : "false");
      });
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(function () { goTo(currentIndex + 1); }, autoplayMs);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(currentIndex - 1); stopAutoplay(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(currentIndex + 1); stopAutoplay(); startAutoplay(); });

    if (dotsWrap && slides.length) {
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.setAttribute("aria-current", i === 0 ? "true" : "false");
        dot.addEventListener("click", function () { goTo(i); stopAutoplay(); startAutoplay(); });
        dotsWrap.appendChild(dot);
      });
    }

    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });
    carousel.addEventListener("touchend", function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goTo(currentIndex + 1);
        else goTo(currentIndex - 1);
      }
      startAutoplay();
    }, { passive: true });

    goTo(0);
    startAutoplay();
  }

  document.querySelectorAll(".testimonial-carousel").forEach(initCarousel);

  /* Featured Projects: card carousel with 2 visible, counter, progress bar */
  var featuredCarousel = document.querySelector(".featured-projects-carousel");
  if (featuredCarousel) {
    var track = featuredCarousel.querySelector(".carousel-track");
    var slides = track ? track.querySelectorAll(".carousel-slide") : featuredCarousel.querySelectorAll(".carousel-slide");
    var prevBtn = featuredCarousel.querySelector(".carousel-prev");
    var nextBtn = featuredCarousel.querySelector(".carousel-next");
    var counterEl = featuredCarousel.querySelector(".carousel-counter");
    var progressFill = featuredCarousel.querySelector(".carousel-progress-fill");
    var visibleCount = parseInt(featuredCarousel.getAttribute("data-visible") || "2", 10);
    var currentIndex = 0;
    var autoplayTimer = null;
    var touchStartX = 0;
    var touchEndX = 0;

    function getVisible() {
      return window.matchMedia("(min-width: 768px)").matches ? visibleCount : 1;
    }

    function getMaxIndex() {
      var slideCount = track ? track.querySelectorAll(".carousel-slide").length : slides.length;
      var vis = getVisible();
      return Math.max(0, slideCount - vis);
    }

    function updateCounterAndProgress() {
      var slideCount = track ? track.querySelectorAll(".carousel-slide").length : slides.length;
      var vis = getVisible();
      var start = currentIndex + 1;
      var end = Math.min(currentIndex + vis, slideCount);
      if (counterEl) counterEl.textContent = start + " – " + end + " of " + slideCount;
      var maxIdx = Math.max(0, slideCount - vis);
      var pct = maxIdx === 0 ? 100 : ((currentIndex + 1) / (maxIdx + 1)) * 100;
      if (progressFill) progressFill.style.width = pct + "%";
    }

    function goTo(index) {
      if (!slides.length) return;
      var maxIdx = getMaxIndex();
      currentIndex = index < 0 ? 0 : index > maxIdx ? maxIdx : index;
      var vis = getVisible();
      var pct = vis === 1 ? 100 : 100 / vis;
      if (track) track.style.transform = "translateX(-" + currentIndex * pct + "%)";
      updateCounterAndProgress();
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(function () {
        var maxIdx = getMaxIndex();
        goTo(currentIndex >= maxIdx ? 0 : currentIndex + 1);
      }, 5000);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(currentIndex - 1); stopAutoplay(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(currentIndex + 1); stopAutoplay(); startAutoplay(); });

    featuredCarousel.addEventListener("mouseenter", stopAutoplay);
    featuredCarousel.addEventListener("mouseleave", startAutoplay);
    featuredCarousel.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });
    featuredCarousel.addEventListener("touchend", function (e) {
      var touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goTo(currentIndex + 1);
        else goTo(currentIndex - 1);
      }
      startAutoplay();
    }, { passive: true });

    window.addEventListener("resize", function () {
      goTo(Math.min(currentIndex, getMaxIndex()));
    });

    goTo(0);
    startAutoplay();
  }

  /* Timeline: scroll-driven progress line + active step */
  var timelineSection = document.querySelector(".timeline-section");
  if (timelineSection && "IntersectionObserver" in window) {
    var timeline = timelineSection.querySelector(".timeline");
    var progressFill = timelineSection.querySelector(".timeline-progress-fill");
    var steps = timelineSection.querySelectorAll(".timeline-step");
    var ticking = false;

    function updateTimeline() {
      if (!timeline || !progressFill || !steps.length) return;
      var sectionRect = timelineSection.getBoundingClientRect();
      var sectionHeight = timelineSection.offsetHeight;
      var viewportHeight = window.innerHeight;

      /* Progress fill: 0% when section top at viewport top, 100% when section bottom at viewport top */
      var scrollThrough = -sectionRect.top;
      var progress = Math.min(1, Math.max(0, scrollThrough / sectionHeight));
      progressFill.style.height = (progress * 100) + "%";

      /* Active step: step whose center is closest to viewport center */
      var viewportCenter = viewportHeight * 0.4;
      var activeIndex = 0;
      var minDist = Infinity;
      for (var i = 0; i < steps.length; i++) {
        var stepRect = steps[i].getBoundingClientRect();
        var stepCenter = stepRect.top + stepRect.height / 2;
        var dist = Math.abs(stepCenter - viewportCenter);
        if (dist < minDist) {
          minDist = dist;
          activeIndex = i;
        }
      }
      steps.forEach(function (step, i) {
        step.classList.toggle("is-active", i === activeIndex);
      });
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateTimeline);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateTimeline();
  }

  /* Parallax: timeline, Our Services (home), Services page content + every hero */
  var parallaxPairs = [
    { section: ".timeline-section", bg: ".timeline-section-bg", factor: 0.4 },
    { section: ".services-section", bg: ".services-section-bg", factor: 0.35 },
    { section: ".services-content-section", bg: ".services-content-section-bg", factor: 0.35 }
  ];
  var parallaxTicking = false;
  var heroParallaxFactor = 0.5;

  function updateAllParallax() {
    parallaxPairs.forEach(function (pair) {
      var sectionEl = document.querySelector(pair.section);
      var bgEl = document.querySelector(pair.bg);
      if (!sectionEl || !bgEl) return;
      var rect = sectionEl.getBoundingClientRect();
      var scrollThrough = -rect.top;
      var offset = scrollThrough * pair.factor;
      bgEl.style.transform = "translate3d(0, " + offset + "px, 0)";
    });
    document.querySelectorAll(".hero").forEach(function (heroEl) {
      var bgEl = heroEl.querySelector(".hero-parallax-bg") || heroEl.querySelector(".hero-bg-img");
      if (!bgEl) return;
      var rect = heroEl.getBoundingClientRect();
      var scrollThrough = -rect.top;
      var offset = scrollThrough * heroParallaxFactor;
      bgEl.style.transform = "translate3d(0, " + offset + "px, 0)";
    });
    parallaxTicking = false;
  }

  function onParallaxScroll() {
    if (parallaxTicking) return;
    parallaxTicking = true;
    requestAnimationFrame(updateAllParallax);
  }

  var hasParallax = parallaxPairs.some(function (p) { return document.querySelector(p.section) && document.querySelector(p.bg); });
  var hasHeroParallax = document.querySelectorAll(".hero .hero-parallax-bg, .hero .hero-bg-img").length > 0;
  if (hasParallax || hasHeroParallax) {
    window.addEventListener("scroll", onParallaxScroll, { passive: true });
    window.addEventListener("resize", onParallaxScroll);
    updateAllParallax();
  }

  /* Before & After carousel: one large video at a time, autoplay first, prev/next arrows, only active plays */
  var beforeAfterCarousel = document.getElementById("before-after-carousel");
  if (beforeAfterCarousel) {
    var slides = beforeAfterCarousel.querySelectorAll(".before-after-slide");
    var prevBtn = beforeAfterCarousel.querySelector(".before-after-prev");
    var nextBtn = beforeAfterCarousel.querySelector(".before-after-next");
    var counterCurrent = beforeAfterCarousel.querySelector(".before-after-current");
    var currentIndex = 0;
    var total = slides.length;

    function pauseAllVideos() {
      slides.forEach(function (slide) {
        var v = slide.querySelector("video");
        if (v) {
          v.pause();
        }
      });
    }

    function goTo(index) {
      if (!total) return;
      currentIndex = ((index % total) + total) % total;
      slides.forEach(function (slide, i) {
        var isActive = i === currentIndex;
        slide.classList.toggle("active", isActive);
        var v = slide.querySelector("video");
        if (v) {
          if (isActive) {
            v.play().catch(function () {});
          } else {
            v.pause();
          }
        }
      });
      beforeAfterCarousel.setAttribute("data-current", currentIndex);
      if (counterCurrent) counterCurrent.textContent = String(currentIndex + 1);
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(currentIndex + 1); });

    pauseAllVideos();
    goTo(0);
  }

  /* Portfolio: View more / View less per group */
  document.querySelectorAll(".portfolio-group").forEach(function (group) {
    var btn = group.querySelector(".portfolio-group-toggle");
    if (!btn) return;
    var moreText = btn.getAttribute("data-more") || "View more";
    var lessText = btn.getAttribute("data-less") || "View less";
    btn.addEventListener("click", function () {
      var collapsed = group.classList.contains("portfolio-group--collapsed");
      if (collapsed) {
        group.classList.remove("portfolio-group--collapsed");
        group.classList.add("portfolio-group--expanded");
        btn.textContent = lessText;
      } else {
        group.classList.add("portfolio-group--collapsed");
        group.classList.remove("portfolio-group--expanded");
        btn.textContent = moreText;
      }
    });
  });
})();
