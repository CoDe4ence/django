/*
 * Plays the Lottie animations exported from EffectCraft (motion/export_web.sh).
 *
 * <div data-lottie="/static/animations/x.json" data-play="once|loop" data-hold="1500" data-hover-replay>
 *   <img data-lottie-fallback ...>   (optional: shown if the animation can't load)
 * </div>
 *
 * once  – plays when it first scrolls into view, then holds on the last frame
 * loop  – plays while visible, holding `data-hold` ms on the last frame between plays
 * data-hover-replay – replays from the start on hover/focus of the closest .card (or the element)
 * Visitors who prefer reduced motion get the final frame, no playback.
 */
(function () {
  document.documentElement.classList.add('js-lottie');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showFallback(el) {
    el.classList.add('lottie-failed');
  }

  function setup(el) {
    if (typeof lottie === 'undefined') { showFallback(el); return; }
    var mode = el.getAttribute('data-play') || 'once';
    var hold = parseInt(el.getAttribute('data-hold') || '1500', 10);
    var stage = document.createElement('div');
    stage.className = 'lottie-stage';
    el.appendChild(stage);

    var anim = lottie.loadAnimation({
      container: stage,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: el.getAttribute('data-lottie'),
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true }
    });

    var visible = false, played = false, holdTimer = null;

    function lastFrame() { return anim.totalFrames - 1; }
    function playFromStart() {
      clearTimeout(holdTimer);
      anim.goToAndPlay(0, true);
      played = true;
    }

    anim.addEventListener('data_failed', function () { showFallback(el); });
    anim.addEventListener('DOMLoaded', function () {
      el.classList.add('lottie-ready');
      if (reduceMotion) { anim.goToAndStop(lastFrame(), true); return; }
      anim.goToAndStop(0, true);
      if (visible) playFromStart();
    });
    anim.addEventListener('complete', function () {
      if (mode === 'loop' && visible && !reduceMotion) {
        holdTimer = setTimeout(function () { if (visible) playFromStart(); }, hold);
      }
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          visible = e.isIntersecting;
          if (reduceMotion || !anim.isLoaded) return;
          if (visible) {
            if (mode === 'loop' ? anim.isPaused : !played) playFromStart();
          } else if (mode === 'loop') {
            clearTimeout(holdTimer);
            anim.pause();
          }
        });
      }, { threshold: 0.35 }).observe(el);
    } else {
      visible = true;
    }

    if (el.hasAttribute('data-hover-replay') && !reduceMotion) {
      var target = el.closest('.card') || el;
      var replay = function () { if (anim.isLoaded && anim.isPaused) playFromStart(); };
      target.addEventListener('mouseenter', replay);
      target.addEventListener('focusin', replay);
    }
  }

  function init() {
    document.querySelectorAll('[data-lottie]').forEach(setup);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
