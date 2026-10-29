import { LitElement, html, css } from 'lit';
import './sar-rating-slider.js';
import { cleanTitle, dbTitle, parseSpoilers, hasSpoilers, splitReview } from './util.js';
import { articleStyles } from './article-styles.js';
import {
  subscribeToReviews,
  saveReview,
  uploadCover,
  uploadThumbnail,
  signInWithGoogle,
  app,
} from '../../src/services/firebase.js';

export class SarAuthorForm extends LitElement {
  static styles = [
    articleStyles,
    css`
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
    .autofill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 12px;
    }
    .autofill-title {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #aaa;
    }
    .autofill-hint {
      font-size: 11px;
      color: var(--secondary-text-color, #888);
      margin-top: 3px;
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
    .review-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      margin-bottom: 4px;
    }
    .review-section-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--secondary-text-color, #727272);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .spoiler-toolbar-btn {
      background: var(--hover-overlay, rgba(255, 255, 255, 0.08));
      color: var(--primary-text-color, #F1F1F5);
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      text-transform: none;
      letter-spacing: 0.2px;
      padding: 4px 10px;
      min-height: 28px;
      border: 1px solid var(--divider-color, #333344);
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: none;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .spoiler-toolbar-btn:hover:not(:disabled) {
      background: var(--default-primary-color, #BA68C8);
      color: #FFFFFF;
      border-color: var(--default-primary-color, #BA68C8);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }
    .spoiler-toolbar-btn:active:not(:disabled) {
      transform: scale(0.96);
    }
    .spoiler-toolbar-btn svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
    .review-input-container {
      margin-top: 4px;
      margin-bottom: 6px;
    }
    .spoiler-hint {
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
      margin-bottom: 12px;
      line-height: 1.4;
    }
    .spoiler-hint code {
      font-family: monospace;
      padding: 1px 5px;
      background: var(--hover-overlay, rgba(255, 255, 255, 0.08));
      border-radius: 3px;
      color: var(--default-primary-color, #BA68C8);
      font-size: 12px;
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
    }
    .spoiler-preview-card {
      margin: 12px 0 16px 0;
      padding: 12px 14px;
      background: var(--card-cover-bg, rgba(0, 0, 0, 0.25));
      border: 1px solid var(--divider-color, #333344);
      border-radius: 6px;
    }
    .spoiler-preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--divider-color, #333344);
    }
    .spoiler-preview-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color, #727272);
    }
    .spoiler-preview-subtitle {
      font-size: 11px;
      color: var(--secondary-text-color, #727272);
      font-style: italic;
    }
    .spoiler-preview-content {
      font-size: 13px;
      line-height: 1.6;
      color: var(--primary-text-color);
      white-space: pre-wrap;
      word-break: break-word;
    }
    .results-comparison-box {
      margin-top: 16px;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 14px 16px;
      animation: fadeInResults 0.2s ease-out;
    }
    @keyframes fadeInResults {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .results-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      flex-wrap: wrap;
      gap: 10px;
    }
    .results-top-title-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .results-top-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--primary-text-color, #fff);
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .results-top-subtitle {
      font-size: 12px;
      color: var(--secondary-text-color, #aaa);
    }
    .dismiss-btn {
      background: rgba(255, 255, 255, 0.06);
      color: var(--primary-text-color, #eee);
      border: 1px solid rgba(255, 255, 255, 0.18);
      font-size: 12px;
      font-weight: 600;
      padding: 6px 14px;
      min-height: 32px;
      border-radius: 4px;
      cursor: pointer;
      text-transform: none;
      letter-spacing: normal;
      box-shadow: none;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .dismiss-btn:hover {
      background: rgba(244, 67, 54, 0.15);
      border-color: rgba(244, 67, 54, 0.4);
      color: #ff8a80;
    }
    .results-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .results-column {
      display: flex;
      flex-direction: column;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 6px;
      overflow: hidden;
    }
    .results-column.crunchyroll-column {
      border-top: 3px solid #f47521;
    }
    .results-column.tmdb-column {
      border-top: 3px solid #01b4e4;
    }
    .column-header {
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .source-badge {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .source-badge.crunchyroll {
      color: #f47521;
    }
    .source-badge.tmdb {
      color: #01b4e4;
    }
    .column-count {
      font-size: 11px;
      color: var(--secondary-text-color, #888);
      font-weight: 500;
    }
    .column-body {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 590px;
      overflow-y: auto;
    }
    .no-results-msg {
      padding: 32px 12px;
      text-align: center;
      color: var(--secondary-text-color, #777);
      font-size: 12px;
      font-style: italic;
    }
    .result-card {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      padding: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
      gap: 14px;
    }
    .result-card:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    .result-card.crunchyroll-card:hover {
      border-color: rgba(244, 117, 33, 0.35);
    }
    .result-card.tmdb-card:hover {
      border-color: rgba(1, 180, 228, 0.35);
    }
    .result-thumb {
      width: 180px;
      height: 264px;
      object-fit: cover;
      border-radius: 4px;
      background: #111;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }
    .result-thumb-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: #666;
      border: 1px dashed rgba(255, 255, 255, 0.15);
    }
    .result-details {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 6px;
    }
    .result-meta-top {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .result-title {
      font-weight: 600;
      color: var(--primary-text-color, #fff);
      font-size: 14px;
      line-height: 1.3;
      word-break: break-word;
    }
    .result-title-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 2px;
    }
    .result-title-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: inherit;
      text-decoration: none;
      cursor: pointer;
      min-width: 0;
      word-break: break-word;
    }
    .result-title-link:hover .result-title {
      text-decoration: underline;
    }
    .result-card.crunchyroll-card .result-title-link:hover .result-title {
      color: #f47521;
    }
    .result-card.tmdb-card .result-title-link:hover .result-title {
      color: #01b4e4;
    }
    .result-title-link:hover .external-title-icon {
      opacity: 1;
      transform: translate(1px, -1px);
    }
    .external-title-icon {
      opacity: 0.65;
      flex-shrink: 0;
      transition: opacity 0.15s, transform 0.15s;
      vertical-align: middle;
    }
    .result-card.crunchyroll-card .external-title-icon {
      color: #f47521;
    }
    .result-card.tmdb-card .external-title-icon {
      color: #01b4e4;
    }
    .result-romaji {
      font-size: 11px;
      color: var(--secondary-text-color, #888);
      font-style: italic;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .result-tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 3px;
    }
    .meta-chip {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 1px 6px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.08);
      color: #ccc;
    }
    .meta-chip.type-chip {
      background: rgba(156, 39, 176, 0.2);
      color: #ce93d8;
    }
    .meta-chip.view-chip {
      background: rgba(3, 169, 244, 0.2);
      color: #81d4fa;
    }
    .meta-chip.res-chip {
      background: rgba(76, 175, 80, 0.2);
      color: #81c784;
    }
    .result-genres-row {
      font-size: 11px;
      color: var(--secondary-text-color, #999);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .result-card-action {
      display: flex;
      margin-top: auto;
      padding-top: 6px;
    }
    .apply-card-btn {
      font-size: 11px;
      font-weight: 600;
      padding: 6px 12px;
      min-height: 28px;
      border-radius: 4px;
      width: 100%;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      cursor: pointer;
    }
    .apply-card-btn.crunchyroll-btn {
      background: rgba(244, 117, 33, 0.15);
      color: #f47521;
      border: 1px solid rgba(244, 117, 33, 0.4);
    }
    .apply-card-btn.crunchyroll-btn:hover {
      background: #f47521;
      color: #fff;
      box-shadow: 0 2px 8px rgba(244, 117, 33, 0.4);
    }
    .apply-card-btn.tmdb-btn {
      background: rgba(1, 180, 228, 0.15);
      color: #01b4e4;
      border: 1px solid rgba(1, 180, 228, 0.4);
    }
    .apply-card-btn.tmdb-btn:hover {
      background: #01b4e4;
      color: #fff;
      box-shadow: 0 2px 8px rgba(1, 180, 228, 0.4);
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
      height: 640px;
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
    .genres-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
      flex-wrap: wrap;
    }
    .genres-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color, #727272);
    }
    .genre-search-btn {
      background: var(--hover-overlay, rgba(255, 255, 255, 0.08));
      color: var(--primary-text-color, #F1F1F5);
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      text-transform: none;
      letter-spacing: 0.2px;
      padding: 4px 10px;
      min-height: 28px;
      border: 1px solid var(--divider-color, #333344);
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: none;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .genre-search-btn:hover:not(:disabled) {
      background: var(--default-primary-color, #BA68C8);
      color: #FFFFFF;
      border-color: var(--default-primary-color, #BA68C8);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }
    .genre-search-btn:active:not(:disabled) {
      transform: scale(0.96);
    }
    .genre-search-btn svg {
      width: 13px;
      height: 13px;
      flex-shrink: 0;
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
        max-width: 1024px;
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
      .results-columns {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .column-body {
        max-height: 384px;
      }
      .result-thumb {
        width: 110px;
        height: 162px;
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
  `];

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
    crunchyrollResults: { type: Array },
    tmdbResults: { type: Array },
    hasSearched: { type: Boolean },
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
    this.crunchyrollResults = [];
    this.tmdbResults = [];
    this.hasSearched = false;
    this.isSearching = false;
    this.searchResults = [];
    this.genres = [];
    this.viewMethod = '';
    this.showType = '';
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
    this._previewRevealedSpoilers = new Set();
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

