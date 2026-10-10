/**
 * Gulshan Kumar | 3D Modern Dark Portfolio
 * Three.js WebGL Engine, 3D Physics, Sound Synthesis & Interactive UI
 */

// ==========================================
// 1. Audio FX Synthesizer (Web Audio API)
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initAudio();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      this.enabled = false;
    }
  }

  ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBlip(freq = 880, duration = 0.05, type = 'sine') {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (err) {}
  }

  playClick() {
    this.playBlip(1200, 0.04, 'triangle');
  }

  playCyberSuccess() {
    if (!this.enabled || !this.ctx) return;
    this.ensureContext();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.4);
    } catch (err) {}
  }
}

const sfx = new SoundFX();

// ==========================================
// 2. Three.js 3D WebGL Background Scene
// ==========================================
let scene, camera, renderer, particles, geomMesh;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

function initThreeJS() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene & Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 800;

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 1. Particle Constellation
  const particleCount = 750;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const themeColors = {
    emerald: new THREE.Color('#00f5a0'),
    violet: new THREE.Color('#b066fe'),
    cyan: new THREE.Color('#00e5ff'),
    amber: new THREE.Color('#ffb703')
  };

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'emerald';
  const baseColor = themeColors[currentTheme] || themeColors.emerald;

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 1600;
    positions[i + 1] = (Math.random() - 0.5) * 1600;
    positions[i + 2] = (Math.random() - 0.5) * 1400;

    // Gradient between accent and white/cyan
    colors[i] = baseColor.r * (0.6 + Math.random() * 0.4);
    colors[i + 1] = baseColor.g * (0.6 + Math.random() * 0.4);
    colors[i + 2] = baseColor.b * (0.6 + Math.random() * 0.4);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Particle Material
  const material = new THREE.PointsMaterial({
    size: 3.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // 2. Central 3D Wireframe Polyhedron
  const polyGeometry = new THREE.IcosahedronGeometry(220, 2);
  const polyMaterial = new THREE.MeshBasicMaterial({
    color: baseColor.getHex(),
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });

  geomMesh = new THREE.Mesh(polyGeometry, polyMaterial);
  geomMesh.position.set(250, 0, -200);
  scene.add(geomMesh);

  // Event Listeners
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);

  animateThreeJS();
}

function updateThreeThemeColor(themeName) {
  if (!particles || !geomMesh) return;
  const colorMap = {
    emerald: new THREE.Color('#00f5a0'),
    violet: new THREE.Color('#b066fe'),
    cyan: new THREE.Color('#00e5ff'),
    amber: new THREE.Color('#ffb703')
  };
  const newColor = colorMap[themeName] || colorMap.emerald;

  // Update mesh color
  geomMesh.material.color.set(newColor);

  // Update particle colors
  const colors = particles.geometry.attributes.color.array;
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = newColor.r * (0.6 + Math.random() * 0.4);
    colors[i + 1] = newColor.g * (0.6 + Math.random() * 0.4);
    colors[i + 2] = newColor.b * (0.6 + Math.random() * 0.4);
  }
  particles.geometry.attributes.color.needsUpdate = true;
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) * 0.4;
  mouseY = (event.clientY - windowHalfY) * 0.4;
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animateThreeJS() {
  requestAnimationFrame(animateThreeJS);

  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;

  if (camera) {
    camera.position.x = targetX * 0.3;
    camera.position.y = -targetY * 0.3;
    camera.lookAt(scene.position);
  }

  if (particles) {
    particles.rotation.y += 0.001;
    particles.rotation.x += 0.0005;
  }

  if (geomMesh) {
    geomMesh.rotation.x += 0.002;
    geomMesh.rotation.y += 0.003;
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// ==========================================
// 3. Custom Futuristic Cursor
// ==========================================
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(renderRing);
  }
  renderRing();

  // Hover expansion on interactive items
  const interactives = document.querySelectorAll('a, button, input, textarea, .skill-card-3d, .project-card-3d, .holo-card');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('active');
      sfx.playClick();
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('active');
    });
  });
}

// ==========================================
// 4. Dynamic 3D Card Tilt Physics
// ==========================================
function init3DTilt() {
  const tiltElements = document.querySelectorAll('[data-tilt], #holo-card-container');

  tiltElements.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      card.style.transition = 'transform 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
}

