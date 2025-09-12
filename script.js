// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

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

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    // Add animation classes to elements
    const animateElements = document.querySelectorAll('.skill-card, .project-card, .about-text, .about-stats, .contact-info, .contact-form');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Animate skill bars
    const skillBars = document.querySelectorAll('.skill-progress');
    const skillBarObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                entry.target.style.width = width + '%';
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => {
        skillBarObserver.observe(bar);
    });

    // Animate counter numbers
    const counters = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
});

// Counter animation function
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 20);
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const floatingCards = document.querySelectorAll('.floating-card');
    
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    
    floatingCards.forEach((card, index) => {
        const speed = 0.1 + (index * 0.05);
        card.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', () => {
    const titleName = document.querySelector('.title-name');
    if (titleName) {
        const originalText = titleName.textContent;
        typeWriter(titleName, originalText, 150);
    }
});

// Form submission handling (Google Apps Script integration)
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.querySelector('#contact-name').value.trim();
        const email = document.querySelector('#contact-email').value.trim();
        const subject = document.querySelector('#contact-subject').value.trim();
        const message = document.querySelector('#contact-message').value.trim();
        const page = document.querySelector('#contact-page').value;

        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        // Replace this with your deployed Google Apps Script Web App URL
        const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/PASTE_YOUR_DEPLOYED_WEB_APP_URL_HERE/exec';

        const payload = {
            name,
            email,
            subject,
            message,
            page,
            to: 'sureyasureya001@gmail.com'
        };

        try {
            const res = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            // With no-cors, we cannot read the response; assume success
            showNotification('Message sent! I\'ll get back to you soon.', 'success');
            contactForm.reset();
        } catch (err) {
            console.error(err);
            showNotification('Failed to send. Please try again later.', 'error');
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4ecdc4' : type === 'error' ? '#ff6b6b' : '#667eea'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add hover effects to project cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Add click effects to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
`;
document.head.appendChild(style);

// Add scroll progress indicator
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(135deg, #8a2be2 0%, #4b0082 100%);
        z-index: 10001;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

// Initialize scroll progress
createScrollProgress();

// Advanced Scroll Effects
function initAdvancedScrollEffects() {
    // Parallax scrolling for different elements
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax-slow, .parallax-fast');
        
        parallaxElements.forEach(element => {
            const speed = element.classList.contains('parallax-fast') ? 0.5 : 0.2;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Scroll reveal animation
    const scrollRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all scroll reveal elements
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        scrollRevealObserver.observe(el);
    });

    // Staggered animation for gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });

    galleryItems.forEach(item => {
        item.classList.add('stagger-animation');
        staggerObserver.observe(item);
    });
}

// Section indicators functionality
function initSectionIndicators() {
    const indicators = document.querySelectorAll('.section-indicator');
    const sections = document.querySelectorAll('section[id]');
    
    // Update active indicator on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        indicators.forEach(indicator => {
            indicator.classList.remove('active');
            if (indicator.getAttribute('data-target') === `#${current}`) {
                indicator.classList.add('active');
            }
        });
    });

    // Click to scroll to section
    indicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            const target = document.querySelector(indicator.getAttribute('data-target'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Image lazy loading
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize all scroll effects
document.addEventListener('DOMContentLoaded', () => {
    initAdvancedScrollEffects();
    initSectionIndicators();
    initLazyLoading();
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Animate elements on load
    const heroElements = document.querySelectorAll('.hero-text > *');
    heroElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        setTimeout(() => {
            el.style.transition = 'all 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// Add cursor glitters animation effect - Global for all pages
let mouseX = 0, mouseY = 0;
let glitters = [];
let glitterCount = 0;

// Initialize glitters effect when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeGlittersEffect();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGlittersEffect);
} else {
    initializeGlittersEffect();
}

function initializeGlittersEffect() {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Create multiple glitters with different sizes and animations
        const numGlitters = Math.random() * 4 + 2; // 2-5 glitters per movement
        
        for (let i = 0; i < numGlitters; i++) {
            setTimeout(() => {
                createGlitter(mouseX, mouseY);
            }, i * 30);
        }
    });
}

function createGlitter(x, y) {
    const glitter = document.createElement('div');
    const size = Math.random() * 8 + 3; // 3-11px
    const rotation = Math.random() * 360;
    const duration = Math.random() * 1000 + 600; // 600-1600ms
    const delay = Math.random() * 200;
    const offsetX = (Math.random() - 0.5) * 80; // -40 to +40
    const offsetY = (Math.random() - 0.5) * 80; // -40 to +40
    
    // Random glitter shapes
    const glitterShapes = ['◆', '◇', '◈', '◊', '⬟', '⬢', '⬡', '⬠', '⬞', '⬝', '⬜', '⬛'];
    const randomShape = glitterShapes[Math.floor(Math.random() * glitterShapes.length)];
    
    // Random glitter colors (neon variations)
    const colors = [
        'linear-gradient(45deg, #00ffff, #ff00ff)',
        'linear-gradient(45deg, #ff00ff, #ffff00)',
        'linear-gradient(45deg, #ffff00, #00ff00)',
        'linear-gradient(45deg, #00ff00, #00ffff)',
        'linear-gradient(45deg, #ff0080, #8000ff)',
        'linear-gradient(45deg, #8000ff, #00ffff)',
        'linear-gradient(45deg, #00ffff, #ff0080)',
        'linear-gradient(45deg, #ff0080, #ffff00)',
        'linear-gradient(45deg, #ffff00, #ff00ff)',
        'linear-gradient(45deg, #ff00ff, #00ff00)'
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const animationType = Math.random();
    
    let animationName = 'starTwinkle';
    if (animationType > 0.6) {
        animationName = 'starFloat';
    } else if (animationType > 0.3) {
        animationName = 'starTwinkle';
    }
    
    glitter.style.cssText = `
        position: fixed;
        left: ${x + offsetX}px;
        top: ${y + offsetY}px;
        width: ${size}px;
        height: ${size}px;
        pointer-events: none;
        z-index: 9999;
        opacity: 0;
        animation: ${animationName} ${duration}ms ease-out ${delay}ms forwards;
        transform: rotate(${rotation}deg);
        text-align: center;
        line-height: 1;
        font-weight: bold;
        font-size: ${size}px;
        color: transparent;
        background: ${randomColor};
        -webkit-background-clip: text;
        background-clip: text;
        filter: drop-shadow(0 0 6px rgba(0, 255, 255, 0.8));
    `;
    
    glitter.innerHTML = randomShape;
    document.body.appendChild(glitter);
    glitters.push(glitter);
    glitterCount++;
    
    // Add extra sparkle effect
    if (Math.random() > 0.6) {
        createSparkle(x + offsetX, y + offsetY, size);
    }
    
    // Remove glitter after animation
    setTimeout(() => {
        if (glitter.parentNode) {
            glitter.remove();
            const index = glitters.indexOf(glitter);
            if (index > -1) {
                glitters.splice(index, 1);
            }
        }
    }, duration + delay + 300);
    
    // Limit total glitters
    if (glitters.length > 80) {
        const oldGlitter = glitters.shift();
        if (oldGlitter && oldGlitter.parentNode) {
            oldGlitter.remove();
        }
    }
}

function createSparkle(x, y, size) {
    const sparkle = document.createElement('div');
    const sparkleSize = size * 0.4;
    
    sparkle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${sparkleSize}px;
        height: ${sparkleSize}px;
        background: radial-gradient(circle, #ffffff 0%, #00ffff 30%, #ff00ff 70%, transparent 100%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        opacity: 0;
        animation: sparkleFade 800ms ease-out forwards;
        filter: brightness(1.5) contrast(1.2);
    `;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        if (sparkle.parentNode) {
            sparkle.remove();
        }
    }, 800);
}

// Add star twinkle animation
const starStyle = document.createElement('style');
starStyle.textContent = `
    @keyframes starTwinkle {
        0% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
            filter: drop-shadow(0 0 0px rgba(255, 215, 0, 0));
        }
        15% {
            opacity: 0.8;
            transform: scale(1.3) rotate(45deg);
            filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.8));
        }
        30% {
            opacity: 1;
            transform: scale(0.9) rotate(90deg);
            filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
        }
        45% {
            opacity: 0.9;
            transform: scale(1.1) rotate(135deg);
            filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.7));
        }
        60% {
            opacity: 0.7;
            transform: scale(0.8) rotate(180deg);
            filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.5));
        }
        75% {
            opacity: 0.9;
            transform: scale(1.05) rotate(225deg);
            filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
        }
        90% {
            opacity: 0.5;
            transform: scale(0.7) rotate(270deg);
            filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.3));
        }
        100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
            filter: drop-shadow(0 0 0px rgba(255, 215, 0, 0));
        }
    }
    
    @keyframes sparkleFade {
        0% {
            opacity: 0;
            transform: scale(0);
        }
        50% {
            opacity: 1;
            transform: scale(1.5);
        }
        100% {
            opacity: 0;
            transform: scale(0.5);
        }
    }
    
    @keyframes starFloat {
        0% {
            transform: translateY(0px) rotate(0deg);
        }
        50% {
            transform: translateY(-20px) rotate(180deg);
        }
        100% {
            transform: translateY(0px) rotate(360deg);
        }
    }
