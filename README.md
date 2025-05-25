# Vanilla JS Template Engine

A lightweight and simple JavaScript template engine that uses valid HTML syntax
and `<var>` elements for data binding. It provides a minimalistic solution to
dynamically populate HTML templates with JavaScript data, without needing any
specialized template language.

## Features

- **Valid HTML Syntax**: The engine uses standard HTML elements and attributes,
  with no need for a custom template language or syntax.
- **Data Binding with `<var>`**: JavaScript object data can be injected into
  HTML using the `<var>` element.
- **Loop Support**: The `data-loop` attribute allows iterating over arrays in
  your data, creating dynamic lists or repeated elements.
- **Flexible Attribute Binding**: Using the `data-attr` attribute, you can bind
  JavaScript data directly to any HTML attribute, such as `src`, `href`, or
  `alt`.
- **Zero DOM Footprint**: `<var>` placeholders and loop containers are stripped
  out during rendering, so the final markup contains only your real HTML.

## Why `<var>`?

HTML already defines the
[`<var>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/var)
for “variables” in a broad sense.\
Using it as a **placeholder tag** brings three advantages:

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

| Helper                         | Meaning                        |
| ------------------------------ | ------------------------------ |
| `_key`                         | current property name          |
| `_value` (empty `<var></var>`) | current value (for primitives) |
| `_index`                       | zero-based counter             |
| `_first`                       | `true` for the first entry     |
| `_last`                        | `true` for the last entry      |

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
elements or using `<var>` wrappers when grouping is needed. This applies to both
loops and conditionals.

- **Direct Directive on Element**\
  Attach directives like `data-loop`, `data-if`, `data-attr`, or `data-style`
  directly to the element you wish to repeat, show/hide, or bind
  attributes/styles to:

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

## Robustness

- **XSS‑safe:** placeholder values are injected via `textContent`, so HTML
  inside your data is not executed.
- **Error handling:** if the path given to `data-loop` is not an array, the
  engine throws a descriptive `TypeError`.

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
examples/06-deno-ssg/
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

| Nr. | Focus                 | Demo                                 |
| --- | --------------------- | ------------------------------------ |
| 01  | Basic Hello           | `examples/01-basic-hello/`           |
| 02  | Primitive Array       | `examples/02-primitive-array/`       |
| 03  | Attribute Binding     | `examples/03-attribute-binding/`     |
| 04  | Object Array Loop     | `examples/04-object-array/`          |
| 05  | Object Map Loop       | `examples/05-object-map/`            |
| 06  | Nested Loops          | `examples/06-nested-loops/`          |
| 07  | Conditional Rendering | `examples/07-conditional-rendering/` |
| 08  | Server-side Rendering | `examples/08-deno-ssg/dist/`         |

_(Launch a dev server such as `npx serve .` and open the links.)_

---

## Conclusion

This Vanilla JS Template Engine is designed to be simple and efficient,
leveraging pure HTML and JavaScript to dynamically populate your UI. It avoids
the need for complex template languages, providing a lightweight and intuitive
way to manage dynamic content in your web applications.
