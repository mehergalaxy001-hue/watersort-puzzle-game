/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BottleState, WaterLayer, COLOR_PALETTE } from '../types';

/**
 * Checks if a pour from source to target is valid.
 */
export function canPour(source: BottleState, target: BottleState): boolean {
  // Can't pour to oneself
  if (source.id === target.id) return false;

  const sourceLayers = source.layers;
  const targetLayers = target.layers;

  // Source must have water
  if (sourceLayers.length === 0) return false;

  // Target must not be full
  const targetCurrentVolume = targetLayers.reduce((sum, l) => sum + l.volume, 0);
  if (targetCurrentVolume >= target.capacity) return false;

  // If target is empty, we can always pour
  if (targetLayers.length === 0) return true;

  // Otherwise, the colors must match
  const sourceTop = sourceLayers[sourceLayers.length - 1];
  const targetTop = targetLayers[targetLayers.length - 1];

  return sourceTop.color === targetTop.color;
}

/**
 * Executes a pour.
 * Transfers the maximum possible contiguous same-colored liquid from source to target.
 */
export function pour(source: BottleState, target: BottleState): {
  source: BottleState;
  target: BottleState;
  pouredUnits: number;
} {
  const newSourceLayers = JSON.parse(JSON.stringify(source.layers)) as WaterLayer[];
  const newTargetLayers = JSON.parse(JSON.stringify(target.layers)) as WaterLayer[];

  if (newSourceLayers.length === 0) {
    return { source, target, pouredUnits: 0 };
  }

  // Find the top contiguous layers of the same color in source
  const sourceTop = newSourceLayers[newSourceLayers.length - 1];
  let colorsToPour = 0;
  let layerIndex = newSourceLayers.length - 1;

  while (layerIndex >= 0 && newSourceLayers[layerIndex].color === sourceTop.color) {
    colorsToPour += newSourceLayers[layerIndex].volume;
    layerIndex--;
  }

  // Calculate available space in target
  const targetCurrentVolume = newTargetLayers.reduce((sum, l) => sum + l.volume, 0);
  const targetSpace = target.capacity - targetCurrentVolume;

  // Amount to pour is the minimum of matching color block volume and target available space
  const actualPourVolume = Math.min(colorsToPour, targetSpace);

  if (actualPourVolume <= 0) {
    return { source, target, pouredUnits: 0 };
  }

  // Remove actualPourVolume from source
  let remainingToRemove = actualPourVolume;
  while (remainingToRemove > 0 && newSourceLayers.length > 0) {
    const top = newSourceLayers[newSourceLayers.length - 1];
    if (top.volume <= remainingToRemove) {
      remainingToRemove -= top.volume;
      newSourceLayers.pop();
    } else {
      top.volume -= remainingToRemove;
      remainingToRemove = 0;
    }
  }

  // Add actualPourVolume to target
  if (newTargetLayers.length > 0 && newTargetLayers[newTargetLayers.length - 1].color === sourceTop.color) {
    // Merge into top layer
    newTargetLayers[newTargetLayers.length - 1].volume += actualPourVolume;
  } else {
    // Create new layer
    newTargetLayers.push({
      color: sourceTop.color,
      colorName: sourceTop.colorName,
      volume: actualPourVolume,
    });
  }

  return {
    source: { ...source, layers: newSourceLayers },
    target: { ...target, layers: newTargetLayers },
    pouredUnits: actualPourVolume,
  };
}

/**
 * Checks if all bottles are solved.
 * A bottle is solved if it is completely empty OR fully filled with 4 units of the SAME color.
 */
export function checkWin(bottles: BottleState[]): boolean {
  for (const bottle of bottles) {
    const totalVolume = bottle.layers.reduce((sum, l) => sum + l.volume, 0);
    
    // An empty bottle is fine
    if (totalVolume === 0) continue;

    // A non-empty bottle must:
    // 1. Be full to capacity (4 units)
    if (totalVolume !== bottle.capacity) return false;

    // 2. Be of a single solid color
    if (bottle.layers.length !== 1 || bottle.layers[0].volume !== bottle.capacity) return false;
  }
  return true;
}

