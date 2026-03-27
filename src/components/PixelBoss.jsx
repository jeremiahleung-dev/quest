// Pixel art bosses defined as [color, x, y, w, h] rects in a 14×16 grid

const SPRITES = {
  goblin: {
    size: [14, 16],
    rects: [
      ['#3a6614', 1,2,2,4], ['#3a6614', 11,2,2,4],         // ears
      ['#4d8a1c', 3,1,8,8],                                  // head
      ['#3a6614', 3,1,1,8], ['#3a6614', 10,1,1,8],          // head sides
      ['#ff2222', 4,3,2,2], ['#ff2222', 8,3,2,2],           // eyes
      ['#110000', 5,3,1,2], ['#110000', 9,3,1,2],           // pupils
      ['#2d5010', 6,5,2,1],                                  // nose
      ['#1a2e08', 4,7,6,1],                                  // mouth
      ['#ffffff', 4,7,1,1], ['#ffffff', 7,7,1,1], ['#ffffff', 9,7,1,1], // teeth
      ['#4d8a1c', 6,9,2,1],                                  // neck
      ['#3d7018', 4,10,6,5],                                 // body
      ['#4d8a1c', 2,10,2,3], ['#4d8a1c', 10,10,2,3],        // arms
      ['#2d5010', 2,13,1,1], ['#2d5010', 3,13,1,1],         // claws left
      ['#2d5010', 10,13,1,1], ['#2d5010', 11,13,1,1],       // claws right
      ['#3d7018', 5,15,2,1], ['#3d7018', 7,15,2,1],         // legs
    ],
  },

  skeleton: {
    size: [14, 16],
    rects: [
      ['#d8d0b8', 3,0,8,8],                                  // skull
      ['#b8b0a0', 3,0,1,8], ['#b8b0a0', 10,0,1,8],          // shading
      ['#1a1a1a', 4,2,2,3], ['#1a1a1a', 8,2,2,3],           // eye sockets
      ['#4466ff', 4,3,1,1], ['#4466ff', 8,3,1,1],           // eye glow
      ['#2a2a2a', 6,4,2,2],                                  // nose cavity
      ['#d8d0b8', 4,7,1,2], ['#d8d0b8', 6,7,1,2],           // teeth top
      ['#d8d0b8', 8,7,1,2], ['#d8d0b8', 10,7,1,2],
      ['#1a1a1a', 5,7,1,2], ['#1a1a1a', 7,7,1,2], ['#1a1a1a', 9,7,1,2], // gaps
      ['#c8c0a8', 6,9,2,1],                                  // neck
      ['#c8c0a8', 6,10,2,4], ['#c8c0a8', 5,10,4,1],         // spine
      ['#c8c0a8', 4,11,2,1], ['#c8c0a8', 8,11,2,1],         // ribs
      ['#c8c0a8', 4,12,2,1], ['#c8c0a8', 8,12,2,1],
      ['#c8c0a8', 4,13,2,1], ['#c8c0a8', 8,13,2,1],
      ['#c8c0a8', 5,14,2,2], ['#c8c0a8', 7,14,2,2],         // legs
    ],
  },

  dragon: {
    size: [14, 16],
    rects: [
      ['#8b0000', 3,0,1,3], ['#8b0000', 10,0,1,3],          // horns outer
      ['#cc2200', 4,0,1,2], ['#cc2200', 9,0,1,2],           // horns inner
      ['#cc2200', 3,3,8,7],                                  // head
      ['#cc2200', 4,7,6,3],                                  // snout
      ['#aa1a00', 3,3,1,7], ['#aa1a00', 10,3,1,7],          // sides
      ['#ffdd00', 4,4,2,2], ['#ffdd00', 8,4,2,2],           // eyes
      ['#1a0000', 5,4,1,2], ['#1a0000', 9,4,1,2],           // slit pupils
      ['#771100', 5,8,1,1], ['#771100', 8,8,1,1],           // nostrils
      ['#ffffff', 4,9,1,2], ['#ffffff', 6,9,1,2],           // teeth
      ['#ffffff', 8,9,1,2], ['#ffffff', 10,9,1,2],
      ['#aa1a00', 5,11,4,2],                                 // neck
      ['#ff4400', 5,13,4,3], ['#cc2200', 4,13,1,3], ['#cc2200', 9,13,1,3], // chest
    ],
  },

  demon: {
    size: [14, 16],
    rects: [
      ['#1a0830', 1,6,2,10], ['#1a0830', 11,6,2,10],        // cape wings
      ['#2d0d4a', 2,4,10,12],                                // body
      ['#4a1470', 3,1,8,7],                                  // head
      ['#2d0d4a', 3,1,1,7], ['#2d0d4a', 10,1,1,7],          // head sides
      ['#330a55', 3,0,2,3], ['#330a55', 9,0,2,3],           // horns
      ['#ffffff', 4,3,2,2], ['#ffffff', 8,3,2,2],           // eyes white
      ['#00ffcc', 4,3,1,1], ['#00ffcc', 8,3,1,1],           // eye glow
      ['#1a0830', 4,6,6,1],                                  // mouth
      ['#cc44ff', 5,6,1,1], ['#cc44ff', 7,6,1,1], ['#cc44ff', 9,6,1,1], // teeth glow
      ['#6622aa', 5,9,4,4],                                  // inner glow
    ],
  },

  golem: {
    size: [14, 16],
    rects: [
      ['#4488cc', 2,4,10,12],                                // body
      ['#66aaee', 3,1,8,7],                                  // head
      ['#88ccff', 2,0,2,3], ['#88ccff', 10,0,2,3], ['#88ccff', 6,0,2,2], // ice shards
      ['#ddeeff', 4,3,2,2], ['#ddeeff', 8,3,2,2],           // eyes
      ['#aaccee', 5,3,1,1], ['#aaccee', 9,3,1,1],           // pupils
      ['#2255aa', 4,6,6,1],                                  // mouth crack
      ['#3366aa', 2,4,1,12], ['#3366aa', 11,4,1,12],        // body shading
      ['#88ccff', 4,7,6,4],                                  // chest plate
      ['#4488cc', 0,5,2,7], ['#4488cc', 12,5,2,7],          // arms
      ['#aaddff', 0,5,2,2], ['#aaddff', 12,5,2,2],          // ice knuckles
      ['#3366aa', 4,14,3,2], ['#3366aa', 7,14,3,2],         // legs
    ],
  },

  elemental: {
    size: [14, 16],
    rects: [
      ['#cc2200', 1,8,12,8], ['#cc2200', 2,5,10,4],         // outer flame red
      ['#cc2200', 3,3,8,3], ['#cc2200', 4,1,6,3], ['#cc2200', 5,0,4,2],
      ['#ff6600', 2,9,10,7], ['#ff6600', 3,6,8,4],          // mid flame orange
      ['#ff6600', 4,4,6,3], ['#ff6600', 5,2,4,3],
      ['#ffcc00', 4,10,6,6], ['#ffcc00', 5,7,4,4], ['#ffcc00', 6,5,2,3], // inner yellow
      ['#fff5dd', 5,11,4,4], ['#fff5dd', 6,8,2,4],          // core white
      ['#ffffff', 4,7,2,2], ['#ffffff', 8,7,2,2],           // eyes
      ['#ffff00', 4,7,1,1], ['#ffff00', 8,7,1,1],           // eye glow
    ],
  },

  serpent: {
    size: [14, 16],
    rects: [
      ['#1a6644', 5,8,4,8],                                  // body/neck
      ['#1a7750', 2,2,10,8],                                 // head
      ['#1a7750', 3,8,8,3],                                  // snout
      ['#145534', 2,2,1,8], ['#145534', 11,2,1,8],          // head sides
      ['#22aa66', 3,2,8,2],                                  // forehead ridge
      ['#ffcc00', 3,4,3,2], ['#ffcc00', 8,4,3,2],           // eyes
      ['#1a1a00', 5,4,1,2], ['#1a1a00', 10,4,1,2],          // slit pupils
      ['#0d4428', 4,8,1,1], ['#0d4428', 9,8,1,1],           // nostrils
      ['#ffffff', 4,9,1,3], ['#ffffff', 9,9,1,3],           // fangs
      ['#ff2244', 6,10,2,2], ['#ff2244', 6,12,1,1], ['#ff2244', 7,12,1,1], // tongue
      ['#22aa66', 2,3,1,6], ['#22aa66', 11,3,1,6],          // scale ridge
    ],
  },

  celestial: {
    size: [14, 16],
    rects: [
      ['#f0d060', 0,3,3,10], ['#f0d060', 11,3,3,10],        // wings
      ['#fff8e0', 0,3,2,8], ['#fff8e0', 12,3,2,8],          // wing inner
      ['#f0d060', 0,10,3,1], ['#f0d060', 11,10,3,1],        // feather tips
      ['#fff8e0', 4,5,6,11],                                 // body
      ['#f0d060', 4,5,1,11], ['#f0d060', 9,5,1,11],         // body edge
      ['#ffee44', 3,0,8,1],                                  // halo arc
      ['#ffee44', 2,1,1,2], ['#ffee44', 11,1,1,2],          // halo sides
      ['#ffe0b0', 4,1,6,6],                                  // head
      ['#aaddff', 5,3,2,2], ['#aaddff', 7,3,2,2],           // eyes
      ['#ffffff', 5,3,1,1], ['#ffffff', 7,3,1,1],           // eye glow
      ['#ffd090', 5,5,4,2],                                  // lower face
      ['#f0d060', 5,8,4,4],                                  // armor chest
      ['#fff8e0', 6,7,2,6], ['#fff8e0', 5,10,4,1],          // cross detail
    ],
  },

  wraith: {
    size: [14, 16],
    rects: [
      ['#120825', 1,3,12,13], ['#120825', 2,1,10,3],        // outer body
      ['#1e0d3d', 2,4,10,10],                                // inner body
      ['#0a0515', 0,8,2,8], ['#0a0515', 12,8,2,8],          // tendrils outer
      ['#120825', 1,6,1,6], ['#120825', 12,6,1,6],          // tendrils inner
      ['#1e0d3d', 3,1,8,8],                                  // face area
      ['#cc44ff', 4,3,2,2], ['#cc44ff', 8,3,2,2], ['#cc44ff', 6,5,2,2], // 3 eyes
      ['#ff88ff', 4,3,1,1], ['#ff88ff', 8,3,1,1], ['#ff88ff', 6,5,1,1], // eye glow
      ['#040210', 4,7,6,2],                                  // void mouth
      ['#330055', 5,9,4,4], ['#440066', 6,10,2,2],          // inner glow
    ],
  },

  darkLord: {
    size: [14, 16],
    rects: [
      ['#0f0f15', 0,6,2,10], ['#0f0f15', 12,6,2,10],        // cloak
      ['#0a0a0a', 2,4,10,12],                                // armor body
      ['#0d0d0d', 3,1,8,7],                                  // helm
      ['#440000', 2,0,2,4], ['#440000', 10,0,2,4],          // horns
      ['#660000', 3,0,1,3], ['#660000', 10,0,1,3],          // horn inner
      ['#1a1a22', 4,2,6,5],                                  // helm visor
      ['#ff0000', 4,3,2,2], ['#ff0000', 8,3,2,2],           // eyes
      ['#ff4400', 4,3,1,1], ['#ff4400', 8,3,1,1],           // eye glow
      ['#aa8800', 3,4,8,1], ['#aa8800', 2,5,10,1], ['#aa8800', 2,11,10,1], // gold trim
      ['#886600', 5,6,4,4],                                  // chest crest
      ['#220033', 6,7,2,2], ['#9900cc', 6,7,1,1],           // dark orb
      ['#333344', 1,4,2,3], ['#333344', 11,4,2,3],          // shoulders
      ['#0a0a0a', 4,14,3,2], ['#0a0a0a', 7,14,3,2],         // legs
      ['#4466aa', 4,15,3,1], ['#4466aa', 7,15,3,1],         // boot trim
    ],
  },
};

export default function PixelBoss({ type, isHit = false, isAttacking = false, size = 96 }) {
  const sprite = SPRITES[type] || SPRITES.goblin;
  const [w, h] = sprite.size;
  const scale = size / Math.max(w, h);

  return (
    <svg
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        imageRendering: 'pixelated',
        display: 'block',
        animation: isHit
          ? 'bossHit 0.3s ease'
          : isAttacking
          ? 'bossAttack 0.4s ease'
          : 'bossIdle 2.2s ease-in-out infinite',
        filter: isHit ? 'brightness(4) saturate(0)' : 'none',
        transition: 'filter 0.08s',
      }}
    >
      {sprite.rects.map(([color, x, y, rw, rh], i) => (
        <rect key={i} x={x} y={y} width={rw} height={rh} fill={color} />
      ))}
    </svg>
  );
}
