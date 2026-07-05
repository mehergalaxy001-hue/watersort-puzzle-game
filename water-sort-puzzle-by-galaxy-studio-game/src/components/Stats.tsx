/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Footprints, ArrowLeft } from 'lucide-react';

interface StatsProps {
  currentLevel: number;
  movesCount: number;
  status: 'playing' | 'won' | 'menu' | 'home' | 'level-select';
  onBack?: () => void;
}

export const Stats: React.FC<StatsProps> = ({
  currentLevel,
  movesCount,
  onBack,
}) => {
  return null;
};

