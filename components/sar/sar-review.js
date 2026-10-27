import { LitElement, html, css } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import { parseSpoilers, dbTitle, splitReview } from './util.js';
import { articleStyles } from './article-styles.js';

export class SarReview extends LitElement {
  static styles = [
    articleStyles,
    css`
    :host {
      box-sizing: border-box;
      display: flex;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      flex-direction: column;
      color: var(--primary-text-color);
      overflow-x: hidden;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-y: contain;
      touch-action: manipulation;
    }
    section {
      margin-top: 20px;
    }
    #close {
      position: relative;
      color: var(--secondary-text-color);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s, transform 0.15s ease;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      margin-right: 8px;
    }
    #close:hover {
      background-color: var(--hover-overlay, rgba(0, 0, 0, 0.08));
    }
    #close:active {
      transform: scale(0.92);
    }
    #close svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
    img {
      border: 0;
      height: 640px;
    }
    #cover {
      position: relative;
      z-index: 2;
      float: right;
      box-sizing: border-box;
      margin: 0 0 16px 20px;
      cursor: pointer;
      background: var(--card-cover-bg, #fff);
      border-radius: 2px;
      box-shadow: var(--card-shadow, 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4));
      transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #cover:hover {
      box-shadow: var(--card-shadow-hover, 0 8px 17px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19));
    }
    #cover img {
      display: block;
      border-radius: 2px;
    }
    .title {
      font-size: 28px;
      color: var(--primary-text-color);
      font-weight: 600;
      line-height: 1.25;
      word-break: break-word;
    }
    .row {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
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
      color: var(--secondary-text-color, #727272);
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
      padding-top: env(safe-area-inset-top, 0px);
      white-space: normal;
      display: flex;
      flex-direction: row;
      align-items: center;
      min-height: 64px;
      box-sizing: border-box;
    }
    #header {
      color: var(--header-title-color, silver);
      font-size: 32px;
      font-family: 'PT Sans Narrow', 'Open Sans', Helvetica, Arial, sans-serif;
      line-height: 1.1;
      word-break: break-word;
    }
    .content {
      padding: 0 6%;
      padding-bottom: calc(48px + env(safe-area-inset-bottom, 0px));
      margin-top: 48px;
      margin-right: auto;
      margin-left: auto;
      max-width: 1024px;
      min-width: 40px;
      box-sizing: border-box;
      width: 100%;
    @media (max-width: 680px) {
      .paper-header {
        padding: 8px 16px;
        padding-top: calc(8px + env(safe-area-inset-top, 0px));
        min-height: 56px;
      }
      #header {
        font-size: clamp(20px, 5.5vw, 26px);
        padding-right: 64px; /* Space for theme switcher */
      }
      .content {
        padding: 0 16px;
        padding-bottom: calc(48px + env(safe-area-inset-bottom, 0px));
        margin-top: 16px;
      }
      .title {
        font-size: clamp(22px, 6vw, 28px);
      }
      #cover {
        float: none;
        display: block;
        margin: 16px auto 20px auto;
        text-align: center;
      }
      #cover img {
        width: 100%;
        height: auto;
        object-fit: contain;
        display: block;
        margin: 0 auto;
      }
      .row {
        gap: 6px;
      }
    }
  `];

  static properties = {
    review: { type: Object },
    isAdmin: { type: Boolean, attribute: 'is-admin' },
    elevation: { type: Number },
    keyEventTarget: { type: Object },
    _loadedCoverSrc: { state: true },
  };

