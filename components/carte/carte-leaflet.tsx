"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import GeoJSON from "geojson";

/**
 * Props du composant CarteLeaflet.
 * @param centre - Coordonnées du centre de la carte
 * @param zones - Tableau de features GeoJSON représentant les zones de densité
 * @param afficherRepli - Afficher les points de repli (zones calmes)
 * @param chargement - Indique si les données sont en cours de chargement
 * @param marqueurRecherche - Position et label du marqueur de recherche (optionnel)
 */
interface PropsCarteLeaflet {
  centre: { lat: number; lng: number };
  zones: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: number[][][];
    };
    properties: {
      density_score: number;
      niveau: string;
      nom_zone: string;
      estimation_personnes: number;
    };
  }>;
  afficherRepli: boolean;
  chargement: boolean;
  /** Marqueur de localisation pour le lieu recherché */
  marqueurRecherche?: {
    lat: number;
    lng: number;
    label: string;
  } | null;
}

/**
 * Composant CarteLeaflet
 *
 * Rendu de la carte interactive avec Leaflet.
 * Affiche les zones de densité en GeoJSON avec des couleurs apaisantes :
 *   - Bleu doux (calme) vers orange (dense)
 *   - Évite les couleurs agressives pour ne pas stresser l'utilisateur
 *
 * Les points de repli sont représentés par des icônes vertes (parcs, refuges).
 */