  _searchGoogleGenre() {
    const rawTitle = (this.title || this.renderRoot?.querySelector('#title')?.value || this.searchQuery || '').trim();
    if (!rawTitle) {
      this.showToast('Please enter an anime title first');
      return;
    }
    const query = `${rawTitle} anime genre`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
    this.searchQuery = val.title || '';
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
    return isSearching ? 'Searching...' : 'Search Metadata';
  }

  _computeUploadButtonText(previewCover) {
    return previewCover ? 'Change Cover Image' : 'Upload Cover Image';
  }

  _computeThumbnailButtonText(previewThumbnail) {
    return previewThumbnail ? 'Change Thumbnail Image' : 'Upload Thumbnail Image';
  }

  _hasSearchResults() {
    return this.hasSearched && (
      (this.crunchyrollResults && this.crunchyrollResults.length > 0) ||
      (this.tmdbResults && this.tmdbResults.length > 0)
    );
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

  async _searchAnime() {
    const query = (this.searchQuery || '').trim();
    if (!query) {
      this.showToast('Please enter an anime title, Crunchyroll, or TMDb URL.');
      return;
    }

    const isCrUrl = query.toLowerCase().includes('crunchyroll.com');
    const isTmdbUrl = query.toLowerCase().includes('themoviedb.org');

    this.isSearching = true;
    this.searchResults = [];
    this.crunchyrollResults = [];
    this.tmdbResults = [];
    this.hasSearched = false;

    try {
      const promises = [];

      if (isCrUrl) {
        promises.push(
          fetch(`/api/anime/search?q=${encodeURIComponent(query)}&source=crunchyroll`)
            .then((r) => r.json())
            .then((data) => ({ source: 'crunchyroll', data }))
            .catch((err) => ({ source: 'crunchyroll', error: err }))
        );
      } else if (isTmdbUrl) {
        promises.push(
          fetch(`/api/anime/search?q=${encodeURIComponent(query)}&source=tmdb`)
            .then((r) => r.json())
            .then((data) => ({ source: 'tmdb', data }))
            .catch((err) => ({ source: 'tmdb', error: err }))
        );
      } else {
        promises.push(
          fetch(`/api/anime/search?q=${encodeURIComponent(query)}&source=crunchyroll`)
            .then((r) => r.json())
            .then((data) => ({ source: 'crunchyroll', data }))
            .catch((err) => ({ source: 'crunchyroll', error: err })),
          fetch(`/api/anime/search?q=${encodeURIComponent(query)}&source=tmdb`)
            .then((r) => r.json())
            .then((data) => ({ source: 'tmdb', data }))
            .catch((err) => ({ source: 'tmdb', error: err }))
        );
      }

      const settled = await Promise.all(promises);

      let crResults = [];
      let tmResults = [];

      for (const res of settled) {
        if (res.source === 'crunchyroll' && res.data?.results) {
          crResults = res.data.results.map((item) => ({ ...item, source: 'crunchyroll' }));
        } else if (res.source === 'tmdb' && res.data?.results) {
          tmResults = res.data.results.map((item) => ({ ...item, source: 'tmdb' }));
        }
      }

      this.crunchyrollResults = crResults;
      this.tmdbResults = tmResults;
      this.searchResults = [...crResults, ...tmResults];
      this.hasSearched = true;

      if (crResults.length === 0 && tmResults.length === 0) {
        this.showToast('No anime found on Crunchyroll or TMDb. Try another search term.');
      }
    } catch (err) {
      console.error(err);
      this.showToast('Failed to fetch anime info.');
    } finally {
      this.isSearching = false;
    }
  }

  _selectSearchResult(e, item) {
    if (e) {
      e.stopPropagation();
    }
    const selectedItem = item || e?.model?.item;
    if (selectedItem) {
      this._applyAnimeResult(selectedItem);
    }
  }

  _dismissSearchResults(e) {
    if (e) {
      e.stopPropagation();
    }
    this.crunchyrollResults = [];
    this.tmdbResults = [];
    this.searchResults = [];
    this.hasSearched = false;
    this.showToast('Search results dismissed.');
  }

  _applyAnimeResult(item) {
    this.title = item.title || item.romajiTitle || '';
    if (item.showType && !this.showType) {
      this.showType = item.showType;
    }
    if (item.viewMethod && !this.viewMethod) {
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

    if (item.coverUrl) {
      this.previewCover = item.coverUrl;
      const proxyUrl = '/api/anime/proxy-image?url=' + encodeURIComponent(item.coverUrl);
      fetch(proxyUrl)
        .then((res) => {
          if (!res.ok) throw new Error('Image fetch failed');
          return res.blob();
        })
        .then((blob) => {
          const safeTitle = cleanTitle(item.title || 'cover');
          const file = new File([blob], safeTitle, { type: blob.type || 'image/jpeg' });
          this._processCoverImage(file, item.title);
          if (!item.thumbnailUrl) {
            this._generateClientThumbnail(file, item.title);
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
          const safeTitle = cleanTitle(item.title || 'cover');
          const file = new File([blob], safeTitle + '_thumb', { type: blob.type || 'image/jpeg' });
          this._generateClientThumbnail(file, item.title);
        })
        .catch((err) => {
          console.warn('Could not load thumbnail blob directly, fallback to thumbnail URL:', err);
          this.thumbnail = item.thumbnailUrl;
        });
    }

    const sourceName = item.source === 'tmdb' ? 'TMDb' : 'Crunchyroll';
    this.showToast('Applied ' + sourceName + ' metadata for ' + (item.title || item.romajiTitle));
  }

  _getResultUrl(item, source) {
    if (source === 'tmdb' || item?.source === 'tmdb') {
      let mediaType = item.mediaType;
      let tmdbId = item.tmdbId;
      if (!mediaType || !tmdbId) {
        if (typeof item.id === 'string' && item.id.startsWith('tmdb:')) {
          const parts = item.id.split(':');
          mediaType = mediaType || parts[1];
          tmdbId = tmdbId || parts[2];
        }
      }
      mediaType = mediaType || (item.showType === 'movie' ? 'movie' : 'tv');
      if (tmdbId) {
        return `https://www.themoviedb.org/${mediaType}/${tmdbId}/images/posters?image_language=en&image_sort=resolution.desc`;
      }
      if (item.url) {
        return item.url;
      }
      return `https://www.themoviedb.org/search?query=${encodeURIComponent(item.title || '')}`;
    }

    if (item?.url) {
      return item.url;
    }
    if (item?.id) {
      const slug = item.slugTitle ? `/${item.slugTitle}` : '';
      return `https://www.crunchyroll.com/series/${item.id}${slug}`;
    }
    return `https://www.crunchyroll.com/search?q=${encodeURIComponent(item?.title || '')}`;
  }

  _renderResultCard(item, source) {
    const isCr = source === 'crunchyroll';
    const siteUrl = this._getResultUrl(item, source);
    const siteTooltip = isCr
      ? `View on Crunchyroll (opens in a new tab)`
      : `View posters on TMDb (opens in a new tab)`;

    return html`
      <div class="result-card ${isCr ? 'crunchyroll-card' : 'tmdb-card'}">
        ${item.thumbnailUrl || item.coverUrl
          ? html`<img class="result-thumb" src="${item.thumbnailUrl || item.coverUrl}" alt="${item.title || ''}" />`
          : html`<div class="result-thumb result-thumb-placeholder">No Cover</div>`}
        <div class="result-details">
          <div class="result-meta-top">
            <div class="result-title-row">
              <a
                class="result-title-link"
                href="${siteUrl}"
                target="_blank"
                rel="noopener noreferrer"
                @click="${(e) => e.stopPropagation()}"
                title="${siteTooltip}"
              >
                <span class="result-title" title="${item.title || ''}">${item.title}</span>
                <svg class="external-title-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
            ${item.romajiTitle && item.romajiTitle !== item.title
              ? html`<div class="result-romaji" title="${item.romajiTitle}">${item.romajiTitle}</div>`
              : ''}

            <div class="result-tags-row">
              ${item.showType || item.format
                ? html`<span class="meta-chip type-chip">${item.showType || item.format}</span>`
                : ''}
              ${item.viewMethod
                ? html`<span class="meta-chip view-chip">${item.viewMethod}</span>`
                : ''}
              ${item.coverWidth && item.coverHeight
                ? html`<span class="meta-chip res-chip" title="Cover resolution: ${item.coverWidth}×${item.coverHeight}">${item.coverWidth}×${item.coverHeight}</span>`
                : ''}
            </div>

            ${item.genres && item.genres.length
              ? html`
                  <div class="result-genres-row" title="${this._joinGenres(item.genres)}">
                    ${this._joinGenres(item.genres)}
                  </div>
                `
              : ''}
          </div>
          <div class="result-card-action">
            <button
              type="button"
              class="apply-card-btn ${isCr ? 'crunchyroll-btn' : 'tmdb-btn'}"
              @click="${(e) => this._selectSearchResult(e, item)}"
            >
              Apply ${isCr ? 'Crunchyroll' : 'TMDb'} Info
            </button>
          </div>
        </div>
      </div>
    `;
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

  _insertSpoilerTag() {
    const textarea = this.renderRoot?.querySelector('#review');
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const text = this.review || '';
    const selected = text.substring(start, end);
    const replacement = selected ? `||${selected}||` : '||spoiler||';
    this.review = text.substring(0, start) + replacement + text.substring(end);
    this.requestUpdate();

    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start, start + replacement.length);
      } else {
        textarea.setSelectionRange(start + 2, start + 2 + 'spoiler'.length);
      }
    }, 0);
  }

