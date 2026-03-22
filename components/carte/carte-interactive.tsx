"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  Locate,
  Filter,
  TreePine,
  Loader2,
  MapPin,
  X,
} from "lucide-react";
import useSWR from "swr";

/**
 * Chargement dynamique de la carte Leaflet (côté client uniquement).
 * Leaflet nécessite l'objet `window` qui n'existe pas côté serveur.
 */
const CarteLeaflet = dynamic(
  () => import("./carte-leaflet").then((mod) => mod.CarteLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    ),
  }
);

/** Fonction utilitaire pour les appels fetch avec SWR */
const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Composant principal de la carte interactive.
 * Gère la recherche, les filtres, la géolocalisation
 * et l'affichage des données de densité sur la carte.
 */
export function CarteInteractive() {
  // État de la position centrale de la carte (par défaut : Paris)
  const [centre, setCentre] = useState({ lat: 48.8566, lng: 2.3522 });
  // Texte de recherche de destination
  const [recherche, setRecherche] = useState("");
  // Filtre de densité maximale affichée (0-10)
  const [filtreDensite, setFiltreDensite] = useState([10]);
  // Afficher/masquer les points de repli
  const [afficherRepli, setAfficherRepli] = useState(true);
  // Panneau de filtres ouvert/fermé (mobile)
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  // État de géolocalisation en cours
  const [geolocalisation, setGeolocalisation] = useState(false);
  // Position du marqueur de recherche (null si aucune recherche)
  const [marqueurRecherche, setMarqueurRecherche] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);
  // État de chargement de la recherche
  const [rechercheEnCours, setRechercheEnCours] = useState(false);
  // Message d'erreur de recherche
  const [erreurRecherche, setErreurRecherche] = useState("");

  /**
   * Récupération des données de densité depuis l'API backend.
   * SWR gère le cache et le rafraîchissement automatique.
   * Les données sont au format GeoJSON, prêtes pour Leaflet.
   */
  const { data: donneesDensite, isLoading: chargementDensite } = useSWR(
    `/api/density/current?lat=${centre.lat}&lng=${centre.lng}&rayon=1500`,
    fetcher,
    { refreshInterval: 30000 } // Rafraîchissement toutes les 30 secondes
  );

  /**
   * Récupération de la prédiction d'affluence pour l'heure actuelle.
   */
  const { data: prediction } = useSWR(
    `/api/density/predictive?lat=${centre.lat}&lng=${centre.lng}`,
    fetcher
  );

  /**
   * Géolocalisation de l'utilisateur via l'API du navigateur.
   * Centre la carte sur la position réelle de l'utilisateur.
   */
  const geolocalisier = useCallback(() => {
    if (!navigator.geolocation) return;
    setGeolocalisation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCentre({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeolocalisation(false);
      },
      () => {
        setGeolocalisation(false);
      }
    );
  }, []);

  /**
   * Recherche d'un lieu par nom.
   * Utilise l'API Nominatim (OpenStreetMap) pour le géocodage.
   * IMPORTANT: La recherche est limitée uniquement à la France.
   * Fonctionne avec adresse seule, code postal seul, ville seule
   * ou adresse complète (adresse + code postal + ville).
   */
  const rechercherLieu = useCallback(async () => {
    if (!recherche.trim()) return;
    setRechercheEnCours(true);
    setErreurRecherche("");
    setMarqueurRecherche(null);
    
    try {
      // Paramètres de recherche limités à la France
      // countrycodes=fr : limite les résultats à la France
      // bounded=1 avec viewbox : définit les limites géographiques de la France métropolitaine
      const params = new URLSearchParams({
        format: "json",
        q: recherche,
        limit: "5", // On récupère plusieurs résultats pour filtrer les meilleurs
        countrycodes: "fr", // Limiter à la France uniquement
        addressdetails: "1", // Inclure les détails d'adresse pour un meilleur affichage
        "accept-language": "fr", // Résultats en français
      });
      
      const reponse = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`
      );
      const resultats = await reponse.json();
      
      if (resultats.length > 0) {
        // Prendre le premier résultat (le plus pertinent)
        const meilleurResultat = resultats[0];
        const nouvelleLat = parseFloat(meilleurResultat.lat);
        const nouvelleLng = parseFloat(meilleurResultat.lon);
        
        // Centrer la carte sur le résultat
        setCentre({
          lat: nouvelleLat,
          lng: nouvelleLng,
        });
        
        // Placer un marqueur de localisation sur le lieu recherché
        setMarqueurRecherche({
          lat: nouvelleLat,
          lng: nouvelleLng,
          label: meilleurResultat.display_name || recherche,
        });
      } else {
        // Aucun résultat trouvé en France
        setErreurRecherche("Aucun lieu trouve en France pour cette recherche.");
      }
    } catch {
      setErreurRecherche("Erreur lors de la recherche. Veuillez reessayer.");
    } finally {
      setRechercheEnCours(false);
    }
  }, [recherche]);

  // Filtrer les zones selon le seuil de densité choisi
  const zonesFiltrees = donneesDensite?.features?.filter(
    (f: { properties: { density_score: number } }) =>
      f.properties.density_score <= filtreDensite[0]
  );

  return (
    <div className="relative flex h-full flex-1">
      {/* === PANNEAU LATÉRAL DE CONTRÔLE === */}
      <aside
        className={`
          absolute left-0 top-0 z-20 flex h-full w-80 flex-col gap-4 
          border-r border-border bg-card p-4 shadow-lg transition-transform
          ${filtresOuverts ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        {/* Bouton fermer (mobile) */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 lg:hidden"
          onClick={() => setFiltresOuverts(false)}
          aria-label="Fermer les filtres"
        >
          <X className="h-4 w-4" />
        </Button>

        <h2 className="font-heading text-lg font-semibold text-card-foreground">
          Controles de la carte
        </h2>

        {/* Barre de recherche de destination (France uniquement) */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Adresse, code postal ou ville en France..."
                value={recherche}
                onChange={(e) => {
                  setRecherche(e.target.value);
                  setErreurRecherche(""); // Effacer l'erreur lors de la saisie
                }}
                onKeyDown={(e) => e.key === "Enter" && rechercherLieu()}
                className="pl-9"
              />
            </div>
            <Button 
              size="icon" 
              onClick={rechercherLieu} 
              aria-label="Rechercher"
              disabled={rechercheEnCours}
            >
              {rechercheEnCours ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          {/* Message d'erreur si la recherche échoue */}
          {erreurRecherche && (
            <p className="text-xs text-destructive">{erreurRecherche}</p>
          )}
          {/* Indication du marqueur actif */}
          {marqueurRecherche && (
            <div className="flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1.5 text-xs">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="flex-1 truncate text-foreground">
                {marqueurRecherche.label.split(",").slice(0, 2).join(",")}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setMarqueurRecherche(null)}
                aria-label="Effacer le marqueur"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Bouton géolocalisation */}
        <Button
          variant="outline"
          className="justify-start gap-2 bg-transparent"
          onClick={geolocalisier}
          disabled={geolocalisation}
        >
          {geolocalisation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Locate className="h-4 w-4" />
          )}
          {geolocalisation ? "Localisation..." : "Me geolocaliser"}
        </Button>

        {/* Filtre de seuil de densité */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-card-foreground">
            Seuil de densite max : {filtreDensite[0]}/10
          </label>
          <Slider
            value={filtreDensite}
            onValueChange={setFiltreDensite}
            min={1}
            max={10}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Calme</span>
            <span>Dense</span>
          </div>
        </div>

        {/* Toggle points de repli */}
        <Button
          variant={afficherRepli ? "default" : "outline"}
          className="justify-start gap-2"
          onClick={() => setAfficherRepli(!afficherRepli)}
        >
          <TreePine className="h-4 w-4" />
          {afficherRepli ? "Masquer" : "Afficher"} les points de repli
        </Button>

        {/* Légende de la heatmap */}
        <div className="mt-auto flex flex-col gap-2 rounded-lg bg-secondary p-3">
          <p className="text-xs font-semibold text-secondary-foreground">Legende</p>
          <div className="flex flex-col gap-1.5">
            <LigneLegende couleur="bg-calm" label="Calme (0-3)" />
            <LigneLegende couleur="bg-moderate" label="Modere (3-5)" />
            <LigneLegende couleur="bg-dense" label="Dense (5-7)" />
            <LigneLegende couleur="bg-very-dense" label="Tres dense (7-10)" />
          </div>
        </div>

        {/* Prédiction actuelle */}
        {prediction?.prediction && (
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="mb-1 text-xs font-semibold text-card-foreground">Prediction actuelle</p>
            <Badge
              className={`${
                prediction.prediction.score_densite <= 30
                  ? "bg-calm text-[hsl(0,0%,100%)]"
                  : prediction.prediction.score_densite <= 60
                    ? "bg-moderate text-foreground"
                    : "bg-dense text-[hsl(0,0%,100%)]"
              }`}
            >
              {prediction.prediction.niveau_confort}
            </Badge>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {prediction.prediction.conseil}
            </p>
          </div>
        )}
      </aside>

      {/* === CARTE LEAFLET === */}
      <div className="relative flex-1">
        {/* Bouton ouvrir filtres (mobile) */}
        <Button
          variant="default"
          size="icon"
          className="absolute left-3 top-3 z-10 shadow-lg lg:hidden"
          onClick={() => setFiltresOuverts(true)}
          aria-label="Ouvrir les filtres"
        >
          <Filter className="h-4 w-4" />
        </Button>

        <CarteLeaflet
          centre={centre}
          zones={zonesFiltrees || []}
          afficherRepli={afficherRepli}
          chargement={chargementDensite}
          marqueurRecherche={marqueurRecherche}
        />
      </div>
    </div>
  );
}

/**
 * Composant de ligne de légende pour la heatmap.
 */
function LigneLegende({ couleur, label }: { couleur: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-3 w-6 rounded ${couleur}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
