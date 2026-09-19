# Living Room level — build spec (background-only + collision mask)

## Approach (revised — fixes the floating furniture)
Do NOT use a separate foreground layer. Use ONE visual, `living_room_bg.png` (the
full painted room), and lay an invisible collision mask over the furniture that is
already in that art. Miyu hops onto the couch, table, TV stand, shelves, and cat
tree that are painted into the background. Nothing is a second sprite, so nothing
can drift or float.

## Assets
- `living_room_bg.png` — the only visual (1528 x 447).
- `miyu_atlas` (player) — see `MIYU_ATLAS.md`.
- `living_room_collision.json` — the platform mask (coords in bg pixel space).
- Ignore `living_room_fg.png` for this level; it is not used here.

## Scale the bg and the mask TOGETHER (this is what prevents floating)
Choose one scale `S`, apply it to the bg image AND every platform coordinate:
```js
const S = GAME_W / 1528;                       // bg native width
this.add.image(0, 0, 'room_bg').setOrigin(0, 0).setScale(S);
// platform world rect = (p.x*S, p.y*S, p.w*S, thickness*S)
```
The platforms are defined in bg pixel space, so scaling them by the same `S` locks
them to the painted furniture at any canvas size.

## Build the collision mask (invisible static bodies)
For each platform in the JSON, make a thin invisible static body at its top surface:
```js
const ground = this.physics.add.staticGroup();
for (const p of COLLISION.platforms) {
  const bar = this.add.rectangle(p.x*S, p.y*S, p.w*S, 8*S, 0x000000, 0) // alpha 0 = invisible
                  .setOrigin(0, 0);
  this.physics.add.existing(bar, true);
  ground.add(bar);
}
this.physics.add.collider(miyu, ground);
```
Miyu lands on the TOP of each bar. `floor` is the full-width bar at `floor_y`.

## Player
`miyu` atlas (see `MIYU_ATLAS.md`): arrows to move, up/space to jump.
`setOrigin(0.5, 1)`, one `setScale`, `pixelArt: true`, `setFlipX` to face.
Walk/run the floor and furniture, jump+land between platforms, climb the cat tree
on the left. Play an ambient pose (sit/groom/stretch) after a few idle seconds.

## Goal: reach and play the TV
- `tv_zone` in the JSON is the screen. Route to it: floor -> couch or coffee_table
  -> `tv_stand` (the platform directly under the TV).
- When Miyu stands on `tv_stand` within the `tv_zone` x-range, show a prompt
  ("Press Up to play").
- On interact, launch the TV mini-game scene. Optional nice touch: tween the camera
  to zoom into the TV screen so the arcade game fills the view.
- Win the TV game -> level complete. Lose -> retry.

## The TV mini-game: "Catlactic Empire"
A short, winnable arcade shooter that matches the screen art:
- Small ship at the bottom, move left/right, shoot up.
- Waves of space enemies descend; clear N waves (or hit a target score / survive a
  timer) to WIN. Keep it ~60-90 seconds.
- On win, emit an event the room scene listens for to mark the level complete.
Scene flow: `LivingRoomScene` --interact--> `CatlacticTVScene` --win--> back to
`LivingRoomScene` (complete).

## Collision platforms (bg pixel space; also in living_room_collision.json)
| name | x | y (top) | w |
|------|---|---------|---|
| floor | 0 | 388 | 1528 |
| cat_tree_top | 15 | 48 | 107 |
| cat_tree_perch | 95 | 102 | 83 |
| cat_tree_condo | 25 | 233 | 163 |
| bookshelf_top | 192 | 42 | 120 |
| couch | 378 | 202 | 324 |
| coffee_table | 500 | 315 | 248 |
| tv_stand | 790 | 246 | 295 |
| wall_shelf | 848 | 50 | 167 |
| side_table | 1335 | 252 | 167 |
| tv_zone (goal) | 812 | 100 | 198 (h 112) |

## Notes
- Surfaces are read off the art; nudge any by a few px in-engine if her feet do not
  sit perfectly. `living_room_collision_preview.png` shows the mask drawn on the room.
- High platforms (cat_tree_top, bookshelf_top, wall_shelf) are optional exploration;
  the main route to the TV is floor -> couch/coffee_table -> tv_stand.
