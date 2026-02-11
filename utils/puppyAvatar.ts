// ─── Cute Puppy Avatar SVG Generator v2 ────────────────────────────────
// Much cuter, more distinct puppies with animated floppy ears, bigger sparkly
// eyes, rosy cheeks, varied accessories, and unique breed features.

interface PuppyConfig {
  fur: string;
  light: string;       // muzzle / lighter area
  earType: 'floppy' | 'pointy' | 'bat' | 'round';
  earInner: string;
  eyeColor: string;
  eyeStyle: 'round' | 'sparkle' | 'sleepy';
  nose: string;
  collar: string;
  collarTag: string;
  bg: string;
  tongue: boolean;
  blush: string;
  spots?: string;
  headPatch?: string;  // e.g., a forehead patch different from fur
  accessory?: 'bow' | 'flower' | 'bandana' | 'star' | 'heart' | null;
  accColor?: string;
}

const PUPPY_BREEDS: Record<string, PuppyConfig> = {
  golden:     { fur: '#F5C16C', light: '#FDE8B3', earType: 'floppy', earInner: '#E8A844', eyeColor: '#5C3317', eyeStyle: 'sparkle', nose: '#3D2614', collar: '#E74C3C', collarTag: '#FFD700', bg: '#FFF5E6', tongue: true, blush: '#FFADBC', accessory: null },
  husky:      { fur: '#8E99A4', light: '#F0F0F0', earType: 'pointy', earInner: '#D4C5B8', eyeColor: '#4FA8D6', eyeStyle: 'sparkle', nose: '#4A4A4A', collar: '#3498DB', collarTag: '#C0C0C0', bg: '#E8EDF2', tongue: false, blush: '#D4A0B0', headPatch: '#F0F0F0', accessory: 'star', accColor: '#5DADE2' },
  corgi:      { fur: '#E8A055', light: '#FFF8E7', earType: 'pointy', earInner: '#F5C78A', eyeColor: '#4A3728', eyeStyle: 'round', nose: '#3D2614', collar: '#2ECC71', collarTag: '#FFD700', bg: '#FFF0DB', tongue: true, blush: '#FFB3C1', accessory: 'heart', accColor: '#FF6B9D' },
  dalmatian:  { fur: '#FFFFFF', light: '#F5F5F5', earType: 'floppy', earInner: '#E0D0D0', eyeColor: '#4A3728', eyeStyle: 'round', nose: '#1A1A1A', collar: '#E74C3C', collarTag: '#FFD700', bg: '#F0F0F0', tongue: false, blush: '#E8B0B0', spots: '#333333', accessory: null },
  poodle:     { fur: '#F5F0EB', light: '#E8D5C4', earType: 'round', earInner: '#E0CDB8', eyeColor: '#5C3317', eyeStyle: 'sparkle', nose: '#D4838F', collar: '#FF69B4', collarTag: '#FFD700', bg: '#FFF0F5', tongue: false, blush: '#FFB3D0', accessory: 'bow', accColor: '#FF69B4' },
  shiba:      { fur: '#D4843E', light: '#FFF5E6', earType: 'pointy', earInner: '#F5D0A0', eyeColor: '#3D2614', eyeStyle: 'sleepy', nose: '#1A1A1A', collar: '#FF6B35', collarTag: '#FFD700', bg: '#FFF0DB', tongue: true, blush: '#FFB088', accessory: null },
  beagle:     { fur: '#C4813D', light: '#FFFFFF', earType: 'floppy', earInner: '#A86828', eyeColor: '#5C3317', eyeStyle: 'round', nose: '#3D2614', collar: '#9B59B6', collarTag: '#C0C0C0', bg: '#FEF0DB', tongue: false, blush: '#D4A090', headPatch: '#3D2614', accessory: 'bandana', accColor: '#9B59B6' },
  labrador:   { fur: '#6B4226', light: '#8B6340', earType: 'floppy', earInner: '#5A3520', eyeColor: '#8B7355', eyeStyle: 'sparkle', nose: '#2A1A0A', collar: '#E67E22', collarTag: '#FFD700', bg: '#E8D5C4', tongue: true, blush: '#C49078', accessory: null },
  samoyed:    { fur: '#FFFEF5', light: '#F0EDE4', earType: 'pointy', earInner: '#E8E0D4', eyeColor: '#3D2614', eyeStyle: 'sparkle', nose: '#1A1A1A', collar: '#1ABC9C', collarTag: '#FFD700', bg: '#F8F8F2', tongue: true, blush: '#FFBCC8', accessory: 'flower', accColor: '#FF9ECF' },
  collie:     { fur: '#2C2C2C', light: '#FFFFFF', earType: 'pointy', earInner: '#D4A070', eyeColor: '#5B9BD5', eyeStyle: 'sparkle', nose: '#1A1A1A', collar: '#3498DB', collarTag: '#C0C0C0', bg: '#E0E5EA', tongue: false, blush: '#B8A0B0', headPatch: '#FFFFFF', accessory: 'star', accColor: '#3498DB' },
  frenchie:   { fur: '#8E8E8E', light: '#C4C4C4', earType: 'bat', earInner: '#B0A0A0', eyeColor: '#5C3317', eyeStyle: 'round', nose: '#1A1A1A', collar: '#E91E63', collarTag: '#FFD700', bg: '#E8E8E8', tongue: true, blush: '#D4A0B0', accessory: 'bow', accColor: '#E91E63' },
  pomeranian: { fur: '#E8A055', light: '#FCD5A0', earType: 'pointy', earInner: '#D48840', eyeColor: '#3D2614', eyeStyle: 'sparkle', nose: '#3D2614', collar: '#FF69B4', collarTag: '#FFD700', bg: '#FFF0DB', tongue: false, blush: '#FFB8C8', accessory: 'flower', accColor: '#FFB6D9' },
  dachshund:  { fur: '#8B4513', light: '#C68642', earType: 'floppy', earInner: '#6B3510', eyeColor: '#5C3317', eyeStyle: 'round', nose: '#3D2614', collar: '#2ECC71', collarTag: '#FFD700', bg: '#EBD8C4', tongue: false, blush: '#C4907A', accessory: 'bandana', accColor: '#27AE60' },
  aussie:     { fur: '#6B7B8D', light: '#C4B19A', earType: 'pointy', earInner: '#8B9BAA', eyeColor: '#5B9BD5', eyeStyle: 'sparkle', nose: '#3D2614', collar: '#9B59B6', collarTag: '#C0C0C0', bg: '#DDE3EA', tongue: false, blush: '#B0A0B4', spots: '#4A5568', accessory: 'heart', accColor: '#AF7AC5' },
  bernese:    { fur: '#1A1A1A', light: '#D4843E', earType: 'floppy', earInner: '#3A2A2A', eyeColor: '#5C3317', eyeStyle: 'sparkle', nose: '#1A1A1A', collar: '#E74C3C', collarTag: '#FFD700', bg: '#E0D5CC', tongue: true, blush: '#C49070', headPatch: '#FFFFFF', accessory: null },
  chihuahua:  { fur: '#E8CBA5', light: '#F5E6D3', earType: 'bat', earInner: '#D4B090', eyeColor: '#3D2614', eyeStyle: 'round', nose: '#D4838F', collar: '#FF69B4', collarTag: '#FFD700', bg: '#FFF5EB', tongue: false, blush: '#FFBCC8', accessory: 'bow', accColor: '#FF69B4' },
};

