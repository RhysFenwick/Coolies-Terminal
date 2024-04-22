// Arrays/JSONs to be filled later
var logins;
var rooms;
var doors;
var current_room;
var descriptions;
var inventory = [];

// Mapping

var map_rows = 5
var map_cols = 5
var row_len = map_cols * 8 + 3


// The intermediate string of the big map (5 cells each 5 wide with a pipe either side)
var map_wall = "--------".repeat(map_cols) + "-\r\n"

// The string of blank rooms
var map_sides = "|       ".repeat(map_cols) + "|\r\n"

// The string of rooms with a roof
var map_row = map_wall + map_sides.repeat(3)

// The final string
var mapstring = map_row.repeat(map_rows) + map_wall

// User

// Start with privilege level 0, escalate through logins if needed
var current_user = null;
var priv = 0;
var energy = 100;

// Helper functions

// Clears text in either terminal or info
function clearText(loc) {

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

// A broader "refresh and write to box" function
function newBoxText(box,txt) {
  clearText(box);
  
  // The box title
  const title = document.createElement("h4");

  // The box content
  const line = document.createElement("p");

  // The relevant div
  const location = document.getElementById(box);

  location.appendChild(title);
  title.append(box.toUpperCase());

  location.appendChild(line);
  typeWriterEffect(txt,line);
}

// A "refresh everything but the terminal" function
function generalRefresh() {
  refreshEnergy();
  refreshInfo();
  refreshMap();
  refreshInventory();
  refreshMessages();
}

// A function to refresh the inventory - should be called by generalRefresh() most of the time
function refreshMessages() {
  newBoxText("messages","None")
}

// A function to refresh the inventory - should be called by generalRefresh() most of the time
function refreshInventory() {
  var inventory_str = "";
  if (inventory.length == 0) {
    inventory_str = "None";
  }
  else {
    inventory_str = inventory.join('\r\n');
  }
  newBoxText("inventory",inventory_str);
}

// A function to refresh the energy - should be called by generalRefresh() most of the time
function refreshEnergy() {
  energy_str = energy + "%\r\n\r\nCost per room entry:\r\n" + (3 + inventory.length) + "%";
  newBoxText("energy",energy_str);
}

// A function to refresh the map - should be called by generalRefresh() most of the time
// TODO: Add map changes here as well
function refreshMap() {

  for (r in rooms) {
    var room = rooms[r]

    var row = room.coords[0];
    var col = room.coords[1];

    // The starting index of where to put room name on the map
    start_index = 2 * row_len + 4 * row_len * row + 8 * col + 2

    // Add the room names
    mapstring = mapstring.substring(0, start_index) + room.mapname + mapstring.substring(start_index + 5);

    if (room.name == current_room.name) {
      // If it's the current room, add dots!
      mapstring = mapstring.substring(0, start_index - row_len) + "* * *" + mapstring.substring(start_index + 5 - row_len);
      mapstring = mapstring.substring(0, start_index + row_len) + "* * *" + mapstring.substring(start_index + 5 + row_len);
    }
    else {
      // If it's the current room, add dots!
      mapstring = mapstring.substring(0, start_index - row_len) + "     " + mapstring.substring(start_index + 5 - row_len);
      mapstring = mapstring.substring(0, start_index + row_len) + "     " + mapstring.substring(start_index + 5 + row_len);
    }
  }



  typeLineEffect("map-box",mapstring);
}


// Append text to info page
function refreshInfo() {
    
    if (priv == 0) {
        text = "CURRENT USER: Unknown\r\nCURRENT ROOM: Unknown\r\nDOORS: Unknown"
    }
    else {
        doors_str = ""
        for (d in doors) {
            var door = doors[d];
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
                
        text = "CURRENT USER: " + current_user.name + "\r\nCURRENT ROOM: "+ current_room.name.toUpperCase() + "\r\nDOORS: " + doors_str + items_str + "\r\n\r\nUSER NOTES: " + current_user.notes;
    }

    newBoxText("information",text);
}

// Creates a new input line in the terminal
// This probably doesn't need touching
function createInputLine() {
    const inputLine = document.createElement("input");
    inputLine.type = "text";
    inputLine.id = "inputLine";
    inputLine.autofocus = true;
    inputLine.autocomplete = "off";

    const terminal = document.getElementById("terminal");
    terminal.appendChild(inputLine);
    
    // Focus the new input line
    inputLine.focus();
    
    // Add the event listener to the new input line
    // This is what triggers whenever a command is entered!
    inputLine.addEventListener("keypress", function(event) {
      document.getElementById("single-click").play();
        if (event.key === "Enter") {
            event.preventDefault();
            const input = this.value;
            
            // Remove the input line from the DOM before appending the text
            this.remove();
            
            // Append the input text to the terminal
            appendToTerminal("> " + input, false, "terminal");

            // Type anything in terminal that's needed here
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
            document.getElementById("single-click").play();
        }
        else if (str[i] == "\n") {
          await delay(20);
          document.getElementById("double-click").play();
        }
        else {
            await delay(20); // Wait for 20ms per other character
            document.getElementById("single-click").play();
        }
        div.append(str[i]);
    }
}

// Function to add lines one by one (used for map)

async function typeLineEffect(box,str) {

  // Array of lines
  var lines = str.split("\r\n");

  const div = document.getElementById(box);
  clearText(box);

  // The box title
  const title = document.createElement("h4");

  // The map itself
  const mapgrid = document.createElement("p");

  div.appendChild(title);
  title.append("MAP");

  div.appendChild(mapgrid);

  for (let i = 0; i < lines.length; i++) {
    await delay(66);
    newstr = lines[i];
    if (i != lines.length - 1) {
      // on all but the last line
      newstr += "\r\n";
    }
    mapgrid.append(newstr);
  }
}

// Makes sure focus is always on the input line - removed for now

document.addEventListener("click", function(event) {
  // Assuming the scrollbar interactions are mainly on the body or specific containers
  const excludedElements = ["terminal"];
  let targetElement = event.target; // Starting with the event target itself
  console.log(targetElement.id)
  do {
      if (excludedElements.includes(targetElement.id)) {
          // If the target is one of the excluded elements or within them, do nothing
          return;
      }
      // Move up the DOM tree to check parent elements
      targetElement = targetElement.parentNode;
  } while (targetElement != null);

  // If the click is outside excluded elements, focus on inputLine
  const inputLine = document.getElementById("inputLine");
  if (inputLine) {
      inputLine.focus();
  }
});

// Takes a string, a character, and an index and returns the same string with that index replaced by the char
function replaceChar(str,char, ind) {
  return str.substring(0, ind) + char + str.substring(ind + char.length);
}


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

        // Get loading bar
        var loadbar = document.getElementById("loading-bar");        
        
        // Wait four seconds then make flash screen loaded
        await delay(1000);
        loadbar.innerText = "Loading."
        await delay(1000);
        loadbar.innerText = "Loading.."
        await delay(1000);
        loadbar.innerText = "Loading..."
        await delay(1000);
        loadbar.innerText = "Loaded."

        // Wait one second then close the splash screen
        await delay(1000);
        document.getElementById("splash").style.visibility = "hidden";
        
        // Pass rooms_json out to the main gameplay loop!
        gameStart(rooms_json);

    } catch(error) {
        console.error('Error fetching rooms:', error);
    }
}



// The core gameplay loop - takes in rooms_json and does a bunch of if/then on input
function gameStart(rooms_json) {

    appendToTerminal("Welcome to the CooliesBot Terminal.\r\nDeveloping murder mystery. . .\r\nAssigning murderer. . .\r\nPlease login to continue.")

    // By the time the regular gameplay loop has been reached, these will be filled.
    logins = rooms_json.logins // An array of the username/password/acct name arrays. TODO: Make JSONs to match?
    rooms = rooms_json.rooms // An array of the room JSONs.
    doors = rooms_json.doors // An array of door JSONs.
    current_room = rooms[0]; // Start off in the entry
    descriptions = rooms_json.descriptions;
    
    // Initialise the right hand side
    generalRefresh();

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

    switch(action) {

      case "login":
        login(input_array);
      break;
      
      case "move":
        if (current_user) {
          move_rooms(input_array);
          }
          else {
            appendToTerminal("You must be logged in to move.");
          }
      break;
      
      case "unlock":
        if (current_user) {
          unlock(input_array);
        }
        else {
          appendToTerminal("You must be logged in to unlock doors.");
        }
      break;

      case "clear":
        clearText("terminal");
        createInputLine();
      break;
      
      case "inspect":
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
      break;

      case "take":
        if (current_user) {
          take_item(input_array[1]);
        }
        else {
          appendToTerminal("You must be logged in to take items.");
        }
      break;

      case "drop":
        drop_item(input_array[1]);
      break;

      case "help":
        // TODO: Spin out into function
        appendToTerminal("Functions:\r\nlogin [name] [password] to login\r\nmove [room-name] to enter a room\r\nunlock [room-name] [password] to unlock a locked door\r\ninspect [object|room] to get more detail\r\ntake [object] to add an object to inventory\r\ndrop [object] to remove an object from your inventory\r\nclear to clear the terminal")
      break;

      default:
        appendToTerminal("I'm sorry, I don't recognise that command. Type 'help' for assistance.")
      break;
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
      energy -= 2;
      refreshInfo();
      refreshInventory();
      refreshEnergy();
    }
  }  
  else {
    appendToTerminal("That item isn't in this room.")
  }
}

// Removes an item from personal inventory and adds it to the current room inventory
function drop_item(item) {
  if (inventory.includes(item)) {
    current_room.items.push(item);
    inventory.splice(inventory.indexOf(item),1);
    energy -= 2;
    appendToTerminal("You have dropped the "+ item + " in the " + current_room.name + ".");
    refreshInfo();
    refreshInventory();
    refreshEnergy();
  }

  else {
    appendToTerminal("That item isn't in your inventory.")
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
        energy -= (3 + inventory.length)
        refreshInfo();
        refreshMap();
        refreshEnergy();
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
            refreshMessages();
        }
    }

    // If there was no match
    if (!good_login) {
        appendToTerminal("Credentials not recognised - please try again.");
    }
}

// Returns a string with the big map
function render_main_map() {


}


// Call the function to set up the rooms
// This is the first thing called! Everything else flows from here
roomSetup();




