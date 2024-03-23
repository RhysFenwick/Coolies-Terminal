// Takes a string and a Boolean of whether to make it slow or all at once
function appendToTerminal(text, slowText=true) {
    const line = document.createElement("p");
    
    const terminal = document.getElementById("terminal");

    terminal.appendChild(line);

    if (slowText) {
        typeWriterEffect(text,line)
    }
    else {
        line.textContent += text
    }
    
}

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
    inputLine.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const input = this.value;
            
            // Remove the input line from the DOM before appending the text
            this.remove();
            
            // Append the input text to the terminal
            appendToTerminal("> " + input, false);

            if (input.toLowerCase() == "password") {
                appendToTerminal("Correct password!")
            }
            else {
                appendToTerminal("Incorrect password.\r\nHint: it's incredibly secure, you'll never guess it.")
            }
            
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


// What runs at the start

document.addEventListener("click", function() {
    // Return focus to the input line when the document is clicked
    const inputLine = document.getElementById("inputLine");
    if (inputLine) {
        inputLine.focus();
    }
});

appendToTerminal("Welcome to the CooliesBot Terminal.\r\nDeveloping murder mystery...\r\nAssigning murderer...\r\nPlease enter password to continue.")
// Initialize the terminal with the input line ready for user input
createInputLine();
