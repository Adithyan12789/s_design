'use client'

import React from 'react'

interface ArchitecturalBlueprintSvgProps {
  progress?: number
  className?: string
  isStatic?: boolean
}

export function ArchitecturalBlueprintSvg({
  progress = 0,
  className = '',
  isStatic = false,
}: ArchitecturalBlueprintSvgProps) {
  // Normalize progress between 0 and 100
  const p = Math.max(0, Math.min(100, progress))

  // Helper for stroke dash offset based on progress ranges
  const getStrokeDash = (startP: number, endP: number, totalLength: number) => {
    if (isStatic) return 0
    if (p <= startP) return totalLength
    if (p >= endP) return 0
    const ratio = (p - startP) / (endP - startP)
    return totalLength * (1 - ratio)
  }

  // Helper for opacity based on progress ranges
  const getOpacity = (startP: number, endP: number, maxOpacity = 1) => {
    if (isStatic) return maxOpacity
    if (p <= startP) return 0
    if (p >= endP) return maxOpacity
    const ratio = (p - startP) / (endP - startP)
    return ratio * maxOpacity
  }

  return (
    <div className={`architectural-svg-wrap ${className}`}>
      <svg
        viewBox="0 0 460 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="architectural-svg-canvas"
        aria-hidden="true"
      >
        {/* =================================================================
            PHASE 1: Blueprint Grid, Axes & Construction Datum Lines (0 - 30%)
            ================================================================= */}
        <g className="svg-blueprint-grid" opacity={getOpacity(0, 20, 0.75)}>
          {/* Subtle background drafting guide lines */}
          <line
            x1="20"
            y1="56"
            x2="440"
            y2="56"
            stroke="#1c1a17"
            strokeWidth="0.5"
            strokeDasharray="2 4"
            opacity="0.18"
          />
          <line
            x1="20"
            y1="118"
            x2="440"
            y2="118"
            stroke="#1c1a17"
            strokeWidth="0.5"
            strokeDasharray="2 4"
            opacity="0.18"
          />

          {/* Vertical Construction Grid Axes (A, B, C, D) */}
          <g className="svg-grid-axes">
            {/* Axis A */}
            <line
              x1="84"
              y1="34"
              x2="84"
              y2="198"
              stroke="#b68d54"
              strokeWidth="0.75"
              strokeDasharray="4 3"
              opacity="0.45"
            />
            <circle cx="84" cy="206" r="6" stroke="#b68d54" strokeWidth="0.75" fill="#f7f5f0" />
            <text x="84" y="209" textAnchor="middle" fontSize="6.5" fill="#8a6c49" fontFamily="monospace">
              A
            </text>

            {/* Axis B */}
            <line
              x1="176"
              y1="34"
              x2="176"
              y2="198"
              stroke="#b68d54"
              strokeWidth="0.75"
              strokeDasharray="4 3"
              opacity="0.45"
            />
            <circle cx="176" cy="206" r="6" stroke="#b68d54" strokeWidth="0.75" fill="#f7f5f0" />
            <text x="176" y="209" textAnchor="middle" fontSize="6.5" fill="#8a6c49" fontFamily="monospace">
              B
            </text>

            {/* Axis C */}
            <line
              x1="284"
              y1="34"
              x2="284"
              y2="198"
              stroke="#b68d54"
              strokeWidth="0.75"
              strokeDasharray="4 3"
              opacity="0.45"
            />
            <circle cx="284" cy="206" r="6" stroke="#b68d54" strokeWidth="0.75" fill="#f7f5f0" />
            <text x="284" y="209" textAnchor="middle" fontSize="6.5" fill="#8a6c49" fontFamily="monospace">
              C
            </text>

            {/* Axis D */}
            <line
              x1="376"
              y1="34"
              x2="376"
              y2="198"
              stroke="#b68d54"
              strokeWidth="0.75"
              strokeDasharray="4 3"
              opacity="0.45"
            />
            <circle cx="376" cy="206" r="6" stroke="#b68d54" strokeWidth="0.75" fill="#f7f5f0" />
            <text x="376" y="209" textAnchor="middle" fontSize="6.5" fill="#8a6c49" fontFamily="monospace">
              D
            </text>
          </g>

          {/* Top Dimension String & Dimension Ticks */}
          <line x1="84" y1="28" x2="376" y2="28" stroke="#1c1a17" strokeWidth="0.6" opacity="0.35" />
          <line x1="84" y1="24" x2="84" y2="32" stroke="#1c1a17" strokeWidth="0.6" opacity="0.4" />
          <line x1="176" y1="24" x2="176" y2="32" stroke="#1c1a17" strokeWidth="0.6" opacity="0.4" />
          <line x1="284" y1="24" x2="284" y2="32" stroke="#1c1a17" strokeWidth="0.6" opacity="0.4" />
          <line x1="376" y1="24" x2="376" y2="32" stroke="#1c1a17" strokeWidth="0.6" opacity="0.4" />
          <text x="130" y="24" textAnchor="middle" fontSize="6" fill="#8c867a" fontFamily="monospace">
            9.20m
          </text>
          <text x="230" y="24" textAnchor="middle" fontSize="6" fill="#8c867a" fontFamily="monospace">
            10.80m
          </text>
          <text x="330" y="24" textAnchor="middle" fontSize="6" fill="#8c867a" fontFamily="monospace">
            9.20m
          </text>

          {/* Drafting North Arrow / Orientation Compass in Top-Right Corner */}
          <g transform="translate(424, 24)" opacity="0.45">
            <circle cx="0" cy="0" r="10" stroke="#1c1a17" strokeWidth="0.6" />
            <line x1="0" y1="-8" x2="0" y2="8" stroke="#1c1a17" strokeWidth="0.6" />
            <line x1="-8" y1="0" x2="8" y2="0" stroke="#1c1a17" strokeWidth="0.6" />
            <polygon points="0,-8 -2.5,-3 2.5,-3" fill="#b68d54" />
            <text x="0" y="-10" textAnchor="middle" fontSize="5.5" fontWeight="600" fill="#1c1a17" fontFamily="monospace">
              N
            </text>
          </g>

          {/* Ground Baseline & Elevation Benchmark Symbol */}
          <line x1="24" y1="182" x2="436" y2="182" stroke="#1c1a17" strokeWidth="1" opacity="0.5" />
          <polygon points="34,172 44,172 39,182" stroke="#b68d54" strokeWidth="0.75" fill="#f7f5f0" />
          <line x1="32" y1="172" x2="46" y2="172" stroke="#b68d54" strokeWidth="0.75" />
          <text x="49" y="176" fontSize="6" fill="#8a6c49" fontFamily="monospace">
            ▼ +0.00m
          </text>
        </g>

        {/* =================================================================
            PHASE 2: Structural Columns, Foundation & Cantilever Slabs (15 - 65%)
            ================================================================= */}
        <g className="svg-structure-framework">
          {/* Foundation Footing Slab */}
          <rect
            x="70"
            y="176"
            width="320"
            height="6"
            stroke="#1c1a17"
            strokeWidth="1.2"
            fill="#e8e4db"
            style={{
              strokeDasharray: 660,
              strokeDashoffset: getStrokeDash(10, 40, 660),
              opacity: getOpacity(10, 30),
            }}
          />

          {/* Lower Level Slender Structural Columns */}
          <g
            stroke="#1c1a17"
            strokeWidth="1.4"
            strokeLinecap="round"
            style={{
              opacity: getOpacity(20, 50),
            }}
          >
            {/* Column 1 (Left cantilever anchor) */}
            <line x1="84" y1="124" x2="84" y2="176" />
            {/* Column 2 */}
            <line x1="130" y1="124" x2="130" y2="176" />
            {/* Column 3 (Pavilion left frame) */}
            <line x1="176" y1="124" x2="176" y2="176" />
            {/* Column 4 (Pavilion right frame) */}
            <line x1="284" y1="124" x2="284" y2="176" />
            {/* Column 5 (Right cantilever anchor) */}
            <line x1="376" y1="124" x2="376" y2="176" />
          </g>

          {/* Middle Cantilevered Floor Slab */}
          <rect
            x="58"
            y="118"
            width="344"
            height="6"
            stroke="#1c1a17"
            strokeWidth="1.2"
            fill="#ede9df"
            style={{
              strokeDasharray: 710,
              strokeDashoffset: getStrokeDash(25, 55, 710),
              opacity: getOpacity(25, 45),
            }}
          />
          {/* Bronze fine accent line beneath cantilever slab */}
          <line
            x1="58"
            y1="124"
            x2="402"
            y2="124"
            stroke="#b68d54"
            strokeWidth="0.8"
            style={{
              strokeDasharray: 344,
              strokeDashoffset: getStrokeDash(30, 60, 344),
              opacity: getOpacity(30, 50),
            }}
          />

          {/* Upper Cantilevered Geometric Volume Enclosure */}
          <rect
            x="76"
            y="66"
            width="308"
            height="52"
            stroke="#1c1a17"
            strokeWidth="1.2"
            fill="#e2ded4"
            fillOpacity={getOpacity(70, 95, 0.45)}
            style={{
              strokeDasharray: 720,
              strokeDashoffset: getStrokeDash(35, 65, 720),
              opacity: getOpacity(35, 55),
            }}
          />

          {/* Roof Cantilever Canopy Slab */}
          <rect
            x="52"
            y="60"
            width="356"
            height="6"
            stroke="#1c1a17"
            strokeWidth="1.2"
            fill="#ede9df"
            style={{
              strokeDasharray: 730,
              strokeDashoffset: getStrokeDash(40, 70, 730),
              opacity: getOpacity(40, 60),
            }}
          />
          {/* Top Parapet Skyline Finial */}
          <line
            x1="88"
            y1="56"
            x2="372"
            y2="56"
            stroke="#1c1a17"
            strokeWidth="0.8"
            strokeDasharray="3 3"
            opacity={getOpacity(45, 70, 0.4)}
          />
        </g>

        {/* =================================================================
            PHASE 3: Glazing, Mullions, Louvers & Architectural Details (50 - 85%)
            ================================================================= */}
        <g className="svg-architectural-details" opacity={getOpacity(45, 75)}>
          {/* Lower Ground Floor Glass Pavilion & Entry Gallery */}
          <g>
            <rect
              x="176"
              y="124"
              width="108"
              height="52"
              stroke="#1c1a17"
              strokeWidth="0.9"
              fill="#b68d54"
              fillOpacity={getOpacity(65, 95, 0.08)}
            />
            {/* Glass Mullions */}
            <line x1="203" y1="124" x2="203" y2="176" stroke="#1c1a17" strokeWidth="0.75" />
            <line x1="230" y1="124" x2="230" y2="176" stroke="#1c1a17" strokeWidth="0.9" />
            <line x1="257" y1="124" x2="257" y2="176" stroke="#1c1a17" strokeWidth="0.75" />

            {/* Pivot Entrance Door Handle / Architectural Mark */}
            <line x1="235" y1="146" x2="235" y2="158" stroke="#b68d54" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Left Terrace Horizontal Louver Screen */}
          <g stroke="#8c867a" strokeWidth="0.65" opacity="0.6">
            <line x1="90" y1="134" x2="124" y2="134" />
            <line x1="90" y1="142" x2="124" y2="142" />
            <line x1="90" y1="150" x2="124" y2="150" />
            <line x1="90" y1="158" x2="124" y2="158" />
            <line x1="90" y1="166" x2="124" y2="166" />
          </g>

          {/* Right Terrace Minimalist Steel Guardrail */}
          <g stroke="#1c1a17" strokeWidth="0.6" opacity="0.5">
            <line x1="290" y1="150" x2="370" y2="150" />
            <line x1="290" y1="162" x2="370" y2="162" />
            <line x1="316" y1="150" x2="316" y2="176" />
            <line x1="344" y1="150" x2="344" y2="176" />
          </g>

          {/* Upper Panoramic Ribbon Glazing */}
          <g>
            <rect
              x="98"
              y="76"
              width="264"
              height="32"
              stroke="#1c1a17"
              strokeWidth="0.9"
              fill="#cbb391"
              fillOpacity={getOpacity(65, 95, 0.12)}
            />
            {/* Upper Window Mullion System */}
            <line x1="142" y1="76" x2="142" y2="108" stroke="#1c1a17" strokeWidth="0.75" />
            <line x1="186" y1="76" x2="186" y2="108" stroke="#1c1a17" strokeWidth="0.75" />
            <line x1="230" y1="76" x2="230" y2="108" stroke="#1c1a17" strokeWidth="0.75" />
            <line x1="274" y1="76" x2="274" y2="108" stroke="#1c1a17" strokeWidth="0.75" />
            <line x1="318" y1="76" x2="318" y2="108" stroke="#1c1a17" strokeWidth="0.75" />

            {/* Subtle diagonal architectural glass reflection lines */}
            <line
              x1="110"
              y1="104"
              x2="132"
              y2="80"
              stroke="#ffffff"
              strokeWidth="0.7"
              opacity={getOpacity(75, 95, 0.65)}
            />
            <line
              x1="200"
              y1="104"
              x2="222"
              y2="80"
              stroke="#ffffff"
              strokeWidth="0.7"
              opacity={getOpacity(75, 95, 0.65)}
            />
            <line
              x1="288"
              y1="104"
              x2="310"
              y2="80"
              stroke="#ffffff"
              strokeWidth="0.7"
              opacity={getOpacity(75, 95, 0.65)}
            />
          </g>
        </g>

        {/* =================================================================
            PHASE 4: Silhouette Completion & Bronze Horizon Shimmer (75 - 100%)
            ================================================================= */}
        <g className="svg-completed-silhouette" opacity={getOpacity(75, 100)}>
          {/* Subtle warm architectural foundation glow */}
          <rect x="70" y="176" width="320" height="2" fill="#b68d54" opacity="0.8" />
          {/* Roofline crisp accent */}
          <line x1="52" y1="60" x2="408" y2="60" stroke="#b68d54" strokeWidth="1" opacity="0.7" />
        </g>
      </svg>
    </div>
  )
}
