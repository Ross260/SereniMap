import { CarteInteractive } from "@/components/carte/carte-interactive";

/**
 * Page Carte (/carte)
 *
 * Page principale de cartographie interactive.
 * Affiche une carte Leaflet avec :
 *   - Heatmap de densité (zones colorées selon l'affluence)
 *   - Barre de recherche de destination
 *   - Filtres de niveau de calme
 *   - Géolocalisation de l'utilisateur
 *   - Points de repli (parcs, zones calmes)
 */
export default function PageCarte() {
  return (
    <div className="flex h-[calc(100vh-60px)] flex-col">
      <CarteInteractive />
    </div>
  );
}
