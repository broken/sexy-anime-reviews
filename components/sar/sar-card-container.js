import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
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

@customElement('sar-card-container')
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
    #paper-scroll-header-panel {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
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
    paper-radio-group {
      margin-top: -2px;
    }
    paper-radio-button {
      padding: 0 10px 5px;
    }
    paper-radio-button::shadow #radioLabel {
      margin-left: 3px;
    }
    paper-toggle-button {
      padding: 0 2px 9px 10px;
      transform: scale(0.72);
      --paper-toggle-button-checked-bar-color: var(--default-primary-color);
      --paper-toggle-button-checked-button-color: var(--default-primary-color);
      --paper-toggle-button-checked-ink-color: var(--default-primary-color);
    }
    paper-toggle-button::shadow #ink {
      top: -2px;
      left: -2px;
      height: 24px;
      width: 24px;
    }
    paper-slider {
      --paper-slider-active-color: var(--default-primary-color);
      --paper-slider-knob-color: var(--default-primary-color);
    }
    .sliderContainer,
    .sliderContainer paper-slider {
      width: 200px;
    }
    #minRatingSlider {
      margin-top: -7px;
    }
    #minRatingText {
      text-align: right;
      margin-right: 12px;
      margin-top: -5px;
    }
    #titleSearch {
      margin-top: -28px;
      --paper-input-container-input: {
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        line-height: inherit;
        color: inherit;
      };
      --paper-input-container-label: {
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        line-height: inherit;
      };
    }
    #genreSearch {
      margin-top: -37px;
      --paper-input-container-input: {
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        line-height: inherit;
        color: inherit;
      };
      --paper-input-container-label: {
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        line-height: inherit;
      };
    }
  `;

  @property({ type: Array }) reviews = [];
  @property({ type: String }) orderBy = 'title';
  @property({ type: Boolean }) showDub = true;
  @property({ type: Boolean }) showSub = true;
  @property({ type: Boolean }) showMovie = true;
  @property({ type: Boolean }) showSeries = true;
  @property({ type: String }) searchString = '';
  @property({ type: String }) searchGenre = '';
  @property({ type: Number }) minRating = 0;
  @property({ type: String }) minRatingText = 'abysmal';
  @property({ type: Array }) genresAndCounts = [];

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
      scrollHeaderPanel: this.renderRoot?.querySelector('#paper-scroll-header-panel'),
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

    this.fire('card-selected', { review: event.detail.review });
  }

  _immediateMinRatingChanged(e) {
    const slider = e?.target || this.$.minRatingSlider;
    const immediateVal = slider ? (slider.immediateValue ?? slider.value) : undefined;
    if (immediateVal !== undefined && this.ratingValuesInverted?.[immediateVal]) {
      this.minRatingText = this.ratingValuesInverted[immediateVal];
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
      <paper-scroll-header-panel id="paper-scroll-header-panel" noReveal no-reveal>
        <div class="paper-header">
          <div id="header">Spoiler Free Anime Reviews</div>
        </div>
        <div class="content">
          <div class="horizontal" id="filters">
            <div class="horizontal">
              <div>Order by</div>
              <paper-radio-group
                class="vertical"
                .selected="${this.orderBy}"
                selected="${this.orderBy}"
                @selected-changed="${(e) => {
                  this.orderBy = e.detail.value ?? e.target.selected ?? 'title';
                }}"
                @iron-select="${(e) => {
                  if (e.target.selected) this.orderBy = e.target.selected;
                }}"
              >
                <paper-radio-button name="title">Title</paper-radio-button>
                <paper-radio-button name="rating">Rating</paper-radio-button>
              </paper-radio-group>
            </div>
            <div class="spacer"></div>
            <div class="horizontal">
              <div>Show</div>
              <div class="vertical">
                <div class="horizontal">
                  <paper-toggle-button
                    ?checked="${this.showDub}"
                    .checked="${this.showDub}"
                    @change="${(e) => {
                      this.showDub = e.target.checked;
                    }}"
                    @checked-changed="${(e) => {
                      this.showDub = e.target.checked;
                    }}"
                  ></paper-toggle-button>
                  <div>Dubs</div>
                </div>
                <div class="horizontal">
                  <paper-toggle-button
                    ?checked="${this.showSub}"
                    .checked="${this.showSub}"
                    @change="${(e) => {
                      this.showSub = e.target.checked;
                    }}"
                    @checked-changed="${(e) => {
                      this.showSub = e.target.checked;
                    }}"
                  ></paper-toggle-button>
                  <div>Subs</div>
                </div>
              </div>
              <div class="vertical">
                <div class="horizontal">
                  <paper-toggle-button
                    ?checked="${this.showMovie}"
                    .checked="${this.showMovie}"
                    @change="${(e) => {
                      this.showMovie = e.target.checked;
                    }}"
                    @checked-changed="${(e) => {
                      this.showMovie = e.target.checked;
                    }}"
                  ></paper-toggle-button>
                  <div>Movies</div>
                </div>
                <div class="horizontal">
                  <paper-toggle-button
                    ?checked="${this.showSeries}"
                    .checked="${this.showSeries}"
                    @change="${(e) => {
                      this.showSeries = e.target.checked;
                    }}"
                    @checked-changed="${(e) => {
                      this.showSeries = e.target.checked;
                    }}"
                  ></paper-toggle-button>
                  <div>Series</div>
                </div>
              </div>
            </div>
            <div class="spacer"></div>
            <div class="vertical">
              <div class="horizontal">
                <div>Min rating</div>
                <div class="vertical sliderContainer">
                  <paper-slider
                    id="minRatingSlider"
                    .value="${this.minRating}"
                    value="${this.minRating}"
                    min="1"
                    max="10"
                    snaps
                    @value-change="${this._minRatingChanged}"
                    @change="${this._minRatingChanged}"
                    @immediate-value-change="${this._immediateMinRatingChanged}"
                    @input="${this._immediateMinRatingChanged}"
                  ></paper-slider>
                  <div id="minRatingText">${this.minRatingText}</div>
                </div>
              </div>
            </div>
            <div class="spacer"></div>
            <paper-input
              id="titleSearch"
              label="Search by title"
              .value="${this.searchString}"
              value="${this.searchString}"
              @value-changed="${(e) => {
                this.searchString = e.detail.value ?? e.target.value ?? '';
              }}"
              @input="${(e) => {
                this.searchString = e.target.value ?? '';
              }}"
            ></paper-input>
            <div class="spacer"></div>
            <paper-dropdown-menu id="genreSearch" label="Search by genre">
              <paper-menu
                attr-for-selected="value"
                .selected="${this.searchGenre}"
                selected="${this.searchGenre}"
                class="dropdown-content"
                @selected-changed="${(e) => {
                  this.searchGenre = e.detail.value ?? e.target.selected ?? '';
                }}"
                @iron-select="${(e) => {
                  if (e.target.selected !== undefined) this.searchGenre = e.target.selected;
                }}"
              >
                ${this.genresAndCounts.map(
                  (item) => html`
                    <paper-item value="${item.genre}">
                      ${this._computeGenreAndCountString(item)}
                    </paper-item>
                  `
                )}
              </paper-menu>
            </paper-dropdown-menu>
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
      </paper-scroll-header-panel>
    `;
  }
}
