import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('sar-rating-slider')
export class SarRatingSlider extends LitElement {
  static styles = css`
    :host {
      display: flex;
    }
    #slider {
      margin-top: -7px;
    }
    #ratingText {
      text-align: right;
      margin-right: 12px;
      margin-top: -5px;
    }
    paper-slider {
      --paper-slider-active-color: var(--default-primary-color);
      --paper-slider-knob-color: var(--default-primary-color);
    }
    .horizontal {
      display: flex;
      flex-direction: row;
    }
    .vertical {
      display: flex;
      flex-direction: column;
    }
  `;

  @property({ type: String }) label = 'Rating';
  @property({ type: String }) rating = 'abysmal';
  @property({ type: Number }) ratingNum = 1;
  @property({ type: String }) ratingText = 'abysmal';

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
          <paper-slider
            id="slider"
            min="1"
            max="10"
            .value="${this.ratingNum}"
            snaps
            @value-change="${this._ratingNumChanged}"
            @immediate-value-change="${this._immediateRatingChanged}"
            @change="${this._ratingNumChanged}"
            @input="${this._immediateRatingChanged}"
          ></paper-slider>
          <div id="ratingText">${this.ratingText}</div>
        </div>
      </div>
    `;
  }
}
