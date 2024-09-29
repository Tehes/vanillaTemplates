# Vanilla JS Template Engine

A lightweight and simple JavaScript template engine that uses valid HTML syntax and `<var>` elements for data binding. It provides a minimalistic solution to dynamically populate HTML templates with JavaScript data, without needing any specialized template language.

## Features

- **Valid HTML Syntax**: The engine uses standard HTML elements and attributes, with no need for a custom template language or syntax.
- **Data Binding with `<var>`**: JavaScript object data can be injected into HTML using the `<var>` element.
- **Loop Support**: The `data-loop` attribute allows iterating over arrays in your data, creating dynamic lists or repeated elements.
- **Flexible Attribute Binding**: Using the `data-attr` attribute, you can bind JavaScript data directly to any HTML attribute, such as `src`, `href`, or `alt`.

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
import { renderTemplate } from './vanillaTemplates.js';

const data = {
    user: {
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "avatar.jpg",
        hobbies: ["Reading", "Gaming", "Traveling"]
    }
};

const template = document.getElementById('my-template');
const container = document.querySelector('#output');

renderTemplate(template, data, container);
```

## Data Binding

The engine uses `<var>` elements to bind data from JavaScript objects to HTML elements. The text inside the `<var>` tag corresponds to the key or nested key of the object.

### Example

```html
<var>user.name</var> <!-- This will be replaced by the value of user.name from the data object -->
```

## Looping Over Data

To handle arrays, the engine provides a `data-loop` attribute. When applied to an element, it will iterate over the corresponding array in the data and duplicate the element for each item.

### HTML Loop Example

```html
<ul>
    <li data-loop="user.hobbies"><var></var></li> <!-- Repeats for each hobby in the user.hobbies array -->
</ul>
```

### Javascript Example

```javascript
const data = {
    user: {
        hobbies: ["Reading", "Gaming", "Traveling"]
    }
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

## Attribute Binding

The `data-attr` attribute allows you to dynamically set the value of an HTML attribute, such as `src`, `href`, or `alt`.

### Example

```html
<img data-attr="src:user.avatar" alt="User Avatar"> <!-- The image source will be set dynamically -->
```

The syntax for `data-attr` is `data-attr="attribute:dataPath"`, where `attribute` is the HTML attribute you want to set, and `dataPath` is the path to the data in the JavaScript object.

### JavaScript Example

```javascript
const data = {
    user: {
        avatar: "https://example.com/avatar.jpg"
    }
};

renderTemplate(template, data, container);
```

This will produce:

```html
<img src="https://example.com/avatar.jpg" alt="User Avatar">
```

## Conclusion

This Vanilla JS Template Engine is designed to be simple and efficient, leveraging pure HTML and JavaScript to dynamically populate your UI. It avoids the need for complex template languages, providing a lightweight and intuitive way to manage dynamic content in your web applications.
