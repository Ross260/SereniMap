import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/register-login
 *
 * Gère l'inscription et la connexion des utilisateurs.
 * Utilise un système JWT simplifié pour la démonstration.
 *
 * Corps de la requête (JSON) :
 *   - action : "register" | "login"
 *   - email : adresse email de l'utilisateur
 *   - mot_de_passe : mot de passe de l'utilisateur
 *   - nom : (uniquement pour l'inscription) nom d'affichage
 *
 * En production, il faudrait :
 *   - Hasher les mots de passe avec bcrypt
 *   - Stocker les utilisateurs en base de données (PostgreSQL / Supabase)
 *   - Générer de vrais JWT signés avec une clé secrète
 *   - Implémenter des cookies HTTP-only sécurisés
 */

// Stockage en mémoire pour la démonstration (remplacer par une BDD en production)
const utilisateurs: Map<
  string,
  { email: string; nom: string; mot_de_passe: string; id: string }
> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, mot_de_passe, nom } = body;

    // Validation de l'action
    if (!action || !["register", "login"].includes(action)) {
      return NextResponse.json(
        { erreur: 'L\'action doit être "register" ou "login".' },
        { status: 400 }
      );
    }

    // Validation de l'email et du mot de passe
    if (!email || !mot_de_passe) {
      return NextResponse.json(
        { erreur: "L'email et le mot de passe sont requis." },
        { status: 400 }
      );
    }

    // === INSCRIPTION ===
    if (action === "register") {
      // Vérifier si l'utilisateur existe déjà
      if (utilisateurs.has(email)) {
        return NextResponse.json(
          { erreur: "Un compte avec cet email existe déjà." },
          { status: 409 }
        );
      }

      // Création du nouvel utilisateur
      const nouvelUtilisateur = {
        id: `user_${Date.now()}`,
        email,
        nom: nom || "Utilisateur",
        // NOTE: En production, TOUJOURS hasher avec bcrypt !
        mot_de_passe,
      };

      utilisateurs.set(email, nouvelUtilisateur);

      // Génération d'un token JWT simulé
      const token = genererTokenSimule(nouvelUtilisateur.id, email);

      return NextResponse.json({
        message: "Inscription réussie ! Bienvenue sur SereniMap.",
        utilisateur: {
          id: nouvelUtilisateur.id,
          email: nouvelUtilisateur.email,
          nom: nouvelUtilisateur.nom,
        },
        token,
      });
    }

    // === CONNEXION ===
    if (action === "login") {
      const utilisateur = utilisateurs.get(email);

      // Vérification de l'existence de l'utilisateur
      if (!utilisateur) {
        return NextResponse.json(
          { erreur: "Aucun compte trouvé avec cet email." },
          { status: 404 }
        );
      }

      // Vérification du mot de passe (en production : bcrypt.compare)
      if (utilisateur.mot_de_passe !== mot_de_passe) {
        return NextResponse.json(
          { erreur: "Mot de passe incorrect." },
          { status: 401 }
        );
      }

      const token = genererTokenSimule(utilisateur.id, email);

      return NextResponse.json({
        message: "Connexion réussie !",
        utilisateur: {
          id: utilisateur.id,
          email: utilisateur.email,
          nom: utilisateur.nom,
        },
        token,
      });
    }
  } catch {
    return NextResponse.json(
      { erreur: "Le corps de la requête doit être un JSON valide." },
      { status: 400 }
    );
  }
}

/**
 * Génère un token JWT simulé pour la démonstration.
 * En production, utiliser la bibliothèque `jsonwebtoken` avec une clé secrète.
 *
 * @param userId - Identifiant unique de l'utilisateur
 * @param email - Email de l'utilisateur
 * @returns Token encodé en base64
 */
function genererTokenSimule(userId: string, email: string): string {
  const payload = {
    sub: userId,
    email,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // Expire dans 24h
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}
