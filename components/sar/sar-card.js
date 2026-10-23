import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('sar-card')
export class SarCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin: 2px;
      height: 390px;
      width: 280px;
      text-align: center;
      color: var(--sar-card-text-color);
    }
    #cover {
      height: 320px;
      box-sizing: border-box;
      display: inline-block;
    }
    #cover img {
      border: 0;
      height: 320px;
    }
  `;

  @property({ type: Object }) review = null;
  @property({ type: Number }) elevation = 4;

  get $() {
    return {
      cover: this.renderRoot?.querySelector('#cover'),
      title: this.renderRoot?.querySelector('#title'),
    };
  }

  fire(type, detail, options = {}) {
    return this.dispatchEvent(
      new CustomEvent(type, {
        detail,
        bubbles: options.bubbles !== undefined ? options.bubbles : true,
        composed: options.composed !== undefined ? options.composed : true,
        ...options,
      })
    );
  }

  _computeCover(review) {
    if (!review) return '';
    return review.thumbnail || review.cover || '';
  }

  _onClick(event) {
    this.dispatchEvent(
      new CustomEvent('card-click', {
        detail: {
          review: this.review,
          cover: this.$.cover,
          title: this.$.title,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <paper-material
        id="cover"
        .elevation="${this.elevation}"
        elevation="${this.elevation}"
        animated
        @click="${this._onClick}"
      >
        <img src="${this._computeCover(this.review)}">
      </paper-material>
      <div id="title">${this.review?.title ?? ''}</div>
    `;
  }
}
