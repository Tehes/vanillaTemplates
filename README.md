# Vanilla JS Template Engine

A lightweight and simple JavaScript template engine that uses valid HTML syntax
and `<var>` elements for data binding, offering built-in directives for:

- Loops with `data-loop`
- Conditional rendering with `data-if`
- Attribute binding with `data-attr`
- Style binding with `data-style`
- Event binding with `data-event`
- Includes via `data-include`

It provides a minimalistic solution to dynamically populate HTML templates with
JavaScript data, without needing any specialized template language.

## Features

- **Valid HTML Syntax**: The engine uses standard HTML elements and attributes,
  with no need for a custom template language or syntax.
- **Data Binding with `<var>`**: Inject JavaScript data into HTML using `<var>`
  as placeholders.
- **Loop Support**: Iterate over arrays and object maps with `data-loop`,
  creating dynamic lists and exposing context helpers.
- **Conditional Rendering with `data-if`**: Show or hide elements based on
  boolean expressions, including negation for inverse logic.
- **Attribute Binding with `data-attr`**: Dynamically set any HTML attribute
  (e.g., `src`, `href`, `alt`) from data.
- **Style Binding with `data-style`**: Dynamically set CSS style properties on
  elements.
- **Event Binding with `data-event`**: Declaratively bind DOM event listeners
  via an explicit `events` map.
- **Includes with `data-include`**: Load and render external HTML partials via
  `<var data-include>`.
- **Per-Render Include De-Duplication**: Within one `renderTemplate(...)` call,
  repeated includes with the same `src` are fetched only once.
- **Nested Loops & Context Helpers**: Support nested loops with helper variables
  `_index`, `_first`, `_last`, `_key`, and `_value` for advanced templating
  scenarios.
- **Single DOM Walk**: Perform a single recursive traversal for efficient
  performance.
- **Zero DOM Footprint**: Strip out all `<var>` placeholders and directive
  wrappers after rendering, leaving only final HTML.
- **XSS Safety & Error Handling**: Inject content via `textContent` to prevent
  XSS and throw descriptive errors for invalid bindings.

## Why `<var>`?

