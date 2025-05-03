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

## Live Examples

| Nr. | Focus                | Demo                                       |
| --: | -------------------- | ------------------------------------------ |
|  01 | Variable Binding     | `examples/01-basic-hello/index.html`       |
|  02 | Primitive Array Loop | `examples/02-primitive-array/index.html`   |
|  03 | Attribute Binding    | `examples/03-attribute-binding/index.html` |
|  04 | Object Array Loop    | `examples/04-object-loop/index.html`       |

_(Launch a dev server such as `npx serve .` and open the links.)_

---

## Nested Loops

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

This demonstrates two nested `data-loop` levels (departments → employees).

---

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

---

## Robustness

- **XSS‑safe:** placeholder values are injected via `textContent`, so HTML
  inside your data is not executed.
- **Error handling:** if the path given to `data-loop` is not an array, the
  engine throws a descriptive `TypeError`.

---

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
<template id="user-template">
    <div class="user">
        <h2><var>user.name</var></h2>
        <p>Email: <var>user.email</var></p>
        <img data-attr="src:user.avatar" alt="User Avatar">
        <ul>
            <var data-loop="user.hobbies">
                <li><var></var></li>
            </var>
        </ul>
    </div>
</template>
```

### JavaScript Example

```javascript
import { renderTemplate } from "./vanillaTemplates.js";

const data = {
    user: {
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "avatar.jpg",
        hobbies: ["Reading", "Gaming", "Traveling"],
    },
};

const template = document.getElementById("my-template");
const container = document.querySelector("#output");

renderTemplate(template, data, container);
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
    <var data-loop="user.hobbies">
        <li><var></var></li>
    </var>
</ul>
```

<!-- Repeats for each hobby in the user.hobbies array -->

### Javascript Example

```javascript
const data = {
    user: {
        hobbies: ["Reading", "Gaming", "Traveling"],
    },
};

renderTemplate(template, data, container);
```

This will produce:

```html
<ul>
    <li>Reading</li>
    <li>Gaming</li>
    <li>Traveling</li>
</ul>
```

### Empty `<var>` Explained

When you iterate over an array of _primitive_ values, the loop item **is** the
value, not an object with keys.\
An empty `<var></var>` therefore means “inject the current item itself”.

```html
<var data-loop="colors">
    <span style="background-color: <var></var>"><var></var></span>
</var>
```

With

```js
{
    colors: ["red", "green", "blue"];
}
```

this renders as:

```html
<span style="background-color: red">red</span>
<span style="background-color: green">green</span>
<span style="background-color: blue">blue</span>
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

## Conclusion

This Vanilla JS Template Engine is designed to be simple and efficient,
leveraging pure HTML and JavaScript to dynamically populate your UI. It avoids
the need for complex template languages, providing a lightweight and intuitive
way to manage dynamic content in your web applications.
