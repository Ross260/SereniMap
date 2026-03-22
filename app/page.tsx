import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Route,
  ShieldCheck,
  TreePine,
  Brain,
  Heart,
  ArrowRight,
  Clock,
  Users,
} from "lucide-react";

/**
 * Page d'accueil de SereniMap.
 * Présente la plateforme en plusieurs sections avec des liens vers les autres pages.
 * Design apaisant avec les couleurs du thème (bleu doux, orange accent, blanc).
 */
export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* === SECTION HERO === */}
      <SectionHero />
      {/* === SECTION FONCTIONNALITÉS === */}
      <SectionFonctionnalites />
      {/* === SECTION COMMENT ÇA MARCHE === */}
      <SectionCommentCaMarche />
      {/* === SECTION APPEL À L'ACTION === */}
      <SectionAppelAction />
      {/* === PIED DE PAGE === */}
      <PiedDePage />
    </div>
  );
}

/**
 * Section Hero : introduction accueillante et rassurante.
 * Met en avant la mission de l'application.
 */
function SectionHero() {
  return (
    <section className="relative overflow-hidden bg-primary px-4 py-24 text-primary-foreground lg:py-32">
      {/* Cercles décoratifs subtils en arrière-plan */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[hsl(213,60%,52%)] opacity-20" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-accent opacity-10" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        {/* Icône principale */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent shadow-lg">
          <MapPin className="h-10 w-10 text-accent-foreground" />
        </div>

        <h1 className="font-heading text-balance text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
          Naviguez en toute serenite
        </h1>

        <p className="max-w-2xl text-balance text-lg leading-relaxed opacity-90 md:text-xl">
          SereniMap vous aide a vous deplacer sereinement en evitant les zones de
          forte affluence. Visualisez la densite de foule en temps reel, trouvez
          des itineraires calmes et reprenez confiance dans vos deplacements.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-[hsl(25,95%,48%)]"
          >
            <Link href="/carte">
              Explorer la carte
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Link href="/itineraire">Planifier un trajet</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/**
 * Section Fonctionnalités : présente les 4 piliers de l'application.
 * Chaque carte redirige vers la page correspondante.
 */
function SectionFonctionnalites() {
  const fonctionnalites = [
    {
      icone: MapPin,
      titre: "Carte de densite en temps reel",
      description:
        "Visualisez les zones calmes et animees sur une carte interactive. Les couleurs douces vous guident : bleu pour le calme, orange pour les zones a eviter.",
      lien: "/carte",
      labelLien: "Voir la carte",
    },
    {
      icone: Route,
      titre: "Itineraires adaptes",
      description:
        "Comparez le trajet le plus rapide avec le plus calme. Notre algorithme privilegie les rues secondaires et les espaces ouverts pour votre confort.",
      lien: "/itineraire",
      labelLien: "Planifier un trajet",
    },
    {
      icone: ShieldCheck,
      titre: "Donnees transparentes",
      description:
        "Consultez les sources de donnees et leurs scores de fiabilite. Notre engagement : une totale transparence sur l'origine des informations.",
      lien: "/sources",
      labelLien: "Voir les sources",
    },
    {
      icone: TreePine,
      titre: "Points de repli",
      description:
        "Identifiez les endroits calmes le long de votre trajet : parcs, petites rues, espaces verts. Des refuges pour souffler si besoin.",
      lien: "/carte",
      labelLien: "Decouvrir les refuges",
    },
  ];

  return (
    <section className="bg-background px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="font-heading text-balance text-3xl font-bold text-foreground md:text-4xl">
            Des outils concus pour votre bien-etre
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Chaque fonctionnalite a ete pensee pour reduire l'anxiete liee aux
            deplacements et vous redonner le controle.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {fonctionnalites.map((f) => (
            <div
              key={f.titre}
              className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <f.icone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-card-foreground">
                {f.titre}
              </h3>
              <p className="flex-1 leading-relaxed text-muted-foreground">
                {f.description}
              </p>
              <Link
                href={f.lien}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-accent"
              >
                {f.labelLien}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Section "Comment ça marche" : explique le processus en 3 étapes simples.
 * Rassure l'utilisateur sur la simplicité d'utilisation.
 */
function SectionCommentCaMarche() {
  const etapes = [
    {
      numero: 1,
      icone: Clock,
      titre: "Consultez la densite",
      description:
        "Ouvrez la carte et visualisez instantanement les niveaux de frequentation autour de vous ou de votre destination.",
    },
    {
      numero: 2,
      icone: Brain,
      titre: "Laissez l'IA vous guider",
      description:
        "Notre algorithme analyse les donnees en temps reel et historiques pour vous proposer l'itineraire le plus apaisant.",
    },
    {
      numero: 3,
      icone: Heart,
      titre: "Deplacez-vous sereinement",
      description:
        "Suivez votre itineraire calme avec des points de repli identifies. Vous gardez le controle a chaque etape.",
    },
  ];

  return (
    <section className="bg-secondary px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="font-heading text-balance text-3xl font-bold text-secondary-foreground md:text-4xl">
            Comment ca marche ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Trois etapes simples pour des deplacements plus sereins.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {etapes.map((etape) => (
            <div key={etape.numero} className="flex flex-col items-center gap-4 text-center">
              {/* Numéro de l'étape */}
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <etape.icone className="h-7 w-7" />
                </div>
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {etape.numero}
                </span>
              </div>
              <h3 className="font-heading text-lg font-semibold text-secondary-foreground">
                {etape.titre}
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                {etape.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Section d'appel à l'action : incite l'utilisateur à essayer.
 */
function SectionAppelAction() {
  return (
    <section className="bg-primary px-4 py-20 text-primary-foreground">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <Users className="h-12 w-12 opacity-80" />
        <h2 className="font-heading text-balance text-3xl font-bold md:text-4xl">
          Rejoignez une communaute bienveillante
        </h2>
        <p className="max-w-xl text-balance text-lg leading-relaxed opacity-90">
          SereniMap est concu avec et pour les personnes vivant avec une phobie
          sociale. Votre confort est notre priorite.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-[hsl(25,95%,48%)]"
          >
            <Link href="/profil">
              Creer mon profil
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Link href="/sources">En savoir plus sur nos donnees</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/**
 * Pied de page minimaliste avec liens utiles.
 */
function PiedDePage() {
  return (
    <footer className="border-t border-border bg-card px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="font-heading text-lg font-semibold text-card-foreground">
            SereniMap
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Naviguer en toute serenite, chaque jour.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground" aria-label="Liens du pied de page">
          <Link href="/carte" className="transition-colors hover:text-primary">
            Carte
          </Link>
          <Link href="/itineraire" className="transition-colors hover:text-primary">
            Itineraire
          </Link>
          <Link href="/sources" className="transition-colors hover:text-primary">
            Sources
          </Link>
          <Link href="/profil" className="transition-colors hover:text-primary">
            Profil
          </Link>
        </nav>
      </div>
    </footer>
  );
}
