// Start off by declaring logins (array of arrays), rooms (array of JSONs), and current_room (JSON) to be filled later
var logins;
var rooms;
var current_room;

// Start of privilege level 0, escalate through logins
var current_user;
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
        doors = current_room.doors
        doors_str = ""
        for (i in doors) {
            doors_str += doors[i][0].toUpperCase() + ", "
        }
        doors_str = doors_str.substring(0, doors_str.length - 2);
        text = "CURRENT USER: " + current_user + "\r\nCURRENT ROOM: "+ current_room.name.toUpperCase() + "\r\nDOORS: " + doors_str
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
    logins = rooms_json.logins // An array of the username/password/acct name arrays.
    rooms = rooms_json.rooms // An array of the room JSONs.
    current_room = rooms[0]; // Start off in the entry

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

    if (action == "login") {
        // Pass to login function
        login(input_array);
    }

    else if (action == "enter") {
        // Trying to enter a room - pass to move_rooms
        move_rooms(input_array);
    }

    else if (action == "help") {
        appendToTerminal("Type 'login [name] [password]' to login, 'enter [room-name]' to enter a room, or 'help' for more information.")
    }

    else {
        appendToTerminal("I'm sorry, I don't recognise that command. Type 'help' for assistance.")
    }
}

// Handles moving attempts
function move_rooms(input_array) {
    valid_room = false;
    queried_room = input_array[1];
    var new_room;
    for (i in current_room.doors) {
        if (queried_room == current_room.doors[i][0]) {
            valid_room = true;
            new_room = queried_room;
            // TODO: I can add a break here of some kind
        }
    }
    
    if (valid_room) {
        // Moves current room
        // There's DEFINITELY gotta be a better way to do this.
        for (r in rooms) {
            if (rooms[r].name == new_room) {
                current_room = rooms[r]
            }
        }
        appendToTerminal("You've moved to " + queried_room)
        refreshInfo()
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

    for (let i = 0; i < logins.length; i++ ) {
        if (logins[i][0] == username && logins[i][1] == password) {
            good_login = true;
            
            current_user = logins[i][2];

            // Should priv only move up, or is up/down fine?
            priv = logins[i][3];
        
            appendToTerminal("Login successful! Welcome, " + current_user + ".");
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




