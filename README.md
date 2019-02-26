# Calculator

https://bennythadikaran.github.io/calculator/

A standard Calculator written in vanilla Javascript (ES 5).

- HTML structure is dynamically loaded with JS.
- Accepts keyboard inputs and mouse click (in the User interface).
- Result is printed immediately as inputs are received.
- Prints in scientific notation for numbers, +/- 10 billion and beyond.
- Support to toggle positive or negative sign.
- Does not implement BODMAS rules.

## Usage

Just add the below HTML where the Calculator is to be displayed
```HTML
<!-- HTML -->
<div id="cal" class="cal"></div>
```

Initialise the Calculator
```Javascript
// Javascript
 Calculator.init();
```

Available keyboard Shortcuts

__Escape__ or __Delete__: Clear all entries (C)

__Enter__: Equal (=)

__Backspace__: Correct entry (<)

__PageDown__: Toggle sign (+/-)