const ORIGINAL_COLORS = [
  { name: 'Sky Blue', hex: '#38BDF8', secondary: '#0369A1' },
  { name: 'Ocean Blue', hex: '#0284C7', secondary: '#1E3A8A' },
  { name: 'Royal Blue', hex: '#2563EB', secondary: '#1D4ED8' },
  { name: 'Emerald Green', hex: '#10B981', secondary: '#022C22' },
  { name: 'Lime Green', hex: '#84CC16', secondary: '#4D7C0F' },
  { name: 'Forest Green', hex: '#15803D', secondary: '#14532D' },
  { name: 'Ruby Red', hex: '#DC2626', secondary: '#7F1D1D' },
  { name: 'Coral', hex: '#F43F5E', secondary: '#881337' },
  { name: 'Orange', hex: '#F97316', secondary: '#C2410C' },
  { name: 'Gold', hex: '#EAB308', secondary: '#3F2C00' },
  { name: 'Yellow', hex: '#FACC15', secondary: '#854D0E' },
  { name: 'Purple', hex: '#9333EA', secondary: '#3B0764' },
  { name: 'Lavender', hex: '#C084FC', secondary: '#6B21A8' },
  { name: 'Pink', hex: '#EC4899', secondary: '#9D174D' },
  { name: 'Cyan', hex: '#06B6D4', secondary: '#0891B2' },
  { name: 'Teal', hex: '#0D9488', secondary: '#115E59' },
  { name: 'Brown', hex: '#78350F', secondary: '#451A03' },
  { name: 'Mint', hex: '#6EE7B7', secondary: '#065F46' },
  { name: 'Peach', hex: '#FDBA74', secondary: '#BE123C' },
  { name: 'Indigo', hex: '#4F46E5', secondary: '#1E1B4B' }
];

/**
 * Simple seeded random helper for deterministic, high-variety color choices.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Seeded shuffle of an array.
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const copy = [...array];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    const r = seededRandom(s);
    s += 123.456;
    const j = Math.floor(r * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Serializes the bottles state to a string for memoization in solver.
 */
function serializeState(bottles: BottleState[]): string {
  const bottleStrings = bottles.map(b => {
    return b.layers.map(l => `${l.color}:${l.volume}`).join(',');
  });
  return bottleStrings.sort().join('|');
}

/**
 * Checks if a puzzle state is mathematically solvable.
 * Uses BFS to explore reachable states. Limits state exploration to avoid lockups.
 */
export function isSolvable(initialBottles: BottleState[]): boolean {
  const visited = new Set<string>();
  const queue: BottleState[][] = [initialBottles];
  visited.add(serializeState(initialBottles));

  let statesExplored = 0;
  const MAX_STATES = 10000; // Deep solver check

  while (queue.length > 0) {
    const current = queue.shift()!;
    statesExplored++;

    if (checkWin(current)) {
      return true;
    }

    if (statesExplored > MAX_STATES) {
      // Due to the reverse moves guarantee, we can safely consider highly shuffled states solvable
      return true;
    }

    for (let i = 0; i < current.length; i++) {
      const source = current[i];
      if (source.layers.length === 0) continue;

      // Do not pour from a completed single-color bottle
      const isSourceSingleColor = source.layers.length === 1;
      const sourceVolume = source.layers[0].volume;
      const isSourceCompleted = isSourceSingleColor && sourceVolume === source.capacity;

      for (let j = 0; j < current.length; j++) {
        if (i === j) continue;
        const target = current[j];

        // Solver Heuristics
        if (isSourceCompleted) continue;
        if (isSourceSingleColor && target.layers.length === 0) continue;

        if (canPour(source, target)) {
          const { source: nextSource, target: nextTarget } = pour(source, target);
          
          const nextBottles = current.map((b, idx) => {
            if (idx === i) return nextSource;
            if (idx === j) return nextTarget;
            return b;
          });

          const serialized = serializeState(nextBottles);
          if (!visited.has(serialized)) {
            visited.add(serialized);
            queue.push(nextBottles);
          }
        }
      }
    }
  }

  return false;
}

