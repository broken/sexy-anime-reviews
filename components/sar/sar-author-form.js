import { LitElement, html, css } from 'lit';
import './sar-rating-slider.js';
import { cleanTitle, dbTitle } from './util.js';
import {
  subscribeToReviews,
  saveReview,
  uploadCover,
  uploadThumbnail,
  signInWithGoogle,
  app,
} from '../../src/services/firebase.js';

export class SarAuthorForm extends LitElement {
  static styles = css`
    :host {
      justify-content: center;
      color: var(--primary-text-color);
      touch-action: manipulation;
    }
    .paper-header {
      white-space: normal;
      display: flex;
      padding-top: env(safe-area-inset-top, 0px);
      align-items: center;
      min-height: 60px;
    }
    #header {
      color: var(--header-title-color, silver);
      font-size: 32px;
      font-family: 'PT Sans Narrow', 'Open Sans', Helvetica, Arial, sans-serif;
      line-height: 1.1;
      word-break: break-word;
    }
    #card {
      background: var(--card-cover-bg, #fff);
      border-radius: 2px;
      box-shadow: var(--card-shadow, 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4));
      padding: 20px 48px 40px;
      margin-bottom: 48px;
    }
    .horizontal {
      display: flex;
      flex-direction: row;
    }
    .vertical {
      display: flex;
      flex-direction: column;
    }
    .reverse {
      display: flex;
      flex-direction: row-reverse;
    }
    button {
      background: var(--accent-color, #03A9F4);
      color: var(--text-primary-color, #FFFFFF);
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 16px;
      min-height: 40px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      user-select: none;
      outline: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
      transition: background-color 0.2s, box-shadow 0.2s, opacity 0.2s;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    button:hover:not(:disabled) {
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4);
      filter: brightness(1.05);
    }
    button:active:not(:disabled) {
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }
    .radio-label {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      padding: 12px;
      user-select: none;
    }
    .radio-label input[type="radio"] {
      margin: 0 5px 0 0;
      accent-color: var(--default-primary-color, #9C27B0);
      cursor: pointer;
    }
    .autofill-box {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 16px 20px;
      margin-top: 10px;
      margin-bottom: 24px;
    }
    .autofill-title {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #aaa;
      margin-bottom: 6px;
    }
    .autofill-row {
      display: flex;
      align-items: flex-end;
      gap: 16px;
    }
    .autofill-input,
    .title-input,
    .review-textarea {
      font-family: inherit;
      font-size: 13px;
      color: var(--primary-text-color, #212121);
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--divider-color, #B6B6B6);
      border-radius: 0;
      padding: 8px 0;
      outline: none;
      transition: border-color 0.2s;
    }
    .autofill-input {
      flex: 1;
    }
    .input-container {
      position: relative;
      display: flex;
      margin: 16px 0;
    }
    .title-input {
      width: 100%;
      box-sizing: border-box;
    }
    .review-textarea {
      width: 100%;
      box-sizing: border-box;
      resize: vertical;
      min-height: 100px;
      line-height: 1.5;
    }
    .autofill-input:focus,
    .title-input:focus,
    .review-textarea:focus {
      border-bottom: 2px solid var(--default-primary-color, #9C27B0);
      margin-bottom: -1px;
    }
    .autofill-input::placeholder,
    .title-input::placeholder,
    .review-textarea::placeholder {
      color: var(--secondary-text-color, #727272);
      opacity: 0.8;
    }
    .results-list {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 260px;
      overflow-y: auto;
    }
    .result-card {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.15s ease-in-out;
    }
    .result-card:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    .result-thumb {
      width: 44px;
      height: 62px;
      object-fit: cover;
      border-radius: 3px;
      margin-right: 14px;
      background: #222;
      flex-shrink: 0;
    }
    .result-info {
      flex: 1;
      min-width: 0;
    }
    .result-name {
      font-weight: 600;
      color: #fff;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .result-meta {
      font-size: 12px;
      color: #999;
      margin-top: 3px;
    }
    .cover-section {
      margin: 16px 0;
      padding: 16px;
      background: rgba(0, 0, 0, 0.15);
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    .image-preview-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .image-preview-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #aaa;
    }
    .cover-preview-img {
      height: 420px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      flex-shrink: 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .thumb-preview-img {
      height: 320px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      flex-shrink: 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .cover-actions {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .cover-action-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .cover-status {
      font-size: 12px;
      color: #8bc34a;
      font-weight: 500;
    }
    .toast {
      position: fixed;
      bottom: 16px;
      left: 16px;
      background-color: #323232;
      color: #f1f1f1;
      min-height: 48px;
      min-width: 288px;
      padding: 16px 24px;
      box-sizing: border-box;
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
      border-radius: 2px;
      font-size: 14px;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transform: translateY(100px);
      transition: transform 0.3s cubic-bezier(0, 0, 0.2, 1), opacity 0.3s, visibility 0.3s;
      pointer-events: none;
    }
    .toast.opened {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
      pointer-events: auto;
    }
    .genres-container {
      position: relative;
      margin: 16px 0;
    }
    .genres-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color, #727272);
      margin-bottom: 6px;
    }
    .genres-wrapper {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      min-height: 36px;
      border-bottom: 1px solid var(--divider-color, #B6B6B6);
      padding: 4px 0 6px 0;
      transition: border-color 0.2s;
    }
    .genres-wrapper:focus-within {
      border-bottom: 2px solid var(--default-primary-color, #9C27B0);
      margin-bottom: -1px;
    }
    .genre-chip {
      display: inline-flex;
      align-items: center;
      background: rgba(156, 39, 176, 0.15);
      border: 1px solid rgba(156, 39, 176, 0.35);
      color: var(--default-primary-color, #9C27B0);
      padding: 2px 8px 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      gap: 4px;
      user-select: none;
    }
    button.genre-chip-remove {
      background: transparent;
      color: inherit;
      box-shadow: none;
      padding: 0 2px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      min-width: unset;
      letter-spacing: normal;
      text-transform: none;
      opacity: 0.7;
      cursor: pointer;
    }
    button.genre-chip-remove:hover {
      background: rgba(156, 39, 176, 0.2);
      box-shadow: none;
      opacity: 1;
      filter: none;
    }
    .genre-input {
      flex: 1;
      min-width: 140px;
      border: none;
      background: transparent;
      outline: none;
      font-family: inherit;
      font-size: 13px;
      color: var(--primary-text-color, #212121);
      padding: 4px 0;
    }
    .genre-input::placeholder {
      color: var(--secondary-text-color, #727272);
      opacity: 0.8;
    }
    .genre-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--dropdown-bg, #ffffff);
      border: 1px solid var(--divider-color, #B6B6B6);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
      max-height: 160px;
      overflow-y: auto;
      z-index: 100;
      margin-top: 4px;
      padding: 4px 0;
    }
    .genre-suggestion-item {
      padding: 8px 12px;
      cursor: pointer;
      font-size: 13px;
      color: var(--primary-text-color, #212121);
      transition: background 0.15s;
    }
    .genre-suggestion-item:hover {
      background: rgba(156, 39, 176, 0.08);
      color: var(--default-primary-color, #9C27B0);
    }
    @media (max-width: 600px) {
      .paper-header {
        min-height: 52px;
        margin-bottom: 8px;
      }
      #header {
        font-size: clamp(22px, 6.5vw, 28px);
        padding-right: 64px;
      }
      #card {
        padding: 20px 16px 32px;
        margin-bottom: 32px;
      }
      .autofill-box {
        padding: 12px 14px;
      }
      .autofill-row {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
      .autofill-row button {
        width: 100%;
        min-height: 44px;
      }
      .autofill-input,
      .title-input,
      .review-textarea,
      .genre-input {
        font-size: 16px; /* Prevents auto-zoom on iOS */
      }
      .cover-section {
        flex-direction: column;
        align-items: stretch;
        padding: 14px;
        gap: 16px;
      }
      .cover-preview-img,
      .thumb-preview-img {
        max-width: 100%;
        height: auto;
        max-height: 260px;
        object-fit: contain;
      }
      .cover-actions {
        width: 100%;
      }
      .cover-actions button {
        width: 100%;
        min-height: 44px;
      }
      .radio-group {
        flex-wrap: wrap;
      }
      .radio-label {
        padding: 10px 12px;
        min-height: 44px;
      }
      .reverse button {
        width: 100%;
        min-height: 48px;
      }
      .toast {
        left: 12px;
        right: 12px;
        min-width: auto;
        bottom: calc(12px + env(safe-area-inset-bottom, 0px));
      }
    }
  `;

