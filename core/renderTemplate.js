/* --------------------------------------------------------------------------------------------------
Version: 0.10.1

Simple Vanilla JS template engine
    - completely valid HTML syntax
    - no mustaches or other logic to learn
    - uses the <var> element for variables

github repo @https://github.com/Tehes/vanillaTemplates
---------------------------------------------------------------------------------------------------*/

/**
 * Traverses an object via dot‑notation path.
 *
 * @param {object} obj   – base object that contains the data
 * @param {string} props – dot‑separated path (e.g. "user.address.city")
 * @returns {*}          – the resolved value or `undefined` if any segment is missing
 *
 * Uses optional chaining so intermediate `undefined` values do not throw.
 */
const chainProps = (obj, props) =>
    !props ? obj : props.split('.').reduce((o, k) => o?.[k], obj);

/**
 * Renders a <template> element into live DOM using declarative directives.
 *
 * Supported directives:
 *   • data-loop="items"   – repeats element for each entry in data.items
 *   • data-attr="src:path"– sets real attribute (here: src) from data.path
 *   • <var>path</var>     – text/HTML placeholders resolved from data
 *
 * Now uses a **single recursive walk**, which
 *   – naturally supports nested loops,
 *   – needs no post-processing “passes”,
 *   – keeps data‑context isolated per recursion level.
 *
 * @param {HTMLTemplateElement} template – the <template> node to instantiate
 * @param {object} data                  – arbitrary JSON‑compatible data object
 * @param {HTMLElement} domEl            – insertion point in the live DOM
 */
export const renderTemplate = (template, data, domEl) => {
    const fragment = template.content.cloneNode(true);
    walk(fragment, data);
    domEl.append(fragment);
};

/**
 * Recursively processes a node and its children in place.
 * @param {Node} node
 * @param {object|*} ctx – current data context (may be primitive inside inner loops)
 */
function walk(node, ctx) {
    // Convert NodeList to static array because we mutate during walk
    [...node.childNodes].forEach(child => {
        // 1. Handle element nodes
        if (child.nodeType === Node.ELEMENT_NODE) {
            const el = /** @type {HTMLElement} */ (child);

            /* --- data-loop -------------------------------------------------- */
            if (el.dataset.loop) {
                const arr = chainProps(ctx, el.dataset.loop);
                if (!Array.isArray(arr)) {
                    throw new TypeError(`data for "${el.dataset.loop}" must be an array`);
                }

                arr.forEach(item => {
                    const clone = el.cloneNode(true);
                    clone.removeAttribute('data-loop'); // avoid re‑entering
                    walk(clone, item);                  // recurse with loop item
                    el.before(...clone.childNodes);     // unwrap clone content
                });

                el.remove(); // drop original loop container
                return;      // loop handled – skip further processing
            }

            /* --- data-style -------------------------------------------------- */
            if (el.dataset.style) {
                el.dataset.style
                    .split('|')
                    .forEach(pair => {
                        const [prop, path] = pair.split(':');
                        const value = chainProps(ctx, path);
                        if (value != null) {
                            el.style.setProperty(prop, value);
                        }
                    });
                el.removeAttribute('data-style');
            }

            /* --- data-attr -------------------------------------------------- */
            if (el.dataset.attr) {
                el.dataset.attr                       // e.g. "src:avatar|alt:name"
                    .split('|')                       // => ["src:avatar", "alt:name"]
                    .forEach(binding => {
                        const [key, path] = binding.split(':');
                        el.setAttribute(key, chainProps(ctx, path));
                    });
                el.removeAttribute('data-attr');      // keep final DOM clean
            }

            /* --- <var> placeholders (element version) ---------------------- */
            if (el.tagName === 'VAR') {
                const path = el.textContent.trim();
                const value =
                    path === '' ? ctx : chainProps(ctx, path);
                el.replaceWith(document.createTextNode(value ?? ''));
                return; // placeholder resolved – do not walk children
            }

            // Normal element → recurse into its children
            walk(el, ctx);

        } else if (child.nodeType === Node.TEXT_NODE) {
            // text node – nothing to do
        }
    });
}
