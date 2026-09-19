# Galaxia sprite atlas — Phaser integration guide

Instructions for wiring the character atlas into the game. Follow the frame
names and rules exactly; this is a packed atlas, not a uniform grid.

## What this is
A Phaser 3 texture atlas of four characters (guard, scholar, scout, princess)
plus eight princess expression portraits. 40 frames total. JSON-Hash format
(one PNG + one JSON).

## Files
Place both in the project's asset folder (confirm the actual path in this repo,
e.g. `public/assets/` or `assets/`):
- `galaxia_atlas.png`
- `galaxia_atlas.json`

`galaxia_frames.zip` holds the same frames as individual PNGs. Not needed if you
load the atlas; ignore unless asked.

## Load
```js
this.load.atlas('galaxia', 'assets/galaxia_atlas.png', 'assets/galaxia_atlas.json');
```

## Frame names (exact)
Body poses exist for each character: `guard`, `scholar`, `scout`, `princess`.
- `<char>_pose_00`  front idle
- `<char>_pose_01`  side idle
- `<char>_pose_02`  back
- `<char>_pose_03`  side idle (opposite / three-quarter)
- `<char>_pose_04` .. `<char>_pose_07`  walk cycle (4 frames)

Princess expression heads (for menus, character select, dialogue portraits):
`princess_neutral`, `princess_bored`, `princess_curious`, `princess_happy`,
`princess_surprised`, `princess_excited`, `princess_angry`, `princess_sad`

## Registration (important)
Frames are trimmed but feet-aligned per character via the atlas `sourceSize` and
`spriteSourceSize`. Set the origin to bottom-center so feet land on the y you
place them at, and so walk cycles do not jitter:
```js
sprite.setOrigin(0.5, 1);
```
Use `(0.5, 1)` for grounded characters. Use `(0.5, 0.5)` only for the portrait heads.

## Pixel-art config (required)
Set `pixelArt: true` in the Phaser game config (nearest-neighbor sampling).
Without it the upscaled sprites blur. Do not enable texture antialiasing.
```js
new Phaser.Game({ type: Phaser.AUTO, width: 800, height: 480, pixelArt: true, scene: [...] });
```

## Animations
Define once in a boot/create step, then play by key.
```js
['guard','scholar','scout','princess'].forEach((c) => {
  this.anims.create({
    key: `${c}_walk`,
    frames: [4,5,6,7].map(i => ({ key:'galaxia', frame:`${c}_pose_0${i}` })),
    frameRate: 8, repeat: -1,
  });
  this.anims.create({
    key: `${c}_idle`,
    frames: [{ key:'galaxia', frame:`${c}_pose_00` }],
    frameRate: 1,
  });
});
// usage
const hero = this.add.sprite(x, y, 'galaxia', 'guard_pose_00').setOrigin(0.5, 1);
hero.play('guard_walk');
// directional idle: set the frame directly
hero.setFrame('guard_pose_02'); // facing away
```

## Canonical example
A working scene is in `galaxia_loader.js`. Match its conventions: atlas key
`galaxia`, origin `(0.5, 1)`, `pixelArt: true`, anim keys `<char>_walk` / `<char>_idle`.

## Do not
- Do not treat this as a fixed-size spritesheet or compute frame rects by index;
  address frames by their string name only.
- Do not re-trim, re-pack, or resize `galaxia_atlas.png`; the JSON already encodes
  each frame's trim offset and source size.
- Do not use `setOrigin(0.5, 0.5)` for walking characters; it breaks ground contact.
- These are three-quarter-view overworld sprites, not side-view fighter combat
  frames. Use them for the overworld, hub, and menus. Do not wire them as
  fight-scene attack animations; combat sprites are a separate, future asset.
