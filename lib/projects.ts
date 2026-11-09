export type Project = {
  slug: string
  title: string
  meta: string
  image: string
  size: 'large' | 'small'
  location: string
  year: string
  type: string
  category: 'Residential' | 'Hospitality' | 'Cultural' | 'Renovation'
  area: string
  description: string
  details: string[]
  gallery: string[]
}

export const projects: Project[] = [
  {
    slug: 'casa-loma',
    title: 'Casa Loma',
    meta: 'Residential · Alentejo, PT · 2023',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
    size: 'large',
    location: 'Alentejo, Portugal',
    year: '2023',
    type: 'New build / Residential',
    category: 'Residential',
    area: '420 m²',
    description: 'A low, quiet house shaped by the long horizon of the Alentejo. Casa Loma frames the landscape through a sequence of shaded courtyards, warm stone walls and carefully controlled apertures.',
    details: ['420 m² built area', 'Private residence', 'Architecture + interiors', 'Local rammed earth & limestone'],
    gallery: [
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    ],
  },
  {
    slug: 'house-for-silence',
    title: 'House for Silence',
    meta: 'Residential · Kyoto, JP · 2022',
    image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85',
    size: 'small',
    location: 'Kyoto, Japan',
    year: '2022',
    type: 'Renovation / Residential',
    category: 'Renovation',
    area: '185 m²',
    description: 'An intimate renovation that turns inward, creating a slower rhythm of rooms, gardens and filtered light within a dense Kyoto neighbourhood.',
    details: ['185 m² built area', 'Private residence', 'Architecture + interiors', 'Hinoki timber & cedar shingles'],
    gallery: [
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
    ],
  },
  {
    slug: 'the-mineral-house',
    title: 'The Mineral House',
    meta: 'Renovation · Mallorca, ES · 2021',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85',
    size: 'small',
    location: 'Mallorca, Spain',
    year: '2021',
    type: 'Renovation / Hospitality',
    category: 'Hospitality',
    area: '260 m²',
    description: 'A tactile retreat carved into an existing stone structure, balancing the roughness of the island with new moments of softness and light.',
    details: ['260 m² built area', 'Private retreat', 'Architecture + landscape', 'Santanyí stone & micro-cement'],
    gallery: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85',
    ],
  },
  {
    slug: 'pavilion-of-light',
    title: 'Pavilion of Light',
    meta: 'Cultural · Zurich, CH · 2024',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    size: 'large',
    location: 'Zurich, Switzerland',
    year: '2024',
    type: 'Exhibition & Pavilion',
    category: 'Cultural',
    area: '340 m²',
    description: 'A temporary timber and cast glass pavilion created for quiet contemplation, catching and diffusing alpine sun through custom cast glass prisms.',
    details: ['340 m² pavilion', 'Cultural pavilion', 'Sustainable timber construction', 'Low-iron cast structural glass'],
    gallery: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85',
    ],
  },
  {
    slug: 'dune-atelier',
    title: 'Dune Atelier',
    meta: 'Residential · Comporta, PT · 2023',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85',
    size: 'small',
    location: 'Comporta, Portugal',
    year: '2023',
    type: 'Studio & Living',
    category: 'Residential',
    area: '210 m²',
    description: 'Positioned amidst coastal pine trees and sand dunes, this artist residence combines washed lime plaster, straw thatch and blackened oak joinery.',
    details: ['210 m² total area', 'Artist residency & living', 'Passive cooling design', 'Local pine and lime render'],
    gallery: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
    ],
  },
  {
    slug: 'onyx-villa',
    title: 'Onyx Villa',
    meta: 'Hospitality · Lake Como, IT · 2022',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
    size: 'small',
    location: 'Lake Como, Italy',
    year: '2022',
    type: 'Private Villa / Hospitality',
    category: 'Hospitality',
    area: '510 m²',
    description: 'Hovering above the lake terrace, Onyx Villa translates northern Italian classicism into monolithic basalt and fluted travertine volumes.',
    details: ['510 m² interior area', 'Boutique guest estate', 'Infinity reflection terrace', 'Honed Roman travertine'],
    gallery: [
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    ],
  },
]