// ==========================================
// 5. Dynamic Role Typewriter Effect
// ==========================================
function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const roles = [
    "Frontend Architecture",
    "Modern React.js Interfaces",
    "3D Web Experiences",
    "High-Performance Clean UI",
    "Responsive Web Design"
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function type() {
    const current = roles[roleIdx];

    if (isDeleting) {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      typeSpeed = 40;
    } else {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      typeSpeed = 90;
    }

    if (!isDeleting && charIdx === current.length) {
      typeSpeed = 1800;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typeSpeed = 400;
    }

    setTimeout(type, typeSpeed);
  }

  type();
}

// ==========================================
// 6. Theme Accent Switcher & Sound Toggle
// ==========================================
function initThemeAndControls() {
  const themeDots = document.querySelectorAll('.color-dot');
  const soundBtn = document.getElementById('sound-toggle');

  // Load saved theme
  const savedTheme = localStorage.getItem('gk_portfolio_theme') || 'emerald';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeDots.forEach(dot => {
    if (dot.getAttribute('data-color') === savedTheme) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.getAttribute('data-color');
      document.documentElement.setAttribute('data-theme', color);
      localStorage.setItem('gk_portfolio_theme', color);

      themeDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');

      updateThreeThemeColor(color);
      sfx.playCyberSuccess();
      showToast(`Switched accent to ${color.toUpperCase()}`);
    });
  });

  // Sound Toggle
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      sfx.enabled = !sfx.enabled;
      soundBtn.classList.toggle('active', sfx.enabled);
      soundBtn.innerHTML = sfx.enabled 
        ? '<i class="fa-solid fa-volume-high"></i>' 
        : '<i class="fa-solid fa-volume-xmark"></i>';
      showToast(sfx.enabled ? "Futuristic Audio FX Enabled" : "Audio FX Muted");
    });
  }
}

