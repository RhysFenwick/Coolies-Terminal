# Coolies-Terminal
A website designed to look/interact like a Fallout-style terminal interface, with inspiration from Alien.

## Fixes needed
- Sound:
    - Add sound for dash cycle
    - Cut off help typing sound if not on help screen?
    - Make cooler sounds in general
- Multi-word items for inspect/take
- Neatening login barrier logic
- Limit unnecessary text refreshing
- Make a Consume() function and associated command?

## To know
- Room coords are column then row (x,y) 0-indexed, starting from the top left.
- External doors (exits) are treated differently in the JSON - listed by room coord, then direction of exit from that room (x,y with positive = down/right).

## New changes
- Schmerminal tab + functionality in rooms (PIN login screen + "search" for files)
- Interact function
- Unlock doors with items (destructible)
- Lock functionality (autolock afterwards)
- Recharge room gating + timing
- Minigaaaaaame (with timer)
- Add generic commands like "drop all" and "inspect room"
- Scroll bar remaining visible
- Door discharge
- Object/room combo
