// Initialize intersection observer for scroll-triggered animations
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
};

const observer = new IntersectionObserver(revealCallback, {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
});

revealElements.forEach(element => {
    observer.observe(element);
});

// Trigger Hero Dashboard scale animation right after page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const dashboardWrapper = document.querySelector('.hero-dashboard-wrapper');
        if (dashboardWrapper) {
            dashboardWrapper.classList.add('active');
        }
    }, 400); // Wait 400ms for text fade-up to finish first
});

// Mock interactive functionality for buttons
const buttons = document.querySelectorAll('button,.btn-primary, .btn-secondary, .btn-text');
buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (btn.getAttribute('href') === '#' || btn.getAttribute('href') === 'javascript:void(0)') {
            e.preventDefault();
            btn.style.transform = btn.classList.contains('btn-text') ? 'scale(0.98)' : 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        }
    });
});

// FAQ Accordion functionality
const accordionHeaders = document.querySelectorAll('.accordion-header');
accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        const isActive = item.classList.contains('active');

        // Close all other accordions
        document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));

        // If it wasn't already active, open it
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Dynamic Pill Navigation highlighting based on scroll position
const moduleCards = document.querySelectorAll('.scroll-card');
const pillLinks = document.querySelectorAll('.pill-nav .pill');

if (moduleCards.length > 0 && pillLinks.length > 0) {
    // Smooth scroll for pill clicks
    pillLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                // Calculate scroll position with offset for sticky header/nav if needed
                const yOffset = -200; // Offset to account for fixed header + sticky space
                const y = targetElement.getBoundingClientRect().top + window.scrollY + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });

    // Observer to detect which card is visible
    const pillObserverOptions = {
        root: null,
        rootMargin: '-30% 0px -50% 0px', // Trigger point roughly in the middle of viewport
        threshold: 0
    };

    const pillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all pills
                pillLinks.forEach(link => link.classList.remove('active'));

                // Find matching pill and add active class
                const targetId = entry.target.id;
                const activeLink = document.querySelector(`.pill-nav .pill[href="#${targetId}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, pillObserverOptions);

    moduleCards.forEach(card => {
        if (card.id) { pillObserver.observe(card); }
    });
}

// ==========================================================================
// MEGA-MENU LOGIC & ACTIVE STATE HIGHLIGHTING
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const megaMenuLinks = document.querySelectorAll('.dropdown-sidebar a[data-target]');
    const megaSubPanels = document.querySelectorAll('.dropdown-sub-panel');
    const subFeatureLinks = document.querySelectorAll('.sub-feature-item');

    // 1. Hover Logic
    if (megaMenuLinks.length > 0 && megaSubPanels.length > 0) {
        megaMenuLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const target = link.getAttribute('data-target');
                
                // Update sidebar links active state
                megaMenuLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Update content panels visibility
                const targetPanel = document.getElementById(`panel-${target}`);
                if (targetPanel) {
                    megaSubPanels.forEach(panel => {
                        panel.classList.remove('active');
                    });
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    // 2. Active Path Highlighting Logic
    const currentPathRaw = window.location.pathname || '';
    let currentPath = currentPathRaw.split('/').pop();
    if (!currentPath || currentPath === '') currentPath = 'index.html';
    
    let currentHash = window.location.hash || '';

    if (currentPath !== 'index.html') {
        // Find matching sidebar link to open the right panel immediately
        let activeTarget = null;
        megaMenuLinks.forEach(link => {
            const linkHref = link.getAttribute('href') || '';
            const linkBase = linkHref.split('#')[0];
            if (linkBase === currentPath) {
                activeTarget = link.getAttribute('data-target');
            }
        });

        if (activeTarget) {
            // Highlight Solutions parent only if it's a solution page
            const solutionsLink = document.querySelector('.nav-item.has-dropdown > a');
            if (solutionsLink) solutionsLink.classList.add('active');

            // Check if we found targets
            const targetLinks = document.querySelectorAll(`.dropdown-sidebar a[data-target="${activeTarget}"]`);
            if (targetLinks.length > 0) {
                megaMenuLinks.forEach(l => l.classList.remove('active'));
                targetLinks.forEach(l => l.classList.add('active'));
            }

            const targetPanel = document.getElementById(`panel-${activeTarget}`);
            if (targetPanel) {
                megaSubPanels.forEach(panel => {
                    panel.classList.remove('active');
                });
                targetPanel.classList.add('active');
            }
        }
    }

    // Intersection Observer to update submenu highlight based on scroll
    const sections = [];
    subFeatureLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const linkBase = href.split('#')[0];
        if (linkBase === currentPath || href === currentPath) {
            // It's a link for this page
            if (href.includes('#')) {
                const id = href.split('#')[1];
                if (id) {
                    const el = document.getElementById(id);
                    if (el) sections.push({ id: id, element: el, link: link });
                }
            } else {
                // If it doesn't have a hash but is the current page, highlight it as a fallback
                if (!currentHash) link.classList.add('active-sub');
            }
        }
    });

    if (sections.length > 0) {
        // Setup observer
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            let activeMatchFound = false;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Remove all active states
                    subFeatureLinks.forEach(l => l.classList.remove('active-sub'));
                    
                    // Match to section and update hash without scrolling
                    const sectionId = entry.target.id;
                    const activeMatch = sections.find(s => s.id === sectionId);
                    
                    if (activeMatch) {
                        activeMatchFound = true;
                        // Apply active class to all instances in mega menus
                        document.querySelectorAll(`.sub-feature-item[href*="#${sectionId}"]`).forEach(l => l.classList.add('active-sub'));
                        
                        // Optionally update history state silently
                        if (history.replaceState) {
                            history.replaceState(null, null, `#${sectionId}`);
                        }
                    }
                }
            });
            
            // Re-apply hover highlight for the current hash if nothing is intersecting at the top 
            // (fixes issue when scrolling back up past all sections)
            if (!activeMatchFound && window.scrollY < 200) {
                 subFeatureLinks.forEach(l => l.classList.remove('active-sub'));
                 const firstSect = sections[0];
                 if(firstSect) {
                     document.querySelectorAll(`.sub-feature-item[href*="#${firstSect.id}"]`).forEach(l => l.classList.add('active-sub'));
                     if (history.replaceState) {
                         history.replaceState(null, null, `#${firstSect.id}`);
                     }
                 }
            }
        }, observerOptions);

        sections.forEach(s => sectionObserver.observe(s.element));
        
        // Initial check if there's a hash on load, immediately highlight it
        if(currentHash) {
             const hashId = currentHash.substring(1);
             document.querySelectorAll(`.sub-feature-item[href*="#${hashId}"]`).forEach(l => l.classList.add('active-sub'));
        }
    }
});

