/*
 * Plays the Lottie animations exported from EffectCraft (motion/export_web.sh).
 *
 * <div data-lottie="/static/animations/x.json" data-play="once|slide">
 *   <img data-lottie-fallback ...>   (optional: shown if the animation can't load)
 * </div>
 *
 * once  – plays when it first scrolls into view, then holds on the last frame
 * loop  – the full-screen hero: plays the intro once, then repeats from data-loop-from (seconds) to
 *         the end for ever; pauses while off screen. data-lottie-tall is used on portrait screens.
 *         The animation covers its box (cropping the edges) instead of fitting inside it
 * slide – inside a .carousel-slide: plays when its slide becomes active (the carousel adds
 *         .is-active to the slides in view) and is on screen; rewinds when the slide leaves,
 *         so it plays again the next time it comes round
 * Visitors who prefer reduced motion get the final frame, no playback.
 */
(function () {
  document.documentElement.classList.add('js-lottie');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setup(el) {
    if (typeof lottie === 'undefined') { el.classList.add('lottie-failed'); return; }
    var mode = el.getAttribute('data-play') || 'once';
    if (mode === 'loop') return setupLoop(el);
    var slide = mode === 'slide' ? el.closest('.carousel-slide') : null;
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

    var onScreen = false, played = false;

    function active() { return slide ? slide.classList.contains('is-active') : true; }
    function lastFrame() { return anim.totalFrames - 1; }

    // play if it should be playing and hasn't yet; rewind an inactive slide once it is out of
    // sight (not while it is still sliding away)
    function update() {
      if (!anim.isLoaded || reduceMotion) return;
      if (slide && !active()) {
        if (played && !onScreen) { anim.goToAndStop(0, true); played = false; }
        return;
      }
      if (onScreen && !played) {
        anim.goToAndPlay(0, true);
        played = true;
      }
    }

    anim.addEventListener('data_failed', function () { el.classList.add('lottie-failed'); });
    anim.addEventListener('DOMLoaded', function () {
      el.classList.add('lottie-ready');
      if (reduceMotion) anim.goToAndStop(lastFrame(), true);
      else { anim.goToAndStop(0, true); update(); }
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { onScreen = e.isIntersecting; });
        update();
      }, { threshold: 0.5 }).observe(el);
    } else {
      onScreen = true;
    }

    if (slide && 'MutationObserver' in window) {
      new MutationObserver(update).observe(slide, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function setupLoop(el) {
    var tall = el.getAttribute('data-lottie-tall');
    var portrait = window.innerWidth / window.innerHeight < 0.8;
    var stage = document.createElement('div');
    stage.className = 'lottie-stage';
    el.appendChild(stage);

    var anim = lottie.loadAnimation({
      container: stage,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: portrait && tall ? tall : el.getAttribute('data-lottie'),
      rendererSettings: { preserveAspectRatio: 'xMidYMid slice', progressiveLoad: true }
    });

    var loopFrom = 0, looping = false, onScreen = true;
    function startLoop() {
      looping = true;
      anim.loop = true;
      anim.playSegments([loopFrom, anim.totalFrames], true);
    }

    anim.addEventListener('data_failed', function () { el.classList.add('lottie-failed'); });
    anim.addEventListener('DOMLoaded', function () {
      el.classList.add('lottie-ready');
      loopFrom = Math.round(parseFloat(el.getAttribute('data-loop-from') || '0') * anim.frameRate);
      // reduced motion: a still from inside the loop, logo and wordmark in place
      if (reduceMotion) { anim.goToAndStop(loopFrom + Math.round(anim.frameRate * 2), true); return; }
      anim.goToAndPlay(0, true);
      if (!onScreen) anim.pause();
    });
    anim.addEventListener('complete', function () { if (!looping) startLoop(); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { onScreen = e.isIntersecting; });
        if (!anim.isLoaded || reduceMotion) return;
        if (onScreen) anim.play(); else anim.pause();
      }, { threshold: 0 }).observe(el);
    }
  }

  function init() {
    document.querySelectorAll('[data-lottie]').forEach(setup);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
