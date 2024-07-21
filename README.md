# Coolies-Terminal
A website designed to look/interact like a Fallout-style terminal interface, with inspiration from Alien.

## Fixes needed
- Sound!!
- Make sure animations are consistent
- Multi-word items for inspect/take
- Sanitising input based on input_array length
- Neatening login barrier logic
- Limit unnecessary text refreshing
- Make a Consume() function and associated command?

## To know
- Room coords are column then row (x,y) 0-indexed, starting from the top left.
- External doors (exits) are treated differently in the JSON - listed by room coord, then direction of exit from that room (x,y with positive = down/right).

