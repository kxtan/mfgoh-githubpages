(function () {
    var NS = 'http://www.w3.org/2000/svg';
    var root = document.documentElement;
    var O = { x: 110, y: 248 };

    // ---- Build fronds ----
    var angles = [-66, -46, -26, -8, 8, 26, 46, 66];
    var order = [3, 4, 2, 5, 1, 6, 0, 7]; // grow from the middle outwards
    var fern = document.getElementById('fern');
    var fronds = [];
    function el(tag, attrs, parent) {
        var e = document.createElementNS(NS, tag);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(e);
        return e;
    }
    angles.forEach(function (deg) {
        var a = deg * Math.PI / 180, s = Math.sin(a), c = Math.cos(a);
        var L = 150 - Math.abs(deg) * 0.55;
        var P1 = { x: O.x + s * L * 0.55, y: O.y - c * L * 0.6 };
        var P2 = { x: O.x + s * L * 1.05, y: O.y - c * L * 0.8 + Math.abs(s) * L * 0.25 };
        var g = el('g', { 'class': 'frond' }, fern);
        el('path', { 'class': 'stem', pathLength: 1, d: 'M' + O.x + ' ' + O.y + ' Q' + P1.x + ' ' + P1.y + ' ' + P2.x + ' ' + P2.y }, g);
        var N = 13;
        for (var k = 1; k <= N; k++) {
            var t = 0.1 + 0.88 * k / N, u = 1 - t;
            var bx = u * u * O.x + 2 * u * t * P1.x + t * t * P2.x;
            var by = u * u * O.y + 2 * u * t * P1.y + t * t * P2.y;
            var tx = 2 * u * (P1.x - O.x) + 2 * t * (P2.x - P1.x);
            var ty = 2 * u * (P1.y - O.y) + 2 * t * (P2.y - P1.y);
            var tl = Math.hypot(tx, ty); tx /= tl; ty /= tl;
            var size = 15 * (1 - t * 0.8) + 2.5;
            [-1, 1].forEach(function (side) {
                var nx = -ty * side + tx * 0.55, ny = tx * side + ty * 0.55;
                var rot = Math.atan2(ny, nx) * 180 / Math.PI;
                var lg = el('g', { transform: 'translate(' + bx.toFixed(1) + ' ' + by.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')' }, g);
                var leaf = el('ellipse', { 'class': 'leaflet' + (side > 0 ? ' alt' : ''), cx: (size * 0.55).toFixed(1), cy: 0, rx: (size * 0.58).toFixed(1), ry: (size * 0.24).toFixed(1) }, lg);
                leaf.style.transformOrigin = '0 0';
                leaf.style.transitionDelay = (0.3 + t * 0.85).toFixed(2) + 's';
            });
        }
        // little fiddlehead curl waiting in the soil
        var cx = O.x + s * 16, cy = O.y - c * 10;
        el('path', { 'class': 'curl', d: 'M' + cx + ' ' + (O.y) + ' L' + cx + ' ' + (cy - 4) + ' a4 4 0 1 1 4 4 a2 2 0 1 1 -1 -2' }, g);
        fronds.push(g);
    });

    // ---- Grow one frond per section ----
    var grown = 0;
    var countEl = document.getElementById('frond-count');
    function growNext() {
        if (grown >= order.length) return;
        fronds[order[grown]].classList.add('grown');
        grown++;
        countEl.textContent = grown;
    }
    // Scroll-position check (works even where IntersectionObserver is throttled)
    var secs = Array.prototype.slice.call(document.querySelectorAll('[data-frond]'));
    var seen = new Set();
    function check() {
        var h = window.innerHeight;
        secs.forEach(function (s) {
            if (seen.has(s)) return;
            if (s.getBoundingClientRect().top < h * 0.85) {
                seen.add(s);
                s.classList.add('in');
                setTimeout(growNext, 250);
            }
        });
    }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    seen.add(secs[0]);            // the hero always grows the first frond
    setTimeout(growNext, 500);
    setTimeout(check, 300);

    // ---- Night / day: lamp chain or button ----
    var btn = document.getElementById('theme-toggle');
    var meta = document.getElementById('theme-color');
    function label() {
        var dark = root.getAttribute('data-theme') === 'dark';
        btn.textContent = dark ? 'Lamp off' : 'Lamp on';
        btn.setAttribute('aria-label', dark ? 'Switch to day mode' : 'Switch to night mode');
        if (meta) meta.setAttribute('content', dark ? '#18241D' : '#F4EDDD');
    }
    function toggle() {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
        label();
    }
    label();
    btn.addEventListener('click', toggle);
    var lamp = document.getElementById('lamp');
    lamp.addEventListener('click', toggle);

    // ---- Active nav ----
    var links = document.querySelectorAll('.nav-link');
    var targets = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute('href')); });
    function onScroll() {
        var y = window.scrollY + 120, cur = -1;
        targets.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
        links.forEach(function (a, i) {
            a.classList.toggle('active', i === cur);
            if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    document.getElementById('year').textContent = new Date().getFullYear();
})();
