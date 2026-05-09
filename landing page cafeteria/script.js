// Torrado - Main Script

document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for animations
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up, .fade-left, .fade-right, .scale-in').forEach(el => observer.observe(el));

  // Navbar scroll effect
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav-scrolled', window.scrollY > 50);
  });

  // Mobile menu
  const menuBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('closeMenu');
  const mobileMenu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openMenu() {
    mobileMenu.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  mobileLinks.forEach(l => l.addEventListener('click', closeMenu));

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Counter animation
  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current) + suffix;
    }, 30);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

  // Reservation form
  const form = document.getElementById('reservaForm');
  const modal = document.getElementById('confirmModal');
  const modalClose = document.getElementById('modalClose');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('nombre').value;
      const fecha = document.getElementById('fecha').value;
      const hora = document.getElementById('hora').value;
      const personas = document.getElementById('personas').value;

      if (nombre && fecha && hora && personas) {
        // Enviar por email usando Formspree
        fetch('https://formspree.io/f/hola@torrado.com.uy', {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        }).catch(err => console.log('Error enviando formulario:', err));

        document.getElementById('modalName').textContent = nombre;
        document.getElementById('modalDate').textContent = fecha;
        document.getElementById('modalTime').textContent = hora;
        document.getElementById('modalGuests').textContent = personas;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
        form.reset();
      }
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    });
  }

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }
  });

  // Set min date for reservation
  const fechaInput = document.getElementById('fecha');
  if (fechaInput) {
    const today = new Date().toISOString().split('T')[0];
    fechaInput.setAttribute('min', today);
  }

  // Review Modal Logic
  const openReviewBtn = document.getElementById('openReviewBtn');
  const closeReviewModal = document.getElementById('closeReviewModal');
  const reviewModal = document.getElementById('reviewModal');
  const reviewForm = document.getElementById('reviewForm');
  const stars = document.querySelectorAll('.star');
  const ratingValue = document.getElementById('ratingValue');

  if (openReviewBtn) {
    openReviewBtn.addEventListener('click', () => {
      reviewModal.classList.remove('hidden');
      reviewModal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    });
  }

  const closeReview = () => {
    reviewModal.classList.add('hidden');
    reviewModal.classList.remove('flex');
    document.body.style.overflow = '';
  };

  closeReviewModal?.addEventListener('click', closeReview);
  reviewModal?.addEventListener('click', (e) => {
    if (e.target === reviewModal) closeReview();
  });

  // Star Rating Interactive
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = star.dataset.value;
      ratingValue.value = value;
      updateStars(value);
    });

    star.addEventListener('mouseenter', () => {
      updateStars(star.dataset.value);
    });
  });

  const starRatingEl = document.getElementById('starRating');
  if (starRatingEl) {
    starRatingEl.addEventListener('mouseleave', () => {
      updateStars(ratingValue.value);
    });
  }

  function updateStars(value) {
    stars.forEach(s => {
      if (s.dataset.value <= value) {
        s.classList.remove('text-gray-700');
        s.classList.add('text-[#C9A84C]');
      } else {
        s.classList.add('text-gray-700');
        s.classList.remove('text-[#C9A84C]');
      }
    });
  }

  // Handle Review Submission
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reviewName').value;
      const comment = document.getElementById('reviewComment').value;
      const rating = ratingValue.value;
      
      // Enviar por email usando Formspree
      fetch('https://formspree.io/f/hola@torrado.com.uy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, comment, rating, type: 'Nueva Opinión' })
      }).catch(err => console.log('Error enviando opinión:', err));

      const grid = document.querySelector('#testimonios .grid');
      const newReview = document.createElement('div');
      newReview.className = 'testimonial-card fade-up visible';
      
      let starsHtml = '';
      for (let i = 0; i < 5; i++) {
        starsHtml += i < rating ? '★' : '☆';
      }

      newReview.innerHTML = `
        <div class="text-[#C9A84C] text-2xl mb-3">${starsHtml}</div>
        <p class="text-gray-300 italic mb-4">"${comment}"</p>
        <p class="text-sm font-semibold text-[#C9A84C]">— ${name}</p>
      `;

      grid.appendChild(newReview);
      closeReview();
      reviewForm.reset();
      updateStars(5);
      ratingValue.value = 5;

      newReview.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
});
