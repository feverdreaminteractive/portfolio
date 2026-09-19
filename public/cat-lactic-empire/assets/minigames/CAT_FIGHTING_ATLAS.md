# Cat fighting atlas

The cat's FIGHTING moveset sliced clean from `s1_fighting_transparent.png`: 25
frames across 12 moves, labels removed, energy slashes and dust kept, feet-aligned.

This is a separate, alternative moveset to the karate set (`cat_atlas` /
`CAT_ATLAS.md`). The karate set is one key pose per move; this fighting set has
multi-frame animations (walk cycles, multi-hit attacks). Pick one as the cat's
primary style, or load both and mix.

## Files
`cat_fighting_atlas.png` + `cat_fighting_atlas.json` -> `assets/atlas/`.
```js
// load under a DISTINCT key so it never collides with the karate atlas ('cat')
this.load.atlas('cat_fighting', 'assets/atlas/cat_fighting_atlas.png', 'assets/atlas/cat_fighting_atlas.json');
```

## Registration
Feet-aligned: place with `setOrigin(0.5, 1)`. `setFlipX` for facing is safe (no
text baked in). `pixelArt: true`.

## Frame names (25 frames, 12 moves)
- `cat_idle_00`                       (1)
- `cat_walk_00..02`                   (3, loop)
- `cat_dash_00..01`                   (2)
- `cat_jump_00..01`                   (2)
- `cat_paw_swipe_00..02`              (3, normal attack)
- `cat_double_slash_00..02`           (3, strong attack)
- `cat_uppercut_00..02`               (3, rising claw)
- `cat_low_sweep_00..01`              (2)
- `cat_roll_00..01`                   (2, evade)
- `cat_backflip_00..01`               (2, evade)
- `cat_hit_00`                        (1)
- `cat_victory_00`                    (1)

## Animations
```js
this.anims.create({ key:'catf_walk', frames:this.anims.generateFrameNames('cat_fighting',
  { prefix:'cat_walk_', start:0, end:2, zeroPad:2 }), frameRate:10, repeat:-1 });
this.anims.create({ key:'catf_paw_swipe', frames:this.anims.generateFrameNames('cat_fighting',
  { prefix:'cat_paw_swipe_', start:0, end:2, zeroPad:2 }), frameRate:18 });   // one-shot
this.anims.create({ key:'catf_double_slash', frames:this.anims.generateFrameNames('cat_fighting',
  { prefix:'cat_double_slash_', start:0, end:2, zeroPad:2 }), frameRate:16 });
// dash, jump, uppercut, low_sweep, roll, backflip follow the same pattern; idle/hit/victory are single frames
```

## Notes
- Use the frame-data timing in `FIGHTER_GUIDE.md` (startup/active/recovery) to
  drive hitbox windows; the slash art is visual only.
- The wide `cat_dash_00` frame is the rush with its motion blur; that is intended,
  not a slicing error.
- If you want one combined cat instead of two movesets, load both atlases and
  treat karate moves and fighting moves as one larger move list (names do not
  collide because the keys differ).
