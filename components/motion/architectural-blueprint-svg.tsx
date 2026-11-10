'use client'

import React from 'react'

export function ArchitecturalBlueprintSVG() {
  return (
    <svg
      className="architectural-blueprint-svg"
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* Architectural Bronze & Gold Glow Filters */}
        <filter id="bpGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <linearGradient id="scanBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(241, 207, 158, 0)" />
          <stop offset="45%" stopColor="rgba(241, 207, 158, 0.45)" />
          <stop offset="50%" stopColor="rgba(255, 245, 230, 0.95)" />
          <stop offset="55%" stopColor="rgba(241, 207, 158, 0.45)" />
          <stop offset="100%" stopColor="rgba(241, 207, 158, 0)" />
        </linearGradient>

        <linearGradient id="datumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(241, 238, 231, 0.15)" />
          <stop offset="50%" stopColor="rgba(241, 207, 158, 0.75)" />
          <stop offset="100%" stopColor="rgba(241, 238, 231, 0.15)" />
        </linearGradient>

        <pattern id="cadGridSmall" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(241, 238, 231, 0.05)" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Subtle CAD Background Coordinate Grid */}
      <rect width="1440" height="900" fill="url(#cadGridSmall)" className="bp-grid-pattern" opacity="0" />

      {/* =========================================================================
          GROUP 1: Coordinate Rulers, Boundary Framing & Technical Metadata
          ========================================================================= */}
      <g className="bp-group bp-group-framing">
        {/* Corner framing brackets */}
        <path d="M 40 70 L 40 40 L 70 40" stroke="rgba(241, 238, 231, 0.6)" strokeWidth="1" pathLength="1" className="bp-line-framing" />
        <path d="M 1400 70 L 1400 40 L 1370 40" stroke="rgba(241, 238, 231, 0.6)" strokeWidth="1" pathLength="1" className="bp-line-framing" />
        <path d="M 40 830 L 40 860 L 70 860" stroke="rgba(241, 238, 231, 0.6)" strokeWidth="1" pathLength="1" className="bp-line-framing" />
        <path d="M 1400 830 L 1400 860 L 1370 860" stroke="rgba(241, 238, 231, 0.6)" strokeWidth="1" pathLength="1" className="bp-line-framing" />

        {/* Framing border hairline */}
        <rect x="40" y="40" width="1360" height="820" stroke="rgba(241, 238, 231, 0.2)" strokeWidth="0.75" strokeDasharray="6 6" pathLength="1" className="bp-line-border" />

        {/* Technical Title Block & Metadata */}
        <g className="bp-tag bp-meta-top-left" opacity="0">
          <text x="56" y="58" fill="rgba(241, 207, 158, 0.9)" fontFamily="monospace" fontSize="8.5" letterSpacing="0.22em">S_DE_SIGN · SPATIAL PRACTICE</text>
          <text x="56" y="70" fill="rgba(241, 238, 231, 0.65)" fontFamily="monospace" fontSize="7.5" letterSpacing="0.18em">DRAWING: AR-01 · SCHEMATIC SECTION</text>
        </g>

        <g className="bp-tag bp-meta-top-right" opacity="0">
          <text x="1384" y="58" textAnchor="end" fill="rgba(241, 207, 158, 0.9)" fontFamily="monospace" fontSize="8.5" letterSpacing="0.22em">PROJ: RESIDENCE ONYX / VILLA</text>
          <text x="1384" y="70" textAnchor="end" fill="rgba(241, 238, 231, 0.65)" fontFamily="monospace" fontSize="7.5" letterSpacing="0.18em">LOCATION: 38°43&apos;21&quot;N · 9°08&apos;22&quot;W · LISBON</text>
        </g>

        <g className="bp-tag bp-meta-bottom-left" opacity="0">
          <text x="56" y="848" fill="rgba(241, 238, 231, 0.55)" fontFamily="monospace" fontSize="7.5" letterSpacing="0.18em">SCALE 1:50 · CONCRETE &amp; TRAVERTINE STRUCTURAL BAY</text>
        </g>

        <g className="bp-tag bp-meta-bottom-right" opacity="0">
          <text x="1384" y="848" textAnchor="end" fill="rgba(241, 207, 158, 0.8)" fontFamily="monospace" fontSize="7.5" letterSpacing="0.2em">STATUS: DESIGN DEVELOPMENT</text>
        </g>
      </g>

      {/* =========================================================================
          GROUP 2: Structural Column Grid & Axis Lines
          ========================================================================= */}
      <g className="bp-group bp-group-grid">
        {/* Vertical Axis Column Lines */}
        <line x1="260" y1="50" x2="260" y2="850" stroke="rgba(241, 238, 231, 0.45)" strokeWidth="0.8" strokeDasharray="8 6" pathLength="1" className="bp-line-grid" />
        <line x1="560" y1="50" x2="560" y2="850" stroke="rgba(241, 238, 231, 0.45)" strokeWidth="0.8" strokeDasharray="8 6" pathLength="1" className="bp-line-grid" />
        <line x1="880" y1="50" x2="880" y2="850" stroke="rgba(241, 238, 231, 0.45)" strokeWidth="0.8" strokeDasharray="8 6" pathLength="1" className="bp-line-grid" />
        <line x1="1200" y1="50" x2="1200" y2="850" stroke="rgba(241, 238, 231, 0.45)" strokeWidth="0.8" strokeDasharray="8 6" pathLength="1" className="bp-line-grid" />

        {/* Axis Column Bubbles at Top */}
        <g className="bp-tag bp-bubble-a" opacity="0">
          <circle cx="260" cy="50" r="14" fill="rgba(24, 23, 20, 0.85)" stroke="rgba(241, 207, 158, 0.85)" strokeWidth="1" />
          <text x="260" y="54" textAnchor="middle" fill="#f1eee7" fontFamily="Georgia, serif" fontSize="11" fontWeight="600">A</text>
        </g>
        <g className="bp-tag bp-bubble-b" opacity="0">
          <circle cx="560" cy="50" r="14" fill="rgba(24, 23, 20, 0.85)" stroke="rgba(241, 207, 158, 0.85)" strokeWidth="1" />
          <text x="560" y="54" textAnchor="middle" fill="#f1eee7" fontFamily="Georgia, serif" fontSize="11" fontWeight="600">B</text>
        </g>
        <g className="bp-tag bp-bubble-c" opacity="0">
          <circle cx="880" cy="50" r="14" fill="rgba(24, 23, 20, 0.85)" stroke="rgba(241, 207, 158, 0.85)" strokeWidth="1" />
          <text x="880" y="54" textAnchor="middle" fill="#f1eee7" fontFamily="Georgia, serif" fontSize="11" fontWeight="600">C</text>
        </g>
        <g className="bp-tag bp-bubble-d" opacity="0">
          <circle cx="1200" cy="50" r="14" fill="rgba(24, 23, 20, 0.85)" stroke="rgba(241, 207, 158, 0.85)" strokeWidth="1" />
          <text x="1200" y="54" textAnchor="middle" fill="#f1eee7" fontFamily="Georgia, serif" fontSize="11" fontWeight="600">D</text>
        </g>

        {/* Intersection Crosshairs */}
        <path d="M 252 230 H 268 M 260 222 V 238" stroke="rgba(241, 207, 158, 0.9)" strokeWidth="1" pathLength="1" className="bp-line-crosshair" />
        <path d="M 552 230 H 568 M 560 222 V 238" stroke="rgba(241, 207, 158, 0.9)" strokeWidth="1" pathLength="1" className="bp-line-crosshair" />
        <path d="M 872 230 H 888 M 880 222 V 238" stroke="rgba(241, 207, 158, 0.9)" strokeWidth="1" pathLength="1" className="bp-line-crosshair" />
        <path d="M 1192 230 H 1208 M 1200 222 V 238" stroke="rgba(241, 207, 158, 0.9)" strokeWidth="1" pathLength="1" className="bp-line-crosshair" />

        <path d="M 252 410 H 268 M 260 402 V 418" stroke="rgba(241, 207, 158, 0.9)" strokeWidth="1" pathLength="1" className="bp-line-crosshair" />
        <path d="M 552 410 H 568 M 560 402 V 418" stroke="rgba(241, 207, 158, 0.9)" strokeWidth="1" pathLength="1" className="bp-line-crosshair" />
        <path d="M 872 410 H 888 M 880 402 V 418" stroke="rgba(241, 207, 158, 0.9)" strokeWidth="1" pathLength="1" className="bp-line-crosshair" />
        <path d="M 1192 410 H 1208 M 1200 402 V 418" stroke="rgba(241, 207, 158, 0.9)" strokeWidth="1" pathLength="1" className="bp-line-crosshair" />

        <path d="M 252 590 H 268 M 260 582 V 598" stroke="rgba(241, 207, 158, 0.9)" strokeWidth="1" pathLength="1" className="bp-line-crosshair" />
        <path d="M 552 590 H 568 M 560 582 V 598" stroke="rgba(241, 207, 158, 0.9)" strokeWidth="1" pathLength="1" className="bp-line-crosshair" />
        <path d="M 872 590 H 888 M 880 582 V 598" stroke="rgba(241, 207, 158, 0.9)" strokeWidth="1" pathLength="1" className="bp-line-crosshair" />
        <path d="M 1192 590 H 1208 M 1200 582 V 598" stroke="rgba(241, 207, 158, 0.9)" strokeWidth="1" pathLength="1" className="bp-line-crosshair" />
      </g>

      {/* =========================================================================
          GROUP 3: Horizontal Structural Datum Levels
          ========================================================================= */}
      <g className="bp-group bp-group-levels">
        {/* Level +02 Roof Parapet */}
        <line x1="120" y1="230" x2="1340" y2="230" stroke="url(#datumGrad)" strokeWidth="1.2" pathLength="1" className="bp-line-level" />
        <g className="bp-tag bp-level-roof" opacity="0">
          <path d="M 1340 230 L 1354 222 V 238 Z" fill="rgba(241, 207, 158, 0.9)" />
          <text x="1362" y="233" fill="#f1eee7" fontFamily="monospace" fontSize="8" letterSpacing="0.14em">+7.200m ROOF PARAPET</text>
        </g>

        {/* Level +01 Cantilever Upper Slab */}
        <line x1="120" y1="410" x2="1340" y2="410" stroke="url(#datumGrad)" strokeWidth="1.2" pathLength="1" className="bp-line-level" />
        <g className="bp-tag bp-level-slab" opacity="0">
          <path d="M 1340 410 L 1354 402 V 418 Z" fill="rgba(241, 207, 158, 0.9)" />
          <text x="1362" y="413" fill="#f1eee7" fontFamily="monospace" fontSize="8" letterSpacing="0.14em">+3.850m UPPER SLAB</text>
        </g>

        {/* Level 00 Ground Finish Floor */}
        <line x1="120" y1="590" x2="1340" y2="590" stroke="rgba(241, 238, 231, 0.7)" strokeWidth="1.5" pathLength="1" className="bp-line-level" />
        <g className="bp-tag bp-level-ground" opacity="0">
          <path d="M 1340 590 L 1354 582 V 598 Z" fill="rgba(241, 207, 158, 0.9)" />
          <text x="1362" y="593" fill="#f1eee7" fontFamily="monospace" fontSize="8" letterSpacing="0.14em">±0.000m FINISH FLOOR</text>
        </g>

        {/* Level -01 Subgrade Footing */}
        <line x1="160" y1="720" x2="1280" y2="720" stroke="rgba(241, 238, 231, 0.35)" strokeWidth="0.8" strokeDasharray="6 4" pathLength="1" className="bp-line-level" />
        <g className="bp-tag bp-level-footing" opacity="0">
          <text x="1362" y="723" fill="rgba(241, 238, 231, 0.6)" fontFamily="monospace" fontSize="8" letterSpacing="0.14em">-1.800m SUB-GRADE</text>
        </g>
      </g>

      {/* =========================================================================
          GROUP 4: Architectural Elevation Wireframe & Building Structure
          ========================================================================= */}
      <g className="bp-group bp-group-structure">
        {/* Upper Cantilever Volume Frame */}
        <rect x="340" y="230" width="880" height="180" stroke="#f1eee7" strokeWidth="1.6" fill="rgba(241, 238, 231, 0.02)" pathLength="1" className="bp-line-structure bp-slab-main" />

        {/* Cantilever Overhang (Extending West past Axis B) */}
        <path d="M 340 230 L 220 230 L 220 410 L 340 410" stroke="#f1eee7" strokeWidth="1.6" fill="none" pathLength="1" className="bp-line-structure bp-cantilever" />
        <line x1="220" y1="410" x2="1220" y2="410" stroke="#f1cf9e" strokeWidth="2.4" pathLength="1" className="bp-line-structure bp-heavy-soffit" />

        {/* Glazing Curtain Wall Vertical Mullions */}
        <line x1="420" y1="230" x2="420" y2="410" stroke="rgba(241, 238, 231, 0.45)" strokeWidth="0.8" pathLength="1" className="bp-line-mullion" />
        <line x1="520" y1="230" x2="520" y2="410" stroke="rgba(241, 238, 231, 0.45)" strokeWidth="0.8" pathLength="1" className="bp-line-mullion" />
        <line x1="620" y1="230" x2="620" y2="410" stroke="rgba(241, 238, 231, 0.45)" strokeWidth="0.8" pathLength="1" className="bp-line-mullion" />
        <line x1="720" y1="230" x2="720" y2="410" stroke="rgba(241, 238, 231, 0.45)" strokeWidth="0.8" pathLength="1" className="bp-line-mullion" />
        <line x1="820" y1="230" x2="820" y2="410" stroke="rgba(241, 238, 231, 0.45)" strokeWidth="0.8" pathLength="1" className="bp-line-mullion" />
        <line x1="920" y1="230" x2="920" y2="410" stroke="rgba(241, 238, 231, 0.45)" strokeWidth="0.8" pathLength="1" className="bp-line-mullion" />
        <line x1="1020" y1="230" x2="1020" y2="410" stroke="rgba(241, 238, 231, 0.45)" strokeWidth="0.8" pathLength="1" className="bp-line-mullion" />
        <line x1="1120" y1="230" x2="1120" y2="410" stroke="rgba(241, 238, 231, 0.45)" strokeWidth="0.8" pathLength="1" className="bp-line-mullion" />

        {/* Lower Ground Gallery & Recessed Core */}
        <rect x="440" y="410" width="540" height="180" stroke="#f1eee7" strokeWidth="1.4" fill="rgba(24, 23, 20, 0.05)" pathLength="1" className="bp-line-structure bp-ground-core" />
        <rect x="180" y="590" width="1120" height="30" stroke="#f1eee7" strokeWidth="1.6" fill="rgba(241, 207, 158, 0.05)" pathLength="1" className="bp-line-structure bp-podium-slab" />

        {/* Structural Load-Bearing Columns */}
        <line x1="560" y1="410" x2="560" y2="590" stroke="#f1cf9e" strokeWidth="2.2" pathLength="1" className="bp-line-structure bp-column-1" />
        <line x1="880" y1="410" x2="880" y2="590" stroke="#f1cf9e" strokeWidth="2.2" pathLength="1" className="bp-line-structure bp-column-2" />

        {/* Terraced Reflecting Pool Boundary */}
        <polygon points="180,620 1260,620 1210,710 230,710" stroke="rgba(241, 207, 158, 0.6)" strokeWidth="1" fill="none" pathLength="1" className="bp-line-structure bp-pool-terrace" />

        {/* Foundation Earth-Grade Ticks */}
        <path d="M 180 620 L 160 645 M 260 620 L 240 645 M 340 620 L 320 645 M 420 620 L 400 645 M 500 620 L 480 645 M 580 620 L 560 645 M 660 620 L 640 645 M 740 620 L 720 645 M 820 620 L 800 645 M 900 620 L 880 645 M 980 620 L 960 645 M 1060 620 L 1040 645 M 1140 620 L 1120 645 M 1220 620 L 1200 645" stroke="rgba(241, 238, 231, 0.3)" strokeWidth="0.8" pathLength="1" className="bp-line-foundation-ticks" />
      </g>

      {/* =========================================================================
          GROUP 5: Dimension Strings & Extension Ticks
          ========================================================================= */}
      <g className="bp-group bp-group-dimensions">
        {/* Top Horizontal Dimension Line Chain at Y=150 */}
        <line x1="220" y1="150" x2="1220" y2="150" stroke="rgba(241, 207, 158, 0.85)" strokeWidth="0.8" pathLength="1" className="bp-line-dim" />

        {/* Dimension Extension Witness Lines */}
        <line x1="220" y1="135" x2="220" y2="230" stroke="rgba(241, 207, 158, 0.5)" strokeWidth="0.6" strokeDasharray="3 3" pathLength="1" className="bp-line-dim" />
        <line x1="560" y1="135" x2="560" y2="230" stroke="rgba(241, 207, 158, 0.5)" strokeWidth="0.6" strokeDasharray="3 3" pathLength="1" className="bp-line-dim" />
        <line x1="880" y1="135" x2="880" y2="230" stroke="rgba(241, 207, 158, 0.5)" strokeWidth="0.6" strokeDasharray="3 3" pathLength="1" className="bp-line-dim" />
        <line x1="1220" y1="135" x2="1220" y2="230" stroke="rgba(241, 207, 158, 0.5)" strokeWidth="0.6" strokeDasharray="3 3" pathLength="1" className="bp-line-dim" />

        {/* 45° Architectural Slash Ticks */}
        <path d="M 215 155 L 225 145 M 555 155 L 565 145 M 875 155 L 885 145 M 1215 155 L 1225 145" stroke="#f1cf9e" strokeWidth="1.2" pathLength="1" className="bp-line-dim-ticks" />

        {/* Dimension Measurement Labels */}
        <g className="bp-tag bp-dim-labels" opacity="0">
          <text x="390" y="142" textAnchor="middle" fill="#f1eee7" fontFamily="monospace" fontSize="8" letterSpacing="0.16em">3,400 mm</text>
          <text x="720" y="142" textAnchor="middle" fill="#f1eee7" fontFamily="monospace" fontSize="8" letterSpacing="0.16em">6,400 mm [CENTRAL LIVING]</text>
          <text x="1050" y="142" textAnchor="middle" fill="#f1eee7" fontFamily="monospace" fontSize="8" letterSpacing="0.16em">5,200 mm</text>
        </g>

        {/* Callout Pointer & Engineering Spec */}
        <g className="bp-tag bp-callout-1" opacity="0">
          <path d="M 220 320 L 140 320 L 110 350" stroke="rgba(241, 207, 158, 0.8)" strokeWidth="0.8" fill="none" pathLength="1" className="bp-line-callout" />
          <circle cx="220" cy="320" r="2.5" fill="#f1cf9e" />
          <text x="105" y="365" textAnchor="end" fill="rgba(241, 207, 158, 0.95)" fontFamily="monospace" fontSize="7.5" letterSpacing="0.15em">3.4m REINFORCED</text>
          <text x="105" y="376" textAnchor="end" fill="rgba(241, 238, 231, 0.7)" fontFamily="monospace" fontSize="7" letterSpacing="0.12em">CANTILEVER PROJECTION</text>
        </g>
      </g>

      {/* =========================================================================
          GROUP 6: Geometric Construction Arcs & S_Designs Blueprint Geometry
          ========================================================================= */}
      <g className="bp-group bp-group-geometry">
        {/* S_Designs Signature Catenary / Gothic Geometric Arch */}
        <path
          d="M 440 590 C 440 330 680 150 720 150 C 760 150 1000 330 1000 590"
          stroke="rgba(241, 207, 158, 0.85)"
          strokeWidth="1.2"
          fill="none"
          pathLength="1"
          className="bp-line-arch"
        />
        <path
          d="M 480 590 C 480 360 690 200 720 200 C 750 200 960 360 960 590"
          stroke="rgba(241, 238, 231, 0.45)"
          strokeWidth="0.8"
          strokeDasharray="5 4"
          fill="none"
          pathLength="1"
          className="bp-line-arch"
        />

        {/* Golden Compass Tangent Circles */}
        <circle cx="720" cy="380" r="160" stroke="rgba(241, 207, 158, 0.35)" strokeWidth="0.75" strokeDasharray="4 4" pathLength="1" className="bp-line-circle" />
        <circle cx="720" cy="380" r="280" stroke="rgba(241, 238, 231, 0.25)" strokeWidth="0.6" strokeDasharray="4 6" pathLength="1" className="bp-line-circle" />

        {/* Solar Study Sun Path Arc (Summer Solstice 42.5°) */}
        <path
          d="M 300 590 A 580 580 0 0 1 1260 480"
          stroke="rgba(241, 207, 158, 0.6)"
          strokeWidth="1"
          strokeDasharray="7 5"
          fill="none"
          pathLength="1"
          className="bp-line-sunpath"
        />
        <line x1="720" y1="380" x2="1140" y2="120" stroke="rgba(241, 207, 158, 0.75)" strokeWidth="0.8" strokeDasharray="3 3" pathLength="1" className="bp-line-sunpath" />

        <g className="bp-tag bp-sun-tag" opacity="0">
          <circle cx="1140" cy="120" r="6" fill="rgba(241, 207, 158, 0.3)" stroke="#f1cf9e" strokeWidth="1" />
          <circle cx="1140" cy="120" r="2" fill="#ffffff" />
          <text x="1155" y="124" fill="#f1cf9e" fontFamily="monospace" fontSize="7.5" letterSpacing="0.14em">SOLAR ANGLE 42.5°</text>
        </g>
      </g>

      {/* =========================================================================
          GROUP 7: Architectural Transformation Scanner Beam (Vertical Datum Light)
          ========================================================================= */}
      <g className="bp-group bp-scanner-wrap" opacity="0">
        <rect
          className="bp-scanner-beam"
          x="100"
          y="0"
          width="180"
          height="900"
          fill="url(#scanBeamGrad)"
          style={{ mixBlendMode: 'screen' }}
        />
        <line
          className="bp-scanner-line"
          x1="190"
          y1="40"
          x2="190"
          y2="860"
          stroke="#ffffff"
          strokeWidth="1.5"
          filter="url(#bpGlow)"
        />
      </g>
    </svg>
  )
}