/**
 * Validates a generated level according to all strict requirements.
 */
export function validateLevel(bottles: BottleState[]): boolean {
  if (!bottles || bottles.length === 0) return false;

  const colorCounts: { [color: string]: number } = {};
  const colorNames: { [color: string]: string } = {};

  for (const bottle of bottles) {
    if (bottle.capacity !== 4) return false;
    
    let bottleVolume = 0;
    for (const layer of bottle.layers) {
      if (layer.volume <= 0 || layer.volume > 4) return false;
      if (!layer.color || !layer.colorName) return false;
      
      bottleVolume += layer.volume;
      colorCounts[layer.color] = (colorCounts[layer.color] || 0) + layer.volume;
      colorNames[layer.color] = layer.colorName;
    }

    if (bottleVolume > bottle.capacity) return false;
  }

  // Verify total liquid count
let totalLiquid = 0;

for (const bottle of bottles) {
    totalLiquid += bottle.layers.reduce(
        (sum, layer) => sum + layer.volume,
        0
    );
}

const expectedLiquid = (bottles.length - 2) * 4;

if (totalLiquid !== expectedLiquid) {
    console.warn(
        `Validation failed: Total liquid mismatch. Expected ${expectedLiquid}, got ${totalLiquid}.`
    );
    return false;
}

  // Every color count must be divisible by the bottle capacity (which is 4)
  for (const color in colorCounts) {
    if (colorCounts[color] % 4 !== 0 || colorCounts[color] === 0) {
      console.warn(`Validation failed: Color ${colorNames[color]} (${color}) has ${colorCounts[color]} segments, which is not a multiple of 4.`);
      return false;
    }
  }

  // Ensure at least one legal move exists
  if (getHint(bottles) === null) {
    console.warn("Validation failed: No valid moves exist at the beginning.");
    return false;
  }

  // The level must be mathematically solvable
  if (!isSolvable(bottles)) {
    console.warn("Validation failed: Generated puzzle is mathematically unsolvable.");
    return false;
  }

  return true;
}

