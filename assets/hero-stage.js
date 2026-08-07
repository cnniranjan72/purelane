// Cross-fades between a set of featured-product slides. Shared by any
// section with more than one such block (hero.liquid, why-it-works.liquid);
// a single slide needs no JS at all and renders correctly with CSS alone.
//
// Wrapped in an IIFE and guarded: when two sections are both on the page
// each emits its own <script src> tag, and the browser executes both. A
// bare top-level `class HeroStage` would throw
// "Identifier 'HeroStage' has already been declared" on the second run —
// scoping the declaration inside the function makes a repeat load a no-op.
(function () {
  if (customElements.get('hero-stage')) return;

  class HeroStage extends HTMLElement {
    connectedCallback() {
      this.slides = Array.from(this.querySelectorAll('[data-hero-slide]'));
      this.dots = Array.from(this.querySelectorAll('[data-hero-dot]'));
      this.current = 0;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.show(index, true));
      });

      if (this.slides.length > 1 && !this.reducedMotion) {
        this.addEventListener('mouseenter', () => this.stop());
        this.addEventListener('mouseleave', () => this.start());
        this.addEventListener('focusin', () => this.stop());
        this.addEventListener('focusout', () => this.start());
        this.start();
      }
    }

    disconnectedCallback() {
      this.stop();
    }

    show(index, userInitiated) {
      if (index === this.current) return;
      this.slides[this.current]?.classList.remove('is-active');
      this.slides[this.current]?.setAttribute('aria-hidden', 'true');
      this.dots[this.current]?.setAttribute('aria-current', 'false');
      this.current = index;
      this.slides[this.current]?.classList.add('is-active');
      this.slides[this.current]?.removeAttribute('aria-hidden');
      this.dots[this.current]?.setAttribute('aria-current', 'true');
      if (userInitiated) this.stop();
    }

    start() {
      this.stop();
      this.timer = window.setInterval(() => {
        this.show((this.current + 1) % this.slides.length);
      }, 4200);
    }

    stop() {
      if (this.timer) window.clearInterval(this.timer);
    }
  }

  customElements.define('hero-stage', HeroStage);
})();

