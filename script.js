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

// Sites
var sites;
var current_site = null; // String equal to current site room
var modality; // 0 or null for no site, 1 for file search, 2 for action buttons, 3 for decryption
var eng_files;
var med_files;
var actionOptions = (document.getElementById("dispenser").getElementsByClassName("keypad-button")); // HTMLCollection of action buttons (all divs with class keypad-button in div action-grid)
var actionStates = new Array(actionOptions.length).fill(0); // Will be filled with as many 0's as there are actionOptions
var focusAction = 0; // Will cycle
var actionVariables; // All of the action-related text etc - from JSON
var actionItems; // Name/locations of items that you get in site modality 2 - pulled from JSON
var actionItemsDropped = false; // Becomes true on first dispenser activation
var combo; // Will be 16-digit 0/1 array pulled from JSON

// Coordinates of highlighted cell (from 0-5 and 0-9 respectively)
var file_col = 0;
var file_row = 0;


// Decryption text
var d_size = 1800; // May well need to ramp this up to cover screen
var d_text_array = Array.from('0'.repeat(d_size))
var d_array = Array.from({length: d_size},(_,i) =>i); // creates 0-indexed array of nums to d_size
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
var final_text = "           1                                                                5                         64                                                            28                           88                                                          60                             80                                                        00                           4   001                                                     00   3                        49   008                 400000000000000006               900   48                         003  6005            10081              74004          1000  700                       79  8007 70005          10061               6005        20003  800  65                     90  3000  30000093        4000000000000000097     79000004  0004  00                       809  40002  72000006                          20000057  10009  400                         9009  50006      90001                     80007     40004  6008                            8009   9000       6001                7008       8008   4000                                0000    1003       902            700       7003    8000                                0   60003               0          87              70008   81                             1007   5006                                      4009    005                                0004     301                                7827    5000                                    00005                                          200001                                       200002                                    100004                                             760087                               80087                                                                                                                                            96                                  697                                                      30000665                26600003                              "
d_text_array.forEach(function(c, charind, arr) { // Randomises the characters in d_text_array
  arr[charind] = chars.charAt(Math.floor(Math.random() * chars.length));
});
var decryptComplete = false; // Becomes true once decryption completed


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
function editTextByID(loc,txt="") {

    const location = document.getElementById(loc);
    location.textContent = txt;
}

// Takes a string and makes the first letter capitalised
function makeCap(lowerString) {
  var newStr = lowerString.charAt(0).toUpperCase() + lowerString.slice(1);
  return newStr;
}

// Takes a string and a Boolean of whether to make it slow or all at once
// And prints it to the terminal
function appendToTerminal(text, slowText=true,loc="terminal") {
    const line = document.createElement("p");
    
    const location = document.getElementById(loc);

    location.appendChild(line);
    line.scrollIntoView(); // Should keep current text at the bottom

    if (slowText) {
      typeWriterEffect(text,line)  
    }
    else {
        line.textContent += text
    }
}

