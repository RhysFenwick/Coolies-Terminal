// Arrays/JSONs to be filled later
var logins;
var rooms;
var doors;
var exits;
var current_room;
var items;
var item_names = [];
var help_tips;
var help_names = [] // To be filled from help_tips
var helpcount; // Will be number of help tips
var tipnum = 0;
var current_tip;
var keynum = 0;
var padsize = 4;
var keypad = new Array(padsize**2).fill(0)
var inventory = []; // Item names only
var terminal_title;
var start_string;
var weight = 3; // Movement cost when nothing in inventory
var sites;
var current_site = null; // String equal to current site room

// Decryption text
var d_size = 1800; // May well need to ramp this up to cover screen
var d_text_array = Array.from('0'.repeat(d_size))
var d_array = Array.from({length: d_size},(_,i) =>i); // creates 0-indexed array of nums to d_size
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
var final_text = "           1                                                                5                         64                                                            28                           88                                                          60                             80                                                        00                           4   001                                                     00   3                        49   008                 400000000000000006               900   48                         003  6005            10081              74004          1000  700                       79  8007 70005          10061               6005        20003  800  65                     90  3000  30000093        4000000000000000097     79000004  0004  00                       809  40002  72000006                          20000057  10009  400                         9009  50006      90001                     80007     40004  6008                            8009   9000       6001                7008       8008   4000                                0000    1003       902            700       7003    8000                                0   60003               0          87              70008   81                             1007   5006                                      4009    005                                0004     301                                7827    5000                                    00005                                          200001                                       200002                                    100004                                             760087                               80087                                                                                                                                            96                                  697                                                      30000665                26600003                              "
var decrypt_toggle = false; // Becomes true if the previous input was "decrypt"
d_text_array.forEach(function(c, charind, arr) { // Randomises the characters in d_text_array
  arr[charind] = chars.charAt(Math.floor(Math.random() * chars.length));
}); 

// Hard-coding this for now to test, will change later
var combo = [
          1,1,1,1,
          0,0,1,0,
          0,1,0,0,
          1,0,0,0
        ];

// Tabs
var tabviews = ["main-button", "map-button", "help-button","site-button"]
var current_tab = 0 // Starts on the main screen

// Mapping
var map_rows = 6
var map_cols = 7
var row_len = map_cols * 8 + 3

// Full-size map

// The intermediate string of the big map (5 cells each 5 wide with a pipe either side)
var map_wall = "--------".repeat(map_cols) + "-\r\n"

// The string of blank rooms
var map_sides = "|       ".repeat(map_cols) + "|\r\n"

// The string of rooms with a roof
var map_row = map_wall + map_sides.repeat(3)

// The final string
var mapstring = map_row.repeat(map_rows) + map_wall

// Minimap
var mini_row = "  ".repeat(map_cols) + " \r\n"
var minimap = mini_row.repeat(map_rows)

// User

// Start with privilege level 0, escalate through logins if needed
var current_user = null;
var priv = 0;
var energy = 100;

// Helper functions

// Gets random integer from 0 to n-1
function getRandomInt(n) {
  return Math.floor(Math.random() * n);
}

// Edits text by ID
function editText(loc,txt="") {

    const location = document.getElementById(loc);
    location.textContent = txt;
}

// Takes a string and a Boolean of whether to make it slow or all at once
// And prints it to the terminal
function appendToTerminal(text, slowText=true,loc="terminal") {
    const line = document.createElement("p");
    
    const location = document.getElementById(loc);

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
  editText(box,"");
  
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
  refreshSite();
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
    inventory_str = inventory.join('\n');
  }
  newBoxText("inventory",inventory_str);
}

// A function to refresh the energy - should be called by generalRefresh() most of the time
function refreshEnergy() {
  energy_str = energy + "%\r\n\r\nCost per movement:\r\n" + (weight) + "%";
  if (energy < (weight) * 3 || energy < 15) {
    energy_str = "**LOW** " + energy + "% **LOW**" + "\r\n\r\nCost per movement:\r\n" + (3 + inventory.length) + "%";
    newBoxText("energy",energy_str);
    appendToTerminal("Warning: Energy low. Discard items or recharge.")
  }
  else {
    newBoxText("energy",energy_str);
  }
}