  static properties = {
    title: { type: String },
    rating: { type: String },
    cover: { type: String },
    coverImg: { type: Object },
    thumbnail: { type: String },
    thumbnailImg: { type: Object },
    previewCover: { type: String },
    previewThumbnail: { type: String },
    searchQuery: { type: String },
    isSearching: { type: Boolean },
    searchResults: { type: Array },
    genres: { type: Array },
    viewMethod: { type: String },
    showType: { type: String },
    review: { type: String },
    reviews: { type: Object },
    tags: { type: Array },
    route: { type: Object },
    routeData: { type: Object },
    toastText: { type: String },
    toastOpened: { type: Boolean },
    genreInputValue: { type: String },
    genreSuggestions: { type: Array },
  };

  constructor() {
    super();
    this.title = '';
    this.rating = '';
    this.cover = '';
    this.coverImg = null;
    this.thumbnail = '';
    this.thumbnailImg = null;
    this.previewCover = '';
    this.previewThumbnail = '';
    this.searchQuery = '';
    this.isSearching = false;
    this.searchResults = [];
    this.genres = [];
    this.viewMethod = '';
    this.showType = 'series';
    this.review = '';
    this.reviews = {};
    this.tags = [];
    this.route = {};
    this.routeData = {};
    this._loadedRouteName = null;
    this.toastText = '';
    this.toastOpened = false;
    this._toastTimer = null;
    this.genreInputValue = '';
    this.genreSuggestions = [];
  }

