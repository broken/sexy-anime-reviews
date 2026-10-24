export const cleanTitle = (title) => (title ? title.replace(/[^a-zA-Z0-9]/g, '') : '');
export const dbTitle = (title) => (title ? title.replace(/\//g, '') : '');

if (typeof window !== 'undefined') {
  window.cleanTitle = window.cleanTitle || cleanTitle;
  window.dbTitle = window.dbTitle || dbTitle;
}
