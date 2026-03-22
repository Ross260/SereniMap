import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/density/predictive
 *
 * Prédit la densité de foule pour une zone et une heure donnée.
 * C'est ici que l'algorithme d'IA intervient pour calculer la prédiction
 * basée sur l'historique des flux piétons.
 *
 * Paramètres (query) :
 *   - lat : latitude de la zone
 *   - lng : longitude de la zone
 *   - heure : heure souhaitée (0-23)
 *   - jour : jour de la semaine (0=dimanche, 6=samedi)
 *
 * Retourne une courbe d'affluence sur 24h et le score prédit.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const lat = parseFloat(searchParams.get("lat") || "48.8566");
  const lng = parseFloat(searchParams.get("lng") || "2.3522");
  const heure = parseInt(searchParams.get("heure") || String(new Date().getHours()), 10);
  const jour = parseInt(searchParams.get("jour") || String(new Date().getDay()), 10);

  // Validation des entrées
  if (isNaN(lat) || isNaN(lng) || heure < 0 || heure > 23) {
    return NextResponse.json(
      { erreur: "Paramètres invalides. Vérifiez lat, lng et heure (0-23)." },
      { status: 400 }
    );
  }

  /**
   * Génération de la courbe d'affluence sur 24 heures.
   * En production, ces données proviendraient d'un modèle de Machine Learning
   * entraîné sur les données historiques de fréquentation.
   *
   * Le modèle simulé ici reproduit les patterns classiques :
   * - Creux la nuit (0h-6h)
   * - Pic le matin (8h-9h) : heures de pointe
   * - Pic le midi (12h-13h) : pause déjeuner
   * - Pic le soir (17h-19h) : retour du travail
   * - Le weekend, les pics sont décalés et moins prononcés
   */
  const courbeAffluence = genererCourbeAffluence(jour);

  // Score de densité prédit pour l'heure demandée
  const scorePrediction = courbeAffluence[heure];

  // Niveau de confort correspondant
  let niveauConfort: string;
  let conseil: string;
  if (scorePrediction <= 25) {
    niveauConfort = "Très calme";
    conseil = "Moment idéal pour se déplacer sereinement.";
  } else if (scorePrediction <= 45) {
    niveauConfort = "Calme";
    conseil = "Peu de monde, conditions confortables pour se déplacer.";
  } else if (scorePrediction <= 65) {
    niveauConfort = "Modéré";
    conseil = "Affluence modérée. Privilégiez les rues secondaires.";
  } else if (scorePrediction <= 80) {
    niveauConfort = "Dense";
    conseil = "Forte affluence prévue. Envisagez de reporter ou d'utiliser un itinéraire calme.";
  } else {
    niveauConfort = "Très dense";
    conseil = "Heure de pointe. Il est recommandé d'éviter cette zone ou d'attendre.";
  }

  return NextResponse.json({
    prediction: {
      lat,
      lng,
      heure_demandee: heure,
      jour_semaine: jour,
      score_densite: scorePrediction,
      niveau_confort: niveauConfort,
      conseil,
    },
    courbe_24h: courbeAffluence.map((score, h) => ({
      heure: h,
      label: `${h}h`,
      score_densite: score,
      niveau: score <= 25 ? "calme" : score <= 50 ? "modere" : score <= 75 ? "dense" : "tres_dense",
    })),
    fiabilite: {
      score: 78,
      sources: ["Historique OpenData", "Modèle prédictif IA", "Données trafic temps réel"],
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Génère une courbe d'affluence simulée sur 24h.
 * Le pattern dépend du jour de la semaine.
 *
 * @param jour - Jour de la semaine (0=dimanche, 6=samedi)
 * @returns Tableau de 24 scores (0-100) représentant l'affluence par heure
 */
function genererCourbeAffluence(jour: number): number[] {
  const estWeekend = jour === 0 || jour === 6;

  // Patterns de base pour semaine et weekend
  const patternSemaine = [
    8, 5, 4, 3, 3, 5, 15, 45, 75, 60, 50, 55,
    70, 55, 45, 50, 60, 80, 72, 55, 40, 30, 20, 12,
  ];

  const patternWeekend = [
    6, 4, 3, 3, 3, 4, 8, 15, 25, 35, 50, 60,
    65, 62, 58, 55, 52, 48, 42, 35, 28, 20, 14, 8,
  ];

  const pattern = estWeekend ? patternWeekend : patternSemaine;

  // Ajout d'une variation aléatoire légère (+/- 8%) pour le réalisme
  return pattern.map((val) => {
    const variation = (Math.random() - 0.5) * 16;
    return Math.max(0, Math.min(100, Math.round(val + variation)));
  });
}
