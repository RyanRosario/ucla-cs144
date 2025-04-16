/* Example of DOM manipulation with JavaScript */

// Open ucla.edu
// In devtools, use inspect tool. Click on Frenk's photo
// Look at the HTML code. Right click. Copy selector

const rosario = "https://web.cs.ucla.edu/~rrosario/images/avatar1.jpg"

let chancellor = document.querySelectorAll("#quote > div > figure > img")

// Only one element so can do
chancellor = document.querySelector("#quote > div > figure > img")

// Let's appoint Prof. Rosario as the chancellor.
chancellor.src = rosario

// Another way
chancellor.setAttribute("src", rosario);

let quote = document.querySelector("#quote > div > blockquote > p");
quote.innerHtml = '::before "I love UCLA."';
quote.innerText = 'I love UCLA."';

// others
document.querySelector("#quote > div > blockquote > cite").innerText = " - Chancellor Rosario";
document.querySelector("#quote > div > blockquote > a").innerText = "Read More about Chancellor Rosario";
