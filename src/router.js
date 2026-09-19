/* =========================================================
   Single-file router (injected by build.js — not used by the
   multi-file site). Swaps whole pages in and out of <body> and
   re-runs the shared runtime, so every page boots exactly as it
   does when served as its own .html file.

   Routes look like  #/07-databases.html  or  #/07-databases.html@s3-indexes
   ========================================================= */
(function () {
  'use strict';

  var PAGES = window.ML_PAGES || {};
  var HOME = 'index.html';

  /* ---- raw platform APIs, captured before we patch anything ---- */
  var rawWinOn = window.addEventListener.bind(window);
  var rawDocOn = document.addEventListener.bind(document);
  var rawTimeout = window.setTimeout.bind(window);
  var _setTimeout = window.setTimeout;
  var _setInterval = window.setInterval;
  var _clearInterval = window.clearInterval;
  var _raf = window.requestAnimationFrame;

  /* ---- per-page lifetime --------------------------------------
     Pages register scroll/keydown listeners, intervals and rAF
     loops against a DOM we are about to throw away. Everything a
     page starts is tied to a generation; bumping the generation on
     navigation neutralises all of it in one go. ---------------- */
  var gen = 0;
  var ctrl = new AbortController();

  function scopeListeners(target, raw) {
    target.addEventListener = function (type, fn, opts) {
      var o;
      if (opts === true || opts === false) o = { capture: opts };
      else if (opts && typeof opts === 'object') o = Object.assign({}, opts);
      else o = {};
      if (!o.signal) o.signal = ctrl.signal;
      return raw(type, fn, o);
    };
  }
  scopeListeners(window, rawWinOn);
  scopeListeners(document, rawDocOn);

  window.setTimeout = function (cb, ms) {
    var g = gen, a = [].slice.call(arguments, 2);
    if (typeof cb !== 'function') return _setTimeout.apply(window, arguments);
    return _setTimeout(function () { if (g === gen) cb.apply(null, a); }, ms);
  };
  window.setInterval = function (cb, ms) {
    var g = gen, a = [].slice.call(arguments, 2), id;
    if (typeof cb !== 'function') return _setInterval.apply(window, arguments);
    id = _setInterval(function () {
      if (g !== gen) { _clearInterval(id); return; }   // page is gone: stop the sim
      cb.apply(null, a);
    }, ms);
    return id;
  };
  window.requestAnimationFrame = function (cb) {
    var g = gen;
    return _raf(function (t) { if (g === gen) cb(t); });
  };

  /* ---- routing ------------------------------------------------ */
  function parse(hash) {
    var m = /^#\/([^@]+)(?:@(.*))?$/.exec(hash || '');
    var file = m ? decodeURIComponent(m[1]) : HOME;
    if (!PAGES[file]) file = HOME;
    return { file: file, anchor: m && m[2] ? decodeURIComponent(m[2]) : '' };
  }

  function href(file, anchor) {
    return '#/' + encodeURIComponent(file) + (anchor ? '@' + encodeURIComponent(anchor) : '');
  }

  var suppress = null;   // a hash we wrote ourselves and must not re-render for

  function go(file, anchor) {
    var h = href(file, anchor);
    if (location.hash === h) { render(); return; }
    location.hash = h;   // pushes history, fires hashchange -> render()
  }

  function render() {
    var r = parse(location.hash);
    var page = PAGES[r.file];
    if (!page) return;

    // 1. tear the old page down
    gen++;
    ctrl.abort();
    ctrl = new AbortController();

    // 2. install the new one
    window.ML_ROUTE = r.file;
    document.title = page.title;
    document.getElementById('ml-page-style').textContent = page.styles || '';

    var body = document.body;
    body.removeAttribute('data-chapter');
    if (page.chapter) body.setAttribute('data-chapter', page.chapter);
    body.innerHTML = page.html;

    // 3. boot the shared runtime, then the page's own script(s)
    try {
      window.__ML_BOOT();
    } catch (e) {
      console.error('[ml-systems] runtime failed on ' + r.file, e);
    }
    if (window.ML) window.ML.go = go;

    for (var i = 0; i < page.scripts.length; i++) {
      try {
        new Function(page.scripts[i])();
      } catch (e) {
        console.error('[ml-systems] page script ' + (i + 1) + ' failed on ' + r.file, e);
      }
    }

    // 4. position: honour a deep link, otherwise start at the top
    if (r.anchor) {
      rawTimeout(function () {
        var el = document.getElementById(r.anchor);
        if (el) el.scrollIntoView({ block: 'start' });
        else window.scrollTo(0, 0);
      }, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }

  /* ---- intercept navigation ----------------------------------- */
  rawDocOn('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;

    var h = a.getAttribute('href');
    if (!h || /^[a-z]+:/i.test(h) || h.indexOf('#/') === 0) return;   // external, mailto:, already a route

    if (h.charAt(0) === '#') {                                        // in-page anchor (table of contents)
      var id = decodeURIComponent(h.slice(1));
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      suppress = href(parse(location.hash).file, id);
      history.replaceState(null, '', suppress);
      return;
    }

    var m = /^([^?#]+\.html)(?:#(.*))?$/.exec(h);                     // page link
    if (m && PAGES[m[1]]) {
      e.preventDefault();
      go(m[1], m[2] || '');
    }
  }, true);

  rawWinOn('hashchange', function () {
    if (location.hash === suppress) { suppress = null; return; }
    suppress = null;
    render();
  });

  /* ---- start -------------------------------------------------- */
  if (!location.hash) history.replaceState(null, '', href(HOME));
  // render() rewrites <body>, so it must not run while the parser is still
  // filling it — but it should run the moment parsing is done, not a frame later.
  if (document.readyState === 'loading') rawDocOn('DOMContentLoaded', render);
  else render();
})();
