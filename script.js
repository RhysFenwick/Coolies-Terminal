// Arrays/JSONs to be filled later
var rooms_json; // The big one!
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
var weight = 1; // Movement cost when nothing in inventory

// Assorted vars
var paralysed = false; // Stops all other actions when true.
var standby = true; // Starts on standby - if this is true and enter is hit, splash screen moves to load
var dumping = false; // True while airlock site is active
var playingnow = 0; // Count of how many things are playing!

// Sites
var sites;
var current_site = null; // String equal to current site room
var modality; // 0 or null for no site, 1 for file search, 2 for action buttons, 3 for decryption
var eng_files;
var med_files;
var actionOptions = (document.getElementById("dispenser").getElementsByClassName("keypad-button")); // HTMLCollection of action buttons (all divs with class keypad-button in div action-grid)
var focusAction = 0; // Will cycle
var actionVariables; // All of the action-related text etc - from JSON
var actionItems; // Name/locations/trigger-locations of items that you get in site modality 2 - pulled from JSON
var combo; // Will be 16-digit 0/1 array pulled from JSON

// Sounds
const single_click = document.getElementById("single-click");
const double_click = document.getElementById("double-click");
const split_flap = document.getElementById("split-flap");


// Coordinates of highlighted file cell (from 0-5 and 0-9 respectively) plus real files
var file_col = 0;
var file_row = 0;
var real_files = []; // Array of JSONs to be filled later
var real_batch_nums = []; // Will be array of 6-digit strings in the same sequence as real_files
var primes = [2,3,5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 
  127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 
  269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 
  431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 
  599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 
  761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 
  947, 953, 967, 971, 977, 983, 991, 997, 1009, 1013, 1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1087, 1091, 1093, 
  1097, 1103, 1109, 1117, 1123, 1129, 1151, 1153, 1163, 1171, 1181, 1187, 1193, 1201, 1213, 1217, 1223, 1229, 1231, 1237, 1249, 1259, 
  1277, 1279, 1283, 1289, 1291, 1297, 1301, 1303, 1307, 1319, 1321, 1327, 1361, 1367, 1373, 1381, 1399, 1409, 1423, 1427, 1429, 1433, 
  1439, 1447, 1451, 1453, 1459, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1511, 1523, 1531, 1543, 1549, 1553, 1559, 1567, 1571, 1579, 
  1583, 1597, 1601, 1607, 1609, 1613, 1619, 1621, 1627, 1637, 1657, 1663, 1667, 1669, 1693, 1697, 1699, 1709, 1721, 1723, 1733, 1741, 
  1747, 1753, 1759, 1777, 1783, 1787, 1789, 1801, 1811, 1823, 1831, 1847, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1901, 1907, 1913, 
  1931, 1933, 1949, 1951, 1973, 1979, 1987, 1993, 1997, 1999, 2003, 2011, 2017, 2027, 2029, 2039, 2053, 2063, 2069, 2081, 2083, 2087, 
  2089, 2099, 2111, 2113, 2129, 2131, 2137, 2141, 2143, 2153, 2161, 2179, 2203, 2207, 2213, 2221, 2237, 2239, 2243, 2251, 2267, 2269, 
  2273, 2281, 2287, 2293, 2297, 2309, 2311, 2333, 2339, 2341, 2347, 2351, 2357, 2371, 2377, 2381, 2383, 2389, 2393, 2399, 2411, 2417, 
  2423, 2437, 2441, 2447, 2459, 2467, 2473, 2477, 2503, 2521, 2531, 2539, 2543, 2549, 2551, 2557, 2579, 2591, 2593, 2609, 2617, 2621, 
  2633, 2647, 2657, 2659, 2663, 2671, 2677, 2683, 2687, 2689, 2693, 2699, 2707, 2711, 2713, 2719, 2729, 2731, 2741, 2749, 2753, 2767, 
  2777, 2789, 2791, 2797, 2801, 2803, 2819, 2833, 2837, 2843, 2851, 2857, 2861, 2879, 2887, 2897, 2903, 2909, 2917, 2927, 2939, 2953, 
  2957, 2963, 2969, 2971, 2999, 3001, 3011, 3019, 3023, 3037, 3041, 3049, 3061, 3067, 3079, 3083, 3089, 3109, 3119, 3121, 3137, 3163, 
  3167, 3169, 3181, 3187, 3191, 3203, 3209, 3217, 3221, 3229, 3251, 3253, 3257, 3259, 3271, 3299, 3301, 3307, 3313, 3319, 3323, 3329, 
  3331, 3343, 3347, 3359, 3361, 3371, 3373, 3389, 3391, 3407, 3413, 3433, 3449, 3457, 3461, 3463, 3467, 3469, 3491, 3499, 3511, 3517, 
  3527, 3529, 3533, 3539, 3541, 3547, 3557, 3559, 3571] // First 400 primes - definitely don't need all of these, but better safe than sorry?

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
var scrollHeight = 10; // Number of pixels used for scrolling

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
  if (lowerString.length > 1) {
    var newStr = lowerString.charAt(0).toUpperCase() + lowerString.slice(1);
    return newStr;
  }
  else { // Only one char long
    return lowerString.toUpperCase();
  }
  
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
  refreshSite();
  checkEvents();
}

