# Vanilla JS Template Engine

A lightweight and simple JavaScript template engine that uses valid HTML syntax and `<var>` elements for data binding.

## Features
- Valid HTML syntax without any special template language.
- Supports loops (`data-loop`) and data-binding via `<var>` elements.
- Flexible data attributes (`data-attr`) for binding data to element attributes.

## Installation

Clone the repository:
```bash
git clone https://github.com/Tehes/vanillaTemplates.git

Include the script in your HTML file:
<script type="module" src="path/to/vanillaTemplates.js"></script>

## Usage
### HTML Template Example
<template id="my-template">
    <div class="user">
        <h2><var>user.name</var></h2>
        <p><var>user.email</var></p>
        <img data-attr="src:user.avatar" alt="User Avatar">
        <ul>
            <li data-loop="user.hobbies"><var></var></li>
        </ul>
    </div>
</template>

### JavaScript Example

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


