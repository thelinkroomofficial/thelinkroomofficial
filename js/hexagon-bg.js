/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║          HEXAGON NETWORK BACKGROUND                     ║
 * ║  Futuristic transparent hex-grid backdrop for           ║
 * ║  The Link Room.  Pure Canvas 2D — no Three.js needed.   ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Integration (2 steps):
 *   1. Add  <link rel="stylesheet" href="css/hexagon-bg.css">     in <head>
 *   2. Add  <script src="js/hexagon-bg.js"></script>              BEFORE main.js
 *
 * The script auto-injects a <canvas> before #canvas-container,
 * so it renders BEHIND the 3D globe.  Zero changes to globe code.
 */

(function () {
    'use strict';

    // ── Tunables ───────────────────────────────────────────────
    const CFG = {
        /* ── Population ── */
        count         : 48,          // total hexagons on screen

        /* ── Size (radius in CSS px) ── */
        sizeMin       : 18,
        sizeMax       : 85,

        /* ── Opacity band (5 %–10 %) ── */
        opacityMin    : 0.04,
        opacityMax    : 0.09,

        /* ── Drift (px / frame at 60 fps) ── */
        driftMax      : 0.12,

        /* ── Rotation (rad / frame) ── */
        spinMax       : 0.00035,

        /* ── Pulse (gentle brightness throb) ── */
        pulseAmp      : 0.015,
        pulseSpeedMin : 0.003,
        pulseSpeedMax : 0.012,

        /* ── Glow layers (multi-stroke, no shadowBlur) ── */
        glowPasses    : [
            { widthAdd: 6,  alphaScale: 0.18 },   // outermost halo
            { widthAdd: 3,  alphaScale: 0.35 },   // mid glow
            { widthAdd: 0,  alphaScale: 1.0  },   // crisp core
        ],
        baseLine      : 0.7,

        /* ── Palette: white / soft-blue family ── */
        palette : [
            { r: 255, g: 255, b: 255 },   // pure white
            { r: 190, g: 210, b: 255 },   // ice blue
            { r: 160, g: 185, b: 255 },   // soft periwinkle
            { r: 210, g: 220, b: 255 },   // pale lavender
            { r: 140, g: 175, b: 255 },   // deeper sky blue
        ],

        /* ── Performance ── */
        maxDPR : 1.5,                 // cap hi-DPI to save fill-rate
    };


    // ── State ──────────────────────────────────────────────────
    let canvas, ctx;
    let hexes  = [];
    let W = 0, H = 0, dpr = 1;


    // ── Bootstrap ──────────────────────────────────────────────
    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'hexagon-bg';

        // Inline fallback styles (CSS file is authoritative)
        Object.assign(canvas.style, {
            position      : 'fixed',
            top           : '0',
            left          : '0',
            width         : '100vw',
            height        : '100vh',
            zIndex        : '0',
            pointerEvents : 'none',
        });

        // Insert BEFORE the globe container → paints behind it
        var anchor = document.getElementById('canvas-container');
        if (anchor) {
            anchor.parentNode.insertBefore(canvas, anchor);
        } else {
            // Fallback: prepend to body
            document.body.prepend(canvas);
        }

        ctx = canvas.getContext('2d');

        resize();
        populate();
        tick();

        window.addEventListener('resize', resize);
    }


    // ── Resize ─────────────────────────────────────────────────
    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, CFG.maxDPR);
        W   = window.innerWidth;
        H   = window.innerHeight;

        canvas.width  = (W * dpr) | 0;
        canvas.height = (H * dpr) | 0;
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
    }


    // ── Create hex population ──────────────────────────────────
    function populate() {
        hexes = [];
        for (var i = 0; i < CFG.count; i++) {
            var rad = lerp(CFG.sizeMin, CFG.sizeMax, Math.random());
            hexes.push({
                x   : Math.random() * W,
                y   : Math.random() * H,
                r   : rad,
                rot : Math.random() * Math.PI * 2,
                opa : lerp(CFG.opacityMin, CFG.opacityMax, Math.random()),

                // Velocity
                vx  : (Math.random() - 0.5) * CFG.driftMax,
                vy  : (Math.random() - 0.5) * CFG.driftMax * 0.7,
                vr  : (Math.random() - 0.5) * CFG.spinMax,

                // Colour
                col : CFG.palette[(Math.random() * CFG.palette.length) | 0],

                // Pulse
                pp  : Math.random() * Math.PI * 2,
                ps  : lerp(CFG.pulseSpeedMin, CFG.pulseSpeedMax, Math.random()),
            });
        }
    }


    // ── Draw one hexagon path (flat-top) ───────────────────────
    function hexPath(x, y, r, rot) {
        ctx.beginPath();
        for (var i = 0; i < 6; i++) {
            var a  = rot + (Math.PI / 3) * i - Math.PI / 6;
            var px = x + r * Math.cos(a);
            var py = y + r * Math.sin(a);
            if (i === 0) ctx.moveTo(px, py);
            else         ctx.lineTo(px, py);
        }
        ctx.closePath();
    }


    // ── Main render loop ───────────────────────────────────────
    function tick() {
        // Reset transform & clear
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply DPR scale once
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        for (var i = 0; i < hexes.length; i++) {
            var h = hexes[i];

            // ── Physics update ──
            h.x   += h.vx;
            h.y   += h.vy;
            h.rot += h.vr;
            h.pp  += h.ps;

            // Wrap edges with generous buffer
            var buf = h.r + 30;
            if (h.x < -buf)     h.x += W + buf * 2;
            if (h.x > W + buf)  h.x -= W + buf * 2;
            if (h.y < -buf)     h.y += H + buf * 2;
            if (h.y > H + buf)  h.y -= H + buf * 2;

            // Current pulsed opacity
            var alpha = clamp(
                h.opa + Math.sin(h.pp) * CFG.pulseAmp,
                0.02,
                0.12
            );

            var cr = h.col.r;
            var cg = h.col.g;
            var cb = h.col.b;

            // ── Multi-pass glow rendering (no expensive shadowBlur) ──
            for (var g = 0; g < CFG.glowPasses.length; g++) {
                var pass = CFG.glowPasses[g];
                var a    = alpha * pass.alphaScale;

                ctx.strokeStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + a.toFixed(4) + ')';
                ctx.lineWidth   = CFG.baseLine + pass.widthAdd;

                hexPath(h.x, h.y, h.r, h.rot);
                ctx.stroke();
            }
        }

        requestAnimationFrame(tick);
    }


    // ── Helpers ────────────────────────────────────────────────
    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }


    // ── Entry point ────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