  _togglePreviewSpoiler(index, event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    const next = new Set(this._previewRevealedSpoilers);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    this._previewRevealedSpoilers = next;
    this.requestUpdate();
  }

  _onPreviewSpoilerKeyDown(index, event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._togglePreviewSpoiler(index, event);
    }
  }

  _renderPreviewParts(parts) {
    if (!parts || !parts.length) return '';
    return parts.map((part) => {
      if (part.type === 'text') {
        return part.content;
      }
      const isRevealed = this._previewRevealedSpoilers?.has(part.index);
      return html`<span
        class="spoiler ${isRevealed ? 'revealed' : ''}"
        role="button"
        tabindex="0"
        aria-expanded="${isRevealed ? 'true' : 'false'}"
        aria-label="${isRevealed ? 'Revealed spoiler' : 'Spoiler, click to reveal'}"
        title="${isRevealed ? 'Spoiler (click to hide)' : 'Spoiler (click to reveal)'}"
        @click="${(e) => this._togglePreviewSpoiler(part.index, e)}"
        @keydown="${(e) => this._onPreviewSpoilerKeyDown(part.index, e)}"
      >${part.content}</span>`;
    });
  }

  _renderReviewPreview(content) {
    if (!content) return '';
    const { synopsis, body } = splitReview(content);
    if (!synopsis) {
      const parts = parseSpoilers(body);
      return html`<div class="review-body">${this._renderPreviewParts(parts)}</div>`;
    }
    const synopsisParts = parseSpoilers(synopsis, 0);
    const spoilerCount = synopsisParts.filter((p) => p.type === 'spoiler').length;
    const bodyParts = parseSpoilers(body, spoilerCount);

    return html`<div class="synopsis" aria-label="Synopsis"><div class="synopsis-label">Synopsis</div><div class="synopsis-text">${this._renderPreviewParts(synopsisParts)}</div></div><div class="review-body">${this._renderPreviewParts(bodyParts)}</div>`;
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
      this.crunchyrollResults = [];
      this.tmdbResults = [];
      this.hasSearched = false;
      window.location.href = '/a/' + cleanTitle(review.title);
    } catch (error) {
      console.warn('Synchronization failed');
      this.showToast('Failed to save review.');
      console.error(error);
    }
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
      this._processCoverImage(valid[0], this.title);
      this._generateClientThumbnail(valid[0], this.title);
    }
  }

  _uploadThumbnail(e) {
    const valid = e.detail?.valid || (e.target?.files ? Array.from(e.target.files) : null);
    if (valid && valid.length) {
      this._generateClientThumbnail(valid[0], this.title);
    }
  }

  _processCoverImage(file, title = '') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let targetWidth = img.width;
          let targetHeight = img.height;
          const maxHeight = 1800;

          if (targetHeight > maxHeight) {
            targetWidth = Math.round(targetWidth * (maxHeight / targetHeight));
            targetHeight = maxHeight;
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          canvas.toBlob((blob) => {
            if (blob) {
              const safeTitle = cleanTitle(title || this.title || 'cover');
              const processedFile = new File([blob], `${safeTitle}.webp`, { type: 'image/webp' });
              this.coverImg = processedFile;
              this.previewCover = window.URL.createObjectURL(blob);
              resolve(processedFile);
            } else {
              this.coverImg = file;
              this.previewCover = window.URL.createObjectURL(file);
              resolve(file);
            }
          }, 'image/webp', 0.88);
        };
        img.onerror = () => {
          this.coverImg = file;
          this.previewCover = window.URL.createObjectURL(file);
          resolve(file);
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        this.coverImg = file;
        this.previewCover = window.URL.createObjectURL(file);
        resolve(file);
      };
      reader.readAsDataURL(file);
    });
  }

  _generateClientThumbnail(file, title = '') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let targetWidth = img.width;
          let targetHeight = img.height;
          const maxHeight = 720;

          if (targetHeight > maxHeight) {
            targetWidth = Math.round(targetWidth * (maxHeight / targetHeight));
            targetHeight = maxHeight;
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          canvas.toBlob((blob) => {
            if (blob) {
              const safeTitle = cleanTitle(title || this.title || 'cover');
              const processedThumb = new File([blob], `${safeTitle}_thumb.webp`, { type: 'image/webp' });
              this.thumbnailImg = processedThumb;
              this.previewThumbnail = window.URL.createObjectURL(blob);
              resolve(processedThumb);
            } else {
              this.thumbnailImg = file;
              this.previewThumbnail = window.URL.createObjectURL(file);
              resolve(file);
            }
          }, 'image/webp', 0.85);
        };
        img.onerror = () => {
          this.thumbnailImg = file;
          this.previewThumbnail = window.URL.createObjectURL(file);
          resolve(file);
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        this.thumbnailImg = file;
        this.previewThumbnail = window.URL.createObjectURL(file);
        resolve(file);
      };
      reader.readAsDataURL(file);
    });
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
          <div class="autofill-header">
            <div>
              <div class="autofill-title">Auto-Fill Anime Info & Vertical Banner</div>
              <div class="autofill-hint">Search Crunchyroll and TMDb simultaneously for metadata and cover art</div>
            </div>
          </div>
          <div class="autofill-row">
            <input
              type="text"
              id="searchQuery"
              class="autofill-input"
              placeholder="Search anime title or paste Crunchyroll/TMDb URL"
              aria-label="Search anime title or paste Crunchyroll/TMDb URL"
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

          ${this._hasSearchResults()
            ? html`
                <div class="results-comparison-box">
                  <div class="results-top-bar">
                    <div class="results-top-title-group">
                      <div class="results-top-title">Compare & Choose Metadata</div>
                      <div class="results-top-subtitle">
                        Select a source to apply, or dismiss to close results.
                      </div>
                    </div>
                    <button
                      type="button"
                      class="dismiss-btn"
                      @click="${this._dismissSearchResults}"
                    >
                      ✕ Dismiss
                    </button>
                  </div>

                  <div class="results-columns">
                    <!-- Crunchyroll Column -->
                    <div class="results-column crunchyroll-column">
                      <div class="column-header">
                        <span class="source-badge crunchyroll">Crunchyroll</span>
                        <span class="column-count">
                          ${this.crunchyrollResults.length} ${this.crunchyrollResults.length === 1 ? 'result' : 'results'}
                        </span>
                      </div>
                      <div class="column-body">
                        ${this.crunchyrollResults.length > 0
                          ? this.crunchyrollResults.map((item) => this._renderResultCard(item, 'crunchyroll'))
                          : html`<div class="no-results-msg">No Crunchyroll results found.</div>`}
                      </div>
                    </div>

                    <!-- TMDb Column -->
                    <div class="results-column tmdb-column">
                      <div class="column-header">
                        <span class="source-badge tmdb">TMDb</span>
                        <span class="column-count">
                          ${this.tmdbResults.length} ${this.tmdbResults.length === 1 ? 'result' : 'results'}
                        </span>
                      </div>
                      <div class="column-body">
                        ${this.tmdbResults.length > 0
                          ? this.tmdbResults.map((item) => this._renderResultCard(item, 'tmdb'))
                          : html`<div class="no-results-msg">No TMDb results found.</div>`}
                      </div>
                    </div>
                  </div>
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
          <div class="genres-header-row">
            <div class="genres-label">Genres</div>
            <button
              type="button"
              class="genre-search-btn"
              @click="${this._searchGoogleGenre}"
              title="${(this.title || this.searchQuery || '').trim() ? `Search Google for &quot;${(this.title || this.searchQuery).trim()} anime genre&quot;` : 'Search Google for anime genre'}"
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16" y2="16"></line>
              </svg>
              <span>Search Google for Genres</span>
            </button>
          </div>
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

        <div class="review-header-row">
          <label class="review-section-label" for="review">Review</label>
          <button
            type="button"
            class="spoiler-toolbar-btn"
            @click="${this._insertSpoilerTag}"
            title="Wrap selected text in ||spoiler|| or insert spoiler tags"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            Add Spoiler
          </button>
        </div>

        <div class="input-container review-input-container">
          <textarea
            id="review"
            class="review-textarea"
            placeholder="First line is a single-sentence synopsis, followed by an empty line, then your review... Wrap spoiler text in ||spoiler|| to black it out."
            aria-label="Review"
            rows="18"
            .value="${this.review || ''}"
            @input="${(e) => {
        this.review = e.target.value;
      }}"
          ></textarea>
        </div>

        <div class="spoiler-hint">
          Tip: First line followed by two newlines is formatted as a <code>Synopsis</code>. Wrap spoiler text in <code>||spoiler text||</code> to black it out.
        </div>

        ${hasSpoilers(this.review)
        ? html`
            <div class="spoiler-preview-card">
              <div class="spoiler-preview-header">
                <span class="spoiler-preview-title">Live Preview</span>
                <span class="spoiler-preview-subtitle">Click blacked-out sections to test</span>
              </div>
              <div class="spoiler-preview-content pre">
                ${this._renderReviewPreview(this.review)}
              </div>
            </div>
          `
        : ''}

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
