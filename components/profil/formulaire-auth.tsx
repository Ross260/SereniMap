"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Shield,
  Heart,
} from "lucide-react";

/**
 * Types pour les données utilisateur.
 */
interface Utilisateur {
  id: string;
  email: string;
  nom: string;
}

/**
 * Props du composant FormulaireAuth.
 * @param onConnexion - Callback appelee apres une connexion/inscription reussie
 */
interface PropsFormulaireAuth {
  onConnexion: (utilisateur: Utilisateur, token: string) => void;
}

/**
 * Composant FormulaireAuth
 *
 * Formulaire de connexion et d'inscription pour SereniMap.
 * Utilise l'API /api/auth/register-login pour l'authentification.
 * Design apaisant adapte aux personnes avec anxiete sociale.
 */
export function FormulaireAuth({ onConnexion }: PropsFormulaireAuth) {
  // Onglet actif : connexion ou inscription
  const [onglet, setOnglet] = useState<"connexion" | "inscription">(
    "connexion",
  );

  // Champs du formulaire
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState("");
  const [nom, setNom] = useState("");

  // Etats de chargement et erreurs
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  /**
   * Valide les champs du formulaire avant soumission.
   * @returns true si le formulaire est valide, false sinon
   */
  const validerFormulaire = (): boolean => {
    setErreur("");

    // Validation de l'email
    if (!email.trim()) {
      setErreur("Veuillez entrer votre adresse email.");
      return false;
    }
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      setErreur("L'adresse email n'est pas valide.");
      return false;
    }

    // Validation du mot de passe
    if (!motDePasse) {
      setErreur("Veuillez entrer un mot de passe.");
      return false;
    }
    if (motDePasse.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caracteres.");
      return false;
    }

    // Validations specifiques a l'inscription
    if (onglet === "inscription") {
      if (!nom.trim()) {
        setErreur("Veuillez entrer votre nom.");
        return false;
      }
      if (motDePasse !== confirmationMotDePasse) {
        setErreur("Les mots de passe ne correspondent pas.");
        return false;
      }
    }

    return true;
  };

  /**
   * Soumet le formulaire de connexion ou d'inscription.
   */
  const soumettreFormulaire = async () => {
    if (!validerFormulaire()) return;

    setChargement(true);
    setErreur("");
    setSucces("");

    try {
      const reponse = await fetch("/api/auth/register-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: onglet === "connexion" ? "login" : "register",
          email: email.trim().toLowerCase(),
          mot_de_passe: motDePasse,
          nom: nom.trim(),
        }),
      });

      const data = await reponse.json();

      if (!reponse.ok) {
        setErreur(data.erreur || "Une erreur est survenue.");
        return;
      }

      // Succes : stocker le token et appeler le callback
      setSucces(data.message);

      // Petit delai pour afficher le message de succes
      setTimeout(() => {
        onConnexion(data.utilisateur, data.token);
      }, 1000);
    } catch {
      setErreur("Impossible de contacter le serveur. Veuillez reessayer.");
    } finally {
      setChargement(false);
    }
  };

  /**
   * Reinitialise les champs lors du changement d'onglet.
   */
  const changerOnglet = (nouvelOnglet: "connexion" | "inscription") => {
    setOnglet(nouvelOnglet);
    setErreur("");
    setSucces("");
    // Garder l'email mais reinitialiser le reste
    setMotDePasse("");
    setConfirmationMotDePasse("");
    if (nouvelOnglet === "connexion") {
      setNom("");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* En-tete de bienvenue */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-md">
          <MapPin className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Bienvenue sur SereniMap
        </h2>
        <p className="mt-2 text-muted-foreground">
          Connectez-vous pour sauvegarder vos preferences et acceder a vos
          trajets favoris.
        </p>
      </div>

      {/* Avantages d'avoir un compte */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icone: Shield,
            titre: "Preferences sauvegardees",
            description: "Vos seuils et parametres synchronises",
          },
          {
            icone: Heart,
            titre: "Trajets favoris",
            description: "Retrouvez vos itineraires preferes",
          },
          {
            icone: User,
            titre: "Experience personnalisee",
            description: "Suggestions adaptees a votre profil",
          },
        ].map((avantage) => (
          <div
            key={avantage.titre}
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <avantage.icone className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-card-foreground">
              {avantage.titre}
            </p>
            <p className="text-xs text-muted-foreground">
              {avantage.description}
            </p>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      <Card>
        <CardHeader className="pb-4">
          <Tabs
            value={onglet}
            onValueChange={(val) =>
              changerOnglet(val as "connexion" | "inscription")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connexion">Connexion</TabsTrigger>
              <TabsTrigger value="inscription">Creer un compte</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {/* Message d'erreur */}
          {erreur && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{erreur}</span>
            </div>
          )}

          {/* Message de succes */}
          {succes && (
            <div className="flex items-center gap-2 rounded-lg bg-calm/10 px-4 py-3 text-sm text-calm">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{succes}</span>
            </div>
          )}

          {/* Champ Nom (inscription uniquement) */}
          {onglet === "inscription" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="nom">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="nom"
                  type="text"
                  placeholder="Jean Dupont"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="pl-10"
                  disabled={chargement}
                />
              </div>
            </div>
          )}

          {/* Champ Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Adresse email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={chargement}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="mot_de_passe">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="mot_de_passe"
                type="password"
                placeholder="••••••••"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="pl-10"
                disabled={chargement}
                autoComplete={
                  onglet === "connexion" ? "current-password" : "new-password"
                }
              />
            </div>
            {onglet === "inscription" && (
              <p className="text-xs text-muted-foreground">
                Au moins 6 caracteres
              </p>
            )}
          </div>

          {/* Confirmation mot de passe (inscription uniquement) */}
          {onglet === "inscription" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmation_mdp">
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmation_mdp"
                  type="password"
                  placeholder="••••••••"
                  value={confirmationMotDePasse}
                  onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                  className="pl-10"
                  disabled={chargement}
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {/* Bouton de soumission */}
          <Button
            size="lg"
            onClick={soumettreFormulaire}
            disabled={chargement}
            className="mt-2 gap-2"
          >
            {chargement ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {onglet === "connexion"
                  ? "Connexion en cours..."
                  : "Creation du compte..."}
              </>
            ) : onglet === "connexion" ? (
              "Se connecter"
            ) : (
              "Creer mon compte"
            )}
          </Button>

          {/* Lien vers l'autre action */}
          <p className="text-center text-sm text-muted-foreground">
            {onglet === "connexion" ? (
              <>
                Pas encore de compte ?{" "}
                <button
                  type="button"
                  onClick={() => changerOnglet("inscription")}
                  className="font-medium text-primary hover:underline"
                >
                  Creez-en un
                </button>
              </>
            ) : (
              <>
                Deja un compte ?{" "}
                <button
                  type="button"
                  onClick={() => changerOnglet("connexion")}
                  className="font-medium text-primary hover:underline"
                >
                  Connectez-vous
                </button>
              </>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Message rassurant */}
      <p className="text-center text-xs text-muted-foreground">
        Vos donnees sont securisees et ne seront jamais partagees. SereniMap
        respecte votre vie privee.
      </p>
    </div>
  );
}
