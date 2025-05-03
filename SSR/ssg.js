#!/usr/bin/env deno run --allow-read

import { DOMParser, Node } from "https://deno.land/x/deno_dom@v0.1.48/deno-dom-wasm.ts";
import { renderTemplate } from "../core/renderTemplate.js";

globalThis.Node = Node; // Required for renderTemplate

/**
 * Loads an HTML template file and a JSON data file,
 * renders them, and returns the final HTML as a string.
 *
 * @param {string} templatePath Path to the template.html
 * @param {string} dataPath     Path to the data.json
 * @returns {Promise<string>}   Rendered HTML string
 */
export async function renderTemplateFile(templatePath, dataPath) {
  // 1) Read files
  const [tplHtml, dataJson] = await Promise.all([
    Deno.readTextFile(templatePath),
    Deno.readTextFile(dataPath),
  ]);
  const data = JSON.parse(dataJson);

  // 2) Parse into a Document with <template>
  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<body><template>${tplHtml}</template></body>`,
    "text/html"
  );
  if (!doc) throw new Error("Parsing the template failed");
  globalThis.document = doc;

  const tpl = doc.querySelector("template");
  if (!tpl) throw new Error("No <template> in " + templatePath);

  // 3) Render and remove the template tag
  renderTemplate(tpl, data, doc.body);
  // Remove any remaining <template> tags, if present
  doc.querySelectorAll('template').forEach(el => el.remove());

  // 4) Return the result
  return doc.body.innerHTML;
}