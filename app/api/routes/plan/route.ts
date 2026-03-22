import { NextRequest, NextResponse } from "next/server";

/**
 * Type pour le mode de déplacement.
 */
type ModeDeplacement = "pieton" | "velo" | "transport";

/**
 * POST /api/routes/plan
 *
 * Calcule un itinéraire entre un point A et un point B.
 * Le backend compare plusieurs chemins et renvoie les coordonnées
 * du tracé le plus adapté selon la préférence de l'utilisateur.
 *
 * Corps de la requête (JSON) :
 *   - start : { lat: number, lng: number } - Point de départ
 *   - end   : { lat: number, lng: number } - Destination
 *   - preference : "calm" | "fastest" - Type d'itinéraire souhaité
 *   - mode : "pieton" | "velo" | "transport" - Mode de déplacement
 *
 * Retourne deux itinéraires : le plus rapide et le plus calme,
 * chacun avec ses coordonnées GPS, durée, distance et score de confort.
 * L'itinéraire s'adapte au mode de déplacement sélectionné.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { start, end, preference, mode = "transport" } = body;

    // Validation des paramètres d'entrée
    if (!start?.lat || !start?.lng || !end?.lat || !end?.lng) {
      return NextResponse.json(
        { erreur: "Les points de départ (start) et d'arrivée (end) avec lat/lng sont requis." },
        { status: 400 }
      );
    }

    if (preference && !["calm", "fastest"].includes(preference)) {
      return NextResponse.json(
        { erreur: 'La préférence doit être "calm" ou "fastest".' },
        { status: 400 }
      );
    }

    /**
     * Calcul des deux itinéraires.
     * En production, le calcul utiliserait l'API OSRM (Open Source Routing Machine)
     * ou GraphHopper, enrichi de données de densité piétonne en temps réel.
     *
     * L'itinéraire "calm" évite les artères principales et zones de forte affluence.
     * L'itinéraire "fastest" suit le chemin le plus court classique.
     *
     * Le mode de déplacement affecte :
     *   - "pieton" : vitesse 4-5 km/h, accès aux rues piétonnes et parcs
     *   - "velo" : vitesse 15-20 km/h, pistes cyclables privilégiées
     *   - "transport" : lignes de métro/bus/RER, temps incluant les correspondances
     */
    const modeValide: ModeDeplacement = ["pieton", "velo", "transport"].includes(mode) 
      ? mode 
      : "transport";
    
    const itineraireRapide = calculerItineraire(start, end, "fastest", modeValide);
    const itineraireCalme = calculerItineraire(start, end, "calm", modeValide);

    return NextResponse.json({
      recommandation: preference || "calm",
      mode_deplacement: modeValide,
      itineraires: {
        rapide: itineraireRapide,
        calme: itineraireCalme,
      },
      comparaison: {
        difference_duree_minutes: itineraireCalme.duree_minutes - itineraireRapide.duree_minutes,
        difference_confort: itineraireCalme.score_confort - itineraireRapide.score_confort,
        conseil:
          itineraireCalme.score_confort > 70
            ? "L'itinéraire calme est fortement recommandé : peu de monde sur le trajet."
            : "L'itinéraire calme est un bon compromis entre rapidité et tranquillité.",
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { erreur: "Le corps de la requête doit être un JSON valide." },
      { status: 400 }
    );
  }
}

/**
 * Simule le calcul d'un itinéraire entre deux points.
 * Génère des points intermédiaires réalistes entre le départ et l'arrivée.
 *
 * @param start - Coordonnées du point de départ
 * @param end - Coordonnées du point d'arrivée
 * @param type - Type d'itinéraire ("calm" ou "fastest")
 * @param mode - Mode de déplacement ("pieton", "velo", "transport")
 * @returns Objet contenant les coordonnées du tracé et les métadonnées
 */
function calculerItineraire(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  type: "calm" | "fastest",
  mode: ModeDeplacement
) {
  // Nombre de points intermédiaires pour dessiner le tracé
  const nbPoints = type === "calm" ? 12 : 8;

  // Distance approximative en km (formule simplifiée)
  const distanceLat = end.lat - start.lat;
  const distanceLng = end.lng - start.lng;
  const distanceKm =
    Math.sqrt(distanceLat ** 2 + distanceLng ** 2) * 111;

  // L'itinéraire calme est 20-30% plus long (détours par rues secondaires)
  const facteurDetour = type === "calm" ? 1.25 : 1.0;
  const distanceFinale = Math.round(distanceKm * facteurDetour * 100) / 100;

  /**
   * Vitesse moyenne selon le mode de déplacement :
   *   - pieton : 4-5 km/h (plus lent si calme pour éviter les foules)
   *   - velo : 15-20 km/h (pistes cyclables ou voies partagées)
   *   - transport : équivalent 25-35 km/h (métro rapide mais temps de correspondance)
   */
  let vitesseMoyenne: number;
  switch (mode) {
    case "velo":
      vitesseMoyenne = type === "calm" ? 15 : 18;
      break;
    case "transport":
      // Le transport est rapide mais inclut temps d'attente et correspondances
      vitesseMoyenne = type === "calm" ? 20 : 28;
      break;
    case "pieton":
    default:
      vitesseMoyenne = type === "calm" ? 4.2 : 4.8;
      break;
  }
  
  const dureeMinutes = Math.round((distanceFinale / vitesseMoyenne) * 60);

  // Score de confort (l'itinéraire calme privilégie les zones peu denses)
  const scoreConfort = type === "calm"
    ? Math.round(70 + Math.random() * 25)
    : Math.round(30 + Math.random() * 30);

  // Génération des points du tracé avec des déviations réalistes
  const coordonnees = [];
  for (let i = 0; i <= nbPoints; i++) {
    const ratio = i / nbPoints;
    // Déviation latérale pour simuler un vrai chemin (pas une ligne droite)
    const deviationMax = type === "calm" ? 0.003 : 0.001;
    const deviation =
      i > 0 && i < nbPoints
        ? (Math.random() - 0.5) * deviationMax
        : 0;

    coordonnees.push({
      lat: start.lat + distanceLat * ratio + deviation,
      lng: start.lng + distanceLng * ratio + deviation * 0.8,
    });
  }

  // Zones traversées avec leur niveau de densité
  const zonesTraversees = coordonnees.slice(1, -1).map((point, index) => ({
    position: point,
    densite: type === "calm"
      ? Math.round(Math.random() * 4)
      : Math.round(3 + Math.random() * 7),
    nom: `Section ${index + 1}`,
  }));

  return {
    type,
    mode,
    label: type === "calm" ? "Itinéraire calme" : "Itinéraire rapide",
    coordonnees,
    distance_km: distanceFinale,
    duree_minutes: dureeMinutes,
    score_confort: scoreConfort,
    zones_traversees: zonesTraversees,
    // Points de repli : endroits calmes le long du trajet pour "souffler"
    points_repli: type === "calm"
      ? [
          {
            nom: "Parc municipal",
            position: coordonnees[Math.floor(nbPoints / 3)],
            type: "parc",
          },
          {
            nom: "Rue piétonne calme",
            position: coordonnees[Math.floor((nbPoints * 2) / 3)],
            type: "rue_calme",
          },
        ]
      : [],
  };
}
