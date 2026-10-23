import { LitElement, html, css } from 'lit';

function dbTitle(title) {
  if (typeof window !== 'undefined' && typeof window.dbTitle === 'function') {
    return window.dbTitle(title);
  }
  return (title || '').replace(/\//g, '');
}

export class SarReview extends LitElement {
  static styles = css`
    :host {
      box-sizing: content-box;
      display: flex;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      flex-direction: column;
    }
    #close {
      position: relative;
      color: var(--secondary-text-color);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }
    #close:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }
    #close svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
    img {
      border: 0;
      height: 420px;
    }
    #cover {
      float: right;
      height: 420px;
      box-sizing: border-box;
      margin: 0 0 16px 20px;
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
      display: block;
      border-radius: 2px;
    }
    .title {
      font-size: 28px;
    }
    .row {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: flex-end;
    }
    #edit {
      padding: 4px;
      font-size: 14px;
    }
    #edit a {
      color: var(--secondary-text-color, #727272);
      text-decoration: none;
    }
    #edit a:hover {
      color: var(--default-primary-color, #9C27B0);
      text-decoration: underline;
    }
    .meta {
      margin: 0 5px;
    }
    #view_method {
      height: 16px;
      width: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary-text-color, #727272);
      vertical-align: middle;
      fill: currentColor;
    }
    #show_type {
      height: 16px;
    }
    .paper-header {
      padding: 0 6%;
      white-space: nowrap;
      display: flex;
      flex-direction: row;
    }
    #header {
      color: silver;
      font-size: 32px;
      font-family: 'PT Sans Narrow', 'Open Sans', Helvetica, Arial, sans-serif;
    }
    .content {
      padding: 0 6%;
      margin-top: 48px;
      margin-right: auto;
      margin-left: auto;
      max-width: 720px;
      min-width: 40px;
    }
    .pre {
      white-space: pre-wrap;
    }
  `;

  static properties = {
    review: { type: Object },
    isAdmin: { type: Boolean, attribute: 'is-admin' },
    elevation: { type: Number },
    keyEventTarget: { type: Object },
  };

  constructor() {
    super();
    this.review = null;
    this.isAdmin = false;
    this.elevation = 4;
    this.keyEventTarget = typeof document !== 'undefined' ? document.body : null;
  }

  get $() {
    return {
      close: this.renderRoot?.querySelector('#close'),
      header: this.renderRoot?.querySelector('#header'),
      titlebar: this.renderRoot?.querySelector('#titlebar'),
      cover: this.renderRoot?.querySelector('#cover'),
    };
  }

  get sharedElements() {
    if (this._sharedElements) {
      return this._sharedElements;
    }
    return {
      hero: this.$.cover,
      'hero-header': this.$.header,
    };
  }

  set sharedElements(val) {
    this._sharedElements = val;
  }

  _initAnimationConfig() {
    const article = this.renderRoot?.querySelectorAll('.article');
    const articleArray = article ? Array.from(article) : [];
    return {
      entry: [
        {
          name: 'hero-animation',
          id: 'hero',
          toPage: this,
        },
        {
          name: 'cascaded-animation',
          animation: 'transform-animation',
          nodes: articleArray,
          timing: {
            delay: 100,
          },
        },
        {
          name: 'fade-in-animation',
          node: this.$.close,
        },
        {
          name: 'hero-animation',
          id: 'hero-header',
          toPage: this,
          node: this.$.header,
        },
      ],
      exit: [
        {
          name: 'hero-animation',
          id: 'hero',
          fromPage: this,
        },
        {
          name: 'cascaded-animation',
          animation: 'transform-animation',
          nodes: articleArray,
        },
        {
          name: 'fade-out-animation',
          node: this.$.close,
        },
        {
          name: 'hero-animation',
          id: 'hero-header',
          fromPage: this,
          node: this.$.header,
        },
      ],
    };
  }

  get animationConfig() {
    if (!this._animationConfig) {
      this._animationConfig = this._initAnimationConfig();
    }
    return this._animationConfig;
  }

  set animationConfig(val) {
    this._animationConfig = val;
  }

  _getAnimationConfigRecursive(type, map, allConfigs) {
    if (!this.animationConfig) {
      return;
    }
    const thisConfig = type ? this.animationConfig[type] : this.animationConfig;
    const configs = Array.isArray(thisConfig) ? thisConfig : (thisConfig ? [thisConfig] : []);
    for (const config of configs) {
      if (config.animatable) {
        config.animatable._getAnimationConfigRecursive(config.type || type, map, allConfigs);
      } else if (config.id) {
        const cachedConfig = map[config.id];
        if (cachedConfig) {
          Object.assign(cachedConfig, config);
        } else {
          map[config.id] = { ...config };
        }
      } else {
        allConfigs.push(config);
      }
    }
  }

  getAnimationConfig(type) {
    const map = {};
    const allConfigs = [];
    this._getAnimationConfigRecursive(type, map, allConfigs);
    for (const key in map) {
      allConfigs.push(map[key]);
    }
    return allConfigs;
  }

  firstUpdated(changedProperties) {
    super.firstUpdated?.(changedProperties);
    this._animationConfig = this._initAnimationConfig();

    setTimeout(() => {
      const viewportWidth = window.document.documentElement.clientWidth;
      const maxContentWidth = 720;
      const minContentWidth = 40;
      const padding = 0.06;
      let contentWidth = viewportWidth * (1 - padding * 2);
      if (contentWidth < minContentWidth) {
        contentWidth = minContentWidth;
      } else if (contentWidth > maxContentWidth) {
        contentWidth = maxContentWidth;
      }
      const dist = viewportWidth / 2 + maxContentWidth / 2;
      if (this.animationConfig?.entry?.[1]) {
        this.animationConfig.entry[1].transformFrom = `translateX(-${dist}px)`;
      }
      if (this.animationConfig?.exit?.[1]) {
        this.animationConfig.exit[1].transformTo = `translateX(-${dist}px)`;
      }
    }, 0);
  }

  updated(changedProperties) {
    super.updated?.(changedProperties);
    if (this._animationConfig) {
      const article = this.renderRoot?.querySelectorAll('.article');
      const articleArray = article ? Array.from(article) : [];
      if (this._animationConfig.entry?.[1]) {
        this._animationConfig.entry[1].nodes = articleArray;
      }
      if (this._animationConfig.exit?.[1]) {
        this._animationConfig.exit[1].nodes = articleArray;
      }
    }
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

  _onClick(event) {
    const titlebar = this.$.titlebar;
    if (titlebar) {
      const rect = titlebar.getBoundingClientRect();
      if (this.animationConfig?.entry?.[1]) {
        this.animationConfig.entry[1].transformFrom = `translateX(-${rect.right}px)`;
      }
      if (this.animationConfig?.exit?.[1]) {
        this.animationConfig.exit[1].transformTo = `translateX(-${rect.right}px)`;
      }
    }
    this.fire('exit-click');
  }

  _renderViewMethodIcon(review) {
    if (review?.viewMethod === 'dub') {
      return html`
        <svg id="view_method" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" title="Dub">
          <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
        </svg>
      `;
    } else if (review?.viewMethod === 'sub') {
      return html`
        <svg id="view_method" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" title="Sub">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"/>
        </svg>
      `;
    }
    return html`
      <svg id="view_method" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>
      </svg>
    `;
  }

  _getGenreArray(review) {
    if (!review) return [];
    const genres = review.genres || {};
    return Object.keys(genres);
  }

  _computeCover(review) {
    if (!review) return '';
    return review.cover || review.thumbnail || '';
  }

  _createEditUrl(review) {
    if (!review?.title) return '/edit/';
    return `/edit/${encodeURIComponent(dbTitle(review.title))}`;
  }

  render() {
    const review = this.review;
    const genres = this._getGenreArray(review);

    return html`
      <iron-a11y-keys
        keys="esc"
        .target="${this.keyEventTarget}"
        @keys-pressed="${this._onClick}"
      ></iron-a11y-keys>
      <div class="paper-header">
        <div id="close" @click="${this._onClick}" title="Back">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </div>
        <div id="header">Spoiler Free Anime Reviews</div>
      </div>
      <div class="content">
        <div class="article row" id="titlebar">
          <div class="title">${review?.title ?? ''}</div>
          ${this.isAdmin
            ? html`<div id="edit" class="meta"><a href="${this._createEditUrl(review)}">[ edit ]</a></div>`
            : ''}
        </div>
        <div class="article row">
          ${this._renderViewMethodIcon(review)}
          <div class="meta">${review?.rating ?? ''}</div>
          ${genres.map(item => html`<div class="meta">${item}</div>`)}
        </div>
        <section>
          <div id="cover">
            <img src="${this._computeCover(review)}" @click="${this._onClick}">
          </div>
          <br>
          <div class="article pre">${review?.review ?? ''}</div>
        </section>
      </div>
    `;
  }
}

customElements.define('sar-review', SarReview);
