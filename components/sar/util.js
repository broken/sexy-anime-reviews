export const cleanTitle = (title) => (title ? title.replace(/[^a-zA-Z0-9]/g, '') : '');
export const dbTitle = (title) => (title ? title.replace(/[\/.$#\[\]]/g, '') : '');

/**
 * Parses a review text string into an array of text and spoiler parts.
 * Syntax: ||spoiler text||
 * @param {string} text
 * @param {number} [startIndex=0]
 * @returns {Array<{type: 'text'|'spoiler', content: string, index?: number}>}
 */
export function parseSpoilers(text, startIndex = 0) {
  if (!text) return [];
  const regex = /\|\|([\s\S]+?)\|\|/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let spoilerIndex = startIndex;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }
    parts.push({
      type: 'spoiler',
      content: match[1],
      index: spoilerIndex++,
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  return parts;
}

/**
 * Checks whether text contains at least one spoiler section.
 * @param {string} text
 * @returns {boolean}
 */
export function hasSpoilers(text) {
  if (!text) return false;
  return /\|\|[\s\S]+?\|\|/.test(text);
}

/**
 * Splits review text into synopsis (first line if followed by two newlines) and main review body.
 * @param {string} text
 * @returns {{synopsis: string, body: string}}
 */
export function splitReview(text) {
  if (!text) return { synopsis: '', body: '' };
  const trimmed = text.trimStart();
  const match = trimmed.match(/^([^\r\n]+)\r?\n\s*\r?\n([\s\S]*)$/);
  if (match) {
    return {
      synopsis: match[1].trim(),
      body: match[2].trimStart(),
    };
  }
  return {
    synopsis: '',
    body: text,
  };
}

if (typeof window !== 'undefined') {
  window.cleanTitle = window.cleanTitle || cleanTitle;
  window.dbTitle = window.dbTitle || dbTitle;
  window.parseSpoilers = window.parseSpoilers || parseSpoilers;
  window.hasSpoilers = window.hasSpoilers || hasSpoilers;
  window.splitReview = window.splitReview || splitReview;
}

