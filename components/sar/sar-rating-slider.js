import { LitElement, html, css } from 'lit';

export class SarRatingSlider extends LitElement {
  static styles = css`
    :host {
      display: flex;
      touch-action: manipulation;
    }
    #slider {
      margin: 7px 0;
    }
    .slider-label {
      user-select: none;
      white-space: nowrap;
    }
    #ratingText {
      text-align: right;
      margin-right: 10px;
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color, #727272);
      user-select: none;
    }
    .rating-range-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 162px;
      height: 3px;
      background-color: transparent;
      background-image:
        linear-gradient(var(--default-primary-color, #BA68C8), var(--default-primary-color, #BA68C8)),
        linear-gradient(var(--divider-color, #555566), var(--divider-color, #555566)),
        linear-gradient(var(--divider-color, #555566), var(--divider-color, #555566));
      background-size:
        var(--fill-pct, 0%) 100%,
        100% 1px,
        100% 1px;
      background-position:
        left center,
        top left,
        bottom left;
      background-repeat: no-repeat;
      cursor: pointer;
      touch-action: manipulation;
      outline: none;
      border-radius: 2px;
    }
    .rating-range-slider::-webkit-slider-runnable-track {
      background: transparent;
      height: 3px;
    }
    .rating-range-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--default-primary-color, #BA68C8);
      border: 2px solid var(--primary-background-color, #121216);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      cursor: pointer;
      margin-top: -4px;
      transition: transform 0.1s ease, box-shadow 0.1s ease;
    }
    .rating-range-slider:active::-webkit-slider-thumb {
      transform: scale(1.15);
      box-shadow: 0 0 6px var(--default-primary-color, #BA68C8);
    }
    .rating-range-slider::-moz-range-track {
      background: transparent;
      height: 3px;
    }
    .rating-range-slider::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--default-primary-color, #BA68C8);
      border: 2px solid var(--primary-background-color, #121216);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      cursor: pointer;
      transition: transform 0.1s ease, box-shadow 0.1s ease;
    }
    .rating-range-slider:active::-moz-range-thumb {
      transform: scale(1.15);
      box-shadow: 0 0 6px var(--default-primary-color, #BA68C8);
    }
    .horizontal {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
    }
    .vertical {
      display: flex;
      flex-direction: column;
      margin: 0 16px;
      flex: 1;
      max-width: 220px;
    }
    @media (max-width: 768px) {
      .vertical {
        max-width: none;
      }
      .rating-range-slider {
        width: 100%;
      }
    }
  `;

  static properties = {
    label: { type: String },
    rating: { type: String },
    ratingNum: { type: Number },
    ratingText: { type: String },
  };


  static get ratingValues() {
    return {
      epic: 10,
      superb: 9,
      great: 8,
      good: 7,
      fair: 6,
      meh: 5,
      poor: 4,
      bad: 3,
      terrible: 2,
      abysmal: 1,
    };
  }

  static get ratingValuesInverted() {
    return [
      'n/a',
      'abysmal',
      'terrible',
      'bad',
      'poor',
      'meh',
      'fair',
      'good',
      'great',
      'superb',
      'epic',
    ];
  }

  get _ratingValues() {
    return SarRatingSlider.ratingValues;
  }

  get ratingValuesInverted() {
    return SarRatingSlider.ratingValuesInverted;
  }

  get $() {
    return {
      slider: this.renderRoot?.querySelector('#slider'),
      ratingText: this.renderRoot?.querySelector('#ratingText'),
    };
  }

  constructor() {
    super();
    this.label = 'Rating';
    this.rating = 'abysmal';
    this.ratingNum = 1;
    this.ratingText = 'abysmal';
    this._ratingChanged();
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('ratingNum') && !changedProperties.has('rating')) {
      let num = Number(this.ratingNum);
      if (!num || num < 1) num = 1;
      if (num > 10) num = 10;
      this.ratingNum = num;
      this.ratingText = this.ratingValuesInverted[num] || 'abysmal';
      this.rating = this.ratingText;
    } else if (changedProperties.has('rating')) {
      this._ratingChanged();
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('rating') && changedProperties.get('rating') !== undefined) {
      this.dispatchEvent(
        new CustomEvent('rating-changed', {
          detail: { value: this.rating, ratingNum: this.ratingNum },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  _immediateRatingChanged(e) {
    const slider = e?.target || this.$.slider;
    const immediateVal = slider ? Number(slider.immediateValue ?? slider.value) : undefined;
    if (immediateVal !== undefined && this.ratingValuesInverted) {
      this.ratingNum = immediateVal;
      this.ratingText = this.ratingValuesInverted[immediateVal] || '';
      this.rating = this.ratingText;
      // Update fill CSS custom property immediately on drag for real-time responsiveness
      if (slider) {
        const fillPct = `${((immediateVal - 1) / 9) * 100}%`;
        slider.style.setProperty('--fill-pct', fillPct);
      }
    }
  }

  _ratingNumChanged(e) {
    const slider = e?.target || this.$.slider;
    const val = slider ? Number(slider.value) : this.ratingNum;
    if (!val || !this.ratingValuesInverted) {
      return;
    }
    this.ratingNum = val;
    this.ratingText = this.ratingValuesInverted[this.ratingNum] || '';
    this.rating = this.ratingText;
    if (slider) {
      const fillPct = `${((val - 1) / 9) * 100}%`;
      slider.style.setProperty('--fill-pct', fillPct);
    }
  }

  _ratingChanged() {
    this.ratingText = this.rating;
    const num = this._ratingValues[this.rating];
    if (num !== undefined) {
      this.ratingNum = num;
    }
  }

  render() {
    const num = Number(this.ratingNum) || 1;
    const fillPct = `${Math.min(100, Math.max(0, ((num - 1) / 9) * 100))}%`;
    return html`
      <div class="horizontal">
        <div class="slider-label">${this.label}</div>
        <div class="vertical">
          <input
            type="range"
            id="slider"
            class="rating-range-slider"
            style="--fill-pct: ${fillPct}"
            min="1"
            max="10"
            step="1"
            .value="${num}"
            @input="${this._immediateRatingChanged}"
            @change="${this._ratingNumChanged}"
          />
          <div id="ratingText">${this.ratingText}</div>
        </div>
      </div>
    `;
  }
}

customElements.define('sar-rating-slider', SarRatingSlider);
