import { css } from 'lit';

/**
 * Shared styles for article review formatting (body text, synopsis, spoilers).
 * Used by both SarReview and SarAuthorForm.
 */
export const articleStyles = css`
  .pre {
    white-space: pre-wrap;
    font-size: 14px;
    line-height: 1.6;
    user-select: text;
    -webkit-user-select: text;
    word-break: break-word;
  }

  .review-body {
    white-space: pre-wrap;
    line-height: 1.6;
    font-size: 14px;
    user-select: text;
    -webkit-user-select: text;
    word-break: break-word;
  }

  .synopsis {
    display: flow-root;
    position: relative;
    margin: 0 0 20px 0;
    padding: 12px 16px;
    background: var(--synopsis-bg, rgba(186, 104, 200, 0.08));
    border-left: 3px solid var(--synopsis-border, var(--default-primary-color, #BA68C8));
    border-radius: 0 6px 6px 0;
    white-space: normal;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
  }

  .synopsis-label {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--default-primary-color, #BA68C8);
    margin-bottom: 5px;
    user-select: none;
    -webkit-user-select: none;
  }

  .synopsis-text {
    font-size: 14px;
    line-height: 1.5;
    font-style: italic;
    color: var(--synopsis-text, var(--primary-text-color));
    user-select: text;
    -webkit-user-select: text;
  }

  .spoiler {
    display: inline;
    background-color: var(--spoiler-bg, #09090d);
    color: transparent;
    text-shadow: none;
    border-radius: 3px;
    padding: 1px 6px;
    margin: 0 1px;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    transition: background-color 0.2s ease, color 0.15s ease, box-shadow 0.2s ease;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    vertical-align: baseline;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }

  .spoiler:hover:not(.revealed) {
    background-color: var(--spoiler-hover-bg, #1c1c26);
    box-shadow: 0 0 0 1px var(--default-primary-color, #BA68C8);
  }

  .spoiler:focus-visible {
    outline: 2px solid var(--default-primary-color, #BA68C8);
    outline-offset: 1px;
  }

  .spoiler.revealed {
    background-color: var(--spoiler-revealed-bg, rgba(186, 104, 200, 0.14));
    color: var(--primary-text-color);
    user-select: text;
    -webkit-user-select: text;
    border-bottom: 2px solid var(--default-primary-color, #BA68C8);
  }

  .spoiler.revealed:hover {
    background-color: var(--spoiler-revealed-hover-bg, rgba(186, 104, 200, 0.22));
  }

  @media (max-width: 680px) {
    .synopsis {
      margin: 0 0 16px 0;
      padding: 10px 14px;
    }
    .synopsis-text {
      font-size: 15px;
      line-height: 1.6;
    }
    .pre,
    .review-body {
      font-size: 15px;
      line-height: 1.65;
    }
  }
`;
