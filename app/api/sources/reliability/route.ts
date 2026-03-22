import { NextResponse } from "next/server";

/**
 * GET /api/sources/reliability
 *
 * Liste les sources de données utilisées par la plateforme
 * et leur score de fiabilité (Scoring Data Souverain).
 *
 * Cette transparence est essentielle pour la confiance des utilisateurs.
 * Chaque source est évaluée sur plusieurs critères :
 * - Fraîcheur des données (temps réel vs historique)
 * - Couverture géographique
 * - Souveraineté (données françaises/européennes vs internationales)
 * - Précision vérifiée
 */
export async function GET() {
  /**
   * En production, ces scores seraient calculés dynamiquement
   * en fonction de la disponibilité et de la qualité des flux de données.
   */
  const sources = [
    {
      id: "opendata-paris",
      nom: "OpenData Paris",
      description:
        "Données ouvertes de la Ville de Paris : comptages piétons, fréquentation des transports, événements.",
      type: "opendata",
      score_fiabilite: 92,
      souverainete: "Française",
      frequence_maj: "Temps réel (5 min)",
      couverture: "Île-de-France",
      url: "https://opendata.paris.fr",
      criteres: {
        fraicheur: 95,
        couverture_geo: 85,
        souverainete: 100,
        precision: 88,
      },
    },
    {
      id: "osm",
      nom: "OpenStreetMap",
      description:
        "Cartographie collaborative mondiale. Données de voirie, chemins piétons, parcs et zones vertes.",
      type: "cartographie",
      score_fiabilite: 88,
      souverainete: "Internationale (communautaire)",
      frequence_maj: "Continue (communautaire)",
      couverture: "Mondiale",
      url: "https://www.openstreetmap.org",
      criteres: {
        fraicheur: 80,
        couverture_geo: 98,
        souverainete: 70,
        precision: 90,
      },
    },
    {
      id: "capteurs-locaux",
      nom: "Capteurs de flux piétons",
      description:
        "Réseau de capteurs municipaux mesurant le passage piéton en temps réel aux points stratégiques.",
      type: "capteurs",
      score_fiabilite: 95,
      souverainete: "Française",
      frequence_maj: "Temps réel (1 min)",
      couverture: "Points stratégiques urbains",
      url: null,
      criteres: {
        fraicheur: 100,
        couverture_geo: 45,
        souverainete: 100,
        precision: 96,
      },
    },
    {
      id: "meteo-france",
      nom: "Météo France",
      description:
        "Données météorologiques influençant les flux piétons (pluie = moins de monde dehors).",
      type: "meteo",
      score_fiabilite: 90,
      souverainete: "Française",
      frequence_maj: "Toutes les heures",
      couverture: "France entière",
      url: "https://meteofrance.com",
      criteres: {
        fraicheur: 85,
        couverture_geo: 100,
        souverainete: 100,
        precision: 82,
      },
    },
    {
      id: "modele-ia",
      nom: "Modèle prédictif IA SereniMap",
      description:
        "Algorithme de prédiction de densité basé sur le Machine Learning, entraîné sur les données historiques combinées.",
      type: "ia",
      score_fiabilite: 78,
      souverainete: "Française (hébergement souverain)",
      frequence_maj: "Prédiction continue",
      couverture: "Zones couvertes par les capteurs",
      url: null,
      criteres: {
        fraicheur: 90,
        couverture_geo: 50,
        souverainete: 95,
        precision: 75,
      },
    },
  ];

  // Score global de fiabilité de la plateforme (moyenne pondérée)
  const scoreGlobal = Math.round(
    sources.reduce((acc, s) => acc + s.score_fiabilite, 0) / sources.length
  );

  return NextResponse.json({
    score_global: scoreGlobal,
    nombre_sources: sources.length,
    sources,
    derniere_verification: new Date().toISOString(),
    methodologie:
      "Les scores sont calculés sur 4 critères : fraîcheur des données, couverture géographique, souveraineté des données et précision vérifiée. Chaque critère est noté de 0 à 100.",
  });
}
