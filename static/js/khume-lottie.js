/*
 * Plays the Lottie animations exported from EffectCraft (motion/build_*.sh).
 *
 * <div data-lottie="/static/animations/x.json" data-play="once|loop|scene"
 *      [data-lottie-tall="..."] [data-loop-from="4"] [data-fit="contain"]>
 *   <img data-lottie-fallback ...>   (optional: shown if the animation can't load)
 * </div>
 *
 * once  – plays when it first scrolls into view, then holds on the last frame
 * loop  – the full-screen hero: plays the intro once, then repeats from data-loop-from (seconds)
 *         to the end for ever; pauses while off screen
 * scene – like loop, but only while its .service-scene is .is-active (the services section sets
 *         it from the scroll position); when the scene goes it pauses, then rewinds once it has
 *         faded out, so the intro plays again next time. Without data-loop-from it plays once
 *         and holds the last frame.
 * loop and scene use data-lottie-tall on portrait screens and cover their box (cropping the
 * edges) unless data-fit="contain".
 * Visitors who prefer reduced motion get a still: the last frame, or for a loop a frame from
 * inside it.
 */
(function () {
  document.documentElement.classList.add('js-lottie');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SCENE_FADE_MS = 700;   // matches .service-scene's opacity transition

  function load(el, path, fit) {
    var stage = document.createElement('div');
    stage.className = 'lottie-stage';
    el.appendChild(stage);
    var anim = lottie.loadAnimation({
      container: stage,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: path,
      rendererSettings: { preserveAspectRatio: fit, progressiveLoad: true }
    });
    anim.addEventListener('data_failed', function () { el.classList.add('lottie-failed'); });
    return anim;
  }

  function setupOnce(el) {
    var anim = load(el, el.getAttribute('data-lottie'), 'xMidYMid meet');
    var onScreen = false, played = false;
    function update() {
      if (!anim.isLoaded || reduceMotion || played || !onScreen) return;
      anim.goToAndPlay(0, true);
      played = true;
    }
    anim.addEventListener('DOMLoaded', function () {
      el.classList.add('lottie-ready');
      if (reduceMotion) anim.goToAndStop(anim.totalFrames - 1, true);
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
  }

  function setupLooping(el, mode) {
    var tall = el.getAttribute('data-lottie-tall');
    var portrait = window.innerWidth / window.innerHeight < 0.8;
    var fit = el.getAttribute('data-fit') === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice';
    var anim = load(el, portrait && tall ? tall : el.getAttribute('data-lottie'), fit);
    var scene = mode === 'scene' ? el.closest('.service-scene') : null;
    var loopAttr = el.getAttribute('data-loop-from');
    var loopFrom = 0, looping = false, started = false, onScreen = true, rewindTimer = null;

    function active() { return !scene || scene.classList.contains('is-active'); }
    function still() {
      if (loopAttr === null) return anim.totalFrames - 1;
      return Math.min(anim.totalFrames - 1, loopFrom + Math.round(anim.frameRate * 2));
    }

    function update() {
      if (!anim.isLoaded) return;
      if (reduceMotion) { anim.goToAndStop(still(), true); return; }
      if (active() && onScreen) {
        clearTimeout(rewindTimer);
        if (!started) { started = true; looping = false; anim.loop = false; anim.goToAndPlay(0, true); }
        else anim.play();
      } else {
        anim.pause();
        // a scene that left: rewind once it has faded out, so it starts over next time
        if (scene && !active() && started) {
          clearTimeout(rewindTimer);
          rewindTimer = setTimeout(function () {
            if (active()) return;
            started = false;
            looping = false;
            anim.loop = false;
            anim.resetSegments(true);   // drop the loop segment, so frame 0 is the intro again
            anim.goToAndStop(0, true);
          }, SCENE_FADE_MS);
        }
      }
    }

    anim.addEventListener('DOMLoaded', function () {
      el.classList.add('lottie-ready');
      loopFrom = Math.round(parseFloat(loopAttr || '0') * anim.frameRate);
      anim.goToAndStop(0, true);
      update();
    });
    anim.addEventListener('complete', function () {
      if (looping || loopAttr === null) return;   // no loop: hold the last frame
      looping = true;
      anim.loop = true;
      anim.playSegments([loopFrom, anim.totalFrames], true);
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { onScreen = e.isIntersecting; });
        update();
      }, { threshold: 0 }).observe(scene ? scene.parentNode : el);
    }
    if (scene && 'MutationObserver' in window) {
      new MutationObserver(update).observe(scene, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function setup(el) {
    if (typeof lottie === 'undefined') { el.classList.add('lottie-failed'); return; }
    var mode = el.getAttribute('data-play') || 'once';
    if (mode === 'loop' || mode === 'scene') setupLooping(el, mode);
    else setupOnce(el);
  }

  function init() {
    document.querySelectorAll('[data-lottie]').forEach(setup);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
