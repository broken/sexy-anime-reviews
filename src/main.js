import * as firebaseService from './services/firebase.js';
import { cleanTitle } from './services/firebase.js';
import '../components/sar/sar-card.js';
import '../components/sar/sar-card-container.js';
import '../components/sar/sar-review.js';

if (typeof window !== 'undefined') {
  window.cleanTitle = cleanTitle;
  window.dbTitle = (title) => (title ? title.replace(/\//g, '') : '');
}

export { firebaseService };
