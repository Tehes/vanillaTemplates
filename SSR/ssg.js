#!/usr/bin/env deno run --allow-read

import { DOMParser, Node } from "https://deno.land/x/deno_dom@v0.1.48/deno-dom-wasm.ts";
import { renderTemplate } from "../core/renderTemplate.js";

globalThis.Node = Node; // Required for renderTemplate

/**
 * Loads a full HTML template file and a JSON data file,
 * renders all <template> tags in place, and returns the complete HTML document.
 *
 * @param {string} templatePath Path to the full HTML template file (e.g., index.html with <template> tags).
 * @param {string} dataPath     Path to the JSON data file.
 * @returns {Promise<string>}   Fully rendered HTML document, including <!DOCTYPE>.
 */
export async function renderTemplateFile(templatePath, dataPath) {
  // 1) Read the full HTML template and JSON data
  const [htmlContent, dataJson] = await Promise.all([
    Deno.readTextFile(templatePath),
    Deno.readTextFile(dataPath),
  ]);
  const data = JSON.parse(dataJson);

  // 2) Parse the complete HTML document
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  if (!doc) throw new Error(`Parsing the HTML template failed: ${templatePath}`);
  globalThis.document = doc;

  // 3) Render each <template> tag in place and remove it
  const templates = Array.from(doc.querySelectorAll("template"));
  for (const tpl of templates) {
    renderTemplate(tpl, data, tpl.parentNode);
    tpl.remove();
  }

  // 4) Serialize and return the full document
  // Remove whitespace-only text nodes from body to eliminate blank lines
  function removeWhitespaceNodes(node) {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE && !child.textContent.trim()) {
        child.remove();
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        removeWhitespaceNodes(child);
      }
    }
  }
  removeWhitespaceNodes(doc.body);
  // Serialize and return the full document including DOCTYPE
  const dt = doc.doctype ? `<!DOCTYPE ${doc.doctype.name}>\n` : "";
  let result = dt + doc.documentElement.outerHTML;
  // Collapse multiple blank lines (including lines with only whitespace)
  result = result.replace(/\n\s*\n/g, '\n');
  return result;
}