// A broader "refresh and write to box" function
function newBoxText(box,txt) {
  editTextByID(box,"");
  
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
  checkEvents();
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
    var keyInv = [];
    var regInv = [];
    for (var i of inventory) { // Split out key items from regular items
      if (getItemFromName(i).key) {
        keyInv.push("**" + i + "**");
      }
      else {
        regInv.push(i);
      }
    }

    // Now rejoin them!
    inventory_str = keyInv.join('\n') + '\n' + regInv.join('\n');
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
    if (room.id == "outside") {
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

    if (room.id == current_room.id) {
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
    var start_coords = getRoomFromID(door.room1).coords;
    var end_coords = getRoomFromID(door.room2).coords;

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
            if (current_room.id == door.room1) {
              doors_str += getRoomFromID(door.room2).name.toUpperCase() + ", "
            }
            else if (current_room.id == door.room2) {
              doors_str += getRoomFromID(door.room1).name.toUpperCase() + ", "
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
function createInputLine(loc="term-input") {
    const inputLine = document.createElement("input");
    inputLine.type = "text";
    inputLine.id = "inputLine";
    inputLine.autofocus = true;
    inputLine.autocomplete = "off";

    const term_input = document.getElementById(loc);
    term_input.appendChild(inputLine);
    inputLine.scrollIntoView(); // Keeps it at the bottom/visible
    
    // Focus the new input line
    inputLine.focus();
    
    // Add the event listener to the new input line
    // This is what triggers whenever a command is entered!
    inputLine.addEventListener("keypress", function(event) {
      
      document.getElementById("single-click").play(); // Plays every time a key is pressed

      if (event.key === "Enter") { // Does different things depending on the screen
          event.preventDefault();
          const input = this.value;
          
          // Remove the input line from the DOM before appending the text
          this.remove();
          
          if (loc == "term-input") {
            // Append the input text to the terminal
            appendToTerminal("> " + input, false, "terminal");
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
        div.scrollIntoView();
    }
}

// Function to add lines one by one (used for map)

async function typeLineEffect(box,str) {

  // Array of lines
  var lines = str.split("\r\n");

  const div = document.getElementById(box);
  editTextByID(box,"");

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
      highlightKey(button);
    }

    else if (button.className === "keypad-button") {
      highlightKey(button,false);
    }
  }
}

// Highlights or unhighlights the specified keypad-button div
function highlightKey(key, on=true) {
  if (on) {
    key.style.border = "6px solid #008000";
    key.style.width = "34px";
    key.style.height = "34px";
  }
  else {
    key.style.border = "3px solid #008000";
    key.style.width = "40px";
    key.style.height = "40px";
  }
}

// Function to highlight current_tip help button and display the relevant text
function helpOption() {

  displayHelp(); // Displays current_tip text in the help display box

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

// Function for the file site search - takes a highlighted div and creates the correct column to the right
function makeRightFileDiv(folder_div) {
  var file_col = folder_div.parentElement;
  var range_digits = folder_div.textContent;
  var start_digits = range_digits.split("-")[0] // The start of the range for the next folder
  var oom = parseInt(file_col.id.split("-")[2]) + 1 // The order of magnitude digit to be cycled through, e.g. 2 from file-column-1. This is because digit[2] (i.e. 3rd digit) will iterate in file-column-2.
  
  var new_col = null; // Will only stay null if the current file_col is already furthest to the right
  if (oom < 6) {
    new_col = document.getElementById("file-column-" + oom); // E.g. if current column is file-column-1, this should be file-column-2.
    new_col.innerHTML = ""; // Clear out any HTML already in there
    for (i=0;i<10;i++) { // Add in 10 fresh divs
      var new_file_div = document.createElement("div");
      new_file_div.className = "file-folder";
      new_col.appendChild(new_file_div);
    }
  }
  // By this point, if you are writing to a new column (i.e. you're not navigating the rightmost already), the structure should exist

  var new_start_digits = []; // Will contain start_digits for new column as string
  for (i=0;i<10;i++) {
    var next_entry;
    var next_digit = editString(start_digits,i.toString(),oom);
    if (oom == 5) { // These will go in the rightmost column
      next_entry = "Batch " + next_digit + ".log";
    }
    else { // Regular column
      next_entry = next_digit + "-" + editString(start_digits,(i.toString() + "9".repeat(5-oom)),oom) // Should be the right number of nines?
    }
    new_start_digits.push(next_entry);
  }
  // By this point each entry in new_start_digits should be the correct string

  // Get the freshly created child file-folder divs, then add the text to them
  if (new_col) { // If not creating one too far to the right
    var new_file_divs = new_col.childNodes;
    for (var div in new_file_divs) { // 'in' not 'of' - want the number to cycle through new_start_digits
      new_file_divs[div].textContent = new_start_digits[div];
    }

    // And finally draw SVG
    drawSVG(folder_div,new_col);
  }
}

///////////////////////////////////////////////////////////////////////////////
//  Document-wide listeners
///////////////////////////////////////////////////////////////////////////////

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
    else if (current_tab === 3) { // Site tab

      modality = current_site.modality // 0 or null for no site, 1 for file search, 2 for action buttons, 3 for decryption

      // Makes current modality visible, all others hidden
      document.getElementById("site-modality-" + modality).style.display = "flex"; 
      var wrong_modalities = [1,2,3].filter(item => item !== modality);
      for (var m of wrong_modalities) {
        document.getElementById("site-modality-" + m).style.display = "none"; 
      }


      if (modality == 2) { // Select the correct version of the action site
        for (v of ["airlock","dispenser"]) { // TODO - Hard-coding these in seems...bad
          if (v == current_site.type) {
            document.getElementById(v).style.display = "grid";
            updateActions(v);
          }
          else {
            document.getElementById(v).style.display = "none";
          }
        }
      }
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

  // Site logic
  else if (current_tab === 3) {

    // Keypad logic
    if (current_site && current_site.locked) {
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
        else if (event.code == "Space" || event.code == "Enter") { // Would otherwise do event.key but this is more readable for Space (where key = ' ')
            toggleKeypad()
        }
    }

    // File system logic
    else if (modality == 1) { // Should only trigger on unlocked file site
      switch(event.key) { // Arrows for nav, Enter/space for selecting file, Escape for removing file pop-up
        case "ArrowUp":
          file_row = (file_row + 9)%10 // Equivalent to -1 but cycles around without worrying about negatives
          shiftFile();
        break;

        case "ArrowDown":
          file_row = (file_row + 1)%10 
          shiftFile();
        break;

        case "ArrowLeft":
          file_col -= 1;
          if (file_col < 0) {
            file_col = 0;
          }
          shiftFile();
        break;

        case "ArrowRight":
          file_col += 1;
          if (file_col > 5) {
            file_col = 5;
          }
          shiftFile();
        break;

        case " ":
        case "Enter":
          if (file_col == 5) { // In the final column

          }
        break;

        case "Escape":

        break;

      }
    }

    // Action logic
    else if (modality == 2) { // Should only trigger on unlocked action sites

      if (current_site.type == "dispenser") { // Only if it's the site with multiple options
        switch (event.key) { // Will move focused action key up or down, or toggle on enter
            case "ArrowUp":
              highlightKey(actionOptions[focusAction], false) // Turn off current key
              focusAction = (focusAction + actionOptions.length - 1)%actionOptions.length; // Same as mod of fA-1 without risk of negatives
              highlightKey(actionOptions[focusAction]) // Turn on new key
            break;

            case "ArrowDown":
              highlightKey(actionOptions[focusAction], false) // Turn off current key
              focusAction = (focusAction + 1)%actionOptions.length;
              highlightKey(actionOptions[focusAction]) // Turn on new key
            break;

            case " ": // Fall-through: triggers on both Space and Enter
            case "Enter":
              toggleDiv(actionOptions[focusAction]); // Toggles visual of the button on/off
              actionStates[focusAction] = (actionStates[focusAction] + 1)%2; // Toggles it between 0 and 1
              updateActions("dispenser");
            break;
        }
      }

      else if (current_site.type == "airlock") {
        switch (event.key) {
          case " ": // Fall-through: triggers on both Space and Enter
          case "Enter":
            console.log("Airlock triggered!")
            toggleDiv(document.getElementById("airlock-action-0-button")); // Toggles visual of the button on/off
            // TODO - Remove all solid items
            updateActions("airlock");
          break;
        }
      }
    }

    // Decrypt logic
    else if (modality == 3) {
        switch (event.key) { // Really only listening for Enter at the moment
          case "Enter":
            if (!decryptComplete) { // Only decrypt if you haven't already
              decrypt();
            }
          break;
        }
    }

  }
})

// Toggles the background of the passed div
function toggleDiv(div) {
    if (div.style.backgroundColor == "rgb(0, 128, 0)") { // This is what it becomes behind the scenes - equivalent to #008000
        div.style.backgroundColor = "";
      }
      else {
        div.style.backgroundColor = "rgb(0, 128, 0)";
      }
}

// Toggles selected key on/off and compares to current code
function toggleKeypad() {
  var focus_key = document.getElementById("keypad-" + keynum.toString());
  toggleDiv(focus_key);
   
  keypad[keynum] = (keypad[keynum] + 1)%2 // Toggles the corresponding digit in the keypad between 1 and 0
  checkKeypad()
}

// Resets all keys on the keypad to blank
function wipeKeypad() {
  for (i=0;i<padsize**2;i++) {
    var focus_key = document.getElementById("keypad-" + i.toString());
    focus_key.style.backgroundColor = "";
    keypad[i] = 0
  }
  keynum = 0; // Resets focus key to top left
  highlightKeypad(); // Resets visual
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


// Async function to handle loading of rooms and any subsequent operations
async function roomSetup() {

  document.getElementById("splash").style.display = "block"; // Make splash screen appear first thing

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

///////////////////////////////////////////////////////////////////////////////
//  Initial setup + core gameplay loop
///////////////////////////////////////////////////////////////////////////////

function gameStart(rooms_json) {

    // By the time the regular gameplay loop has been reached, these will be filled.
    logins = rooms_json.logins // An array of the username/password/acct name arrays. TODO: Make JSONs to match?
    rooms = rooms_json.rooms // An array of the room JSONs.
    doors = rooms_json.doors // An array of door JSONs.
    exits = rooms_json.exits // An array of exit JSONs.
    current_room = rooms[4]; // Start off in the 5th room (currently the center)
    items = rooms_json.items; // An array of item JSONs.
    inventory = rooms_json.starting_inventory; // An array of item names you start with
    help_tips = rooms_json.help_tips; // A JSON of command/tooltip pairs
    sites = rooms_json.sites // An array of the site computer JSONs.
    eng_files = rooms_json.eng_files // An array of the engineer-style file JSONs.
    med_files = rooms_json.med_files // An array of the medical-style file JSONs.
    actionVariables = rooms_json.action_variables; // An array highlighting the action text + the item you get

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

    // Action modality variables

    // Highlight the top actionOption
    highlightKey(actionOptions[focusAction]);

    // Create array of action_item JSONs
    actionItems = rooms_json.action_items;

    // Update decryption text
    editTextByID("site-decrypt-title",rooms_json.decryption_variables.predecryptTitle);
    editTextByID("site-decrypt-text",rooms_json.decryption_variables.predecryptText);
    
    
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
        editTextByID("terminal","");
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

      case "return": // Prompted on reaching the outermost rooms
        return_to_base();
      break;

      default:
        appendToTerminal("I'm sorry, I don't recognise that command. Try again or visit the help menu for assistance.")
      break;
    }
}

// Unlocks all doors
function breakout() {
  for (var door of doors) {
    door.locked = false;
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
function drop_item(item,verbose=true) {
  if (inventory.includes(item)) {
    current_room.items.push(item);
    inventory.splice(inventory.indexOf(item),1);
    focus_item = getItemFromName(item);
    weight -= focus_item.weight;
    if (verbose) {
      appendToTerminal("You have dropped the "+ item + " in the " + current_room.name + ".");
      refreshInfo();
      refreshInventory();
      refreshEnergy();
    }
    
  }

  else if (item == "all") { // i.e. the command "drop all"
    var temp_items = inventory.slice() // Clones rather than moving by reference
    for (var item of temp_items) {
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
function getRoomFromName(room_name) {
  var room = null
  
  for (r in rooms) {
    var current_room = rooms[r]
    if (current_room.name == room_name) {
      room = current_room
    }
  }
  return room;
}

// Returns a room JSON from the ID, returns null if room not found
function getRoomFromID(room_id) {
  var room = null
  
  for (r in rooms) {
    var current_room = rooms[r]
    if (current_room.id == room_id) {
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
  var room;
  if (room_name == "room") {
    room = current_room;
  }
  else if (getRoomFromName(room_name)) { // Should only trigger if this isn't null
    room = getRoomFromName(room_name)
  }
  else { // There's no room name
    appendToTerminal(room_name + " is not a valid room or item.")
    return;
  }
    
  if ((room && room.name == current_room.name) || room_name == "room") { // Checks if the room is the current room
    appendToTerminal(makeCap(room.name) + " is " + room.description);
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
      if (getRoomFromName(queried_room) && (getRoomFromName(queried_room).id == door.room1 && current_room.id == door.room2) || (getRoomFromName(queried_room) && getRoomFromName(queried_room).id == door.room2 && current_room.id == door.room1)) {
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
      // Check for password
      if (getRoomFromName(queried_room).passwords.includes(password)) { // Correct password
        door.locked = false;
        appendToTerminal("Door unlocked.")
        refreshMap();
      }
      else { // Wrong password
        if (getRoomFromName(queried_room).keys.length > 0) { // Wrong password + at least one key exists
          if (getRoomFromName(queried_room).keys.includes(password) && inventory.includes(password)) { // Correct key and in inventory
            inventory.splice(inventory.indexOf(password),1); // Remove key from inventory
            door.locked = false;
            appendToTerminal("Door unlocked using " + password + ".");
            refreshInventory();
            refreshMap();
          }
          else { // Incorrect key/password, but a key does exist
            if (inventory.includes(password)) { // You have the key
              appendToTerminal("Incorrect password.\nIt appears this door can be unlocked using the " + password + " in your inventory.");
            }
            else { // A key exists but you don't have it
              appendToTerminal("Incorrect password. It appears that this door can be unlocked with a password or an item.")
            }
          }
        }
        else { // Wrong password + no keys exist
          appendToTerminal("Incorrect password.")
        }
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
        appendToTerminal("The door to " + makeCap(queried_room) + " is locked. Enter 'unlock [room-name] [password] to unlock.");
      }
      else {
        // Checks energy
        if (energy > 2 + inventory.length) {

          if (["north1","east1","west1"].includes(current_room.id)) { // If you're in a far room, need to RETVRN to get back to base
            appendToTerminal("WARNING: Maintenance needed for safe return journey. Type 'return' to return to base and commence automated repair cycle.")
          }

          else {
            // Moves current room
            current_room = getRoomFromName(queried_room);
            appendToTerminal("You've moved to " + makeCap(queried_room) + ".")
            energy -= (3 + inventory.length)
            wipeKeypad();
            generalRefresh();
          }
          
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

// Prompted when in final rooms
async function return_to_base() {
  current_room = getRoomFromID("center");
  appendToTerminal("You have returned to the central room.")
  appendToTerminal("Automated maintenance cycle commencing...")
  timing = 1000 * (weight * rooms_json.return_time_per_weight + rooms_json.return_time_baseline)
  if (inventory.includes(rooms_json.speed_item)) {
    timing = 6000 // Speeds up to a minute
  }
  for (i=10;i>0;i--) { // Will have a marker every 1/10th of the time
    appendToTerminal(i*(timing/1000) + " seconds remaining...")
    await delay(timing); 
  }
  appendToTerminal("Maintenance cycle complete.")
  appendToTerminal("You have recovered:")
  var temp_items = inventory.slice(); // Clone by value not reference - avoids issues with slicing list while iterating through it
  for (var i of temp_items) {
    var item = getItemFromName(i);
    appendToTerminal(item.name); // TODO - Where it was picked up?
    if (!item.key) { // Dropping it
      if (item.weight > 0) {
        current_room.items.push(item.name); // Only solid non-key items end up in center inventory
      }
      inventory.splice(inventory.indexOf(item.name),1); // Remove item
      weight -= item.weight; // Remove weight (should only matter for solid items)
    }
  }
  generalRefresh();
}

// Handles login attempts
function login(input_array) {
    // Unlocks all doors on godmode password
    if (input_array[1] == "e4e5") { // Godmode password
      breakout();
      current_user = logins[0]; // A random one
      priv = 10;
      appendToTerminal("Godmode logged in.")
      generalRefresh();
    }

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
  editTextByID(box,"");
  
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
// TODO: Update this to take advantage of current_site (Should be done now)
async function checkKeypad() {
  if (keypad.toString() == current_site.combo.toString()) {
    editTextByID("site-login-title-text","Unlocked");
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
      current_site.locked = false; // TODO: This isn't great - mixing up site/current_site...unless it's by reference?
    }
  }
  else {
    document.getElementById("site-content-screen").style.display = "none";
    document.getElementById("site-login-screen").style.display = "block";
  }
}

// Makes the correct file-folder div highlighted, based off file_row and file_col - wipes them all then resets
function shiftFile() {
  var file_folders = document.querySelectorAll('.file-folder'); // All file-folders present!
  for (var div of file_folders) {
    div.className = 'file-folder'; // Wipes all to just file-folder
  }
  var selected_col = document.getElementById("file-column-" + file_col);
  var selected_div = selected_col.children[file_row];
  selected_div.className = 'file-folder selected-folder';
  

  // Hides columns too far to the right
  for (i=0;i<6;i++) {
    if (i > file_col + 1) { // More than one to the right of current column
      var right_col = document.getElementById("file-column-" + i);
       if (right_col) { // If the column exists...
        right_col.style.display = 'none'; // ...hide it
        hideSVG(i);
       }
    }
    else { // All other columns...
      document.getElementById("file-column-" + i).style.display = "grid"; // ...Get displayed
    }
  }

  makeRightFileDiv(selected_div);
}

// Handles the appearance and position of svg lines
function drawSVG(leftDiv, rightDiv) {

  var right_div_number = parseInt(rightDiv.id.split("-")[2]) // E.g. if right div is file-column-4, this will return int 4.

  var leftRect = leftDiv.getBoundingClientRect();
  var rightRect = rightDiv.getBoundingClientRect();
  console.log(leftRect);
  console.log(rightRect);

  var startX = leftRect.right;
  var startY = leftRect.top + leftRect.height / 2;

  var endX1 = rightRect.left;
  var endY1 = rightRect.top;

  var endX2 = rightRect.left;
  var endY2 = rightRect.bottom;

  // Create the lines
  var svg = document.getElementById("file-svg-" + (right_div_number - 1).toString());
  var svgRect = svg.getBoundingClientRect();
  svg.innerHTML = `
      <line x1="${0}" y1="${startY - svgRect.top}" x2="${svgRect.width}" y2="${0}" stroke="black" stroke-width="2" />
      <line x1="${0}" y1="${startY - svgRect.top}" x2="${svgRect.width}" y2="${svgRect.height}" stroke="black" stroke-width="2" />
  `;
  console.log(svg.innerHTML);
  svg.style.visibility = "visible"; // Make this svg appear!
}

// Takes in a file-column number and hides the svgs to the right of it. Will break if colnum < 1 but that...shouldn't happen.
function hideSVG(colnum) {
  var svg_prefix = "file-svg-" + (colnum-1);
  document.getElementById(svg_prefix).style.visibility = "hidden";
}

// Checks if there's a site computer in the room and updates the site screen accordingly
function refreshSite() {
  // Resets file highlight
  file_col = 0;
  file_row = 0;
  shiftFile();

  wipeKeypad();
  for (var site of sites) {
    if (site.room == current_room.id) {
      current_site = site;

      if (site.locked) { // Reset login screen
        toggleUnlockScreen(false)
        editTextByID("site-login-title-text","Please log in to the " + makeCap(getRoomFromID(site.room).name) + " site computer.");
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
    editTextByID("site-login-title-text","This room does not have a site computer.");
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
  editTextByID("content-name", output_string);
  editTextByID("content-desc", output_desc);
}

// Launches a decryption screen + timer
async function decrypt() {
  d_screen = document.getElementById("decrypt-screen");
  d_screen.style.display = "block";
  document.getElementById("interactive-screen").style.display = "none"; // Hides everything else
  editTextByID("decrypt-text",d_text_array.join(""));
  delay(50); // Brief pause to give screen time to update
  var decrypt_pause = (rooms_json.decryption_variables.approx_decrypt_time_in_seconds - 20) * 1000 / d_size; // In theory should get the correct length of pause per loop; accounted for 20 seconds of actual calcs.
  for (t=0;t<d_size;t++) {// d_size is currently 1800.
    for (c of d_array) { // Cycles over each character to begin with
      if (getRandomInt(20) < 1) { // 5% chance of any character changing each cycle
        d_text_array[c] = chars.charAt(getRandomInt(62))
      } 
      
    }
    var random_char = getRandomInt(d_array.length);
    d_text_array[d_array[random_char]] = final_text.charAt(d_array[random_char]); // Gets the corresponding remaining character index
    d_array.splice(random_char,1); // Should remove that character
    // TODO - Harmonise length of d_array and number of loops
    editTextByID("decrypt-text",d_text_array.join(""));
    await delay(decrypt_pause) // Taking a guess that the calculation will take 0.1s per loop? TODO - Check this 
  }

  // Once it's all done...
  document.getElementById("decrypt-timer-box").style.display = "flex"; // Shows finished box

  // Change decryption screen
  editTextByID("site-decrypt-title",rooms_json.decryption_variables.postdecryptTitle);
  editTextByID("site-decrypt-text",rooms_json.decryption_variables.postdecryptText);

  await delay(3000) // Some time to admire the handiwork
  decryptComplete = true; // Mark the decryption done!

  d_screen.style.display = "none"; // Hides the decryption screen
  document.getElementById("interactive-screen").style.display = "flex"; // Shows everything else again
}

// Checks actionStates for what to do - should just rely on currentSite
// TODO - Make it fully general for a range of 2-modalities
async function updateActions(typeName) {
  var states = ["pre","post"] // 0 is Off, 1 is On - translating int to str
  if (typeName == "dispenser") {
    for (i in actionStates) { // Deliberately going "in" not "of" for easy index referencing
      var state = actionStates[i]; // 0 or 1
      updateActionText(typeName,i,states[state]);
    }
  }
  else if (typeName == "airlock") {
    updateActionText(typeName,0,"post");
    await delay(3000);
    updateActionText(typeName,0,"pre");
    toggleDiv(document.getElementById("airlock-action-0-button"));
    
    // Dumps solid items!
    var temp_inv = inventory.slice(); // Clone by value
    for (var i of temp_inv) {
      item = getItemFromName(i);
      if (item.weight > 0 && !item.key) {
        inventory.splice(inventory.indexOf(item),1);
        weight -= item.weight;
      }
    }
    generalRefresh();
  }
  

  // Drops item if allowed and not already done
  if (actionStates[0] && !actionItemsDropped) {
    for (var item of actionItems) {
      getRoomFromID(item.room).items.push(item.name); // Drops items into room
    }
    actionItemsDropped = true;
  }
}

// Does the repetitive part of the above (pulling out the correct text and editing it) - e.g. "airlock, 0, 'pre'"
function updateActionText(typeName,actionNum,state) {
  var varTextName = state + "_text";
  var varTitleName = state + "_title";

  var textLoc = typeName + "-action-" + actionNum + "-status";
  var titleLoc = typeName + "-action-" + actionNum + "-title";

  editTextByID(textLoc,current_site.actions[actionNum][varTextName]);
  editTextByID(titleLoc,current_site.actions[actionNum][varTitleName]);
}

// Creates action buttons for site modality 2 based on what's in the JSON
function createActionSite() {
  // Nothing here yet!
}

// Fetching rooms has to be asynchronous as it involves fetching the JSON file. Can call non-async functions as needed.

// Load the rooms JSON
async function get_rooms() {
  const response = await fetch("./content.json");
  const data = await response.json();
  return data;
}

// Call the function to set up the rooms
// This is the first function called! Everything else flows from here
roomSetup();
