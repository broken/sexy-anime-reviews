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
      box-sizing: border-box;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    #cover {
      height: 320px;
      box-sizing: border-box;
      display: inline-block;
      cursor: pointer;
      background: var(--card-cover-bg, #fff);
      border-radius: 2px;
      box-shadow: var(--card-shadow, 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4));
      transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s ease;
      touch-action: manipulation;
    }
    #cover:hover {
      box-shadow: var(--card-shadow-hover, 0 8px 17px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19));
    }
    #cover:active {
      transform: scale(0.97);
    }
    #cover img {
      border: 0;
      height: 320px;
      display: block;
      border-radius: 2px;
      object-fit: cover;
    }
    #title {
      font-size: 13px;
      font-weight: 500;
      margin-top: 6px;
      line-height: 1.3;
      padding: 0 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    @media (max-width: 600px) {
      :host {
        width: calc(50% - 6px);
        height: auto;
        margin: 0;
        margin-bottom: 12px;
      }
      #cover {
        width: 100%;
        height: auto;
        aspect-ratio: 2 / 3;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }
      #cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      #title {
        white-space: normal;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        font-size: 13px;
        min-height: 34px;
      }
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
        <img src="${this._computeCover(this.review)}" alt="${this.review?.title ?? ''}" loading="lazy">
      </div>
      <div id="title">${this.review?.title ?? ''}</div>
    `;
  }
}

customElements.define('sar-card', SarCard);
