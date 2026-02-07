import { renderTemplate } from '../core/renderTemplate.js'; // adjust path if necessary

/**
 * Loads JSON data, an external HTML template and mounts the rendered fragment.
 * @param {string}  dataPath     – URL of the JSON file
 * @param {string}  templatePath – URL of the raw HTML template
 * @param {Element} mountEl      – DOM element where the result will be inserted
 * @param {object} [options]     – optional renderTemplate options (e.g. replace/events)
 */
export async function loadDataAndTemplate(dataPath, templatePath, mountEl, options = {}) {
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

        await renderTemplate(templateEl, data, mountEl, options);
    } catch (err) {
        console.error('Ladevorgang fehlgeschlagen:', err);
    }
}
