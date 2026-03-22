"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Navigation,
  Clock,
  Footprints,
  Shield,
  TreePine,
  Loader2,
  ArrowRight,
  ArrowDown,
  Bike,
  Bus,
  Train,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { CourbeAffluence } from "./courbe-affluence";
import { JaugeConfort } from "./jauge-confort";
import { ComparaisonItineraires } from "./comparaison-itineraires";
import { TimelineItineraire } from "./timeline-itineraire";
import useSWR from "swr";

/**
 * Types pour le mode de déplacement.
 * Le mode affecte les calculs d'itinéraire et les arrêts proposés.
 */
type ModeDeplacement = "pieton" | "velo" | "transport";

/** Fonction utilitaire pour les appels fetch avec SWR */
const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Composant PlanificateurItineraire
 *
 * Interface principale pour planifier un trajet.
 * L'utilisateur saisit un départ et une arrivée,
 * puis voit la comparaison des itinéraires et les graphiques.
 */
export function PlanificateurItineraire() {
  // Champs de saisie pour le départ et l'arrivée
  const [depart, setDepart] = useState("Gare du Nord, Paris");
  const [arrivee, setArrivee] = useState("Jardin du Luxembourg, Paris");
  // Préférence d'itinéraire sélectionnée
  const [preference, setPreference] = useState<"calm" | "fastest">("calm");
  // État de chargement du calcul d'itinéraire
  const [chargement, setChargement] = useState(false);
  // Résultat du calcul d'itinéraire
  const [resultat, setResultat] = useState<Record<string, unknown> | null>(null);
  // Mode de déplacement (récupéré des préférences utilisateur)
  const [modeDeplacement, setModeDeplacement] = useState<ModeDeplacement>("transport");

  /**
   * Récupération des préférences utilisateur depuis l'API.
   * Le mode de déplacement est synchronisé avec la page profil.
   */
  const { data: prefsData } = useSWR("/api/user/preferences", fetcher);

  /**
   * Synchronisation du mode de déplacement avec les préférences utilisateur.
   * Quand l'utilisateur change son mode sur la page profil, ça se reflète ici.
   */
  useEffect(() => {
    if (prefsData?.preferences?.mode_deplacement) {
      setModeDeplacement(prefsData.preferences.mode_deplacement);
    }
  }, [prefsData]);

  /**
   * Récupération de la prédiction d'affluence sur 24h.
   * Affichée dans le graphique de courbe d'affluence.
   */
  const { data: prediction } = useSWR(
    "/api/density/predictive?lat=48.8566&lng=2.3522",
    fetcher
  );

  /**
   * Lance le calcul d'itinéraire via l'API backend.
   * Géocode les adresses via Nominatim puis appelle POST /api/routes/plan.
   */
  const calculerItineraire = useCallback(async () => {
    setChargement(true);
    try {
      // Géocodage du point de départ
      const repDepart = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(depart)}&limit=1`
      );
      const resDepart = await repDepart.json();

      // Géocodage de la destination
      const repArrivee = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(arrivee)}&limit=1`
      );
      const resArrivee = await repArrivee.json();

      // Coordonnées par défaut si le géocodage échoue
      const startCoords = resDepart[0]
        ? { lat: parseFloat(resDepart[0].lat), lng: parseFloat(resDepart[0].lon) }
        : { lat: 48.8809, lng: 2.3553 };

      const endCoords = resArrivee[0]
        ? { lat: parseFloat(resArrivee[0].lat), lng: parseFloat(resArrivee[0].lon) }
        : { lat: 48.8462, lng: 2.3372 };

      // Appel à l'API de calcul d'itinéraire avec le mode de déplacement
      const reponse = await fetch("/api/routes/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: startCoords,
          end: endCoords,
          preference,
          mode: modeDeplacement, // Mode de déplacement depuis les préférences
        }),
      });

      const data = await reponse.json();
      setResultat(data);
    } catch {
      // En cas d'erreur, résultat vide
    } finally {
      setChargement(false);
    }
  }, [depart, arrivee, preference, modeDeplacement]);

  // Extraction des données d'itinéraire pour l'affichage
  const itineraires = resultat?.itineraires as Record<string, Record<string, unknown>> | undefined;
  const comparaison = resultat?.comparaison as Record<string, unknown> | undefined;

  return (
    <div className="flex flex-col gap-8">
      {/* === FORMULAIRE DE SAISIE === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Navigation className="h-5 w-5 text-primary" />
            Definir votre trajet
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Champ de départ */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Point de depart
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                value={depart}
                onChange={(e) => setDepart(e.target.value)}
                placeholder="Adresse de depart..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Indicateur visuel de direction */}
          <div className="flex justify-center">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Champ d'arrivée */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Destination
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
              <Input
                value={arrivee}
                onChange={(e) => setArrivee(e.target.value)}
                placeholder="Adresse de destination..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Sélection de préférence */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Preference d'itineraire
            </label>
            <div className="flex gap-3">
              <Button
                variant={preference === "calm" ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => setPreference("calm")}
              >
                <TreePine className="h-4 w-4" />
                Le plus calme
              </Button>
              <Button
                variant={preference === "fastest" ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => setPreference("fastest")}
              >
                <Clock className="h-4 w-4" />
                Le plus rapide
              </Button>
            </div>
          </div>

          {/* Indicateur du mode de déplacement actif (depuis les préférences) */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3">
            <div className="flex items-center gap-2">
              {modeDeplacement === "pieton" && <Footprints className="h-5 w-5 text-primary" />}
              {modeDeplacement === "velo" && <Bike className="h-5 w-5 text-primary" />}
              {modeDeplacement === "transport" && <Bus className="h-5 w-5 text-primary" />}
              <div>
                <p className="text-sm font-medium text-foreground">
                  Mode : {modeDeplacement === "pieton" ? "A pied" : modeDeplacement === "velo" ? "Velo" : "Transport en commun"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Modifiable dans les parametres du profil
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {modeDeplacement === "transport" ? "Metro / Bus / RER" : modeDeplacement === "velo" ? "Pistes cyclables" : "Pietons"}
            </Badge>
          </div>

          {/* Bouton de calcul */}
          <Button
            size="lg"
            onClick={calculerItineraire}
            disabled={chargement || !depart || !arrivee}
            className="gap-2"
          >
            {chargement ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {chargement ? "Calcul en cours..." : "Calculer l'itineraire"}
          </Button>
        </CardContent>
      </Card>

      {/* === RÉSULTATS === */}
      {itineraires && (
        <Tabs defaultValue="comparaison" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeline">Itineraire</TabsTrigger>
            <TabsTrigger value="comparaison">Comparaison</TabsTrigger>
            <TabsTrigger value="affluence">Affluence 24h</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          {/* Onglet Timeline - Aperçu des arrêts de l'itinéraire */}
          <TabsContent value="timeline" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Timeline itinéraire calme */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 font-heading text-lg">
                    <TreePine className="h-5 w-5 text-calm" />
                    Itineraire calme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TimelineItineraire
                    itineraire={itineraires.calme as Record<string, unknown>}
                    mode={modeDeplacement}
                    depart={depart}
                    arrivee={arrivee}
                  />
                </CardContent>
              </Card>

              {/* Timeline itinéraire rapide */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 font-heading text-lg">
                    <Clock className="h-5 w-5 text-accent" />
                    Itineraire rapide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TimelineItineraire
                    itineraire={itineraires.rapide as Record<string, unknown>}
                    mode={modeDeplacement}
                    depart={depart}
                    arrivee={arrivee}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Comparaison */}
          <TabsContent value="comparaison" className="mt-4">
            <ComparaisonItineraires
              calme={itineraires.calme as Record<string, unknown>}
              rapide={itineraires.rapide as Record<string, unknown>}
              comparaison={comparaison as Record<string, unknown>}
            />
          </TabsContent>

          {/* Onglet Courbe d'affluence */}
          <TabsContent value="affluence" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">
                  Prevision d'affluence sur 24 heures
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prediction?.courbe_24h ? (
                  <CourbeAffluence donnees={prediction.courbe_24h} />
                ) : (
                  <p className="text-center text-muted-foreground">
                    Chargement des previsions...
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Détails */}
          <TabsContent value="details" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Jauge de confort pour l'itinéraire calme */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-heading text-lg">
                    <Shield className="h-5 w-5 text-calm" />
                    Itineraire calme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <JaugeConfort
                    score={(itineraires.calme as Record<string, unknown>).score_confort as number}
                    label="Score de confort social"
                  />
                  <div className="mt-4 flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance</span>
                      <span className="font-medium">{(itineraires.calme as Record<string, unknown>).distance_km as number} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duree</span>
                      <span className="font-medium">{(itineraires.calme as Record<string, unknown>).duree_minutes as number} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Points de repli</span>
                      <span className="font-medium">
                        {((itineraires.calme as Record<string, unknown>).points_repli as unknown[])?.length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Jauge de confort pour l'itinéraire rapide */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-heading text-lg">
                    <Footprints className="h-5 w-5 text-accent" />
                    Itineraire rapide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <JaugeConfort
                    score={(itineraires.rapide as Record<string, unknown>).score_confort as number}
                    label="Score de confort social"
                  />
                  <div className="mt-4 flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance</span>
                      <span className="font-medium">{(itineraires.rapide as Record<string, unknown>).distance_km as number} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duree</span>
                      <span className="font-medium">{(itineraires.rapide as Record<string, unknown>).duree_minutes as number} min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conseil personnalisé */}
            {comparaison && (
              <Card className="mt-6 border-primary/20 bg-primary/5">
                <CardContent className="flex items-start gap-3 p-4">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      Conseil SereniMap
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {comparaison.conseil as string}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      L'itineraire calme ajoute{" "}
                      <strong>{comparaison.difference_duree_minutes as number} minutes</strong> mais
                      offre{" "}
                      <strong>+{comparaison.difference_confort as number} points</strong> de confort.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