// ==========================================
// 7. Interactive Developer CLI Terminal
// ==========================================
function initTerminal() {
  const cliForm = document.getElementById('cli-form');
  const cliInput = document.getElementById('cli-command-input');
  const cliHistory = document.getElementById('cli-history');
  const cliScreen = document.getElementById('cli-screen');

  if (!cliForm || !cliInput) return;

  const commands = {
    help: `Available commands:
  • <span style="color:var(--accent);">about</span>     - Bio & overview of Gulshan Kumar
  • <span style="color:var(--accent);">skills</span>    - List of core frontend competencies
  • <span style="color:var(--accent);">projects</span>  - Featured portfolio projects
  • <span style="color:var(--accent);">contact</span>   - Direct WhatsApp, email & location
  • <span style="color:var(--accent);">whoami</span>    - Current user session details
  • <span style="color:var(--accent);">theme</span>     - Change theme (emerald, violet, cyan, amber)
  • <span style="color:var(--accent);">clear</span>     - Clear terminal history`,

    whoami: `<span style="color:#38bdf8;">visitor@client-browser</span> - Authenticated to Gulshan Kumar's 3D Portfolio. Welcome!`,

    about: `<span style="color:var(--accent); font-weight:700;">Gulshan Kumar:</span> Frontend Developer based in Bettiah, Bihar. Passionate about 3D Web, React.js, modern CSS, and building responsive, ultra-clean web applications.`,

    skills: `Current Tech Stack:
  [✔] HTML5 Semantic Web & Accessibility
  [✔] CSS3 / 3D Transforms / Keyframes
  [✔] JavaScript (ES6+ / Async APIs / DOM)
  [✔] React.js & Modern UI Architecture
  [✔] Tailwind CSS & Bootstrap
  [✔] Three.js WebGL & 3D Shaders
  [✔] Git, GitHub & Responsive Dev`,

    projects: `Featured Projects:
  1. <span style="color:var(--accent);">3D Dark Portfolio</span> - Three.js WebGL, 3D tilt, Custom sound synth
  2. <span style="color:var(--accent);">WeatherSphere</span> - React & OpenWeather live dynamic forecast
  3. <span style="color:var(--accent);">CyberStore</span> - Modern dark ecommerce catalog & interactive cart`,

    contact: `Direct Contact Channels:
  • <span style="color:var(--accent);">WhatsApp:</span> +91 9117437173 (wa.me/919117437173)
  • <span style="color:var(--accent);">Email:</span> gulshankumar800@gmail.com
  • <span style="color:var(--accent);">GitHub:</span> github.com/gulshankumar800
  • <span style="color:var(--accent);">Location:</span> Bettiah, Bihar, India`
  };

  cliForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawVal = cliInput.value.trim();
    if (!rawVal) return;

    const cmd = rawVal.toLowerCase();
    sfx.playClick();

    // Create entry
    const entry = document.createElement('div');
    entry.style.marginTop = '8px';
    entry.innerHTML = `<span style="color:var(--accent);">visitor@gulshan-web:~$</span> ${escapeHTML(rawVal)}`;

    const response = document.createElement('div');
    response.style.marginLeft = '12px';
    response.style.marginTop = '4px';
    response.style.color = '#cbd5e1';

    if (cmd === 'clear') {
      cliHistory.innerHTML = '';
      cliInput.value = '';
      return;
    } else if (cmd.startsWith('theme ')) {
      const chosen = cmd.replace('theme ', '').trim();
      if (['emerald', 'violet', 'cyan', 'amber'].includes(chosen)) {
        document.documentElement.setAttribute('data-theme', chosen);
        updateThreeThemeColor(chosen);
        response.innerHTML = `<span style="color:var(--accent);">✔ Theme switched to ${chosen.toUpperCase()}!</span>`;
      } else {
        response.innerHTML = `<span style="color:#ef4444;">Invalid theme. Choose: emerald, violet, cyan, amber</span>`;
      }
    } else if (commands[cmd]) {
      response.innerHTML = commands[cmd];
    } else if (cmd === 'sudo') {
      response.innerHTML = `<span style="color:#ef4444;">Permission denied: You do not need sudo to explore this portfolio! 😊</span>`;
    } else {
      response.innerHTML = `Command not recognized: '<span style="color:#f87171;">${escapeHTML(rawVal)}</span>'. Type '<span style="color:var(--accent);">help</span>' for valid commands.`;
    }

    cliHistory.appendChild(entry);
    cliHistory.appendChild(response);
    cliInput.value = '';

    cliScreen.scrollTop = cliScreen.scrollHeight;
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

// ==========================================
// 8. Interactive Project Modals
// ==========================================
window.openProjectModal = function(type) {
  const modal = document.getElementById('project-modal');
  const body = document.getElementById('modal-body');
  if (!modal || !body) return;

  sfx.playCyberSuccess();

  if (type === 'weather') {
    body.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
        <i class="fa-solid fa-cloud-sun-rain" style="font-size:2rem; color:var(--accent);"></i>
        <div>
          <h3 style="font-family:var(--font-heading); font-size:1.6rem; color:#fff;">WeatherSphere Dashboard</h3>
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--accent);">React.js · Tailwind CSS · Live API</span>
        </div>
      </div>
      <p style="color:var(--text-muted); line-height:1.7; margin-bottom:20px;">
        An interactive weather forecast intelligence dashboard designed by Gulshan Kumar. It retrieves accurate live meteorological data with 5-day predictive forecasts, humidity metrics, wind velocity gauges, and responsive glass cards.
      </p>
      <!-- Interactive Mini Widget -->
      <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-light); border-radius:12px; padding:20px; text-align:center; margin-bottom:25px;">
        <div style="font-size:0.8rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">Sample Live Query: Bettiah, Bihar</div>
        <div style="font-size:3rem; font-weight:800; font-family:var(--font-heading); margin:10px 0; color:#fff;">28°C</div>
        <div style="color:var(--accent); font-family:var(--font-mono); font-size:0.9rem;">🌤 Partly Cloudy · Humidity 62% · Wind 8 km/h</div>
      </div>
      <div style="display:flex; gap:12px; justify-content:flex-end;">
        <a href="https://github.com/gulshankumar800" target="_blank" class="btn-primary" style="padding:10px 20px;">
          <span>Explore on GitHub</span>
          <i class="fa-brands fa-github"></i>
        </a>
      </div>
    `;
  } else if (type === 'ecommerce') {
    body.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
        <i class="fa-solid fa-cart-shopping" style="font-size:2rem; color:var(--accent);"></i>
        <div>
          <h3 style="font-family:var(--font-heading); font-size:1.6rem; color:#fff;">CyberStore UI Marketplace</h3>
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--accent);">ES6+ · Modern Tailwind · State Management</span>
        </div>
      </div>
      <p style="color:var(--text-muted); line-height:1.7; margin-bottom:20px;">
        A high-tech digital hardware & accessories storefront. Features dynamic cart badges, filterable category tabs, modal product quick views, and smooth checkout simulations with dark cyber aesthetics.
      </p>
      <div style="display:flex; gap:12px; justify-content:flex-end;">
        <a href="https://github.com/gulshankumar800" target="_blank" class="btn-primary" style="padding:10px 20px;">
          <span>View Source Code</span>
          <i class="fa-brands fa-github"></i>
        </a>
      </div>
    `;
  }

  modal.classList.add('active');
};

