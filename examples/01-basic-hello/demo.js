import { loadDataAndTemplate } from '../../browser/loader.js'; // adjust path if necessary

loadDataAndTemplate(
    './data.json',      // JSON file (stays in this example folder)
    './template.html',  // HTML template (same folder)
    document.querySelector('#out')   // Mount point defined in index.html
);