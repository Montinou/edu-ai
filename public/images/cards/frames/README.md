# Card Frame Assets

This directory contains the custom card frame designs created in Canva for the EduCard AI project.

## Required Frame Files

Please download your 4 frame designs from Canva and place them in this directory with the following names:

1. **elementary-frame.png** - For Elementary Academy level cards
   - Blue theme (#4a90e2)
   - Simple, friendly design for younger learners
   - No special effects

2. **magic-frame.png** - For Magic School level cards  
   - Purple theme (#8a2be2)
   - Magical elements and stars
   - Foil effect enabled

3. **arcane-frame.png** - For Arcane University level cards
   - Orange/Red theme (#ff6347) 
   - Mystical runes and patterns
   - Foil + Holographic effects

4. **superior-frame.png** - For Superior Dimension level cards
   - Gold theme (#ffd700)
   - Cosmic/celestial design
   - Full effects (foil + holographic)

## File Requirements

- **Format**: PNG with transparency
- **Size**: 512x768 pixels (2:3 aspect ratio)
- **Quality**: High resolution for crisp 3D rendering
- **Background**: Transparent where the card content should show through

## Usage

The Card3D component will automatically:
- Load the appropriate frame based on card level/rarity
- Apply frame-specific colors and effects
- Handle foil and holographic rendering
- Adjust text colors for optimal contrast

## Fallback

If frame files are missing, the component will fall back to:
- Default card template texture
- Rarity-based colors
- Basic material effects 