  showToast(text, duration = 3000) {
    if (text) this.toastText = text;
    this.toastOpened = true;
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toastOpened = false;
    }, duration);
  }

  _addGenre(genre) {
    const val = (genre || '').trim().toLowerCase();
    if (!val) return;
    const current = this.genres || [];
    if (!current.includes(val)) {
      this.genres = [...current, val];
    }
    this.genreInputValue = '';
    this.genreSuggestions = [];
    const inputEl = this.renderRoot?.querySelector('.genre-input');
    if (inputEl) inputEl.value = '';
  }

  _removeGenre(genre) {
    this.genres = (this.genres || []).filter((g) => g !== genre);
  }

  _onGenreKeydown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      this._addGenre(e.target.value);
    } else if (e.key === 'Backspace' && !e.target.value && this.genres?.length) {
      this._removeGenre(this.genres[this.genres.length - 1]);
    }
  }

  _onGenreInput(e) {
    const val = e.target.value;
    if (val.includes(',')) {
      const parts = val.split(',');
      parts.forEach((p) => {
        if (p.trim()) this._addGenre(p);
      });
      e.target.value = '';
      this.genreInputValue = '';
      this.genreSuggestions = [];
      return;
    }
    this.genreInputValue = val;
    const input = val.trim().toLowerCase();
    if (input) {
      const current = this.genres || [];
      this.genreSuggestions = (this.tags || []).filter((tag) => {
        return tag.toLowerCase().indexOf(input) === 0 && !current.includes(tag.toLowerCase());
      });
    } else {
      this.genreSuggestions = [];
    }
  }

  _onGenreBlur() {
    setTimeout(() => {
      this.genreSuggestions = [];
    }, 200);
  }

  get firebase() {
    return app;
  }

  get $() {
    const toastEl = this.renderRoot?.querySelector('#toast');
    if (toastEl && !toastEl._enhanced) {
      toastEl._enhanced = true;
      Object.defineProperty(toastEl, 'text', {
        get: () => this.toastText,
        set: (val) => {
          this.toastText = val;
        },
      });
      toastEl.show = (msg) => this.showToast(msg || this.toastText);
      toastEl.hide = () => {
        this.toastOpened = false;
      };
    }
    const genresSelectEl = this.renderRoot?.querySelector('#genresSelect');
    if (genresSelectEl && !genresSelectEl._enhanced) {
      genresSelectEl._enhanced = true;
      Object.defineProperty(genresSelectEl, 'bindValue', {
        get: () => this.genres,
        set: (val) => {
          this.genres = Array.isArray(val) ? val : [];
        },
      });
    }
    return {
      card: this.renderRoot?.querySelector('#card'),
      toast: toastEl,
      auth: this.renderRoot?.querySelector('#auth'),
      coverFileInput: this.renderRoot?.querySelector('#coverFileInput'),
      thumbnailFileInput: this.renderRoot?.querySelector('#thumbnailFileInput'),
      genresSelect: genresSelectEl,
    };
  }

  $$(selector) {
    return this.renderRoot?.querySelector(selector);
  }

  connectedCallback() {
    super.connectedCallback();
    if (typeof subscribeToReviews === 'function') {
      this._unsubscribeReviews = subscribeToReviews((reviewsData) => {
        this.reviews = reviewsData;
        this._reviewsChanged();
        this._loadReviewFromRoute();
      });
    } else if (this.firebase?.database) {
      this.firebase.database().ref('reviews').on('value', (snapshot) => {
        this.reviews = snapshot.val();
        this._reviewsChanged();
        this._loadReviewFromRoute();
      });
    }
    this._loadReviewFromRoute();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribeReviews) {
      this._unsubscribeReviews();
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('routeData') || changedProperties.has('reviews')) {
      this._loadReviewFromRoute();
    }
    if (changedProperties.has('reviews')) {
      this._reviewsChanged();
    }
  }

  _populateFromReview(val) {
    if (!val) return;
    this.title = val.title || '';
    this.rating = val.rating || '';
    this.viewMethod = val.viewMethod || '';
    this.showType = val.showType || '';
    this.review = val.review || '';
    if (val.genres) {
      this.genres = Array.isArray(val.genres) ? val.genres : Object.values(val.genres);
    } else {
      this.genres = [];
    }
    this.cover = val.cover || '';
    this.thumbnail = val.thumbnail || '';
    this.previewCover = val.cover || '';
    this.previewThumbnail = val.thumbnail || '';
  }

  _findReview(name) {
    if (!name || !this.reviews) return null;
    const raw = name;
    let decoded = name;
    try {
      decoded = decodeURIComponent(name);
    } catch (e) { }

    // 1. Direct match on key
    if (this.reviews[decoded]) return this.reviews[decoded];
    if (this.reviews[raw]) return this.reviews[raw];

    // 2. Direct match on dbTitle
    const targetDb = dbTitle(decoded);
    if (this.reviews[targetDb]) return this.reviews[targetDb];

    // 3. Match by cleanTitle
    const targetClean = cleanTitle(decoded).toLowerCase();
    for (const key in this.reviews) {
      const item = this.reviews[key];
      if (!item) continue;
      if (cleanTitle(key).toLowerCase() === targetClean) {
        return item;
      }
      if (item.title && cleanTitle(item.title).toLowerCase() === targetClean) {
        return item;
      }
    }
    return null;
  }

  _loadReviewFromRoute() {
    const name =
      this.routeData?.name ||
      (typeof window !== 'undefined' && window.location.pathname.startsWith('/edit/')
        ? window.location.pathname.slice(6)
        : '');
    if (!name) return;
    if (this._loadedRouteName === name && this.title) return;

    const match = this._findReview(name);
    if (match) {
      this._loadedRouteName = name;
      this._populateFromReview(match);
    }
  }

  _computeSearchButtonText(isSearching) {
    return isSearching ? 'Fetching...' : 'Fetch Info';
  }

  _computeUploadButtonText(previewCover) {
    return previewCover ? 'Change Cover Image' : 'Upload Cover Image';
  }

  _computeThumbnailButtonText(previewThumbnail) {
    return previewThumbnail ? 'Change Thumbnail Image' : 'Upload Thumbnail Image';
  }

  _hasSearchResults(results) {
    return results && results.length > 0;
  }

  _joinGenres(genres) {
    return (genres || []).join(', ');
  }

  _onSearchKeydown(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      this._searchAnime();
    }
  }

  _searchAnime() {
    const query = (this.searchQuery || '').trim();
    if (!query) {
      this.showToast('Please enter an anime title or Crunchyroll URL.');
      return;
    }
    this.isSearching = true;
    this.searchResults = [];
    const url = '/api/anime/search?q=' + encodeURIComponent(query);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        this.isSearching = false;
        if (data.results && data.results.length > 0) {
          if (data.results.length === 1) {
            this._applyAnimeResult(data.results[0]);
          } else {
            this.searchResults = data.results;
          }
        } else {
          this.showToast('No anime found. Try another search term.');
        }
      })
      .catch((err) => {
        this.isSearching = false;
        console.error(err);
        this.showToast('Failed to fetch anime info.');
      });
  }

  _selectSearchResult(e, item) {
    const selectedItem = item || e?.model?.item;
    if (selectedItem) {
      this._applyAnimeResult(selectedItem);
    }
  }

  _applyAnimeResult(item) {
    this.title = item.title || item.romajiTitle || '';
    if (item.showType) {
      this.showType = item.showType;
    }
    if (item.viewMethod) {
      this.viewMethod = item.viewMethod;
    }
    if (item.genres && item.genres.length) {
      this.genres = item.genres.map((g) => {
        const tag = g.trim().toLowerCase();
        if (tag === 'shonen') {
          return 'shōnen';
        }
        if (tag === 'shojo') {
          return 'shōjo';
        }
        return tag;
      });
    }
    this.searchResults = [];

    if (item.coverUrl) {
      this.previewCover = item.coverUrl;
      const proxyUrl = '/api/anime/proxy-image?url=' + encodeURIComponent(item.coverUrl);
      fetch(proxyUrl)
        .then((res) => {
          if (!res.ok) throw new Error('Image fetch failed');
          return res.blob();
        })
        .then((blob) => {
          const ext = blob.type.indexOf('png') !== -1 ? 'png' : 'jpg';
          const safeTitle = cleanTitle(item.title || 'cover');
          const filename = safeTitle + '.' + ext;
          const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
          this.coverImg = file;
          this.previewCover = window.URL.createObjectURL(blob);
          if (!item.thumbnailUrl) {
            this._generateClientThumbnail(file);
          }
        })
        .catch((err) => {
          console.warn('Could not load blob directly, fallback to cover URL:', err);
          this.cover = item.coverUrl;
        });
    }

    if (item.thumbnailUrl) {
      this.thumbnail = item.thumbnailUrl;
      this.previewThumbnail = item.thumbnailUrl;
      const proxyThumbUrl = '/api/anime/proxy-image?url=' + encodeURIComponent(item.thumbnailUrl);
      fetch(proxyThumbUrl)
        .then((res) => {
          if (!res.ok) throw new Error('Thumbnail fetch failed');
          return res.blob();
        })
        .then((blob) => {
          const ext = blob.type.indexOf('png') !== -1 ? 'png' : 'jpg';
          const safeTitle = cleanTitle(item.title || 'cover');
          const filename = safeTitle + '_thumb.' + ext;
          const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
          this.thumbnailImg = file;
          this.previewThumbnail = window.URL.createObjectURL(blob);
        })
        .catch((err) => {
          console.warn('Could not load thumbnail blob directly, fallback to thumbnail URL:', err);
          this.thumbnail = item.thumbnailUrl;
        });
    }

    this.showToast('Loaded info for ' + (item.title || item.romajiTitle));
  }

  _triggerCoverUpload() {
    const el = this.$.coverFileInput || this.renderRoot?.querySelector('#coverFileInput');
    const fileInput = el?.tagName === 'INPUT' ? el : el?.querySelector?.('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
      fileInput.click();
    }
  }

  _triggerThumbnailUpload() {
    const el = this.$.thumbnailFileInput || this.renderRoot?.querySelector('#thumbnailFileInput');
    const fileInput = el?.tagName === 'INPUT' ? el : el?.querySelector?.('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
      fileInput.click();
    }
  }

  async _saveReviewInDb(review) {
    const targetTitle = this.title;
    try {
      if (typeof saveReview === 'function') {
        await saveReview(targetTitle, review);
      } else if (this.firebase?.database) {
        await this.firebase.database().ref('reviews').child(dbTitle(targetTitle)).set(review);
      }
      console.log('Synchronization succeeded');
      this.showToast('Review saved successfully.');
      window.location.href = '/a/' + cleanTitle(review.title);
    } catch (error) {
      console.warn('Synchronization failed');
      this.showToast('Failed to save review.');
      console.error(error);
    }
    this.title = '';
    this.rating = '';
    this.cover = '';
    this.coverImg = null;
    this.thumbnail = '';
    this.thumbnailImg = null;
    this.previewCover = '';
    this.previewThumbnail = '';
    this.genres = [];
    this.genreInputValue = '';
    this.genreSuggestions = [];
    this.viewMethod = '';
    this.showType = '';
    this.review = '';
    this.searchQuery = '';
    this.searchResults = [];
  }

  async _saveReview(authInfo) {
    if (!this.title) return;
    const key = dbTitle(this.title);
    const genresObj = (this.genres || []).reduce((obj, val) => {
      obj[val] = val;
      return obj;
    }, {});
    const review = {
      title: this.title,
      rating: this.rating,
      genres: genresObj,
      viewMethod: this.viewMethod,
      showType: this.showType,
      review: this.review,
    };

    const promises = [];

    if (this.coverImg) {
      if (typeof uploadCover === 'function') {
        promises.push(
          uploadCover(this.title, this.coverImg, (percentage) => {
            console.info('Cover: ' + percentage + '%');
          }).then((url) => {
            console.info('Cover image upload completed.');
            review.cover = url;
          })
        );
      } else if (this.firebase?.storage) {
        const coverTask = this.firebase.storage().ref('covers').child(key).put(this.coverImg);
        promises.push(
          new Promise((resolve, reject) => {
            coverTask.on(
              'state_changed',
              (snapshot) => {
                const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.info('Cover: ' + percentage + '%');
              },
              reject,
              () => {
                console.info('Cover image upload completed.');
                review.cover = coverTask.snapshot.downloadURL;
                resolve();
              }
            );
          })
        );
      }
    } else if (this.cover) {
      review.cover = this.cover;
    }

    if (this.thumbnailImg) {
      if (typeof uploadThumbnail === 'function') {
        promises.push(
          uploadThumbnail(this.title, this.thumbnailImg, (percentage) => {
            console.info('Thumbnail: ' + percentage + '%');
          }).then((url) => {
            console.info('Thumbnail upload completed.');
            review.thumbnail = url;
          })
        );
      } else if (this.firebase?.storage) {
        const thumbTask = this.firebase.storage().ref('covers').child(key + '_thumb').put(this.thumbnailImg);
        promises.push(
          new Promise((resolve, reject) => {
            thumbTask.on(
              'state_changed',
              (snapshot) => {
                const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.info('Thumbnail: ' + percentage + '%');
              },
              reject,
              () => {
                console.info('Thumbnail upload completed.');
                review.thumbnail = thumbTask.snapshot.downloadURL;
                resolve();
              }
            );
          })
        );
      }
    } else if (this.thumbnail) {
      review.thumbnail = this.thumbnail;
    }

    try {
      if (promises.length > 0) {
        await Promise.all(promises);
      }
      await this._saveReviewInDb(review);
    } catch (err) {
      console.error('Upload failed:', err);
      this.showToast('Failed to upload cover image.');
    }
  }

  async _onClick(event) {
    try {
      let authInfo = null;
      if (typeof signInWithGoogle === 'function') {
        authInfo = await signInWithGoogle();
      } else if (this.$.auth?.signInWithPopup) {
        authInfo = await this.$.auth.signInWithPopup('google');
      }
      await this._saveReview(authInfo);
    } catch (err) {
      console.warn('Authentication failed.', err);
      this.showToast('Review could not be saved.');
    }
  }

  _reviewsChanged() {
    const tags = {};
    for (const key in this.reviews) {
      const genres = this.reviews[key]?.genres;
      for (const genre in genres) {
        tags[genre] = true;
      }
    }
    this.tags = Object.keys(tags);
  }

  _genreInputChanged(event) {
    this._onGenreInput(event);
  }

  _uploadCover(e) {
    const valid = e.detail?.valid || (e.target?.files ? Array.from(e.target.files) : null);
    if (valid && valid.length) {
      this.coverImg = valid[0];
      this.previewCover = window.URL.createObjectURL(valid[0]);
      this._generateClientThumbnail(valid[0]);
    }
  }

  _uploadThumbnail(e) {
    const valid = e.detail?.valid || (e.target?.files ? Array.from(e.target.files) : null);
    if (valid && valid.length) {
      this.thumbnailImg = valid[0];
      this.previewThumbnail = window.URL.createObjectURL(valid[0]);
    }
  }

  _generateClientThumbnail(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetWidth = 480;
        const targetHeight = Math.round(targetWidth * (img.height / img.width));
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            this.thumbnailImg = new File([blob], 'thumb_' + file.name, { type: blob.type || 'image/jpeg' });
            this.previewThumbnail = window.URL.createObjectURL(blob);
          }
        }, 'image/jpeg', 0.85);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  render() {
    return html`
      <div class="paper-header">
        <div id="header">Sexy Anime Reviews</div>
      </div>
      <br />
      <div id="card">
        <!-- Auto-Fill Section -->
        <div class="autofill-box">
          <div class="autofill-title">Auto-Fill Anime Info & Vertical Banner</div>
          <div class="autofill-row">
            <input
              type="text"
              id="searchQuery"
              class="autofill-input"
              placeholder="Search title or paste Crunchyroll URL"
              aria-label="Search title or paste Crunchyroll URL"
              .value="${this.searchQuery || ''}"
              @input="${(e) => {
        this.searchQuery = e.target.value;
      }}"
              @keydown="${this._onSearchKeydown}"
            />
            <button type="button" @click="${this._searchAnime}" ?disabled="${this.isSearching}">
              <span>${this._computeSearchButtonText(this.isSearching)}</span>
            </button>
          </div>

          ${this._hasSearchResults(this.searchResults)
        ? html`
                <div class="results-list">
                  ${this.searchResults.map(
          (item) => html`
                      <div class="result-card" @click="${(e) => this._selectSearchResult(e, item)}">
                        <img class="result-thumb" src="${item.coverUrl}" />
                        <div class="result-info">
                          <div class="result-name">${item.title}</div>
                          <div class="result-meta">
                            ${item.romajiTitle} &bull; ${item.format} &bull; ${this._joinGenres(item.genres)}
                          </div>
                        </div>
                        <button type="button">Select</button>
                      </div>
                    `
        )}
                </div>
              `
        : ''}
        </div>

        <div class="input-container">
          <input
            type="text"
            id="title"
            class="title-input"
            placeholder="Title"
            aria-label="Title"
            .value="${this.title || ''}"
            @input="${(e) => {
        this.title = e.target.value;
      }}"
          />
        </div>

        <!-- Cover & Thumbnail Image Section -->
        <div class="cover-section">
          ${this.previewCover
        ? html`
                <div class="image-preview-card">
                  <div class="image-preview-label">Cover (Review)</div>
                  <img class="cover-preview-img" src="${this.previewCover}" alt="Cover preview" />
                </div>
              `
        : ''}
          ${this.previewThumbnail
        ? html`
                <div class="image-preview-card">
                  <div class="image-preview-label">Thumbnail (Card)</div>
                  <img class="thumb-preview-img" src="${this.previewThumbnail}" alt="Thumbnail preview" />
                </div>
              `
        : ''}
          <div class="cover-actions">
            <div class="cover-action-item">
              ${this.previewCover
        ? html`<div class="cover-status">&#x2714; High-res cover ready</div>`
        : ''}
              <input
                type="file"
                id="coverFileInput"
                accept="image/*"
                style="display: none;"
                @change="${this._uploadCover}"
              />
              <button type="button" @click="${this._triggerCoverUpload}">
                <span>${this._computeUploadButtonText(this.previewCover)}</span>
              </button>
            </div>
            <div class="cover-action-item">
              ${this.previewThumbnail
        ? html`<div class="cover-status">&#x2714; Thumbnail ready</div>`
        : ''}
              <input
                type="file"
                id="thumbnailFileInput"
                accept="image/*"
                style="display: none;"
                @change="${this._uploadThumbnail}"
              />
              <button type="button" @click="${this._triggerThumbnailUpload}">
                <span>${this._computeThumbnailButtonText(this.previewThumbnail)}</span>
              </button>
            </div>
          </div>
        </div>

        <div id="genresSelect" class="genres-container">
          <div class="genres-label">Genres</div>
          <div class="genres-wrapper">
            ${(this.genres || []).map(
              (genre) => html`
                <span class="genre-chip">
                  <span>${genre}</span>
                  <button
                    type="button"
                    class="genre-chip-remove"
                    aria-label="Remove ${genre}"
                    @click="${() => this._removeGenre(genre)}"
                  >
                    &times;
                  </button>
                </span>
              `
            )}
            <input
              type="text"
              class="genre-input"
              placeholder="${this.genres && this.genres.length ? 'Add genre...' : 'Genres (type and press Enter or comma)'}"
              .value="${this.genreInputValue || ''}"
              @input="${this._onGenreInput}"
              @keydown="${this._onGenreKeydown}"
              @blur="${this._onGenreBlur}"
            />
          </div>
          ${this.genreSuggestions && this.genreSuggestions.length > 0
            ? html`
                <div class="genre-suggestions">
                  ${this.genreSuggestions.map(
                    (tag) => html`
                      <div
                        class="genre-suggestion-item"
                        @mousedown="${(e) => {
                          e.preventDefault();
                          this._addGenre(tag);
                        }}"
                      >
                        ${tag}
                      </div>
                    `
                  )}
                </div>
              `
            : ''}
        </div>

        <div class="horizontal radio-group" role="radiogroup">
          <label class="radio-label">
            <input
              type="radio"
              name="viewMethod"
              value="dub"
              .checked="${this.viewMethod === 'dub'}"
              @change="${() => {
        this.viewMethod = 'dub';
      }}"
            />
            <span>Dub</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              name="viewMethod"
              value="sub"
              .checked="${this.viewMethod === 'sub'}"
              @change="${() => {
        this.viewMethod = 'sub';
      }}"
            />
            <span>Sub</span>
          </label>
        </div>

        <div class="horizontal radio-group" role="radiogroup">
          <label class="radio-label">
            <input
              type="radio"
              name="showType"
              value="movie"
              .checked="${this.showType === 'movie'}"
              @change="${() => {
        this.showType = 'movie';
      }}"
            />
            <span>Movie</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              name="showType"
              value="series"
              .checked="${this.showType === 'series'}"
              @change="${() => {
        this.showType = 'series';
      }}"
            />
            <span>Series</span>
          </label>
        </div>

        <sar-rating-slider
          .rating="${this.rating}"
          rating="${this.rating}"
          @rating-changed="${(e) => {
        this.rating = e.detail.value ?? e.target.rating;
      }}"
        ></sar-rating-slider>

        <div class="input-container">
          <textarea
            id="review"
            class="review-textarea"
            placeholder="Review"
            aria-label="Review"
            rows="5"
            .value="${this.review || ''}"
            @input="${(e) => {
        this.review = e.target.value;
      }}"
          ></textarea>
        </div>
        <br />
        <div class="reverse">
          <button type="button" @click="${this._onClick}">Submit</button>
        </div>
      </div>
      <div id="toast" class="toast ${this.toastOpened ? 'opened' : ''}">
        ${this.toastText}
      </div>
    `;
  }
}

customElements.define('sar-author-form', SarAuthorForm);