export function CarteLeaflet({
  centre,
  zones,
  afficherRepli,
  chargement,
  marqueurRecherche,
}: PropsCarteLeaflet) {
  // Référence vers le conteneur DOM de la carte
  const refConteneur = useRef<HTMLDivElement>(null);
  // Référence vers l'instance Leaflet de la carte
  const refCarte = useRef<L.Map | null>(null);
  // Référence vers le calque GeoJSON des zones de densité
  const refCalqueZones = useRef<L.GeoJSON | null>(null);
  // Référence vers le calque des marqueurs de repli
  const refCalqueRepli = useRef<L.LayerGroup | null>(null);
  // Référence vers le marqueur de recherche
  const refMarqueurRecherche = useRef<L.Marker | null>(null);

  /**
   * Initialisation de la carte Leaflet au premier rendu.
   * Configuration des tuiles OpenStreetMap et du style initial.
   */
  useEffect(() => {
    if (!refConteneur.current || refCarte.current) return;

    // Création de la carte centrée sur Paris par défaut
    const carte = L.map(refConteneur.current, {
      center: [centre.lat, centre.lng],
      zoom: 14,
      zoomControl: true,
    });

    // Tuiles OpenStreetMap (style clair pour un rendu apaisant)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(carte);

    // Initialisation des calques vides
    refCalqueZones.current = L.geoJSON(undefined, {
      style: styliserZone,
      onEachFeature: ajouterPopupZone,
    }).addTo(carte);

    refCalqueRepli.current = L.layerGroup().addTo(carte);

    refCarte.current = carte;

    // Nettoyage lors de la destruction du composant
    return () => {
      carte.remove();
      refCarte.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Mise à jour du centre de la carte quand les coordonnées changent.
   * Animation fluide vers la nouvelle position.
   */
  useEffect(() => {
    if (!refCarte.current) return;
    refCarte.current.flyTo([centre.lat, centre.lng], 14, {
      duration: 1.5,
    });
  }, [centre.lat, centre.lng]);

  /**
   * Mise à jour des zones de densité sur la carte.
   * Efface les anciennes zones et ajoute les nouvelles avec le style approprié.
   */
  useEffect(() => {
    if (!refCalqueZones.current || !zones || zones.length === 0) return;

    // Effacer les zones existantes
    refCalqueZones.current.clearLayers();

    // Ajouter les nouvelles zones au calque GeoJSON
    const featureCollection: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: zones,
    };

    refCalqueZones.current.addData(featureCollection);
  }, [zones]);

  /**
   * Gestion de l'affichage des points de repli.
   * Génère des marqueurs verts pour les zones calmes identifiées.
   */
  useEffect(() => {
    if (!refCalqueRepli.current || !refCarte.current) return;

    refCalqueRepli.current.clearLayers();

    if (!afficherRepli) return;

    // Points de repli simulés autour du centre de la carte
    const pointsRepli = [
      {
        nom: "Parc municipal",
        lat: centre.lat + 0.005,
        lng: centre.lng - 0.003,
        type: "parc",
      },
      {
        nom: "Jardin calme",
        lat: centre.lat - 0.004,
        lng: centre.lng + 0.005,
        type: "jardin",
      },
      {
        nom: "Rue pietonne tranquille",
        lat: centre.lat + 0.002,
        lng: centre.lng + 0.007,
        type: "rue_calme",
      },
      {
        nom: "Square vert",
        lat: centre.lat - 0.006,
        lng: centre.lng - 0.004,
        type: "parc",
      },
    ];

    // Icône personnalisée verte pour les refuges
    const iconeRepli = L.divIcon({
      html: `<div style="
        background: hsl(160, 50%, 45%);
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <path d="M17 10.5V7c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3.5"/>
          <path d="M12 2v5"/>
          <path d="M2 22l5-10h10l5 10"/>
        </svg>
      </div>`,
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    pointsRepli.forEach((point) => {
      const marqueur = L.marker([point.lat, point.lng], {
        icon: iconeRepli,
      });

      marqueur.bindPopup(
        `<div style="font-family: system-ui; padding: 4px;">
          <strong style="color: hsl(160, 50%, 35%);">${point.nom}</strong>
          <br/>
          <span style="font-size: 12px; color: #666;">
            Zone de repli - Endroit calme pour souffler
          </span>
        </div>`
      );

      refCalqueRepli.current!.addLayer(marqueur);
    });
  }, [afficherRepli, centre.lat, centre.lng]);

  /**
   * Gestion du marqueur de recherche.
   * Affiche un marqueur rouge distinctif sur le lieu recherché.
   * Le marqueur a un style similaire à Google Maps pour être facilement identifiable.
   */
  useEffect(() => {
    if (!refCarte.current) return;

    // Supprimer l'ancien marqueur s'il existe
    if (refMarqueurRecherche.current) {
      refCarte.current.removeLayer(refMarqueurRecherche.current);
      refMarqueurRecherche.current = null;
    }

    // Si pas de marqueur de recherche, ne rien afficher
    if (!marqueurRecherche) return;

    // Icône personnalisée style Google Maps (goutte rouge avec point blanc)
    const iconeRecherche = L.divIcon({
      html: `<div style="
        position: relative;
        width: 36px;
        height: 46px;
      ">
        <svg viewBox="0 0 36 46" width="36" height="46" xmlns="http://www.w3.org/2000/svg">
          <!-- Forme de goutte (marqueur) -->
          <path 
            d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28C36 8.06 27.94 0 18 0z" 
            fill="hsl(0, 72%, 50%)" 
            stroke="white" 
            stroke-width="2"
          />
          <!-- Cercle blanc au centre -->
          <circle cx="18" cy="16" r="6" fill="white"/>
        </svg>
      </div>`,
      className: "",
      iconSize: [36, 46],
      iconAnchor: [18, 46], // Ancrage à la pointe du marqueur
      popupAnchor: [0, -46], // Popup au-dessus du marqueur
    });

    // Créer le marqueur de recherche
    const marqueur = L.marker([marqueurRecherche.lat, marqueurRecherche.lng], {
      icon: iconeRecherche,
      zIndexOffset: 1000, // Toujours au-dessus des autres éléments
    });

    // Ajouter un popup avec le nom du lieu
    marqueur.bindPopup(
      `<div style="font-family: system-ui; padding: 4px; min-width: 180px;">
        <strong style="color: hsl(0, 72%, 50%);">Lieu recherche</strong>
        <hr style="margin: 6px 0; border-color: hsl(210, 20%, 88%);" />
        <p style="font-size: 12px; color: #333; margin: 0; line-height: 1.4;">
          ${marqueurRecherche.label}
        </p>
      </div>`,
      { closeButton: true, autoClose: false }
    );

    // Ouvrir le popup automatiquement
    marqueur.addTo(refCarte.current).openPopup();
    refMarqueurRecherche.current = marqueur;
  }, [marqueurRecherche]);

  return (
    <div className="relative h-full w-full">
      <div ref={refConteneur} className="h-full w-full" />
      {/* Indicateur de chargement superposé */}
      {chargement && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 shadow-lg">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-card-foreground">
              Chargement des donnees de densite...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Définit le style visuel de chaque zone de densité sur la carte.
 * Utilise un dégradé de couleurs apaisantes :
 *   - Bleu doux (calme) -> Vert -> Jaune -> Orange (dense)
 * Évite le rouge vif pour ne pas provoquer d'anxiété.
 *
 * @param feature - Feature GeoJSON avec ses propriétés de densité
 * @returns Objet de style Leaflet (couleur de remplissage, opacité, etc.)
 */
function styliserZone(feature: GeoJSON.Feature | undefined): L.PathOptions {
  const score = feature?.properties?.density_score || 0;

  let couleur: string;
  if (score <= 3) {
    couleur = "hsl(200, 50%, 60%)"; // Bleu doux - calme
  } else if (score <= 5) {
    couleur = "hsl(160, 50%, 50%)"; // Vert doux - modéré
  } else if (score <= 7) {
    couleur = "hsl(35, 90%, 55%)"; // Orange doux - dense
  } else {
    couleur = "hsl(15, 80%, 55%)"; // Orange foncé - très dense
  }

  return {
    fillColor: couleur,
    weight: 1,
    opacity: 0.6,
    color: couleur,
    fillOpacity: 0.35,
  };
}

/**
 * Ajoute un popup informatif à chaque zone de densité.
 * Le popup s'affiche au survol et donne des informations rassurantes.
 *
 * @param feature - Feature GeoJSON
 * @param layer - Calque Leaflet correspondant
 */
function ajouterPopupZone(feature: GeoJSON.Feature, layer: L.Layer) {
  if (!feature.properties) return;

  const { nom_zone, density_score, niveau, estimation_personnes } =
    feature.properties;

  // Messages rassurants adaptés au niveau de densité
  const messages: Record<string, string> = {
    calme: "Zone tranquille - Vous pouvez y aller sereinement.",
    modere: "Affluence moderee - Restez attentif mais c'est confortable.",
    dense: "Zone animee - Privilegiez un itineraire alternatif.",
    tres_dense: "Forte affluence - Il est conseille d'eviter cette zone.",
  };

  (layer as L.Path).bindPopup(
    `<div style="font-family: system-ui; padding: 4px; min-width: 180px;">
      <strong style="color: hsl(213, 60%, 40%);">${nom_zone}</strong>
      <hr style="margin: 6px 0; border-color: hsl(210, 20%, 88%);" />
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="font-size: 12px; color: #666;">Densite</span>
        <strong>${density_score}/10</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 12px; color: #666;">Estimation</span>
        <span>~${estimation_personnes} pers.</span>
      </div>
      <p style="font-size: 12px; color: hsl(213, 40%, 50%); margin: 0; line-height: 1.4;">
        ${messages[niveau] || ""}
      </p>
    </div>`
  );
}
