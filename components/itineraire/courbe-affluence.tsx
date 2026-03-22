"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/**
 * Props du composant CourbeAffluence.
 * @param donnees - Tableau de données horaires avec score de densité
 */
interface PropsCourbeAffluence {
  donnees: Array<{
    heure: number;
    label: string;
    score_densite: number;
    niveau: string;
  }>;
}

/**
 * Composant CourbeAffluence
 *
 * Graphique Recharts montrant l'évolution de la foule sur 24 heures.
 * Design apaisant avec dégradé bleu et ligne orange pour l'heure actuelle.
 * Permet à l'utilisateur de choisir le meilleur moment pour se déplacer.
 */
export function CourbeAffluence({ donnees }: PropsCourbeAffluence) {
  const heureActuelle = new Date().getHours();

  return (
    <div className="flex flex-col gap-4">
      {/* Indications textuelles */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Affluence prevue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-accent" />
          <span className="text-muted-foreground">Heure actuelle ({heureActuelle}h)</span>
        </div>
      </div>

      {/* Graphique principal */}
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={donnees}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {/* Grille de fond subtile */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(210, 20%, 88%)"
            vertical={false}
          />

          {/* Axe horizontal : heures de la journée */}
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }}
            axisLine={{ stroke: "hsl(210, 20%, 88%)" }}
            tickLine={false}
          />

          {/* Axe vertical : score de densité (0-100) */}
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `${val}%`}
          />

          {/* Info-bulle personnalisée au survol */}
          <Tooltip content={<InfoBullePersonnalisee />} />

          {/* Ligne verticale indiquant l'heure actuelle */}
          <ReferenceLine
            x={`${heureActuelle}h`}
            stroke="hsl(25, 95%, 55%)"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: "Maintenant",
              position: "top",
              fill: "hsl(25, 95%, 55%)",
              fontSize: 11,
            }}
          />

          {/* Zone recommandée (en dessous de 40% = confortable) */}
          <ReferenceLine
            y={40}
            stroke="hsl(160, 50%, 45%)"
            strokeDasharray="8 4"
            strokeWidth={1}
            label={{
              value: "Seuil de confort",
              position: "right",
              fill: "hsl(160, 50%, 45%)",
              fontSize: 11,
            }}
          />

          {/* Définition du dégradé pour l'aire */}
          <defs>
            <linearGradient id="degradeAffluence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(213, 60%, 45%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(213, 60%, 45%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          {/* Courbe d'affluence avec aire remplie */}
          <Area
            type="monotone"
            dataKey="score_densite"
            stroke="hsl(213, 60%, 45%)"
            strokeWidth={2.5}
            fill="url(#degradeAffluence)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "hsl(213, 60%, 45%)",
              stroke: "white",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Conseil sous le graphique */}
      <MeilleursMoments donnees={donnees} />
    </div>
  );
}

/**
 * Info-bulle personnalisée affichée au survol du graphique.
 * Donne un message adapté au niveau de densité.
 */
function InfoBullePersonnalisee({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { niveau: string } }>;
  label?: string;
}) {
  if (!active || !payload?.[0]) return null;

  const score = payload[0].value;
  const niveau = payload[0].payload.niveau;

  const messages: Record<string, string> = {
    calme: "Excellent moment pour sortir !",
    modere: "Affluence acceptable",
    dense: "Privilegiez un autre moment",
    tres_dense: "Heure de pointe - A eviter",
  };

  const couleurs: Record<string, string> = {
    calme: "hsl(160, 50%, 45%)",
    modere: "hsl(45, 90%, 50%)",
    dense: "hsl(25, 95%, 55%)",
    tres_dense: "hsl(0, 72%, 50%)",
  };

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-card-foreground">{label}</p>
      <p className="text-lg font-bold" style={{ color: couleurs[niveau] }}>
        {score}%
      </p>
      <p className="text-xs text-muted-foreground">{messages[niveau]}</p>
    </div>
  );
}

/**
 * Composant affichant les meilleurs moments pour se déplacer.
 * Identifie les créneaux les plus calmes de la journée.
 */
function MeilleursMoments({
  donnees,
}: {
  donnees: Array<{ heure: number; label: string; score_densite: number }>;
}) {
  // Trouver les 3 heures les plus calmes
  const heuresCalmes = [...donnees]
    .sort((a, b) => a.score_densite - b.score_densite)
    .slice(0, 3);

  return (
    <div className="rounded-lg bg-calm/10 p-4">
      <p className="mb-2 text-sm font-semibold text-foreground">
        Meilleurs moments pour se deplacer
      </p>
      <div className="flex flex-wrap gap-2">
        {heuresCalmes.map((h) => (
          <span
            key={h.heure}
            className="rounded-full bg-calm px-3 py-1 text-xs font-medium text-[hsl(0,0%,100%)]"
          >
            {h.label} - {h.score_densite}% d'affluence
          </span>
        ))}
      </div>
    </div>
  );
}