// A function to refresh the inventory - should be called by generalRefresh() most of the time - NO LONGER USED
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
    if (getItemFromName(i).hasOwnProperty("key")) {
      if (getItemFromName(i).key) {
        keyInv.push("**" + i + "**");
      }
      else {
        regInv.push(i);
      }
    }
      
    }

    // Now rejoin them!
    inventory_str = keyInv.join('\n') + '\n' + regInv.join('\n');
  }
  newBoxText("inventory",inventory_str);
}

// A function to refresh the energy - should be called by generalRefresh() most of the time
function refreshEnergy() {
  energy_str = energy + "%\n(Cost per movement: 10%)";
  if (energy < 31) {
    energy_str = "**LOW** " + energy + "% **LOW**" + "\n(Cost per movement: 10%)";
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
    var exit_room = getRoomFromID(exit.room);

    // If it's the center - to - outside airlock, skip the representation.
    if (exit_room.id == "center") {
      continue;
    }

    var room_x = exit_room.coords[0];
    var room_y = exit_room.coords[1];

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

    door_char = "@"

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
        for (var door of doors) {
            if (current_room.id == door.room1) {
              doors_str += getRoomFromID(door.room2).name.toUpperCase() + ", "
            }
            else if (current_room.id == door.room2) {
              doors_str += getRoomFromID(door.room1).name.toUpperCase() + ", "
            }
        }

        // Now for exits
        for (var exit of exits) {
          if (current_room.id == exit.room) {
            doors_str += "OUTSIDE, "
          }
        }

        // And outside
        if (current_room.id == "outside") {
          doors_str += getRoomFromID("east1").name.toUpperCase() + ", " + getRoomFromID("west1").name.toUpperCase() + ", " + getRoomFromID("north1").name.toUpperCase() + ", " + getRoomFromID("center").name.toUpperCase() + ", "
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
      
      // single_click.play(); // Plays every time a key is pressed

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
  // Audio
  playingnow += 1; // Something's typing!
  if (split_flap.paused) {
    // split_flap.play();
  }

  for (let i = 0; i < str.length; i++) {
    if (str[i] == ".") {
      await delay(200) // Wait longer for periods
      if (!(helpScreen && current_tab != 2))  {
        if (single_click.paused) {
          await single_click.load();
          single_click.play();
        }
      } 
    }
    else if (str[i] == "\n") {
      await delay(20);
      if (!(helpScreen && current_tab != 2))  {
        /*
        if (double_click.paused) {
          double_click.load();
          double_click.play();
        }
          */
      }
    }
  else {
      await delay(20); // Wait for 20ms per other character
      if (!(helpScreen && current_tab != 2))  {
        if (single_click.paused) {
          await single_click.load();
          single_click.play();
        }
      }  
    }
    div.append(str[i]);
    div.scrollIntoView();
  }

  // End audio if needed
  playingnow -= 1;
  if (!playingnow) {
    split_flap.pause();
    split_flap.currentTime = 0;
    split_flap.load();
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
      next_entry = next_digit + "-" + editString(start_digits,(i.toString() + "9".repeat(Math.max(5-oom,0))),oom) // Should be the right number of nines?
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
  if (standby) {
    turnOffStandby();
  }
  
  // Logic to swap screen on a key press
  if (event.key === "-") {
    event.preventDefault();
    if (double_click.paused) {
      double_click.load();
      double_click.play();
    }
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
            if (v == "dispenser") {
              updateActions(v);
            }
            else if (v == "airlock" && !dumping) {
              updateActionText("airlock",0,"pre");
            }
          }
          else {
            document.getElementById(v).style.display = "none";
          }
        }
      }
    }
  }

  else if (current_tab === 0) { // Main tab - used for scrolling the terminal
    var term_content = document.getElementById("terminal");
    if (event.key === "ArrowUp") { // Scroll up
      term_content.scrollTop -= scrollHeight;
    }
    else if (event.key === "ArrowDown") { // Scroll down
      term_content.scrollTop += scrollHeight;
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
          if (file_col == 5) { // In the final column - update file and make it appear!
           var batch_num = getFileDiv().textContent.split(".")[0].split(" ")[1];
           document.getElementById("file-title").textContent = "File Viewer (ESC to exit)";
           document.getElementById("batch-title").textContent = getFileDiv().textContent;
           document.getElementById("batch-text").textContent = medFile(batch_num);
           document.getElementById("file-grid").style.display = "none";
           document.getElementById("file-viewer").style.display = "flex";
          }
        break;

        case "Escape":
          document.getElementById("file-title").textContent = "File Search";
          document.getElementById("file-viewer").style.display = "none";
          document.getElementById("file-grid").style.display = "grid";
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
              current_site.actions[focusAction].switched = (current_site.actions[focusAction].switched + 1)%2; // Toggles it between 0 and 1
              updateActions("dispenser");
            break;
        }
      }

      else if (current_site.type == "airlock") {
        switch (event.key) {
          case " ": // Fall-through: triggers on both Space and Enter
          case "Enter":
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

// Needs to trigger to start the game normally
async function turnOffStandby() {
  console.log("Switching on!")
  standby = false; // Any key turns it off!
  // Get loading bar
  var loadbar = document.getElementById("loading-bar");        
          
  // Wait six seconds then make flash screen loaded
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
}

// Async function to handle loading appearance - called roomSetup for anachronistic reasons.
function roomSetup() {

  document.getElementById("json-uploader").style.display = "none"; // Remove the JSON uploader if you've gotten to this point.
  document.getElementById("splash").style.display = "block"; // Make splash screen appear first thing

  // Get loading bar
  var loadbar = document.getElementById("loading-bar");  
  loadbar.innerText = "Press any key to boot."

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

    for (var site of sites) {
      if (site.real_files) {
        for (var file_json of site.real_files) {
          real_files.push(file_json);
          real_batch_nums.push(file_json.batch_number);
        }
      }
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
    
    makeSave(); // Save every time something is input!
    
    if (paralysed) {
      appendToTerminal("You cannot take this action right now.")
    }
    else {
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
        
        case "load": // Loads save!
          loadSave(input_array[1]);
        break;
  
        default:
          appendToTerminal("I'm sorry, I don't recognise that command. Try again or visit the help menu for assistance.")
        break;
      }
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
    if (index > -1 && energy > 0) {
      current_room.items.splice(index, 1);
      inventory.push(item);
      appendToTerminal("You have taken the "+ item + ".");
      focus_item = getItemFromName(item);
      weight += focus_item.weight;
      // energy -= 2;
      refreshInfo();
      refreshInventory();
      refreshEnergy();
    }
    /*
    else if (energy < 2) {
      appendToTerminal("You have insufficient energy to take this item.");
    }
      */
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
// Checks if a door is accessible: used for move/unlock. Returns door (or exit) if one is found, null otherwise
function checkForDoor(query) {
  
  var valid_room = null;
  var queried_room = getRoomFromName(query);
  
  for (d in doors) {
    var door = doors[d];
    // Is there a better way to do this?
    if (queried_room && (queried_room.id == door.room1 && current_room.id == door.room2) || (queried_room && queried_room.id == door.room2 && current_room.id == door.room1)) {
      valid_room = door;
    }
  }
  for (var exit of exits) {
    if (queried_room && (queried_room.id == "outside" && current_room.id == exit.room) || (queried_room && queried_room.id == exit.room && current_room.id == "outside")) {
      valid_room = exit; // This is bad! But it works.
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
        if (door.hasOwnProperty("keys")) { // Wrong password + at least one key exists
          if (door.keys.includes(password) && inventory.includes(password)) { // Correct key and in inventory
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
        if (!door.hasOwnProperty("keys")) {
          appendToTerminal("The door to " + makeCap(queried_room) + " is locked. Enter 'unlock [room-name] [password] to unlock.");
        }
        else {
          appendToTerminal("The door to " + makeCap(queried_room) + " is locked. Enter 'unlock [room-name] [password] to unlock, or use an item.");
        }
      }
      else {
        // Checks energy
        if (energy > 14) {

          if (["north1","east1","west1"].includes(current_room.id) && queried_room == getRoomFromID("outside").name) { // If you're headed out through an airlock
            var airlock_time;
            if (inventory.includes(rooms_json.speed_item)) {
              airlock_time = 60;
            }
            else {
              airlock_time = weight * rooms_json.return_time_per_weight + rooms_json.return_time_baseline;
            }
            appendToTerminal("WARNING: Exiting airlock. Based on current additional mass of " + weight + ", return journey will take approximately " + (airlock_time).toString() + " seconds.\nType 'return' to exit airlock and begin return journey.")
          }

          else {
            // Moves current room
            current_room = getRoomFromName(queried_room);
            appendToTerminal("You've moved to " + makeCap(queried_room) + ".")
            energy -= (10)
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
  paralysed = true; // Can't do anything until this is switched off!
  current_room = getRoomFromID("outside");
  appendToTerminal("Exiting airlock.")
  appendToTerminal("Return journey commencing...")
  console.log(weight + " " + rooms_json.return_time_per_weight + " " + rooms_json.return_time_baseline)
  timing = Math.max(100 * (weight * rooms_json.return_time_per_weight + rooms_json.return_time_baseline),6000) // 1/10th of total time
  if (inventory.includes(rooms_json.speed_item)) {
    timing = 6000 // Speeds up to a minute
  }
  for (var i=10;i>0;i--) { // Will have a marker every 1/10th of the time
    appendToTerminal(i*(timing/1000) + " seconds remaining...")
    await delay(timing); 
  }
  appendToTerminal("Return journey complete.")
  current_room = getRoomFromID("center");
  energy = 100;
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
  paralysed = false;
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
  if (keypad.toString() == current_site.combo.toString()) { // Unlocked!
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
    shiftFile(); // To make first SVG appear if needed
    if (current_site.locked) {
      current_site.locked = false; // TODO: This isn't great - mixing up site/current_site...unless it's by reference?
    }
  }
  else {
    document.getElementById("site-content-screen").style.display = "none";
    document.getElementById("site-login-screen").style.display = "block";
  }
}

//////////////////////
// Folder functions //
//////////////////////

// Gets current selected file div from file_col and file_row
function getFileDiv() {
  var selected_col = document.getElementById("file-column-" + file_col);

  var selected_div = selected_col.children[file_row];
  
  return selected_div;
}

// Makes the correct file-folder div highlighted, based off file_row and file_col - wipes them all then resets
function shiftFile() {
  var file_folders = document.querySelectorAll('.file-folder'); // All file-folders present!
  for (var div of file_folders) {
    div.className = 'file-folder'; // Wipes all to just file-folder
  }
  
  var selected_div = getFileDiv();
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

// Either retrieves medical string from a real file, or creates a fake one, given the batch number - then returns as string
function medFile(batch_number) {
  var medstring;
  if (real_batch_nums.includes(batch_number)) { // Real file!
    medstring = real_files[real_batch_nums.indexOf(batch_number)].file_contents;
  }
  else { // Fake file!
    var seed = pseudoBatchHash(batch_number);
    medstring = generateMedString(seed);
  }
  return medstring;
}

// Takes in the batch_number as a string and returns a deterministic pseudo-random int
function pseudoBatchHash(batch_number) {
  let batch_int = parseInt(batch_number,10);
  return (batch_int * 314159 + 271818) % 1000000 + 10000; // Adding 10,000 to eliminate potential issues with a low seed
}

// Takes a seed, a low int and a high int (both inclusive) and returns an int in the range deterministically
function pseudoRandomIntBetween(seed,low,high) {
  var range = high - low; // The range from lowest to highest: all numbers will be from low+0 to low+range
  var salt = (seed * primes[high]) % range; // A number from 0 to range - multiplying by a prime to mix things up between uses
  return (low + salt)
}

// Takes a seed and an array (ideally array of strings) and returns a deterministic pseudo-random array item
function randItem(seed,array) {
  return array[pseudoRandomIntBetween(seed + array[1].length,0,array.length)]; // Mixing up the seed with size of second option (as first is often blank)
}

// Takes in a big integer and returns a medical string
function generateMedString(seed) {

  var temperature = pseudoRandomIntBetween(seed,30,42).toString() + "." + pseudoRandomIntBetween(seed,0,9).toString();
  var growth = pseudoRandomIntBetween(seed,10,180);
  var levels = randItem(seed,["High","Medium","Low","Undetected"]);
  var electropotential = pseudoRandomIntBetween(seed,-50,50).toString() + "." + pseudoRandomIntBetween(seed,10,99).toString();
  var ph = pseudoRandomIntBetween(seed,-7,7).toString() + "." + (pseudoRandomIntBetween(seed,1,10)-1).toString();
  var sample_colour = randItem(seed,["Luminescent","Pale","Light","Dark","Rich","Drab","Intense","Deep"]) + " " + randItem(seed,["amber","aqua","azure","beige","grey","fuschia","lavender","mauve","silver","gold"]) + " with " + randItem(seed,["speckles","streaks","undertones","clear patches","hazy patches"]) + " of " + randItem(seed,["rust","brown","white","black","eggshell","cerise","saffron"]) + ".";
  var promise = randItem(seed,["promising","unpromising","inconclusive","highly promising"])
  var development = randItem(seed,[" Subject developed complications upon further testing."," Subject developed unremarkably."]);
  var dose = pseudoRandomIntBetween(seed,1,20).toString();
  var routes = randItem(seed,["intravenous","intrathecal","subdermal","subcutaneous","intraosseal","gaseous"])
  var hormones = randItem(seed,["digoxin","fexinidazole","alpha-dupixent","soravtansine","resmetirom","mRNA-1273","exenatide","methyl-2-risdiplam","lumateperone","G6-phosphatase",]);
  var further_testing = randItem(seed,[""," Further testing is recommended."]);

  var medstring = `Temperature (C): ${temperature}
  Growth Rate (/day): ${growth}
  Enzyme p755 availability: ${levels}
  Electropotential (mV/cm^2): ${electropotential}
  pH: ${ph}
  Sample colour: ${sample_colour}\n
  Notes: Initial test was ${promise}.${development} Subject was given ${dose}00 mg of ${routes} ${hormones}.${further_testing}
  `;

  return medstring;
}


// Handles the appearance and position of svg lines
function drawSVG(leftDiv, rightDiv) {

  var right_div_number = parseInt(rightDiv.id.split("-")[2]) // E.g. if right div is file-column-4, this will return int 4.
  var leftParentDivNum = right_div_number - 1;
  var leftParentDiv = document.getElementById("file-column-" + leftParentDivNum.toString()); // The parent div of the file-folder

  var leftRect = leftDiv.getBoundingClientRect();
  var rightParentRect = leftParentDiv.getBoundingClientRect();

  var svg = document.getElementById("file-svg-" + (right_div_number - 1));
  var svgRect = svg.getBoundingClientRect();

  var startX = rightParentRect.right - svgRect.left;
  var startY = leftRect.top + leftRect.height / 2;

  // Create the lines
  svg.innerHTML = `
      <line x1="${startX}" y1="${startY - svgRect.top - 5}" x2="${svgRect.width}" y2="${0}" stroke="#008000" stroke-width="1" />
      <line x1="${startX}" y1="${startY - svgRect.top + 5}" x2="${svgRect.width}" y2="${svgRect.height}" stroke="008000" stroke-width="1" />
  `;
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

// A function to display "search" results as needed - currently not used.
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
  for (var item of rooms_json.decrypt_items) { // Drop decrypt_items as needed
    getRoomFromID(item.room).items.push(item.item);
    console.log(getRoomFromID(item.room).items);
  }

  d_screen.style.display = "none"; // Hides the decryption screen
  document.getElementById("interactive-screen").style.display = "flex"; // Shows everything else again
}

// Checks actionStates for what to do - should just rely on currentSite
// TODO - Make it fully general for a range of 2-modalities
async function updateActions(typeName) {
  var states = ["pre","post"] // 0 is Off, 1 is On - translating int to str
  if (typeName == "dispenser") {
    for (i in current_site.actions) { // Deliberately going "in" not "of" for easy index referencing
      updateActionText(typeName,i,states[current_site.actions[i].switched]); // Updated action text with pre- or post- depending on switched state
    }

    // Drops item if allowed and not already done
    if (current_site.actions[0].switched) { // If the first action is switched to yes - TODO - Change this to account for changes between rooms
      for (var item of actionItems) {
        if (item.trigger_room === current_room.id) {
          getRoomFromID(item.room).items.push(item.name); // Drops items into room
          item.trigger_room = null // Wipes out trigger room to prevent it being dropped repeatedly.
        }
      }
    }
  }

  else if (typeName == "airlock") {
    if (!dumping) {
      dumping = true; // Prevents the action from being messed with
      toggleDiv(document.getElementById("airlock-action-0-button")); // Toggles visual of the button on/off
      updateActionText(typeName,0,"post");
      
      // Dumps solid items!
      var temp_inv = inventory.slice(); // Clone by value
      console.log(inventory)
      var items_to_remove = [];
      for (var i of temp_inv) {
        var item = getItemFromName(i);
        if (item.weight > 0 && !item.key) {
          items_to_remove.push(inventory.indexOf(item.name));
          editTextByID("airlock-action-0-status",(makeCap(item.name) + " has been ejected."));
          await delay(1000);
          weight -= item.weight;
        }
      }
      console.log(items_to_remove)
      for (var index of items_to_remove.reverse()) { // Reverse to maintain correct indexes
        inventory.splice(index, 1);
      }
      toggleDiv(document.getElementById("airlock-action-0-button"));
      dumping = false;
      generalRefresh();
    }
    updateActionText(typeName,0,"pre");
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

// Function that creates and posts a save string to console
function makeSave() {
  var door_locks = [];
  for (var door of doors) {
    if (door.locked) {
      door_locks.push("0");
    }
    else {
      door_locks.push("1");
    }
  }
  
  for (var exit of exits) {
    if (exit.locked) {
      door_locks.push("0");
    }
    else {
      door_locks.push("1");
    }
  }
  
  var room_items = [];
  
  for (var room of rooms) {
    var one_room_items = [];
    for (var item of room.items) {
      one_room_items.push(item);
    }
    if (one_room_items.length == 0) {
      one_room_items = ["None"];
    }
    room_items.push(one_room_items.join(","));
  }
  
  var site_switches = "";
  for (var site of sites) {
    if (site.modality == 2) {
      if (site.type == "dispenser") {
        site_switches = site_switches + site.actions[0].switched.toString();
      }
    }
  }
  
  var saveElements = [current_room.id, inventory.join(","),room_items.join("##"),door_locks.join(","),site_switches,decryptComplete.toString()] // Elements as strings
  var savestr = saveElements.join("!!");
  console.log(savestr);
}

// Trickier one - when called, loads save from savestring
function loadSave(savestring) {
  var saveArray = savestring.split("!!");
  /*
  In order:
  current_room.id, inventory.join(","),room_items.join("##"),door_locks.join(","),site_switches,decryptComplete.toString()
  */
  current_room = getRoomFromID(saveArray[0]);
  
  inventory = saveArray[1].split(",");
  
  // Room inventory
  var room_item_lists = saveArray[2].split("##");
  for (var room of rooms) {
    room.items = room_item_lists.shift().split(",");
    var remove_nones = room.items.splice(); // Clone by value
    for (var item of remove_nones) {
      if (item == "None") {
        room.items.splice(room.items.indexOf("None"),1);
      }
    }
  }
  
  // Door and exit lock
  var door_locks = saveArray[3].split(",");
  for (var door of doors) {
    door.locked = door_locks.shift(); // Both removes and returns first element
  }
  for (var exit of exits) {
    exit.locked = door_locks.shift();
  }
  
  // Site switches
  var sitecounter = 0;
  for (var site of sites) {
    if (site.modality == 2) {
      if (site.type == "dispenser") {
        site.actions[0].switched = parseInt(saveArray[4][sitecounter]);
        sitecounter += 1;
      }
    }
  }
  
  // Decryption 
  var saved_decrypt = saveArray[5];
  if (saved_decrypt === "true") {
    decryptComplete = true;
  }
  else {
    decryptComplete = false;
  }
  generalRefresh();
  console.log("Save loaded!")
}



// Fetching rooms has to be asynchronous as it involves fetching the JSON file. Can call non-async functions as needed.
// Load the rooms JSON
async function load_json() {
  console.log("Loading JSON from file.");
  const response = await fetch("./content.json");
  rooms_json = await response.json();
}

// Wrapping this in an async function for awaiting purposes
async function pageLoad() {
  const debug_mode = await fetch('debug.txt')
  if (debug_mode.ok) {
    // Debug exists
    const debug_text = await debug_mode.text();
    if (debug_text.includes("DEBUG=TRUE")) {
      document.getElementById('submitBtn').addEventListener('click', function() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
      
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
      
            reader.onload = function(event) {
                try {
                    rooms_json = JSON.parse(event.target.result);
                    // Call the function to set up the rooms
                    // This is the first function called! Everything else flows from here
                    roomSetup(); // Kicks off the game either way
                } catch (e) {
                    alert('Invalid JSON file. Please upload a valid content.json file.');
                }
            };
      
            reader.readAsText(file);
        } else {
            alert('Please upload your content.json file.');
        }
      });
    }
    else {
      // Debug.txt doesn't contain true
      await load_json();
      roomSetup(); // Kicks off the game either way
    }
  } 
  else {
    // File does not exist or there was a network error
    console.log("Error, file not found. Executing normal branch...");
    await load_json();
    roomSetup(); // Kicks off the game either way
  }
}


// And call it!
pageLoad();
