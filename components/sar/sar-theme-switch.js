export class SarThemeSwitch extends HTMLElement {
  static get observedAttributes() {
    return ['theme'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onStorage = this._onStorage.bind(this);
    this.toggleTheme = this.toggleTheme.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  get theme() {
    return this.getAttribute('theme') || 'dark';
  }

  set theme(val) {
    if (val) {
      this.setAttribute('theme', val);
    } else {
      this.removeAttribute('theme');
    }
  }

  connectedCallback() {
    this._render();
    this._initTheme();
    window.addEventListener('storage', this._onStorage);
  }

  disconnectedCallback() {
    window.removeEventListener('storage', this._onStorage);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'theme' && oldValue !== newValue) {
      this._updateUI();
    }
  }

  _initTheme() {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    if (!currentTheme) {
      try {
        currentTheme = localStorage.getItem('sar-theme');
      } catch (e) {
        currentTheme = 'dark';
      }
    }
    if (currentTheme !== 'light' && currentTheme !== 'dark') {
      currentTheme = 'dark';
    }
    this.theme = currentTheme;
    this._applyTheme(currentTheme, false);
  }

  _onStorage(e) {
    if (e.key === 'sar-theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
      this.theme = e.newValue;
      this._applyTheme(e.newValue, false);
    }
  }

  _applyTheme(newTheme, saveToStorage = true) {
    document.documentElement.setAttribute('data-theme', newTheme);
    if (document.body) {
      document.body.setAttribute('data-theme', newTheme);
    }
    const metaThemeColor = document.getElementById('themeColorMeta') || document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newTheme === 'light' ? '#ffffff' : '#121216');
    }
    if (saveToStorage) {
      try {
        localStorage.setItem('sar-theme', newTheme);
      } catch (err) {
        console.warn('Could not save theme preference:', err);
      }
    }
    // Dispatch a single composed event for any external consumers/listeners
    this.dispatchEvent(
      new CustomEvent('theme-change', {
        detail: { theme: newTheme },
        bubbles: true,
        composed: true,
      })
    );
  }

  toggleTheme() {
    const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.theme = nextTheme;
    this._applyTheme(nextTheme, true);
  }

  _onKeyDown(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.toggleTheme();
    }
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          user-select: none;
          -webkit-user-select: none;
        }
        .switch-btn {
          position: relative;
          display: flex;
          align-items: center;
          width: 58px;
          height: 30px;
          border-radius: 30px;
          padding: 0;
          margin: 0;
          border: 1px solid var(--switch-track-border, #3A3A4C);
          background-color: var(--switch-track-bg, #1E1E26);
          cursor: pointer;
          outline: none;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.35);
          transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .switch-btn::after {
          content: '';
          position: absolute;
          top: -8px;
          bottom: -8px;
          left: -8px;
          right: -8px;
        }
        .switch-btn:hover {
          transform: scale(1.05);
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.35), 0 0 12px var(--switch-glow, rgba(186, 104, 200, 0.35));
        }
        .switch-btn:focus-visible {
          outline: 2px solid var(--accent-color, #38BDF8);
          outline-offset: 2px;
        }
        .track-icons {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 7px;
          pointer-events: none;
        }
        .track-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .track-icon svg {
          width: 100%;
          height: 100%;
        }
        .sun-icon {
          color: #F59E0B;
        }
        .moon-icon {
          color: #CE93D8;
        }
        :host([theme="dark"]) .sun-icon {
          opacity: 0.45;
          transform: scale(0.85);
        }
        :host([theme="dark"]) .moon-icon {
          opacity: 0.95;
          transform: scale(1);
        }
        :host([theme="light"]) .sun-icon {
          opacity: 1;
          transform: scale(1);
        }
        :host([theme="light"]) .moon-icon {
          opacity: 0.4;
          transform: scale(0.85);
        }
        .thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--switch-thumb-bg, #BA68C8);
          box-shadow: var(--switch-thumb-shadow, 0 2px 6px rgba(0, 0, 0, 0.4));
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, box-shadow 0.3s ease;
        }
        :host([theme="dark"]) .thumb {
          transform: translateX(28px);
          background: linear-gradient(135deg, #BA68C8 0%, #7B1FA2 100%);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5), 0 0 10px rgba(186, 104, 200, 0.5);
        }
        :host([theme="light"]) .thumb {
          transform: translateX(0px);
          background: linear-gradient(135deg, #FFFBEB 0%, #F59E0B 100%);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25), 0 0 8px rgba(245, 158, 11, 0.4);
        }
        .thumb-icon {
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.35s ease, opacity 0.25s ease;
        }
        .thumb-icon svg {
          width: 100%;
          height: 100%;
        }
        :host([theme="dark"]) .thumb-icon {
          color: #FFFFFF;
          transform: rotate(0deg);
        }
        :host([theme="light"]) .thumb-icon {
          color: #78350F;
          transform: rotate(360deg);
        }
      </style>
      <button
        id="btn"
        class="switch-btn"
        role="switch"
        aria-checked="true"
        aria-label="Switch to light mode"
        title="Switch to light mode"
      >
        <div class="track-icons" aria-hidden="true">
          <span class="track-icon sun-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="track-icon moon-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </span>
        </div>
        <div class="thumb" aria-hidden="true">
          <span id="thumbIcon" class="thumb-icon"></span>
        </div>
      </button>
    `;

    const btn = this.shadowRoot.querySelector('#btn');
    btn.addEventListener('click', this.toggleTheme);
    btn.addEventListener('keydown', this._onKeyDown);
    this._updateUI();
  }

  _updateUI() {
    if (!this.shadowRoot) return;
    const isDark = this.theme === 'dark';
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    const btn = this.shadowRoot.querySelector('#btn');
    const thumbIcon = this.shadowRoot.querySelector('#thumbIcon');

    if (btn) {
      btn.setAttribute('aria-checked', isDark ? 'true' : 'false');
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }

    if (thumbIcon) {
      if (isDark) {
        thumbIcon.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        `;
      } else {
        thumbIcon.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 1.5v2m0 17v2M4.58 4.58l1.41 1.41m12.02 12.02 1.41 1.41M1.5 12h2m17 0h2M4.58 19.42l1.41-1.41M18.01 5.99l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `;
      }
    }
  }
}

if (!customElements.get('sar-theme-switch')) {
  customElements.define('sar-theme-switch', SarThemeSwitch);
}
