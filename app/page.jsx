"use client";

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Client-side interactions
(function initCurrencyStreamScroll() {
      const section = document.querySelector('.section-currency-scroll');
      const leftTrack = document.querySelector('.currency-track.is-left');
      const rightTrack = document.querySelector('.currency-track.is-right');
      const msg1 = document.querySelector('.currency-msg-box.msg-phase-1');
      const msg2 = document.querySelector('.currency-msg-box.msg-phase-2');
      const viewport = document.querySelector('.currency-sticky-viewport');

      if (!section || !leftTrack || !rightTrack || !msg1 || !msg2) return;

      const leftItems = Array.from(leftTrack.querySelectorAll('.currency-number-item'));
      const rightItems = Array.from(rightTrack.querySelectorAll('.currency-number-item'));

      let ambientOffset = 0;
      let targetProgress = 0;
      let currentProgress = 0;

      function onScroll() {
        const rect = section.getBoundingClientRect();
        const scrollableDist = section.offsetHeight - window.innerHeight;
        if (scrollableDist > 0) {
          const raw = -rect.top / scrollableDist;
          targetProgress = Math.min(Math.max(raw, 0), 1);
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      onScroll();

      const loopDist = 1200;
      let vpH = window.innerHeight;
      let vpCenter = vpH / 2;
      let isMobile = window.innerWidth < 768;

      function onResize() {
        vpH = window.innerHeight;
        vpCenter = vpH / 2;
        isMobile = window.innerWidth < 768;
        onScroll();
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize, { passive: true });
      onScroll();

      // Arc config – gentle curve matching moto-card, never collides with center text
      const ARC_SCALE_MIN = 0.90;
      const ARC_SCALE_MAX = 1.06;

      function renderLoop() {
        // Smooth lerp for scroll inertia
        currentProgress += (targetProgress - currentProgress) * 0.12;
        ambientOffset += 0.32;

        const p = currentProgress;
        const arcPush = isMobile ? 16 : 36;

        // 1. Vertical motion — left column streams up, right streams down
        const leftY = -((p * 950 + ambientOffset) % loopDist);
        const rightY = -(((1 - p) * 950 + ambientOffset * 0.85) % loopDist);

        // Apply vertical translation to entire tracks (no horizontal shift on the track itself)
        leftTrack.style.transform = `translate3d(0, ${leftY.toFixed(1)}px, 0)`;
        rightTrack.style.transform = `translate3d(0, ${rightY.toFixed(1)}px, 0)`;

        // 2. Per-item ARC effect – items near viewport center gently curve inward + slight scale
        const viewportRect = viewport ? viewport.getBoundingClientRect() : { top: 0 };
        const viewportTop = viewportRect.top;

        leftItems.forEach((item) => {
          const rect = item.getBoundingClientRect();
          const itemCenterY = rect.top + rect.height / 2 - viewportTop;
          // Normalize: 0 at viewport center, 1 at top/bottom edges
          const distFromCenter = Math.abs(itemCenterY - vpCenter) / vpCenter;
          const proximity = Math.max(0, 1 - distFromCenter); // 1 at center, 0 at edges
          const smoothProx = proximity * proximity; // ease-in curve
          // Left column: gentle push RIGHT (positive X) toward center
          const pushX = smoothProx * arcPush;
          const scale = ARC_SCALE_MIN + (ARC_SCALE_MAX - ARC_SCALE_MIN) * smoothProx;
          item.style.transform = `translate3d(${pushX.toFixed(1)}px, 0, 0) scale(${scale.toFixed(3)})`;
        });

        rightItems.forEach((item) => {
          const rect = item.getBoundingClientRect();
          const itemCenterY = rect.top + rect.height / 2 - viewportTop;
          const distFromCenter = Math.abs(itemCenterY - vpCenter) / vpCenter;
          const proximity = Math.max(0, 1 - distFromCenter);
          const smoothProx = proximity * proximity;
          // Right column: gentle push LEFT (negative X) toward center
          const pushX = -(smoothProx * arcPush);
          const scale = ARC_SCALE_MIN + (ARC_SCALE_MAX - ARC_SCALE_MIN) * smoothProx;
          item.style.transform = `translate3d(${pushX.toFixed(1)}px, 0, 0) scale(${scale.toFixed(3)})`;
        });

        // 3. Text crossfade: Phase 1 -> Phase 2 (expanding & scaling up while dissolving upward)
        if (p < 0.18) {
          msg1.style.opacity = '1';
          msg1.style.transform = 'translate3d(0, 0, 0) scale(1)';
          msg1.style.filter = 'blur(0px)';

          msg2.style.opacity = '0';
          msg2.style.transform = 'translate3d(0, 48px, 0) scale(0.92)';
          msg2.style.filter = 'blur(12px)';
        } else if (p <= 0.36) {
          const t = (p - 0.18) / 0.18; // 0..1
          const op1 = Math.max(0, 1 - t * 1.3);
          const sc1 = 1 + t * 0.08;
          msg1.style.opacity = op1.toFixed(3);
          msg1.style.transform = `translate3d(0, ${(-t * 48).toFixed(1)}px, 0) scale(${sc1.toFixed(3)})`;
          msg1.style.filter = `blur(${(t * 12).toFixed(1)}px)`;

          const t2 = Math.max(0, (t - 0.15) / 0.85);
          const op2 = Math.min(1, t2 * 1.3);
          const sc2 = 0.92 + t2 * 0.08;
          msg2.style.opacity = op2.toFixed(3);
          msg2.style.transform = `translate3d(0, ${((1 - t2) * 48).toFixed(1)}px, 0) scale(${sc2.toFixed(3)})`;
          msg2.style.filter = `blur(${((1 - t2) * 12).toFixed(1)}px)`;
        } else {
          msg1.style.opacity = '0';
          msg1.style.transform = 'translate3d(0, -48px, 0) scale(1.08)';
          msg1.style.filter = 'blur(12px)';

          msg2.style.opacity = '1';
          msg2.style.transform = 'translate3d(0, 0, 0) scale(1)';
          msg2.style.filter = 'blur(0px)';
        }

        requestAnimationFrame(renderLoop);
      }

      requestAnimationFrame(renderLoop);
    })();

    /* ================= HOW IT WORKS PINNED DISSOLVE ENGINE ================= */
    (function initHowItWorksDissolveEngine() {
      const section = document.querySelector('.section-how-pinned');
      if (!section) return;

      const panes = Array.from(section.querySelectorAll('.step-pane'));
      if (!panes.length) return;

      const stepControllers = panes.map((pane, index) => {
        const stage1 = pane.querySelector('.step-stage-1');
        const stage1Img = pane.querySelector('.step-stage1-img');
        const stage2 = pane.querySelector('.step-stage-2');
        const medallion = pane.querySelector('.step-medallion-container');
        const leftLines = Array.from(pane.querySelectorAll('.step-line.is-left'));
        const rightLines = Array.from(pane.querySelectorAll('.step-line.is-right'));
        const numLines = Math.min(leftLines.length, rightLines.length);

        return {
          pane,
          stage1,
          stage1Img,
          stage2,
          medallion,
          leftLines,
          rightLines,
          numLines,
          index
        };
      });

      let targetProgress = 0;
      let currentProgress = 0;

      function onScroll() {
        const rect = section.getBoundingClientRect();
        const scrollableDist = section.offsetHeight - window.innerHeight;
        if (scrollableDist > 0) {
          const raw = -rect.top / scrollableDist;
          targetProgress = Math.min(Math.max(raw, 0), 1);
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      onScroll();

      // Timeline windows for dissolving between steps:
      // Step 1: active 0.00 -> 0.28, dissolves out into Step 2 between 0.28 and 0.36
      // Step 2: dissolves in 0.28 -> 0.36, active 0.36 -> 0.62, dissolves out into Step 3 between 0.62 and 0.70
      // Step 3: dissolves in 0.62 -> 0.70, active 0.70 -> 0.98, stays settled through 1.00
      const windows = [
        { enterStart: 0.00, enterEnd: 0.00, exitStart: 0.28, exitEnd: 0.36 },
        { enterStart: 0.28, enterEnd: 0.36, exitStart: 0.62, exitEnd: 0.70 },
        { enterStart: 0.62, enterEnd: 0.70, exitStart: 1.00, exitEnd: 1.00 }
      ];

      function renderLoop() {
        currentProgress += (targetProgress - currentProgress) * 0.12;
        const p = currentProgress;

        stepControllers.forEach((ctrl, i) => {
          const w = windows[i];
          let paneOpacity = 0;
          let paneTranslateY = 0;
          let paneScale = 1;

          // 1. Calculate Pane Dissolve Opacity & Transform (expanding & scaling up while dissolving upward)
          if (p < w.enterStart) {
            paneOpacity = 0;
            paneTranslateY = 36;
            paneScale = 0.92;
          } else if (p < w.enterEnd) {
            // Dissolving in: expanding up from 0.92 to 1.0 while rising
            const t = (p - w.enterStart) / (w.enterEnd - w.enterStart);
            const easeT = t * t * (3 - 2 * t);
            paneOpacity = easeT;
            paneTranslateY = (1 - easeT) * 36;
            paneScale = 0.92 + 0.08 * easeT;
          } else if (p <= w.exitStart) {
            // Fully active
            paneOpacity = 1;
            paneTranslateY = 0;
            paneScale = 1;
          } else if (p < w.exitEnd) {
            // Dissolving out into next step: expands up to 1.06 while dissolving upward
            const t = (p - w.exitStart) / (w.exitEnd - w.exitStart);
            const easeT = t * t * (3 - 2 * t);
            paneOpacity = 1 - easeT;
            paneTranslateY = -easeT * 36;
            paneScale = 1 + 0.06 * easeT;
          } else {
            paneOpacity = 0;
            paneTranslateY = -36;
            paneScale = 1.06;
          }

          const paneBlur = paneOpacity < 0.99 ? ((1 - paneOpacity) * 10).toFixed(1) : 0;
          ctrl.pane.style.opacity = paneOpacity.toFixed(3);
          ctrl.pane.style.transform = `translate3d(0, ${paneTranslateY.toFixed(1)}px, 0) scale(${paneScale.toFixed(3)})`;
          ctrl.pane.style.filter = `blur(${paneBlur}px)`;
          ctrl.pane.style.pointerEvents = paneOpacity > 0.5 ? 'auto' : 'none';

          if (paneOpacity <= 0.001) return; // Skip sub-animations if completely invisible

          // 2. Local step animation (Stage 1 -> Stage 2 -> Kinetic Scrub)
          const localTotal = w.exitStart - w.enterStart;
          const localP = Math.min(1, Math.max(0, (p - w.enterStart) / localTotal));

          // Stage 1 vs Stage 2 Transition (scale & dissolve upward)
          if (ctrl.stage1 && ctrl.stage2) {
            if (localP < 0.22) {
              ctrl.stage1.style.opacity = '1';
              ctrl.stage1.style.transform = 'translate3d(0, 0, 0) scale(1)';
              ctrl.stage1.style.filter = 'blur(0px)';
              ctrl.stage2.style.opacity = '0';
              ctrl.stage2.style.transform = 'translate3d(0, 24px, 0) scale(0.92)';
              ctrl.stage2.style.filter = 'blur(8px)';
            } else if (localP <= 0.34) {
              const t = (localP - 0.22) / 0.12;
              const easeT = t * t * (3 - 2 * t);
              const sc1 = 1 + easeT * 0.06;
              ctrl.stage1.style.opacity = Math.max(0, 1 - easeT * 1.2).toFixed(3);
              ctrl.stage1.style.transform = `translate3d(0, ${(-easeT * 30).toFixed(1)}px, 0) scale(${sc1.toFixed(3)})`;
              ctrl.stage1.style.filter = `blur(${(easeT * 8).toFixed(1)}px)`;

              const t2 = Math.max(0, (t - 0.25) / 0.75);
              const easeT2 = t2 * t2 * (3 - 2 * t2);
              const sc2 = 0.92 + easeT2 * 0.08;
              ctrl.stage2.style.opacity = Math.min(1, easeT2 * 1.1).toFixed(3);
              ctrl.stage2.style.transform = `translate3d(0, ${((1 - easeT2) * 24).toFixed(1)}px, 0) scale(${sc2.toFixed(3)})`;
              ctrl.stage2.style.filter = `blur(${((1 - easeT2) * 8).toFixed(1)}px)`;
            } else {
              ctrl.stage1.style.opacity = '0';
              ctrl.stage1.style.transform = 'translate3d(0, -30px, 0) scale(1.06)';
              ctrl.stage1.style.filter = 'blur(8px)';
              ctrl.stage2.style.opacity = '1';
              ctrl.stage2.style.transform = 'translate3d(0, 0, 0) scale(1)';
              ctrl.stage2.style.filter = 'blur(0px)';
            }
          }

          // Medallion Subtle Motion
          if (ctrl.medallion && localP >= 0.22) {
            const rot = (localP * 24).toFixed(2);
            const sc = (0.95 + localP * 0.08).toFixed(3);
            ctrl.medallion.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${sc})`;
          }

          // Kinetic Dual-Column Typography Scrub
          const scrubStart = 0.34;
          const scrubEnd = 0.92;
          const scrubP = Math.min(1, Math.max(0, (localP - scrubStart) / (scrubEnd - scrubStart)));

          const stepDuration = 0.24;
          const travelSpan = 1 - stepDuration;

          for (let k = 0; k < ctrl.numLines; k++) {
            const itemStart = (k / Math.max(1, ctrl.numLines - 1)) * travelSpan;
            const itemEnd = itemStart + stepDuration;

            const rEl = ctrl.rightLines[k];
            const lEl = ctrl.leftLines[k];
            if (!rEl || !lEl) continue;

            if (scrubP < itemStart) {
              rEl.style.transform = 'scale(1) translate3d(0, 0, 0)';
              rEl.style.opacity = '1';
              lEl.style.transform = 'scale(0) translate3d(0, 0, 0)';
              lEl.style.opacity = '0';
            } else if (scrubP <= itemEnd) {
              const rawK = (scrubP - itemStart) / stepDuration;
              const easeK = rawK * rawK * (3 - 2 * rawK);

              const scaleR = Math.max(0, 1 - easeK);
              const opR = Math.max(0, 1 - easeK * 1.15);
              rEl.style.transform = `scale(${scaleR.toFixed(3)}) translate3d(0, ${(easeK * 12).toFixed(1)}px, 0)`;
              rEl.style.opacity = opR.toFixed(3);

              const scaleL = Math.max(0, easeK);
              const opL = Math.min(1, easeK * 1.3);
              lEl.style.transform = `scale(${scaleL.toFixed(3)}) translate3d(0, ${((1 - easeK) * -12).toFixed(1)}px, 0)`;
              lEl.style.opacity = opL.toFixed(3);
            } else {
              rEl.style.transform = 'scale(0) translate3d(0, 12px, 0)';
              rEl.style.opacity = '0';
              lEl.style.transform = 'scale(1) translate3d(0, 0, 0)';
              lEl.style.opacity = '0.9';
            }
          }
        });

        requestAnimationFrame(renderLoop);
      }

      requestAnimationFrame(renderLoop);

    })();

(function initCardsAutoLoopPan() {
      const section = document.getElementById('the-cards');
      if (!section) return;

      const track = document.getElementById('cardsPanTrack');
      if (!track) return;

      const frames = Array.from(section.querySelectorAll('.cards-pan-frame'));
      const nameWrap = document.getElementById('edNameWrap');
      const nameEl = document.getElementById('edName');
      const descEl = document.getElementById('edDesc');
      const countEl = document.getElementById('edCount');
      const pills = Array.from(section.querySelectorAll('.cards-ed-pill'));

      const editions = [
        { name: 'Checker Edition', desc: 'Black, white, and one red square. The one people ask about.' },
        { name: 'Classic', desc: 'Red through and through. The everyday card.' },
        { name: 'Premium', desc: 'Black on black. Just the mark.' }
      ];

      // Track has 4 frames: 0: Checker, 1: Classic, 2: Premium, 3: Checker (clone)
      let currentTrackIndex = 0;
      let isTransitioning = false;
      const AUTO_DURATION = 2400; // 2.4s per edition for responsive, active pacing
      let autoTimer = null;

      function updateActiveUI(displayIndex) {
        // Typography animation
        if (nameWrap && descEl) {
          nameWrap.classList.remove('is-visible');
          descEl.classList.remove('is-visible');

          setTimeout(() => {
            if (nameEl) nameEl.textContent = editions[displayIndex].name;
            if (descEl) descEl.textContent = editions[displayIndex].desc;
            if (countEl) countEl.textContent = String(displayIndex + 1).padStart(2, '0');

            void nameWrap.offsetWidth; // Reflow
            nameWrap.classList.add('is-visible');
            descEl.classList.add('is-visible');
          }, 150);
        }

        // Pill tabs active state
        pills.forEach((pill, i) => {
          const isActive = i === displayIndex;
          pill.classList.toggle('is-active', isActive);
          pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
      }

      function goToTrackIndex(targetTrackIndex, animate = true) {
        isTransitioning = true;
        currentTrackIndex = targetTrackIndex;
        const displayIndex = currentTrackIndex % 3;

        // Active frame class for zoom drift
        frames.forEach((frame, i) => {
          frame.classList.toggle('is-active', i === currentTrackIndex);
        });

        // Update text, counter, and pills
        updateActiveUI(displayIndex);

        // Pan track horizontally
        const vw = window.innerWidth;
        if (!animate) {
          track.style.transition = 'none';
        } else {
          track.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.9, 0.3, 1)';
        }
        track.style.transform = `translate3d(${-currentTrackIndex * vw}px, 0, 0)`;

        // Handle infinite wrap when reaching clone (index 3)
        if (currentTrackIndex === 3) {
          setTimeout(() => {
            // Silently snap back to frame 0 without animation
            track.style.transition = 'none';
            currentTrackIndex = 0;
            track.style.transform = 'translate3d(0, 0, 0)';
            frames.forEach((frame, i) => {
              frame.classList.toggle('is-active', i === 0);
            });
            void track.offsetWidth; // Force reflow
            isTransitioning = false;
          }, 620);
        } else {
          setTimeout(() => {
            isTransitioning = false;
          }, 620);
        }

        startAutoProgress();
      }

      function startAutoProgress() {
        clearTimeout(autoTimer);

        // Reset progress bar on all pills
        pills.forEach((p) => {
          const bar = p.querySelector('.cards-ed-pill-progress');
          if (bar) {
            bar.style.transition = 'none';
            bar.style.width = '0%';
          }
        });

        const activeDisplayIndex = currentTrackIndex % 3;
        const activeBar = pills[activeDisplayIndex] ? pills[activeDisplayIndex].querySelector('.cards-ed-pill-progress') : null;
        if (activeBar) {
          void activeBar.offsetWidth; // Force reflow
          activeBar.style.transition = `width ${AUTO_DURATION}ms linear`;
          activeBar.style.width = '100%';
        }

        // Automatic continuous loop without touching
        autoTimer = setTimeout(() => {
          advanceNext();
        }, AUTO_DURATION);
      }

      function advanceNext() {
        if (isTransitioning) return;
        goToTrackIndex(currentTrackIndex + 1, true);
      }

      // Pill clicks allow user to quickly jump to any edition
      pills.forEach((pill) => {
        pill.addEventListener('click', (e) => {
          e.stopPropagation();
          const target = parseInt(pill.dataset.index, 10);
          goToTrackIndex(target, true);
        });
      });

      // Keyboard left/right arrows
      window.addEventListener('keydown', (e) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          if (e.key === 'ArrowRight') {
            advanceNext();
          } else if (e.key === 'ArrowLeft') {
            const prev = (currentTrackIndex - 1 + 3) % 3;
            goToTrackIndex(prev, true);
          }
        }
      });

      // Window resize handling: keep current track aligned
      window.addEventListener('resize', () => {
        const vw = window.innerWidth;
        track.style.transition = 'none';
        track.style.transform = `translate3d(${-currentTrackIndex * vw}px, 0, 0)`;
      }, { passive: true });

      // Start automatically on load
      goToTrackIndex(0, false);
    })();

(function initGlobalScrollAnimations() {
      // 1. Top Reading Progress Bar
      const progressBar = document.getElementById('globalScrollProgress');
      const navbar = document.querySelector('.navbar');
      const navLinks = Array.from(document.querySelectorAll('.navbar .nav-link'));

      // Section mappings for scrollspy
      const sections = [
        { id: 'how-it-works', el: document.getElementById('how-it-works') },
        { id: 'the-cards', el: document.getElementById('the-cards') },
        { id: 'for-businesses', el: document.getElementById('for-businesses') },
        { id: 'the-market', el: document.getElementById('the-market') },
        { id: 'faq', el: document.getElementById('faq') }
      ].filter(s => s.el !== null);

      // Hero Elements for Fade/Parallax
      const heroBody = document.querySelector('.hero-body');

      // Bento Parallax Images
      const parallaxImages = Array.from(document.querySelectorAll('.biz-tall-img, .biz-card-img, .biz-chess-img, .biz-wide-img'));

      function onGlobalScroll() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        
        // Update top progress bar
        if (progressBar && maxScroll > 0) {
          const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
          progressBar.style.transform = `scaleX(${progress})`;
        }

        // Sticky Navbar frosted glass state
        if (navbar) {
          if (scrollY > 40) {
            navbar.classList.add('is-scrolled');
          } else {
            navbar.classList.remove('is-scrolled');
          }
        }

        // Hero exit: expands & scales up while dissolving upward and softly blurring as user scrolls
        if (heroBody) {
          if (scrollY < 900) {
            const ratio = Math.min(1, Math.max(0, scrollY / 600));
            const sc = 1 + ratio * 0.08;
            const transY = -ratio * 72;
            const blur = ratio * 6;
            const op = Math.max(0, 1 - ratio * 1.35);
            heroBody.style.transform = `translate3d(-50%, ${transY.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
            heroBody.style.opacity = op.toFixed(3);
            heroBody.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : 'none';
          } else {
            heroBody.style.opacity = '0';
          }
        }

        // Active Section Scrollspy
        const scrollMid = scrollY + window.innerHeight * 0.35;
        let currentSectionId = '';
        for (let i = sections.length - 1; i >= 0; i--) {
          const sec = sections[i];
          const top = sec.el.offsetTop;
          if (scrollMid >= top) {
            currentSectionId = sec.id;
            break;
          }
        }

        if (currentSectionId) {
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentSectionId}`) {
              link.classList.add('is-active');
            } else if (href && href.startsWith('#')) {
              link.classList.remove('is-active');
            }
          });
        }

        // Bento images subtle parallax
        if (parallaxImages.length) {
          const vh = window.innerHeight;
          parallaxImages.forEach(img => {
            const parent = img.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            if (rect.top < vh && rect.bottom > 0) {
              const centerOffset = (rect.top + rect.height / 2 - vh / 2) / vh;
              // Gentle range: -18px to +18px
              const translateY = Math.max(-20, Math.min(20, centerOffset * 24));
              img.style.transform = `scale(1.08) translate3d(0, ${translateY.toFixed(1)}px, 0)`;
            }
          });
        }
      }

      window.addEventListener('scroll', onGlobalScroll, { passive: true });
      window.addEventListener('resize', onGlobalScroll, { passive: true });
      onGlobalScroll();

      // 2. High-Performance IntersectionObserver for Scroll Reveals
      const revealElements = Array.from(document.querySelectorAll('.scroll-reveal, .scroll-reveal-stagger, .scroll-reveal-expand'));
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.02,
          rootMargin: '0px 0px 40px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
      } else {
        // Fallback: immediately reveal all
        revealElements.forEach(el => el.classList.add('is-revealed'));
      }

      // 3. Smooth Anchor Click Navigation with Offset
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const targetId = this.getAttribute('href');
          if (!targetId || targetId === '#') return;
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            const navHeight = navbar ? navbar.offsetHeight : 64;
            const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - (navHeight - 8);
            window.scrollTo({
              top: Math.max(0, targetPos),
              behavior: 'smooth'
            });
          }
        });
      });
    })();

(function initMobileNavDrawer() {
      const hamburger = document.getElementById('navHamburger');
      const drawer = document.getElementById('mobileNavDrawer');
      const backdrop = document.getElementById('mobileNavBackdrop');
      if (!hamburger || !drawer) return;

      const links = drawer.querySelectorAll('.mobile-nav-link, .mobile-nav-cta, .mobile-nav-sublink');

      function openDrawer() {
        hamburger.classList.add('is-active');
        hamburger.setAttribute('aria-expanded', 'true');
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('mobile-nav-locked');
      }

      function closeDrawer() {
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('mobile-nav-locked');
      }

      function toggleDrawer() {
        const isOpen = drawer.classList.contains('is-open');
        if (isOpen) {
          closeDrawer();
        } else {
          openDrawer();
        }
      }

      hamburger.addEventListener('click', toggleDrawer);
      if (backdrop) {
        backdrop.addEventListener('click', closeDrawer);
      }

      links.forEach(link => {
        link.addEventListener('click', () => {
          closeDrawer();
        });
      });

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
          closeDrawer();
        }
      });
    })();

(function initCoinbaseMarket() {
      const heroLabel = document.getElementById('cb-hero-label');
      const heroVal = document.getElementById('cb-hero-val');
      const heroChange = document.getElementById('cb-hero-change');
      const maskPath = document.getElementById('cb-mask-path');
      const linePath = document.getElementById('cb-line-path');
      const dotCircle = document.getElementById('cb-dot-circle');
      const volVal = document.getElementById('cb-vol-val');
      const volChange = document.getElementById('cb-vol-change');
      const buyVal = document.getElementById('cb-buy-val');
      const buyChange = document.getElementById('cb-buy-change');
      const shopCards = document.querySelectorAll('.cb-shop-card');

      if (!heroVal || !shopCards.length) return;

      const data = {
        default: {
          label: 'Market cap',
          val: '₦1.12B',
          pct: '14.8%',
          trend: 'up',
          line: 'M 0,80 Q 25,95 50,75 T 100,55 T 150,70 T 200,45 T 250,55 T 290,25 T 320,15',
          mask: 'M 0,80 Q 25,95 50,75 T 100,55 T 150,70 T 200,45 T 250,55 T 290,25 T 320,15 L 320,120 L 0,120 Z',
          vol: '₦84.6M',
          volPct: '4.2%',
          volTrend: 'down',
          buy: '82% buy',
          buyPct: '1.15%',
          buyTrend: 'up'
        },
        probekit: {
          label: 'Probe Kitchens cap',
          val: '₦320m',
          pct: '14.80%',
          trend: 'up',
          line: 'M 0,85 Q 30,90 60,70 T 120,60 T 180,45 T 240,30 T 320,18',
          mask: 'M 0,85 Q 30,90 60,70 T 120,60 T 180,45 T 240,30 T 320,18 L 320,120 L 0,120 Z',
          vol: '₦28.4M',
          volPct: '6.5%',
          volTrend: 'up',
          buy: '86% buy',
          buyPct: '2.1%',
          buyTrend: 'up'
        },
        blaze: {
          label: 'BLAZE market cap',
          val: '₦225m',
          pct: '8.20%',
          trend: 'up',
          line: 'M 0,75 Q 35,80 70,72 T 140,58 T 210,65 T 270,35 T 320,28',
          mask: 'M 0,75 Q 35,80 70,72 T 140,58 T 210,65 T 270,35 T 320,28 L 320,120 L 0,120 Z',
          vol: '₦19.2M',
          volPct: '1.8%',
          volTrend: 'down',
          buy: '74% buy',
          buyPct: '0.9%',
          buyTrend: 'up'
        },
        tsionark: {
          label: 'TSION ARK cap',
          val: '₦22m',
          pct: '21.50%',
          trend: 'up',
          line: 'M 0,95 Q 40,90 80,75 T 160,50 T 220,35 T 280,18 T 320,10',
          mask: 'M 0,95 Q 40,90 80,75 T 160,50 T 220,35 T 280,18 T 320,10 L 320,120 L 0,120 Z',
          vol: '₦4.8M',
          volPct: '15.2%',
          volTrend: 'up',
          buy: '91% buy',
          buyPct: '4.2%',
          buyTrend: 'up'
        },
        melite: {
          label: 'Maison Élite cap',
          val: '₦150m',
          pct: '3.40%',
          trend: 'down',
          line: 'M 0,35 Q 40,30 80,45 T 160,60 T 230,55 T 280,75 T 320,82',
          mask: 'M 0,35 Q 40,30 80,45 T 160,60 T 230,55 T 280,75 T 320,82 L 320,120 L 0,120 Z',
          vol: '₦12.5M',
          volPct: '5.1%',
          volTrend: 'down',
          buy: '68% buy',
          buyPct: '1.4%',
          buyTrend: 'down'
        },
        kover: {
          label: 'Kover Studio cap',
          val: '₦410m',
          pct: '12.10%',
          trend: 'up',
          line: 'M 0,70 Q 30,75 70,60 T 130,50 T 200,42 T 260,25 T 320,16',
          mask: 'M 0,70 Q 30,75 70,60 T 130,50 T 200,42 T 260,25 T 320,16 L 320,120 L 0,120 Z',
          vol: '₦31.2M',
          volPct: '8.4%',
          volTrend: 'up',
          buy: '88% buy',
          buyPct: '3.0%',
          buyTrend: 'up'
        }
      };

      let activeKey = null;

      function applyData(item) {
        if (heroLabel) heroLabel.textContent = item.label;
        if (heroVal) heroVal.textContent = item.val;
        
        const isUp = item.trend === 'up';
        const color = isUp ? '#098551' : '#cf202f';
        
        if (heroChange) {
          heroChange.className = 'cb-metric-change ' + item.trend;
          const iconSvg = isUp
            ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"/></svg>'
            : '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2.5L9.5 9.5M9.5 9.5H4.5M9.5 9.5V4.5"/></svg>';
          heroChange.innerHTML = iconSvg + '<span id="cb-hero-pct">' + item.pct + '</span>';
        }

        if (linePath) {
          linePath.setAttribute('d', item.line);
          linePath.setAttribute('stroke', color);
        }
        if (maskPath) maskPath.setAttribute('d', item.mask);
        if (dotCircle) dotCircle.setAttribute('fill', color);

        // Volume
        if (volVal) volVal.textContent = item.vol;
        if (volChange) {
          volChange.className = 'cb-metric-change ' + item.volTrend;
          const volIsUp = item.volTrend === 'up';
          const volSvg = volIsUp
            ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"/></svg>'
            : '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2.5L9.5 9.5M9.5 9.5H4.5M9.5 9.5V4.5"/></svg>';
          volChange.innerHTML = volSvg + '<span id="cb-vol-pct">' + item.volPct + '</span>';
        }

        // Buy ratio
        if (buyVal) buyVal.textContent = item.buy;
        if (buyChange) {
          buyChange.className = 'cb-metric-change ' + item.buyTrend;
          const buyIsUp = item.buyTrend === 'up';
          const buySvg = buyIsUp
            ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"/></svg>'
            : '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2.5L9.5 9.5M9.5 9.5H4.5M9.5 9.5V4.5"/></svg>';
          buyChange.innerHTML = buySvg + '<span id="cb-buy-pct">' + item.buyPct + '</span>';
        }
      }

      shopCards.forEach(card => {
        const handleSelect = () => {
          const key = card.getAttribute('data-key');
          if (activeKey === key) {
            activeKey = null;
            shopCards.forEach(c => c.classList.remove('active'));
            applyData(data.default);
          } else {
            activeKey = key;
            shopCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            if (data[key]) applyData(data[key]);
          }
        };

        card.addEventListener('click', handleSelect);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect();
          }
        });
      });

      const heroCard = document.getElementById('cb-hero-card');
      if (heroCard) {
        heroCard.addEventListener('click', () => {
          activeKey = null;
          shopCards.forEach(c => c.classList.remove('active'));
          applyData(data.default);
        });
      }
    })();
  }, []);

  return (
    <>
{/* Top Global Scroll Reading Progress Bar */}
  <div className="global-scroll-progress" id="globalScrollProgress" aria-hidden="true"></div>

  {/* ================= SECTION 1: HERO SECTION ================= */}
  <div className="hero-stage" id="home">
    <div className="hero-bg">
      <video autoPlay muted loop playsInline>
        <source src="/Lady_swiping_card_for_payment_20260929211004.mp4" type="video/mp4" />
      </video>
    </div>
    <div className="hero-overlay"></div>

    <header className="navbar">
      <a href="#home" className="brand-logo" aria-label="Freedom">
        <svg className="brand-logo-svg navbar-logo" viewbox="-2 9 89 74" role="img" aria-label="Freedom Bird">
          <path fill="currentColor" d="M35.3751 40.5314L7.00804 11.9337C6.60458 11.527 5.92129 11.7251 5.84565 12.293C5.06196 18.1764 7.74057 25.6995 9.89408 30.2249C10.2008 30.8695 9.50664 31.5825 8.8647 31.2702C6.89863 30.3138 4.2884 29.0513 2.05901 27.9921C1.53752 27.7443 0.96468 28.1712 1.10398 28.7315C2.10841 32.7714 5.18269 37.3582 7.44167 40.2027C7.86869 40.7405 7.41118 41.5575 6.73343 41.4473C5.07632 41.178 3.04296 40.8431 1.45784 40.5707C0.861348 40.4682 0.412268 41.0871 0.73443 41.5995C3.9151 46.658 9.84962 50.6479 13.9325 52.7981C14.5871 53.1429 14.4271 54.197 13.6945 54.3001C12.1843 54.5127 10.491 54.7553 9.21279 54.9488C8.64465 55.0348 8.41741 55.7008 8.85771 56.07C12.9748 59.5225 21.3768 61.2976 26.4229 61.9209C27.0378 61.9969 27.3108 62.7529 26.8727 63.191L19.6257 70.438C19.3354 70.7284 19.3415 71.2005 19.6508 71.4706C23.259 74.621 28.4889 76.8065 31.0971 77.651C31.3489 77.7326 31.6217 77.6643 31.8118 77.4801L34.1586 75.2066C34.6216 74.7581 35.3962 75.0858 35.3962 75.7304V78.1313C35.3962 78.4319 35.579 78.7038 35.8647 78.7975C39.6788 80.048 45.9134 79.4994 49.1499 78.9758C49.4981 78.9195 49.7493 78.6168 49.7493 78.2641V76.1272C49.7493 75.4616 50.5743 75.1367 51.0389 75.6134C51.7778 76.3715 52.5906 77.1653 53.1258 77.5835C53.2939 77.7149 53.517 77.7415 53.72 77.676C59.6438 75.7622 63.7406 72.9956 65.514 71.4601C65.8187 71.1963 65.8188 70.737 65.5341 70.4516C63.5321 68.4439 60.2045 65.0783 58.2306 62.9903C57.8048 62.54 58.1169 61.8088 58.7355 61.7704C68.222 61.181 73.7742 58.1772 76.1068 56.0898C76.5306 55.7106 76.2739 55.0741 75.7093 55.0065C74.2627 54.8334 72.3424 54.582 70.7175 54.3143C70.0425 54.2031 69.9238 53.3222 70.5252 52.9961C78.9046 48.4516 82.932 43.8991 84.3728 41.3439C84.6496 40.8529 84.2104 40.3421 83.6592 40.4602C82.3228 40.7467 80.4338 41.1487 78.5091 41.5514C77.8129 41.6971 77.3231 40.8423 77.7727 40.2912C81.4261 35.8134 83.2326 31.3025 83.9078 28.6805C84.0493 28.1308 83.5086 27.7025 82.9905 27.9342C81.5745 28.5677 79.2768 29.6435 76.3482 31.125C75.7146 31.4455 75.0146 30.7566 75.3054 30.1088C78.6669 22.6204 79.0828 16.2155 78.7663 12.905C78.7119 12.3354 78.0522 12.1146 77.6426 12.5142C73.9853 16.0816 61.5197 28.3901 32.8283 56.994C32.5175 57.3038 31.994 57.281 31.7453 56.9195C27.17 50.2684 31.7646 44.3282 35.2747 41.6805C35.6433 41.4025 35.7002 40.8592 35.3751 40.5314Z M34.441 46.1547C33.6845 47.144 33.3253 48.3567 33.1761 49.3712C33.0838 49.9987 33.794 50.27 34.2236 49.8035L37.3603 46.3979C36.9143 45.6276 35.7061 44.5004 34.441 46.1547Z"></path>
        </svg>
        <span className="brand-text">FREEDOM</span>
      </a>

      <ul className="nav-links">
        <li><a href="#how-it-works" className="nav-link">How It Works</a></li>
        <li><a href="#the-cards" className="nav-link">The Cards</a></li>
        <li><a href="#for-businesses" className="nav-link">For Businesses</a></li>
        <li><a href="#the-market" className="nav-link">The Market</a></li>
        <li><a href="#faq" className="nav-link">FAQ</a></li>
      </ul>

      <div className="nav-right-group">
        <a href="https://app.freedomnetwork.xyz/sign-in" className="nav-action-btn">
          <span>Get Your Card</span>
          <span className="nav-btn-arrow">
            <svg width="10" height="10" viewbox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="10" x2="10" y2="2"></line>
              <polyline points="3 2 10 2 10 9"></polyline>
            </svg>
          </span>
        </a>

        <button className="nav-hamburger" id="navHamburger" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobileNavDrawer">
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>
    </header>

    {/* Mobile Navigation Drawer Overlay */}
    <div className="mobile-nav-drawer" id="mobileNavDrawer" aria-hidden="true">
      <div className="mobile-nav-backdrop" id="mobileNavBackdrop"></div>
      <div className="mobile-nav-panel">
        <div className="mobile-nav-links">
          <a href="#how-it-works" className="mobile-nav-link">
            <span className="mobile-nav-num">01</span>
            <span className="mobile-nav-title">How It Works</span>
          </a>
          <a href="#the-cards" className="mobile-nav-link">
            <span className="mobile-nav-num">02</span>
            <span className="mobile-nav-title">The Cards</span>
          </a>
          <a href="#for-businesses" className="mobile-nav-link">
            <span className="mobile-nav-num">03</span>
            <span className="mobile-nav-title">For Businesses</span>
          </a>
          <a href="#the-market" className="mobile-nav-link">
            <span className="mobile-nav-num">04</span>
            <span className="mobile-nav-title">The Market</span>
          </a>
          <a href="#faq" className="mobile-nav-link">
            <span className="mobile-nav-num">05</span>
            <span className="mobile-nav-title">FAQ</span>
          </a>
        </div>
        <div className="mobile-nav-footer">
          <a href="https://app.freedomnetwork.xyz/sign-in" className="mobile-nav-cta">
            <span>Get Your Card</span>
            <span className="nav-btn-arrow">
              <svg width="10" height="10" viewbox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="2" y1="10" x2="10" y2="2"></line>
                <polyline points="3 2 10 2 10 9"></polyline>
              </svg>
            </span>
          </a>
          <a href="https://exchange.freedomnetwork.xyz" className="mobile-nav-sublink" target="_blank" rel="noopener">
            <span>Freedom Exchange</span>
            <svg width="12" height="12" viewbox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="10" x2="10" y2="2"></line>
              <polyline points="3 2 10 2 10 9"></polyline>
            </svg>
          </a>
        </div>
      </div>
    </div>



    {/* Centered Hero Text & CTAs */}
    <main className="hero-body">
      <h2 className="heading-top">A Card That Makes</h2>
      <h1 className="heading-main">Money For You.</h1>

      <p className="hero-subtext">Tap To Pay At Any Freedom Shop And You Own A Slice Of It. Every Time.</p>

      <div className="cta-row">
        <a href="https://app.freedomnetwork.xyz/sign-in" className="btn-card">
          <span>Get Your Card</span>
          <span className="btn-card-circle">
            <svg width="10" height="10" viewbox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="10" x2="10" y2="2"></line>
              <polyline points="3 2 10 2 10 9"></polyline>
            </svg>
          </span>
        </a>

        <a href="https://exchange.freedomnetwork.xyz" className="btn-business">
          List your bussiness
        </a>
      </div>
    </main>

    {/* Bottom Ticker */}
    <footer className="hero-ticker-bar">
      <div className="ticker-label">
        <span>THE FREEDOM CARD</span>
      </div>
    </footer>
  </div>

  {/* ================= SECTION 1.5: CURRENCY STREAM SCROLL (MOTO-CARD STYLE) ================= */}
  <section className="section-currency-scroll" id="spend-globally">
    <div className="currency-sticky-viewport">
      
      {/* Streaming Currency Tracks */}
      <div className="currency-tracks-container" aria-hidden="true">
        {/* Left Track (streams upwards) */}
        <div className="currency-track is-left">
          <div className="currency-number-item">¥20,000</div>
          <div className="currency-number-item">CHF 40.000</div>
          <div className="currency-number-item">CHF 40.000</div>
          <div className="currency-number-item">£15.000</div>
          <div className="currency-number-item">₩22.000</div>
          <div className="currency-number-item">¥20,000</div>
          <div className="currency-number-item">€12.500</div>
          <div className="currency-number-item">₺28.000</div>
          <div className="currency-number-item">$50,000</div>
          <div className="currency-number-item">₦350,000</div>
          <div className="currency-number-item">CHF 40.000</div>
          <div className="currency-number-item">£15.000</div>
          <div className="currency-number-item">₩22.000</div>
          <div className="currency-number-item">¥20,000</div>
          <div className="currency-number-item">€12.500</div>
          <div className="currency-number-item">₺28.000</div>
          <div className="currency-number-item">CA$30.000</div>
          <div className="currency-number-item">¥20,000</div>
          <div className="currency-number-item">CHF 40.000</div>
          <div className="currency-number-item">£15.000</div>
          <div className="currency-number-item">₩22.000</div>
          <div className="currency-number-item">€12.500</div>
          <div className="currency-number-item">₺28.000</div>
          <div className="currency-number-item">¥20,000</div>
          <div className="currency-number-item">CHF 40.000</div>
        </div>

        {/* Right Track (streams in reverse/opposite direction) */}
        <div className="currency-track is-right">
          <div className="currency-number-item">¥20,000</div>
          <div className="currency-number-item">CHF 40.000</div>
          <div className="currency-number-item">CHF 40.000</div>
          <div className="currency-number-item">£15.000</div>
          <div className="currency-number-item">₩22.000</div>
          <div className="currency-number-item">¥20,000</div>
          <div className="currency-number-item">€12.500</div>
          <div className="currency-number-item">₺28.000</div>
          <div className="currency-number-item">$50,000</div>
          <div className="currency-number-item">₦350,000</div>
          <div className="currency-number-item">CHF 40.000</div>
          <div className="currency-number-item">£15.000</div>
          <div className="currency-number-item">₩22.000</div>
          <div className="currency-number-item">¥20,000</div>
          <div className="currency-number-item">€12.500</div>
          <div className="currency-number-item">₺28.000</div>
          <div className="currency-number-item">CA$30.000</div>
          <div className="currency-number-item">¥20,000</div>
          <div className="currency-number-item">CHF 40.000</div>
          <div className="currency-number-item">£15.000</div>
          <div className="currency-number-item">₩22.000</div>
          <div className="currency-number-item">€12.500</div>
          <div className="currency-number-item">₺28.000</div>
          <div className="currency-number-item">¥20,000</div>
          <div className="currency-number-item">CHF 40.000</div>
        </div>
      </div>

      {/* Center Morphing Typography Stage */}
      <div className="currency-center-stage">
        {/* Message Phase 1: SPEND GLOBALLY. OWN WHERE YOU TAP. */}
        <div className="currency-msg-box msg-phase-1">
          <h2 className="currency-headline">
            SPEND GLOBALLY.<br />
            OWN WHERE YOU TAP.
          </h2>
        </div>

        {/* Message Phase 2: Frictionless tap / Every purchase buys equity */}
        <div className="currency-msg-box msg-phase-2">
          <div className="currency-features-list">
            <div className="currency-feature-line">Frictionless tap</div>
            <div className="currency-feature-line">Every purchase buys equity</div>

          </div>
        </div>
      </div>

    </div>
  </section>

  {/* ================= SECTION 2: HOW IT WORKS (PINNED DISSOLVE STAGE) ================= */}
  <section className="section-how-pinned" id="how-it-works">
    <div className="how-sticky-viewport">

      {/* ================= STEP PANE 01: TAP ================= */}
      <div className="step-pane is-active" data-step="1">
        {/* Right Side: Visual Artwork filling the white space */}
        <div className="step-pane-right-visual">
          <img className="step-split-img" src="/step1-panel.png" alt="Freedom Card contactless tap payment" />
        </div>

        {/* Left Side: Black Background */}
        <div className="step-pane-left-bg"></div>

        {/* Stage 1: Pinned Content */}
        <div className="step-stage-1">
          <div className="step-stage1-body">
            <div className="step-stage1-header">
              <div className="step-premise-block">
                <h2 className="step-premise">
                  <span>3 things happen</span>
                  <span>when you tap.</span>
                </h2>
              </div>
              <div className="step-stage1-action-group">
                <h3 className="step-stage1-title">
                  <span className="step-title-action">01 · TAP.</span>
                  <span className="step-title-sub">Pay like any card.</span>
                </h3>
              </div>
            </div>
          </div>
          <div className="step-stage1-bottom">
            <ul className="step-feature-bullets">
              <li>Instant Contactless — Pay with card, phone, or watch</li>
              <li>Zero Foreign Fees — True interbank FX in 150+ countries</li>
              <li>Global Acceptance — Powered by the worldwide Visa network</li>
            </ul>
          </div>
        </div>

        {/* Stage 2: Kinetic Dual-Column Scrub (Text Animation) */}
        <div className="step-stage-2">
          <div className="step-medallion-container" aria-hidden="true">
            <svg className="step-medallion-svg" viewbox="0 0 354 383" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="177" cy="191" r="172" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="1.5" stroke-dasharray="4 4"></circle>
              <circle cx="177" cy="191" r="158" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1"></circle>
              <path d="M35.3751 40.5314L7.00804 11.9337C6.60458 11.527 5.92129 11.7251 5.84565 12.293C5.06196 18.1764 7.74057 25.6995 9.89408 30.2249C10.2008 30.8695 9.50664 31.5825 8.8647 31.2702C6.89863 30.3138 4.2884 29.0513 2.05901 27.9921C1.53752 27.7443 0.96468 28.1712 1.10398 28.7315C2.10841 32.7714 5.18269 37.3582 7.44167 40.2027C7.86869 40.7405 7.41118 41.5575 6.73343 41.4473C5.07632 41.178 3.04296 40.8431 1.45784 40.5707C0.861348 40.4682 0.412268 41.0871 0.73443 41.5995C3.9151 46.658 9.84962 50.6479 13.9325 52.7981C14.5871 53.1429 14.4271 54.197 13.6945 54.3001C12.1843 54.5127 10.491 54.7553 9.21279 54.9488C8.64465 55.0348 8.41741 55.7008 8.85771 56.07C12.9748 59.5225 21.3768 61.2976 26.4229 61.9209C27.0378 61.9969 27.3108 62.7529 26.8727 63.191L19.6257 70.438C19.3354 70.7284 19.3415 71.2005 19.6508 71.4706C23.259 74.621 28.4889 76.8065 31.0971 77.651C31.3489 77.7326 31.6217 77.6643 31.8118 77.4801L34.1586 75.2066C34.6216 74.7581 35.3962 75.0858 35.3962 75.7304V78.1313C35.3962 78.4319 35.579 78.7038 35.8647 78.7975C39.6788 80.048 45.9134 79.4994 49.1499 78.9758C49.4981 78.9195 49.7493 78.6168 49.7493 78.2641V76.1272C49.7493 75.4616 50.5743 75.1367 51.0389 75.6134C51.7778 76.3715 52.5906 77.1653 53.1258 77.5835C53.2939 77.7149 53.517 77.7415 53.72 77.676C59.6438 75.7622 63.7406 72.9956 65.514 71.4601C65.8187 71.1963 65.8188 70.737 65.5341 70.4516C63.5321 68.4439 60.2045 65.0783 58.2306 62.9903C57.8048 62.54 58.1169 61.8088 58.7355 61.7704C68.222 61.181 73.7742 58.1772 76.1068 56.0898C76.5306 55.7106 76.2739 55.0741 75.7093 55.0065C74.2627 54.8334 72.3424 54.582 70.7175 54.3143C70.0425 54.2031 69.9238 53.3222 70.5252 52.9961C78.9046 48.4516 82.932 43.8991 84.3728 41.3439C84.6496 40.8529 84.2104 40.3421 83.6592 40.4602C82.3228 40.7467 80.4338 41.1487 78.5091 41.5514C77.8129 41.6971 77.3231 40.8423 77.7727 40.2912C81.4261 35.8134 83.2326 31.3025 83.9078 28.6805C84.0493 28.1308 83.5086 27.7025 82.9905 27.9342C81.5745 28.5677 79.2768 29.6435 76.3482 31.125C75.7146 31.4455 75.0146 30.7566 75.3054 30.1088C78.6669 22.6204 79.0828 16.2155 78.7663 12.905C78.7119 12.3354 78.0522 12.1146 77.6426 12.5142C73.9853 16.0816 61.5197 28.3901 32.8283 56.994C32.5175 57.3038 31.994 57.281 31.7453 56.9195C27.17 50.2684 31.7646 44.3282 35.2747 41.6805C35.6433 41.4025 35.7002 40.8592 35.3751 40.5314Z M34.441 46.1547C33.6845 47.144 33.3253 48.3567 33.1761 49.3712C33.0838 49.9987 33.794 50.27 34.2236 49.8035L37.3603 46.3979C36.9143 45.6276 35.7061 44.5004 34.441 46.1547Z" fill="white" fill-opacity="0.14" transform="translate(135, 140) scale(1.1)"></path>
            </svg>
          </div>
          <div className="step-kinetic-columns">
            <div className="step-column is-left">
              <div className="step-item-wrap is-left"><p className="step-line is-left">01 · Tap</p></div>
              <div className="step-item-wrap is-left"><p className="step-line is-left">Frictionless checkout</p></div>
              <div className="step-item-wrap is-left"><p className="step-line is-left">Zero FX fees</p></div>
              <div className="step-item-wrap is-left"><p className="step-line is-left">Global Visa network</p></div>
            </div>
            <div className="step-column is-right">
              <div className="step-item-wrap is-right"><p className="step-line is-right">01 · PAY LIKE ANY CARD</p></div>
              <div className="step-item-wrap is-right"><p className="step-line is-right">ONE CARD EVERYWHERE</p></div>
              <div className="step-item-wrap is-right"><p className="step-line is-right">FRICTIONLESS CONTACTLESS</p></div>
              <div className="step-item-wrap is-right"><p className="step-line is-right">0% FX GLOBALLY</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STEP PANE 02: OWN ================= */}
      <div className="step-pane" data-step="2">
        {/* Right Side: Visual Artwork filling the white space */}
        <div className="step-pane-right-visual">
          <img className="step-split-img" src="/step2-panel.png" alt="Freedom App Merchant Equity Shares" />
        </div>

        {/* Left Side: Black Background */}
        <div className="step-pane-left-bg"></div>

        {/* Stage 1: Pinned Content */}
        <div className="step-stage-1">
          <div className="step-stage1-body">
            <div className="step-stage1-header">
              <div className="step-stage1-action-group">
                <h2 className="step-stage1-title">
                  <span className="step-title-action">02 · OWN.</span>
                  <span className="step-title-sub">Part of the fee buys you shares in that shop.</span>
                </h2>
              </div>
            </div>
          </div>
          <div className="step-stage1-bottom">
            <ul className="step-feature-bullets">
              <li>Shop Equity — A slice of every merchant swipe fee is yours</li>
              <li>Frictionless Ownership — No paperwork, no broker approvals</li>
              <li>Automatic Accumulation — Build a real merchant portfolio daily</li>
            </ul>
          </div>
        </div>

        {/* Stage 2: Kinetic Dual-Column Scrub (Text Animation) */}
        <div className="step-stage-2">
          <div className="step-medallion-container" aria-hidden="true">
            <svg className="step-medallion-svg" viewbox="0 0 354 383" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="177" cy="191" r="172" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="1.5" stroke-dasharray="4 4"></circle>
              <circle cx="177" cy="191" r="158" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1"></circle>
              <path d="M35.3751 40.5314L7.00804 11.9337C6.60458 11.527 5.92129 11.7251 5.84565 12.293C5.06196 18.1764 7.74057 25.6995 9.89408 30.2249C10.2008 30.8695 9.50664 31.5825 8.8647 31.2702C6.89863 30.3138 4.2884 29.0513 2.05901 27.9921C1.53752 27.7443 0.96468 28.1712 1.10398 28.7315C2.10841 32.7714 5.18269 37.3582 7.44167 40.2027C7.86869 40.7405 7.41118 41.5575 6.73343 41.4473C5.07632 41.178 3.04296 40.8431 1.45784 40.5707C0.861348 40.4682 0.412268 41.0871 0.73443 41.5995C3.9151 46.658 9.84962 50.6479 13.9325 52.7981C14.5871 53.1429 14.4271 54.197 13.6945 54.3001C12.1843 54.5127 10.491 54.7553 9.21279 54.9488C8.64465 55.0348 8.41741 55.7008 8.85771 56.07C12.9748 59.5225 21.3768 61.2976 26.4229 61.9209C27.0378 61.9969 27.3108 62.7529 26.8727 63.191L19.6257 70.438C19.3354 70.7284 19.3415 71.2005 19.6508 71.4706C23.259 74.621 28.4889 76.8065 31.0971 77.651C31.3489 77.7326 31.6217 77.6643 31.8118 77.4801L34.1586 75.2066C34.6216 74.7581 35.3962 75.0858 35.3962 75.7304V78.1313C35.3962 78.4319 35.579 78.7038 35.8647 78.7975C39.6788 80.048 45.9134 79.4994 49.1499 78.9758C49.4981 78.9195 49.7493 78.6168 49.7493 78.2641V76.1272C49.7493 75.4616 50.5743 75.1367 51.0389 75.6134C51.7778 76.3715 52.5906 77.1653 53.1258 77.5835C53.2939 77.7149 53.517 77.7415 53.72 77.676C59.6438 75.7622 63.7406 72.9956 65.514 71.4601C65.8187 71.1963 65.8188 70.737 65.5341 70.4516C63.5321 68.4439 60.2045 65.0783 58.2306 62.9903C57.8048 62.54 58.1169 61.8088 58.7355 61.7704C68.222 61.181 73.7742 58.1772 76.1068 56.0898C76.5306 55.7106 76.2739 55.0741 75.7093 55.0065C74.2627 54.8334 72.3424 54.582 70.7175 54.3143C70.0425 54.2031 69.9238 53.3222 70.5252 52.9961C78.9046 48.4516 82.932 43.8991 84.3728 41.3439C84.6496 40.8529 84.2104 40.3421 83.6592 40.4602C82.3228 40.7467 80.4338 41.1487 78.5091 41.5514C77.8129 41.6971 77.3231 40.8423 77.7727 40.2912C81.4261 35.8134 83.2326 31.3025 83.9078 28.6805C84.0493 28.1308 83.5086 27.7025 82.9905 27.9342C81.5745 28.5677 79.2768 29.6435 76.3482 31.125C75.7146 31.4455 75.0146 30.7566 75.3054 30.1088C78.6669 22.6204 79.0828 16.2155 78.7663 12.905C78.7119 12.3354 78.0522 12.1146 77.6426 12.5142C73.9853 16.0816 61.5197 28.3901 32.8283 56.994C32.5175 57.3038 31.994 57.281 31.7453 56.9195C27.17 50.2684 31.7646 44.3282 35.2747 41.6805C35.6433 41.4025 35.7002 40.8592 35.3751 40.5314Z M34.441 46.1547C33.6845 47.144 33.3253 48.3567 33.1761 49.3712C33.0838 49.9987 33.794 50.27 34.2236 49.8035L37.3603 46.3979C36.9143 45.6276 35.7061 44.5004 34.441 46.1547Z" fill="white" fill-opacity="0.14" transform="translate(135, 140) scale(1.1)"></path>
            </svg>
          </div>
          <div className="step-kinetic-columns">
            <div className="step-column is-left">
              <div className="step-item-wrap is-left"><p className="step-line is-left">02 · Own</p></div>
              <div className="step-item-wrap is-left"><p className="step-line is-left">Every purchase counts</p></div>
              <div className="step-item-wrap is-left"><p className="step-line is-left">Direct merchant equity</p></div>
              <div className="step-item-wrap is-left"><p className="step-line is-left">Portfolio in your pocket</p></div>
            </div>
            <div className="step-column is-right">
              <div className="step-item-wrap is-right"><p className="step-line is-right">02 · PART OF FEE BUYS SHARES</p></div>
              <div className="step-item-wrap is-right"><p className="step-line is-right">EVERY PURCHASE BUYS EQUITY</p></div>
              <div className="step-item-wrap is-right"><p className="step-line is-right">OWN WHERE YOU TAP</p></div>
              <div className="step-item-wrap is-right"><p className="step-line is-right">PORTFOLIO ACCUMULATION</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STEP PANE 03: GROW ================= */}
      <div className="step-pane" data-step="3">
        {/* Right Side: Visual Artwork filling the white space */}
        <div className="step-pane-right-visual">
          <img className="step-split-img" src="/step3-panel.png" alt="Freedom Exchange Trading & Growth" />
        </div>

        {/* Left Side: Black Background */}
        <div className="step-pane-left-bg"></div>

        {/* Stage 1: Pinned Content */}
        <div className="step-stage-1">
          <div className="step-stage1-body">
            <div className="step-stage1-header">
              <div className="step-stage1-action-group">
                <h2 className="step-stage1-title">
                  <span className="step-title-action">03 · GROW.</span>
                  <span className="step-title-sub">Your shares trade on Freedom Exchange.</span>
                </h2>
              </div>
            </div>
          </div>
          <div className="step-stage1-bottom">
            <ul className="step-feature-bullets">
              <li>Instant Liquidity — Trade shop shares anytime on Freedom Exchange</li>
              <li>Compound Capital — Real-time price discovery & dividends</li>
              <li>Modern Wealth — Spending that pays you back for life</li>
            </ul>
          </div>
        </div>

        {/* Stage 2: Kinetic Dual-Column Scrub (Text Animation) */}
        <div className="step-stage-2">
          <div className="step-medallion-container" aria-hidden="true">
            <svg className="step-medallion-svg" viewbox="0 0 354 383" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="177" cy="191" r="172" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="1.5" stroke-dasharray="4 4"></circle>
              <circle cx="177" cy="191" r="158" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1"></circle>
              <path d="M35.3751 40.5314L7.00804 11.9337C6.60458 11.527 5.92129 11.7251 5.84565 12.293C5.06196 18.1764 7.74057 25.6995 9.89408 30.2249C10.2008 30.8695 9.50664 31.5825 8.8647 31.2702C6.89863 30.3138 4.2884 29.0513 2.05901 27.9921C1.53752 27.7443 0.96468 28.1712 1.10398 28.7315C2.10841 32.7714 5.18269 37.3582 7.44167 40.2027C7.86869 40.7405 7.41118 41.5575 6.73343 41.4473C5.07632 41.178 3.04296 40.8431 1.45784 40.5707C0.861348 40.4682 0.412268 41.0871 0.73443 41.5995C3.9151 46.658 9.84962 50.6479 13.9325 52.7981C14.5871 53.1429 14.4271 54.197 13.6945 54.3001C12.1843 54.5127 10.491 54.7553 9.21279 54.9488C8.64465 55.0348 8.41741 55.7008 8.85771 56.07C12.9748 59.5225 21.3768 61.2976 26.4229 61.9209C27.0378 61.9969 27.3108 62.7529 26.8727 63.191L19.6257 70.438C19.3354 70.7284 19.3415 71.2005 19.6508 71.4706C23.259 74.621 28.4889 76.8065 31.0971 77.651C31.3489 77.7326 31.6217 77.6643 31.8118 77.4801L34.1586 75.2066C34.6216 74.7581 35.3962 75.0858 35.3962 75.7304V78.1313C35.3962 78.4319 35.579 78.7038 35.8647 78.7975C39.6788 80.048 45.9134 79.4994 49.1499 78.9758C49.4981 78.9195 49.7493 78.6168 49.7493 78.2641V76.1272C49.7493 75.4616 50.5743 75.1367 51.0389 75.6134C51.7778 76.3715 52.5906 77.1653 53.1258 77.5835C53.2939 77.7149 53.517 77.7415 53.72 77.676C59.6438 75.7622 63.7406 72.9956 65.514 71.4601C65.8187 71.1963 65.8188 70.737 65.5341 70.4516C63.5321 68.4439 60.2045 65.0783 58.2306 62.9903C57.8048 62.54 58.1169 61.8088 58.7355 61.7704C68.222 61.181 73.7742 58.1772 76.1068 56.0898C76.5306 55.7106 76.2739 55.0741 75.7093 55.0065C74.2627 54.8334 72.3424 54.582 70.7175 54.3143C70.0425 54.2031 69.9238 53.3222 70.5252 52.9961C78.9046 48.4516 82.932 43.8991 84.3728 41.3439C84.6496 40.8529 84.2104 40.3421 83.6592 40.4602C82.3228 40.7467 80.4338 41.1487 78.5091 41.5514C77.8129 41.6971 77.3231 40.8423 77.7727 40.2912C81.4261 35.8134 83.2326 31.3025 83.9078 28.6805C84.0493 28.1308 83.5086 27.7025 82.9905 27.9342C81.5745 28.5677 79.2768 29.6435 76.3482 31.125C75.7146 31.4455 75.0146 30.7566 75.3054 30.1088C78.6669 22.6204 79.0828 16.2155 78.7663 12.905C78.7119 12.3354 78.0522 12.1146 77.6426 12.5142C73.9853 16.0816 61.5197 28.3901 32.8283 56.994C32.5175 57.3038 31.994 57.281 31.7453 56.9195C27.17 50.2684 31.7646 44.3282 35.2747 41.6805C35.6433 41.4025 35.7002 40.8592 35.3751 40.5314Z M34.441 46.1547C33.6845 47.144 33.3253 48.3567 33.1761 49.3712C33.0838 49.9987 33.794 50.27 34.2236 49.8035L37.3603 46.3979C36.9143 45.6276 35.7061 44.5004 34.441 46.1547Z" fill="white" fill-opacity="0.14" transform="translate(135, 140) scale(1.1)"></path>
            </svg>
          </div>
          <div className="step-kinetic-columns">
            <div className="step-column is-left">
              <div className="step-item-wrap is-left"><p className="step-line is-left">03 · Grow</p></div>
              <div className="step-item-wrap is-left"><p className="step-line is-left">Live market trading</p></div>
              <div className="step-item-wrap is-left"><p className="step-line is-left">Continuous liquidity</p></div>
              <div className="step-item-wrap is-left"><p className="step-line is-left">A card that makes money</p></div>
            </div>
            <div className="step-column is-right">
              <div className="step-item-wrap is-right"><p className="step-line is-right">03 · YOUR SHARES TRADE LIVE</p></div>
              <div className="step-item-wrap is-right"><p className="step-line is-right">FREEDOM EXCHANGE LIQUIDITY</p></div>
              <div className="step-item-wrap is-right"><p className="step-line is-right">24/7 GLOBAL MARKETS</p></div>
              <div className="step-item-wrap is-right"><p className="step-line is-right">BUILT FOR MODERN WEALTH</p></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>

  {/* ================= SECTION 4: THE CARDS — CINEMATIC PAN SWIPE ================= */}
  <section className="section-cards-editorial" id="the-cards" aria-label="Freedom Card Editions">
    {/* Panoramic Camera Viewport */}
    <div className="cards-pan-viewport scroll-reveal-expand" id="cardsViewport">
      {/* Panoramic Multi-Edition Filmstrip Track (300vw width, translates horizontally) */}
      <div className="cards-pan-track" id="cardsPanTrack">

        {/* Frame 01: Checker Edition */}
        <div className="cards-pan-frame is-active" data-index="0" data-edition="checker">
          <div className="cards-frame-inner">
            <div className="cards-frame-visual">
              <img src="/card-checker.jpg" alt="Freedom Checker Edition" className="cards-pan-img" draggable="false" />
            </div>
          </div>
        </div>

        {/* Frame 02: Classic Edition */}
        <div className="cards-pan-frame" data-index="1" data-edition="classic">
          <div className="cards-frame-inner">
            <div className="cards-frame-visual">
              <img src="/card-classic.png" alt="Freedom Classic Edition" className="cards-pan-img" draggable="false" />
            </div>
          </div>
        </div>

        {/* Frame 03: Premium Edition */}
        <div className="cards-pan-frame" data-index="2" data-edition="premium">
          <div className="cards-frame-inner">
            <div className="cards-frame-visual">
              <img src="/card-premium.jpg" alt="Freedom Premium Edition" className="cards-pan-img" draggable="false" />
            </div>
          </div>
        </div>

        {/* Frame 04: Checker Edition (Seamless Infinite Loop Clone) */}
        <div className="cards-pan-frame" data-index="3" data-edition="checker">
          <div className="cards-frame-inner">
            <div className="cards-frame-visual">
              <img src="/card-checker.jpg" alt="Freedom Checker Edition" className="cards-pan-img" draggable="false" />
            </div>
          </div>
        </div>

      </div>
    </div>

    {/* Cinematic Vignette Scrim (Soft edge framing for contrast) */}
    <div className="cards-cinematic-vignette" aria-hidden="true"></div>

    {/* Pinned Editorial Header (Top Left) */}
    <div className="cards-ed-header scroll-reveal">
      <h2 className="cards-ed-title">Three editions.<br />One idea.</h2>
    </div>

    {/* Edition Meta Information (Bottom Left, Staggered Reveal) */}
    <div className="cards-ed-info scroll-reveal">
      <div className="cards-ed-name-clip is-visible" id="edNameWrap">
        <span className="cards-ed-name-text" id="edName">Checker Edition</span>
      </div>
      <p className="cards-ed-desc is-visible" id="edDesc">Black, white, and one red square. The one people ask about.</p>
    </div>

    {/* Edition Counter (Bottom Right) */}
    <div className="cards-ed-counter scroll-reveal">
      <div className="cards-counter-wrap">
        <span className="cards-ed-counter-current" id="edCount">01</span>
        <span className="cards-counter-divider">/</span>
        <span className="cards-counter-total">03</span>
      </div>
    </div>

    {/* Edition Pill Tabs with Live Animated Progress (Bottom Center) */}
    <div className="cards-ed-pills scroll-reveal" role="tablist" aria-label="Select card edition">
      <button className="cards-ed-pill is-active" data-index="0" role="tab" aria-selected="true">
        <span className="cards-pill-text">Checker</span>
        <span className="cards-ed-pill-progress"></span>
      </button>
      <button className="cards-ed-pill" data-index="1" role="tab" aria-selected="false">
        <span className="cards-pill-text">Classic</span>
        <span className="cards-ed-pill-progress"></span>
      </button>
      <button className="cards-ed-pill" data-index="2" role="tab" aria-selected="false">
        <span className="cards-pill-text">Premium</span>
        <span className="cards-ed-pill-progress"></span>
      </button>
    </div>
  </section>

  {/* ================= SECTION 5: FOR BUSINESSES (LUXURY BENTO) ================= */}
  <section className="section-business" id="for-businesses">
    <div className="biz-container">

      {/* Section Header (Centered Luxury Style matching reference) */}
      <div className="biz-header-centered scroll-reveal">
        <div className="biz-pill-badge">For Businesses</div>
        <h2 className="biz-main-title">Turn customers into owners.</h2>
        <p className="biz-main-subtitle">
          List your shop on Freedom and every tap at your counter hands the customer a small piece of it. They come back, because now it is theirs too.
        </p>
      </div>

      {/* Bento Grid (3 Columns, 2 Rows matching reference) */}
      <div className="biz-bento-grid scroll-reveal-stagger">

        {/* Card 1: Tall Left Card (spans 2 rows) */}
        <div className="biz-bento-card biz-card-tall">
          <div className="biz-tall-visual-wrap">
            <img src="/artisan-hand.jpg" alt="Artisan Loyalty" className="biz-tall-img" />
          </div>
          <div className="biz-tall-content">
            <div className="biz-tall-text-wrap">
              <h3 className="biz-tall-title">
                <strong>They come back.</strong>
              </h3>
              <p className="biz-tall-desc">A customer who owns a slice of your shop chooses it over the one next door.</p>
            </div>
            <a href="https://app.freedomnetwork.xyz/business" className="biz-pill-btn" target="_blank" rel="noopener">
              <span>List your shop</span>
              <span className="biz-pill-arrow-circle" aria-hidden="true">
                <svg width="12" height="12" viewbox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="11" x2="11" y2="3"></line>
                  <polyline points="4 3 11 3 11 10"></polyline>
                </svg>
              </span>
            </a>
          </div>
        </div>

        {/* Card 2: Top Middle Card */}
        <div className="biz-bento-card biz-card-handshake">
          <div className="biz-card-img-wrap">
            <img src="/partner-handshake.jpg" alt="Listing takes an afternoon" className="biz-card-img" />
          </div>
          <div className="biz-card-text">
            <p className="biz-duo-text">
              <strong>Listing takes an afternoon.</strong>
              <span className="biz-muted-text">Register, tell us about the business, set your terms. That is the whole of it.</span>
            </p>
          </div>
        </div>

        {/* Card 3: Top Right Card (Stat + Crown Chess King) */}
        <div className="biz-bento-card biz-card-stat">
          <div className="biz-stat-split">
            <div className="biz-stat-left">
              <span className="biz-stat-number">100%</span>
              <span className="biz-stat-sublabel">Self-serve terms</span>
            </div>
            <div className="biz-chess-img-wrap">
              <img src="/crown-chess.jpg" alt="You set the share" className="biz-chess-img" />
            </div>
          </div>
          <div className="biz-card-text">
            <p className="biz-duo-text">
              <strong>You set the share.</strong>
              <span className="biz-muted-text">You choose how much of each tap becomes shares. Not us.</span>
            </p>
          </div>
        </div>

        {/* Card 4: Bottom Wide Card (Spans 2 Columns) */}
        <div className="biz-bento-card biz-card-wide">
          <div className="biz-wide-content">
            <p className="biz-wide-text">
              <strong>Turn customers into owners</strong>
              <span className="biz-muted-text">and give every tap at your counter lasting equity. Built for modern merchants who value customer loyalty over ad spend.</span>
            </p>
          </div>
          <div className="biz-wide-visual">
            <img src="/chic-portrait.jpg" alt="Modern business co-ownership" className="biz-wide-img" />
          </div>
        </div>

      </div>

    </div>
  </section>

  {/* ================= SECTION 6: THE MARKET (EDITORIAL BROADSHEET) ================= */}
  <section className="section-market" id="the-market">
    <div className="market-container">

      {/* Editorial Header Spread: Asymmetrical 2-Column Magazine Layout */}
      <div className="market-editorial-header scroll-reveal">
        <div className="market-editorial-col-left">
          <h2 className="market-title">A real market behind every card.</h2>
        </div>

        <div className="market-editorial-col-right">
          <p className="market-lead">
            Every shop on Freedom has a price, and it moves with what people are willing to pay. Your shares are worth what the market says they are worth, not what we say.
          </p>
          <a href="https://market.freedomnetwork.xyz/" className="market-editorial-cta" target="_blank" rel="noopener">
            <span>See the market</span>
            <svg className="market-cta-arrow" width="13" height="13" viewbox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="11" x2="11" y2="3"></line>
              <polyline points="4 3 11 3 11 10"></polyline>
            </svg>
          </a>
        </div>
      </div>

      {/* Coinbase-Style Market Hub */}
      <div className="cb-market-hub scroll-reveal-expand">

        {/* 1. Market Update Block (Matches Screenshot) */}
        <div className="cb-market-update-block">
          <div className="cb-section-header-row">
            <h3 className="cb-section-title">Market update</h3>
          </div>

          <div className="cb-market-update-grid">
            {/* Left Card: Market cap + Green Sparkline with Dotted Fill */}
            <div className="cb-card cb-card-hero" id="cb-hero-card" title="Click to view total network aggregate">
              <div>
                <div className="cb-card-top">
                  <span className="cb-card-label" id="cb-hero-label">Market cap</span>
                  <svg className="cb-chevron" width="16" height="16" viewbox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
                <div className="cb-card-metric">
                  <span className="cb-metric-val" id="cb-hero-val">₦1.12B</span>
                  <span className="cb-metric-change up" id="cb-hero-change">
                    <svg width="12" height="12" viewbox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"></path></svg>
                    <span id="cb-hero-pct">14.8%</span>
                  </span>
                </div>
              </div>

              {/* Coinbase Dotted Fill Sparkline */}
              <div className="cb-sparkline-wrap">
                <svg className="cb-sparkline-svg" viewbox="0 0 320 120" preserveaspectratio="none">
                  <defs>
                    <pattern id="cb-spark-dots" width="8" height="8" patternunits="userSpaceOnUse">
                      <circle id="cb-dot-circle" cx="4" cy="4" r="1.15" fill="#098551" opacity="0.35"></circle>
                    </pattern>
                    <mask id="cb-spark-mask">
                      <path id="cb-mask-path" d="M 0,80 Q 25,95 50,75 T 100,55 T 150,70 T 200,45 T 250,55 T 290,25 T 320,15 L 320,120 L 0,120 Z" fill="#ffffff"></path>
                    </mask>
                  </defs>
                  <rect x="0" y="0" width="320" height="120" fill="url(#cb-spark-dots)" mask="url(#cb-spark-mask)"></rect>
                  <path id="cb-line-path" d="M 0,80 Q 25,95 50,75 T 100,55 T 150,70 T 200,45 T 250,55 T 290,25 T 320,15" fill="none" stroke="#098551" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
            </div>

            {/* Right Column: Trade volume & Buy ratio */}
            <div className="cb-side-stack">
              {/* Top Card: Trade volume */}
              <div className="cb-card cb-card-mini">
                <div className="cb-card-top">
                  <span className="cb-card-label">Trade volume</span>
                  <svg className="cb-chevron" width="16" height="16" viewbox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
                <div className="cb-card-metric">
                  <span className="cb-metric-val" id="cb-vol-val">₦84.6M</span>
                  <span className="cb-metric-change down" id="cb-vol-change">
                    <svg width="12" height="12" viewbox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 2.5L9.5 9.5M9.5 9.5H4.5M9.5 9.5V4.5"></path></svg>
                    <span id="cb-vol-pct">4.2%</span>
                  </span>
                </div>
              </div>

              {/* Bottom Card: Buy ratio */}
              <div className="cb-card cb-card-mini">
                <div className="cb-card-top">
                  <span className="cb-card-label">Buy ratio</span>
                  <svg className="cb-chevron" width="16" height="16" viewbox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
                <div className="cb-card-metric">
                  <span className="cb-metric-val" id="cb-buy-val">82% buy</span>
                  <span className="cb-metric-change up" id="cb-buy-change">
                    <svg width="12" height="12" viewbox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"></path></svg>
                    <span id="cb-buy-pct">1.15%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Shops on Freedom (Matches "New on Coinbase" row) */}
        <div className="cb-shops-section">
          <div className="cb-section-header-row">
            <h3 className="cb-section-title">Shops on Freedom</h3>
            <a href="https://market.freedomnetwork.xyz/" className="cb-circle-arrow-btn" target="_blank" rel="noopener" aria-label="Explore all shops on Freedom">
              <svg width="16" height="16" viewbox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
          </div>

          <div className="cb-shops-carousel" id="cb-shops-carousel">
            {/* Card 1: Probe Kitchens */}
            <div className="cb-shop-card" data-key="probekit" role="button" tabIndex="0" title="Click to view Probe Kitchens data">
              <div className="cb-shop-icon" style={{ background: '#0f172a', color: '#ffffff' }}>PK</div>
              <div className="cb-shop-ticker">PROBEKIT</div>
              <div className="cb-shop-price">₦40.00</div>
              <div className="cb-shop-change up">
                <svg width="11" height="11" viewbox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"></path></svg>
                <span>14.80%</span>
              </div>
              <div className="cb-shop-cap">₦320m cap</div>
            </div>

            {/* Card 2: BLAZE */}
            <div className="cb-shop-card" data-key="blaze" role="button" tabIndex="0" title="Click to view BLAZE data">
              <div className="cb-shop-icon" style={{ background: '#ea580c', color: '#ffffff' }}>BZ</div>
              <div className="cb-shop-ticker">BLAZE</div>
              <div className="cb-shop-price">₦22.49</div>
              <div className="cb-shop-change up">
                <svg width="11" height="11" viewbox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"></path></svg>
                <span>8.20%</span>
              </div>
              <div className="cb-shop-cap">₦225m cap</div>
            </div>

            {/* Card 3: TSION ARK LIMITED */}
            <div className="cb-shop-card" data-key="tsionark" role="button" tabIndex="0" title="Click to view TSION ARK data">
              <div className="cb-shop-icon" style={{ background: '#1e1b4b', color: '#ffffff' }}>TA</div>
              <div className="cb-shop-ticker">TSIONARK</div>
              <div className="cb-shop-price">₦2.20</div>
              <div className="cb-shop-change up">
                <svg width="11" height="11" viewbox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"></path></svg>
                <span>21.50%</span>
              </div>
              <div className="cb-shop-cap">₦22m cap</div>
            </div>

            {/* Card 4: Maison Élite */}
            <div className="cb-shop-card" data-key="melite" role="button" tabIndex="0" title="Click to view Maison Élite data">
              <div className="cb-shop-icon" style={{ background: '#3f3f46', color: '#ffffff' }}>ME</div>
              <div className="cb-shop-ticker">MELITE</div>
              <div className="cb-shop-price">₦18.75</div>
              <div className="cb-shop-change down">
                <svg width="11" height="11" viewbox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 2.5L9.5 9.5M9.5 9.5H4.5M9.5 9.5V4.5"></path></svg>
                <span>3.40%</span>
              </div>
              <div className="cb-shop-cap">₦150m cap</div>
            </div>

            {/* Card 5: Kover Studio */}
            <div className="cb-shop-card" data-key="kover" role="button" tabIndex="0" title="Click to view Kover Studio data">
              <div className="cb-shop-icon" style={{ background: '#042f2e', color: '#ffffff' }}>KS</div>
              <div className="cb-shop-ticker">KOVER</div>
              <div className="cb-shop-price">₦64.00</div>
              <div className="cb-shop-change up">
                <svg width="11" height="11" viewbox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"></path></svg>
                <span>12.10%</span>
              </div>
              <div className="cb-shop-cap">₦410m cap</div>
            </div>
          </div>
        </div>

        {/* Colophon / Hub Footer */}
        <div className="cb-market-footer scroll-reveal">
          <div className="cb-footer-left">
            <span className="cb-timestamp">As of 30 Sept 2026, 11:21</span>
            <span className="cb-footer-sep">/</span>
            <span className="cb-footer-note">Prices determined by open market order book.</span>
          </div>
          <div className="cb-footer-right">
            <a href="https://market.freedomnetwork.xyz/" className="cb-footer-link" target="_blank" rel="noopener">
              <span>Explore all shops on Freedom</span>
              <span className="cb-footer-arrow">↗</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  </section>

  {/* ================= SECTION 7: FAQ ================= */}
  <section className="section-faq" id="faq">
    <div className="faq-container">
      <div className="faq-layout">
        <aside className="faq-sidebar scroll-reveal">
          <h2 className="faq-headline">What you should know before you tap.</h2>
          <p className="faq-sidebar-note">Full clarity on your funds, your equity, and how Freedom protects every transaction.</p>
        </aside>

        <div className="faq-list scroll-reveal-stagger" role="region" aria-label="Frequently Asked Questions">
          {/* Item 01 */}
          <article className="faq-item">
            <span className="faq-num" aria-hidden="true">01</span>
            <div className="faq-content">
              <h3 className="faq-question">Your money stays yours.</h3>
              <p className="faq-answer">The card is prepaid. You top up what you spend, and nothing more.</p>
            </div>
          </article>

          {/* Item 02 */}
          <article className="faq-item">
            <span className="faq-num" aria-hidden="true">02</span>
            <div className="faq-content">
              <h3 className="faq-question">Your shares are real.</h3>
              <p className="faq-answer">Listed on Freedom Exchange and priced every trading day.</p>
            </div>
          </article>

          {/* Item 03 */}
          <article className="faq-item">
            <span className="faq-num" aria-hidden="true">03</span>
            <div className="faq-content">
              <h3 className="faq-question">Shares from taps unlock after 120 days.</h3>
              <p className="faq-answer">So a refund can always be honoured.</p>
            </div>
          </article>

          {/* Item 04 */}
          <article className="faq-item">
            <span className="faq-num" aria-hidden="true">04</span>
            <div className="faq-content">
              <h3 className="faq-question">Every tap is on the record.</h3>
              <p className="faq-answer">What you paid, what you own, and when. In the app, always.</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>

  {/* ================= SECTION 8: FOOTER ================= */}
  <footer className="freedom-footer">
    <div className="footer-container">
      <div className="footer-top scroll-reveal">
        <div className="footer-brand">
          <a href="#home" className="footer-logo-link" aria-label="Freedom">
            <svg className="brand-logo-svg footer-logo" viewbox="-2 9 89 74" role="img" aria-label="Freedom Bird">
              <path fill="currentColor" d="M35.3751 40.5314L7.00804 11.9337C6.60458 11.527 5.92129 11.7251 5.84565 12.293C5.06196 18.1764 7.74057 25.6995 9.89408 30.2249C10.2008 30.8695 9.50664 31.5825 8.8647 31.2702C6.89863 30.3138 4.2884 29.0513 2.05901 27.9921C1.53752 27.7443 0.96468 28.1712 1.10398 28.7315C2.10841 32.7714 5.18269 37.3582 7.44167 40.2027C7.86869 40.7405 7.41118 41.5575 6.73343 41.4473C5.07632 41.178 3.04296 40.8431 1.45784 40.5707C0.861348 40.4682 0.412268 41.0871 0.73443 41.5995C3.9151 46.658 9.84962 50.6479 13.9325 52.7981C14.5871 53.1429 14.4271 54.197 13.6945 54.3001C12.1843 54.5127 10.491 54.7553 9.21279 54.9488C8.64465 55.0348 8.41741 55.7008 8.85771 56.07C12.9748 59.5225 21.3768 61.2976 26.4229 61.9209C27.0378 61.9969 27.3108 62.7529 26.8727 63.191L19.6257 70.438C19.3354 70.7284 19.3415 71.2005 19.6508 71.4706C23.259 74.621 28.4889 76.8065 31.0971 77.651C31.3489 77.7326 31.6217 77.6643 31.8118 77.4801L34.1586 75.2066C34.6216 74.7581 35.3962 75.0858 35.3962 75.7304V78.1313C35.3962 78.4319 35.579 78.7038 35.8647 78.7975C39.6788 80.048 45.9134 79.4994 49.1499 78.9758C49.4981 78.9195 49.7493 78.6168 49.7493 78.2641V76.1272C49.7493 75.4616 50.5743 75.1367 51.0389 75.6134C51.7778 76.3715 52.5906 77.1653 53.1258 77.5835C53.2939 77.7149 53.517 77.7415 53.72 77.676C59.6438 75.7622 63.7406 72.9956 65.514 71.4601C65.8187 71.1963 65.8188 70.737 65.5341 70.4516C63.5321 68.4439 60.2045 65.0783 58.2306 62.9903C57.8048 62.54 58.1169 61.8088 58.7355 61.7704C68.222 61.181 73.7742 58.1772 76.1068 56.0898C76.5306 55.7106 76.2739 55.0741 75.7093 55.0065C74.2627 54.8334 72.3424 54.582 70.7175 54.3143C70.0425 54.2031 69.9238 53.3222 70.5252 52.9961C78.9046 48.4516 82.932 43.8991 84.3728 41.3439C84.6496 40.8529 84.2104 40.3421 83.6592 40.4602C82.3228 40.7467 80.4338 41.1487 78.5091 41.5514C77.8129 41.6971 77.3231 40.8423 77.7727 40.2912C81.4261 35.8134 83.2326 31.3025 83.9078 28.6805C84.0493 28.1308 83.5086 27.7025 82.9905 27.9342C81.5745 28.5677 79.2768 29.6435 76.3482 31.125C75.7146 31.4455 75.0146 30.7566 75.3054 30.1088C78.6669 22.6204 79.0828 16.2155 78.7663 12.905C78.7119 12.3354 78.0522 12.1146 77.6426 12.5142C73.9853 16.0816 61.5197 28.3901 32.8283 56.994C32.5175 57.3038 31.994 57.281 31.7453 56.9195C27.17 50.2684 31.7646 44.3282 35.2747 41.6805C35.6433 41.4025 35.7002 40.8592 35.3751 40.5314Z M34.441 46.1547C33.6845 47.144 33.3253 48.3567 33.1761 49.3712C33.0838 49.9987 33.794 50.27 34.2236 49.8035L37.3603 46.3979C36.9143 45.6276 35.7061 44.5004 34.441 46.1547Z"></path>
            </svg>
          </a>
          <p className="footer-tagline">A card that makes money for you. Spend globally, own where you tap.</p>
        </div>
        <div className="footer-links-group">
          <div className="footer-col">
            <span className="footer-col-title">Product</span>
            <a href="#home">Card</a>
            <a href="#spend-globally">Spend</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#the-cards">Editions</a>
            <a href="#the-market">The Market</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">Merchants</span>
            <a href="#for-businesses">For Businesses</a>
            <a href="https://app.freedomnetwork.xyz/business" target="_blank" rel="noopener">List Your Shop</a>
            <a href="https://exchange.freedomnetwork.xyz" target="_blank" rel="noopener">Freedom Exchange</a>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">Legal & Security</span>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cardholder Agreement</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom scroll-reveal">
        <p className="footer-legal">© 2026 Freedom Technologies Inc. All rights reserved. The Freedom Card is powered by Visa and issued by licensed banking partners worldwide.</p>
      </div>
    </div>
  </footer>
    </>
  );
}