// A function to recharge energy. Defaults to  making it 100%.
function recharge(amount=100) {
  energy += amount
  if (energy > 100) {
    energy = 100
  }
  refreshEnergy()
  appendToTerminal("Recharged.")
}

// A function to refresh the map - should be called by generalRefresh() most of the time
function refreshMap() {

  for (r in rooms) {
    var room = rooms[r]

    // If it's outside - skip!
    if (room.name == "outside") {
      continue;
    }

    var row = room.coords[1];
    var col = room.coords[0];

    // The starting index of where to put room name on the map
    start_index = 2 * row_len + 4 * row_len * row + 8 * col + 2

    // Now for the minimap!
    var mini_room = row * (map_cols*2 + 3) + col*2 + 1

    // TODO - Condense this?

    // Add the room names
    mapstring = editString(mapstring,room.mapname,start_index);

    if (room.name == current_room.name) {
      // If it's the current room, add dots!
      mapstring = editString(mapstring,"* * *",start_index - row_len);
      mapstring = editString(mapstring,"* * *",start_index + row_len);

      // And minimap
      minimap = editString(minimap,"X ",mini_room)
    }
    else {
      // If it's not, remove dots!
      mapstring = editString(mapstring,"     ",start_index - row_len);
      mapstring = editString(mapstring,"     ",start_index + row_len);

      // And minimap
      minimap = editString(minimap,"* ",mini_room)
    }
  }

  // Now add doors!
  for (d in doors) {
    var door = doors[d];

    // If it's outside - skip!
    if (door.room1 == "outside" || door.room2 == "outside") {
      continue;
    }
    
    // Coords of "start" and "end" rooms (arbitrary)
    var start_coords = getRoom(door.room1).coords;
    var end_coords = getRoom(door.room2).coords;

    // Coords of door relative to starting room (positive = down and to the right)
    // One of these will be zero and the other will be +- 1
    var x_diff = end_coords[0] - start_coords[0];
    var y_diff = end_coords[1] - start_coords[1];

    // The index of the centre of the room
    middle_index = 2 * row_len + 4 * row_len * start_coords[1] + 8 * start_coords[0] + 4
    
    // Work out how far/which direction to shift the middle index
    // If it's to the side, y_diff == 0
    if (y_diff == 0) {
      door_shift = x_diff * 4
    }
    else {
      door_shift = y_diff * row_len * 2
    }

    door_index = middle_index + door_shift // Sign of x/y_diff will shift it the right direction

    if (door.locked) {
      door_char = "X";
    }
    else {
      door_char = "O";
    }

    mapstring = editString(mapstring,door_char,door_index);
  }

  // TODO: Spin out some of the code above that's reused (e.g. middle_index)

  for (e in exits) {
    var exit = exits[e];

    // Map coordinates of room with the exit
    var room_x = exit.room_coords[0];
    var room_y = exit.room_coords[1];

    // Direction of exit
    var exit_side = exit.side;

    // The index of the centre of the room
    middle_index = 2 * row_len + 4 * row_len * room_y + 8 * room_x + 4

    // Work out how far/which direction to shift the middle index
    // If it's to the side, y-shift of the exit side == 0
    if (exit_side[1] == 0) {
      door_shift = exit_side[0] * 4
    }
    else {
      door_shift = exit_side[1] * row_len * 2
    }

    door_index = middle_index + door_shift // Sign of x/y-shift will shift it the right direction

    if (exit.locked) {
      door_char = "X";
    }
    else {
      door_char = "O";
    }

    mapstring = editString(mapstring,door_char,door_index);
  }


  typeLineEffect("map-box",mapstring);
  typeLineEffect("minimap-box",minimap);
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
function createInputLine(loc="terminal") {
    const inputLine = document.createElement("input");
    inputLine.type = "text";
    inputLine.id = "inputLine";
    inputLine.autofocus = true;
    inputLine.autocomplete = "off";

    const terminal = document.getElementById(loc);
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
          
          if (loc == "terminal") {
            // Append the input text to the terminal
            appendToTerminal("> " + input, false, loc);
          }
          
          else if (loc == "site-content-left") {
            editText(loc,"FILENAME QUERY: "+input)
            displaySearch(input);
          }
          

          if (current_tab == 0) {
            // Type anything in terminal that's needed here
            parseInput(input);
          }
          
          // Add a new input line at the end
          createInputLine(loc);
      }
    });
}

