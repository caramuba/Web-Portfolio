// ========== HERO VIDEO SPEED ==========
document.addEventListener('DOMContentLoaded', () => {
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    heroVideo.playbackRate = 0.5;
  }
});

// ========== LOADER ==========
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2200);
});

// ========== NOISE TEXTURE GESTURE (Optional Interaction) ==========
function updateNoiseOpacity() {
  const scrolled = window.pageYOffset;
  const noise = document.querySelector('.hero-noise');
  if (noise) {
    const opacity = 0.05 + (scrolled / window.innerHeight) * 0.05;
    noise.style.opacity = Math.min(opacity, 0.15);
  }
}
window.addEventListener('scroll', updateNoiseOpacity);

// ========== NAVBAR SCROLL ==========
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});

// ========== MOBILE MENU ==========
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('mobile-open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('mobile-open');
  });
});

// ========== ACTIVE NAV INDICATOR ==========
const sections = document.querySelectorAll('section[id]');
const navLinksItems = document.querySelectorAll('.nav-links a');

function highlightNav() {
  let scrollY = window.pageYOffset;
  sections.forEach(current => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 150;
    const sectionId = current.getAttribute('id');
    
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document.querySelector('.nav-links a[href*=' + sectionId + ']')?.classList.add('active');
    } else {
      document.querySelector('.nav-links a[href*=' + sectionId + ']')?.classList.remove('active');
    }
  });
}
window.addEventListener('scroll', highlightNav);

function revealOnScroll() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const windowHeight = window.innerHeight;

  reveals.forEach((el, index) => {
    const elementTop = el.getBoundingClientRect().top;
    const revealPoint = windowHeight - 100;

    if (el.offsetParent !== null && elementTop < revealPoint) {
      const delay = el.dataset.delay || 0;
      setTimeout(() => {
        el.classList.add('visible');
      }, delay);
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', () => {
  setTimeout(revealOnScroll, 2500);
  highlightNav();
});

// ========== COUNTER ANIMATION ==========
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  counters.forEach(counter => {
    if (counter.dataset.animated) return;
    const rect = counter.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      counter.dataset.animated = 'true';
      const target = parseInt(counter.dataset.target);
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          counter.textContent = target;
          if (target === 100) counter.textContent = target;
          clearInterval(timer);
        } else {
          counter.textContent = Math.floor(current);
        }
      }, 16);
    }
  });
}
window.addEventListener('scroll', animateCounters);

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ========== LIGHTBOX ==========
let currentImageIndex = 0;
let portfolioImages = [];

function updatePortfolioArray() {
  portfolioImages = Array.from(document.querySelectorAll('.portfolio-item img'));
}
updatePortfolioArray();

function openLightbox(item) {
  const img = item.querySelector('img');
  currentImageIndex = portfolioImages.indexOf(img);
  updateLightbox();
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function updateLightbox() {
  const lightboxImg = document.getElementById('lightboxImg');
  lightboxImg.src = portfolioImages[currentImageIndex].src;
}

function navigateLightbox(step) {
  currentImageIndex += step;
  if (currentImageIndex >= portfolioImages.length) currentImageIndex = 0;
  if (currentImageIndex < 0) currentImageIndex = portfolioImages.length - 1;
  updateLightbox();
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') navigateLightbox(1);
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
});

// ========== LOAD MORE PORTFOLIO ==========
const loadMoreBtn = document.getElementById('loadMoreBtn');
const showLessBtn = document.getElementById('showLessBtn');
const extraItems = document.querySelectorAll('.portfolio-extra');

if (loadMoreBtn && showLessBtn) {
  loadMoreBtn.addEventListener('click', () => {
    extraItems.forEach((item, index) => {
      // Usamos setTimeout para un efecto de escalonado
      setTimeout(() => {
        item.style.display = 'block';
        // Un pequeño delay para que el display:block se asiente antes de la animación
        setTimeout(() => {
          item.classList.add('visible');
        }, 10);
      }, index * 100);
    });
    
    // Cambiar visibilidad de botones
    loadMoreBtn.style.display = 'none';
    showLessBtn.style.display = 'inline-block';

    // Actualizar el array de imágenes para el lightbox
    setTimeout(() => {
      updatePortfolioArray();
    }, (extraItems.length * 100) + 100);
  });

  showLessBtn.addEventListener('click', () => {
    // Scroll suave hacia arriba de la sección antes de ocultar (opcional)
    const portfolioSection = document.getElementById('portfolio');
    portfolioSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    extraItems.forEach((item, index) => {
      item.classList.remove('visible');
      setTimeout(() => {
        item.style.display = 'none';
      }, 800); // Tiempo que coincide con la transición CSS
    });

    // Cambiar visibilidad de botones
    showLessBtn.style.display = 'none';
    loadMoreBtn.style.display = 'inline-block';

    // Actualizar el array de imágenes para el lightbox
    setTimeout(() => {
      updatePortfolioArray();
    }, 900);
  });
}

// ========== FORM HANDLING ==========
const form = document.getElementById('bookingForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', (e) => {
  // Basic validation
  const inputs = form.querySelectorAll('[required]');
  let valid = true;
  inputs.forEach(input => {
    if (!input.value.trim()) {
      valid = false;
      input.style.borderColor = '#e74c3c';
      setTimeout(() => { input.style.borderColor = ''; }, 2000);
    }
  });

  if (!valid) {
    e.preventDefault();
  } else {
    // Al ser válido, el formulario se enviará normalmente a formsubmit.co
    const submitBtn = form.querySelector('.form-submit');
    submitBtn.textContent = 'Enviando...';
  }
});

// ========== PARALLAX HERO ==========
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero-content');
  if (hero && scrolled < window.innerHeight) {
    hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    hero.style.opacity = 1 - (scrolled / window.innerHeight);
  }
});

// ========== DATE & TIME VALIDATION ==========
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');

if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);

  dateInput.addEventListener('change', function() {
    // getUTCDay evita problemas de zona horaria con el input date
    const day = new Date(this.value).getUTCDay();
    if (day === 0) { // 0 es Domingo
      alert('Los domingos no realizamos sesiones. Por favor, seleccioná un día de lunes a sábado.');
      this.value = '';
    }
  });
}

if (timeInput) {
  timeInput.addEventListener('change', function() {
    const [hour, minutes] = this.value.split(':').map(Number);
    if (hour < 10 || hour >= 19) {
      alert('El horario de atención es de 10:00 a 19:00. Por favor, elegí una hora válida.');
      this.value = '';
    }
  });
}
