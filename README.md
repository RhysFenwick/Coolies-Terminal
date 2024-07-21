# Coolies-Terminal
A website designed to look/interact like a Fallout-style terminal interface, with inspiration from Alien.

## Fixes needed
- Sound:
    - Add sound for dash cycle
    - Cut off help typing sound if not on help screen
    - Make cooler sounds in general
- Make sure animations are consistent
- Multi-word items for inspect/take
- Neatening login barrier logic
- Limit unnecessary text refreshing
- Make a Consume() function and associated command?
- Add out-of-energy alerts/actions

## To know
- Room coords are column then row (x,y) 0-indexed, starting from the top left.
- External doors (exits) are treated differently in the JSON - listed by room coord, then direction of exit from that room (x,y with positive = down/right).

