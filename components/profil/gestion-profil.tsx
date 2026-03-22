"use client";

import { useState, useCallback } from "react";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Sliders,
  Bell,
  Star,
  MapPin,
  Save,
  Loader2,
  TreePine,
  Zap,
  Bike,
  Footprints,
  Bus,
  Eye,
  Check,
} from "lucide-react";

/** Fonction utilitaire pour les appels fetch avec SWR */
const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Types pour les préférences utilisateur.
 */
interface Preferences {
  seuil_densite_max: number;
  preference_itineraire: "calm" | "fastest";
  alertes_activees: boolean;
  rayon_recherche_metres: number;
  mode_deplacement: "pieton" | "velo" | "transport";
  notifications: {
    alerte_densite: boolean;
    suggestions_horaires: boolean;
    points_repli: boolean;
  };
  accessibilite: {
    contraste_eleve: boolean;
    taille_texte: "petit" | "normal" | "grand";
    animations_reduites: boolean;
  };
  trajets_favoris: Array<{
    id: string;
    nom: string;
    depart: { lat: number; lng: number; adresse: string };
    arrivee: { lat: number; lng: number; adresse: string };
    preference: string;
  }>;
}

interface ReponsePrefences {
  utilisateur_id: string;
  preferences: Preferences;
  derniere_modification: string;
}

/**
 * Composant GestionProfil
 *
 * Interface complète de gestion des préférences utilisateur.
 * Les modifications sont envoyées en temps réel au backend via PUT.
 */