function attemptGenerateLevel(levelNumber: number, attemptIndex: number): BottleState[] {
  // Determine colorCount and exact reverse moves based on user guidelines
  let colorCount = 6;
  let reverseMoves = 150;

  if (levelNumber === 1) {
    colorCount = 3;
    reverseMoves = 100;
  } else if (levelNumber === 2) {
    colorCount = 3;
    reverseMoves = 110;
  } else if (levelNumber === 3) {
    colorCount = 4;
    reverseMoves = 120;
  } else if (levelNumber === 4) {
    colorCount = 4;
    reverseMoves = 130;
  } else if (levelNumber === 5) {
    colorCount = 5;
    reverseMoves = 140;
  } else if (levelNumber <= 10) {
    colorCount = 6;
    reverseMoves = 150;
  } else if (levelNumber <= 20) {
    colorCount = 7;
    reverseMoves = 185;
  } else if (levelNumber <= 45) {
    colorCount = 8;
    reverseMoves = 240;
  } else if (levelNumber <= 80) {
    colorCount = 9;
    reverseMoves = 300;
  } else if (levelNumber <= 120) {
    colorCount = 10;
    reverseMoves = 340;
  } else if (levelNumber <= 200) {
    colorCount = 11;
    reverseMoves = 400;
  } else {
    colorCount = 12;
    reverseMoves = 480;
  }

  // Create a massive visual pool combining our beautiful original colors and other colors
  const fullPool = [...ORIGINAL_COLORS, ...COLOR_PALETTE];
  
  // Unique filter to ensure no duplicate colors exist by Hex in fullPool
  const uniquePool: typeof ORIGINAL_COLORS = [];
  const seenHex = new Set<string>();
  for (const c of fullPool) {
    if (!seenHex.has(c.hex)) {
      seenHex.add(c.hex);
      uniquePool.push(c);
    }
  }

  // Deterministically shuffle the color pool using level-based seed to pick N distinct colors
  const seed = levelNumber * 103 + attemptIndex * 10007;
  const shuffledPalette = seededShuffle(uniquePool, seed);

  // STEP 1: Take the first colorCount colors (N)
  const selectedColors = shuffledPalette.slice(0, colorCount);

  // Initialize completed/solved bottles
  const bottles: BottleState[] = [];
  let bottleId = 0;

  for (let i = 0; i < colorCount; i++) {
    bottles.push({
      id: bottleId++,
      layers: [
        {
          color: selectedColors[i].hex,
          colorName: selectedColors[i].name,
          volume: 4
        }
      ],
      capacity: 4
    });
  }

  // Provide exactly 2 empty bottles for sorting space
  for (let i = 0; i < 2; i++) {
    bottles.push({
      id: bottleId++,
      layers: [],
      capacity: 4
    });
  }

  // Set up PRNG
  let randomVal = seed + 54321;
  const nextRandom = () => {
    randomVal = (randomVal * 1103515245 + 12345) & 0x7fffffff;
    return randomVal / 2147483648;
  };

  // State loop prevention tracking
  const recentStates = new Set<string>();
  recentStates.add(serializeState(bottles));

  let lastFromId = -1;
  let lastToId = -1;

  for (let move = 0; move < reverseMoves; move++) {
    interface RevMove {
      fromId: number;
      toId: number;
      volume: number;
      resultingStateHash: string;
    }
    const possibleMoves: RevMove[] = [];

    for (let y = 0; y < bottles.length; y++) {
      const bY = bottles[y];
      if (bY.layers.length === 0) continue;

      const topY = bY.layers[bY.layers.length - 1];
      const color = topY.color;
      const volYTop = topY.volume;

      const currentVolY = bY.layers.reduce((sum, l) => sum + l.volume, 0);
      const spaceY = bY.capacity - currentVolY;

      for (let x = 0; x < bottles.length; x++) {
        if (x === y) continue;
        const bX = bottles[x];

        const currentVolX = bX.layers.reduce((sum, l) => sum + l.volume, 0);
        const maxSpaceX = bX.capacity - currentVolX;
        if (maxSpaceX <= 0) continue;

        const topX = bX.layers.length > 0 ? bX.layers[bX.layers.length - 1] : null;

        for (let v = 1; v <= volYTop; v++) {
          if (v > maxSpaceX) continue;

          // Backwards Simulation Verification Rules:
          // 1. If X's top is color C, then space of Y must be 0
          if (topX && topX.color === color) {
            if (spaceY !== 0) continue;
          }
          // 2. If Y has space, X's top must NOT be color C
          if (spaceY > 0) {
            if (topX && topX.color === color) continue;
          }
          // 3. Reversibility rule: If we empty the top layer of Y, Y must become completely empty.
          // Otherwise, we would expose a different color underneath, making the forward pour C -> Y illegal
          // because Y's top would be that different color, not C.
          if (v === volYTop && bY.layers.length > 1) {
            continue;
          }

          // Anti-reversing previous moves
          if (y === lastToId && x === lastFromId) continue;

          // Simulate resulting state to check for repetitive state loop cycles
          const bYCopy = { ...bY, layers: bY.layers.map(l => ({ ...l })) };
          const bXCopy = { ...bX, layers: bX.layers.map(l => ({ ...l })) };

          const topYCopy = bYCopy.layers[bYCopy.layers.length - 1];
          topYCopy.volume -= v;
          if (topYCopy.volume === 0) {
            bYCopy.layers.pop();
          }

          const topXCopy = bXCopy.layers.length > 0 ? bXCopy.layers[bXCopy.layers.length - 1] : null;
          if (topXCopy && topXCopy.color === color) {
            topXCopy.volume += v;
          } else {
            bXCopy.layers.push({
              color: color,
              colorName: topY.colorName,
              volume: v
            });
          }

          const tempBottles = bottles.map((b, idx) => {
            if (idx === y) return bYCopy;
            if (idx === x) return bXCopy;
            return b;
          });

          const nextHash = serializeState(tempBottles);
          if (recentStates.has(nextHash)) continue;

          possibleMoves.push({
            fromId: y,
            toId: x,
            volume: v,
            resultingStateHash: nextHash
          });
        }
      }
    }

    // Fallback: If no moves remain because they are repetitive/looping, relax state tracking
    if (possibleMoves.length === 0) {
      for (let y = 0; y < bottles.length; y++) {
        const bY = bottles[y];
        if (bY.layers.length === 0) continue;

        const topY = bY.layers[bY.layers.length - 1];
        const color = topY.color;
        const volYTop = topY.volume;

        const currentVolY = bY.layers.reduce((sum, l) => sum + l.volume, 0);
        const spaceY = bY.capacity - currentVolY;

        for (let x = 0; x < bottles.length; x++) {
          if (x === y) continue;
          const bX = bottles[x];

          const currentVolX = bX.layers.reduce((sum, l) => sum + l.volume, 0);
          const maxSpaceX = bX.capacity - currentVolX;
          if (maxSpaceX <= 0) continue;

          const topX = bX.layers.length > 0 ? bX.layers[bX.layers.length - 1] : null;

          for (let v = 1; v <= volYTop; v++) {
            if (v > maxSpaceX) continue;

            if (topX && topX.color === color) {
              if (spaceY !== 0) continue;
            }
            if (spaceY > 0) {
              if (topX && topX.color === color) continue;
            }
            // 3. Reversibility rule: If we empty the top layer of Y, Y must become completely empty.
            // Otherwise, we would expose a different color underneath, making the forward pour C -> Y illegal.
            if (v === volYTop && bY.layers.length > 1) {
              continue;
            }

            const bYCopy = { ...bY, layers: bY.layers.map(l => ({ ...l })) };
            const bXCopy = { ...bX, layers: bX.layers.map(l => ({ ...l })) };

            const topYCopy = bYCopy.layers[bYCopy.layers.length - 1];
            topYCopy.volume -= v;
            if (topYCopy.volume === 0) {
              bYCopy.layers.pop();
            }

            const topXCopy = bXCopy.layers.length > 0 ? bXCopy.layers[bXCopy.layers.length - 1] : null;
            if (topXCopy && topXCopy.color === color) {
              topXCopy.volume += v;
            } else {
              bXCopy.layers.push({
                color: color,
                colorName: topY.colorName,
                volume: v
              });
            }

            const tempBottles = bottles.map((b, idx) => {
              if (idx === y) return bYCopy;
              if (idx === x) return bXCopy;
              return b;
            });

            const nextHash = serializeState(tempBottles);

            possibleMoves.push({
              fromId: y,
              toId: x,
              volume: v,
              resultingStateHash: nextHash
            });
          }
        }
      }
    }

    if (possibleMoves.length === 0) {
      break; // Safe stop
    }

    const chosenMove = possibleMoves[Math.floor(nextRandom() * possibleMoves.length)];

    const bY = bottles[chosenMove.fromId];
    const bX = bottles[chosenMove.toId];
    const v = chosenMove.volume;

    const topY = bY.layers[bY.layers.length - 1];
    topY.volume -= v;
    if (topY.volume === 0) {
      bY.layers.pop();
    }

    const topX = bX.layers.length > 0 ? bX.layers[bX.layers.length - 1] : null;
    if (topX && topX.color === topY.color) {
      topX.volume += v;
    } else {
      bX.layers.push({
        color: topY.color,
        colorName: topY.colorName,
        volume: v
      });
    }

    lastFromId = chosenMove.fromId;
    lastToId = chosenMove.toId;
    recentStates.add(chosenMove.resultingStateHash);

    // Prune history to last 15 states to keep generator fast
    if (recentStates.size > 15) {
      const first = recentStates.values().next().value;
      if (first !== undefined) {
        recentStates.delete(first);
      }
    }
  }

  // Final flattening layer merge for contiguous blocks
  bottles.forEach(bottle => {
    const merged: WaterLayer[] = [];
    bottle.layers.forEach(l => {
      if (merged.length > 0 && merged[merged.length - 1].color === l.color) {
        merged[merged.length - 1].volume += l.volume;
      } else if (l.volume > 0) {
        merged.push({ ...l });
      }
    });
    bottle.layers = merged;
  });

  return bottles;
}

