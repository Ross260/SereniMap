"use client";

import { useMemo } from "react";

/**
 * Props du composant JaugeConfort.
 * @param score - Score de confort de 0 à 100
 * @param label - Texte descriptif affiché sous la jauge
 */
interface PropsJaugeConfort {
  score: number;
  label: string;
}

/**
 * Composant JaugeConfort
 *
 * Jauge circulaire indiquant le niveau de confort social d'un trajet.
 * Score de 0 (très inconfortable) à 100 (très confortable).
 *
 * Couleurs adaptées pour ne pas provoquer d'anxiété :
 *   - Vert doux (bon confort)
 *   - Bleu (confort moyen)
 *   - Orange (à améliorer)
 */
export function JaugeConfort({ score, label }: PropsJaugeConfort) {
  /**
   * Calcul des propriétés visuelles de la jauge.
   * Le cercle SVG utilise strokeDasharray pour simuler un remplissage progressif.
   */
  const { couleur, message, pourcentageArc } = useMemo(() => {
    // Couleur en fonction du score
    let couleur: string;
    let message: string;

    if (score >= 75) {
      couleur = "hsl(160, 50%, 45%)"; // Vert doux
      message = "Trajet tres confortable";
    } else if (score >= 50) {
      couleur = "hsl(213, 60%, 45%)"; // Bleu primaire
      message = "Confort acceptable";
    } else if (score >= 30) {
      couleur = "hsl(35, 90%, 55%)"; // Orange doux
      message = "Confort limite";
    } else {
      couleur = "hsl(15, 80%, 55%)"; // Orange foncé
      message = "Trajet inconfortable";
    }

    // Calcul du pourcentage d'arc (cercle de 270° max)
    const pourcentageArc = (score / 100) * 270;

    return { couleur, message, pourcentageArc };
  }, [score]);

  // Paramètres du cercle SVG
  const rayon = 70;
  const circonference = 2 * Math.PI * rayon;
  const arcMax = (270 / 360) * circonference;
  const arcRempli = (pourcentageArc / 270) * arcMax;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Cercle de fond (gris clair) */}
          <circle
            cx="90"
            cy="90"
            r={rayon}
            fill="none"
            stroke="hsl(210, 20%, 90%)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${arcMax} ${circonference}`}
            strokeDashoffset={0}
            transform="rotate(135 90 90)"
          />

          {/* Cercle de progression (couleur dynamique) */}
          <circle
            cx="90"
            cy="90"
            r={rayon}
            fill="none"
            stroke={couleur}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${arcRempli} ${circonference}`}
            strokeDashoffset={0}
            transform="rotate(135 90 90)"
            className="transition-all duration-1000 ease-out"
          />

          {/* Score numérique au centre */}
          <text
            x="90"
            y="82"
            textAnchor="middle"
            className="text-3xl font-bold"
            fill={couleur}
            fontFamily="system-ui"
            fontSize="36"
            fontWeight="700"
          >
            {score}
          </text>

          {/* Label "/ 100" */}
          <text
            x="90"
            y="105"
            textAnchor="middle"
            fill="hsl(215, 15%, 50%)"
            fontFamily="system-ui"
            fontSize="13"
          >
            / 100
          </text>
        </svg>
      </div>

      {/* Message de confort */}
      <p className="text-sm font-medium" style={{ color: couleur }}>
        {message}
      </p>

      {/* Label descriptif */}
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
