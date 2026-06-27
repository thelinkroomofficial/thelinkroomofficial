// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    initGSAPAnimations();
    initThreeJSGlobe();
    initLogoGlobe();
});

function initGSAPAnimations() {
    // 1. Prepare HTML structure for text reveal
    const lines = document.querySelectorAll('.hero-title .line');
    lines.forEach(line => {
        const text = line.innerHTML;
        line.innerHTML = `<span class="line-text" style="transform: translateY(100%); display: inline-block;">${text}</span>`;
    });

    // 2. Timeline for smooth sequenced cinematic reveal
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.to('.line-text', {
        y: 0,
        duration: 1.6,
        stagger: 0.15,
        delay: 0.4
    })
        .to('.search-container', {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "back.out(1.2)"
        }, "-=1.2")
        .from('.logo', {
            opacity: 0,
            x: -20,
            duration: 1
        }, "-=1.2")
        .from('.nav-title', {
            opacity: 0,
            x: -20,
            duration: 0.8
        }, "-=1")
        .from('.matrix-stream-nav', {
            opacity: 0,
            duration: 1.5
        }, "-=0.9")
        .from('.sidebar-bottom', {
            opacity: 0,
            y: 20,
            duration: 0.8
        }, "-=0.8");
}

function initThreeJSGlobe() {
    const container = document.getElementById('canvas-container');
    // Clear any existing children to prevent duplicates if called multiple times
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030305, 0.04);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Dynamic camera positioning based on screen size
    const updateCameraPosition = () => {
        const width = window.innerWidth;
        if (width < 768) {
            camera.position.x = 0;
            camera.position.z = 24; // Pulled back further to fit orbiting logos
        } else if (width < 1024) {
            camera.position.x = 2.5;
            camera.position.z = 22;
        } else if (width < 1440) {
            camera.position.x = 4;
            camera.position.z = 19;
        } else {
            camera.position.x = 5.5;
            camera.position.z = 17;
        }
    };

    // Set initial position
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for holding the entire globe elements
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Dark Solid Core Sphere
    const sphereGeometry = new THREE.SphereGeometry(6, 64, 64);
    const sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x050508,
        emissive: 0x000000,
        specular: 0x111111,
        shininess: 15,
        transparent: true,
        opacity: 0.95,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globeGroup.add(sphere);

    // 2. Network Grid (Wireframe)
    const wireframeGeometry = new THREE.SphereGeometry(6.05, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        wireframe: true,
        transparent: true,
        opacity: 0.12
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    globeGroup.add(wireframe);

    // 3. Digital Particles (representing base data)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
        const r = 6.15 + Math.random() * 0.4;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);

        posArray[i] = r * Math.sin(phi) * Math.cos(theta);
        posArray[i + 1] = r * Math.sin(phi) * Math.sin(theta);
        posArray[i + 2] = r * Math.cos(phi);

        const shade = 0.4 + Math.random() * 0.6;
        colorsArray[i] = shade;
        colorsArray[i + 1] = shade;
        colorsArray[i + 2] = shade;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    globeGroup.add(particlesMesh);

    // 4. Connecting Arcs
    const linesGroup = new THREE.Group();
    for (let i = 0; i < 35; i++) {
        const r = 6.2;
        const theta1 = 2 * Math.PI * Math.random();
        const phi1 = Math.acos(2 * Math.random() - 1);
        const p1 = new THREE.Vector3(
            r * Math.sin(phi1) * Math.cos(theta1),
            r * Math.sin(phi1) * Math.sin(theta1),
            r * Math.cos(phi1)
        );

        const theta2 = theta1 + (Math.random() - 0.5) * 1.5;
        const phi2 = phi1 + (Math.random() - 0.5) * 1.5;
        const p2 = new THREE.Vector3(
            r * Math.sin(phi2) * Math.cos(theta2),
            r * Math.sin(phi2) * Math.sin(theta2),
            r * Math.cos(phi2)
        );

        const midPoint = p1.clone().add(p2).multiplyScalar(0.5);
        midPoint.normalize().multiplyScalar(r + 0.5 + Math.random() * 0.8);

        const curve = new THREE.QuadraticBezierCurve3(p1, midPoint, p2);
        const points = curve.getPoints(24);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: Math.random() * 0.2 + 0.05
        });
        const line = new THREE.Line(lineGeo, lineMat);
        linesGroup.add(line);
    }
    globeGroup.add(linesGroup);

    // 5. ORBITING LOGOS (New Requirement)
    const logos = [

    ];

    const orbits = [];
    const logosGroup = new THREE.Group();
    // Add logosGroup directly to scene, independent of globeGroup rotation 
    // so they can orbit predictably around the central globe.
    scene.add(logosGroup);

    function createLogoSprite(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Futuristic text styling
        ctx.shadowColor = 'rgba(224, 229, 255, 0.8)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 42px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Double draw for intense glow without clutter
        ctx.fillText(text, 256, 64);
        ctx.fillText(text, 256, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9,
            depthWrite: false // Keeps transparency blending clean
        });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2.8, 0.7, 1); // Maintain aspect ratio
        return sprite;
    }

    logos.forEach((name) => {
        const sprite = createLogoSprite(name);
        const pivot = new THREE.Group();

        // Randomize orbit distance (outside the globe radius of 6)
        const distance = 8 + Math.random() * 4.5;
        sprite.position.set(distance, 0, 0);

        // Randomize initial tilt and orientation to create a shell of orbits
        pivot.rotation.x = Math.random() * Math.PI * 2;
        pivot.rotation.y = Math.random() * Math.PI * 2;
        pivot.rotation.z = Math.random() * Math.PI * 2;

        // Randomize orbit speed and direction
        const speed = (0.0015 + Math.random() * 0.002) * (Math.random() > 0.5 ? 1 : -1);

        pivot.add(sprite);
        logosGroup.add(pivot);
        orbits.push({ pivot, speed });
    });

    // 6. Cinematic Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 1.2, 100);
    pointLight1.position.set(15, 15, 15);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x777777, 0.8, 100);
    pointLight2.position.set(-15, -15, -10);
    scene.add(pointLight2);

    // 7. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Slow globe rotation
        globeGroup.rotation.y += 0.001;
        globeGroup.rotation.x += 0.0002;

        // Automatic floating movement for the globe
        globeGroup.position.y = Math.sin(elapsedTime * 0.3) * 0.25;
        globeGroup.position.x = Math.cos(elapsedTime * 0.2) * 0.15;
        globeGroup.rotation.z = Math.sin(elapsedTime * 0.2) * 0.03;

        // Floating movement for the logos group to follow the globe's gentle bobbing
        logosGroup.position.y = globeGroup.position.y;
        logosGroup.position.x = globeGroup.position.x;
        logosGroup.rotation.z = globeGroup.rotation.z;

        // Animate individual orbits
        orbits.forEach(orbit => {
            orbit.pivot.rotation.y += orbit.speed;
        });

        renderer.render(scene, camera);
    };
    animate();

    // 8. Handle Window Resize
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        camera.aspect = width / height;
        updateCameraPosition();
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    });
}

