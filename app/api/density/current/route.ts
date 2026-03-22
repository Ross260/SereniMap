import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/density/current
 *
 * Récupère la densité actuelle pour une zone donnée.
 * Paramètres (query) :
 *   - lat : latitude du centre de la zone
 *   - lng : longitude du centre de la zone
 *   - rayon : rayon de recherche en mètres (défaut: 1000)
 *
 * Retourne un GeoJSON FeatureCollection contenant des polygones
 * avec un score de densité (0-10) que le frontend utilisera
 * pour colorier la heatmap sur la carte Leaflet.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Récupération des coordonnées GPS depuis les paramètres de requête
  const lat = parseFloat(searchParams.get("lat") || "48.8566");
  const lng = parseFloat(searchParams.get("lng") || "2.3522");
  const rayon = parseInt(searchParams.get("rayon") || "1000", 10);

  // Validation des paramètres d'entrée
  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { erreur: "Les coordonnées lat/lng sont invalides." },
      { status: 400 }
    );
  }

  /**
   * Génération de zones de densité simulées autour du point central.
   * En production, ces données proviendraient de capteurs de flux piétons,
   * d'APIs de trafic (Google, TomTom) et de données OpenData.
   *
   * Chaque zone est un polygone GeoJSON avec une propriété density_score.
   */
  const zones = genererZonesDensite(lat, lng, rayon);

  // Format GeoJSON standard, compris nativement par Leaflet et Mapbox
  const geojson = {
    type: "FeatureCollection" as const,
    features: zones,
    metadata: {
      timestamp: new Date().toISOString(),
      centre: { lat, lng },
      rayon_metres: rayon,
      description: "Densité de population en temps réel (simulation)",
    },
  };

  return NextResponse.json(geojson);
}

/**
 * Génère des zones de densité fictives autour d'un point central.
 * Chaque zone est un carré (polygone) avec un score de densité aléatoire.
 *
 * @param latCentre - Latitude du centre
 * @param lngCentre - Longitude du centre
 * @param rayon - Rayon de couverture en mètres
 * @returns Un tableau de Features GeoJSON
 */
function genererZonesDensite(
  latCentre: number,
  lngCentre: number,
  rayon: number
) {
  const zones = [];
  // Décalage en degrés approximatif pour créer une grille
  const pas = (rayon / 111000) * 0.3;
  const grille = 5; // Grille 5x5 de zones

  for (let i = -Math.floor(grille / 2); i <= Math.floor(grille / 2); i++) {
    for (let j = -Math.floor(grille / 2); j <= Math.floor(grille / 2); j++) {
      const centreZoneLat = latCentre + i * pas;
      const centreZoneLng = lngCentre + j * pas;
      const demiPas = pas / 2;

      // Score de densité : les zones centrales sont plus denses
      const distanceDuCentre = Math.sqrt(i * i + j * j);
      const facteurDistance = Math.max(0, 1 - distanceDuCentre / (grille / 2));
      const scoreAleatoire = Math.random() * 4;
      const scoreDensite = Math.min(
        10,
        Math.round((facteurDistance * 6 + scoreAleatoire) * 10) / 10
      );

      // Détermination du niveau de confort basé sur le score
      let niveau: string;
      if (scoreDensite <= 3) niveau = "calme";
      else if (scoreDensite <= 5) niveau = "modere";
      else if (scoreDensite <= 7) niveau = "dense";
      else niveau = "tres_dense";

      zones.push({
        type: "Feature" as const,
        geometry: {
          type: "Polygon" as const,
          coordinates: [
            [
              [centreZoneLng - demiPas, centreZoneLat - demiPas],
              [centreZoneLng + demiPas, centreZoneLat - demiPas],
              [centreZoneLng + demiPas, centreZoneLat + demiPas],
              [centreZoneLng - demiPas, centreZoneLat + demiPas],
              [centreZoneLng - demiPas, centreZoneLat - demiPas],
            ],
          ],
        },
        properties: {
          density_score: scoreDensite,
          niveau,
          nom_zone: `Zone ${i + Math.floor(grille / 2)}-${j + Math.floor(grille / 2)}`,
          estimation_personnes: Math.round(scoreDensite * 15),
        },
      });
    }
  }

  return zones;
}
