/**
 * DocsShelf Logo Component
 * A professional, scalable logo featuring a document shelf icon
 */

import React from 'react';
import Svg, { Path, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon';
  style?: ViewStyle;
}

/**
 * DocsShelf Icon - Stylized bookshelf with documents
 * Represents organized, secure document storage
 */
export function DocsShelfLogo({ size = 120, variant = 'icon', style }: LogoProps) {
  const iconSize = size;
  const viewBox = variant === 'full' ? '0 0 200 60' : '0 0 60 60';

  return (
    <Svg width={variant === 'full' ? size * 3.33 : iconSize} height={iconSize} viewBox={viewBox} style={style}>
      <Defs>
        {/* Gradient for modern look */}
        <LinearGradient id="shelfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#2563EB" stopOpacity="1" />
          <Stop offset="100%" stopColor="#3B82F6" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="documentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" stopOpacity="1" />
          <Stop offset="100%" stopColor="#059669" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Icon Only */}
      <G id="icon">
        {/* Bookshelf base */}
        <Rect x="8" y="50" width="44" height="4" rx="2" fill="url(#shelfGradient)" />
        
        {/* Shelf middle */}
        <Rect x="8" y="32" width="44" height="3" rx="1.5" fill="url(#shelfGradient)" opacity="0.8" />
        
        {/* Documents on shelf - varied heights and positions */}
        {/* Document 1 - Tall */}
        <G>
          <Rect x="11" y="12" width="8" height="20" rx="1" fill="url(#documentGradient)" />
          <Path d="M 12 16 L 18 16 M 12 19 L 18 19 M 12 22 L 17 22" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
        </G>

        {/* Document 2 - Medium */}
        <G>
          <Rect x="21" y="18" width="8" height="14" rx="1" fill="#8B5CF6" />
          <Path d="M 22 22 L 28 22 M 22 25 L 28 25 M 22 28 L 27 28" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
        </G>

        {/* Document 3 - Short */}
        <G>
          <Rect x="31" y="22" width="8" height="10" rx="1" fill="#F59E0B" />
          <Path d="M 32 25 L 38 25 M 32 28 L 37 28" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
        </G>

        {/* Document 4 - Medium tall */}
        <G>
          <Rect x="41" y="15" width="8" height="17" rx="1" fill="url(#documentGradient)" />
          <Path d="M 42 19 L 48 19 M 42 22 L 48 22 M 42 25 L 47 25 M 42 28 L 47 28" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
        </G>

        {/* Security lock icon overlay (small) */}
        <G opacity="0.9">
          <Rect x="25" y="38" width="10" height="8" rx="2" fill="#2563EB" />
          <Path d="M 27 38 L 27 36 C 27 34 29 33 30 33 C 31 33 33 34 33 36 L 33 38" stroke="#2563EB" strokeWidth="2" fill="none" />
          <Rect x="29" y="41" width="2" height="3" rx="1" fill="#FFFFFF" />
        </G>
      </G>

      {/* Full logo with text */}
      {variant === 'full' && (
        <G id="text" transform="translate(70, 0)">
          {/* "DocsShelf" text */}
          <text x="0" y="25" fontFamily="system-ui, -apple-system, sans-serif" fontSize="24" fontWeight="bold" fill="#111827">
            DocsShelf
          </text>
          <text x="0" y="45" fontFamily="system-ui, -apple-system, sans-serif" fontSize="12" fill="#6B7280">
            Secure Document Storage
          </text>
        </G>
      )}
    </Svg>
  );
}

/**
 * Simplified mascot/icon for smaller displays
 * Can be animated or used as app icon
 */
export function DocsShelfMascot({ size = 80 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Defs>
        <LinearGradient id="mascotBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#2563EB" stopOpacity="0.1" />
          <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
        </LinearGradient>
      </Defs>

      {/* Background circle */}
      <circle cx="40" cy="40" r="38" fill="url(#mascotBg)" />
      
      {/* Simplified shelf icon */}
      <G transform="translate(20, 20)">
        <Rect x="0" y="32" width="40" height="3" rx="1.5" fill="#2563EB" />
        
        {/* Documents */}
        <Rect x="2" y="10" width="7" height="22" rx="1" fill="#10B981" />
        <Rect x="11" y="15" width="7" height="17" rx="1" fill="#8B5CF6" />
        <Rect x="20" y="18" width="7" height="14" rx="1" fill="#F59E0B" />
        <Rect x="29" y="12" width="7" height="20" rx="1" fill="#10B981" />
        
        {/* Lock */}
        <circle cx="20" cy="30" r="5" fill="#2563EB" opacity="0.9" />
        <Rect x="18" y="28" width="4" height="2" rx="1" fill="#FFFFFF" />
      </G>
    </Svg>
  );
}