function initLogoGlobe() {
    const container = document.getElementById('logo-canvas-container');
    if (!container) return;

    const width = 45;
    const height = 45;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(2, 64, 64);

    const material = new THREE.MeshBasicMaterial({
        color: 0xe0e5ff,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 35;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 4;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.04,
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    const animate = () => {
        requestAnimationFrame(animate);
        globe.rotation.y += 0.002;
        globe.rotation.x += 0.0005;
        particles.rotation.y -= 0.001;
        renderer.render(scene, camera);
    };
    animate();
}

// --- DYNAMIC SEARCH LOGIC VIA JSON FETCH ---
const searchInput = document.querySelector(".search-input");
const suggestionsBox = document.querySelector(".search-suggestions");

let websites = []; // Khali array jo JSON se bhar jayega

// JSON file ko safely load karne ka function
async function loadWebsites() {
    try {
        const response = await fetch('js/website.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        websites = await response.json();
        console.log("The Link Room Database Loaded Successfully: ", websites.length + " items.");
    } catch (error) {
        console.error("Database fetch failed. Using fallback.", error);
        // Fallback agar koi emergency issue ho fetch mein
        websites = [{ name: "Google", work: "Search Engine", url: "https://google.com" }];
    }
}

// Data load function ko execute karenge
loadWebsites();

// Dynamic Filter and Search Input Event
searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase().trim();
    suggestionsBox.innerHTML = "";

    if (!value) {
        suggestionsBox.style.display = "none";
        return;
    }

    // Filter websites logic (Fixed)
   const results = websites
    .filter(site =>
        site.name.toLowerCase().includes(value)
    )
    .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(value);
        const bStarts = b.name.toLowerCase().startsWith(value);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        return a.name.length - b.name.length;
    })
    .slice(0, 10);


    results.forEach(site => {
    const item = document.createElement("div");

    item.textContent = site.name;

    item.addEventListener("click", () => {
        window.open(site.url, "_blank");
    });

    suggestionsBox.appendChild(item);
});

// Agar result nahi mila
if (results.length === 0) {

    const item = document.createElement("div");

    item.textContent = value.charAt(0).toUpperCase() + value.slice(1);

    item.addEventListener("click", () => {
        window.open(
            `https://www.google.com/search?q=${encodeURIComponent(value)}`,
            "_blank"
        );
    });

    suggestionsBox.appendChild(item);
}

suggestionsBox.style.display = "block";

});

