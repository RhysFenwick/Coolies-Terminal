// Start off by declaring logins (array of arrays), rooms (array of JSONs), and current_room (JSON) to be filled later
var logins;
var rooms;
var doors;
var current_room;
var descriptions;
var inventory = [];

// Start of privilege level 0, escalate through logins
var current_user = null;
var priv = 0;

// Helper functions

// Clears text in either terminal or info
function clearText(loc="info") {

    const location = document.getElementById(loc);
    location.textContent = "";
}

// Takes a string and a Boolean of whether to make it slow or all at once, and either "terminal" or "info"
// And prints it to one of the terminals
// TODO: Have a separate one for info given separate needs/formatting?
function appendToTerminal(text, slowText=true) {
    const line = document.createElement("p");
    
    const location = document.getElementById("terminal");

    location.appendChild(line);

    if (slowText) {
        typeWriterEffect(text,line)
    }
    else {
        line.textContent += text
    }
}

// Append text to info page
// TODO: Wipe and rewrite every time?
// TODO: Spin out the actual writing function
function refreshInfo() {
    clearText();
    const line = document.createElement("p");
    
    const location = document.getElementById("info");

    location.appendChild(line);
    
    if (priv == 0) {
        text = "CURRENT USER: Unknown\r\nCURRENT ROOM: Unknown\r\nDOORS: Unknown"
    }
    else {
        doors_str = ""
        for (d in doors) {
            door = doors[d];
            if (current_room.name == door.room1) {
              doors_str += door.room2.toUpperCase() + ", "
            }
            else if (current_room.name == door.room2) {
              doors_str += door.room1.toUpperCase() + ", "
            }
        }
        doors_str = doors_str.substring(0, doors_str.length - 2);
        
        items_str = "";
        if (current_room.inspected) {
          items_str += "\r\nROOM ITEMS: " + current_room.items.join(", ")
        }
        
        inv_str = inventory.join(", ");
        
        text = "CURRENT USER: " + current_user.name + "\r\nCURRENT ROOM: "+ current_room.name.toUpperCase() + "\r\nDOORS: " + doors_str + items_str + "\r\n\r\nUSER NOTES: " + current_user.notes + "\r\nINVENTORY: " + inv_str;
    }

    typeWriterEffect(text,line)

}

// Creates a new input line in the terminal
// This probably doesn't need touching
function createInputLine() {
    const inputLine = document.createElement("input");
    inputLine.type = "text";
    inputLine.id = "inputLine";
    inputLine.autofocus = true;

    const terminal = document.getElementById("terminal");
    terminal.appendChild(inputLine);
    
    // Focus the new input line
    inputLine.focus();
    
    // Add the event listener to the new input line
    // This is what triggers whenever a command is entered!
    inputLine.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const input = this.value;
            
            // Remove the input line from the DOM before appending the text
            this.remove();
            
            // Append the input text to the terminal
            appendToTerminal("> " + input, false, "terminal");

            // TODO: Type anything in terminal that's needed here
            parseInput(input);
            
            // Add a new input line at the end
            createInputLine();
        }
    });
}

// Functions to add letters one by one

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeWriterEffect(str, div) {
    for (let i = 0; i < str.length; i++) {
        if (str[i] == ".") {
            await delay(200) // Wait longer for periods
        }
        else {
            await delay(20); // Wait for 20ms per other character
        }
        
        div.append(str[i]);
    }
}

// Makes sure focus is always on the input line
document.addEventListener("click", function() {
    const inputLine = document.getElementById("inputLine");
    if (inputLine) {
        inputLine.focus();
    }
});

// End helper functions

// The core game logic!
// Fetching rooms has to be asynchronous as it involves fetching the JSON file. Can call non-async functions as needed.

// Load the rooms JSON
async function get_rooms() {
    const response = await fetch("./rooms.json");
    const data = await response.json();
    return data;
}

// Async function to handle loading of rooms and any subsequent operations
async function roomSetup() {
    try {
        rooms_json = await get_rooms();

        // Pass rooms_json out to the main gameplay loop!
        gameStart(rooms_json);

    } catch(error) {
        console.error('Error fetching rooms:', error);
    }
}



// The core gameplay loop - takes in rooms_json and does a bunch of if/then on input
function gameStart(rooms_json) {

    appendToTerminal("Welcome to the CooliesBot Terminal.\r\nDeveloping murder mystery. . .\r\nAssigning murderer. . .\r\nPlease login to continue.")
    refreshInfo("CURRENT USER: Unknown\r\nCURRENT ROOM: Unknown")

    // By the time the regular gameplay loop has been reached, these will be filled.
    logins = rooms_json.logins // An array of the username/password/acct name arrays. TODO: Make JSONs to match?
    rooms = rooms_json.rooms // An array of the room JSONs.
    doors = rooms_json.doors // An array of door JSONs.
    current_room = rooms[0]; // Start off in the entry
    descriptions = rooms_json.descriptions;
    

    // Initialize the terminal with the input line ready for user input (and kick off the game)
    createInputLine();

}

