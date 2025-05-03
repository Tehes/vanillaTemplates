import { loadDataAndTemplate } from '../../js/loader.js';

loadDataAndTemplate(
    './data.json',      // JSON file (stays in this example folder)
    './template.html',  // HTML template (same folder)
    document.querySelector('#out')   // Mount point defined in index.html
);