`;
document.head.appendChild(starStyle);

// =========================
// Mini Games Implementation
// =========================

function initSnakeGame() {
    const canvas = document.getElementById('snake-canvas');
    const startBtn = document.getElementById('snake-start');
    const resetBtn = document.getElementById('snake-reset');
    const scoreEl = document.getElementById('snake-score');
    if (!canvas || !startBtn || !resetBtn || !scoreEl) return;

    const ctx = canvas.getContext('2d');
    let gridSize = 15; // base tile size; will adapt with canvas size
    let tileCount = canvas.width / gridSize;
    let snake = [{ x: 10, y: 10 }];
    let velocity = { x: 0, y: 0 };
    let food = { x: 5, y: 5 };
    let score = 0;
    let gameInterval = null;
    let running = false;

    function resizeCanvas() {
        // Keep canvas square, fit to parent width up to 320px
        const parent = canvas.parentElement;
        const size = Math.min(parent.clientWidth, 320);
        canvas.width = size;
        canvas.height = size;
        // recompute grid based on roughly 20 cells
        tileCount = 20;
        gridSize = Math.floor(canvas.width / tileCount);
        draw();
    }

    function placeFood() {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        // avoid placing on snake
        if (snake.some(seg => seg.x === food.x && seg.y === food.y)) {
            placeFood();
        }
    }

    function drawRect(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * gridSize, y * gridSize, gridSize - 1, gridSize - 1);
    }

    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        velocity = { x: 0, y: 0 };
        score = 0;
        scoreEl.textContent = String(score);
        placeFood();
        draw();
    }

    function gameOver() {
        running = false;
        clearInterval(gameInterval);
        showNotification('Game Over! Score: ' + score, 'info');
    }

    function update() {
        // move snake
        const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

        // wall collision
        if (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount) {
            return gameOver();
        }

        // self collision
        if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            return gameOver();
        }

        snake.unshift(head);

        // food
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreEl.textContent = String(score);
            placeFood();
        } else {
            snake.pop();
        }
    }

    function drawGridBackground() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function draw() {
        drawGridBackground();
        // draw food
        drawRect(food.x, food.y, '#00ffff');
        // draw snake
        snake.forEach((seg, idx) => drawRect(seg.x, seg.y, idx === 0 ? '#ff00ff' : '#12a4ff'));
    }

    function loop() {
        update();
        draw();
    }

    function start() {
        if (running) return;
        if (velocity.x === 0 && velocity.y === 0) {
            velocity = { x: 1, y: 0 };
        }
        running = true;
        gameInterval = setInterval(loop, 120);
    }

    // controls
    window.addEventListener('keydown', (e) => {
        if (!canvas.isConnected) return; // stop handling if section removed
        switch (e.key) {
            case 'ArrowUp': if (velocity.y !== 1) velocity = { x: 0, y: -1 }; break;
            case 'ArrowDown': if (velocity.y !== -1) velocity = { x: 0, y: 1 }; break;
            case 'ArrowLeft': if (velocity.x !== 1) velocity = { x: -1, y: 0 }; break;
            case 'ArrowRight': if (velocity.x !== -1) velocity = { x: 1, y: 0 }; break;
        }
    });

    startBtn.addEventListener('click', start);
    resetBtn.addEventListener('click', () => {
        clearInterval(gameInterval);
        running = false;
        resetGame();
    });

    // Touch swipe controls
    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
        const t = e.changedTouches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
    }, { passive: true });
    canvas.addEventListener('touchend', (e) => {
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 10 && velocity.x !== -1) velocity = { x: 1, y: 0 };
            if (dx < -10 && velocity.x !== 1) velocity = { x: -1, y: 0 };
        } else {
            if (dy > 10 && velocity.y !== -1) velocity = { x: 0, y: 1 };
            if (dy < -10 && velocity.y !== 1) velocity = { x: 0, y: -1 };
        }
    }, { passive: true });

    window.addEventListener('resize', resizeCanvas);

    // initial
    resizeCanvas();
    resetGame();
}

function initMemoryGame() {
    const board = document.getElementById('memory-board');
    const startBtn = document.getElementById('memory-start');
    const resetBtn = document.getElementById('memory-reset');
    const movesEl = document.getElementById('memory-moves');
    if (!board || !startBtn || !resetBtn || !movesEl) return;

    const icons = ['🍎','🍌','🍇','🍓','🥑','🍒','🍍','🥝'];
    let first = null;
    let second = null;
    let lock = false;
    let moves = 0;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function setup() {
        moves = 0;
        movesEl.textContent = '0';
        board.innerHTML = '';
        const deck = shuffle([...icons, ...icons]);
        deck.forEach(icon => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.icon = icon;
            card.textContent = '❔';
            board.appendChild(card);
        });
    }

    function checkWin() {
        const remaining = board.querySelectorAll('.memory-card:not(.matched)');
        if (remaining.length === 0) {
            showNotification('You matched all pairs! 🎉', 'success');
        }
    }

    board.addEventListener('click', (e) => {
        const card = e.target.closest('.memory-card');
        if (!card || lock || card.classList.contains('matched') || card === first) return;

        card.classList.add('flipped');
        card.textContent = card.dataset.icon;

        if (!first) {
            first = card;
            return;
        }

        second = card;
        moves++;
        movesEl.textContent = String(moves);
        lock = true;

        if (first.dataset.icon === second.dataset.icon) {
            setTimeout(() => {
                first.classList.add('matched');
                second.classList.add('matched');
                first = null; second = null; lock = false;
                checkWin();
            }, 300);
        } else {
            setTimeout(() => {
                first.classList.remove('flipped');
                first.textContent = '❔';
                second.classList.remove('flipped');
                second.textContent = '❔';
                first = null; second = null; lock = false;
            }, 700);
        }
    });

    startBtn.addEventListener('click', setup);
    resetBtn.addEventListener('click', setup);
    setup();
}

function initTicTacToe() {
    const boardEl = document.getElementById('tic-tac-toe-board');
    const currentPlayerEl = document.getElementById('current-player');
    const resetBtn = document.getElementById('ttt-reset');
    if (!boardEl || !currentPlayerEl || !resetBtn) return;

    let board = Array(9).fill(null);
    let current = 'X';
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    function render() {
        boardEl.innerHTML = '';
        board.forEach((val, idx) => {
            const cell = document.createElement('div');
            cell.className = 'ttt-cell';
            cell.dataset.idx = String(idx);
            cell.textContent = val ? val : '';
            if (val === 'X') cell.classList.add('x');
            if (val === 'O') cell.classList.add('o');
            boardEl.appendChild(cell);
        });
        currentPlayerEl.textContent = current;
    }

    function checkWinner() {
        for (const [a,b,c] of wins) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                const cells = boardEl.querySelectorAll('.ttt-cell');
                [a,b,c].forEach(i => cells[i].classList.add('winning'));
                showNotification(`${board[a]} wins!`, 'success');
                boardEl.style.pointerEvents = 'none';
                return true;
            }
        }
        if (board.every(Boolean)) {
            showNotification('Draw game!', 'info');
            return true;
        }
        return false;
    }

    boardEl.addEventListener('click', (e) => {
        const cell = e.target.closest('.ttt-cell');
        if (!cell) return;
        const idx = parseInt(cell.dataset.idx, 10);
        if (board[idx]) return;
        board[idx] = current;
        render();
        if (!checkWinner()) {
            current = current === 'X' ? 'O' : 'X';
            currentPlayerEl.textContent = current;
        }
    });

    function reset() {
        board = Array(9).fill(null);
        current = 'X';
        boardEl.style.pointerEvents = '';
        render();
    }

    resetBtn.addEventListener('click', reset);
    reset();
}

function initReactionGame() {
    const area = document.getElementById('reaction-area');
    const target = document.getElementById('reaction-target');
    const startBtn = document.getElementById('reaction-start');
    const resetBtn = document.getElementById('reaction-reset');
    const bestEl = document.getElementById('reaction-best');
    if (!area || !target || !startBtn || !resetBtn || !bestEl) return;

    let startTime = 0;
    let timeoutId = null;
    let best = null;
    let state = 'idle'; // idle -> waiting -> ready -> go -> done

    function setState(next, text) {
        area.classList.remove('waiting', 'ready', 'go');
        if (next === 'waiting') area.classList.add('waiting');
        if (next === 'ready') area.classList.add('ready');
        if (next === 'go') area.classList.add('go');
        target.textContent = text;
        state = next;
    }

    function start() {
        clearTimeout(timeoutId);
        setState('waiting', 'Wait for yellow...');
        const wait1 = 500 + Math.random() * 800; // to ready
        const wait2 = 700 + Math.random() * 1200; // to go
        timeoutId = setTimeout(() => {
            setState('ready', 'Get ready...');
            timeoutId = setTimeout(() => {
                setState('go', 'Click now!');
                startTime = performance.now();
            }, wait2);
        }, wait1);
    }

    function reset() {
        clearTimeout(timeoutId);
        setState('idle', 'Click Start to begin');
    }

    area.addEventListener('click', () => {
        if (state === 'go') {
            const ms = Math.round(performance.now() - startTime);
            if (best === null || ms < best) {
                best = ms;
                bestEl.textContent = String(best);
            }
            showNotification(`Reaction: ${ms} ms`, 'success');
            setState('done', 'Click Start to try again');
        } else if (state === 'waiting' || state === 'ready') {
            showNotification('Too early! Try again.', 'error');
            reset();
        }
    });

    startBtn.addEventListener('click', start);
    resetBtn.addEventListener('click', reset);
    reset();
}

// Initialize games after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initSnakeGame();
    initMemoryGame();
    initTicTacToe();
    initReactionGame();
});
