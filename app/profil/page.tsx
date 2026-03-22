import { GestionProfil } from "@/components/profil/gestion-profil";

/**
 * Page Profil & Paramètres (/profil)
 *
 * Permet à l'utilisateur de gérer :
 *   - Ses seuils de tolérance à la foule
 *   - Ses préférences d'itinéraire par défaut
 *   - Son historique de trajets favoris
 *   - Ses paramètres de notifications et d'accessibilité
 */
export default function PageProfil() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Profil & Parametres
          </h1>
          <p className="mt-2 text-muted-foreground">
            Personnalisez votre experience SereniMap. Ajustez vos seuils de
            tolerance et vos preferences pour des suggestions adaptees.
          </p>
        </div>
        <GestionProfil />
      </div>
    </div>
  );
}
