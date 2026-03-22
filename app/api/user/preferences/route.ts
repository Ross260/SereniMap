import { NextRequest, NextResponse } from "next/server";

/**
 * GET & PUT /api/user/preferences
 *
 * Gère les préférences et seuils de tolérance de l'utilisateur.
 * Ces réglages personnalisent l'expérience de navigation :
 *   - Seuil de densité maximum toléré
 *   - Préférence d'itinéraire par défaut
 *   - Alertes activées ou non
 *   - Historique des trajets favoris
 *
 * En production, ces données seraient stockées en base de données
 * et liées à l'ID utilisateur extrait du token JWT.
 */

// Préférences par défaut pour les nouveaux utilisateurs
// IMPORTANT: mode_deplacement est "transport" par défaut comme demandé
const preferencesParDefaut = {
  seuil_densite_max: 5,
  preference_itineraire: "calm" as "calm" | "fastest",
  alertes_activees: true,
  rayon_recherche_metres: 1000,
  mode_deplacement: "transport" as "pieton" | "velo" | "transport", // Transport par défaut
  notifications: {
    alerte_densite: true,
    suggestions_horaires: true,
    points_repli: true,
  },
  accessibilite: {
    contraste_eleve: false,
    taille_texte: "normal" as "petit" | "normal" | "grand",
    animations_reduites: false,
  },
  trajets_favoris: [
    {
      id: "fav_1",
      nom: "Maison - Bureau",
      depart: { lat: 48.8534, lng: 2.3488, adresse: "10 Rue de Rivoli, Paris" },
      arrivee: { lat: 48.8738, lng: 2.295, adresse: "Avenue des Champs-Élysées, Paris" },
      preference: "calm",
    },
    {
      id: "fav_2",
      nom: "Maison - Parc",
      depart: { lat: 48.8534, lng: 2.3488, adresse: "10 Rue de Rivoli, Paris" },
      arrivee: { lat: 48.8462, lng: 2.3372, adresse: "Jardin du Luxembourg, Paris" },
      preference: "calm",
    },
  ],
};

// Stockage en mémoire (remplacer par BDD en production)
const stockagePreferences = new Map<string, typeof preferencesParDefaut>();

/**
 * GET /api/user/preferences
 * Récupère les préférences de l'utilisateur connecté.
 */
export async function GET(request: NextRequest) {
  // En production, on extrairait l'ID utilisateur du token JWT
  const userId = request.headers.get("x-user-id") || "demo_user";

  // Retourner les préférences existantes ou les valeurs par défaut
  const preferences =
    stockagePreferences.get(userId) || { ...preferencesParDefaut };

  return NextResponse.json({
    utilisateur_id: userId,
    preferences,
    derniere_modification: new Date().toISOString(),
  });
}

/**
 * PUT /api/user/preferences
 * Met à jour les préférences de l'utilisateur.
 *
 * Corps de la requête : objet partiel de préférences à fusionner.
 * Seuls les champs envoyés sont mis à jour (fusion avec les existants).
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo_user";
    const body = await request.json();

    // Récupérer les préférences actuelles ou les valeurs par défaut
    const preferencesActuelles =
      stockagePreferences.get(userId) || { ...preferencesParDefaut };

    // Fusion intelligente des préférences (mise à jour partielle)
    const nouvellesPreferences = {
      ...preferencesActuelles,
      ...body,
      // Fusionner les sous-objets séparément pour ne pas les écraser
      notifications: {
        ...preferencesActuelles.notifications,
        ...(body.notifications || {}),
      },
      accessibilite: {
        ...preferencesActuelles.accessibilite,
        ...(body.accessibilite || {}),
      },
      // Conserver les favoris existants si non fournis
      trajets_favoris: body.trajets_favoris || preferencesActuelles.trajets_favoris,
    };

    // Validation du seuil de densité (doit être entre 1 et 10)
    if (
      nouvellesPreferences.seuil_densite_max < 1 ||
      nouvellesPreferences.seuil_densite_max > 10
    ) {
      return NextResponse.json(
        { erreur: "Le seuil de densité doit être entre 1 et 10." },
        { status: 400 }
      );
    }

    // Sauvegarde en mémoire
    stockagePreferences.set(userId, nouvellesPreferences);

    return NextResponse.json({
      message: "Préférences mises à jour avec succès.",
      preferences: nouvellesPreferences,
      derniere_modification: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { erreur: "Le corps de la requête doit être un JSON valide." },
      { status: 400 }
    );
  }
}
