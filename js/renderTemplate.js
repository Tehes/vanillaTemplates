/* --------------------------------------------------------------------------------------------------
Version: 0.9

Simple Vanilla JS template engine
    - completely valid HTML syntax
    - no mustaches or other logic to learn
    - uses the <var> element for variables

github repo @ https://github.com/Tehes/vanillaTemplates
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
 * Steps (DOM‑based pipeline):
 *   1. clone template content into a DocumentFragment
 *   2. first pass: duplicate elements annotated with data‑loop
 *   3. second pass: replace loop containers with their children & rewrite <var> paths
 *   4. resolve data‑attr bindings
 *   5. resolve <var> values
 *   6. append finished fragment to target element
 *
 * @param {HTMLTemplateElement} template – the <template> node to instantiate
 * @param {object} data                  – arbitrary JSON‑compatible data object
 * @param {HTMLElement} domEl            – insertion point in the live DOM
 */
export const renderTemplate = (template, data, domEl) => {
    // 1) --- Clone template content (keeps <template> untouched) ---
    const clone = template.content.cloneNode(true);

    // 2) --- FIRST PASS: duplicate elements for each array entry (data-loop) ---
    let loops = clone.querySelectorAll("[data-loop]");
    loops.forEach(loopEl => {
        // mark original loop container with index 0; clones get ascending indices
        loopEl.dataset.templateIteration = 0;

        const loopData = loopEl.dataset.loop;
        const loopArr = data[loopData];
        if (!Array.isArray(loopArr)) {
            throw new TypeError(`data for "${loopData}" must be an array`);
        }
        for (let j = 1; j < loopArr.length; j++) {
            const clonedLoop = loopEl.cloneNode(true);
            clonedLoop.dataset.templateIteration = loopArr.length - j;
            loopEl.after(clonedLoop);
        }
    });

    // 3) --- SECOND PASS: rewrite <var> placeholders inside loop copies & unwrap container ---
    loops = clone.querySelectorAll("[data-loop]");
    loops.forEach(loopEl => {
        const loopData = loopEl.dataset.loop;
        const loopVars = loopEl.querySelectorAll("var");

        loopVars.forEach(varEl => {
            // Build fully qualified data path (e.g. "users.3.name") for each <var>
            if (varEl.textContent === "") {
                varEl.textContent = `${loopData}.${loopEl.dataset.templateIteration}`;
            } else {
                varEl.textContent = `${loopData}.${loopEl.dataset.templateIteration}.${varEl.textContent}`;
            }
        });

        loopEl.replaceWith(...loopEl.childNodes);
    });

    // 4) --- Resolve data-attr bindings (dynamic attributes) ---
    const templateAttr = clone.querySelectorAll("[data-attr]");
    templateAttr.forEach(attrEl => {
        // Destructure "key:path", fetch value from data and set real attribute
        const [key, path] = attrEl.dataset.attr.split(":");
        const value = chainProps(data, path);
        attrEl.setAttribute(key, value);
        attrEl.removeAttribute("data-attr");
    });

    // 5) --- Resolve <var> nodes to real values & strip <var> wrappers ---
    const templateVars = clone.querySelectorAll("var");
    templateVars.forEach(varEl => {
        // inject as plain text (XSS‑safe)
        varEl.textContent = chainProps(data, varEl.textContent);
        varEl.removeAttribute("data-var");
        if (varEl.tagName === "VAR") {
            varEl.replaceWith(...varEl.childNodes);
        }
    });

    // 6) --- Mount rendered fragment into the live DOM ---
    domEl.append(clone);
}