  constructor() {
    super();
    this.review = null;
    this.isAdmin = false;
    this.elevation = 4;
    this.keyEventTarget = typeof document !== 'undefined' ? document.body : null;
    this._revealedSpoilers = new Set();
    this._loadedCoverSrc = null;
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

  willUpdate(changedProperties) {
    super.willUpdate?.(changedProperties);
    if (changedProperties.has('review')) {
      this._revealedSpoilers.clear();
      this._loadedCoverSrc = null;
      this._preloadHighResCover();
    }
  }

  _preloadHighResCover() {
    const review = this.review;
    if (!review) return;
    const initialCover = review.thumbnail || review.cover || '';
    const highResCover = review.cover;
    if (highResCover && highResCover !== initialCover) {
      const img = new Image();
      img.src = highResCover;
      const onLoaded = () => {
        if (this.review === review && this.review?.cover === highResCover) {
          this._loadedCoverSrc = highResCover;
        }
      };
      if (typeof img.decode === 'function') {
        img.decode().then(onLoaded).catch(onLoaded);
      } else {
        img.onload = onLoaded;
      }
    }
  }

  updated(changedProperties) {
    super.updated?.(changedProperties);
    if (changedProperties.has('review')) {
      this._revealedSpoilers.clear();
    }
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
    if (this._loadedCoverSrc && this.review?.cover === this._loadedCoverSrc) {
      return this._loadedCoverSrc;
    }
    return review.thumbnail || review.cover || '';
  }

  _createEditUrl(review) {
    if (!review?.title) return '/edit/';
    return `/edit/${encodeURIComponent(dbTitle(review.title))}`;
  }

  _toggleSpoiler(index, event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    const next = new Set(this._revealedSpoilers);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    this._revealedSpoilers = next;
    this.requestUpdate();
  }

  _onSpoilerKeyDown(index, event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._toggleSpoiler(index, event);
    }
  }

  _renderParts(parts) {
    if (!parts || !parts.length) return '';
    return parts.map((part) => {
      if (part.type === 'text') {
        return part.content;
      }
      const isRevealed = this._revealedSpoilers?.has(part.index);
      return html`<span
        class="spoiler ${isRevealed ? 'revealed' : ''}"
        role="button"
        tabindex="0"
        aria-expanded="${isRevealed ? 'true' : 'false'}"
        aria-label="${isRevealed ? 'Revealed spoiler' : 'Spoiler, click to reveal'}"
        title="${isRevealed ? 'Spoiler (click to hide)' : 'Spoiler (click to reveal)'}"
        @click="${(e) => this._toggleSpoiler(part.index, e)}"
        @keydown="${(e) => this._onSpoilerKeyDown(part.index, e)}"
      >${part.content}</span>`;
    });
  }

  _renderReviewContent(content) {
    if (!content) return '';
    const { synopsis, body } = splitReview(content);
    if (!synopsis) {
      const parts = parseSpoilers(body);
      return html`<div class="review-body">${this._renderParts(parts)}</div>`;
    }
    const synopsisParts = parseSpoilers(synopsis, 0);
    const spoilerCountInSynopsis = synopsisParts.filter((p) => p.type === 'spoiler').length;
    const bodyParts = parseSpoilers(body, spoilerCountInSynopsis);

    return html`<div class="synopsis pre" aria-label="Synopsis"><div class="synopsis-label">Synopsis</div><div class="synopsis-text">${this._renderParts(synopsisParts)}</div></div><div class="review-body">${this._renderParts(bodyParts)}</div>`;
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
        <div id="close" role="button" tabindex="0" aria-label="Back to reviews" @click="${this._onClick}" title="Back">
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
          <div class="meta">${review?.rating ?? ''}</div>
          ${this._renderViewMethodIcon(review)}
          ${genres.map(item => html`<div class="meta">${item}</div>`)}
        </div>
        <section>
          <div id="cover">
            ${review
        ? keyed(
          review.title || 'empty',
          html`<img
                    src="${this._computeCover(review)}"
                    alt="${review?.title ?? ''}"
                    @click="${this._onClick}"
                  >`
        )
        : ''}
          </div>
          <div class="article">${this._renderReviewContent(review?.review)}</div>
        </section>
      </div>
    `;
  }
}

customElements.define('sar-review', SarReview);