HTML already defines the
[`<var>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/var)
for “variables” in a broad sense.\
In addition to serving as placeholders, `<var>` elements are also used as
directive wrappers for grouping and applying loop (`data-loop`), conditional
(`data-if`), and include (`data-include`) logic to multiple nodes. Using it as a
**placeholder tag** brings three advantages:

1. **Valid Mark‑up** – Your template stays 100 % HTML; no proprietary braces
   like `{{name}}`.
2. **Editor Support** – Because it’s a real element, you get syntax
   highlighting, auto‑closing tags and can nest it anywhere.
3. **Clean Output** – During rendering, every `<var>` (and any `<var data-loop>`
   container) is replaced with its resolved content and then removed with
   `replaceWith`. The browser never sees the placeholder after hydration.

**Tip:** Two special cases use empty `<var>` tags:

1. **Loop container**\
   A `<var>` that carries `data-loop="items"` but no inner text works as the
   wrapper that gets duplicated. After rendering, the wrapper vanishes – your
   DOM stays clean.

2. **Primitive array item**\
   Inside a loop over an array of primitive values (strings, numbers …), leave
   the inner `<var>` empty. The engine will substitute it with the _current
   item_.

   ```html
   <var data-loop="user.hobbies">
       <li><var></var></li>
   </var>
   <!-- produces <li>Reading</li> … -->
   ```

## Basic Usage

### HTML Template Example

```html
<h2>Hello <var>name</var>!</h2>
<p>You got <var>todos.length</var> To-do(s).</p>
```

### JSON Example

```json
{
    "name": "John Doe",
    "todos": [
        "read documentation",
        "drink green tea"
    ]
}
```

This will produce:

```html
<h2>Hello John Doe!</h2>
<p>You got 2 To-do(s).</p>
```

## Includes

```html
<!-- Include a user profile partial -->
<var data-include="profile.html"></var>

<!-- Loop over a list of items -->
<ul>
    <var data-loop="items">
        <li><var></var></li>
    </var>
</ul>
```

## API

```js
/**
 * Renders a <template> element into the DOM.
 *
 * @param {HTMLTemplateElement} template - the <template> element to render.
 * @param {object} data - the data object for binding.
 * @param {HTMLElement} target - the container to append rendered content.
 * @param {object} [options]
 * @param {boolean} [options.replace=false] - if true, clears target before rendering.
 * @param {Record<string, Function>} [options.events] - explicit event handlers for data-event.
 */
renderTemplate(template, data, target, { replace = false, events } = {});

// Example usage:
// Append mode:
renderTemplate(tpl, data, target);
// Replace mode:
renderTemplate(tpl, data, target, { replace: true });
// Declarative event binding:
renderTemplate(tpl, data, target, { events: { onSave, onHover, onLeave } });
```

## Data Binding

The engine uses `<var>` elements to bind data from JavaScript objects to HTML
elements. The text inside the `<var>` tag corresponds to the key or nested key
of the object.

### Example

```html
<var>user.name</var>
<!-- This will be replaced by the value of user.name from the data object -->
```

## Looping Over Data

To handle arrays, the engine provides a `data-loop` attribute. When applied to
an element, it will iterate over the corresponding array in the data and
duplicate the element for each item.

### HTML Loop Example

```html
<ul>
    <var data-loop="todos">
        <li><var></var></li>
    </var>
</ul>
```

<!-- Repeats for each hobby in the user.hobbies array -->

### JSON Example

```json
{
    "todos": [
        "Read documentation",
        "Make green tea",
        "Write code",
        "Deploy app"
    ]
}
```

This will produce:

```html
<ul>
    <li>Read documentation</li>
    <li>Make green tea</li>
    <li>Write code</li>
    <li>Deploy app</li>
</ul>
```

### Looping over Object Properties

`data-loop` also accepts a plain object.\
Inside such a loop you get five helper keys:

| Helper                            | Meaning                        |
| --------------------------------- | ------------------------------ |
| `_key`                            | current property name          |
| `_value` (or empty `<var></var>`) | current value (for primitives) |
| `_index`                          | zero-based counter             |
| `_first`                          | `true` for the first entry     |
| `_last`                           | `true` for the last entry      |

```html
<dl class="settings-list">
    <var data-loop="settings">
        <dt>
            <strong>#<var>_index</var></strong>
            — <var>_key</var>
            <span data-if="_first">(first)</span>
            <span data-if="_last">(last)</span>:
        </dt>
        <dd><var></var></dd>
    </var>
</dl>
```

```json
{
    "settings": {
        "theme": "dark",
        "language": "de",
        "itemsPerPage": 20,
        "autoSave": true,
        "welcomeMessage": "Hello, Tino!",
        "maxUploadSizeMB": 50
    }
}
```

renders as:

```html
<dl class="settings-list">
    <dt>
        <strong>#0</strong>
        — theme <span>(first)</span>:
    </dt>
    <dd>dark</dd>

    <dt>
        <strong>#1</strong>
        — language:
    </dt>
    <dd>de</dd>

    <dt>
        <strong>#2</strong>
        — itemsPerPage:
    </dt>
    <dd>20</dd>

    <dt>
        <strong>#3</strong>
        — autoSave:
    </dt>
    <dd>true</dd>

    <dt>
        <strong>#4</strong>
        — welcomeMessage:
    </dt>
    <dd>Hello, Tino!</dd>

    <dt>
        <strong>#5</strong>
        — maxUploadSizeMB <span>(last)</span>:
    </dt>
    <dd>50</dd>
</dl>
```

### Advanced Example

This example focuses on how the object-map loop exposes `_key` and `_value` (an
array) so you can nest a second loop over each section’s items.

```json
{
    "sections": {
        "Work Experience": [
            {
                "title": "Senior Software Engineer",
                "company": "Acme Tech Co.",
                "period": "Jan 2021 – Present"
            },
            {
                "title": "Full-Stack Developer",
                "company": "Bright Solutions LLC",
                "period": "Jun 2018 – Dec 2020"
            }
        ],
        "Education": [
            {
                "title": "M.Sc. Computer Science, University of Westshire",
                "period": "Sep 2016 – May 2018"
            },
            {
                "title": "B.Sc. Information Technology, Eastfield College",
                "period": "Sep 2012 – May 2016"
            }
        ]
    }
}
```

```html
<!-- Outer loop: iterate object map of sections -->
<var data-loop="sections">
    <section>
        <!-- Section title from the key -->
        <h3><var>_key</var></h3>

        <!-- Inner loop: iterate the array in _value -->
        <ul>
            <var data-loop="_value">
                <li>
                    <strong><var>title</var></strong>
                    <var data-if="company"> @ <var>company</var></var>
                    <br>
                    <small><var>period</var></small>
                </li>
            </var>
        </ul>
    </section>
</var>
```

renders as:

```html
<section>
    <h3>Work Experience</h3>
    <ul>
        <li>
            <strong>Senior Software Engineer</strong> @ Acme Tech Co.<br>
            <small>Jan 2021 – Present</small>
        </li>
        <li>
            <strong>Full-Stack Developer</strong> @ Bright Solutions LLC<br>
            <small>Jun 2018 – Dec 2020</small>
        </li>
    </ul>
</section>

<section>
    <h3>Education</h3>
    <ul>
        <li>
            <strong>M.Sc. Computer Science, University of Westshire</strong>
            <br>
            <small>Sep 2016 – May 2018</small>
        </li>
        <li>
            <strong>B.Sc. Information Technology, Eastfield College</strong>
            <br>
            <small>Sep 2012 – May 2016</small>
        </li>
    </ul>
</section>
```

### Nested Loops

Sometimes you need to loop inside a loop – for example, departments ➜ employees:

```html
<var data-loop="departments">
    <h3><var>name</var></h3>
    <ul>
        <var data-loop="employees">
            <li>
                <var>name</var> – <var>role</var>
            </li>
        </var>
    </ul>
</var>
```

The engine simply recurses, so each inner `data-loop` uses the item of the outer
loop as its data context.

### Empty `<var>` Explained

When the current loop item is **a primitive value**—either because you’re
looping over an array of primitives **or** over the _values_ of an object map—an
empty `<var></var>` outputs that value directly.

#### Primitive Array

```html
<div class="badges">
    <var data-loop="badges">
        <span class="badge"><var></var></span>
    </var>
</div>
```

```json
{
    "badges": ["New", "Sale", "Featured"]
}
```

renders as:

```html
<div class="badges">
    <span class="badge">New</span>
    <span class="badge">Sale</span>
    <span class="badge">Featured</span>
</div>
```

#### Object Map

```html
<dl>
    <var data-loop="settings">
        <dt><var>_key</var></dt>
        <dd><var></var></dd>
        <!-- empty <var> = current value -->
    </var>
</dl>
```

```json
{
    "settings": {
        "theme": "dark",
        "itemsPerPage": 20
    }
}
```

renders as:

```html
<dl>
    <dt>theme</dt>
    <dd>dark</dd>
    <dt>itemsPerPage</dt>
    <dd>20</dd>
</dl>
```

## Attribute Binding

The `data-attr` attribute allows you to dynamically set the value of an HTML
attribute, such as `src`, `href`, or `alt`.

You can bind **multiple attributes at once** by separating each
`attribute:dataPath` pair with a pipe character (`|`):

### Single‑Attribute Example

```html
<img data-attr="src:user.avatar">
<!-- The image source will be set dynamically -->
```

**Data**

```json
{
    "user": {
        "avatar": "https://example.com/avatar.jpg"
    }
}
```

**Result**

```html
<img src="https://example.com/avatar.jpg">
```

## Style Binding

The `data-style` attribute allows you to dynamically set CSS style properties.
Separate multiple declarations with `|` using the format `property:dataPath`.

### Example

```html
<a
    data-attr="href:href"
    data-style="color:textColor|background-color:bgColor|padding:padding"
>
    <var>label</var>
</a>
```

```json
{
    "href": "https://example.com",
    "textColor": "#ffffff",
    "bgColor": "#007bff",
    "padding": "0.5em 1em",
    "label": "Click me"
}
```

this renders as:

```html
<a
    href="https://example.com"
    style="color: #ffffff; background-color: #007bff; padding: 0.5em 1em"
>
    Click me
</a>
```

### Multiple‑Attribute Example

Using the pipe (`|`) you can set several attributes at once:

```html
<img data-attr="src:user.avatar|alt:user.name">
```

**Data**

```json
{
    "user": {
        "avatar": "https://example.com/avatar.jpg",
        "name": "Jane Doe"
    }
}
```

**Result**

```html
<img src="https://example.com/avatar.jpg" alt="Jane Doe">
```

## Event Binding

Use `data-event` for a minimal declarative shortcut to `addEventListener`.
The value format is:

`eventName:handlerName|eventName:handlerName`

### Single Event Example

```html
<button data-event="click:onSave">Save</button>
```

### Multiple Events Example

```html
<div data-event="mouseenter:onHover|mouseleave:onLeave"></div>
```

```js
renderTemplate(template, data, target, {
    events: {
        onSave(event) {
            console.log("saved", event.currentTarget);
        },
        onHover() {
            console.log("hover in");
        },
        onLeave() {
            console.log("hover out");
        }
    }
});
```

Rules:

- `data-event` is only processed when `events` is passed to `renderTemplate`.
- Handler names are resolved only from `options.events` (no global lookup).
- In SSR/static rendering workflows, `events` is ignored (no runtime event listeners are attached).
- Missing handlers throw:
  `TypeError("Missing event handler: ...")`.
- No modifiers (`.prevent`, `.once`, `.stop`), no arguments, no delegation,
  and no expression/eval support.

## Conditional Rendering

With `data-if`, you can conditionally render elements based on boolean values.
If the condition is falsy, the element will be removed entirely.

### Example

```html
<ul>
    <var data-loop="todos">
        <var data-if="done">
            <li>✔ <var>task</var></li>
        </var>
        <var data-if="!done">
            <li>✖ <var>task</var></li>
        </var>
    </var>
</ul>
```

```json
{
    "todos": [
        { "task": "Write docs", "done": true },
        { "task": "Publish release", "done": false },
        { "task": "Clean up code", "done": false }
    ]
}
```

This will produce:

```html
<ul>
    <li>✔ Write docs</li>
    <li>✖ Publish release</li>
    <li>✖ Clean up code</li>
</ul>
```

## Wrapper vs Direct Directives

Your template engine supports applying directives either directly to real DOM
elements or using `<var>` wrappers when grouping is needed. This applies to
loops, conditionals, and other bindings.

- **Direct Directive on Element**\
  Attach directives like `data-loop`, `data-if`, `data-attr`, `data-style`, or `data-event`
  directly to the element you wish to repeat, show/hide, or bind
  attributes/styles/events to:

  ```html
  <!-- Loop: single <li> per item -->
  <li data-loop="todos"><var>task</var></li>

  <!-- Conditional: show this div if isAdmin is true -->
  <div data-if="isAdmin">Admin Panel</div>
  ```

- **Wrapper with `<var>`**\
  Use a `<var>` wrapper when you need to apply a directive to multiple sibling
  nodes or a mixed set of elements as a group:

  ```html
  <!-- Loop: repeat both <li> and <hr> for each item -->
  <var data-loop="todos">
      <li><var>task</var></li>
      <hr>
  </var>

  <!-- Conditional: wrap several elements together -->
  <var data-if="!isGuest">
      <h2>Welcome back!</h2>
      <button>Logout</button>
  </var>
  ```

The wrapper is removed after rendering, leaving only its children in the DOM.

## Loading external templates & data

Use the helper `loadDataAndTemplate()` found in `js/loader.js` to fetch a JSON
file and a raw HTML template:

```js
import { loadDataAndTemplate } from "./js/loader.js";

loadDataAndTemplate(
    "./data.json", // JSON file
    "./template.html", // raw HTML template (no <template> wrapper)
    document.querySelector("#out"), // mount point
);
```

You can also pass an optional fourth argument to forward `renderTemplate`
options such as `replace` and `events`.

## Robustness

- **XSS‑safe:** placeholder values are injected via `textContent`, so HTML
  inside your data is not executed.
- **Error handling:** if the path given to `data-loop` is not an array, the
  engine throws a descriptive `TypeError`.
- **Event safety:** missing or malformed `data-event` handlers throw clear
  `TypeError`s instead of evaluating arbitrary code.

## Server-Side Rendering (Static Site Generation)

In addition to client-side rendering, you can use the engine at **build time**
to generate fully rendered HTML – ideal for static site generation (SSG).

### Key Differences from Client-Side Use

1. **Entire HTML document as template**: The full HTML file (including
   `<!DOCTYPE>`, `<html>`, `<head>`, and `<body>`) acts as the template.
2. **Template tags in-place**: `<template>` elements are placed exactly where
   rendered content should appear and get replaced inline.

### Project Structure

```
examples/09-deno-ssg/
├── build.js         → CLI script to generate output
├── data.json        → Data input
├── template.html    → Full HTML file with embedded <template>
├── dist/index.html  → Output (auto-generated)
```

### Example Template

```html
<!DOCTYPE html>
<html lang="de">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>06 – Deno SSG</title>
    </head>

    <body>
        <template>
            <h2>CV of <var>name</var></h2>
            <p>Role: <var>role</var></p>
            <h3>Skills</h3>
            <ul>
                <var data-loop="skills">
                    <li><var></var></li>
                </var>
            </ul>
        </template>
    </body>
</html>
```

### Build with Deno

```bash
deno run --allow-read --allow-write build.js
```

This will generate a clean, fully rendered `index.html` in the `dist/` folder –
no JavaScript required on the client.

---

## Live Examples

| Nr. | Focus                   | Demo                                 |
| --- | ----------------------- | ------------------------------------ |
| 01  | Basic Hello             | `examples/01-basic-hello/`           |
| 02  | Primitive Array         | `examples/02-primitive-array/`       |
| 03  | Attribute Binding       | `examples/03-attribute-binding/`     |
| 04  | Conditional Rendering   | `examples/04-conditional-rendering/` |
| 05  | Object Array Loop       | `examples/05-object-array/`          |
| 06  | Object Map Loop         | `examples/06-object-map/`            |
| 07  | Nested Loops            | `examples/07-nested-loops/`          |
| 08  | Nested Object-Map Loops | `examples/08-nested-object-map/`     |
| 09  | Server-side Rendering   | `examples/09-deno-ssg/dist/`         |
| 10  | Includes                | `examples/10-includes/`              |
| 11  | Event Binding           | `examples/11-event-binding/`         |

_(Launch a dev server such as `npx serve .` and open the links.)_

---

## Conclusion

This Vanilla JS Template Engine is designed to be simple and efficient,
leveraging pure HTML and JavaScript to dynamically populate your UI. It avoids
the need for complex template languages, providing a lightweight and intuitive
way to manage dynamic content in your web applications.
