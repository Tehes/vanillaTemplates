import { loadDataAndTemplate } from "../../browser/loader.js";

const mountEl = document.querySelector("#out");

const setStatus = (text) => {
    const statusEl = mountEl.querySelector("#status");
    if (statusEl) statusEl.textContent = text;
};

loadDataAndTemplate(
    "./data.json",
    "./template.html",
    mountEl,
    {
        replace: true,
        events: {
            onSave() {
                setStatus(`Saved at ${new Date().toLocaleTimeString()}`);
            },
            onHover() {
                setStatus("Hovering over the box");
            },
            onLeave() {
                setStatus("Pointer left the box");
            },
        },
    },
);
