/* --------------------------------------------------------------------------------------------------
Version: 0.8

Simple Vanilla JS template engine
    - completely valid HTML syntax
    - no mustaches or other logic to learn
    - uses the <var> element for variables

github repo @ https://github.com/Tehes/vanillaTemplates
---------------------------------------------------------------------------------------------------*/

// transform a string into properties of an object with dot-notation
function chainProps(obj, props) {
    if (!props)
        return obj;
    var propsArr = props.split('.');
    var prop = propsArr.splice(0, 1);
    return chainProps(obj[prop], propsArr.join('.'));
}

export function renderTemplate(template, data, domEl) {
    var clone = template.content.cloneNode(true);

    //Loops
    var loops = clone.querySelectorAll("[data-loop]");
    for (let i = 0; i < loops.length; i++) {
		loops[i].dataset.templateIteration = 0;

        let loopData = loops[i].dataset.loop;
        for (let j = 1; j < data[loopData].length; j++) {
			var clonedLoop = loops[i].cloneNode(true);
			clonedLoop.dataset.templateIteration = data[loopData].length-j;
            loops[i].after(clonedLoop);
        }
    }

    loops = clone.querySelectorAll("[data-loop]");
    for (let i = 0; i < loops.length; i++) {
        let loopData = loops[i].dataset.loop;
        let loopVars = loops[i].querySelectorAll("var");

        for (let j = 0; j < loopVars.length; j++) {
            if (loopVars[j].textContent === "") {
                // TO DO: Iterate over variables and append index
                loopVars[j].textContent = loopData + "." + loops[i].dataset.templateIteration;
            }
            else {
                loopVars[j].textContent = loopData + "." + loops[i].dataset.templateIteration + "." + loopVars[j].textContent;
            }
        }
        loops[i].outerHTML = loops[i].innerHTML;
    }

    //Attributes
    var templateAttr = clone.querySelectorAll("[data-attr]");

    for (let values of templateAttr) {
        let attr = values.dataset.attr.split(":");
        let key = attr[0];
        let value = chainProps(data, attr[1]);
        values.setAttribute(key, value);
        values.removeAttribute("data-attr");
    }

    //Variables
    var templateVars = clone.querySelectorAll("var");
    for (let values of templateVars) {
        values.innerHTML = chainProps(data, values.textContent);
        values.removeAttribute("data-var");
        if (values.tagName === "VAR") {
            values.outerHTML = values.innerHTML;
        }
    }

    domEl.append(clone);
}
