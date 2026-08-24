import fieldCases from '../data/fieldCases.json' with { type: 'json' };
import masterKbli from '../data/masterKbli.json' with { type: 'json' };
import masterKbji from '../data/masterKbji.json' with { type: 'json' };

// Common Indonesian stopwords in survey responses
const STOPWORDS = new Set([
  'di', 'dan', 'yang', 'untuk', 'pada', 'ke', 'dari', 'ini', 'itu', 'dengan', 
  'milik', 'orang', 'lain', 'sendiri', 'sebagai', 'bagian', 'dalam', 'atas', 
  'sewa', 'membantu', 'ada', 'bukan', 'atau', 'secara', 'karena', 'oleh',
  'saya', 'kami', 'mereka', 'anda', 'tetangga'
]);

// Synonym and domain mapping dictionary for BPS field coding
const SYNONYMS = {
  'panjat': ['kelapa', 'buruh', 'pertanian', 'kebun', 'petani'],
  'kopra': ['kelapa', 'industri', 'pengolahan', 'minyak'],
  'cengkeh': ['aromatik', 'penyegar', 'perkebunan', 'tanaman', 'tahunan'],
  'ojek': ['sepeda motor', 'pengemudi', 'angkutan', 'penumpang', 'online'],
  'kuli': ['buruh', 'bangunan', 'kasar', 'tenaga'],
  'calo': ['perantara', 'agen', 'penjualan', 'makelar'],
  'sembako': ['kebutuhan pokok', 'eceran', 'makanan', 'tradisional', 'toko'],
  'pop ice': ['minuman', 'kedai', 'es', 'dingin', 'penjual'],
  'ketinting': ['perahu', 'laut', 'ikan', 'nelayan', 'tangkap'],
  'tu': ['tata usaha', 'administrasi', 'sekolah', 'staf'],
  'pns': ['administrasi', 'pemerintahan', 'pegawai', 'tata usaha'],
  'bengkel': ['reparasi', 'motor', 'mobil', 'perawatan'],
  'pangkas': ['rambut', 'salon', 'cukur', 'jasa perorangan'],
  'bentor': ['becak', 'motor', 'angkutan', 'penumpang'],
  'emas': ['pertambangan', 'galian', 'tambang rakyat', 'penggalian'],
  'warung': ['kedai', 'eceran', 'penjualan', 'toko', 'makanan'],
  'kios': ['toko', 'eceran', 'kelontong', 'sembako'],
  'tani': ['pertanian', 'kebun', 'tanaman', 'sawah', 'ladang'],
  'jagung': ['pertanian', 'pangan', 'semusim', 'kebun'],
  'mencangkul': ['petani', 'pertanian', 'padi', 'tanaman', 'semusim', 'sawah', 'buruh'],
  'rumput': ['pertanian', 'kebun', 'sawah', 'buruh'],
  'padi': ['pertanian', 'tanaman pangan', 'semusim', 'sawah', 'beras'],
  'bubur': ['kedai makanan', 'pedagang makanan', 'kaki lima', 'keliling'],
  'piano': ['pendidikan', 'musik', 'guru', 'seni', 'kursus', 'les'],
  'kursi': ['kayu', 'furnitur', 'industri', 'tukang'],
  'meja': ['kayu', 'furnitur', 'industri', 'tukang']
};

/**
 * Tokenize and normalize Indonesian text
 */
export function tokenizeText(text) {
  if (!text) return [];
  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned
    .split(' ')
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Expand tokens with synonyms
 */
export function expandTokens(tokens) {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    if (SYNONYMS[token]) {
      SYNONYMS[token].forEach(syn => expanded.add(syn));
    }
    // Handle partial matches
    for (const [key, syns] of Object.entries(SYNONYMS)) {
      if (token.includes(key) || key.includes(token)) {
        syns.forEach(syn => expanded.add(syn));
      }
    }
  }
  return Array.from(expanded);
}

/**
 * Calculate Jaccard similarity between two token sets
 */
function calculateSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Smart recommendation matcher
 * @param {Object} input - { occtle, occmtd, bidang, query }
 */
