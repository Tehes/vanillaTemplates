#!/usr/bin/env deno run --allow-read --allow-write

import { renderTemplateFile } from "../../SSR/ssg.js";
const [templatePath = "./template.html", dataPath = "./data.json", wrapperPath = "./index.html"] = Deno.args;

async function main() {
    // Render the template with data
    const fragment = await renderTemplateFile(templatePath, dataPath);

    // Lese das Wrapper-HTML aus index.html
    const wrapper = await Deno.readTextFile(wrapperPath);
    // Füge den gerenderten Inhalt in das #out-Element ein und entferne den build.js-Script-Tag
    const full = wrapper
        .replace(
            '<div id="out"></div>',
            `<div id="out">${fragment}</div>`
        );

    // Ensure output directory exists and write file
    await Deno.mkdir("./dist", { recursive: true });
    await Deno.writeTextFile("./dist/index.html", full);
    console.log("✅ 06-deno-ssg: dist/index.html erstellt");
}

await main();