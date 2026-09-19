// ─────────────────────────────────────────────────────────────
// Galaxia atlas — Phaser 3 loader + usage
//
// Frame naming:
//   <char>_pose_00..03   standing / directional poses (front, side, back, side)
//   <char>_pose_04..07   walk cycle
//   chars: guard, scholar, scout, princess
//   princess_<emotion>   portrait heads: neutral, bored, curious, happy,
//                        surprised, excited, angry, sad
//
// Registration: every frame is trimmed but feet-aligned per character,
// so setOrigin(0.5, 1) plants the feet and animations don't jitter.
// ─────────────────────────────────────────────────────────────

class GalaxiaScene extends Phaser.Scene {
  preload() {
    this.load.atlas('galaxia', 'assets/galaxia_atlas.png', 'assets/galaxia_atlas.json');
  }

  create() {
    const chars = ['guard', 'scholar', 'scout', 'princess'];

    chars.forEach((c) => {
      // walk cycle from frames 04–07
      this.anims.create({
        key: `${c}_walk`,
        frames: [4, 5, 6, 7].map((i) => ({ key: 'galaxia', frame: `${c}_pose_0${i}` })),
        frameRate: 8,
        repeat: -1,
      });
      // idle = front standing pose
      this.anims.create({
        key: `${c}_idle`,
        frames: [{ key: 'galaxia', frame: `${c}_pose_00` }],
        frameRate: 1,
      });
    });

    // place a character — origin (0.5, 1) = feet on the ground
    const hero = this.add.sprite(200, 400, 'galaxia', 'guard_pose_00').setOrigin(0.5, 1);
    hero.play('guard_walk');

    // portrait head (for menus / character select / VS screen)
    this.add.image(560, 140, 'galaxia', 'princess_happy').setOrigin(0.5, 0.5);
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 480,
  pixelArt: true,            // nearest-neighbor: keeps the pixel art crisp
  backgroundColor: '#2a1a3a',
  scene: GalaxiaScene,
});
