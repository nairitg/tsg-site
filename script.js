// Mobile menu toggle
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.toggle('hidden');
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Hide mobile menu when clicking navigation links
document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.add('hidden');
  });
});

// Carousel functionality
const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const items = document.querySelectorAll('.carousel-item');
const indicatorsContainer = document.getElementById('carouselIndicators');

let currentIndex = 0;
let itemsPerView = 4;
let isAnimating = false;

// Calculate items per view based on screen size
function updateItemsPerView() {
  if (window.innerWidth < 768) {
    itemsPerView = 2;
  } else if (window.innerWidth < 1024) {
    itemsPerView = 3;
  } else {
    itemsPerView = 4;
  }
}

// Create indicators
function createIndicators() {
  indicatorsContainer.innerHTML = '';
  const totalPages = Math.ceil(items.length / itemsPerView);
  
  for (let i = 0; i < totalPages; i++) {
    const indicator = document.createElement('button');
    indicator.className = 'w-2 h-2 rounded-full transition-all duration-300';
    indicator.style.backgroundColor = i === 0 ? '#374151' : '#d1d5db';
    indicator.setAttribute('aria-label', `Go to page ${i + 1}`);
    indicator.addEventListener('click', () => goToPage(i));
    indicatorsContainer.appendChild(indicator);
  }
}

// Update indicators
function updateIndicators() {
  const indicators = indicatorsContainer.querySelectorAll('button');
  const currentPage = Math.floor(currentIndex / itemsPerView);
  
  indicators.forEach((indicator, index) => {
    indicator.style.backgroundColor = index === currentPage ? '#374151' : '#d1d5db';
    indicator.style.width = index === currentPage ? '2rem' : '0.5rem';
  });
}

// Update button states
function updateButtonStates() {
  const maxIndex = Math.max(0, items.length - itemsPerView);
  
  if (currentIndex <= 0) {
    prevBtn.disabled = true;
    prevBtn.style.opacity = '0.4';
    prevBtn.style.cursor = 'not-allowed';
  } else {
    prevBtn.disabled = false;
    prevBtn.style.opacity = '1';
    prevBtn.style.cursor = 'pointer';
  }
  
  if (currentIndex >= maxIndex) {
    nextBtn.disabled = true;
    nextBtn.style.opacity = '0.4';
    nextBtn.style.cursor = 'not-allowed';
  } else {
    nextBtn.disabled = false;
    nextBtn.style.opacity = '1';
    nextBtn.style.cursor = 'pointer';
  }
}

// Move carousel with smooth animation
function moveCarousel() {
  if (isAnimating) return;
  
  isAnimating = true;
  
  // Get current dimensions
  const itemWidth = items[0].offsetWidth;
  const gap = 32; // 2rem gap
  const offset = -(currentIndex * (itemWidth + gap));
  
  // Apply transform
  track.style.transform = `translateX(${offset}px)`;
  
  // Update UI
  updateIndicators();
  updateButtonStates();
  
  // Reset animation flag after transition completes
  setTimeout(() => {
    isAnimating = false;
  }, 600); // Match the CSS transition duration
}

// Go to specific page
function goToPage(pageIndex) {
  if (isAnimating) return;
  
  const newIndex = pageIndex * itemsPerView;
  const maxIndex = Math.max(0, items.length - itemsPerView);
  
  currentIndex = Math.min(newIndex, maxIndex);
  moveCarousel();
}

// Next button with one item scroll
nextBtn.addEventListener('click', () => {
  if (isAnimating) return;
  
  const maxIndex = Math.max(0, items.length - itemsPerView);
  
  if (currentIndex < maxIndex) {
    currentIndex += 1; // Move one item at a time for smoother experience
    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }
    moveCarousel();
  }
});

// Previous button with one item scroll
prevBtn.addEventListener('click', () => {
  if (isAnimating) return;
  
  if (currentIndex > 0) {
    currentIndex -= 1; // Move one item at a time for smoother experience
    if (currentIndex < 0) {
      currentIndex = 0;
    }
    moveCarousel();
  }
});

// Initialize carousel
function initCarousel() {
  updateItemsPerView();
  createIndicators();
  updateButtonStates();
  
  // Ensure starting position is correct
  track.style.transform = 'translateX(0px)';
}

// Handle window resize with debouncing
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const oldItemsPerView = itemsPerView;
    updateItemsPerView();
    
    // Only reset if items per view changed
    if (oldItemsPerView !== itemsPerView) {
      currentIndex = 0;
      createIndicators();
      track.style.transform = 'translateX(0px)';
      updateButtonStates();
    } else {
      // Recalculate position for current index
      moveCarousel();
    }
  }, 250);
});

// Touch/swipe support for mobile with better detection
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
const minSwipeDistance = 50;

track.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

track.addEventListener('touchmove', (e) => {
  // Prevent default only for horizontal swipes
  const touchMoveX = e.changedTouches[0].screenX;
  const touchMoveY = e.changedTouches[0].screenY;
  const deltaX = Math.abs(touchMoveX - touchStartX);
  const deltaY = Math.abs(touchMoveY - touchStartY);
  
  if (deltaX > deltaY) {
    e.preventDefault();
  }
}, { passive: false });

track.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const horizontalDiff = touchStartX - touchEndX;
  const verticalDiff = Math.abs(touchStartY - touchEndY);
  
  // Only trigger if horizontal swipe is dominant
  if (Math.abs(horizontalDiff) > minSwipeDistance && Math.abs(horizontalDiff) > verticalDiff) {
    if (horizontalDiff > 0) {
      // Swipe left - go to next
      nextBtn.click();
    } else {
      // Swipe right - go to previous
      prevBtn.click();
    }
  }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    prevBtn.click();
  } else if (e.key === 'ArrowRight') {
    nextBtn.click();
  }
});

// Initialize on page load
initCarousel();