# Galaxia game assets

## atlas/   <- use this for the game
Phaser 3 texture atlas of all four characters + princess expression portraits.
- galaxia_atlas.png / galaxia_atlas.json  -> load with this.load.atlas('galaxia', png, json)
- galaxia_loader.js                       -> working example scene (walk + idle anims)
- GALAXIA_ATLAS.md                        -> integration guide for Claude Code (frame names, rules)
- frame_reference.png                     -> visual map of every named frame

Frame names: <char>_pose_00..07 (00-03 standing, 04-07 walk) for
guard/scholar/scout/princess, plus princess_<emotion> for the 8 portrait heads.
Use setOrigin(0.5, 1) and pixelArt: true.

## frames/
The same 40 sprites as standalone transparent PNGs, if you want them individually.

## sheet/
The original full character sheet, cleaned: background removed, halos opened,
holes filled, edges tidied. Source art for re-slicing if needed.

## ui_cuts/
Pieces pulled from the UI mockup. Transparent: the four havoc icons, three mood
emotes, calendar, mascot cat. With backdrops: scene_background, the two Miyu
portraits, action_thumbnail. (Overworld/menu art, not combat sprites.)
