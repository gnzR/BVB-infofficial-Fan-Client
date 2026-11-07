/**
 * BVB Local Tactical & Transfer Analyst Engine (100% Pure Local TypeScript)
 * Operates offline and locally without calling external AI APIs or requiring Google Logins.
 */

export interface AnalystResult {
  summary: string;
  tacticalRating: number; // 1-10
  recommendation: string;
}

export function analyzeLocalBVBQuery(query: string, category: 'match' | 'transfer' | 'general'): AnalystResult {
  const q = query.toLowerCase();

  if (category === 'transfer' || q.includes('transfer') || q.includes('wechsel') || q.includes('gerücht') || q.includes('ablöse')) {
    return {
      summary: `[BVB Experten-Analyse für "${query}"]: Borussia Dortmund verfolgt bei diesem Transfergerücht eine strategische Perspektive. Der Kaderfokus liegt auf hoher Physis und Umschaltgeschwindigkeit. Die Finanzierbarkeit hängt maßgeblich von Verkäufen ab.`,
      tacticalRating: 8,
      recommendation: "Empfehlung: Hoher Mehrwert für die Kadertiefe in der Bundesliga und Champions League.",
    };
  }

  if (q.includes('guirassy') || q.includes('stürmer') || q.includes('angriff')) {
    return {
      summary: `[BVB Taktik-Analyse]: Serhou Guirassy bindet gegnerische Innenverteidiger effektiv und schafft Räume für Sturmpartner Fábio Silva sowie die nachrückenden Offensivspieler (Beier/Karetsas). Mit seiner hohen Abschlussstärke ist er der zentrale Zielspieler im System von Cheftrainer Niko Kovač.`,
      tacticalRating: 9,
      recommendation: "Taktischer Schlüssel: Frühes Anpressen und schnelles Anspielen im gegnerischen 16er.",
    };
  }

  if (q.includes('schlotterbeck') || q.includes('abwehr') || q.includes('verteidigung') || q.includes('gegentor')) {
    return {
      summary: `[BVB Taktik-Analyse]: Nico Schlotterbeck überzeugt durch hohes Passspiel im Spielaufbau und starke Zweikampfwerte. Eine Absicherung über das defensiv kompakte Mittelfeld (Can/Nmecha) stabilisiert die Viererkette.`,
      tacticalRating: 8,
      recommendation: "Empfehlung: Hohe Passsicherheit bei eigenem Ballbesitz priorisieren.",
    };
  }

  return {
    summary: `[BVB Experten-Analyse]: "${query}" – Borussia Dortmund überzeugt im Signal Iduna Park durch hohes Gegenpressing und schnelle Flügelangriffe. Die Gelbe Wand gibt der Mannschaft die nötige Energie in den entscheidenden Schlussphasen.`,
    tacticalRating: 8,
    recommendation: "Strategie: Hohes Tempo über die Außenbahnen halten und Räume im Zentrum konsequent nutzen.",
  };
}
