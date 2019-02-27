/**
* NodeGenerator - A simple helper function for generating DOM elements
*/
var Node = (function () {
    "use strict";

    return {
        /**
        * Create an element with specified attributes and text
        */
        create: function (elem, attributes, text) {
            var el = document.createElement(elem),
                attr;

            if (typeof attributes === "object") {
                for (attr in attributes) {
                    if (attributes.hasOwnProperty(attr)) {
                        el.setAttribute(attr, attributes[attr]);
                    }
                }
            }

            if (text) {
                el.textContent = text;
            }
            return el;
        },

        /**
        * Append all elements to the parent node
        */
        append: function (elemsArray, parent) {
            elemsArray.forEach(function (elem) {
                parent.appendChild(elem);
            });
            return parent;
        }
    };
}());

var Calculator = (function () {
    "use strict";
    var num = "",
        inputArray = [0],

        getPercentage = function () {
            switch (inputArray[1]) {
            case '+':
                return inputArray[0] + (inputArray[0] * inputArray[2] / 100);
            case '-':
                return inputArray[0] - (inputArray[0] * inputArray[2] / 100);
            case '*':
                return inputArray[0] * inputArray[2] / 100;
            case '/':
                return inputArray[0] / inputArray[2];
            }
            return inputArray[0] / 100;
        },

        controller = function () {
            if (inputArray.indexOf("%") > -1) {
                return getPercentage();
            }

            // if missing 2nd operand
            if (inputArray.length < 3) {
                return inputArray[0];
            }

            // division by 0 results in infinity
            if (inputArray[2] === 0) {
                return ((['*', '/'].indexOf(inputArray[1]) === -1)
                    ? inputArray[0]
                    : 0);
            }

            switch (inputArray[1]) {
            case '+':
                return inputArray[0] + inputArray[2];
            case '-':
                return inputArray[0] - inputArray[2];
            case '*':
                return inputArray[0] * inputArray[2];
            case '/':
                return inputArray[0] / inputArray[2];
            }
        },

        print = function (str) {
            var result = controller();

            // Print in scientific notation for +/- 10 billion and beyond
            result = (Math.abs(result) / 1000000000 >= 1
                ? result.toExponential()
                : result);

            document.getElementById("result").textContent = (str || "") + result;
        },

        equals = function (el) {
            print("= ");
            // update the result for further calculations
            el.value = inputArray[0] = num = controller();
            // remove all but the result in index 1
            inputArray.splice(1, 5);
        },

        clear = function () {
            num = "";
            inputArray = [0];
            print();
            document.getElementById("input").value = "";
        },

        isOperator = function (str) {
            return !!str && ["*", "/", "+", "-", "%"].indexOf(str) > -1;
        },

        backspace = function (el) {
            var str = inputArray.pop(),
                newStr = str.toString().slice(0, -1),
                // -5 becomes '-', remove it as well
                charsToRemove = newStr && newStr === "-" ? 2 : 1;

            // remove required chars from screen input
            el.value = el.value.slice(0, -charsToRemove);

            // if str is an operator
            num = isOperator(str)
                // update the last element in array
                // in case operand needs to be updated
                ? inputArray[inputArray.length - 1]
                : "";

            // filter out empty strings and trailing '-' from negative numbers
            if (newStr && newStr !== "-") {
                // 55 becomes 5, add it back
                inputArray.push(parseFloat(newStr));
                num = newStr;
            }

            if (inputArray.length === 0) {
                return clear();
            }

            print();
        },

        isValidInput = function (str) {
            return (/(C|Escape|Delete|PageDown)|[0-9.\/*\-+%]/g.test(str));
        },

        toggleSign = function (el) {
            var index = el.value.lastIndexOf(num);

            num = (parseFloat(num) < 0
                ? Math.abs(num)
                : '-' + num);

            el.value = el.value.substring(0, index) + num;
        },

        processInput = function (char, el) {
            var isPercent = char === "%",
                result;

            // [135, -, 10, %] and new char is an operator,
            // [135, - 10] and new char is an operator but not %
            // if any of the above is true, calculate and prepare for next entry
            // else we might need to backspace or correct some entries
            if (isOperator(char) && (inputArray.length === 4 || (inputArray.length === 3 && !isPercent))) {
                result = controller();
                inputArray.splice(0, 5, result);
                el.value = result;
                num = "";
            }

            if (!isNaN(char) || char === ".") {
                num += char;

                if (inputArray.length === 1) {
                    inputArray[0] = parseFloat(num, 10);
                } else {
                    inputArray[2] = parseFloat(num, 10);
                }

            } else if (isOperator(char)) {
                // typed an operator without entering an operand
                if (num === "" && !inputArray[0]) {
                    el.value = num = 0;
                }

                if (isPercent) {
                    // [135,-, 10, %]
                    inputArray.push(char);
                }

                if (inputArray.length > 2) {
                    print();
                }

                if (!isPercent) {
                    inputArray[1] = char;
                }
                num = "";
            }

            print();
        },

        inputHandler = function (e) {
            var isClick = e.type === "click",
                char = isClick ? e.target.textContent : e.key,
                inputEl = document.getElementById("input"),
                lastChar = inputEl.value.slice(-1);

            if (char === "=" || char === "Enter") {
                equals(inputEl);
            }

            if (char === "<" || char === "Backspace") {
                backspace(inputEl);
            }

            // equal and backspace chars/shortcut keys will return false
            // thus prevent any further inputs.
            if (!isValidInput(char)) {
                e.preventDefault();
                return false;
            }

            if (char === "+/-" || char === "PageDown") {
                toggleSign(inputEl);
                char = "";
            }

            // replace existing operator with new operator
            if (isOperator(char) && isOperator(lastChar)) {
                inputEl.value = inputEl.value.slice(0, -1);
            }

            if (["C", "Escape", "Delete"].indexOf(char) > -1) {
                return clear();
            }

            if (isClick) {
                inputEl.value += char;
                inputEl.focus();
            }

            processInput(char, inputEl);
        },

        renderUi = function (wrapper) {
            var keypadChar = {
                    right: ['/', '*', '-', '+', '='],
                    left: ['C', '<', '+/-', '7', '8', '9', '4', '5', '6', '3', '2', '1', '%', '0', '.']
                },

                uiScreen = Node.create("div", {"class": "cal-screen"}),
                input = Node.create("input", {type: "text", id: "input", "class": "cal-input", autofocus: "", readonly: ""}),
                result = Node.create("div", {id: "result", "class": "cal-result"}),

                keypad = Node.create("div", {"class": "cal-keypad"}),
                leftRow = Node.create("div", {"class": "keypad-left"}),
                rightRow = Node.create("div", {"class": "keypad-right"}),

                footer = Node.create("p", null, "Developed by "),
                a = Node.create("a", {href: "https://github.com/BennyThadikaran", target: "__blank"}, "Benny Thadikaran"),

                keypadSections = [rightRow, leftRow],
                row,
                section,
                appendCharsToNode = function (char) {
                    var button = Node.create("button", {"type": "button"}, char);
                    if (char === "=" || char === "C") {
                        button.className = "highlight";
                    }
                    row.appendChild(button);
                };

            for (section in keypadChar) {
                if (keypadChar.hasOwnProperty(section)) {
                    row = keypadSections.shift();
                    keypadChar[section].forEach(appendCharsToNode);
                }
            }

            keypad.addEventListener("click", inputHandler);

            // Mobile virtual keyword on input focus can mess with UX
            if (navigator.userAgent.toLowerCase().indexOf("mobi") === -1) {
                input.removeAttribute("readonly");
                // Event delegation model may not be suitable for multiple forms on page
                input.addEventListener("keydown", inputHandler);
            }

            footer.appendChild(a);

            Node.append([input, result], uiScreen);
            Node.append([leftRow, rightRow], keypad);
            Node.append([uiScreen, keypad, footer], wrapper);
        },

        init = function () {
            var el = document.getElementById("cal");

            if (!el) {
                return;
            }

            renderUi(el);
            print();
        };

    return {
        init: init
    };
}());

Calculator.init();
