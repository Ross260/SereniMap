"use client";

import { useState, useEffect } from "react";
import { GestionProfil } from "@/components/profil/gestion-profil";
import { FormulaireAuth } from "@/components/profil/formulaire-auth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

/**
 * Interface pour les donnees utilisateur connecte.
 */
interface Utilisateur {
  id: string;
  email: string;
  nom: string;
}

/**
 * Page Profil & Parametres (/profil)
 *
 * Gere l'authentification et l'affichage conditionnel :
 *   - Si non connecte : affiche le formulaire de connexion/inscription
 *   - Si connecte : affiche les preferences et parametres utilisateur
 *
 * Le token et les infos utilisateur sont stockes en localStorage
 * pour persister la session entre les rechargements de page.
 */
export default function PageProfil() {
  // Etat de l'utilisateur connecte (null si non connecte)
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  // Etat de chargement initial (verification du token)
  const [chargementInitial, setChargementInitial] = useState(true);

  /**
   * Verification du token stocke au chargement de la page.
   * Permet de restaurer la session si l'utilisateur etait deja connecte.
   */
  useEffect(() => {
    const verifierSession = () => {
      try {
        const tokenStocke = localStorage.getItem("serenimap_token");
        const utilisateurStocke = localStorage.getItem("serenimap_utilisateur");

        if (tokenStocke && utilisateurStocke) {
          // Decoder le token pour verifier son expiration
          const payload = JSON.parse(atob(tokenStocke));

          // Verifier si le token n'est pas expire
          if (payload.exp && payload.exp > Date.now()) {
            setUtilisateur(JSON.parse(utilisateurStocke));
          } else {
            // Token expire : nettoyer le stockage
            localStorage.removeItem("serenimap_token");
            localStorage.removeItem("serenimap_utilisateur");
          }
        }
      } catch {
        // En cas d'erreur de parsing, nettoyer le stockage
        localStorage.removeItem("serenimap_token");
        localStorage.removeItem("serenimap_utilisateur");
      } finally {
        setChargementInitial(false);
      }
    };

    verifierSession();
  }, []);

  /**
   * Callback appelee apres une connexion/inscription reussie.
   * Stocke le token et les infos utilisateur.
   */
  const gererConnexion = (utilisateurConnecte: Utilisateur, token: string) => {
    // Stocker en localStorage pour persister la session
    localStorage.setItem("serenimap_token", token);
    localStorage.setItem(
      "serenimap_utilisateur",
      JSON.stringify(utilisateurConnecte),
    );

    // Mettre a jour l'etat
    setUtilisateur(utilisateurConnecte);
  };

  /**
   * Deconnexion de l'utilisateur.
   * Supprime le token et les infos du localStorage.
   */
  const gererDeconnexion = () => {
    localStorage.removeItem("serenimap_token");
    localStorage.removeItem("serenimap_utilisateur");
    setUtilisateur(null);
  };

  // Affichage pendant le chargement initial
  if (chargementInitial) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* === UTILISATEUR NON CONNECTE === */}
        {!utilisateur && (
          <>
            {/* En-tete */}
            <div className="mb-8 text-center">
              <h1 className="font-heading text-3xl font-bold text-foreground">
                Mon compte
              </h1>
              <p className="mt-2 text-muted-foreground">
                Connectez-vous ou creez un compte pour personnaliser votre
                experience.
              </p>
            </div>

            {/* Formulaire d'authentification */}
            <FormulaireAuth onConnexion={gererConnexion} />
          </>
        )}

        {/* === UTILISATEUR CONNECTE === */}
        {utilisateur && (
          <>
            {/* En-tete avec infos utilisateur */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-heading text-3xl font-bold text-foreground">
                  Profil & Parametres
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Personnalisez votre experience SereniMap. Ajustez vos seuils
                  de tolerance et vos preferences pour des suggestions adaptees.
                </p>
              </div>

              {/* Badge utilisateur et bouton deconnexion */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-card-foreground">
                      {utilisateur.nom}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {utilisateur.email}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={gererDeconnexion}
                  aria-label="Se deconnecter"
                  title="Se deconnecter"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Gestion du profil */}
            <GestionProfil />
          </>
        )}
      </div>
    </div>
  );
}
