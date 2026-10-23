import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';

function dbTitle(title) {
  if (typeof window !== 'undefined' && typeof window.dbTitle === 'function') {
    return window.dbTitle(title);
  }
  return (title || '').replace(/\//g, '');
}

@customElement('sar-review')
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
    }
    #close paper-material {
      border-radius: inherit;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
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

  @property({ type: Object }) review = null;
  @property({ type: Boolean, attribute: 'is-admin' }) isAdmin = false;
  @property({ type: Number }) elevation = 4;
  @property({ type: Object }) keyEventTarget = null;

  constructor() {
    super();
    if (typeof document !== 'undefined') {
      this.keyEventTarget = document.body;
    }
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

  _viewMethodIcon(review) {
    if (!review) return 'av:not-interested';
    if (review.viewMethod === 'dub') {
      return 'av:mic';
    } else if (review.viewMethod === 'sub') {
      return 'av:subtitles';
    } else {
      return 'av:not-interested';
    }
  }

  _showTypeIcon(review) {
    if (!review) return 'av:not-interested';
    if (review.showType === 'series') {
      return 'hardware:tv';
    } else if (review.showType === 'movie') {
      return 'av:movie';
    } else {
      return 'av:not-interested';
    }
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
        <div id="close" @click="${this._onClick}">
          <paper-ripple center></paper-ripple>
          <paper-material elevation="0">
            <iron-icon icon="arrow-back"></iron-icon>
          </paper-material>
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
          <iron-icon id="view_method" icon="${this._viewMethodIcon(review)}"></iron-icon>
          <!-- <iron-icon id="show_type" icon="${this._showTypeIcon(review)}"></iron-icon> -->
          <div class="meta">${review?.rating ?? ''}</div>
          ${genres.map(item => html`<div class="meta">${item}</div>`)}
        </div>
        <section>
          <paper-material id="cover" .elevation="${this.elevation}" elevation="${this.elevation}" animated>
            <img src="${this._computeCover(review)}" @click="${this._onClick}">
          </paper-material>
          <br>
          <div class="article pre">${review?.review ?? ''}</div>
        </section>
      </div>
    `;
  }
}