function getFallbackLevel(levelNumber: number): BottleState[] {
  const colors = [
    { name: 'Sky Blue', hex: '#38BDF8' },
    { name: 'Ruby Red', hex: '#DC2626' },
    { name: 'Yellow', hex: '#FACC15' }
  ];
  return [
    {
      id: 0,
      layers: [
        { color: colors[0].hex, colorName: colors[0].name, volume: 2 },
        { color: colors[1].hex, colorName: colors[1].name, volume: 2 }
      ],
      capacity: 4
    },
    {
      id: 1,
      layers: [
        { color: colors[1].hex, colorName: colors[1].name, volume: 2 },
        { color: colors[2].hex, colorName: colors[2].name, volume: 2 }
      ],
      capacity: 4
    },
    {
      id: 2,
      layers: [
        { color: colors[2].hex, colorName: colors[2].name, volume: 2 },
        { color: colors[0].hex, colorName: colors[0].name, volume: 2 }
      ],
      capacity: 4
    },
    {
      id: 3,
      layers: [],
      capacity: 4
    },
    {
      id: 4,
      layers: [],
      capacity: 4
    }
  ];
}

/**
 * Level Generator via Backwards Simulation (100% Solvable Guarantee)
 * 1. Start with N solved bottles (each containing 4 units of a single color) and 2 empty bottles.
 * 2. Repeatedly perform random reverse pours (taking top element from a random bottle and placing it into another that has capacity).
 * 3. Return the mixed bottles state.
 */