// Modal Logic
const modal = document.getElementById('info-modal');
const modalCloseBtn = document.querySelector('.modal-close');
const openModalBtns = document.querySelectorAll('.open-modal');

const modalData = {
    'grow-sales': {
        subtitle: 'GROWTH STRATEGY',
        title: 'Grow Your Sales',
        list: [
            'Maximize transactions by anticipating rush hours using advanced ML forecasting.',
            'Ensure perfect staffing levels to improve customer satisfaction and throughput.',
            'Track high-margin items and suggestive selling performance in real-time.',
            'Analyze local weather and community events to accurately predict daily demand.'
        ],
        promo: 'Limited time. <strong>FREE Sales Audit</strong> for new signups.*',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    },
    'improve-profits': {
        subtitle: 'MARGIN OPTIMIZATION',
        title: 'Improve My Profits',
        list: [
            'Instantly identify theoretical vs. actual food cost variances.',
            'Eliminate wasteful over-scheduling with precision labor forecasting.',
            'Automate vendor invoice reconciliation to catch pricing errors.',
            'Stop profit leakage before it happens with real-time operational alerts.'
        ],
        promo: 'Join today and get <strong>3 months of BI tools free</strong>.*',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    },
    'time-money': {
        subtitle: 'LABOR COMPLIANCE',
        title: 'Time is Money',
        list: [
            'Biometric timeclocks eliminate buddy punching and time theft.',
            'Proactive overtime alerts keep managers aware before limits are breached.',
            'Enforce compliance with local labor laws, meal breaks, and minor rules automatically.',
            'Seamlessly integrate timepunch data into ADP, Paychex, and Toast.'
        ],
        promo: 'Upgrade now for <strong>Free Hardware Installation</strong>.*',
        image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    },
    'haccp': {
        subtitle: 'FOOD SAFETY',
        title: 'Zip HACCP & Temperature',
        list: [
            'Bluetooth probes automatically record line check temperatures with zero manual entry.',
            'Ensure brand compliance and protect your reputation across all locations.',
            'Corrective action alerts trigger immediately when temperatures fall out of safe zones.',
            'Historical digital logs guarantee you are always ready for health inspections.'
        ],
        promo: 'Get a <strong>Free Bluetooth Probe</strong> with every annual plan.*',
        image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    },
    'back-office': {
        subtitle: 'MANAGEMENT SYSTEM',
        title: 'Restaurant Back Office',
        list: [
            'The restaurant industry is highly competitive and requires constant innovation to succeed.',
            'A well-managed back office is crucial to the success of a restaurant, leading to increased efficiency.',
            'Automating the back office is a solution that many restaurants have implemented to improve operations.',
            'Improving restaurant back-office operations is important for long-term success and better customer service.'
        ],
        promo: 'Limited time. <strong>50% OFF</strong> solutions for 3 months.*',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    },
    'workforce': {
        subtitle: 'TEAM PRODUCTIVITY',
        title: 'Workforce Management',
        list: [
            'Give your managers and employees the tools to win with a dedicated mobile app.',
            'Allow team members to easily swap shifts, request time off, and manage their availability.',
            'Reduce manager headache by letting the system auto-approve basic scheduling conflicts.',
            'Engage your staff with direct team messaging and digital announcement boards.'
        ],
        promo: 'Included <strong>FREE</strong> with the Enterprise Suite.*',
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    }
};

