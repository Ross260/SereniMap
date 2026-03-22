import { PlanificateurItineraire } from "@/components/itineraire/planificateur-itineraire";

/**
 * Page Itinéraire & Détails (/itineraire)
 *
 * Permet à l'utilisateur de :
 *   - Saisir un point de départ et une destination
 *   - Comparer deux itinéraires (rapide vs calme)
 *   - Voir les graphiques de prédiction d'affluence par heure
 *   - Consulter la jauge de sécurité/confort social
 */
export default function PageItineraire() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* En-tête de la page */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Planifier un itineraire
          </h1>
          <p className="mt-2 text-muted-foreground">
            Comparez le trajet le plus rapide avec le plus calme et consultez les
            previsions d'affluence pour choisir le meilleur moment.
          </p>
        </div>
        <PlanificateurItineraire />
      </div>
    </div>
  );
}
