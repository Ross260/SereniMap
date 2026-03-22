"use client";

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TreePine,
  Zap,
  Clock,
  Footprints,
  Shield,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/**
 * Props du composant ComparaisonItineraires.
 * @param calme - Données de l'itinéraire calme
 * @param rapide - Données de l'itinéraire rapide
 * @param comparaison - Données de comparaison (différences)
 */
interface PropsComparaison {
  calme: Record<string, unknown>;
  rapide: Record<string, unknown>;
  comparaison: Record<string, unknown>;
}

/**
 * Composant ComparaisonItineraires
 *
 * Affiche côte à côte les deux itinéraires (calme et rapide)
 * avec un graphique en barres comparatif et les indicateurs clés.
 */
export function ComparaisonItineraires({
  calme,
  rapide,
  comparaison,
}: PropsComparaison) {
  // Données pour le graphique de comparaison
  const donneesGraphique = [
    {
      nom: "Duree (min)",
      calme: calme.duree_minutes as number,
      rapide: rapide.duree_minutes as number,
    },
    {
      nom: "Distance (km x10)",
      calme: Math.round((calme.distance_km as number) * 10),
      rapide: Math.round((rapide.distance_km as number) * 10),
    },
    {
      nom: "Confort (/100)",
      calme: calme.score_confort as number,
      rapide: rapide.score_confort as number,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Cartes de comparaison côte à côte */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Carte itinéraire calme */}
        <CarteItineraire
          type="calme"
          label={calme.label as string}
          distance={calme.distance_km as number}
          duree={calme.duree_minutes as number}
          confort={calme.score_confort as number}
          pointsRepli={(calme.points_repli as unknown[])?.length || 0}
          zonesTraversees={calme.zones_traversees as Array<{ densite: number }>}
          recommande={true}
        />

        {/* Carte itinéraire rapide */}
        <CarteItineraire
          type="rapide"
          label={rapide.label as string}
          distance={rapide.distance_km as number}
          duree={rapide.duree_minutes as number}
          confort={rapide.score_confort as number}
          pointsRepli={0}
          zonesTraversees={rapide.zones_traversees as Array<{ densite: number }>}
          recommande={false}
        />
      </div>

      {/* Graphique de comparaison */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Comparaison visuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={donneesGraphique} barGap={8}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(210, 20%, 90%)"
                vertical={false}
              />
              <XAxis
                dataKey="nom"
                tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(210, 20%, 88%)",
                  fontSize: "13px",
                }}
              />
              {/* Barres pour l'itinéraire calme (bleu) */}
              <Bar dataKey="calme" name="Calme" radius={[4, 4, 0, 0]} fill="hsl(213, 60%, 45%)" />
              {/* Barres pour l'itinéraire rapide (orange) */}
              <Bar dataKey="rapide" name="Rapide" radius={[4, 4, 0, 0]} fill="hsl(25, 95%, 55%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Carte d'informations pour un itinéraire.
 * Affiche les métriques principales et les zones traversées.
 */
function CarteItineraire({
  type,
  label,
  distance,
  duree,
  confort,
  pointsRepli,
  zonesTraversees,
  recommande,
}: {
  type: "calme" | "rapide";
  label: string;
  distance: number;
  duree: number;
  confort: number;
  pointsRepli: number;
  zonesTraversees: Array<{ densite: number }>;
  recommande: boolean;
}) {
  const estCalme = type === "calme";

  return (
    <Card className={recommande ? "border-primary/30 shadow-md" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            {estCalme ? (
              <TreePine className="h-5 w-5 text-calm" />
            ) : (
              <Zap className="h-5 w-5 text-accent" />
            )}
            {label}
          </CardTitle>
          {recommande && (
            <Badge className="bg-primary text-primary-foreground">
              Recommande
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Métriques principales */}
        <div className="grid grid-cols-2 gap-3">
          <MetriqueItineraire
            icone={<Footprints className="h-4 w-4" />}
            label="Distance"
            valeur={`${distance} km`}
          />
          <MetriqueItineraire
            icone={<Clock className="h-4 w-4" />}
            label="Duree"
            valeur={`${duree} min`}
          />
          <MetriqueItineraire
            icone={<Shield className="h-4 w-4" />}
            label="Confort"
            valeur={`${confort}/100`}
          />
          {pointsRepli > 0 && (
            <MetriqueItineraire
              icone={<MapPin className="h-4 w-4" />}
              label="Refuges"
              valeur={`${pointsRepli}`}
            />
          )}
        </div>

        {/* Barre de progression du confort */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Confort social</span>
            <span>{confort}%</span>
          </div>
          <Progress
            value={confort}
            className="h-2"
          />
        </div>

        {/* Densité des zones traversées */}
        {zonesTraversees && zonesTraversees.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Densite des sections traversees
            </p>
            <div className="flex gap-1">
              {zonesTraversees.map((zone, i) => (
                <div
                  key={i}
                  className="h-4 flex-1 rounded-sm"
                  style={{
                    backgroundColor:
                      zone.densite <= 3
                        ? "hsl(200, 50%, 60%)"
                        : zone.densite <= 5
                          ? "hsl(160, 50%, 50%)"
                          : zone.densite <= 7
                            ? "hsl(35, 90%, 55%)"
                            : "hsl(15, 80%, 55%)",
                  }}
                  title={`Section ${i + 1}: densite ${zone.densite}/10`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Depart</span>
              <span>Arrivee</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Composant de métrique individuelle pour les cartes d'itinéraire.
 */
function MetriqueItineraire({
  icone,
  label,
  valeur,
}: {
  icone: React.ReactNode;
  label: string;
  valeur: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-secondary p-2">
      <div className="text-primary">{icone}</div>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-secondary-foreground">{valeur}</p>
      </div>
    </div>
  );
}