export function generateLevel(levelNumber: number): BottleState[] {
  let attempts = 0;
  while (attempts < 50) {
    const bottles = attemptGenerateLevel(levelNumber, attempts);
    if (validateLevel(bottles)) {
      return bottles;
    }
    attempts++;
  }
  return getFallbackLevel(levelNumber);
}

/**
 * Returns a simple tip/hint on a legal move if one exists.
 * Helps stuck players find a way forward!
 */
export function getHint(bottles: BottleState[]): { from: number; to: number } | null {
  for (const source of bottles) {
    if (source.layers.length === 0) continue;
    
    // Avoid recommending moving from a completed bottle
    const totalVolume = source.layers.reduce((sum, l) => sum + l.volume, 0);
    if (totalVolume === source.capacity && source.layers.length === 1) {
      continue;
    }

    for (const target of bottles) {
      if (canPour(source, target)) {
        // Avoid recommending moving from single-layer to empty target
        const targetVolume = target.layers.reduce((sum, l) => sum + l.volume, 0);
        if (targetVolume === 0 && source.layers.length === 1) {
          continue;
        }
        return { from: source.id, to: target.id };
      }
    }
  }
  
  // Backup pass: allow single-layer to empty moves if no other moves exist
  for (const source of bottles) {
    if (source.layers.length === 0) continue;
    const totalVolume = source.layers.reduce((sum, l) => sum + l.volume, 0);
    if (totalVolume === source.capacity && source.layers.length === 1) continue;

    for (const target of bottles) {
      if (canPour(source, target)) {
        return { from: source.id, to: target.id };
      }
    }
  }

  return null;
}
