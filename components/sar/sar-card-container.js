import { LitElement, html, css } from 'lit';
import { subscribeToReviews, cleanTitle as fbCleanTitle, app } from '../../src/services/firebase.js';

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

function cleanTitle(title) {
  if (typeof window !== 'undefined' && typeof window.cleanTitle === 'function') {
    return window.cleanTitle(title);
  }
  return fbCleanTitle(title);
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
    }
    #header {
      color: silver;
      font-size: 54px;
      font-family: 'PT Sans Narrow', 'Open Sans', Helvetica, Arial, sans-serif;
      align-self: flex-end;
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
      white-space: nowrap;
      height: 168px;
      display: flex;
    }
    .content {
      padding: 0 6%;
      display: flex;
      flex-direction: column;
    }
    #filters {
      margin: 30px 0;
      display: flex;
      flex-wrap: wrap;
    }
    .cards {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
    }
    .horizontal {
      display: flex;
      flex-direction: row;
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
      padding: 0 10px 5px;
      user-select: none;
    }
    .radio-label input[type="radio"] {
      margin: 0 5px 0 0;
      accent-color: var(--default-primary-color, #9C27B0);
      cursor: pointer;
    }
    .toggle-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      cursor: pointer;
      user-select: none;
      margin-bottom: 5px;
    }
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 28px;
      height: 16px;
      margin: 0 6px 0 10px;
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
      background-color: #b0bec5;
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
      background-color: white;
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
    .sliderContainer {
      width: 170px;
    }
    .rating-range-slider {
      height: 2px;
      margin: 6px 0 2px 10px;
      accent-color: var(--default-primary-color, #9C27B0);
      cursor: pointer;
    }
    #minRatingText {
      text-align: right;
      margin-right: 4px;
      margin-top: 2px;
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color, #727272);
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
    }
    .genre-select {
      padding-right: 24px;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6"><polygon points="0,0 10,0 5,6" fill="%23727272"/></svg>');
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
    .genre-select option {
      color: var(--primary-text-color, #212121);
      background: #ffffff;
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

  _immediateMinRatingChanged(e) {
    const slider = e?.target || this.$.minRatingSlider;
    const val = slider ? Number(slider.value) : this.minRating;
    this.minRating = val;
    if (this.ratingValuesInverted?.[val]) {
      this.minRatingText = this.ratingValuesInverted[val];
    }
  }

  _minRatingChanged(e) {
    const slider = e?.target || this.$.minRatingSlider;
    const val = slider ? Number(slider.value) : this.minRating;
    this.minRating = val;
    if (this.ratingValuesInverted?.[val]) {
      this.minRatingText = this.ratingValuesInverted[val];
    }
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
      <div id="scrollContainer" class="scroll-container">
        <div class="paper-header">
          <div id="header">Spoiler Free Anime Reviews</div>
        </div>
        <div class="content">
          <div class="horizontal" id="filters">
            <div class="horizontal">
              <div>Order by</div>
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
            <div class="horizontal">
              <div>Show</div>
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
            <div class="vertical">
              <div class="horizontal">
                <div>Min rating</div>
                <div class="vertical sliderContainer">
                  <input
                    type="range"
                    id="minRatingSlider"
                    class="rating-range-slider"
                    .value="${this.minRating || 1}"
                    min="1"
                    max="10"
                    step="1"
                    @input="${this._immediateMinRatingChanged}"
                    @change="${this._minRatingChanged}"
                  />
                  <div id="minRatingText">${this.minRatingText}</div>
                </div>
              </div>
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
    `;
  }
}

customElements.define('sar-card-container', SarCardContainer);
