/* --------------------------------------------------------------------------------------------------
Imports & data
---------------------------------------------------------------------------------------------------*/

var persons = {
    name: {
        first: "Max",
        last: "Mustermann"
    },
    age: "44",
    friends: [{
            name: "Nils",
            age: 20
        },
        {
            name: "Teddy",
            age: 10
        },
        {
            name: "Nelson",
            age: 40
        },
    ],
    hobbies: ["singing", "dancing", "reading", "cycling"]
};

/* --------------------------------------------------------------------------------------------------
Variables
---------------------------------------------------------------------------------------------------*/


/* --------------------------------------------------------------------------------------------------
functions
---------------------------------------------------------------------------------------------------*/

// transform a string into properties of an object with dot-notation
function chainProps(obj, props) {
    if (!props)
        return obj;
    var propsArr = props.split('.');
    var prop = propsArr.splice(0, 1);
    return chainProps(obj[prop], propsArr.join('.'));
}

function renderTemplate(template, data, domEl) {
    var clone = template.content.cloneNode(true);

    // LOOP TEST AREA
    var loops = clone.querySelectorAll("[data-template-loop]");

    for (let i = 0; i < loops.length; i++) {

        let loopData = loops[i].dataset.templateLoop;
        for (let j = 0; j < data[loopData].length - 1; j++) {
            loops[i].after(loops[i].cloneNode(true));
        }

    }

    loops = clone.querySelectorAll("[data-template-loop]");
    for (let i = 0; i < loops.length; i++) {
        let loopData = loops[i].dataset.templateLoop;
        let loopVars = loops[i].querySelectorAll("[data-template-var]");

        for (let j = 0; j < loopVars.length; j++) {
            if (loopVars[j].textContent === "") {
                // TO DO: Iterate over variables and append index
                // loopVars[j].textContent = loopData + "." + i;
            }
            else {
                loopVars[j].textContent = loopData + "." + i + "." + loopVars[j].textContent;
            }
        }
        loops[i].outerHTML = loops[i].innerHTML;
    }

    // TEST END

    var templateVars = clone.querySelectorAll("[data-template-var]");
    renderTempVar(data, templateVars, domEl, clone);
}

function renderTempVar(data, tempVars, source, appendTarget) {
    for (let values of tempVars) {
        values.outerHTML = chainProps(data, values.textContent);
    }
    source.append(appendTarget);
}

function init() {
    document.addEventListener("touchstart", function() {}, false);

    var personTemplate = document.querySelector("#persons");
    var appendHere = document.querySelector("#here");
    renderTemplate(personTemplate, persons, appendHere);
}

/* --------------------------------------------------------------------------------------------------
public members, exposed with return statement
---------------------------------------------------------------------------------------------------*/
window.app = {
    init
};

app.init();
