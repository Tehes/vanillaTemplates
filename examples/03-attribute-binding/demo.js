import { loadDataAndTemplate } from '../../js/loader.js';

loadDataAndTemplate(
    './data.json',       // JSON file
    './template.html',   // HTML template
    document.querySelector('#out')   // mount point
);