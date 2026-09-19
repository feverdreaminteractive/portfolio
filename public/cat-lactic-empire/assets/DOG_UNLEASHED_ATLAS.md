# Unleashed-dog atlas

The off-chain dog sliced clean from `s1_fighting_transparent.png`: 9 move poses,
labels removed, dust and motion effects kept. This is the escalation form of the
chained dog (`dog_chained_atlas` / `DOG_CHAINED_ATLAS.md`).

## Files
`dog_unleashed_atlas.png` + `dog_unleashed_atlas.json` -> `assets/atlas/`.
```js
this.load.atlas('dog_unleashed', 'assets/atlas/dog_unleashed_atlas.png', 'assets/atlas/dog_unleashed_atlas.json');
```

## Registration (different from the chained dog)
This dog is free (no post, no chain), so it is feet-aligned like any character:
place with `setOrigin(0.5, 1)`. The chained dog used `setOrigin(1, 1)` because of
its post; do NOT reuse that here.

Frames face LEFT (toward the player on its left). When the dog is on the right
side of the arena that is correct as-is; `setFlipX(true)` only if you place it on
the left.

## Frame names (9, one pose each)
- `dog_unleashed_idle`        (aggressive ready stance)
- `dog_unleashed_charge`      (dash with motion blur)
- `dog_unleashed_leap`        (leap attack)
- `dog_unleashed_bite`        (bite attack)
- `dog_unleashed_scratch`     (scratch attack)
- `dog_unleashed_slam`        (slam / pounce)
- `dog_unleashed_hit`         (hit reaction)
- `dog_unleashed_take_damage` (heavy damage)
- `dog_unleashed_defeated`    (knocked out)

## The chain-break swap
This is the second half of the dog's two-mode design (see `FIGHTER_GUIDE.md`):
- Phase 1: `dog_chained` (anchored, limited reach).
- Trigger: HP threshold or story beat -> the chain breaks.
- Phase 2: swap the texture key to `dog_unleashed`. Now it has real mobility:
  `charge` to close distance, `leap`/`slam` as committal approaches, `bite` and
  `scratch` up close. Faster and more dangerous than the chained form.
Model the swap as switching which atlas/animation set the dog object uses; keep
the same HP and state machine, just change the moves and remove the chain/reach
limit.

## Notes
- Single pose per move; hold each for the move's duration (frame-data timing in
  `FIGHTER_GUIDE.md`). `charge`, `leap`, `bite`, `scratch`, `slam` are attacks
  with active-frame hitboxes; `idle`/`hit`/`take_damage`/`defeated` are states.
- `pixelArt: true`; share one ground line with the cat.
- The chained sheet (`s1` lower-left and the dedicated `s3`) also has `whimper`
  and `defeated` poses if you want to round out the chained set; say the word and
  I will fold those into `dog_chained_atlas`.
