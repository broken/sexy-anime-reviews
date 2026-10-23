import { LitElement, html, css } from 'lit';

export class SarCard extends LitElement {
  static properties = {
    review: { type: Object },
    elevation: { type: Number },
  };

  constructor() {
    super();
    this.review = null;
    this.elevation = 4;
  }

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
      cursor: pointer;
      background: #fff;
      border-radius: 2px;
      box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
      transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #cover:hover {
      box-shadow: 0 8px 17px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    }
    #cover img {
      border: 0;
      height: 320px;
      display: block;
      border-radius: 2px;
    }
  `;

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
      <div
        id="cover"
        @click="${this._onClick}"
      >
        <img src="${this._computeCover(this.review)}">
      </div>
      <div id="title">${this.review?.title ?? ''}</div>
    `;
  }
}

customElements.define('sar-card', SarCard);
