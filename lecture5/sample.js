
// Two ways of embedding JS (hopefully you remember this)
// External
<html>
<head>
    <script type="text/javascript" src="myscript.js"></script>
</head>

// Inline
<script>
    // JavaScript code
    document.getElementById("demo").innerText = "Hello, World!";
</script>

// Declaring variables
x = 10;  // This creates a globally scoped variable.

let y = 10;    // standard variable assignment
let y = 20;		// ??

// To *redeclare* a variable
y = 20;  // must be already defined, else it's global

const z = 10;  // declare constant. Can't be reassigned or re-declared.

// Arrays / for loops
let fruits = ["banana", "pitaya", "pineapple", "coconut"];
fruits.type = "tropical";

// for loops
function printFruits() {
    let fruits = ["banana", "pitaya", "pineapple", "coconut"];
    fruits.type = "tropical";
    for (let i = 0; i < fruits.length; i++) { 
    console.log(fruits[i]);
    }
    return "";
};
printFruits();

// for in 
for (const key in fruits) {
    console.log(key);
}

// for of
for (const fruit of fruits) {
    console.log(fruit);
}


// More arrays
let primes = new Array(2, 3, 5, 7, 11);
primes.countable = true;

let fib = [1, 1, 2, 3, 5, 8];
console.log(fib.length);

let knapsack = [1, "yarn", false, , ["feather", 42]];
console.log(knapsack.length);


// First class functions
function square (x) {
  return x * x;
}

const mathFunctions = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  quartic: (a) => square(a) * square(a),
  sum: (arr) => { return arr.reduce(function (a, b) {
      			return a + b;
  		}, 0)}
};

mathFunctions.add(2, 3);
mathFunctions.quartic(2);

function applyOperation(a, b, op) {
  return op(a, b);
}
applyOperation(1, 3, mathFunctions.add);

function applyOperation(op, ...params) {
  return op(params);
}

applyOperation(mathFunctions.sum, 1, 2, 3, 4, 5);

// Closures
function createMultiplier(factor) {
  return function(x) {
    return x * factor;
  }
}
const double = createMultiplier(2);
const triple = createMultiplier(3);
console.log(double(5)); 
console.log(triple(5));

// Arrow functions
const add = (x, y) => { return x + y; };

const square1 = (x) => { return x * x; };

// Don't need () for single argument. Don't need return, it's implied.
const square2 = x => x * x;

// No parameters
const horn = () => { console.log("Beep! Beep!"); };


// Template strings
const name = "Ryan";
const temp = 21; // temp in celsius
let greeting = `Hello, ${name}. The temperature is ` +
	`${Math.floor((9/5) * temp + 32)} degrees F.`
console.log(greeting)

// Objects
let cs144 = {
	instructor: "Rosario, R.R.",
	prerequisites: ["CS143"],
	meet_time: {
		"start time": "18:00",
		"end time": "19:50"
	}
	room: "MS4000A",
	ta: ["Agrawal, V.", "Theeranantachai, S."]
}


// Serialization
const pb_mood = {
	name: "Peanut Butter Moo'd",
	ingredients: ["peanut butter", "banana"],
	calories: 7000
};
// Serialize the object.
const pb_mood_recipe = JSON.stringify(pb_mood);
// Shake Shack receives this message as in the demo.
const pb_mood_ss = JSON.parse(pb_mood_recipe); // pb_mood_recipe is JSON


// Strict mode
function canYouFindTheProblem() {
	"use strict";
	for (counter = 0; counter < 10; counter++) {
		console.log(counter);
	}
}
canYouFindTheProblem();

// Variable scoping.
let ucla = "bruins";      
var usc = "trojans";      
stanford = "cardinal";    

function scopeDemo() {
  // Function scope
  console.log(ucla);      
  console.log(usc);       
  console.log(stanford);  
  
  // Redefining variables
  ucla = "bruWins";       
  var usc = "fail";       
  
  // Creating new variables
  berkeley = "bears";     
  let ucsd = "boring";    
  var ucsb = "party";     
  
  // Nested function demonstrating
  // lexical scoping
  function inner() {
    console.log(ucla);    
    console.log(ucsd);    
    let ucla = "nested";
    console.log(ucla);    
  }
  
  inner();
  console.log(ucla);      
  console.log(usc);       
}

