// Love counter - calculates time since the start date
function updateCounter() {
    const startDate = new Date('2025-02-22T00:00:00');
    const now = new Date();
    const diff = now - startDate;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}

// Update counter every second
setInterval(updateCounter, 1000);
updateCounter();

// Scroll animations
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in-scroll');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100 && elementBottom > 0) {
            element.classList.add('visible');
        }
    });
}

// Run on scroll and on load
window.addEventListener('scroll', handleScrollAnimations);
window.addEventListener('load', handleScrollAnimations);

// Initial check
handleScrollAnimations();

// Add floating hearts effect
function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.innerHTML = '❤';
    heart.style.position = 'fixed';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.bottom = '-50px';
    heart.style.fontSize = Math.random() * 20 + 20 + 'px';
    heart.style.opacity = Math.random() * 0.5 + 0.3;
    heart.style.zIndex = '-1';
    heart.style.pointerEvents = 'none';
    heart.style.transition = 'all 10s linear';
    heart.style.color = '#ff6b9d';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        heart.style.bottom = '120vh';
        heart.style.opacity = '0';
        heart.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
    }, 100);
    
    setTimeout(() => {
        heart.remove();
    }, 10000);
}

// Create a floating heart every 3 seconds
setInterval(createFloatingHeart, 3000);

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