if (modal && modalCloseBtn) {
    const openModal = (e) => {
        if (e) e.preventDefault();

        // Populate modal data dynamically
        const modalKey = e.currentTarget.getAttribute('data-modal');
        if (modalKey && modalData[modalKey]) {
            const data = modalData[modalKey];
            document.querySelector('.modal-subtitle').textContent = data.subtitle;
            document.querySelector('.modal-title').textContent = data.title;
            document.querySelector('.modal-list').innerHTML = data.list.map(item => `<li>${item}</li>`).join('');
            document.querySelector('.promo-text').innerHTML = `<i>${data.promo}</i>`;
            const modalImg = document.querySelector('.modal-image img');
            if (modalImg) {
                modalImg.src = data.image;
                modalImg.alt = data.title;
            }
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    modalCloseBtn.addEventListener('click', closeModal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// ==========================================================================
// SCROLL-DRIVEN INTELLIGENCE ANIMATION (GSAP)
// ==========================================================================
if (typeof gsap !== 'undefined' && document.querySelector('#scroll-intelligence')) {
    gsap.registerPlugin(ScrollTrigger);

    const intelligenceSection = document.querySelector('#scroll-intelligence');
    const tracksLTR = document.querySelectorAll('.track-ltr');
    const tracksRTL = document.querySelectorAll('.track-rtl');
    const steps = document.querySelectorAll('.step');
    const mockupImages = document.querySelectorAll('.mockup-image'); // New: Multiple mockup images
    const dots = document.querySelectorAll('.scroll-progress-dots .dot');

    // Create Main Timeline
    const mainTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".scroll-trigger-area",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
            onUpdate: (self) => {
                // Update active step, mockup image, and dots based on progress
                const progress = self.progress;
                let activeIndex = Math.floor(progress * steps.length);
                if (activeIndex >= steps.length) activeIndex = steps.length - 1;

                steps.forEach((step, i) => {
                    if (i === activeIndex) {
                        step.classList.add('active');
                        dots[i].classList.add('active');
                        if (mockupImages[i]) mockupImages[i].classList.add('active');
                    } else {
                        step.classList.remove('active');
                        dots[i].classList.remove('active');
                        if (mockupImages[i]) mockupImages[i].classList.remove('active');
                    }
                });
            }
        }
    });

    // Animate Tracks (Only two tracks now)
    mainTl.to(tracksLTR, {
        x: 400, // Move right
        ease: "none"
    }, 0);

    mainTl.to(tracksRTL, {
        x: -400, // Move left
        ease: "none"
    }, 0);

    // Initial positioning for parallax feel
    gsap.set(tracksLTR, { x: -250 });
    gsap.set(tracksRTL, { x: 250 });
}