function generatePuppySvg(config: PuppyConfig): string {
  const { fur, light, earType, earInner, eyeColor, eyeStyle, nose, collar, collarTag, bg, tongue, blush, spots, headPatch, accessory, accColor } = config;

  // ── Ears with big, obvious SMIL animation ──
  let ears = '';
  if (earType === 'floppy') {
    // Floppy ears swing dramatically back and forth like a happy dog
    ears = `
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 20 35;-14 20 35;0 20 35;12 20 35;0 20 35;-8 20 35;0 20 35" dur="1.2s" repeatCount="indefinite" />
        <ellipse cx="20" cy="40" rx="14" ry="22" fill="${fur}" transform="rotate(-20 20 40)" />
        <ellipse cx="20" cy="42" rx="9" ry="16" fill="${earInner}" transform="rotate(-20 20 42)" opacity="0.5" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 80 35;12 80 35;0 80 35;-14 80 35;0 80 35;8 80 35;0 80 35" dur="1.3s" repeatCount="indefinite" />
        <ellipse cx="80" cy="40" rx="14" ry="22" fill="${fur}" transform="rotate(20 80 40)" />
        <ellipse cx="80" cy="42" rx="9" ry="16" fill="${earInner}" transform="rotate(20 80 42)" opacity="0.5" />
      </g>`;
  } else if (earType === 'pointy') {
    // Pointy ears twitch alertly — quick perky movements
    ears = `
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 26 44;-10 26 44;0 26 44;0 26 44;8 26 44;0 26 44;0 26 44" dur="1.5s" repeatCount="indefinite" />
        <polygon points="26,14 10,44 42,44" fill="${fur}" />
        <polygon points="26,22 16,41 36,41" fill="${earInner}" opacity="0.5" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 74 44;8 74 44;0 74 44;0 74 44;-10 74 44;0 74 44;0 74 44" dur="1.6s" repeatCount="indefinite" />
        <polygon points="74,14 58,44 90,44" fill="${fur}" />
        <polygon points="74,22 64,41 84,41" fill="${earInner}" opacity="0.5" />
      </g>`;
  } else if (earType === 'bat') {
    // Bat ears flap up and down energetically
    ears = `
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 22 44;-12 22 44;2 22 44;-8 22 44;0 22 44" dur="1s" repeatCount="indefinite" />
        <polygon points="22,10 2,42 42,44" fill="${fur}" />
        <polygon points="22,20 10,40 34,42" fill="${earInner}" opacity="0.5" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 78 44;12 78 44;-2 78 44;8 78 44;0 78 44" dur="1.1s" repeatCount="indefinite" />
        <polygon points="78,10 98,42 58,44" fill="${fur}" />
        <polygon points="78,20 90,40 66,42" fill="${earInner}" opacity="0.5" />
      </g>`;
  } else {
    // Round (poodle-like poofy ears) — bouncy jiggle
    ears = `
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;-4,-3;0,0;3,2;0,0;-2,-1;0,0" dur="1.4s" repeatCount="indefinite" />
        <circle cx="18" cy="42" r="16" fill="${fur}" />
        <circle cx="18" cy="42" r="10" fill="${earInner}" opacity="0.35" />
        <circle cx="14" cy="36" r="5" fill="${fur}" opacity="0.6" />
        <circle cx="24" cy="36" r="4" fill="${fur}" opacity="0.5" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;4,-3;0,0;-3,2;0,0;2,-1;0,0" dur="1.5s" repeatCount="indefinite" />
        <circle cx="82" cy="42" r="16" fill="${fur}" />
        <circle cx="82" cy="42" r="10" fill="${earInner}" opacity="0.35" />
        <circle cx="86" cy="36" r="5" fill="${fur}" opacity="0.6" />
        <circle cx="76" cy="36" r="4" fill="${fur}" opacity="0.5" />
      </g>`;
  }

  // ── Spots ──
  let spotsMarkup = '';
  if (spots) {
    spotsMarkup = `
      <circle cx="34" cy="47" r="4.5" fill="${spots}" opacity="0.55" />
      <circle cx="68" cy="55" r="3.5" fill="${spots}" opacity="0.55" />
      <circle cx="57" cy="43" r="2.5" fill="${spots}" opacity="0.4" />
      <circle cx="41" cy="62" r="2" fill="${spots}" opacity="0.35" />`;
  }

  // ── Head patch ──
  let patchMarkup = '';
  if (headPatch) {
    patchMarkup = `<path d="M 42 38 Q 50 30 58 38" fill="${headPatch}" opacity="0.7" />`;
  }

  // ── Tongue ──
  const tongueMarkup = tongue ? `
      <ellipse cx="50" cy="74" rx="4.5" ry="7" fill="#FF8FAA">
        <animate attributeName="ry" values="7;6;7" dur="2s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="50" cy="72" rx="3.5" ry="3.5" fill="#FFa0B8" />
      <line x1="50" y1="69" x2="50" y2="78" stroke="#F07090" stroke-width="0.6" opacity="0.3" />` : '';

  // ── Eyes ──
  let eyeMarkup = '';
  if (eyeStyle === 'sparkle') {
    eyeMarkup = `
      <!-- Big sparkly eyes -->
      <ellipse cx="37" cy="52" rx="8.5" ry="9" fill="white" />
      <ellipse cx="63" cy="52" rx="8.5" ry="9" fill="white" />
      <circle cx="38" cy="51" r="6" fill="${eyeColor}" />
      <circle cx="64" cy="51" r="6" fill="${eyeColor}" />
      <!-- Big sparkle highlights -->
      <circle cx="35" cy="48" r="3" fill="white" />
      <circle cx="61" cy="48" r="3" fill="white" />
      <!-- Small sparkle -->
      <circle cx="40" cy="53" r="1.3" fill="white" opacity="0.7" />
      <circle cx="66" cy="53" r="1.3" fill="white" opacity="0.7" />
      <!-- Twinkle star in eye -->
      <path d="M 35 48 L 35.5 46.5 L 36 48 L 37.5 48.5 L 36 49 L 35.5 50.5 L 35 49 L 33.5 48.5 Z" fill="white" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite" />
      </path>`;
  } else if (eyeStyle === 'sleepy') {
    eyeMarkup = `
      <!-- Sleepy/happy squinting eyes -->
      <ellipse cx="37" cy="52" rx="8" ry="7" fill="white" />
      <ellipse cx="63" cy="52" rx="8" ry="7" fill="white" />
      <circle cx="38" cy="52" r="5.5" fill="${eyeColor}" />
      <circle cx="64" cy="52" r="5.5" fill="${eyeColor}" />
      <circle cx="36" cy="49" r="2.5" fill="white" />
      <circle cx="62" cy="49" r="2.5" fill="white" />
      <!-- Slightly closed upper lids -->
      <path d="M 29 49 Q 37 46 45 49" fill="${fur}" opacity="0.5" />
      <path d="M 55 49 Q 63 46 71 49" fill="${fur}" opacity="0.5" />`;
  } else {
    eyeMarkup = `
      <!-- Round cute eyes -->
      <ellipse cx="37" cy="52" rx="8" ry="8.5" fill="white" />
      <ellipse cx="63" cy="52" rx="8" ry="8.5" fill="white" />
      <circle cx="38" cy="51.5" r="5.5" fill="${eyeColor}" />
      <circle cx="64" cy="51.5" r="5.5" fill="${eyeColor}" />
      <circle cx="36" cy="48.5" r="2.8" fill="white" />
      <circle cx="62" cy="48.5" r="2.8" fill="white" />
      <circle cx="40" cy="52.5" r="1" fill="white" opacity="0.6" />
      <circle cx="66" cy="52.5" r="1" fill="white" opacity="0.6" />`;
  }

  // ── Eyebrows (subtle) ──
  const eyebrows = `
    <path d="M 29 44 Q 37 40 45 44" fill="none" stroke="${fur}" stroke-width="1.5" stroke-linecap="round" opacity="0.35" />
    <path d="M 55 44 Q 63 40 71 44" fill="none" stroke="${fur}" stroke-width="1.5" stroke-linecap="round" opacity="0.35" />`;

  // ── Mouth ──
  const mouth = tongue
    ? `<path d="M 43 66 Q 46 70 50 68 Q 54 70 57 66" fill="none" stroke="${nose}" stroke-width="1.3" stroke-linecap="round" />`
    : `<path d="M 43 66 Q 50 73 57 66" fill="none" stroke="${nose}" stroke-width="1.3" stroke-linecap="round" />`;

  // ── Accessory ──
  let accessoryMarkup = '';
  if (accessory === 'bow') {
    accessoryMarkup = `
      <g transform="translate(76, 28) rotate(15)">
        <path d="M -6,-3 Q -3,-8 0,-3 Q 3,-8 6,-3 Q 3,2 0,-0.5 Q -3,2 -6,-3" fill="${accColor}" />
        <circle cx="0" cy="-3" r="1.5" fill="white" opacity="0.4" />
      </g>`;
  } else if (accessory === 'flower') {
    accessoryMarkup = `
      <g transform="translate(78, 28)">
        <circle cx="0" cy="-3" r="3" fill="${accColor}" opacity="0.8" />
        <circle cx="3" cy="0" r="3" fill="${accColor}" opacity="0.7" />
        <circle cx="0" cy="3" r="3" fill="${accColor}" opacity="0.8" />
        <circle cx="-3" cy="0" r="3" fill="${accColor}" opacity="0.7" />
        <circle cx="0" cy="0" r="2" fill="#FFE66D" />
      </g>`;
  } else if (accessory === 'bandana') {
    accessoryMarkup = `
      <path d="M 30 78 L 50 88 L 70 78" fill="${accColor}" opacity="0.7" />
      <path d="M 42 82 L 50 92 L 58 82" fill="${accColor}" opacity="0.5" />`;
  } else if (accessory === 'star') {
    accessoryMarkup = `
      <g transform="translate(78, 26)">
        <path d="M 0,-5 L 1.5,-1.5 L 5.5,-1.5 L 2.5,1 L 3.5,5 L 0,2.5 L -3.5,5 L -2.5,1 L -5.5,-1.5 L -1.5,-1.5 Z" fill="${accColor}" opacity="0.8">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
        </path>
      </g>`;
  } else if (accessory === 'heart') {
    accessoryMarkup = `
      <g transform="translate(78, 26) scale(0.6)">
        <path d="M 0,3 C -5,-5 -12,-2 -8,4 L 0,12 L 8,4 C 12,-2 5,-5 0,3" fill="${accColor}" opacity="0.8">
          <animate attributeName="transform" type="scale" values="1;1.1;1" dur="1.5s" repeatCount="indefinite" />
        </path>
      </g>`;
  }

  // ── Whiskers (very subtle) ──
  const whiskers = `
    <line x1="20" y1="62" x2="32" y2="60" stroke="${fur}" stroke-width="0.5" opacity="0.2" />
    <line x1="20" y1="65" x2="32" y2="64" stroke="${fur}" stroke-width="0.5" opacity="0.15" />
    <line x1="80" y1="62" x2="68" y2="60" stroke="${fur}" stroke-width="0.5" opacity="0.2" />
    <line x1="80" y1="65" x2="68" y2="64" stroke="${fur}" stroke-width="0.5" opacity="0.15" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="49" fill="${bg}" />
    ${ears}
    <!-- Head -->
    <ellipse cx="50" cy="56" rx="32" ry="30" fill="${fur}" />
    ${spotsMarkup}
    ${patchMarkup}
    <!-- Muzzle -->
    <ellipse cx="50" cy="63" rx="19" ry="16" fill="${light}" />
    ${eyeMarkup}
    ${eyebrows}
    <!-- Nose -->
    <ellipse cx="50" cy="61" rx="6" ry="4.5" fill="${nose}" />
    <ellipse cx="48" cy="59.5" rx="2.2" ry="1.3" fill="white" opacity="0.25" />
    <!-- Mouth -->
    ${mouth}
    ${tongueMarkup}
    ${whiskers}
    <!-- Blush -->
    <circle cx="27" cy="62" r="6" fill="${blush}" opacity="0.3" />
    <circle cx="73" cy="62" r="6" fill="${blush}" opacity="0.3" />
    <!-- Collar -->
    <path d="M 24 82 Q 50 91 76 82" fill="none" stroke="${collar}" stroke-width="5.5" stroke-linecap="round" />
    <circle cx="50" cy="87" r="3.8" fill="${collarTag}" stroke="#DAA520" stroke-width="0.5">
      <animate attributeName="r" values="3.8;4.2;3.8" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="49" cy="86" r="1.2" fill="white" opacity="0.4" />
    ${accessoryMarkup}
  </svg>`;
}