export function GestionProfil() {
  const { data, isLoading } = useSWR<ReponsePrefences>(
    "/api/user/preferences",
    fetcher
  );
  const [enregistrement, setEnregistrement] = useState(false);
  const [confirmation, setConfirmation] = useState(false);

  /**
   * Sauvegarde les préférences modifiées via l'API backend.
   * Utilise PUT /api/user/preferences avec fusion partielle.
   */
  const sauvegarder = useCallback(
    async (modifications: Partial<Preferences>) => {
      setEnregistrement(true);
      try {
        await fetch("/api/user/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modifications),
        });
        // Revalider les données SWR
        await mutate("/api/user/preferences");
        setConfirmation(true);
        setTimeout(() => setConfirmation(false), 2000);
      } catch {
        // Gestion silencieuse de l'erreur
      } finally {
        setEnregistrement(false);
      }
    },
    []
  );

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const prefs = data.preferences;

  return (
    <div className="flex flex-col gap-6">
      {/* Confirmation de sauvegarde */}
      {confirmation && (
        <div className="flex items-center gap-2 rounded-lg bg-calm/10 px-4 py-3 text-sm text-calm">
          <Check className="h-4 w-4" />
          Preferences mises a jour avec succes.
        </div>
      )}

      {/* === SEUIL DE TOLÉRANCE === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Sliders className="h-5 w-5 text-primary" />
            Seuil de tolerance a la foule
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Slider de densité maximale */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Densite maximum toleree</Label>
              <Badge variant="outline" className="text-base font-bold">
                {prefs.seuil_densite_max}/10
              </Badge>
            </div>
            <Slider
              value={[prefs.seuil_densite_max]}
              onValueChange={([val]) =>
                sauvegarder({ seuil_densite_max: val })
              }
              min={1}
              max={10}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tres sensible (1)</span>
              <span>Tolerant (10)</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Les zones depassant ce seuil seront signalees en orange sur la carte.
              Un seuil bas vous protege davantage mais limite les itineraires disponibles.
            </p>
          </div>

          {/* Rayon de recherche */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label>Rayon de recherche</Label>
              <Badge variant="outline">
                {prefs.rayon_recherche_metres}m
              </Badge>
            </div>
            <Slider
              value={[prefs.rayon_recherche_metres]}
              onValueChange={([val]) =>
                sauvegarder({ rayon_recherche_metres: val })
              }
              min={200}
              max={3000}
              step={100}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>200m (proche)</span>
              <span>3000m (large)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === PRÉFÉRENCES D'ITINÉRAIRE === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <MapPin className="h-5 w-5 text-primary" />
            Preferences de deplacement
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Itinéraire par défaut */}
          <div className="flex flex-col gap-3">
            <Label>Itineraire par defaut</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={
                  prefs.preference_itineraire === "calm" ? "default" : "outline"
                }
                className="gap-2"
                onClick={() =>
                  sauvegarder({ preference_itineraire: "calm" })
                }
              >
                <TreePine className="h-4 w-4" />
                Le plus calme
              </Button>
              <Button
                variant={
                  prefs.preference_itineraire === "fastest"
                    ? "default"
                    : "outline"
                }
                className="gap-2"
                onClick={() =>
                  sauvegarder({ preference_itineraire: "fastest" })
                }
              >
                <Zap className="h-4 w-4" />
                Le plus rapide
              </Button>
            </div>
          </div>

          {/* Mode de déplacement */}
          <div className="flex flex-col gap-3">
            <Label>Mode de deplacement</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { valeur: "pieton", label: "A pied", icone: Footprints },
                { valeur: "velo", label: "Velo", icone: Bike },
                { valeur: "transport", label: "Transport", icone: Bus },
              ].map((mode) => (
                <Button
                  key={mode.valeur}
                  variant={
                    prefs.mode_deplacement === mode.valeur
                      ? "default"
                      : "outline"
                  }
                  className="gap-2"
                  onClick={() =>
                    sauvegarder({
                      mode_deplacement: mode.valeur as Preferences["mode_deplacement"],
                    })
                  }
                >
                  <mode.icone className="h-4 w-4" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === NOTIFICATIONS === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Bell className="h-5 w-5 text-primary" />
            Notifications & Alertes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {/* Toggle alertes générales */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Alertes activees</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Recevoir des alertes quand une zone devient trop dense.
              </p>
            </div>
            <Switch
              checked={prefs.alertes_activees}
              onCheckedChange={(val) =>
                sauvegarder({ alertes_activees: val })
              }
            />
          </div>

          {/* Notification densité */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Alerte de densite</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Prevenu si la densite depasse votre seuil sur votre trajet.
              </p>
            </div>
            <Switch
              checked={prefs.notifications.alerte_densite}
              onCheckedChange={(val) =>
                sauvegarder({
                  notifications: { ...prefs.notifications, alerte_densite: val },
                })
              }
            />
          </div>

          {/* Suggestions horaires */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Suggestions horaires</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Recevoir des suggestions de meilleurs moments pour partir.
              </p>
            </div>
            <Switch
              checked={prefs.notifications.suggestions_horaires}
              onCheckedChange={(val) =>
                sauvegarder({
                  notifications: {
                    ...prefs.notifications,
                    suggestions_horaires: val,
                  },
                })
              }
            />
          </div>

          {/* Points de repli */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Points de repli</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Afficher les zones de repos sur votre itineraire.
              </p>
            </div>
            <Switch
              checked={prefs.notifications.points_repli}
              onCheckedChange={(val) =>
                sauvegarder({
                  notifications: {
                    ...prefs.notifications,
                    points_repli: val,
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* === ACCESSIBILITÉ === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Eye className="h-5 w-5 text-primary" />
            Accessibilite
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {/* Contraste élevé */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Contraste eleve</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Augmente le contraste des couleurs pour une meilleure lisibilite.
              </p>
            </div>
            <Switch
              checked={prefs.accessibilite.contraste_eleve}
              onCheckedChange={(val) =>
                sauvegarder({
                  accessibilite: {
                    ...prefs.accessibilite,
                    contraste_eleve: val,
                  },
                })
              }
            />
          </div>

          {/* Taille du texte */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Taille du texte</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Ajustez la taille du texte dans l'application.
              </p>
            </div>
            <Select
              value={prefs.accessibilite.taille_texte}
              onValueChange={(val) =>
                sauvegarder({
                  accessibilite: {
                    ...prefs.accessibilite,
                    taille_texte: val as Preferences["accessibilite"]["taille_texte"],
                  },
                })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="petit">Petit</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="grand">Grand</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Animations réduites */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Animations reduites</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Desactive les animations pour un affichage plus stable.
              </p>
            </div>
            <Switch
              checked={prefs.accessibilite.animations_reduites}
              onCheckedChange={(val) =>
                sauvegarder({
                  accessibilite: {
                    ...prefs.accessibilite,
                    animations_reduites: val,
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* === TRAJETS FAVORIS === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Star className="h-5 w-5 text-accent" />
            Trajets favoris
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prefs.trajets_favoris.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Aucun trajet favori enregistre. Planifiez un itineraire pour
              l'ajouter a vos favoris.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {prefs.trajets_favoris.map((trajet) => (
                <div
                  key={trajet.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-secondary-foreground">
                      {trajet.nom}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {trajet.depart.adresse}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {"-> "}
                      {trajet.arrivee.adresse}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      trajet.preference === "calm"
                        ? "border-calm text-calm"
                        : "border-accent text-accent"
                    }
                  >
                    {trajet.preference === "calm" ? "Calme" : "Rapide"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
