import { LitElement, html, css } from 'lit';
import {
  subscribeToReviews,
  saveReview,
  uploadCover,
  uploadThumbnail,
  signInWithGoogle,
  cleanTitle as fbCleanTitle,
  dbTitle as fbDbTitle,
  app,
} from '../../src/services/firebase.js';

function cleanTitle(title) {
  if (typeof window !== 'undefined' && typeof window.cleanTitle === 'function') {
    return window.cleanTitle(title);
  }
  return fbCleanTitle(title);
}

function dbTitle(title) {
  if (typeof window !== 'undefined' && typeof window.dbTitle === 'function') {
    return window.dbTitle(title);
  }
  return fbDbTitle(title);
}

export class SarAuthorForm extends LitElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
    }
    .paper-header {
      white-space: nowrap;
      display: flex;
    }
    #header {
      color: silver;
      font-size: 32px;
      font-family: 'PT Sans Narrow', 'Open Sans', Helvetica, Arial, sans-serif;
    }
    #card {
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
    paper-button {
      background: var(--accent-color);
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
  }

  get firebase() {
    return app;
  }

  get $() {
    return {
      card: this.renderRoot?.querySelector('#card'),
      toast: this.renderRoot?.querySelector('#toast'),
      auth: this.renderRoot?.querySelector('#auth'),
      coverFileInput: this.renderRoot?.querySelector('#coverFileInput'),
      thumbnailFileInput: this.renderRoot?.querySelector('#thumbnailFileInput'),
      genresSelect: this.renderRoot?.querySelector('#genresSelect'),
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
    if (changedProperties.has('genres') && this.$.genresSelect) {
      this.$.genresSelect.bindValue = this.genres;
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
    } catch (e) {}

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
      if (this.$.toast) {
        this.$.toast.text = 'Please enter an anime title or Crunchyroll URL.';
        this.$.toast.show();
      }
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
          if (this.$.toast) {
            this.$.toast.text = 'No anime found. Try another search term.';
            this.$.toast.show();
          }
        }
      })
      .catch((err) => {
        this.isSearching = false;
        console.error(err);
        if (this.$.toast) {
          this.$.toast.text = 'Failed to fetch anime info.';
          this.$.toast.show();
        }
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

    if (this.$.toast) {
      this.$.toast.text = 'Loaded info for ' + (item.title || item.romajiTitle);
      this.$.toast.show();
    }
  }

  _triggerCoverUpload(e) {
    if (e && e.target && e.target.tagName === 'INPUT') {
      return;
    }
    const el = this.$.coverFileInput || this.$$?.('#coverFileInput');
    const fileInput = el
      ? el.shadowRoot?.querySelector('input[type="file"]') || el.querySelector('input[type="file"]')
      : null;
    if (fileInput) {
      fileInput.click();
    }
  }

  _triggerThumbnailUpload(e) {
    if (e && e.target && e.target.tagName === 'INPUT') {
      return;
    }
    const el = this.$.thumbnailFileInput || this.$$?.('#thumbnailFileInput');
    const fileInput = el
      ? el.shadowRoot?.querySelector('input[type="file"]') || el.querySelector('input[type="file"]')
      : null;
    if (fileInput) {
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
      if (this.$.toast) {
        this.$.toast.text = 'Review saved successfully.';
        this.$.toast.show();
      }
      window.location.href = '/a/' + cleanTitle(review.title);
    } catch (error) {
      console.warn('Synchronization failed');
      if (this.$.toast) {
        this.$.toast.text = 'Failed to save review.';
        this.$.toast.show();
      }
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
      if (this.$.toast) {
        this.$.toast.text = 'Failed to upload cover image.';
        this.$.toast.show();
      }
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
      if (this.$.toast) {
        this.$.toast.text = 'Review could not be saved.';
        this.$.toast.show();
      }
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
    const input = (event.detail?.value || event.target?.input || '').trim().toLowerCase();
    if (input) {
      event.target.options = (this.tags || []).filter((tag) => {
        return tag.toLowerCase().indexOf(input) === 0;
      });
    } else {
      event.target.options = [];
    }
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
      <paper-material id="card" elevation="2">
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
            <paper-button raised @click="${this._searchAnime}" ?disabled="${this.isSearching}">
              <span>${this._computeSearchButtonText(this.isSearching)}</span>
            </paper-button>
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
                        <paper-button raised>Select</paper-button>
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
              <paper-button raised @click="${this._triggerCoverUpload}">
                <file-input
                  id="coverFileInput"
                  accept="image/*"
                  invalidText="Invalid Image"
                  @change="${this._uploadCover}"
                >
                  <span>${this._computeUploadButtonText(this.previewCover)}</span>
                </file-input>
              </paper-button>
            </div>
            <div class="cover-action-item">
              ${this.previewThumbnail
                ? html`<div class="cover-status">&#x2714; Thumbnail ready</div>`
                : ''}
              <paper-button raised @click="${this._triggerThumbnailUpload}">
                <file-input
                  id="thumbnailFileInput"
                  accept="image/*"
                  invalidText="Invalid Image"
                  @change="${this._uploadThumbnail}"
                >
                  <span>${this._computeThumbnailButtonText(this.previewThumbnail)}</span>
                </file-input>
              </paper-button>
            </div>
          </div>
        </div>

        <paper-select
          id="genresSelect"
          label="Genres"
          .bindValue="${this.genres}"
          bind-value="${(this.genres || []).join(',')}"
          @input-changed="${this._genreInputChanged}"
          @bind-value-changed="${(e) => {
            this.genres = e.detail.value;
          }}"
          multiple
          nonmatching
          unique
        ></paper-select>

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
          <paper-button raised @click="${this._onClick}">Submit</paper-button>
        </div>
      </paper-material>
      <paper-toast id="toast"></paper-toast>
    `;
  }
}

customElements.define('sar-author-form', SarAuthorForm);