export function matchKbliKbji(input) {
  const { occtle = '', occmtd = '', bidang = '', query = '' } = input;

  const rawCombined = `${occtle} ${occmtd} ${bidang} ${query}`.trim();
  const queryTokens = tokenizeText(rawCombined);
  const expandedQueryTokens = expandTokens(queryTokens);

  if (queryTokens.length === 0) {
    return {
      kbliRecommendations: [],
      kbjiRecommendations: [],
      similarCases: [],
      confidence: 0,
      queryTokens: []
    };
  }

  // 1. Match against Historical Field Cases
  const scoredCases = fieldCases.map(fc => {
    const caseText = `${fc.mjj.occtle} ${fc.mjj.occmtd} ${fc.mjj.bidang}`;
    const caseTokens = tokenizeText(caseText);
    
    // Exact phrase match bonus
    let exactBonus = 0;
    const lowerRaw = rawCombined.toLowerCase();
    if (lowerRaw.length > 4 && caseText.toLowerCase().includes(lowerRaw)) {
      exactBonus = 0.4;
    }

    // Specific field matches
    const occtleSim = calculateSimilarity(tokenizeText(occtle || rawCombined), tokenizeText(fc.mjj.occtle));
    const occmtdSim = calculateSimilarity(tokenizeText(occmtd || rawCombined), tokenizeText(fc.mjj.occmtd));
    const bidangSim = calculateSimilarity(tokenizeText(bidang || rawCombined), tokenizeText(fc.mjj.bidang));
    const generalSim = calculateSimilarity(expandedQueryTokens, caseTokens);

    const weightedScore = (occtleSim * 0.35) + (occmtdSim * 0.25) + (bidangSim * 0.25) + (generalSim * 0.15) + exactBonus;

    return {
      ...fc,
      score: Math.min(1, weightedScore),
      matchedTokens: queryTokens.filter(t => caseTokens.includes(t))
    };
  }).filter(c => c.score > 0.05).sort((a, b) => b.score - a.score);

  // 2. Aggregate KBLI recommendations from cases + master dictionary
  const kbliScores = {};
  const kbjiScores = {};

  // Score from matching field cases
  scoredCases.slice(0, 15).forEach((c, idx) => {
    const rankWeight = 1 / (idx + 1);
    const mjjKbli = c.mjj.kbli_code;
    const mjjKbji = c.mjj.kbji_code;

    if (mjjKbli) {
      if (!kbliScores[mjjKbli]) {
        kbliScores[mjjKbli] = {
          code: mjjKbli,
          title: c.mjj.kbli_label,
          category: c.mjj.kbli_category,
          division: c.mjj.kbli_division,
          caseCount: 0,
          rawScore: 0,
          reasons: [],
          evidenceCase: c
        };
      }
      kbliScores[mjjKbli].caseCount++;
      kbliScores[mjjKbli].rawScore += c.score * (1 + rankWeight * 0.5);
      if (c.mjj.occtle && !kbliScores[mjjKbli].reasons.includes(c.mjj.occtle)) {
        kbliScores[mjjKbli].reasons.push(c.mjj.occtle);
      }
    }

    if (mjjKbji) {
      if (!kbjiScores[mjjKbji]) {
        kbjiScores[mjjKbji] = {
          code: mjjKbji,
          title: c.mjj.kbji_label,
          major: c.mjj.kbji_major,
          submajor: c.mjj.kbji_submajor,
          caseCount: 0,
          rawScore: 0,
          reasons: [],
          evidenceCase: c
        };
      }
      kbjiScores[mjjKbji].caseCount++;
      kbjiScores[mjjKbji].rawScore += c.score * (1 + rankWeight * 0.5);
      if (c.mjj.occtle && !kbjiScores[mjjKbji].reasons.includes(c.mjj.occtle)) {
        kbjiScores[mjjKbji].reasons.push(c.mjj.occtle);
      }
    }
  });

  // Also score against Master KBLI dictionary
  masterKbli.forEach(k => {
    const masterTokens = tokenizeText(`${k.title} ${k.division_name || ''} ${k.category?.name || ''}`);
    const sim = calculateSimilarity(expandedQueryTokens, masterTokens);
    if (sim > 0.08) {
      if (!kbliScores[k.code]) {
        kbliScores[k.code] = {
          code: k.code,
          title: k.title,
          category: k.category,
          division: k.division_name,
          caseCount: 0,
          rawScore: 0,
          reasons: [],
          evidenceCase: null
        };
      }
      kbliScores[k.code].rawScore += sim * 1.2;
    }
  });

  // Also score against Master KBJI dictionary
  masterKbji.forEach(k => {
    const masterTokens = tokenizeText(`${k.title} ${k.submajor_name || ''} ${k.major?.name || ''}`);
    const sim = calculateSimilarity(expandedQueryTokens, masterTokens);
    if (sim > 0.08) {
      if (!kbjiScores[k.code]) {
        kbjiScores[k.code] = {
          code: k.code,
          title: k.title,
          major: k.major,
          submajor: k.submajor_name,
          caseCount: 0,
          rawScore: 0,
          reasons: [],
          evidenceCase: null
        };
      }
      kbjiScores[k.code].rawScore += sim * 1.2;
    }
  });

  // Format and normalize KBLI recommendations
  const sortedKbli = Object.values(kbliScores)
    .sort((a, b) => b.rawScore - a.rawScore)
    .map((item, idx) => {
      // Scale confidence percentage
      const topScore = Object.values(kbliScores)[0]?.rawScore || 1;
      const relativeRatio = item.rawScore / topScore;
      const confidence = Math.min(99, Math.round((item.rawScore > 1 ? 85 : item.rawScore * 80) * (idx === 0 ? 1 : 0.9)));
      return {
        ...item,
        confidence: Math.max(35, confidence),
        rank: idx + 1
      };
    })
    .slice(0, 5);

  // Format and normalize KBJI recommendations
  const sortedKbji = Object.values(kbjiScores)
    .sort((a, b) => b.rawScore - a.rawScore)
    .map((item, idx) => {
      const topScore = Object.values(kbjiScores)[0]?.rawScore || 1;
      const confidence = Math.min(99, Math.round((item.rawScore > 1 ? 88 : item.rawScore * 82) * (idx === 0 ? 1 : 0.9)));
      return {
        ...item,
        confidence: Math.max(35, confidence),
        rank: idx + 1
      };
    })
    .slice(0, 5);

  const bestConfidence = sortedKbli.length > 0 ? sortedKbli[0].confidence : 0;

  return {
    kbliRecommendations: sortedKbli,
    kbjiRecommendations: sortedKbji,
    similarCases: scoredCases.slice(0, 6),
    confidence: bestConfidence,
    queryTokens
  };
}