document.addEventListener("DOMContentLoaded", () => {

    const aboutBtn = document.getElementById("aboutBtn");
    const contactBtn = document.getElementById("contactBtn");
    const privacyBtn = document.getElementById("privacyBtn");
    const topSitesBtn = document.getElementById("topSitesBtn");

    const popup = document.getElementById("infoPopup");
    const popupTitle = document.getElementById("popupTitle");
    const popupContent = document.getElementById("popupContent");

    const closePopup = document.getElementById("closePopup");

    // About
    aboutBtn.addEventListener("click", (e) => {
        e.preventDefault();

        popup.style.display = "block";

        popupTitle.textContent = "About The Link Room";

        popupContent.textContent =
            "The Link Room is a modern website discovery platform that helps users quickly find websites through a clean and futuristic search experience.";
    });

    // Contact
    contactBtn.addEventListener("click", (e) => {
        e.preventDefault();

        popup.style.display = "block";

        popupTitle.textContent = "Contact";

        popupContent.innerHTML =
            "Email: thelinkroomofficial@gmail.com";

    });

    // Privacy Policy
    privacyBtn.addEventListener("click", (e) => {
        e.preventDefault();

        popup.style.display = "block";

        popupTitle.textContent = "Privacy Policy";

        popupContent.innerHTML = `
            The Link Room respects your privacy.<br><br>

            • We do not collect personal information.<br>
            • We do not require user registration.<br>
            • We do not store personal data.<br>
            • External websites belong to their respective owners.<br>
            • We may use analytics and cookies to improve user experience.
        `;
    });

    // Top Websites
    // Top Websites

topSitesBtn.addEventListener("click", (e) => {
    e.preventDefault();

    popup.style.display = "block";

    popupTitle.textContent = "Top Websites";

    popupContent.innerHTML = `
        <a href="https://google.com" target="_blank">Google</a><br><br>

        <a href="https://youtube.com" target="_blank">YouTube</a><br><br>

        <a href="https://chatgpt.com" target="_blank">ChatGPT</a><br><br>

        <a href="https://github.com" target="_blank">GitHub</a><br><br>

        <a href="https://instagram.com" target="_blank">Instagram</a>

        <hr style="margin:15px 0; opacity:.2;">

    <p style="font-size:12px; opacity:.8;">
    📢 Want your website featured here?<br>
    Apni website ko yahan feature karwana chahte hain?<br>
    Contact us at <b>thelinkroomofficial@gmail.com</b>
    </p>

    `;
});

    // Close Popup
    closePopup.addEventListener("click", () => {
        popup.style.display = "none";
    });

});


