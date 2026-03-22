"use client";

import React from "react"

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck,
  Database,
  Map,
  Radio,
  Cloud,
  Brain,
  ExternalLink,
  Loader2,
  Info,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

/** Fonction utilitaire pour les appels fetch avec SWR */
const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Types pour les données de sources.
 */
interface Source {
  id: string;
  nom: string;
  description: string;
  type: string;
  score_fiabilite: number;
  souverainete: string;
  frequence_maj: string;
  couverture: string;
  url: string | null;
  criteres: {
    fraicheur: number;
    couverture_geo: number;
    souverainete: number;
    precision: number;
  };
}

interface DonneesSources {
  score_global: number;
  nombre_sources: number;
  sources: Source[];
  derniere_verification: string;
  methodologie: string;
}

/**
 * Composant AffichageSources
 *
 * Affiche les sources de données avec leurs scores de fiabilité,
 * un graphique radar de comparaison et la méthodologie de scoring.
 */
export function AffichageSources() {
  const { data, isLoading } = useSWR<DonneesSources>(
    "/api/sources/reliability",
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-8">
      {/* === SCORE GLOBAL === */}
      <div className="grid gap-4 md:grid-cols-3">
        <CarteStatistique
          titre="Score global"
          valeur={`${data.score_global}/100`}
          description="Fiabilite moyenne de toutes les sources"
          couleur="text-primary"
        />
        <CarteStatistique
          titre="Sources actives"
          valeur={String(data.nombre_sources)}
          description="Sources de donnees verifiees et operationnelles"
          couleur="text-calm"
        />
        <CarteStatistique
          titre="Derniere verification"
          valeur="Temps reel"
          description={`Mise a jour : ${new Date(data.derniere_verification).toLocaleTimeString("fr-FR")}`}
          couleur="text-accent"
        />
      </div>

      {/* === GRAPHIQUE RADAR === */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">
            Comparaison des sources par critere
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GraphiqueRadarSources sources={data.sources} />
        </CardContent>
      </Card>

      {/* === LISTE DES SOURCES === */}
      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Detail des sources
        </h2>
        {data.sources.map((source) => (
          <CarteSource key={source.id} source={source} />
        ))}
      </div>

      {/* === MÉTHODOLOGIE === */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-6">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-heading font-semibold text-foreground">
              Methodologie de scoring
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {data.methodologie}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Carte de statistique simple avec valeur mise en avant.
 */
function CarteStatistique({
  titre,
  valeur,
  description,
  couleur,
}: {
  titre: string;
  valeur: string;
  description: string;
  couleur: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
        <p className="text-sm text-muted-foreground">{titre}</p>
        <p className={`font-heading text-3xl font-bold ${couleur}`}>
          {valeur}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Graphique Radar comparant les sources sur 4 critères.
 * Utilise Recharts pour un rendu clair et informatif.
 */
function GraphiqueRadarSources({ sources }: { sources: Source[] }) {
  // Transformer les données pour le format Recharts radar
  const criteres = ["fraicheur", "couverture_geo", "souverainete", "precision"];
  const labelsTraduction: Record<string, string> = {
    fraicheur: "Fraicheur",
    couverture_geo: "Couverture",
    souverainete: "Souverainete",
    precision: "Precision",
  };

  const donneesRadar = criteres.map((critere) => {
    const point: Record<string, string | number> = {
      critere: labelsTraduction[critere],
    };
    sources.forEach((source) => {
      point[source.nom] =
        source.criteres[critere as keyof typeof source.criteres];
    });
    return point;
  });

  // Couleurs pour chaque source
  const couleurs = [
    "hsl(213, 60%, 45%)",
    "hsl(25, 95%, 55%)",
    "hsl(160, 50%, 45%)",
    "hsl(280, 50%, 55%)",
    "hsl(45, 90%, 50%)",
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={donneesRadar}>
        <PolarGrid stroke="hsl(210, 20%, 88%)" />
        <PolarAngleAxis
          dataKey="critere"
          tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "hsl(215, 15%, 60%)" }}
        />
        {sources.map((source, index) => (
          <Radar
            key={source.id}
            name={source.nom}
            dataKey={source.nom}
            stroke={couleurs[index % couleurs.length]}
            fill={couleurs[index % couleurs.length]}
            fillOpacity={0.1}
            strokeWidth={2}
          />
        ))}
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/**
 * Carte détaillée pour une source de données individuelle.
 * Affiche le score, la description, les critères et un lien vers la source.
 */
function CarteSource({ source }: { source: Source }) {
  // Icône selon le type de source
  const icones: Record<string, React.ReactNode> = {
    opendata: <Database className="h-5 w-5" />,
    cartographie: <Map className="h-5 w-5" />,
    capteurs: <Radio className="h-5 w-5" />,
    meteo: <Cloud className="h-5 w-5" />,
    ia: <Brain className="h-5 w-5" />,
  };

  // Couleur du badge de score
  const couleurScore =
    source.score_fiabilite >= 90
      ? "bg-calm text-[hsl(0,0%,100%)]"
      : source.score_fiabilite >= 80
        ? "bg-primary text-primary-foreground"
        : "bg-accent text-accent-foreground";

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:gap-6">
        {/* Icône et score */}
        <div className="flex items-center gap-3 md:flex-col md:items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icones[source.type] || <ShieldCheck className="h-5 w-5" />}
          </div>
          <Badge className={`${couleurScore} text-sm`}>
            {source.score_fiabilite}/100
          </Badge>
        </div>

        {/* Informations détaillées */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {source.nom}
            </h3>
            <Badge variant="outline" className="text-xs">
              {source.souverainete}
            </Badge>
          </div>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {source.description}
          </p>

          {/* Métadonnées */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Mise a jour : {source.frequence_maj}</span>
            <span>Couverture : {source.couverture}</span>
          </div>

          {/* Barres de progression par critère */}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {Object.entries(source.criteres).map(([cle, valeur]) => (
              <div key={cle} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="capitalize text-muted-foreground">
                    {cle.replace("_", " ")}
                  </span>
                  <span className="font-medium text-foreground">{valeur}%</span>
                </div>
                <Progress value={valeur} className="h-1.5" />
              </div>
            ))}
          </div>

          {/* Lien externe */}
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Visiter la source
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
