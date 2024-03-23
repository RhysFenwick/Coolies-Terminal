document.getElementById("inputLine").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        // Get the input value
        var input = this.value;
        
        // Create a new line element
        var line = document.createElement("p");
        line.textContent = "> " + input;
        
        // Append the new line to the terminal
        document.getElementById("terminal").appendChild(line);
        
        // Scroll to the bottom of the terminal
        document.getElementById("terminal").scrollTop = document.getElementById("terminal").scrollHeight;
        
        // Clear the input
        this.value = "";
    }
});
