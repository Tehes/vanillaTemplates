import { renderTemplate } from './renderTemplate.js'; // adjust path if necessary
/* --------------------------------------------------------------------------------------------------
Loader-Function
---------------------------------------------------------------------------------------------------*/
/**
 * Loads JSON data, an external HTML template and mounts the rendered fragment.
 * @param {string}  dataPath     – URL of the JSON file
 * @param {string}  templatePath – URL of the raw HTML template
 * @param {Element} mountEl      – DOM element where the result will be inserted
 */
export async function loadDataAndTemplate(dataPath, templatePath, mountEl) {
    try {
        // load data
        const dataResp = await fetch(dataPath);
        if (!dataResp.ok) throw new Error(dataResp.statusText);
        const data = await dataResp.json();

        // load template
        const tplResp = await fetch(templatePath);
        if (!tplResp.ok) throw new Error(tplResp.statusText);
        const tplHtml = (await tplResp.text()).trim();

        // Template-String → real <template>
        const templateEl = document.createElement('template');
        templateEl.innerHTML = tplHtml;

        renderTemplate(templateEl, data, mountEl);
    } catch (err) {
        console.error('Ladevorgang fehlgeschlagen:', err);
    }
}