/**
 * Get a puppy avatar data URI for a given breed seed.
 * Falls back to golden retriever for unknown seeds.
 */
export function getPuppyAvatarUrl(seed: string): string {
  const config = PUPPY_BREEDS[seed] || PUPPY_BREEDS['golden'];
  const svg = generatePuppySvg(config);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Get the raw SVG markup string for inline rendering.
 * Inline SVGs allow SMIL animations (ear wiggle, tongue, etc.) to play.
 */
export function getPuppySvgMarkup(seed: string): string {
  const config = PUPPY_BREEDS[seed] || PUPPY_BREEDS['golden'];
  return generatePuppySvg(config);
}

/**
 * Get all available puppy breed names.
 */
export const PUPPY_BREED_NAMES = Object.keys(PUPPY_BREEDS);

/**
 * Get the ear type for a breed (used for breed-specific sound selection).
 */
export function getBreedEarType(seed: string): 'floppy' | 'pointy' | 'bat' | 'round' {
  const config = PUPPY_BREEDS[seed] || PUPPY_BREEDS['golden'];
  return config.earType;
}

/**
 * Whether a breed has tongue out (affects sound — tongue-out breeds are more vocal).
 */
export function getBreedHasTongue(seed: string): boolean {
  const config = PUPPY_BREEDS[seed] || PUPPY_BREEDS['golden'];
  return config.tongue;
}

/**
 * Human-readable breed labels for the avatar picker.
 */
export const BREED_LABELS: Record<string, string> = {
  golden: 'Golden',
  husky: 'Husky',
  corgi: 'Corgi',
  dalmatian: 'Dalmatian',
  poodle: 'Poodle',
  shiba: 'Shiba',
  beagle: 'Beagle',
  labrador: 'Labrador',
  samoyed: 'Samoyed',
  collie: 'Collie',
  frenchie: 'Frenchie',
  pomeranian: 'Pom',
  dachshund: 'Dachshund',
  aussie: 'Aussie',
  bernese: 'Bernese',
  chihuahua: 'Chihuahua',
};