// Functions to add letters one by one

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeWriterEffect(str, div,helpScreen=false) {
    for (let i = 0; i < str.length; i++) {
        if (str[i] == ".") {
            await delay(200) // Wait longer for periods
            if (!(helpScreen && current_tab != 2))  {
              document.getElementById("single-click").play();
            } 
        }
        else if (str[i] == "\n") {
          await delay(20);
          if (!(helpScreen && current_tab != 2))  {
            document.getElementById("double-click").play();
          }
        }
        else {
            await delay(20); // Wait for 20ms per other character
            if (!(helpScreen && current_tab != 2))  {
              document.getElementById("single-click").play();
            }  
        }
        div.append(str[i]);
    }
}

// Function to add lines one by one (used for map)

async function typeLineEffect(box,str) {

  // Array of lines
  var lines = str.split("\r\n");

  const div = document.getElementById(box);
  editText(box,"");

  // The box title
  const title = document.createElement("h4");

  // The map itself
  const mapgrid = document.createElement("p");

  if (box == "minimap-box") {
    div.appendChild(title);
    title.append("MINIMAP");
  }

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

// Function to move keypad highlight
function highlightKeypad() {
  var keypad_buttons = document.getElementById("site-login").children;

  for (b in keypad_buttons) {
    var button = keypad_buttons[b];

    if ("keypad-" + keynum.toString() === button.id) {
      button.style.border = "6px solid #008000";
      button.style.width = "34px";
      button.style.height = "34px";
    }

    else if (button.className === "keypad-button") {
      button.style.border = "3px solid #008000";
      button.style.width = "40px";
      button.style.height = "40px";
    }
  }
}


// Function to highlight current_tip help button and display the relevant text
function helpOption() {

  displayHelp(); // Displays current_tip text in the help display box

  // TODO: Can I pull buttons directly from html?
  var help_buttons = document.getElementById("help-menu").children;

  for (b in help_buttons) {
    var button = help_buttons[b];

    if ("help-" + current_tip === button.id) {
      button.style.border = "6px solid #008000";
      button.style.width = "84px";
      button.style.height = "84px";
    }

    else if (button.className === "help-option") {
      button.style.border = "3px solid #008000";
      button.style.width = "90px";
      button.style.height = "90px";
    }
  }
}

// Function to swap screens
function swapView(clickedView) {

  var menu_buttons = ["map","main","help","site"]
  for (b in menu_buttons) {
    var button_name = menu_buttons[b] + "-button";
    var screen_name = menu_buttons[b] + "-screen";
    var button = document.getElementById(button_name);
    var screen = document.getElementById(screen_name);

    if (clickedView == button_name) {
      button.style.border = "6px solid #008000";
      button.style.width = "44px";
      button.style.height = "44px";
      screen.style.display = "flex";
    }

    else {
      button.style.border = "3px solid #008000";
      button.style.width = "50px";
      button.style.height = "50px";
      screen.style.display = "none";
    }

    if (button_name == "main-button") {
      // Focus on the input line
      const inputLine = document.getElementById("inputLine");
      if (inputLine) {
      inputLine.focus();
      } 
    }
  }
}

// OnClick listener - if the user is pressing a button, activate, otherwise focus input line

document.addEventListener("click", function() {

  // Focus on the input line
  const inputLine = document.getElementById("inputLine");
  if (inputLine) {
      inputLine.focus();
  }
});

// Similar function to the above but for typing.

document.addEventListener("keydown", function(event) { // keypress doesn't pick up arrows
  // Logic to swap screen on a key press
  if (event.key === "-") {
    event.preventDefault();
    current_tab = (current_tab + 1)%4 // Cycles through all three
    swapView(tabviews[current_tab])
    if (current_tab === 2) { // The number for the help tab
        helpOption(); // By default sets it to the first option (help-clear)
    }
    else if (current_tab === 3 && current_site) { // Shouldn't trigger on null
      createInputLine("site-content-left");
    }
  }

  // Logic to swap current_tip on key press
  if (["ArrowDown","ArrowUp","ArrowRight","ArrowLeft"].includes(event.key) && current_tab === 2) {
    switch (event.key) {
      case "ArrowUp":
        tipnum = (tipnum - 2 + helpcount)%helpcount;
        break;
      
      case "ArrowDown":
        tipnum = (tipnum + 2)%helpcount;
        break;
      
      case "ArrowLeft":
        tipnum = (tipnum - 1 + helpcount)%helpcount;
        break;

      case "ArrowRight":
        tipnum = (tipnum +1)%helpcount;
        break;

      default:
        break;
    }
    current_tip = help_names[tipnum];
    helpOption();
  }

  // Keypad logic
  else if (current_tab === 3) {
  
    // Movement
    if (["ArrowDown","ArrowUp","ArrowRight","ArrowLeft"].includes(event.key)) {
      var padcount = padsize**2
      switch (event.key) {
        case "ArrowUp":
          keynum = (keynum - padsize + padcount)%padcount;
          break;
        
        case "ArrowDown":
          keynum = (keynum + padsize)%padcount;
          break;
        
        case "ArrowLeft":
          keynum = (keynum - 1 + padcount)%padcount;
          break;
  
        case "ArrowRight":
          keynum = (keynum +1)%padcount;
          break;
  
        default:
          break;
      }
      highlightKeypad();
    }
    else if (event.code == "Space" || event.code == "Enter") { // Would otherwise do event.key but this is more readable
      toggleKeypad()
    }
  }
})

// Toggles selected key on/off and compares to current code
function toggleKeypad() {
  var focus_key = document.getElementById("keypad-" + keynum.toString());
  if (focus_key.style.backgroundColor == "rgb(0, 128, 0)") { // This is what it becomes behind the scenes - equivalent to #008000
    focus_key.style.backgroundColor = "";
  }
  else {
    focus_key.style.backgroundColor = "rgb(0, 128, 0)";
  }
   
  keypad[keynum] = (keypad[keynum] + 1)%2 // Toggles the corresponding digit in the keypad between 1 and 0
  checkKeypad()
}

// Resets all keys on the keypad to blank
function wipeKeypad() {
  var focus_key = document.getElementById("keypad-" + keynum.toString());
  focus_key.style.backgroundColor = "";
   
  keypad[keynum] = 0
}

// Takes a string, a character, and an index and returns the same string with that index replaced by the char
// Not just for chars!
function editString(str,char, ind) {
  return str.substring(0, ind) + char + str.substring(ind + char.length);
}

// Takes a one-word string (name) and returns JSON object of that item - will return nothing if item not found.
function getItemFromName(name) {
  for (i in items) {
    if (items[i].name == name) {
      return items[i]
    }
  }
}

// End helper functions

// The core game logic!
// Fetching rooms has to be asynchronous as it involves fetching the JSON file. Can call non-async functions as needed.

// Load the rooms JSON
async function get_rooms() {
    const response = await fetch("./content.json");
    const data = await response.json();
    return data;
}

// Async function to handle loading of rooms and any subsequent operations
async function roomSetup() {
    try {
        rooms_json = await get_rooms();

        // Get loading bar
        var loadbar = document.getElementById("loading-bar");        
        
        // Wait six seconds then make flash screen loaded
        await delay(1500);
        loadbar.innerText = "Loading."
        await delay(1500);
        loadbar.innerText = "Loading.."
        await delay(1500);
        loadbar.innerText = "Loading..."
        await delay(1500);
        loadbar.innerText = "Loaded."

        // Wait one second then close the splash screen
        await delay(1000);
        document.getElementById("splash").style.display = "none";
        
        // Pass rooms_json out to the main gameplay loop!
        gameStart(rooms_json);

    } catch(error) {
        console.error('Error fetching rooms:', error);
    }
}



// The core gameplay loop - takes in rooms_json and does a bunch of if/then on input
function gameStart(rooms_json) {

    // By the time the regular gameplay loop has been reached, these will be filled.
    logins = rooms_json.logins // An array of the username/password/acct name arrays. TODO: Make JSONs to match?
    rooms = rooms_json.rooms // An array of the room JSONs.
    doors = rooms_json.doors // An array of door JSONs.
    exits = rooms_json.exits // An array of exit JSONs.
    current_room = rooms[0]; // Start off in the first room
    items = rooms_json.items; // An array of item JSONs.
    inventory = rooms_json.starting_inventory; // An array of item names you start with
    help_tips = rooms_json.help_tips; // A JSON of command/tooltip pairs
    sites = rooms_json.sites // An array of the site computer JSONs.

    terminal_title = rooms_json.strings.title;
    start_string = rooms_json.strings.start_message;
    appendToTerminal(start_string);

    // Fill out the remaining arrays 
    for (t of Object.keys(help_tips)) {
      help_names.push(t);
    }

    for (i in items) {
      item_names.push(items[i].name);
    }
    
    for (i in inventory) {
      focus_item = getItemFromName(inventory[i]);
      weight += focus_item.weight;
    }
    
    // Update the title 
    var titleElement = document.querySelector("#title h1");
    titleElement.textContent = terminal_title;

    // Add help buttons
    help_list = document.getElementById("help-menu");
    for (h in help_names) {
      h_item = help_names[h];
      h_button = document.createElement("div");
      h_button.id = "help-" + h_item;
      h_button.className = "help-option";
      h_button.append(h_item[0].toUpperCase() + h_item.slice(1));
      help_list.append(h_button);
    }

    // Fill out other help-related variables
    helpcount = help_names.length;
    current_tip = help_names[tipnum];

    // Prep empty site login screen
    site_login = document.getElementById("site-login");
    for (b=0; b<padsize**2; b++) { // b = grid size squared
      keypad_button = document.createElement("div");
      keypad_button.id = "keypad-" + b.toString();
      keypad_button.className = "keypad-button";
      site_login.append(keypad_button);
    }
    highlightKeypad(); // Initialises first key being selected
    
    // Initialise the right hand side
    generalRefresh();

    // Initialize the terminal with the input line ready for user input (and kick off the game)
    createInputLine();
}

// The core gameplay "move": takes in a string and does what it needs to with it
// Doesn't need to return anything but will probably need to appendToTerminal and adjust room and current_room
function parseInput(raw_input) {

    // Make sure it's lower case for easier comparison - NOTE: Only works on strings, not chars
    input = raw_input.toLowerCase();

    // Breaks up the input into key words
    input_array = input.split(" ");

    // The key instruction given - decides what happens next
    action = input_array[0];
    console.log(action);

    switch(action) {

      case "login":
        login(input_array);
      break;
      
      case "move":
        if (current_user) {
          moveRooms(input_array);
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
        editText("terminal","");
        createInputLine();
      break;
      
      case "inspect":
        focus = input_array[1]
        // Inspect the room or an item
        if (current_user) {

          if (focus == "room") {
            inspect_room(focus);
          }

          else if (item_names.includes(focus)) {
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

      case "recharge":
        if (parseInt(input_array[1])) {
          recharge(parseInt(input_array[1]));
        }
        else {
          recharge();
        }
      break;
      
      case "decrypt":
        decrypt_toggle = true; // Priming 
        appendToTerminal("WARNING: Decrypting this file will require the full use of A.N.G.E.L. computing resources for approximately 600 seconds. All non-essential station functions will be inaccessible in this time.\nType Yes to confirm or No to cancel.")
      break;

      case "yes": // Should only be typed after "decrypt"
        if (decrypt_toggle) {
          decrypt_toggle = false;
          decrypt();
        }
        else {
          appendToTerminal("I'm sorry, I don't recognise that command. Try again or visit the help menu for assistance.");
        }
      break;

      case "no": // Should only be typed after decrypt (to cancel)
        decrypt_toggle = false;
        appendToTerminal("Decryption aborted.");
      break;

      default:
        appendToTerminal("I'm sorry, I don't recognise that command. Try again or visit the help menu for assistance.")
      break;
    }
}

// Adds an item to personal inventory and removes it from the room
function take_item(item) {
  if (current_room.items.includes(item)) {
    var index = current_room.items.indexOf(item);
    if (index > -1 && energy > 1) {
      current_room.items.splice(index, 1);
      inventory.push(item);
      appendToTerminal("You have taken the "+ item + ".");
      focus_item = getItemFromName(item);
      weight += focus_item.weight;
      energy -= 2;
      refreshInfo();
      refreshInventory();
      refreshEnergy();
    }
    else if (energy < 2) {
      appendToTerminal("You have insufficient energy to take this item.");
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
    appendToTerminal("You have dropped the "+ item + " in the " + current_room.name + ".");
    focus_item = getItemFromName(item);
    weight -= focus_item.weight;
    refreshInfo();
    refreshInventory();
    refreshEnergy();
  }

  else if (item == "all") { // i.e. the command "drop all"
    for (var item of inventory) {
      current_room.items.push(item);
      inventory.splice(inventory.indexOf(item),1);
      focus_item = getItemFromName(item);
      weight -= focus_item.weight;
    }
    appendToTerminal("You have dropped all items.");
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

    if (item_names.includes(item)) {
      focus_item = getItemFromName(item);
      appendToTerminal(focus_item.description);
    }
    else {
      appendToTerminal("That item is unremarkable.");
    }
  }
  else if (inventory.includes(item)) {
    focus_item = getItemFromName(item);
    appendToTerminal(focus_item.description + " It is in your inventory.");
  }
  else {
    appendToTerminal("You can't see a " + item + " right now.");
  }
}

// Prints a description of the room to the terminal and makes info panel print list of room items.
function inspect_room(room_name){
  var room = getRoom(room_name);
  if ((room && room.name == current_room.name) || room_name == "room") {
    appendToTerminal("The " + room.name + " is " + room.description);
    room.inspected = true;
    refreshInfo();
  }
  else {
    appendToTerminal("You can only inspect the room you're currently in.")
  }
  
}
// Checks if a door is accessible: used for move/unlock. Returns door if one is found, null otherwise
function checkForDoor(queried_room) {
  
  var valid_room = null;
  
  for (d in doors) {
    var door = doors[d];
      // Is there a better way to do this?
      if ((queried_room == door.room1 && current_room.name == door.room2) || (queried_room == door.room2 && current_room.name == door.room1)) {
        valid_room = door;
      }
    }
  return valid_room;
}

// Handles unlock attempts
function unlock(input_array) {
  queried_room = input_array[1];
  password = input_array[2];
  var door = checkForDoor(queried_room);
  
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
      if (getRoom(queried_room).passwords.includes(password)) {
        // Is this by reference?
        door.locked = false;
        appendToTerminal("Door unlocked.")
        refreshMap();
      }
      else {
        appendToTerminal("Incorrect password.")
      }
    }
  }
}

// Handles moving attempts
function moveRooms(input_array) {
    queried_room = input_array[1];
    var door = checkForDoor(queried_room);
    
    // Shouldn't trigger if no door (null)
    if (door != null) {
      // Checks if door is unlocked
      if (door.locked) {
        appendToTerminal("The door to " + queried_room + " is locked. Enter 'unlock [room-name] [password] to unlock.");
      }
      else {
        // Checks energy
        if (energy > 2 + inventory.length) {
          // Moves current room
          current_room = getRoom(queried_room);
          appendToTerminal("You've moved to the " + queried_room + ".")
          energy -= (3 + inventory.length)
          refreshInfo();
          refreshMap();
          refreshEnergy();
          checkEvents();
          refreshSite();
        }
        else {
          // Not enough energy!
          appendToTerminal("Insufficient energy to move. Consider discarding items or recharging.")
        }
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

// Generic "check if there's any event given current state" function - currently empty.
function checkEvents() {

}

// Prints a description of an item (if it exists and you can see it) to the terminal 
function displayHelp() {
  if (help_tips.hasOwnProperty(current_tip)) {
    newHelpText("help-instructions-box",current_tip,help_tips[current_tip]);
  }
  else {
    newHelpText("help-instructions-box","Instruction not found","That instruction has no explanation. Please contact your A.N.G.E.L. Station Administrator for further information on this instruction.");
  }
}

// A broader "refresh and write to help box" function
function newHelpText(box,topic,txt) {
  editText(box,"");
  
  // The box title
  const title = document.createElement("h4");

  // The box content
  const line = document.createElement("p");

  // The relevant div
  const location = document.getElementById(box);

  location.appendChild(title);
  title.append(topic.toUpperCase());

  location.appendChild(line);
  typeWriterEffect(txt,line,true);
}

// Checks to see if the keypad matches the combination
// TODO: Update this to take advantage of current_site
async function checkKeypad() {
  if (keypad.toString() == combo.toString()) {
    editText("site-login-title-text","Unlocked");
    await delay(500);
    toggleUnlockScreen(true)
  }
}

// Swaps the login/content screens for the site page
function toggleUnlockScreen(content=true) {
  if (content) {
    document.getElementById("site-login-screen").style.display = "none";
    document.getElementById("site-content-screen").style.display = "block";
    if (current_site.locked) {
      createInputLine("site-content-left");
      current_site.locked = false; // TODO: This isn't great - mixing up site/current_site...unless it's by reference?
    }
  }
  else {
    document.getElementById("site-content-screen").style.display = "none";
    document.getElementById("site-login-screen").style.display = "block";
  }
}

// Checks if there's a site computer in the room and updates the site screen accordingly
function refreshSite() {
  wipeKeypad();
  for (var site of sites) {
    if (site.room == current_room.name) {
      current_site = site;
      // Reset content
      editText("content-name","N/A");
      editText("content-desc","No filenames searched yet");

      if (site.locked) { // Reset login screen
        toggleUnlockScreen(false)
        editText("site-login-title-text","Please log in to the " + site.name + " site computer.");
        document.getElementById("site-login").style.display = "grid";
        combo = site.combo;
        return;
      }
      else { // If that room's site computer is already unlocked
        toggleUnlockScreen(true);
        return
      } 
    }
    current_site = null // Means "There is currently no site"
    toggleUnlockScreen(false)
    editText("site-login-title-text","This room does not have a site computer.");
    document.getElementById("site-login").style.display = "none";
  }
}

// A function to display "search" results as needed
function displaySearch(input_string) {
  var match_string = current_site.file_name;
  var output_string = "0 MATCHES FOUND FOR " + input_string + " ON THIS DEVICE.";
  var output_desc = ""
  if (match_string == input_string) {
    output_string = "1 MATCH FOUND FOR " + input_string + " ON THIS DEVICE.";
    output_desc = current_site.file_content;
  }
  editText("content-name", output_string);
  editText("content-desc", output_desc);
}

// Launches a decryption screen + timer
async function decrypt() {
  d_screen = document.getElementById("decrypt-screen");
  d_screen.style.display = "block";
  document.getElementById("interactive-screen").style.display = "none"; // Hides everything else
  editText("decrypt-text",d_text_array.join(""));
  delay(50); // Brief pause to give screen time to update
  for (t=0;t<d_size;t++) {// 10 minutes in 500ms intervals - will be slightly longer as this is just the delays
    for (c of d_array) { // Cycles over each character to begin with
      if (getRandomInt(20) < 1) { // 5% chance of any character changing each cycle
        d_text_array[c] = chars.charAt(getRandomInt(62))
      } 
      
    }
    var random_char = getRandomInt(d_array.length);
    d_text_array[d_array[random_char]] = final_text.charAt(d_array[random_char]); // Gets the corresponding remaining character index
    d_array.splice(random_char,1); // Should remove that character
    // TODO - Harmonise length of d_array and number of loops
    editText("decrypt-text",d_text_array.join(""));
    await delay(10) // Taking a guess that the calculation will take 0.1s per loop? TODO - Check this 
  }

  // Once it's all done...
  document.getElementById("decrypt-timer-box").style.display = "flex"; // Shows finished box

  await delay(3000) // Some time to admire the handiwork
  d_screen.style.display = "none"; // Hides the decryption screen
  document.getElementById("interactive-screen").style.display = "flex"; // Shows everything else again
}

// Call the function to set up the rooms
// This is the first thing called! Everything else flows from here
roomSetup();
