export class Toggle {
    constructor(toggleEl, onEl, offEl, initialState = true) {
        this.toggle = initialState;
        this.toggleEl = toggleEl;
        this.onEl = onEl;
        this.offEl = offEl;

        // Initialize state
        this.updateToggleState();

        // Add event listener
        this.toggleEl.addEventListener('click', () => {
            this.toggle = !this.toggle;
            this.updateToggleState();
        });
    }

    updateToggleState() {
        if (this.toggle) {
            this.toggleEl.classList.add('active');
            this.onEl.style.color = '#fff';
            this.offEl.style.color = '#eff2f653';
        } else {
            this.toggleEl.classList.remove('active');
            this.onEl.style.color = '#eff2f653';
            this.offEl.style.color = '#fff';
        }
    }
}
