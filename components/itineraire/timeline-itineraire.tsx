"use client";

import {
  MapPin,
  Train,
  Bus,
  Footprints,
  Bike,
  ArrowDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Type pour le mode de déplacement.
 */
type ModeDeplacement = "pieton" | "velo" | "transport";

/**
 * Interface pour les propriétés du composant TimelineItineraire.
 */
interface PropsTimelineItineraire {
  /** Données de l'itinéraire (calme ou rapide) */
  itineraire: Record<string, unknown>;
  /** Mode de déplacement sélectionné par l'utilisateur */
  mode: ModeDeplacement;
  /** Adresse de départ */
  depart: string;
  /** Adresse d'arrivée */
  arrivee: string;
}

/**
 * Type pour représenter une étape de la timeline.
 */
interface EtapeTimeline {
  type: "depart" | "correspondance" | "arret" | "marche" | "velo" | "arrivee";
  nom: string;
  ligne?: string;
  direction?: string;
  duree_minutes: number;
  densite?: number;
  conseil?: string;
}

/**
 * Composant TimelineItineraire
 *
 * Affiche une timeline verticale avec les arrêts et correspondances
 * de l'itinéraire. S'adapte au mode de déplacement :
 *   - Transport : affiche les lignes de métro/bus/RER avec correspondances
 *   - Vélo : affiche les pistes cyclables et points de passage
 *   - Piéton : affiche les sections de marche avec densité
 *
 * Utilise une approche simulée car les API SNCF/RATP sont complexes.
 * En production, on intégrerait l'API Navitia ou RATP pour des données réelles.
 */
export function TimelineItineraire({
  itineraire,
  mode,
  depart,
  arrivee,
}: PropsTimelineItineraire) {
  // Générer les étapes selon le mode de déplacement
  const etapes = genererEtapes(itineraire, mode, depart, arrivee);
  const dureeEstimee = itineraire.duree_minutes as number;

  return (
    <div className="flex flex-col gap-0">
      {/* En-tête avec durée totale */}
      <div className="mb-4 flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Duree estimee
        </div>
        <span className="text-lg font-semibold text-foreground">
          {dureeEstimee} min
        </span>
      </div>

      {/* Timeline des étapes */}
      <div className="relative flex flex-col">
        {etapes.map((etape, index) => (
          <EtapeComponent
            key={index}
            etape={etape}
            mode={mode}
            estDerniere={index === etapes.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Composant pour afficher une étape individuelle de la timeline.
 */
function EtapeComponent({
  etape,
  mode,
  estDerniere,
}: {
  etape: EtapeTimeline;
  mode: ModeDeplacement;
  estDerniere: boolean;
}) {
  // Couleur et icône selon le type d'étape
  const config = getConfigEtape(etape, mode);

  return (
    <div className="relative flex gap-4">
      {/* Ligne verticale de connexion */}
      {!estDerniere && (
        <div className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5 bg-border" />
      )}

      {/* Icône de l'étape */}
      <div
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}
      >
        <config.icon className={`h-4 w-4 ${config.iconColor}`} />
      </div>

      {/* Contenu de l'étape */}
      <div className={`flex flex-1 flex-col pb-6 ${estDerniere ? "pb-0" : ""}`}>
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">{etape.nom}</p>
          {etape.ligne && (
            <Badge
              variant="outline"
              className={`w-fit text-xs ${getLigneColor(etape.ligne)}`}
            >
              {etape.ligne}
            </Badge>
          )}
          {etape.direction && (
            <p className="text-xs text-muted-foreground">
              Direction : {etape.direction}
            </p>
          )}
        </div>

        {/* Indicateur de densité si disponible */}
        {etape.densite !== undefined && (
          <div className="mt-2 flex items-center gap-2">
            {etape.densite <= 3 ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-calm" />
            ) : etape.densite <= 6 ? (
              <AlertTriangle className="h-3.5 w-3.5 text-moderate" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-dense" />
            )}
            <span className="text-xs text-muted-foreground">
              Densite : {etape.densite}/10
            </span>
          </div>
        )}

        {/* Conseil si disponible */}
        {etape.conseil && (
          <p className="mt-1.5 text-xs italic text-muted-foreground">
            {etape.conseil}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Retourne la configuration visuelle pour un type d'étape.
 */
function getConfigEtape(etape: EtapeTimeline, mode: ModeDeplacement) {
  const configs: Record<string, { icon: typeof MapPin; bgColor: string; iconColor: string }> = {
    depart: {
      icon: MapPin,
      bgColor: "bg-primary",
      iconColor: "text-primary-foreground",
    },
    arrivee: {
      icon: MapPin,
      bgColor: "bg-accent",
      iconColor: "text-accent-foreground",
    },
    correspondance: {
      icon: ArrowDown,
      bgColor: "bg-secondary",
      iconColor: "text-secondary-foreground",
    },
    arret: {
      icon: mode === "transport" ? Train : mode === "velo" ? Bike : Footprints,
      bgColor: "bg-secondary",
      iconColor: "text-secondary-foreground",
    },
    marche: {
      icon: Footprints,
      bgColor: "bg-calm/20",
      iconColor: "text-calm",
    },
    velo: {
      icon: Bike,
      bgColor: "bg-primary/20",
      iconColor: "text-primary",
    },
  };

  return configs[etape.type] || configs.arret;
}

/**
 * Retourne la couleur CSS pour une ligne de transport.
 * Simule les couleurs officielles des lignes parisiennes.
 */
function getLigneColor(ligne: string): string {
  const couleurs: Record<string, string> = {
    "Metro 1": "border-yellow-500 bg-yellow-50 text-yellow-700",
    "Metro 4": "border-purple-500 bg-purple-50 text-purple-700",
    "Metro 6": "border-green-600 bg-green-50 text-green-700",
    "Metro 7": "border-pink-500 bg-pink-50 text-pink-700",
    "Metro 12": "border-green-500 bg-green-50 text-green-700",
    "Metro 14": "border-violet-600 bg-violet-50 text-violet-700",
    "RER B": "border-blue-500 bg-blue-50 text-blue-700",
    "RER A": "border-red-500 bg-red-50 text-red-700",
    "Bus 38": "border-teal-500 bg-teal-50 text-teal-700",
    "Bus 72": "border-orange-500 bg-orange-50 text-orange-700",
    "Tram T3a": "border-amber-500 bg-amber-50 text-amber-700",
  };

  return couleurs[ligne] || "border-gray-400 bg-gray-50 text-gray-600";
}

/**
 * Génère les étapes de la timeline selon le mode de déplacement.
 * En production, ces données viendraient d'une API de transport (Navitia, RATP, SNCF).
 */
function genererEtapes(
  itineraire: Record<string, unknown>,
  mode: ModeDeplacement,
  depart: string,
  arrivee: string
): EtapeTimeline[] {
  const etapes: EtapeTimeline[] = [];
  const dureeTotal = (itineraire.duree_minutes as number) || 25;
  const zonesTraversees = (itineraire.zones_traversees as Array<{ densite: number }>) || [];
  const isCalm = itineraire.type === "calm";

  // Étape de départ
  etapes.push({
    type: "depart",
    nom: depart.split(",")[0] || "Point de depart",
    duree_minutes: 0,
  });

  if (mode === "transport") {
    // Mode transport en commun : simuler des correspondances
    const lignes = isCalm
      ? [
          { ligne: "Metro 12", direction: "Mairie d'Issy", duree: 8, densite: 3 },
          { ligne: "Metro 4", direction: "Porte de Clignancourt", duree: 6, densite: 4 },
          { ligne: "Bus 38", direction: "Gare du Nord", duree: 5, densite: 2 },
        ]
      : [
          { ligne: "Metro 4", direction: "Porte de Clignancourt", duree: 10, densite: 7 },
          { ligne: "Metro 7", direction: "La Courneuve", duree: 8, densite: 6 },
        ];

    lignes.forEach((l, index) => {
      // Ajouter une marche courte avant la première station
      if (index === 0) {
        etapes.push({
          type: "marche",
          nom: "Marche vers la station",
          duree_minutes: 3,
          densite: zonesTraversees[0]?.densite || 2,
          conseil: isCalm ? "Rue calme, peu de passage." : undefined,
        });
      }

      // Ajouter l'arrêt de transport
      etapes.push({
        type: "arret",
        nom: `Station ${getLigneStationName(l.ligne)}`,
        ligne: l.ligne,
        direction: l.direction,
        duree_minutes: l.duree,
        densite: l.densite,
        conseil: l.densite <= 4 ? "Affluence faible, places assises disponibles." : "Affluence moyenne, restez pres des portes si besoin.",
      });

      // Ajouter une correspondance entre les lignes
      if (index < lignes.length - 1) {
        etapes.push({
          type: "correspondance",
          nom: "Correspondance",
          duree_minutes: 4,
          densite: isCalm ? 3 : 5,
          conseil: isCalm ? "Couloir peu frequente." : "Couloir principal, un peu plus de monde.",
        });
      }
    });

    // Marche finale vers la destination
    etapes.push({
      type: "marche",
      nom: "Marche vers la destination",
      duree_minutes: 4,
      densite: zonesTraversees[zonesTraversees.length - 1]?.densite || 2,
    });
  } else if (mode === "velo") {
    // Mode vélo : pistes cyclables et points de passage
    const segments = isCalm
      ? [
          { nom: "Piste cyclable quai de Seine", duree: 7, densite: 2 },
          { nom: "Voie verte Bassin de la Villette", duree: 8, densite: 1 },
          { nom: "Rue pietonne (velo autorise)", duree: 5, densite: 3 },
        ]
      : [
          { nom: "Boulevard principal", duree: 10, densite: 6 },
          { nom: "Avenue centrale", duree: 8, densite: 5 },
        ];

    segments.forEach((s) => {
      etapes.push({
        type: "velo",
        nom: s.nom,
        duree_minutes: s.duree,
        densite: s.densite,
        conseil: s.densite <= 3 ? "Voie securisee, peu de pietons." : undefined,
      });
    });
  } else {
    // Mode piéton : sections de marche avec densité
    const sections = isCalm
      ? [
          { nom: "Rue pietonne calme", duree: 6, densite: 2 },
          { nom: "Passage par le parc", duree: 8, densite: 1 },
          { nom: "Petite rue residentielle", duree: 7, densite: 2 },
          { nom: "Square vert", duree: 4, densite: 1 },
        ]
      : [
          { nom: "Avenue principale", duree: 8, densite: 6 },
          { nom: "Boulevard anime", duree: 10, densite: 7 },
          { nom: "Place centrale", duree: 5, densite: 8 },
        ];

    sections.forEach((s, index) => {
      etapes.push({
        type: "marche",
        nom: s.nom,
        duree_minutes: s.duree,
        densite: s.densite,
        conseil:
          isCalm && index === 1
            ? "Point de repli : bancs et espace vert disponibles."
            : s.densite >= 6
              ? "Zone animee, eviter aux heures de pointe."
              : undefined,
      });
    });
  }

  // Étape d'arrivée
  etapes.push({
    type: "arrivee",
    nom: arrivee.split(",")[0] || "Destination",
    duree_minutes: 0,
    conseil: "Vous etes arrive a destination !",
  });

  return etapes;
}

/**
 * Génère un nom de station basé sur la ligne.
 * Simule des noms de stations parisiennes réalistes.
 */
function getLigneStationName(ligne: string): string {
  const stations: Record<string, string> = {
    "Metro 1": "Chatelet",
    "Metro 4": "Gare du Nord",
    "Metro 6": "Trocadero",
    "Metro 7": "Opera",
    "Metro 12": "Montparnasse",
    "Metro 14": "Saint-Lazare",
    "RER B": "Denfert-Rochereau",
    "RER A": "Nation",
    "Bus 38": "Luxembourg",
    "Bus 72": "Hotel de Ville",
    "Tram T3a": "Porte de Versailles",
  };

  return stations[ligne] || "Station";
}
