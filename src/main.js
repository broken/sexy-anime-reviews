import * as firebaseService from './services/firebase.js';
import { cleanTitle, dbTitle } from '../components/sar/util.js';
import '../components/sar/sar-card.js';
import '../components/sar/sar-card-container.js';
import '../components/sar/sar-review.js';

if (typeof window !== 'undefined') {
  window.cleanTitle = window.cleanTitle || cleanTitle;
  window.dbTitle = window.dbTitle || dbTitle;
}

export { firebaseService };
