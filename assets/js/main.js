/* Stay Fair! project page: interactive Figure 1, tabs, theme, reveal. */
(function () {
  'use strict';

  // Female ratio (%) read from the vector paths of Figure 1 (figure1_blue_slider_final.pdf).
  var DATA = {
    flux: {
      title: 'FLUX.2 (Painter)', kicker: 'Vanilla model', occ: 'painter',
      refLabel: 'Conditional model', refIdx: 0,
      w: [1, 2, 3, 4, 5],
      cfg: [42.9, 20.2, 11.6, 5.7, 3.4],
      sf: [42.9, 38.8, 42.5, 42.8, 43.6],
      x: [1, 5], xTicks: [1, 2, 3, 4, 5],
      y: [0, 60], yTicks: [0, 25, 50, 60],
      // Gender of samples j = 0..9 per scale (same seeds across scales and methods)
      samples: {
        cfg: ['fmfmmfmmfm', 'fmmmmfmmmm', 'fmmmmmmmmm', 'fmmmmmmmmm', 'mmmmmmmmmm'],
        sf: ['fmfmmfmmfm', 'fmmmmfmmff', 'fmmmmfmmff', 'fmmmfmmmff', 'fmmmfmmmff']
      }
    },
    ft: {
      title: 'SD1.5 + FT (Firefighter)', kicker: 'Debiased model', occ: 'firefighter',
      refLabel: 'Debiased model', refIdx: 2,
      w: [2.5, 5, 7.5, 10, 12.5],
      cfg: [19.9, 45.2, 68.2, 76.9, 83.0],
      sf: [73.3, 67.9, 68.2, 66.6, 66.8],
      x: [1, 12.5], xTicks: [1, 2.5, 5, 7.5, 10, 12.5],
      y: [10, 100], yTicks: [25, 50, 75, 100],
      samples: {
        cfg: ['mmmmffmmmm', 'fmfmffmfmm', 'fmfmffmfff', 'fmfmffffff', 'fmfmffffff'],
        sf: ['fmffffmfmf', 'fmfmffmfff', 'fmfmffmfff', 'fmfmffmfff', 'mmfmffffff']
      }
    }
  };

  // Expand gender strings into { src, g } lists: static/images/demo/<model>/<method><i>_<j>.jpg
  Object.keys(DATA).forEach(function (key) {
    var sm = DATA[key].samples;
    ['cfg', 'sf'].forEach(function (m) {
      sm[m] = sm[m].map(function (gs, i) {
        return gs.split('').map(function (g, j) {
          return { src: 'static/images/demo/' + key + '/' + m + i + '_' + j + '.jpg', g: g };
        });
      });
    });
  });

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SVGNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function fmtW(w) { return w.toFixed(1); }
  function fmtD(d) { return (d > 0 ? '+' : d < 0 ? '−' : '±') + Math.abs(d).toFixed(1) + ' pp'; }

  /* ---------------- Interactive Figure 1 ---------------- */
  var chartEl = $('#demo-chart');
  if (chartEl) {
    var state = { model: 'flux', idx: 0 };
    var W = 620, H = 400, M = { l: 52, r: 66, t: 18, b: 54 };
    // Size the viewBox to the container so SVG text stays at its CSS size on phones.
    function fit() {
      W = Math.max(340, Math.min(960, Math.round(chartEl.clientWidth || 620)));
      H = Math.round(W > 700 ? Math.max(W * 0.42, 360) : Math.max(W * 0.64, 300));
      M.r = W < 480 ? 56 : 66;
    }
    var slider = $('#demo-slider'), ticksEl = $('#demo-ticks');
    var nodes = {};

    var sx, sy;
    function scales(d) {
      sx = function (v) { return M.l + (v - d.x[0]) / (d.x[1] - d.x[0]) * (W - M.l - M.r); };
      sy = function (v) { return M.t + (1 - (v - d.y[0]) / (d.y[1] - d.y[0])) * (H - M.t - M.b); };
    }

    function render(animate) {
      var d = DATA[state.model];
      fit();
      scales(d);
      chartEl.innerHTML = '';
      var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true' }, chartEl);
      var x0 = M.l, x1 = W - M.r, y0 = M.t, y1 = H - M.b;

      nodes.cursor = el('rect', { class: 'cursor', y: y0, height: y1 - y0, width: 30, rx: 8 }, svg);

      d.yTicks.forEach(function (v) {
        el('line', { class: 'grid', x1: x0, x2: x1, y1: sy(v), y2: sy(v) }, svg);
        el('text', { x: x0 - 10, y: sy(v) + 4, 'text-anchor': 'end' }, svg).textContent = v;
      });
      d.xTicks.forEach(function (v) {
        if (d.w.indexOf(v) >= 0) el('line', { class: 'grid', x1: sx(v), x2: sx(v), y1: y0, y2: y1 }, svg);
        el('text', { x: sx(v), y: y1 + 20, 'text-anchor': 'middle' }, svg).textContent = fmtW(v);
      });
      el('line', { class: 'axis', x1: x0, x2: x0, y1: y0, y2: y1 }, svg);
      el('line', { class: 'axis', x1: x0, x2: x1, y1: y1, y2: y1 }, svg);
      el('text', { class: 'axis-title', x: (x0 + x1) / 2, y: H - 8, 'text-anchor': 'middle' }, svg).textContent = 'Guidance scale w';
      el('text', { class: 'axis-title', x: -(y0 + y1) / 2, y: 14, transform: 'rotate(-90)', 'text-anchor': 'middle' }, svg).textContent = 'Female ratio (%)';

      // Parity and reference lines
      el('line', { class: 'parity', x1: x0, x2: x1, y1: sy(50), y2: sy(50) }, svg);
      el('text', { class: 'lbl-parity', x: x1 - 4, y: sy(50) - 7, 'text-anchor': 'end' }, svg).textContent = 'Parity';
      var ref = d.cfg[d.refIdx];
      el('line', { class: 'ref', x1: x0, x2: x1, y1: sy(ref), y2: sy(ref) }, svg);
      var rl = el('g', {}, svg);
      el('circle', { class: 'ref-ring', cx: x0 + 16, cy: y0 + 14, r: 7 }, rl);
      el('circle', { class: 'dot-sf', cx: x0 + 16, cy: y0 + 14, r: 3.5 }, rl);
      el('text', { x: x0 + 30, y: y0 + 19, class: 'lbl-ref' }, rl).textContent = d.refLabel + ' (w = ' + fmtW(d.w[d.refIdx]) + ')';

      // Lines
      var lines = el('g', { class: 'lines' }, svg);
      ['cfg', 'sf'].forEach(function (k) {
        var p = el('polyline', {
          class: 'line-' + k, pathLength: 1,
          points: d.w.map(function (w, i) { return sx(w) + ',' + sy(d[k][i]); }).join(' ')
        }, lines);
        if (animate && !reduceMotion) {
          p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1';
          p.getBoundingClientRect();
          p.style.transition = 'stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)' + (k === 'sf' ? ' .15s' : '');
          p.style.strokeDashoffset = '0';
        }
      });

      // Points
      nodes.dots = { cfg: [], sf: [] };
      var pts = el('g', { class: 'pts' }, svg);
      ['cfg', 'sf'].forEach(function (k) {
        d.w.forEach(function (w, i) {
          nodes.dots[k].push(el('circle', { class: 'dot dot-' + k, cx: sx(w), cy: sy(d[k][i]), r: 5.5 }, pts));
        });
      });
      el('circle', { class: 'ref-ring', cx: sx(d.w[d.refIdx]), cy: sy(ref), r: 11 }, pts);
      el('circle', { class: 'dot-sf', cx: sx(d.w[d.refIdx]), cy: sy(ref), r: 6.5 }, pts);

      nodes.valCfg = el('text', { class: 'val val-cfg' }, svg);
      nodes.valSf = el('text', { class: 'val val-sf' }, svg);

      // Click / hover targets per scale
      d.w.forEach(function (w, i) {
        var half = (sx(d.w[1]) - sx(d.w[0])) / 2;
        var hit = el('rect', { class: 'hit', x: sx(w) - half, y: y0, width: half * 2, height: y1 - y0 }, svg);
        hit.addEventListener('click', function () { stopPlay(); setIdx(i); });
      });

      // Slider ticks
      ticksEl.innerHTML = '';
      d.w.forEach(function (w, i) {
        var s = document.createElement('span');
        s.textContent = fmtW(w);
        s.addEventListener('click', function () { stopPlay(); setIdx(i); });
        ticksEl.appendChild(s);
      });

      $('#demo-title').textContent = d.title;
      $('#demo-kicker').textContent = d.kicker;
      $('#demo-occ').textContent = d.occ;
      update();
    }

    function update() {
      var d = DATA[state.model], i = state.idx, w = d.w[i];
      var ref = d.cfg[d.refIdx], c = d.cfg[i], s = d.sf[i];
      var x = sx(w);
      nodes.cursor.setAttribute('x', x - 15);
      nodes.dots.cfg.forEach(function (n, j) { n.setAttribute('r', j === i ? 8.5 : 5.5); });
      nodes.dots.sf.forEach(function (n, j) { n.setAttribute('r', j === i ? 8.5 : 5.5); });


      // Value labels to the right of the current points
      var lx = x + 18, anchor = 'start';
      // Put the higher value above its point and the lower one below, clear of the lines
      var yc = sy(c) + (c >= s ? -10 : 20), ys = sy(s) + (s > c ? -10 : 20);
      if (Math.abs(yc - ys) < 18) {
        if (Math.abs(c - s) < 0.05) { nodes.valCfg.textContent = ''; }
        else if (c < s) { yc = ys + 18; } else { ys = yc + 18; }
      }
      nodes.valCfg.setAttribute('x', lx); nodes.valCfg.setAttribute('y', yc); nodes.valCfg.setAttribute('text-anchor', anchor);
      nodes.valSf.setAttribute('x', lx); nodes.valSf.setAttribute('y', ys); nodes.valSf.setAttribute('text-anchor', anchor);
      nodes.valSf.textContent = s.toFixed(1) + '%';
      if (Math.abs(c - s) >= 0.05) nodes.valCfg.textContent = c.toFixed(1) + '%';

      // Slider
      slider.max = d.w.length - 1;
      slider.value = i;
      slider.style.setProperty('--fill', (i / (d.w.length - 1) * 100) + '%');
      slider.setAttribute('aria-valuetext', 'w = ' + fmtW(w));
      $$('span', ticksEl).forEach(function (t, j) { t.classList.toggle('is-on', j === i); });
      $('#demo-w').textContent = 'w = ' + fmtW(w);

      renderSamples(d, i);
    }

    // Generated images per scale: d.samples = { cfg: [[{src, g}, ...] per w], sf: [...] }, g is 'f' or 'm'.
    // The rows are built once per model; changing the scale only swaps src/class on the same <img>s.
    var samplesEl = $('#demo-samples'), NS = 10, sampleRows = null, builtFor = null;
    var ROWS = [['cfg', 'Standard Guidance', ''], ['sf', 'StayFair (Ours)', ' ours']];
    function buildSamples(d) {
      samplesEl.innerHTML = '';
      var have = !!(d.samples && d.samples.cfg);
      sampleRows = ROWS.map(function (r) {
        var lbl = document.createElement('div');
        lbl.className = 's-lbl' + r[2];
        lbl.innerHTML = r[1] + (have ? '<small></small>' : '');
        var row = document.createElement('div');
        row.className = 's-row';
        var cells = [];
        for (var k = 0; k < NS; k++) {
          var el = document.createElement(have ? 'img' : 'div');
          if (!have) el.className = 's-slot';
          else el.decoding = 'async';
          row.appendChild(el); cells.push(el);
        }
        samplesEl.appendChild(lbl); samplesEl.appendChild(row);
        return { key: r[0], name: r[1], count: lbl.querySelector('small'), cells: cells };
      });
      if (!have) {
        var n = document.createElement('p'); n.className = 'samples-note';
        n.textContent = 'Sample images for this setting will be added.';
        samplesEl.appendChild(n);
      } else {
        // Preload the other scales of this model so slider moves do not flash
        ['cfg', 'sf'].forEach(function (m) {
          d.samples[m].forEach(function (cell) { cell.forEach(function (x) { new Image().src = x.src; }); });
        });
      }
    }
    function renderSamples(d, i) {
      $('#samples-w').textContent = 'w = ' + fmtW(d.w[i]);
      if (builtFor !== d) { buildSamples(d); builtFor = d; }
      if (!(d.samples && d.samples.cfg)) return;
      sampleRows.forEach(function (r) {
        var imgs = d.samples[r.key][i];
        var nf = imgs.filter(function (x) { return x.g === 'f'; }).length;
        r.count.textContent = nf + '/' + imgs.length + ' female';
        r.cells.forEach(function (im, k) {
          if (im.getAttribute('src') !== imgs[k].src) im.src = imgs[k].src;
          im.className = imgs[k].g;
          im.alt = r.name + ', w = ' + fmtW(d.w[i]) + ', sample ' + (k + 1);
        });
      });
    }

    function setIdx(i) { state.idx = Math.max(0, Math.min(DATA[state.model].w.length - 1, i)); update(); }
    function setModel(m) {
      if (m === state.model) return;
      stopPlay();
      state.model = m; state.idx = DATA[m].refIdx;
      $$('.seg-btn[data-model]').forEach(function (b) {
        var on = b.getAttribute('data-model') === m;
        b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on);
      });
      render(true);
    }

    // Sweep the scale from low to high
    var timer = null, playBtn = $('#demo-play');
    function setPlayUI(on) {
      playBtn.innerHTML = on ? '<i class="fas fa-pause"></i><span>Pause</span>' : '<i class="fas fa-play"></i><span>Sweep the scale</span>';
    }
    function stopPlay() { if (timer) { clearInterval(timer); timer = null; setPlayUI(false); } }
    function startPlay() {
      stopPlay();
      var n = DATA[state.model].w.length;
      setIdx(0);
      setPlayUI(true);
      timer = setInterval(function () {
        if (state.idx >= n - 1) { stopPlay(); return; }
        setIdx(state.idx + 1);
      }, 850);
    }
    playBtn.addEventListener('click', function () { timer ? stopPlay() : startPlay(); });
    slider.addEventListener('input', function () { stopPlay(); setIdx(+slider.value); });
    $$('.seg-btn[data-model]').forEach(function (b) { b.addEventListener('click', function () { setModel(b.getAttribute('data-model')); }); });

    render(false);
    var lastW = chartEl.clientWidth;
    window.addEventListener('resize', function () {
      if (Math.abs(chartEl.clientWidth - lastW) > 24) { lastW = chartEl.clientWidth; render(false); } else { update(); }
    });

    // Play the sweep once when the demo first comes into view.
    if ('IntersectionObserver' in window && !reduceMotion) {
      var touched = false;
      chartEl.addEventListener('pointerdown', function () { touched = true; });
      slider.addEventListener('pointerdown', function () { touched = true; });
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { io.disconnect(); if (!touched) setTimeout(function () { if (!touched) startPlay(); }, 500); }
        });
      }, { threshold: 0.6 });
      io.observe(chartEl);
    }
  }

  /* ---------------- Problem: bias decomposition schematic ---------------- */
  // One schematic: today's guidance (gray curve) with the three biases on top,
  // and scale-invariant group fairness (blue line on T) at the bottom.
  var pbEl = $('#pb-chart');
  if (pbEl) {
    var PW = 900, PH = 330, X0 = 60, X1 = 800, YT = 250, YREF = 175, YAX = 290;
    var XREF = 0.22, XW = 0.72;
    var px = function (xn) { return X0 + xn * (X1 - X0); };
    var cy = function (xn) { return YREF - 120 * Math.tanh(2.4 * (xn - XREF)); };  // stays above T
    function mathText(parent, attrs, base, sup, sub, stack) {
      var t = el('text', attrs, parent);
      t.appendChild(document.createTextNode(base));
      if (sup) { var a = el('tspan', { dy: -7, 'font-size': '12' }, t); a.textContent = sup; }
      if (sub && stack) { var c = el('tspan', { dx: -8 * sup.length, dy: 12, 'font-size': '11' }, t); c.textContent = sub; }
      else if (sub) { var b = el('tspan', { dy: sup ? 3 : 5, 'font-size': sup ? '9.5' : '11' }, t); b.textContent = sub; }
      return t;
    }
    var svg = el('svg', { viewBox: '0 0 ' + PW + ' ' + PH, 'aria-hidden': 'true' }, pbEl);
    el('line', { class: 'ax', x1: X0, x2: X0, y1: 30, y2: YAX }, svg);
    el('line', { class: 'ax', x1: X0, x2: X1, y1: YAX, y2: YAX }, svg);
    el('text', { x: (X0 + X1) / 2, y: PH - 6, 'text-anchor': 'middle' }, svg).textContent = 'Guidance scale';
    el('text', { x: -(10 + YAX) / 2, y: 22, transform: 'rotate(-90)', 'text-anchor': 'middle' }, svg).textContent = 'Group ratio';
    mathText(svg, { x: px(XREF), y: YAX + 20, 'text-anchor': 'middle' }, 'w', null, 'ref');
    el('text', { x: px(XW), y: YAX + 20, 'text-anchor': 'middle' }, svg).textContent = 'w';

    // Reference level and target
    el('line', { class: 'refline', x1: X0, x2: X1, y1: YREF, y2: YREF }, svg);
    mathText(svg, { class: 'lbl-ref', x: X1 - 4, y: YREF + 18, 'text-anchor': 'end' }, 'Q', 'w', 'ref');
    el('line', { class: 'tline', x1: X0, x2: X1, y1: YT, y2: YT }, svg);
    // (2) Scale-invariant group fairness: Q^w sits on T at every w
    el('line', { class: 'curve fair', x1: X0, x2: X1, y1: YT, y2: YT }, svg);
    el('text', { class: 'lbl-t', x: X1 + 8, y: YT + 20 }, svg).textContent = 'T (target)';
    var fl = el('text', { class: 'lbl-fair', x: X0 + 10, y: YT + 20 }, svg);
    fl.appendChild(document.createTextNode('Guidance scale-invariant group fairness (Bias'));
    el('tspan', { dy: -7, 'font-size': '11' }, fl).textContent = 'w';
    el('tspan', { dy: 7 }, fl).textContent = ' = 0 for any w)';

    // (1) Standard guidance: the group ratio drifts with w
    var pts = [];
    for (var i = 0; i <= 80; i++) { var xn = i / 80; pts.push(px(xn) + ',' + cy(xn)); }
    el('polyline', { class: 'curve cfg', points: pts.join(' ') }, svg);
    mathText(svg, { class: 'lbl-cur', x: X1 + 8, y: cy(1) + 5 }, 'Q', 'w', null);

    // All three biases measured on the vertical line at w
    var yw = cy(XW), xw = px(XW);
    el('circle', { class: 'pt-ref', cx: px(XREF), cy: YREF, r: 7 }, svg);
    el('line', { class: 'guide', x1: px(XREF), x2: xw, y1: YREF, y2: YREF }, svg);
    el('line', { class: 'br-model', x1: xw, x2: xw, y1: YT, y2: YREF }, svg);
    mathText(svg, { class: 'lbl-model', x: xw - 12, y: (YT + YREF) / 2 + 5, 'text-anchor': 'end' }, 'Bias', null, 'M');
    el('line', { class: 'br-guid', x1: xw, x2: xw, y1: YREF, y2: yw }, svg);
    mathText(svg, { class: 'lbl-guid', x: xw - 12, y: (YREF + yw) / 2 + 5, 'text-anchor': 'end' }, 'Bias', 'w', 'G', true);
    el('circle', { class: 'pt', cx: xw, cy: yw, r: 7 }, svg);
    var xt = xw + 26;
    el('line', { class: 'br-total', x1: xt, x2: xt, y1: YT, y2: yw }, svg);
    [YT, yw].forEach(function (yy) { el('line', { class: 'br-total', x1: xt - 5, x2: xt + 5, y1: yy, y2: yy }, svg); });
    mathText(svg, { class: 'lbl-total', x: xt + 10, y: (yw + YREF) / 2 + 5 }, 'Bias', 'w', null);
  }

  /* ---------------- Method (a): classifier output distributions ---------------- */
  // Log-gamma (Lanczos) for Beta densities and moments E[f^w] = B(a + w, b) / B(a, b).
  function lgamma(z) {
    var g = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61503916999185,
      12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
    z -= 1; var x = 0.99999999999980993;
    for (var i = 0; i < 8; i++) x += g[i] / (z + i + 1);
    var t = z + 7.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }
  function lbeta(a, b) { return lgamma(a) + lgamma(b) - lgamma(a + b); }
  function betaPdf(x, a, b) { return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lbeta(a, b)); }
  function betaMom(a, b, w) { return Math.exp(lbeta(a + w, b) - lbeta(a, b)); }

  var cgEl = $('#cg-chart');
  if (cgEl) {
    // Schematic classifier outputs f(X_t) | group as Beta(a, b); both "same mean" groups have mean 0.8.
    var CASES = [
      { name: 'Biased', f: [8, 6], m: [14, 3] },
      { name: 'Same mean', sub: '(Demographic Parity)', f: [40, 10], m: [5, 1.25] },
      { name: 'Same distribution', sub: '(Strong Demographic Parity)', f: [12, 3], m: [12, 3] }
    ];
    var CW_ = [1, 4, 8], LMIN = -1.5, LMAX = 1;   // y axis: log10 of the rescaled weight, ~0.03 ... 10

    // Density of y = log10(f^w / c) for f ~ Beta(a, b): p_y(y) = p_f(f) * f * ln10 / w, on a fine y grid.
    function logViolin(ab, w, c, n) {
      var out = [];
      for (var i = 0; i <= n; i++) {
        var y = LMIN + (LMAX - LMIN) * i / n, f = Math.pow(c * Math.pow(10, y), 1 / w);
        out.push([y, f > 0 && f < 1 ? betaPdf(f, ab[0], ab[1]) * f * Math.LN10 / w : 0]);
      }
      return out;
    }

    // Vertical split violins, w on the x axis: female on the left half, male on the right.
    // Panels sit side by side, or stack on narrow screens.
    function drawCg() {
      var cols = cgEl.clientWidth < 620 ? 1 : 3;
      var PWD = 300, PHT = 230, GAPX = 28, M = { l: 44, t: 44, b: 52 };
      var rows = Math.ceil(CASES.length / cols);
      var VW = M.l + cols * PWD + (cols - 1) * GAPX, VH = rows * (M.t + PHT + M.b);
      cgEl.innerHTML = '';
      var svg = el('svg', { viewBox: '0 0 ' + VW + ' ' + VH, 'aria-hidden': 'true' }, cgEl);
      CASES.forEach(function (cs, p) {
        var px0 = M.l + (p % cols) * (PWD + GAPX), py0 = Math.floor(p / cols) * (M.t + PHT + M.b) + M.t, py1 = py0 + PHT;
        var gy = function (y) { return py1 - (y - LMIN) / (LMAX - LMIN) * PHT; };
        el('text', { class: 'cg-panel', x: px0 + PWD / 2, y: py0 - (cs.sub ? 26 : 10), 'text-anchor': 'middle' }, svg).textContent = cs.name;
        if (cs.sub) el('text', { class: 'cg-sub', x: px0 + PWD / 2, y: py0 - 10, 'text-anchor': 'middle' }, svg).textContent = cs.sub;
        [[-1, '0.1'], [0, '1'], [1, '10']].forEach(function (tk) {
          el('line', { class: tk[0] === 0 ? 'v-ref' : 'grid-h', x1: px0, x2: px0 + PWD, y1: gy(tk[0]), y2: gy(tk[0]) }, svg);
          if (p % cols === 0) el('text', { x: px0 - 8, y: gy(tk[0]) + 4, 'text-anchor': 'end' }, svg).textContent = tk[1];
        });
        el('line', { class: 'ax', x1: px0, x2: px0 + PWD, y1: py1, y2: py1 }, svg);
        var slot = PWD / CW_.length, means = { f: [], m: [] };
        CW_.forEach(function (w, q) {
          var xc = px0 + slot * (q + 0.5), half = slot * 0.42;
          var ef = betaMom(cs.f[0], cs.f[1], w), em = betaMom(cs.m[0], cs.m[1], w), c = (ef + em) / 2;
          var df = logViolin(cs.f, w, c, 220), dm = logViolin(cs.m, w, c, 220);
          var top = Math.max.apply(null, df.concat(dm).map(function (q2) { return q2[1]; }));
          [[df, -1, 'f'], [dm, 1, 'm']].forEach(function (z) {
            var own = Math.max.apply(null, z[0].map(function (q2) { return q2[1]; }));
            var pts = z[0].filter(function (q2) { return q2[1] > own * 0.03; });
            if (!pts.length) return;
            var line = pts.map(function (q2) { return (xc + z[1] * q2[1] / top * half) + ',' + gy(q2[0]); }).join(' ');
            var start = xc + ',' + gy(pts[0][0]), end = xc + ',' + gy(pts[pts.length - 1][0]);
            el('path', { class: 'vfill-' + z[2], d: 'M' + start + ' L' + line.replace(/ /g, ' L') + ' L' + end + ' Z' }, svg);
            el('polyline', { class: 'vline-' + z[2], points: start + ' ' + line + ' ' + end }, svg);
          });
          var my = function (v) { return gy(Math.max(LMIN, Math.min(LMAX, Math.log10(v)))); };
          means.f.push([xc - 5, my(ef / c)]); means.m.push([xc + 5, my(em / c)]);
          el('text', { x: xc, y: py1 + 16, 'text-anchor': 'middle' }, svg).textContent = 'w = ' + w;
          var share = ef / (ef + em) * 100;
          el('text', { class: 'v-share' + (Math.abs(share - 50) > 0.5 ? ' off' : ''), x: xc, y: py1 + 34, 'text-anchor': 'middle' }, svg)
            .textContent = share.toFixed(0) + '% F';
        });
        // Connect the group means across w
        ['f', 'm'].forEach(function (g) {
          el('polyline', { class: 'v-trend-' + g, points: means[g].map(function (q2) { return q2.join(','); }).join(' ') }, svg);
          means[g].forEach(function (q2) { el('circle', { class: 'v-dot-' + g, cx: q2[0], cy: q2[1], r: 4.2 }, svg); });
        });
      });
      var at = el('text', { x: -(M.t + PHT / 2), y: 12, transform: 'rotate(-90)', 'text-anchor': 'middle' }, svg);
      at.appendChild(document.createTextNode('Weight f'));
      el('tspan', { dy: -5, 'font-size': '9.5' }, at).textContent = 'w';
      el('tspan', { dy: 5 }, at).textContent = ' rescaled (log)';
    }
    var cgLastW = cgEl.clientWidth;
    window.addEventListener('resize', function () {
      if ((cgEl.clientWidth < 620) !== (cgLastW < 620)) { cgLastW = cgEl.clientWidth; drawCg(); }
    });
    drawCg();
  }

  /* ---------------- Method (b): alpha tilts the slope (paper Fig. 3) ---------------- */
  var cfgEl = $('#cfg-chart');
  if (cfgEl) {
    // Female ratio (%) from paper Fig. 3, w = 2.5 ... 12.5.
    var AL = {
      jn: { star: 5, curves: {
        '-10': [62.2, 69.4, 77.0, 78.8, 79.8], '-5': [59.1, 66.7, 73.7, 76.8, 74.7], '-2.5': [56.5, 62.2, 72.7, 71.4, 71.4],
        '0': [53.3, 58.2, 61.2, 66.0, 66.7], '5': [48.9, 50.5, 51.0, 48.5, 50.0], '10': [42.4, 38.4, 31.3, 32.7, 31.6] } },
      fd: { star: -2.5, curves: {
        '-10': [25.0, 35.7, 57.8, 81.5, 85.9], '-5': [52.2, 50.0, 57.8, 68.8, 71.3], '-2.5': [62.8, 60.0, 57.8, 60.5, 56.0],
        '0': [80.2, 70.2, 57.8, 52.5, 50.6], '5': [95.7, 85.2, 57.8, 39.0, 32.9], '10': [97.9, 89.8, 57.8, 33.7, 20.9] } }
    };
    var ALPHAS = [-10, -5, -2.5, 0, 5, 10], WS = [2.5, 5, 7.5, 10, 12.5];
    var fa = { p: 'jn', i: 3 };
    var FW = 420, FH = 230, FM = { l: 40, r: 92, t: 12, b: 38 };
    // Size the viewBox to the container so SVG text keeps its CSS size.
    function fitCfg() {
      FW = Math.max(340, Math.min(760, Math.round(cfgEl.clientWidth || 420)));
      FH = Math.round(Math.max(250, FW * 0.46));
    }
    // Axis starts at w = 1 (no guidance), as in the other guidance-scale plots.
    var fx = function (w) { return FM.l + (w - 1) / 11.5 * (FW - FM.l - FM.r); };
    var fy = function (r) { return FM.t + (1 - r / 100) * (FH - FM.t - FM.b); };

    var shown = null;  // curve currently on screen, tweened toward the selected alpha
    function drawCfg(vals) {
      var P = AL[fa.p], aSel = ALPHAS[fa.i];
      var target = P.curves[String(aSel)];
      vals = vals || target;
      fitCfg();
      cfgEl.innerHTML = '';
      var svg = el('svg', { viewBox: '0 0 ' + FW + ' ' + FH, 'aria-hidden': 'true' }, cfgEl);
      var x0 = FM.l, x1 = FW - FM.r, y1 = FH - FM.b;
      [0, 50, 100].forEach(function (v) {
        el('line', { class: 'grid-h', x1: x0, x2: x1, y1: fy(v), y2: fy(v) }, svg);
        el('text', { x: x0 - 8, y: fy(v) + 4, 'text-anchor': 'end' }, svg).textContent = v;
      });
      el('line', { class: 'ax', x1: x0, x2: x0, y1: FM.t, y2: y1 }, svg);
      el('line', { class: 'ax', x1: x0, x2: x1, y1: y1, y2: y1 }, svg);
      [1].concat(WS).forEach(function (w) { el('text', { x: fx(w), y: y1 + 15, 'text-anchor': 'middle' }, svg).textContent = w; });
      el('text', { x: (x0 + x1) / 2, y: FH - 4, 'text-anchor': 'middle' }, svg).textContent = 'Guidance scale w';
      el('text', { x: -(FM.t + y1) / 2, y: 12, transform: 'rotate(-90)', 'text-anchor': 'middle' }, svg).textContent = 'Female ratio (%)';
      var pts = function (c) { return c.map(function (r, k) { return fx(WS[k]) + ',' + fy(r); }).join(' '); };
      ALPHAS.forEach(function (a) { if (a !== aSel) el('polyline', { class: 'a-bg', points: pts(P.curves[String(a)]) }, svg); });
      var kind = aSel === 0 ? 'cfg' : aSel === P.star ? 'star' : 'other';
      el('polyline', { class: 'a-line a-' + kind, points: pts(vals) }, svg);
      vals.forEach(function (r, k) { el('circle', { class: 'a-pt a-' + kind, cx: fx(WS[k]), cy: fy(r), r: 4.5 }, svg); });
      var range = Math.max.apply(null, target) - Math.min.apply(null, target);
      // Current alpha written next to the end of the highlighted curve
      var lab = el('text', { class: 'a-lbl a-' + kind, x: fx(12.5) + 12, y: fy(vals[vals.length - 1]) + 4 }, svg);
      lab.textContent = 'α = ' + aSel;
      if (kind !== 'other') el('tspan', { x: fx(12.5) + 12, dy: 15, class: 'a-sub' }, lab).textContent = kind === 'cfg' ? '(CFG)' : '(StayFair)';
      $('#cfg-range').textContent = range.toFixed(1);
      $('#cfg-range-box').className = 'cfg-range a-' + kind;
      $('#cfg-a').value = fa.i;
      $('#cfg-a').style.setProperty('--fill', (fa.i / (ALPHAS.length - 1) * 100) + '%');
      shown = vals;
    }

    // Tween the highlighted curve from what is on screen to the selected alpha.
    var aRaf = null;
    function goTo(i) {
      var from = shown ? shown.slice() : null;
      fa.i = i;
      var to = AL[fa.p].curves[String(ALPHAS[i])];
      if (!from || reduceMotion) { drawCfg(); return; }
      var t0 = performance.now(), D = 520;
      if (aRaf) cancelAnimationFrame(aRaf);
      (function step(now) {
        var k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
        drawCfg(from.map(function (v, j) { return v + (to[j] - v) * e; }));
        if (k < 1) aRaf = requestAnimationFrame(step);
      })(t0);
    }

    // Auto-play: sweep alpha back and forth, holding longer at CFG and at alpha*.
    var aDir = 1, aTimer = null, aPausedUntil = 0, aVisible = false;
    function aTick() {
      aTimer = null;
      if (!aVisible) return;
      if (performance.now() < aPausedUntil) { aTimer = setTimeout(aTick, 500); return; }
      var n = fa.i + aDir;
      if (n < 0 || n >= ALPHAS.length) { aDir = -aDir; n = fa.i + aDir; }
      goTo(n);
      var a = ALPHAS[n], hold = (a === 0 || a === AL[fa.p].star) ? 1800 : 900;
      aTimer = setTimeout(aTick, hold);
    }
    function aPlay() { if (!aTimer && !reduceMotion) aTimer = setTimeout(aTick, 900); }
    function aPause() { aPausedUntil = performance.now() + 6000; }

    $('#cfg-a').addEventListener('input', function (e) { aPause(); goTo(+e.target.value); });
    $$('#cfg-tabs .seg-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        aPause();
        fa.p = b.getAttribute('data-panel');
        $$('#cfg-tabs .seg-btn').forEach(function (x) { var on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on); });
        shown = null; drawCfg();
      });
    });
    drawCfg();
    var vTrack = $('.vs-track');
    function sizeVSlider() { if (vTrack) $('#cfg-a').style.setProperty('--len', vTrack.clientHeight + 'px'); }
    sizeVSlider();
    window.addEventListener('resize', sizeVSlider);
    var cfgLastW = cfgEl.clientWidth;
    window.addEventListener('resize', function () {
      if (Math.abs(cfgEl.clientWidth - cfgLastW) > 24) { cfgLastW = cfgEl.clientWidth; drawCfg(shown); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        aVisible = es[0].isIntersecting;
        if (aVisible) aPlay();
      }, { threshold: 0.4 }).observe(cfgEl);
    }
  }

  /* ---------------- Results: lowest vs. highest scale scatter ---------------- */
  var rsEl = $('#rs-chart');
  if (rsEl && window.SF_RESULTS) {
    var rsModel = 'flux2';
    function drawRs() {
      var D = window.SF_RESULTS[rsModel];
      var cols = 2;
      var PW = 200, GAP = 46, M = { l: 40, t: 34, b: 42, r: 8 };
      var VW = M.l + cols * PW + (cols - 1) * GAP + M.r;
      var rowsN = cols === 1 ? 2 : 1, VH = rowsN * (M.t + PW + M.b);
      rsEl.innerHTML = '';
      var svg = el('svg', { viewBox: '0 0 ' + VW + ' ' + VH, 'aria-hidden': 'true' }, rsEl);
      [['cfg', 'CFG', 'pt-cfg'], ['sf', 'StayFair', 'pt-sf']].forEach(function (p, k) {
        var x0 = M.l + (cols === 1 ? 0 : k * (PW + GAP)), y0 = (cols === 1 ? k : 0) * (M.t + PW + M.b) + M.t;
        var sx = function (v) { return x0 + v / 100 * PW; }, sy = function (v) { return y0 + PW - v / 100 * PW; };
        [0, 50, 100].forEach(function (v) {
          el('line', { class: 'grid-h', x1: x0, x2: x0 + PW, y1: sy(v), y2: sy(v) }, svg);
          el('line', { class: 'grid-h', x1: sx(v), x2: sx(v), y1: y0, y2: y0 + PW }, svg);
          el('text', { x: x0 - 8, y: sy(v) + 4, 'text-anchor': 'end' }, svg).textContent = v;
          el('text', { x: sx(v), y: y0 + PW + 16, 'text-anchor': 'middle' }, svg).textContent = v;
        });
        el('line', { class: 'ax', x1: x0, x2: x0, y1: y0, y2: y0 + PW }, svg);
        el('line', { class: 'ax', x1: x0, x2: x0 + PW, y1: y0 + PW, y2: y0 + PW }, svg);
        el('line', { class: 'diag', x1: sx(0), y1: sy(0), x2: sx(100), y2: sy(100) }, svg);
        var pts = D[p[0]], dev = 0;
        pts.forEach(function (q, i) {
          dev += Math.abs(q[1] - q[0]);
          var c = el('circle', { class: p[2], cx: sx(q[0]), cy: sy(q[1]), r: 3.6 }, svg);
          el('title', {}, c).textContent = D.occ[i] + ': ' + q[0] + '% → ' + q[1] + '%';
        });
        el('text', { class: 'p-title ' + p[0], x: x0, y: y0 - 14 }, svg).textContent = p[1];
        el('text', { class: 'p-stat', x: x0 + PW, y: y0 - 14, 'text-anchor': 'end' }, svg)
          .textContent = 'avg |y − x| ' + (dev / pts.length).toFixed(1);
        el('text', { x: x0 + PW / 2, y: y0 + PW + 32, 'text-anchor': 'middle' }, svg).textContent = 'w = ' + D.lo + ' (%)';
        el('text', { x: -(y0 + PW / 2), y: x0 - 28, transform: 'rotate(-90)', 'text-anchor': 'middle' }, svg).textContent = 'w = ' + D.hi + ' (%)';
      });
    }
    $$('#rs-tabs .seg-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        rsModel = b.getAttribute('data-m');
        $$('#rs-tabs .seg-btn').forEach(function (x) { var on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on); });
        drawRs();
      });
    });
    drawRs();
  }

  /* ---------------- Results: per-scale curves for seven occupations ---------------- */
  var fcEl = $('#fc-chart');
  if (fcEl && window.SF_RESULTS && window.SF_RESULTS.curves) {
    var CR = window.SF_RESULTS.curves, fcModel = 'flux2';
    var FCOL = ['#1f77b4', '#17a589', '#e69f00', '#d4669b', '#2e8b37', '#6a4fb3', '#e4572e'];
    function drawFc() {
      var C = CR.models[fcModel];
      // Legend follows the model: occupations are picked per model, ordered from largest CFG decrease to largest increase.
      $('#fc-cap').innerHTML = 'CFG curves drift with <i>w</i>, while StayFair keeps them flat across scales. '
        + '<span class="cap-note">' + (C.fixed ? 'Occupations from the paper\'s figure.' : 'Occupations sampled evenly by their CFG change.') + '</span>';
      $('#fc-legend').innerHTML = C.occ.map(function (o, i) { return '<span><i style="background:' + FCOL[i] + '"></i>' + o + '</span>'; }).join('');
      var PW = 200, GAP = 46, M = { l: 40, t: 34, b: 42, r: 8 };
      var VW = M.l + 2 * PW + GAP + M.r, VH = M.t + PW + M.b;
      fcEl.innerHTML = '';
      var svg = el('svg', { viewBox: '0 0 ' + VW + ' ' + VH, 'aria-hidden': 'true' }, fcEl);
      var fcTip = document.createElement('div'); fcTip.className = 'fc-tip'; fcTip.hidden = true; fcEl.appendChild(fcTip);
      [['cfg', 'CFG'], ['sf', 'StayFair']].forEach(function (p, k) {
        // Every model's axis starts at w = 1 (no guidance), as in Figure 1.
        var x0 = M.l + k * (PW + GAP), y0 = M.t, w0 = 1, w1 = C.w[C.w.length - 1];
        var sx = function (w) { return x0 + (w - w0) / (w1 - w0) * PW; };
        var sy = function (v) { return y0 + PW - v / 100 * PW; };
        [0, 50, 100].forEach(function (v) {
          el('line', { class: 'grid-h', x1: x0, x2: x0 + PW, y1: sy(v), y2: sy(v) }, svg);
          el('text', { x: x0 - 8, y: sy(v) + 4, 'text-anchor': 'end' }, svg).textContent = v;
        });
        // Tick labels: w = 1 plus the sampled scales, skipping a label that would crowd the one before it
        var lastX = -1e9;
        (C.w[0] > 1 ? [1].concat(C.w) : C.w).forEach(function (w) {
          if (sx(w) - lastX < 22) return;
          el('text', { x: sx(w), y: y0 + PW + 16, 'text-anchor': 'middle' }, svg).textContent = w;
          lastX = sx(w);
        });
        el('line', { class: 'ax', x1: x0, x2: x0, y1: y0, y2: y0 + PW }, svg);
        el('line', { class: 'ax', x1: x0, x2: x0 + PW, y1: y0 + PW, y2: y0 + PW }, svg);
        C[p[0]].forEach(function (vals, i) {
          var ptsStr = vals.map(function (v, j) { return sx(C.w[j]) + ',' + sy(v); }).join(' ');
          var g = el('g', { class: 'fc-g', 'data-i': i }, svg);
          el('polyline', { class: 'fc-line', points: ptsStr, style: 'stroke:' + FCOL[i] }, g);
          vals.forEach(function (v, j) { el('circle', { cx: sx(C.w[j]), cy: sy(v), r: 2.6, style: 'fill:' + FCOL[i] }, g); });
          // Wide invisible stroke so the line is easy to hover
          var hit = el('polyline', { class: 'fc-hit', points: ptsStr }, g);
          var range = Math.max.apply(null, vals) - Math.min.apply(null, vals);
          hit.addEventListener('mouseenter', function () {
            svg.classList.add('is-focus'); g.classList.add('is-on');
            fcTip.innerHTML = '<b style="color:' + FCOL[i] + '">' + C.occ[i] + '</b> · ' + p[1] + '<br>Range <b>' + range.toFixed(1) + '</b> pp';
            fcTip.hidden = false;
          });
          hit.addEventListener('mousemove', function (e) {
            var r = fcEl.getBoundingClientRect();
            fcTip.style.left = (e.clientX - r.left + 12) + 'px'; fcTip.style.top = (e.clientY - r.top - 10) + 'px';
          });
          hit.addEventListener('mouseleave', function () { svg.classList.remove('is-focus'); g.classList.remove('is-on'); fcTip.hidden = true; });
        });
        el('text', { class: 'p-title ' + p[0], x: x0, y: y0 - 14 }, svg).textContent = p[1];
        el('text', { x: x0 + PW / 2, y: y0 + PW + 32, 'text-anchor': 'middle' }, svg).textContent = 'Guidance scale w';
        if (k === 0) el('text', { x: -(y0 + PW / 2), y: x0 - 28, transform: 'rotate(-90)', 'text-anchor': 'middle' }, svg).textContent = 'Female ratio (%)';
      });
    }
    $$('#fc-tabs .seg-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        fcModel = b.getAttribute('data-m');
        $$('#fc-tabs .seg-btn').forEach(function (x) { var on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on); });
        drawFc();
      });
    });
    drawFc();
  }

  /* ---------------- Tabs ---------------- */
  $$('[data-tabs]').forEach(function (box) {
    var tabs = $$('.tab', box), panels = $$('.tab-panel', box);
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var k = t.getAttribute('data-tab');
        tabs.forEach(function (x) { var on = x === t; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on); });
        panels.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-panel') === k); });
      });
    });
  });

  /* ---------------- Theme ---------------- */
  var toggle = $('#theme-toggle');
  if (toggle) toggle.addEventListener('click', function () {
    var root = document.documentElement;
    var cur = root.getAttribute('data-theme') ||
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('sf-theme', next); } catch (e) {}
  });

  /* ---------------- Header state and active nav ---------------- */
  var header = $('#site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var navLinks = $$('.primary-nav a');
  if ('IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) secIO.observe(s); });
  }

  /* ---------------- Reveal on scroll ---------------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (r) { rio.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add('is-in'); });
  }

  /* ---------------- BibTeX copy ---------------- */
  var copyBtn = $('#bib-copy');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var text = $('#bib-code').textContent;
    var done = function () {
      copyBtn.classList.add('is-done');
      copyBtn.innerHTML = '<i class="fas fa-check"></i><span>Copied</span>';
      setTimeout(function () { copyBtn.classList.remove('is-done'); copyBtn.innerHTML = '<i class="far fa-copy"></i><span>Copy</span>'; }, 1600);
    };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, fallback); } else { fallback(); }
    // Fallback for non-secure contexts (e.g. plain http previews)
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
  });
})();
