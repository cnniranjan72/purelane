// Auto-scrolling reviews rail. WCAG 2.2.2 requires a way to pause any
// auto-moving content that runs longer than 5 seconds, so this always
// ships a real pause/play button in addition to pausing on hover/focus.
// Reduced-motion visitors never see the animation start at all (handled
// in CSS, not here) and can still browse the track by scrolling it.
class ReviewsMarquee extends HTMLElement {
  connectedCallback() {
    this.track = this.querySelector('[data-marquee-track]');
    this.toggle = this.querySelector('[data-marquee-toggle]');
    this.toggleLabel = this.querySelector('[data-marquee-toggle-label]');
    if (!this.track || !this.toggle) return;

    this.manuallyPaused = false;
    this.hovering = false;

    this.toggle.addEventListener('click', () => {
      this.manuallyPaused = !this.manuallyPaused;
      this.toggle.setAttribute('aria-pressed', String(this.manuallyPaused));
      this.toggleLabel.textContent = this.manuallyPaused ? 'Play' : 'Pause';
      this.updatePausedState();
    });

    this.addEventListener('mouseenter', () => {
      this.hovering = true;
      this.updatePausedState();
    });
    this.addEventListener('mouseleave', () => {
      this.hovering = false;
      this.updatePausedState();
    });
    this.addEventListener('focusin', () => {
      this.hovering = true;
      this.updatePausedState();
    });
    this.addEventListener('focusout', () => {
      this.hovering = false;
      this.updatePausedState();
    });
  }

  updatePausedState() {
    this.track.classList.toggle('is-paused', this.manuallyPaused || this.hovering);
  }
}

customElements.define('reviews-marquee', ReviewsMarquee);
