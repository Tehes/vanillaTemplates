#!/usr/bin/env deno run --allow-read --allow-write

import { renderTemplateFile } from "../../SSR/ssg.js";

async function main() {
    // 1) Render template and data
    const html = await renderTemplateFile(
        "./template.html",
        "./data.json"
    );

    // 2) Create the dist directory and write the rendered HTML
    await Deno.mkdir("./dist", { recursive: true });
    await Deno.writeTextFile("./dist/index.html", html);

    console.log("✅ 06-deno-ssg: dist/index.html erstellt");
}

await main();