scopeDemo();

// After function execution
console.log(ucla);        
console.log(usc);         
console.log(berkeley);    
console.log(ucsd);        


// ES6 (actually ES2022) classes
class Animal {

  #habitat;
  #food;

  constructor(habitat) {
    this.#habitat = habitat;
  }

  get habitat() {
    return this.#habitat;
  }

  set habitat(newHabitat) {
    if (typeof newHabitat === "string" &&
        newHabitat.length > 0) {
      this.#habitat = newHabitat;
    } else {
      console.error("Invalid habitat");
    }
  }

  about() {
    return `habitat: ${this.habitat}`;
  }

  // Static method
  static isAnimal(obj) {
    return obj instanceof Animal;
  }
}

let cow = new Animal("pasture");
cow.habitat;		// calls getter
cow.habitat = 'barn';	// calls setter
cow.about();		// instance method
Animal.isAnimal(cow); 	// static methid

// Does this work?
cow.#habitat

// What about this?
cow.#habitat = 'foo';

// What about this? (food has no getters or setters)
cow.food = 'cud';



// Class Inheritance (ES6 ES2022)
class Mammal extends Animal {
  #species;
  #sound;
  // #habitat is defined in Animal, but we do not inherit access to it.
  // We need to call a getter to fetch it, or a setter to set it.

  constructor(habitat, species, sound) {
    super(habitat);
    this.#species = species;
    this.#sound = sound;
  }
        
  about() {
    // Here, this.habitat is calling the getter in the base class.
    return `${this.#sound} I am a ${this.#species}. I live in the ${this.habitat}.`;
  }
        
  // home is missing. We use the base class' method.
}

let c = new Mammal("pasture", "cow", "moo");
c.home();
c.about();

// Classes vs Prototypes
// Class
class Dog {
  constructor(name) {
    this.name = name;
  }

  // Instance method
  // All instances get their own copy of bark
  bark() {
    return `${this.name} ` +
      `says woof!`;
  }   
}
        
const rover = new Dog("Rover");
rover.bark();  // OK



// Prototypes
function Dog(name) {
  this.name = name;
}
        
Dog.prototype.bark = function() {
  return `${this.name} says woof!`;
};
        
const rover = new Dog("Rover");
rover.bark();  // OK. All Dogs access bark() through the prototype

// THIS
// In Methods
const dog = {
  name: "Rover",
  bark() {
    console.log(this.name);
  }
};
dog.bark();

// Standalone (Global Context)
function speak() {
	console.log(this);
}
speak();

// Event listeners
document.body.addEventListener("click", function() {
	console.log(this); // the element clicked (body)
});

// In Arrow Functions
const dog2 = {
	name: "Rover",
	bark: () => {
		console.log(this.name);
	}
};
dog2.bark();

// In Classes (just like Java/C++)
class Dog {
	constructor(name) {
		this.name = name;
	}
	bark() {
		console.log(this.name);
	}
}
const rover = new Dog("Rover");
rover.bark();



// NEWER FEATURES IN ES6

// Rest Parameters
// like args in Python
function greet(greeting, ...names) {
  // names is treated as an array, unlike ...names
  const nameList = names.join(", ");
  console.log(`${greeting}, ${nameList}!`);
}
greet("Aloha!", "Alice", "Bob", "Charlie");

// Spread
function aloha(names) {
  const nameStr = names.join(", ");
  console.log(`Aloha, ${nameStr}!`);
}
aloha(['Alice', 'Bob', 'Carol']);

// Destructuring Assignment
// like tuple unpacking in Python
let colors = ['red', 'green', 'blue'];
let ['r', 'g', 'b'] = colors

let instructor = { name: 'Bruin', dept: 'CS', age: 20 };
let { name, dept, age } = instructor

// Nullish Coalescing
// kinda like COALESCE in SQL
let student = {
  name: "Joe Bruin",
  major: null
}
console.log(student.major ?? "Undeclared")

// Optional Chaining
let catalog = {
  cs111: ["Eggert", "Reiher", "Kumar"],
  cs118: ["Lu", "Zhang", "Varghese"]
};
console.log(catalog.cs112?.instructors)
// undefined if no cs112 instead of error
