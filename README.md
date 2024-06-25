# Coolies-Terminal
A website designed to look/interact like a Fallout-style terminal interface, with inspiration from Alien.

## Fixes needed
- Multi-word items for inspect/take
- Sanitising input based on input_array length
- Neatening login barrier logic
- Simplify help script
- Limit unnecessary text refreshing
- Make function to both alter energy and call refreshEnergy()

## To know
- Room coords are column then row (x,y) 0-indexed, starting from the top left.
- External doors (exits) are treated differently in the JSON - listed by room coord, then direction of exit from that room (x,y with positive = down/right).