// The core gameplay "move": takes in a string and does what it needs to with it
// Doesn't need to return anything but will probably need to appendToTerminal and adjust room and current_room
function parseInput(raw_input) {

    // Make sure it's lower case for easier comparison
    input = raw_input.toLowerCase();

    // Breaks up the input into key words
    input_array = input.split(" ");

    // The key instruction given - decides what happens next
    action = input_array[0];

// TODO: Replace with switch statement
    if (action == "login") {
        // Pass to login function
        login(input_array);
    }

    else if (action == "enter") {
        // Trying to enter a room - pass to move_rooms
        if (current_user) {
        move_rooms(input_array);
        }
        else {
          appendToTerminal("You must be logged in to move.");
        }
    }
    
    else if (action == "unlock") {
      // Trying to unlock door to a room
      if (current_user) {
        unlock(input_array);
        }
        else {
          appendToTerminal("You must be logged in to unlock doors.");
        }
    }
    
    else if (action == "clear") {
      // Clear the terminal
      clearText("terminal");
      createInputLine();
    }
    
    else if (action == "inspect") {
      focus = input_array[1]
      // Inspect the room or an item
      if (current_user) {
        if (descriptions.hasOwnProperty(focus)) {
          inspect_item(focus);
        }
        else {
        inspect_room(focus);
        }
      }
        else {
          appendToTerminal("You must be logged in to inspect rooms and items.");
        }
    }
    
    else if (action == "take") {
      if (current_user) {
        take_item(input_array[1]);
        }
        else {
          appendToTerminal("You must be logged in to take items.");
        }
    }

    else if (action == "help") {
        appendToTerminal("Type 'login [name] [password]' to login, 'enter [room-name]' to enter a room, 'unlock [room-name] [password] to unlock a locked door, or 'help' for more information. There are also 'inspect', 'take', and 'clear' commands.")
    }

    else {
        appendToTerminal("I'm sorry, I don't recognise that command. Type 'help' for assistance.")
    }
}

// Adds an item to personal inventory and removes it from the room
function take_item(item) {
  if (current_room.items.includes(item)) {
    var index = current_room.items.indexOf(item);
    if (index > -1) {
      current_room.items.splice(index, 1);
      inventory.push(item);
      appendToTerminal("You have taken the "+ item + ".");
      refreshInfo();
    }
    else {
      appendToTerminal("That item isn't in this room.")
    }
  }
  
}


// Returns a room JSON from the name, returns null if room not found
function getRoom(room_name) {
  var room = null
  
  for (r in rooms) {
    var current_room = rooms[r]
    if (current_room.name == room_name) {
      room = current_room
    }
  }
  return room;
}

// Prints a description of an item (if it exists and you can see it) to the terminal 
function inspect_item(item) {
  if (current_room.items.includes(item)) {
    appendToTerminal
    if (descriptions.hasOwnProperty(item)) {
      appendToTerminal(descriptions[item]);
    }
    else {
      appendToTerminal("That item is unremarkable.");
    }
  }
  else if (inventory.includes(item)) {
    appendToTerminal(descriptions[item] + " It is in your inventory.");
  }
  else {
    appendToTerminal("You can't see a " + item + " right now.");
  }
}

// Prints a description of the room to the terminal and makes info panel print list of room items.
function inspect_room(room_name){
  var room = getRoom(room_name);
  if (room && room.name == current_room.name) {
    appendToTerminal("The " + room.name + " is " + room.description);
    room.inspected = true;
    refreshInfo();
  }
  else {
    appendToTerminal("You can only inspect the room you're currently in.")
  }
  
}
// Checks if a door is accessible: used for move/unlock. Returns door if one is found, null otherwise
function check_for_door(queried_room) {
  
  var valid_room = null;
  
  for (d in doors) {
      // Is there a better way to do this?
        if (queried_room == doors[d].room1 || queried_room == doors[d].room2) {
          if (current_room.name == doors[d].room1 || current_room.name == doors[d].room2) {
            valid_room = doors[d];
          }
        }
    }
    return valid_room;
}

// Handles unlock attempts
function unlock(input_array) {
  queried_room = input_array[1];
  password = input_array[2];
  door = check_for_door(queried_room);
  
  if (door == null) {
        appendToTerminal("There's no door that leads there from this room.")
  }
  
  // If there is a door
  else {
    if (!door.locked) {
      appendToTerminal("That door is already unlocked.")
    }
    
    // There's a door and it's locked
    else {
      if (door.keys.includes(password)) {
        // Is this by reference?
        door.locked = false;
        appendToTerminal("Door unlocked.")
      }
      else {
        appendToTerminal("Incorrect password.")
      }
    }
  }
}

// Handles moving attempts
function move_rooms(input_array) {
    queried_room = input_array[1];
    door = check_for_door(queried_room);
    
    // Shouldn't trigger if no door (null)
    if (door != null) {
      // Checks if door is unlocked
      if (door.locked) {
        appendToTerminal("The door to " + queried_room + " is locked. Enter 'unlock [room-name] [password] to unlock.");
      }
      else {
        // Moves current room
        current_room = getRoom(queried_room);
        appendToTerminal("You've moved to the " + queried_room + ".")
        refreshInfo()
      }
    }

    else {
        appendToTerminal("There's no door that leads there from this room.")
    }
}

// Handles login attempts
function login(input_array) {
    // There's definitely a better way to do this involving breaks
    good_login = false;

    username = input_array[1];
    password = input_array[2];

    for (i in logins) {
      l = logins[i];
        if (l.uid == username && l.password == password) {
            good_login = true;
            
            current_user = l;

            // Should priv only move up, or is up/down fine?
            priv = l.priv;
        
            appendToTerminal("Login successful! Welcome, " + l.name + ".");
            refreshInfo();
        }
    }

    // If there was no match
    if (!good_login) {
        appendToTerminal("Credentials not recognised - please try again.");
    }
}

// Call the function to set up the rooms
// This is the first thing called! Everything else flows from here
roomSetup();