window.closeProjectModal = function() {
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.classList.remove('active');
  }
};

window.addEventListener('click', (e) => {
  const modal = document.getElementById('project-modal');
  if (e.target === modal) {
    closeProjectModal();
  }
});

// ==========================================
// 9. Toast Notification System & Clipboard
// ==========================================
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fa-solid fa-circle-check" style="color:var(--accent); font-size:1.1rem;"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

window.copyToClipboard = function(text, successMsg) {
  navigator.clipboard.writeText(text).then(() => {
    sfx.playCyberSuccess();
    showToast(successMsg || `Copied "${text}" to clipboard!`);
  }).catch(() => {
    showToast(`Could not copy: ${text}`);
  });
};

// ==========================================
// 10. Contact Form & Resume Download
// ==========================================
function initContactAndActions() {
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const subject = document.getElementById('form-subject').value;
      const message = document.getElementById('form-message').value;

      sfx.playCyberSuccess();
      showToast(`Thank you ${name}! Gulshan received your message.`);
      form.reset();

      // Also generate direct WhatsApp fallback link with message
      const waUrl = `https://wa.me/919117437173?text=${encodeURIComponent(`Hi Gulshan, I am ${name} (${email}). Subject: ${subject}\n\n${message}`)}`;
      setTimeout(() => {
        const sendWA = confirm("Would you also like to send this message directly to Gulshan on WhatsApp for an instant response?");
        if (sendWA) {
          window.open(waUrl, '_blank');
        }
      }, 600);
    });
  }

  // Resume Download Button
  const resumeBtn = document.getElementById('resume-download-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      sfx.playCyberSuccess();
      showToast("Preparing Gulshan Kumar's Resume profile summary...");
      
      const modal = document.getElementById('project-modal');
      const body = document.getElementById('modal-body');
      if (modal && body) {
        body.innerHTML = `
          <div style="margin-bottom:20px;">
            <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--accent); text-transform:uppercase;">Curriculum Vitae</span>
            <h3 style="font-family:var(--font-heading); font-size:2rem; color:#fff; margin-top:4px;">Gulshan Kumar</h3>
            <p style="color:var(--text-muted);">Frontend Developer · Bettiah, Bihar · +91 9117437173 · gulshankumar800@gmail.com</p>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:20px; border-radius:12px; border:1px solid var(--border-light); font-size:0.92rem; line-height:1.7; color:#cbd5e1; margin-bottom:25px;">
            <p><strong style="color:#fff;">Profile:</strong> Passionate Frontend Developer dedicated to creating modern, responsive, and 3D interactive web experiences. Focused on clean architecture, user experience, and modern JavaScript/React development.</p>
            <div style="margin-top:12px;">
              <strong style="color:#fff;">Technical Masteries:</strong> HTML5, CSS3, JavaScript ES6+, React.js, Tailwind CSS, Bootstrap 5, Three.js WebGL, Git & GitHub, Responsive Design.
            </div>
            <div style="margin-top:12px;">
              <strong style="color:#fff;">Availability:</strong> Open for Junior Frontend roles, Internships & Freelance Projects.
            </div>
          </div>
          <div style="display:flex; gap:12px; justify-content:flex-end;">
            <button class="btn-primary" onclick="window.print()">
              <span>Print / Save as PDF</span>
              <i class="fa-solid fa-print"></i>
            </button>
          </div>
        `;
        modal.classList.add('active');
      }
    });
  }

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mainNav = document.getElementById('main-nav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      sfx.playClick();
    });

    // Close when clicking nav links
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
      });
    });
  }

  // Active scroll spy on nav links
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('nav.main-nav a');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(sec => {
      const top = sec.offsetTop - 180;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });

    // Header scroll background shrink
    const header = document.getElementById('site-header');
    if (header) {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });
}

// ==========================================
// 11. Initializer on Load
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  initThreeJS();
  initCustomCursor();
  init3DTilt();
  initTypewriter();
  initThemeAndControls();
  initTerminal();
  initContactAndActions();
});
