import { AffichageSources } from "@/components/sources/affichage-sources";

/**
 * Page Sources & Fiabilité (/sources)
 *
 * Affiche la transparence des données utilisées par SereniMap :
 *   - Liste des sources de données avec scores de confiance
 *   - Score global de fiabilité de la plateforme (Scoring Data Souverain)
 *   - Méthodologie de notation
 *   - Détails des critères par source
 */
export default function PageSources() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Sources & Fiabilite
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Transparence totale sur les donnees que nous utilisons. Chaque source
            est evaluee et notee pour vous garantir des informations fiables.
          </p>
        </div>
        <AffichageSources />
      </div>
    </div>
  );
}
