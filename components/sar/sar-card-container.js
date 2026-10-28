import { LitElement, html, css } from 'lit';
import { subscribeToReviews, app } from '../../src/services/firebase.js';
import { cleanTitle } from './util.js';
import './sar-rating-slider.js';

const RATING_VALUES = {
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

const RATING_VALUES_INVERTED = [
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

function genreMatch(searchGenre, review) {
  if (!review?.genres) return false;
  const genres = Object.keys(review.genres);
  for (let i = 0; i < genres.length; ++i) {
    if (genres[i] === searchGenre) return true;
  }
  return false;
}

export class SarCardContainer extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      align-items: stretch;
      height: 100%;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      color: var(--primary-text-color);
      touch-action: manipulation;
    }
    #header {
      color: var(--header-title-color, silver);
      font-size: 54px;
      font-family: 'PT Sans Narrow', 'Open Sans', Helvetica, Arial, sans-serif;
      align-self: flex-end;
      line-height: 1.1;
      padding-bottom: 8px;
    }
    .scroll-container {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      overflow-x: hidden;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      box-sizing: border-box;
    }
    .paper-header {
      padding: 0 6%;
      padding-top: env(safe-area-inset-top, 0px);
      white-space: normal;
      height: 168px;
      display: flex;
      box-sizing: border-box;
      align-items: flex-end;
    }
    .content {
      padding: 0 6%;
      padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    #filters {
      margin: 30px 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
    }
    .cards {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
    }
    .horizontal {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .vertical {
      display: flex;
      flex-direction: column;
    }
    .spacer {
      width: 28px;
    }
    .radio-group {
      margin-top: -2px;
    }
    .radio-label {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      padding: 3px 10px;
      user-select: none;
      touch-action: manipulation;
    }
    .radio-label input[type="radio"] {
      margin: 0 5px 0 0;
      accent-color: var(--default-primary-color, #9C27B0);
      cursor: pointer;
      width: 16px;
      height: 16px;
    }
    .filter-label {
      align-self: flex-start;
      user-select: none;
    }
    .toggle-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      cursor: pointer;
      user-select: none;
      margin-bottom: 5px;
      touch-action: manipulation;
    }
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 28px;
      height: 16px;
      margin: 0 6px 0 10px;
      touch-action: manipulation;
    }
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
      margin: 0;
    }
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--toggle-track-off, #b0bec5);
      transition: background-color 0.2s, opacity 0.2s;
      border-radius: 16px;
      opacity: 0.7;
    }
    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 12px;
      width: 12px;
      left: 2px;
      bottom: 2px;
      background-color: var(--toggle-thumb-bg, white);
      transition: transform 0.2s;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
    .toggle-switch input:checked + .toggle-slider {
      background-color: var(--default-primary-color, #9C27B0);
      opacity: 1;
    }
    .toggle-switch input:checked + .toggle-slider:before {
      transform: translateX(12px);
    }
    .toggle-text {
      font-size: 13px;
    }
    .filter-rating {
      display: flex;
      align-items: center;
    }
    .search-input-container,
    .dropdown-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      margin-top: -8px;
    }
    .title-search-input,
    .genre-select {
      font-family: inherit;
      font-size: 13px;
      color: inherit;
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--divider-color, #B6B6B6);
      border-radius: 0;
      padding: 4px 0;
      min-width: 150px;
      outline: none;
      transition: border-color 0.2s;
      touch-action: manipulation;
    }
    .genre-select {
      padding-right: 24px;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: var(--dropdown-arrow, url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6"><polygon points="0,0 10,0 5,6" fill="%23727272"/></svg>'));
      background-repeat: no-repeat;
      background-position: right 6px center;
    }
    .title-search-input:focus,
    .genre-select:focus {
      border-bottom: 2px solid var(--default-primary-color, #9C27B0);
      margin-bottom: -1px;
    }
    .title-search-input::placeholder {
      color: var(--secondary-text-color, #727272);
      opacity: 0.8;
    }
    .genre-select:has(option[value=""]:checked),
    .genre-select:has(option:not([value]):checked) {
      color: var(--secondary-text-color, #727272);
      opacity: 0.8;
    }
    .genre-select option {
      color: var(--primary-text-color, #212121);
      background: var(--dropdown-bg, #ffffff);
    }
    .genre-select option[value=""],
    .genre-select option:not([value]) {
      color: var(--secondary-text-color, #727272);
    }
    @media (max-width: 768px) {
      .paper-header {
        padding: 0 16px;
        padding-top: calc(16px + env(safe-area-inset-top, 0px));
        height: auto;
        min-height: 80px;
        align-items: flex-start;
      }
      #header {
        font-size: clamp(28px, 7.5vw, 42px);
        padding-right: 68px; /* Leave space for floating theme switch */
        padding-bottom: 4px;
        align-self: flex-start;
        word-break: break-word;
      }
      .content {
        padding: 0 12px;
        padding-bottom: calc(32px + env(safe-area-inset-bottom, 0px));
      }
      #filters {
        margin: 16px 0 24px 0;
        gap: 12px 10px;
        align-items: flex-start;
      }
      .spacer {
        display: none;
      }
      .search-input-container,
      .dropdown-container {
        order: 1;
        flex: 1 1 calc(50% - 6px);
        min-width: 135px;
        margin-top: 0;
      }
      .title-search-input,
      .genre-select {
        width: 100%;
        min-width: 0;
        font-size: 16px; /* Prevents auto-zoom on iOS */
        padding: 6px 0;
      }
      .filter-order {
        order: 2;
        flex: 1 1 auto;
      }
      .filter-show {
        order: 3;
        flex: 1 1 auto;
      }
      .filter-rating {
        order: 4;
        flex: 1 1 100%;
        width: 100%;
      }
      .filter-rating sar-rating-slider {
        width: 100%;
      }
      .cards {
        gap: 12px;
        justify-content: space-between;
      }
      .scroll-to-top {
        position: absolute;
        bottom: calc(20px + env(safe-area-inset-bottom, 0px));
        right: calc(16px + env(safe-area-inset-right, 0px));
        width: 44px;
        height: 44px;
      }
      .scroll-to-top svg {
        width: 22px;
        height: 22px;
      }
    }
    .scroll-to-top {
      position: absolute;
      bottom: calc(28px + env(safe-area-inset-bottom, 0px));
      right: calc(28px + env(safe-area-inset-right, 0px));
      z-index: 99;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--card-cover-bg, #1B1B22);
      color: var(--primary-text-color, #F1F1F5);
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
      box-shadow: var(--card-shadow, 0 4px 12px rgba(0, 0, 0, 0.3));
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      outline: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transform: translateY(16px) scale(0.85);
      transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                  transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                  visibility 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                  background-color 0.2s,
                  border-color 0.2s,
                  box-shadow 0.2s,
                  color 0.2s;
    }
    .scroll-to-top.visible {
      opacity: 0.65;
      visibility: visible;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }
    .scroll-to-top:hover {
      opacity: 1;
      color: var(--default-primary-color, #BA68C8);
      border-color: var(--default-primary-color, #BA68C8);
      box-shadow: var(--card-shadow-hover, 0 8px 20px rgba(0, 0, 0, 0.4));
      transform: translateY(-3px) scale(1.05);
    }
    .scroll-to-top:focus-visible {
      outline: 2px solid var(--default-primary-color, #BA68C8);
      outline-offset: 3px;
    }
    .scroll-to-top:active {
      transform: translateY(0) scale(0.95);
    }
    .scroll-to-top svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
      transition: transform 0.2s ease;
    }
    .scroll-to-top:hover svg {
      transform: translateY(-2px);
    }
  `;

  static properties = {
    reviews: { type: Array },
    orderBy: { type: String },
    showDub: { type: Boolean },
    showSub: { type: Boolean },
    showMovie: { type: Boolean },
    showSeries: { type: Boolean },
    searchString: { type: String },
    searchGenre: { type: String },
    minRating: { type: Number },
    minRatingText: { type: String },
    genresAndCounts: { type: Array },
    _showScrollTop: { state: true },
  };

  constructor() {
    super();
    this.reviews = [];
    this.orderBy = 'title';
    this.showDub = true;
    this.showSub = true;
    this.showMovie = true;
    this.showSeries = true;
    this.searchString = '';
    this.searchGenre = '';
    this.minRating = 0;
    this.minRatingText = 'abysmal';
    this.genresAndCounts = [];
    this._showScrollTop = false;
  }

  get ratingValuesInverted() {
    return RATING_VALUES_INVERTED;
  }

  get firebase() {
    return app;
  }

  get $() {
    return {
      header: this.renderRoot?.querySelector('#header'),
      filters: this.renderRoot?.querySelector('#filters'),
      minRatingSlider: this.renderRoot?.querySelector('#minRatingSlider'),
      titleSearch: this.renderRoot?.querySelector('#titleSearch'),
      genreSearch: this.renderRoot?.querySelector('#genreSearch'),
      scrollContainer: this.renderRoot?.querySelector('#scrollContainer') || this.renderRoot?.querySelector('.scroll-container'),
      scrollHeaderPanel: this.renderRoot?.querySelector('#scrollContainer') || this.renderRoot?.querySelector('.scroll-container'),
      scrollToTop: this.renderRoot?.querySelector('#scrollToTop'),
    };
  }

  get sharedElements() {
    if (this._sharedElements) {
      return this._sharedElements;
    }
    return {
      hero: null,
      'hero-header': this.$.header,
    };
  }

  set sharedElements(val) {
    this._sharedElements = val;
  }

  _initAnimationConfig() {
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
        },
        {
          name: 'fade-in-animation',
          timing: {
            delay: 500,
            duration: 100,
          },
        },
        {
          name: 'hero-animation',
          id: 'hero-header',
          toPage: this,
        },
        {
          name: 'fade-in-animation',
          node: this.$.filters,
        },
      ],
      exit: [
        {
          name: 'hero-animation',
          id: 'hero',
          fromPage: this,
          timing: {
            delay: 100,
          },
        },
        {
          name: 'cascaded-animation',
          animation: 'transform-animation',
          nodedelay: 50,
        },
        {
          name: 'fade-out-animation',
          timing: {
            duration: 100,
          },
        },
        {
          name: 'hero-animation',
          id: 'hero-header',
          fromPage: this,
        },
        {
          name: 'fade-out-animation',
          node: this.$.filters,
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

  connectedCallback() {
    super.connectedCallback();
    this._unsubscribeReviews = subscribeToReviews((data) => {
      this.reviews = data ? Object.values(data) : [];
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribeReviews) {
      this._unsubscribeReviews();
      this._unsubscribeReviews = null;
    }
  }

  firstUpdated(changedProperties) {
    super.firstUpdated?.(changedProperties);
    this._animationConfig = this._initAnimationConfig();
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('reviews')) {
      this._updateGenresAndCounts();
    }
  }

  updated(changedProperties) {
    super.updated?.(changedProperties);
    if (this._animationConfig && this.$.filters) {
      if (this._animationConfig.entry?.[4]) {
        this._animationConfig.entry[4].node = this.$.filters;
      }
      if (this._animationConfig.exit?.[4]) {
        this._animationConfig.exit[4].node = this.$.filters;
      }
    }
    if (changedProperties.has('reviews') && window.location.pathname.length > 3) {
      this._domChanged();
    }
    if (
      changedProperties.has('reviews') ||
      changedProperties.has('searchString') ||
      changedProperties.has('searchGenre') ||
      changedProperties.has('minRating') ||
      changedProperties.has('showDub') ||
      changedProperties.has('showSub') ||
      changedProperties.has('showMovie') ||
      changedProperties.has('showSeries')
    ) {
      this._checkScrollPosition();
    }
  }

  _checkScrollPosition() {
    const scrollContainer = this.$.scrollContainer;
    if (scrollContainer) {
      const shouldShow = scrollContainer.scrollTop > 300;
      if (this._showScrollTop !== shouldShow) {
        this._showScrollTop = shouldShow;
      }
    }
  }

  _onScroll(e) {
    const scrollTop = e?.target ? e.target.scrollTop : (this.$.scrollContainer?.scrollTop || 0);
    const shouldShow = scrollTop > 300;
    if (this._showScrollTop !== shouldShow) {
      this._showScrollTop = shouldShow;
    }
  }

  _scrollToTop() {
    const scrollContainer = this.$.scrollContainer;
    if (scrollContainer) {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scrollContainer.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  }

  _updateGenresAndCounts() {
    const tags = {};
    if (Array.isArray(this.reviews)) {
      for (const review of this.reviews) {
        const genres = review?.genres;
        if (genres) {
          for (const genre in genres) {
            tags[genre] = tags[genre] ? tags[genre] + 1 : 1;
          }
        }
      }
    }
    const genresAndCounts = [];
    for (const key in tags) {
      genresAndCounts.push({ genre: key, count: tags[key] });
    }
    genresAndCounts.unshift({ genre: '', count: genresAndCounts.length });
    this.genresAndCounts = genresAndCounts.sort((a, b) => {
      if (a.genre < b.genre) return -1;
      if (a.genre > b.genre) return 1;
      return 0;
    });
  }

  _domChanged() {
    if (window.location.pathname.length > 3) {
      setTimeout(() => this.selectCard(), 0);
    }
  }

  selectCard() {
    const title = window.location.pathname.substr(3);
    if (!title) return;
    const card =
      this.renderRoot?.getElementById(title) ||
      this.renderRoot?.querySelector('#' + CSS.escape(title));
    if (card) {
      // Delay to ensure rendering is complete before triggering shared element animation
      setTimeout(() => {
        if (card.$?.cover) {
          card.$.cover.click();
        } else {
          card.click();
        }
      }, 300);
    }
  }

  _isNodeInViewport(node) {
    const rect = node.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.document.documentElement.clientHeight;
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

  _onCardClick(event) {
    const target = event.target?.closest?.('sar-card') || event.target;
    this.sharedElements = {
      hero: event.detail.cover,
      'hero-header': this.$.header,
    };
    const nodesToExit = [];
    const cards = this.renderRoot?.querySelectorAll('sar-card') || [];
    let farthestDistance = 0;
    const viewportHeight = window.document.documentElement.clientHeight;
    for (const node of cards) {
      if (node !== target && this._isNodeInViewport(node)) {
        nodesToExit.push(node);
        const d = viewportHeight - node.getBoundingClientRect().top;
        farthestDistance = d > farthestDistance ? d : farthestDistance;
      }
    }
    if (this.animationConfig?.entry?.[1]) {
      this.animationConfig.entry[1].transformFrom = `translateY(${farthestDistance}px)`;
      this.animationConfig.entry[1].nodes = nodesToExit;
    }
    if (this.animationConfig?.exit?.[1]) {
      this.animationConfig.exit[1].transformTo = `translateY(${farthestDistance}px)`;
      this.animationConfig.exit[1].nodes = nodesToExit;
    }
    if (this.animationConfig?.entry?.[2]) {
      this.animationConfig.entry[2].node = event.detail.title;
    }
    if (this.animationConfig?.exit?.[2]) {
      this.animationConfig.exit[2].node = event.detail.title;
    }

    this.fire('card-selected', {
      review: event.detail.review,
      cover: event.detail.cover,
      card: target,
    });
  }

  _cleanTitle(title) {
    return cleanTitle(title);
  }

  _computeGenreAndCountString(item) {
    if (!item?.genre) return '';
    return `${item.genre} (${item.count})`;
  }

  get filteredReviews() {
    if (!this.reviews || !this.reviews.length) {
      return [];
    }
    const showDub = this.showDub;
    const showSub = this.showSub;
    const showMovie = this.showMovie;
    const showSeries = this.showSeries;
    const minRating = this.minRating;
    const searchString = this.searchString;
    const searchGenre = this.searchGenre;

    const filtered = this.reviews.filter((x) => {
      if (!showDub && x.viewMethod === 'dub') return false;
      if (!showSub && x.viewMethod === 'sub') return false;
      if (!showMovie && x.showType === 'movie') return false;
      if (!showSeries && x.showType === 'series') return false;
      if (minRating > (RATING_VALUES[x.rating] || 0)) return false;
      if (searchString && !(x.title || '').toLowerCase().includes(searchString.toLowerCase())) return false;
      if (searchGenre && !genreMatch(searchGenre, x)) return false;
      return true;
    });

    const sortFn =
      this.orderBy === 'rating'
        ? (a, b) => (RATING_VALUES[b.rating] || 0) - (RATING_VALUES[a.rating] || 0)
        : (a, b) => (a.title || '').localeCompare(b.title || '');

    return filtered.sort(sortFn);
  }

  render() {
    return html`
      <div id="scrollContainer" class="scroll-container" @scroll="${this._onScroll}">
        <div class="paper-header">
          <div id="header">Spoiler Free Anime Reviews</div>
        </div>
        <div class="content">
          <div class="horizontal" id="filters">
            <div class="horizontal filter-order">
              <div class="filter-label">Order by</div>
              <div class="vertical radio-group" role="radiogroup">
                <label class="radio-label">
                  <input
                    type="radio"
                    name="orderBy"
                    value="title"
                    .checked="${this.orderBy === 'title'}"
                    @change="${() => {
        this.orderBy = 'title';
      }}"
                  />
                  <span>Title</span>
                </label>
                <label class="radio-label">
                  <input
                    type="radio"
                    name="orderBy"
                    value="rating"
                    .checked="${this.orderBy === 'rating'}"
                    @change="${() => {
        this.orderBy = 'rating';
      }}"
                  />
                  <span>Rating</span>
                </label>
              </div>
            </div>
            <div class="spacer"></div>
            <div class="horizontal filter-show">
              <div class="filter-label">Filter</div>
              <div class="vertical">
                <label class="toggle-row">
                  <span class="toggle-switch">
                    <input
                      type="checkbox"
                      .checked="${this.showDub}"
                      @change="${(e) => {
        this.showDub = e.target.checked;
      }}"
                    />
                    <span class="toggle-slider"></span>
                  </span>
                  <span class="toggle-text">Dubs</span>
                </label>
                <label class="toggle-row">
                  <span class="toggle-switch">
                    <input
                      type="checkbox"
                      .checked="${this.showSub}"
                      @change="${(e) => {
        this.showSub = e.target.checked;
      }}"
                    />
                    <span class="toggle-slider"></span>
                  </span>
                  <span class="toggle-text">Subs</span>
                </label>
              </div>
              <div class="vertical">
                <label class="toggle-row">
                  <span class="toggle-switch">
                    <input
                      type="checkbox"
                      .checked="${this.showMovie}"
                      @change="${(e) => {
        this.showMovie = e.target.checked;
      }}"
                    />
                    <span class="toggle-slider"></span>
                  </span>
                  <span class="toggle-text">Movies</span>
                </label>
                <label class="toggle-row">
                  <span class="toggle-switch">
                    <input
                      type="checkbox"
                      .checked="${this.showSeries}"
                      @change="${(e) => {
        this.showSeries = e.target.checked;
      }}"
                    />
                    <span class="toggle-slider"></span>
                  </span>
                  <span class="toggle-text">Series</span>
                </label>
              </div>
            </div>
            <div class="spacer"></div>
            <div class="filter-rating">
              <sar-rating-slider
                id="minRatingSlider"
                label="Min rating"
                .ratingNum="${this.minRating || 1}"
                @rating-changed="${(e) => {
        this.minRating = e.detail.ratingNum ?? (RATING_VALUES[e.detail.value] || 1);
      }}"
              ></sar-rating-slider>
            </div>
            <div class="spacer"></div>
            <div class="search-input-container">
              <input
                type="text"
                id="titleSearch"
                class="title-search-input"
                placeholder="Search by title"
                aria-label="Search by title"
                .value="${this.searchString || ''}"
                @input="${(e) => {
        this.searchString = e.target.value;
      }}"
              />
            </div>
            <div class="spacer"></div>
            <div class="dropdown-container">
              <select
                id="genreSearch"
                class="genre-select"
                aria-label="Search by genre"
                .value="${this.searchGenre}"
                @change="${(e) => {
        this.searchGenre = e.target.value;
      }}"
              >
                ${this.genresAndCounts.map(
        (item) => html`
                    <option value="${item.genre}" ?selected="${this.searchGenre === item.genre}">
                      ${item.genre ? this._computeGenreAndCountString(item) : 'Search by genre'}
                    </option>
                  `
      )}
              </select>
            </div>
          </div>
          <div class="cards">
            ${this.filteredReviews.map(
        (item) => html`
                <sar-card
                  .review="${item}"
                  @card-click="${this._onCardClick}"
                  id="${this._cleanTitle(item.title)}"
                ></sar-card>
              `
      )}
          </div>
        </div>
      </div>
      <button
        id="scrollToTop"
        type="button"
        class="scroll-to-top ${this._showScrollTop ? 'visible' : ''}"
        @click="${this._scrollToTop}"
        aria-label="Scroll to top"
        title="Scroll to top"
        tabindex="${this._showScrollTop ? '0' : '-1'}"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
          <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
        </svg>
      </button>
    `;
  }
}

customElements.define('sar-card-container', SarCardContainer);
