/* --------------------------------------------------------------------------------------------------
Version: 0.16.0

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
 *   • data-loop="items"   – repeats element for each entry in data.items or object maps
 *   • data-if="expr"      – conditionally render elements based on boolean expressions
 *   • data-attr="src:path"– sets HTML attributes (e.g., src, href, alt) from data.path
 *   • data-style="prop:path" – sets CSS style properties on elements from data.path
 *   • <var>path</var>     – text placeholders resolved from data, including within loops
 *
 * Uses a **single recursive walk**, which
 *   – naturally supports nested loops,
 *   – needs no post-processing “passes”,
 *   – keeps data‑context isolated per recursion level.
 *
 * @param {HTMLTemplateElement} template – the <template> node to instantiate
 * @param {object} data                  – arbitrary JSON‑compatible data object
 * @param {HTMLElement} domEl            – insertion point in the live DOM
 * @param {object} [options]             – optional parameters
 * @param {boolean} [options.replace=false] – if true, clears the target container before rendering
 * @returns {Promise<DocumentFragment>} – resolves when rendering (including includes) is complete
 */
export const renderTemplate = async (template, data, domEl, { replace = false } = {}) => {
    // Optionally clear existing content
    if (replace) domEl.textContent = '';
    const frag = template.content.cloneNode(true);
    await walk(frag, data);
    domEl.append(frag);
    return frag;
};

/**
 * Recursively processes a node and its children in place.
 * @param {Node} node
 * @param {object|*} ctx – current data context (may be primitive inside inner loops)
 */
async function walk(node, ctx) {
    // Convert NodeList to static array because we mutate during walk
    for (const child of [...node.childNodes]) {
        // Drop HTML comments so they don't appear in output
        if (child.nodeType === Node.COMMENT_NODE) {
            child.remove();
            continue;
        }
        // 1. Handle element nodes
        if (child.nodeType === Node.ELEMENT_NODE) {
            const el = /** @type {HTMLElement} */ (child);

            /* --- data-include -------------------------------------------------- */
            if (el.dataset.include) {
                const src = el.dataset.include;
                const response = await fetch(src);
                const html = await response.text();
                const tmp = document.createElement('template');
                tmp.innerHTML = html;
                const partialFrag = tmp.content.cloneNode(true);
                await walk(partialFrag, ctx);
                el.replaceWith(...partialFrag.childNodes);
                continue;
            }

            /* --- data-if -------------------------------------------------- */
            if (el.dataset.if) {
                let expr = el.dataset.if.trim();
                let invert = false;
                if (expr.startsWith('!')) {
                    invert = true;
                    expr = expr.slice(1).trim();
                }
                const raw = chainProps(ctx, expr);
                let cond = Boolean(raw);
                if (invert) cond = !cond;
                el.removeAttribute('data-if');
                if (!cond) {
                    el.remove();
                    continue; // remove falsy block
                }
                // For <var> wrappers, unwrap children and continue processing them
                if (el.tagName === 'VAR') {
                    const children = [...el.childNodes];
                    el.before(...children);
                    el.remove();
                    for (const child of children) {
                        await walk(child, ctx);
                    }
                    continue;
                }
            }
            /* --- data-loop -------------------------------------------------- */
            if (el.dataset.loop) {
                const src = chainProps(ctx, el.dataset.loop);

                // Helper: clone element, recurse with new ctx, unwrap children
                const processItem = async (itemCtx) => {
                    const clone = el.cloneNode(true);
                    clone.removeAttribute('data-loop');
                    await walk(clone, itemCtx);
                    el.before(...clone.childNodes);
                };

                if (Array.isArray(src)) {
                    const len = src.length;
                    for (let idx = 0; idx < len; idx++) {
                        const item = src[idx];
                        const baseCtx = (item && typeof item === 'object')
                            ? { ...item }
                            : { _value: item };
                        const itemCtx = {
                            ...baseCtx,
                            _index: idx,
                            _first: idx === 0,
                            _last: idx === len - 1
                        };
                        await processItem(itemCtx);
                    }
                } else if (src && typeof src === 'object') {
                    const entries = Object.entries(src);
                    for (let idx = 0; idx < entries.length; idx++) {
                        const [key, val] = entries[idx];
                        // If the value is an array, treat it as a primitive-like _value for nested loops
                        const itemCtx = Array.isArray(val)
                            ? { _key: key, _value: val, _index: idx }
                            : (val && typeof val === 'object'
                                ? { ...val, _key: key, _index: idx }
                                : { _key: key, _value: val, _index: idx }
                            );
                        await processItem(itemCtx);
                    }
                } else {
                    throw new TypeError(
                        `data for "${el.dataset.loop}" must be array or object`
                    );
                }

                el.remove(); // drop original loop container
                continue;      // loop handled – skip further processing
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
                    path === ''
                        ? (ctx && typeof ctx === 'object' && '_value' in ctx
                            ? ctx._value
                            : ctx)
                        : chainProps(ctx, path);
                el.replaceWith(document.createTextNode(value ?? ''));
                continue; // placeholder resolved – do not walk children
            }

            // Normal element → recurse into its children
            await walk(el, ctx);

        } else if (child.nodeType === Node.TEXT_NODE) {
            // text node – nothing to do
        }
    }
}
