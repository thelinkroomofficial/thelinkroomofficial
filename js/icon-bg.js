document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('icon-bg-container');
    if (!container) return;

    // --- 1. AMBIENT DUST & PARTICLE EFFECTS (CANVAS) ---
    const canvas = document.createElement('canvas');
    canvas.id = 'ambient-canvas';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width, height;
    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const particles = [];
    const numParticles = 35; // Sparse, clean atmosphere
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.05,
            vy: (Math.random() * -0.1) - 0.05,
            radius: Math.random() * 1.2 + 0.3,
            opacity: Math.random() * 0.12 + 0.03
        });
    }

    const dissolveParticles = [];

    function createDissolveEffect(x, y, brandData) {
        const numBurst = 8 + Math.floor(Math.random() * 5); // 8 to 12 elegant particles
        for (let i = 0; i < numBurst; i++) {
            let colors = brandData.burstColors;
            let color = colors[Math.floor(Math.random() * colors.length)];

            // Subtle digital burst trajectory
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 1.0 + 0.5; // Very slow and gentle

            dissolveParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0, // Opacity starting at 1.0
                decay: Math.random() * 0.025 + 0.02, // Decays over ~40-50 frames (< 1 sec)
                color: color,
                radius: Math.random() * 1.5 + 0.8 // Tiny
            });
        }
    }

    function drawCanvas() {
        ctx.clearRect(0, 0, width, height);

        // Draw ambient dust
        for (let i = 0; i < numParticles; i++) {
            let p = particles[i];

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 255, 255, ' + p.opacity + ')';
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw dissolve burst particles
        for (let i = dissolveParticles.length - 1; i >= 0; i--) {
            let dp = dissolveParticles[i];

            dp.x += dp.vx;
            dp.y += dp.vy;

            // Digital drag/friction for a premium floaty feel
            dp.vx *= 0.94;
            dp.vy *= 0.94;

            dp.life -= dp.decay;

            if (dp.life <= 0) {
                dissolveParticles.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            ctx.globalAlpha = dp.life;
            ctx.fillStyle = dp.color;
            ctx.arc(dp.x, dp.y, dp.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }

    // --- 2. PREMIUM MINIMALIST ICONS & 3D LAYERS ---
    const brandMap = {
        'google': { class: 'fa-brands fa-google', color: '', burstColors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853'] },
        'youtube': { class: 'fa-brands fa-youtube', color: '#FF0000', burstColors: ['#FF0000', '#ffffff'] },
        'github': { class: 'fa-brands fa-github', color: '#ffffff', burstColors: ['#ffffff', '#cccccc'] },
        'robot': { class: 'fa-solid fa-robot', color: '#10A37F', burstColors: ['#10A37F', '#ffffff'] },
        'linkedin': { class: 'fa-brands fa-linkedin', color: '#0A66C2', burstColors: ['#0A66C2', '#ffffff'] },
        'reddit': { class: 'fa-brands fa-reddit', color: '#FF4500', burstColors: ['#FF4500', '#ffffff'] },
        'discord': { class: 'fa-brands fa-discord', color: '#5865F2', burstColors: ['#5865F2', '#ffffff'] },
        'spotify': { class: 'fa-brands fa-spotify', color: '#1DB954', burstColors: ['#1DB954'] },
        'figma': { class: 'fa-brands fa-figma', color: '#F24E1E', burstColors: ['#F24E1E', '#A259FF', '#1ABCFE', '#0ACF83'] },
        'x-twitter': { class: 'fa-brands fa-x-twitter', color: '#ffffff', burstColors: ['#ffffff', '#888888'] },
        'apple': { class: 'fa-brands fa-apple', color: '#A2AAAD', burstColors: ['#A2AAAD', '#ffffff'] },
        'microsoft': { class: 'fa-brands fa-microsoft', color: '#00A4EF', burstColors: ['#F25022', '#7FBA00', '#00A4EF', '#FFB900'] },
        'react': { class: 'fa-brands fa-react', color: '#61DAFB', burstColors: ['#61DAFB', '#ffffff'] },
        'amazon': { class: 'fa-brands fa-amazon', color: '#FF9900', burstColors: ['#FF9900'] }
    };

    const brandKeys = Object.keys(brandMap);
    const numIcons = 20;
    const iconObjects = [];

    let safeZoneRadius = Math.min(window.innerWidth, window.innerHeight) * 0.45;

    window.addEventListener('resize', () => {
        safeZoneRadius = Math.min(window.innerWidth, window.innerHeight) * 0.45;
    });

    for (let i = 0; i < numIcons; i++) {
        const brandKey = brandKeys[i % brandKeys.length];
        const brandData = brandMap[brandKey];
        const el = document.createElement('i');
        el.className = brandData.class + ' bg-icon';
        if (brandData.color) el.style.color = brandData.color;

        let layer, scale, opacity, speedFactor, parallaxFactor, blurAmount;
        const layerRoll = Math.random();

        if (layerRoll < 0.4) {
            // Background Layer
            layer = 1;
            scale = Math.random() * 0.2 + 0.3;
            opacity = Math.random() * 0.1 + 0.1;
            speedFactor = 0.2;
            parallaxFactor = 0.02; // Moves less
            blurAmount = 3.5;
        } else if (layerRoll < 0.8) {
            // Middle Layer
            layer = 2;
            scale = Math.random() * 0.2 + 0.5;
            opacity = Math.random() * 0.15 + 0.25;
            speedFactor = 0.5;
            parallaxFactor = 0.05; // Moves moderately
            blurAmount = 1.2;
        } else {
            // Front Layer
            layer = 3;
            scale = Math.random() * 0.2 + 0.8;
            opacity = Math.random() * 0.2 + 0.5;
            speedFactor = 0.8;
            parallaxFactor = 0.12; // Moves more
            blurAmount = 0;
            el.style.filter = 'drop-shadow(0 15px 30px rgba(0,0,0,0.5))';
        }

        if (blurAmount > 0) {
            el.style.filter = 'blur(' + blurAmount + 'px)';
        }

        el.style.fontSize = '40px';
        el.style.opacity = opacity.toFixed(2);
        el.style.zIndex = layer;

        container.appendChild(el);

        // Initial Placement
        let startX, startY;
        const centerX = window.innerWidth / 2;
        const centerY = (window.innerHeight / 2) - 40;

        do {
            startX = Math.random() * window.innerWidth;
            startY = Math.random() * window.innerHeight;
        } while (Math.sqrt((startX - centerX) ** 2 + (startY - centerY) ** 2) < safeZoneRadius);

        iconObjects.push({
            el: el,
            brandData: brandData,
            isActive: true,
            hasCheckedBoundary: false,
            x: startX,
            y: startY,
            vx: (Math.random() - 0.5) * 0.15 * speedFactor,
            vy: (Math.random() - 0.5) * 0.15 * speedFactor,
            scale: scale,
            baseScale: scale,
            targetOpacity: opacity.toFixed(2),
            parallaxFactor: parallaxFactor,
            layer: layer,
            floatPhase: Math.random() * Math.PI * 2,
            floatSpeed: 0.001 + Math.random() * 0.001,
            scalePhase: Math.random() * Math.PI * 2,
            repulseCurrentX: 0,
            repulseCurrentY: 0
        });
    }

    function respawnIcon(obj) {
        let startX, startY;
        const centerX = window.innerWidth / 2;
        const centerY = (window.innerHeight / 2) - 40;

        do {
            startX = Math.random() * (window.innerWidth - 100) + 50;
            startY = Math.random() * (window.innerHeight - 100) + 50;
        } while (Math.sqrt((startX - centerX) ** 2 + (startY - centerY) ** 2) < safeZoneRadius);

        obj.x = startX;
        obj.y = startY;
        obj.hasCheckedBoundary = false;

        obj.vx = (Math.random() - 0.5) * 0.15 * (obj.layer === 3 ? 0.8 : obj.layer === 2 ? 0.5 : 0.2);
        obj.vy = (Math.random() - 0.5) * 0.15 * (obj.layer === 3 ? 0.8 : obj.layer === 2 ? 0.5 : 0.2);
        obj.repulseCurrentX = 0;
        obj.repulseCurrentY = 0;

        obj.el.style.transition = 'opacity 1.5s ease';
        obj.el.style.opacity = obj.targetOpacity;

        setTimeout(() => {
            obj.isActive = true;
            obj.el.style.transition = '';
        }, 1500);
    }

    // --- 3. PREMIUM ELEGANT PARALLAX & MOUSE REPULSION ---
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    // Raw pixel coordinates for repulsion
    let rawMouseX = -1000;
    let rawMouseY = -1000;

    window.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
        rawMouseX = e.clientX;
        rawMouseY = e.clientY;
    });

    // Mobile touch support for repulsion and parallax
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            let touch = e.touches[0];
            targetMouseX = (touch.clientX / window.innerWidth) * 2 - 1;
            targetMouseY = (touch.clientY / window.innerHeight) * 2 - 1;
            rawMouseX = touch.clientX;
            rawMouseY = touch.clientY;
        }
    });

    // --- 4. ANIMATION LOOP ---
    function animate() {
        drawCanvas();

        mouseX += (targetMouseX - mouseX) * 0.03;
        mouseY += (targetMouseY - mouseY) * 0.03;

        const centerX = window.innerWidth / 2;
        const centerY = (window.innerHeight / 2) - 40;

        for (let i = 0; i < iconObjects.length; i++) {
            let obj = iconObjects[i];

            if (obj.isActive) {
                // Organic Slow Drift
                obj.x += obj.vx;
                obj.y += obj.vy;

                // Safe Zone Repulsion (Globe area)
                let dx = obj.x - centerX;
                let dy = obj.y - centerY;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < safeZoneRadius) {
                    let force = (safeZoneRadius - dist) / safeZoneRadius;
                    obj.x += (dx / dist) * force * 1.0;
                    obj.y += (dy / dist) * force * 1.0;
                }

                // DISSOLVE LOGIC (Touches Boundary)
                const dissolvePad = 15;
                let shouldDissolve = false;

                if (obj.x < dissolvePad || obj.x > window.innerWidth - dissolvePad ||
                    obj.y < dissolvePad || obj.y > window.innerHeight - dissolvePad) {

                    if (!obj.hasCheckedBoundary) {
                        obj.hasCheckedBoundary = true;
                        if (Math.random() < 0.35) {
                            shouldDissolve = true;
                        }
                    }
                } else {
                    obj.hasCheckedBoundary = false;
                }

                if (shouldDissolve) {
                    obj.isActive = false;
                    obj.el.style.transition = 'opacity 0.2s ease';
                    obj.el.style.opacity = '0';

                    createDissolveEffect(obj.x, obj.y, obj.brandData);

                    setTimeout(() => {
                        respawnIcon(obj);
                    }, 2000 + Math.random() * 3000);
                } else {
                    // Silent Wrap 
                    if (obj.x < -60) obj.x = window.innerWidth + 60;
                    if (obj.x > window.innerWidth + 60) obj.x = -60;
                    if (obj.y < -60) obj.y = window.innerHeight + 60;
                    if (obj.y > window.innerHeight + 60) obj.y = -60;
                }
            }

            // Always update mathematics
            obj.floatPhase += obj.floatSpeed;
            let wobbleY = Math.sin(obj.floatPhase) * 8 * obj.layer;

            let px = mouseX * 150 * obj.parallaxFactor * -1;
            let py = mouseY * 150 * obj.parallaxFactor * -1;

            // Z-axis slow scale illusion
            obj.scalePhase += 0.005;
            let currentScale = obj.baseScale + Math.sin(obj.scalePhase) * 0.05 * obj.layer;

            // Visual Center Calculation for Mouse Repulsion
            let vCenterX = obj.x + px;
            let vCenterY = obj.y + py + wobbleY;

            let mdx = vCenterX - rawMouseX;
            let mdy = vCenterY - rawMouseY;
            let mDist = Math.sqrt(mdx * mdx + mdy * mdy);

            const mouseRepulsionRadius = 180;
            let repulseTargetX = 0;
            let repulseTargetY = 0;

            if (mDist < mouseRepulsionRadius && mDist > 0) {
                // Quadratic falloff for smooth gentle pushing
                let force = Math.pow((mouseRepulsionRadius - mDist) / mouseRepulsionRadius, 2);
                // Push strength scales by layer (closer layers pushed more)
                let pushStrength = 60 * (obj.layer / 3);
                repulseTargetX = (mdx / mDist) * force * pushStrength;
                repulseTargetY = (mdy / mDist) * force * pushStrength;
            }

            // Elastic easing towards the repulsion target (naturally returns to 0 when mouse leaves)
            obj.repulseCurrentX += (repulseTargetX - obj.repulseCurrentX) * 0.08;
            obj.repulseCurrentY += (repulseTargetY - obj.repulseCurrentY) * 0.08;

            obj.el.style.transform = "translate3d(" + (vCenterX - 20 + obj.repulseCurrentX) + "px, " + (vCenterY - 20 + obj.repulseCurrentY) + "px, 0) scale(" + currentScale + ")";
        }

        requestAnimationFrame(animate);
    }

    animate();
});