# Princess Miyu — explore atlas

Miyu's overworld / platformer action set, sliced clean from the action sheet: 38
frames, labels removed, effects (magic, swipes, sparkles, dust) kept, feet-aligned.
This is the PLAYER for the living-room level (the explore-the-room character). It
is separate from the fighter cat atlases; load it under its own key.

## Files
`miyu_atlas.png` + `miyu_atlas.json` -> `assets/atlas/`.
```js
this.load.atlas('miyu', 'assets/atlas/miyu_atlas.png', 'assets/atlas/miyu_atlas.json');
const miyu = this.add.sprite(x, groundY, 'miyu', 'miyu_idle_00').setOrigin(0.5, 1);
```
Feet-aligned: `setOrigin(0.5, 1)`, one `setScale`, `pixelArt: true`. `setFlipX`
for left/right facing.

## Frame names (38)
Movement / actions (multi-frame):
- `miyu_idle_00..03`   (breathing; `_03` is the back-turned pose)
- `miyu_walk_00..03`   (loop)
- `miyu_run_00..02`    (loop)
- `miyu_jump_00..02`   (rise; one-shot)
- `miyu_land_00..02`   (landing; one-shot)
- `miyu_climb_00..02`  (loop while climbing; frames include surface scratch marks)
- `miyu_attack_00..02` (swipe; one-shot)
- `miyu_magic_00..02`  (cast; one-shot)
- `miyu_hurt_00..03`   (hit reaction)

Ambient / idle-variety (single frames; play occasionally when standing still to
give the room life):
- `miyu_sleep`, `miyu_stretch`, `miyu_groom`, `miyu_look_up`, `miyu_look_down`,
  `miyu_sit`, `miyu_sit_wag`, `miyu_curl`

## Animations
```js
this.anims.create({ key:'miyu_idle', frames:this.anims.generateFrameNames('miyu',
  { prefix:'miyu_idle_', start:0, end:2, zeroPad:2 }), frameRate:4, repeat:-1 });
this.anims.create({ key:'miyu_walk', frames:this.anims.generateFrameNames('miyu',
  { prefix:'miyu_walk_', start:0, end:3, zeroPad:2 }), frameRate:9, repeat:-1 });
this.anims.create({ key:'miyu_run', frames:this.anims.generateFrameNames('miyu',
  { prefix:'miyu_run_', start:0, end:2, zeroPad:2 }), frameRate:12, repeat:-1 });
this.anims.create({ key:'miyu_jump', frames:this.anims.generateFrameNames('miyu',
  { prefix:'miyu_jump_', start:0, end:2, zeroPad:2 }), frameRate:12 });
// land, climb, attack, magic, hurt follow the same pattern
```

Idle behavior tip: after a few seconds of no input, randomly play one of the
ambient poses (`sit`, `groom`, `stretch`, `sleep`...) then return to `miyu_idle`.
It makes the room feel alive while exploring.

## Notes
- Use for room navigation: `walk`/`run` on the ground and furniture, `jump`+`land`
  between platforms, `climb` on the cat tree or curtains.
- `attack`/`magic` are optional flavor here (not needed to explore), but available.
- This pairs with `living_room_bg.png` (vista) and `living_room_fg.png` (the
  furniture platforms). The level goal is to reach the TV and play the screen game.
