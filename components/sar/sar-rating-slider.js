import { LitElement, html, css } from 'lit';

export class SarRatingSlider extends LitElement {
  static styles = css`
    :host {
      display: flex;
    }
    #slider {
      margin: 7px;
    }
    #ratingText {
      text-align: right;
      margin-right: 10px;
    }
    .rating-range-slider {
      width: 162px;
      height: 2px;
      accent-color: var(--default-primary-color, #9C27B0);
      cursor: pointer;
    }
    .horizontal {
      display: flex;
      flex-direction: row;
    }
    .vertical {
      display: flex;
      flex-direction: column;
      margin: 0 16px;
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
    if (changedProperties.has('rating')) {
      this._ratingChanged();
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('rating') && changedProperties.get('rating') !== undefined) {
      this.dispatchEvent(
        new CustomEvent('rating-changed', {
          detail: { value: this.rating },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  _immediateRatingChanged(e) {
    window.console.log('_immediateRatingChanged');
    const slider = e?.target || this.$.slider;
    const immediateVal = slider ? (slider.immediateValue ?? slider.value) : undefined;
    if (immediateVal !== undefined && this.ratingValuesInverted) {
      this.ratingText = this.ratingValuesInverted[immediateVal] || '';
    }
  }

  _ratingNumChanged(e) {
    window.console.log('_ratingNumChanged');
    const slider = e?.target || this.$.slider;
    const val = slider ? Number(slider.value) : this.ratingNum;
    if (!val || !this.ratingValuesInverted) {
      return;
    }
    this.ratingNum = val;
    this.ratingText = this.ratingValuesInverted[this.ratingNum] || '';
    this.rating = this.ratingText;
  }

  _ratingChanged() {
    window.console.log('_ratingChanged');
    this.ratingText = this.rating;
    const num = this._ratingValues[this.rating];
    if (num !== undefined) {
      this.ratingNum = num;
    }
  }

  render() {
    return html`
      <div class="horizontal">
        <div>${this.label}</div>
        <div class="vertical">
          <input
            type="range"
            id="slider"
            class="rating-range-slider"
            min="1"
            max="10"
            step="1"
            .value="${this.ratingNum}"
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
