/* ==========================================================================
   data.js - Contenus pédagogiques
   « Posture managériale : entre la direction et l'équipe »
   Séquence : « Je ne suis pas d'accord avec la décision de ma direction »
   Grille : Contester → Arbitrer → Porter

   Ce fichier peut être modifié sans toucher à app.js ni admin.js.
   Chaque rôle d'une scène est une liste de « blocs » :
     { t: "p",     text: "Paragraphe" }
     { t: "h3",    text: "Sous-titre" }
     { t: "ul",    items: ["Puce 1", "Puce 2"] }
     { t: "quote", text: "Citation" }
     { t: "alert", text: "Point de vigilance (encadré orange)" }
     { t: "desc" }   repères D-E-S-C (voir « desc » plus bas)

   Rappel : le cloisonnement des rôles est pédagogique, pas informatique.
   Toute personne qui ouvre ce fichier peut lire tous les contenus.
   ========================================================================== */
(function () {
  "use strict";

  /* Bloc « observateur » : même structure pour toutes les scènes */
  function obs(quoi, points) {
    return [
      { t: "p", text: "Vous observez " + quoi + ". Vous n’intervenez pas : vous notez ce que vous entendez, avec des exemples concrets." },
      { t: "h3", text: "Points spécifiques à observer" },
      { t: "ul", items: points }
    ];
  }

  window.POSTURE_DATA = {
    titre: "Posture managériale : entre la direction et l’équipe",
    sousTitre: "« Je ne suis pas d’accord avec la décision de ma direction »",
    dureeSimulation: 180,   /* secondes : durée d'une scène (3 minutes) */
    alerteSecondes: 60,     /* alerte visuelle à 1 minute de la fin */
    participants: ["A", "B", "C"],

    rythme: [
      { label: "Lecture", minutes: 1 },
      { label: "Scène 1", minutes: 3 },
      { label: "Bascule", minutes: 1 },
      { label: "Scène 2", minutes: 3 },
      { label: "Débriefing", minutes: 3 }
    ],

    roles: {
      manager: {
        label: "Manager",
        desc: "Vous êtes pris entre la décision de la direction et les attentes de votre équipe.",
        titreContenu: "Votre contexte et votre mission"
      },
      interlocuteur: {
        label: "Interlocuteur",
        long: "Interlocuteur (direction, puis équipe)",
        desc: "Vous jouez la direction, puis un membre de l’équipe du manager.",
        descScene: {
          1: "Vous jouez la direction, qui a préparé la décision.",
          2: "Vous jouez un membre de l’équipe du manager."
        },
        labelScene: { 1: "Direction", 2: "Membre de l’équipe" },
        titreContenu: "Votre fiche confidentielle"
      },
      observateur: {
        label: "Observateur",
        desc: "Vous observez les deux scènes sans intervenir et vous renseignez la grille d’observation.",
        titreContenu: "Votre mission d’observation"
      }
    },

    scenes: {
      1: { titre: "Scène 1 : l’entretien avec la direction", court: "Entretien avec la direction" },
      2: { titre: "Scène 2 : l’échange avec l’équipe", court: "Échange avec l’équipe" }
    },

    /* Rotation : chaque participant joue une fois chaque rôle */
    rotation: {
      1: { A: "manager",       B: "interlocuteur", C: "observateur" },
      2: { A: "observateur",   B: "manager",       C: "interlocuteur" },
      3: { A: "interlocuteur", B: "observateur",   C: "manager" }
    },

    /* Repères pour formuler un message d'alerte (D-E-S-C) */
    desc: [
      { lettre: "D", phrase: "Je constate que…" },
      { lettre: "E", phrase: "Mon point d’alerte concerne…" },
      { lettre: "S", phrase: "Je propose que…" },
      { lettre: "C", phrase: "L’intérêt serait de…" }
    ],

    /* ----------------------------------------------------------------------
       SCÉNARIOS (une manche chacun) : scène 1 → bascule → scène 2
       « titre » est volontairement neutre. « notesAnimateur » n'est jamais
       affiché aux participants.
       ---------------------------------------------------------------------- */
    scenarios: [
      /* ===================== MANCHE 1 : guichet unique ===================== */
      {
        id: 1,
        titre: "La nouvelle organisation du service",
        notesAnimateur: {
          decision: "Guichet unique : les demandes clients sont traitées par étapes, par des collaborateurs spécialisés, au lieu d’un traitement de bout en bout.",
          marge: "La direction maintient le principe. Elle peut accorder une phase pilote de deux semaines ou un référent par dossier sensible si le manager apporte des faits et une alternative."
        },
        scene1: {
          manager: [
            { t: "p", text: "Vous managez une équipe de 8 personnes dans un service Relation clients. La direction (Mme Roche) prépare une décision qui n’est pas encore définitive : vous avez 3 minutes avec elle avant l’arbitrage." },
            { t: "h3", text: "Ce que demande la direction" },
            { t: "ul", items: [
              "mettre en place un guichet unique : les demandes ne sont plus traitées de bout en bout par une seule personne, mais par étapes ;",
              "réduire les délais de traitement ;",
              "déploiement dans six semaines."
            ] },
            { t: "h3", text: "Ce que votre équipe attend (ce que vous en savez)" },
            { t: "ul", items: [
              "garder le lien avec les clients dont elle a la charge ;",
              "comprendre pourquoi on change une organisation qui fonctionne ;",
              "voir son expertise reconnue."
            ] },
            { t: "h3", text: "Ce que vous constatez sur le terrain" },
            { t: "ul", items: [
              "les clients demandent souvent « leur » conseiller ;",
              "sur un site voisin, des erreurs sont apparues lors des passages de relais entre étapes ;",
              "les collaborateurs les plus expérimentés craignent de perdre l’intérêt de leur métier."
            ] },
            { t: "h3", text: "Votre mission" },
            { t: "p", text: "Vous n’êtes pas d’accord avec la décision telle qu’elle est envisagée. Exercez votre devoir d’alerte :" },
            { t: "ul", items: [
              "questionner et demander les raisons de la décision ;",
              "apporter des informations du terrain ;",
              "présenter les conséquences prévisibles ;",
              "proposer une alternative ;",
              "signaler un risque."
            ] },
            { t: "desc" }
          ],
          interlocuteur: [
            { t: "p", text: "Vous jouez Mme Roche, directrice. Vous avez préparé une décision pour améliorer le service rendu aux clients." },
            { t: "h3", text: "Vos raisons" },
            { t: "ul", items: [
              "les délais de traitement dépassent régulièrement l’objectif ;",
              "quand un collaborateur est absent, ses dossiers restent en attente ;",
              "le principe a été validé au niveau du groupe."
            ] },
            { t: "h3", text: "Votre marge de manœuvre" },
            { t: "p", text: "Vous ne remettez pas le principe en cause. Vous pouvez ajuster les modalités si le manager vous apporte des faits précis et une alternative argumentée (par exemple une phase pilote de deux semaines ou un référent par dossier sensible)." },
            { t: "h3", text: "Comment jouer votre rôle" },
            { t: "alert", text: "Ne cédez pas tout de suite." },
            { t: "ul", items: [
              "Si le manager critique sans faits, restez sur vos raisons.",
              "S’il pose des questions, apporte des faits et propose une alternative, reconnaissez l’intérêt de ses informations.",
              "À la fin des 3 minutes, annoncez votre arbitrage : « La décision est maintenue. » et, seulement si l’alerte l’a justifié, l’ajustement que vous acceptez."
            ] }
          ],
          observateur: obs("l’entretien entre le manager et la direction", [
            "le manager demande-t-il les raisons avant de contester ?",
            "s’appuie-t-il sur des faits du terrain (relation client, passages de relais) plutôt que sur une opinion ?",
            "propose-t-il une alternative réaliste ?"
          ])
        },
        bascule: {
          texte: "La direction a entendu vos objections et rend son arbitrage : la décision est maintenue. L’ajustement éventuel est annoncé par la direction.",
          manager: "Écoutez l’arbitrage annoncé : il est rendu. Prenez quelques instants pour réfléchir à la manière dont vous allez présenter la décision à votre équipe.",
          interlocuteur: "Vous avez annoncé l’arbitrage en tant que direction. Dans la scène suivante, vous jouez Camille, membre de l’équipe : votre fiche s’affichera au démarrage.",
          observateur: "La scène 2 va commencer : le manager retrouve son équipe. Poursuivez vos observations."
        },
        scene2: {
          manager: [
            { t: "p", text: "La direction a arbitré : la décision est maintenue. Vous retrouvez votre équipe, représentée par Camille, qui a appris la décision et a des questions. Vous disposez de 3 minutes." },
            { t: "h3", text: "Votre mission" },
            { t: "p", text: "Échanger avec Camille et préparer la mise en œuvre de la décision :" },
            { t: "ul", items: [
              "écouter ses réactions ;",
              "répondre à ses questions ;",
              "préparer la suite : ce que la décision implique concrètement et les difficultés à anticiper."
            ] }
          ],
          interlocuteur: [
            { t: "p", text: "Vous jouez Camille, membre de l’équipe. Vous apprenez que la décision est maintenue : vous la trouvez absurde. Vous avez entendu votre manager émettre des réserves quand elle a été évoquée." },
            { t: "h3", text: "Ce que vous attendez de votre manager" },
            { t: "ul", items: [
              "comprendre pourquoi cette décision est prise ;",
              "savoir que votre point de vue a été entendu et défendu ;",
              "savoir concrètement ce qui change pour vous et comment ce sera accompagné ;",
              "pouvoir compter sur un manager honnête, qui ne vous raconte pas d’histoires."
            ] },
            { t: "h3", text: "Comment jouer votre rôle" },
            { t: "alert", text: "Commencez par : « Franchement, cette nouvelle organisation n’a aucun sens. Vous êtes d’accord avec ça, vous ? »" },
            { t: "ul", items: [
              "Si le manager se désolidarise (« moi non plus, mais ça vient d’en haut »), amplifiez : « Alors pourquoi on devrait le faire ? », « Ils ne comprennent rien au terrain. »",
              "S’il affirme tout approuver alors que vous l’avez entendu douter, doutez à votre tour : « Ah bon ? Pourtant vous n’aviez pas l’air convaincu. »",
              "S’il reconnaît votre réaction, dit avoir questionné avant l’arbitrage, explique la décision sans la renier et propose de regarder ce qu’elle implique concrètement, apaisez-vous et posez des questions pratiques."
            ] }
          ],
          observateur: obs("l’échange entre le manager et son équipe", [
            "comment le manager répond-il à la question « Vous êtes d’accord ? » ?",
            "dit-il ce qu’il a fait avant l’arbitrage ?",
            "traduit-il la décision en conséquences concrètes pour l’équipe ?"
          ])
        }
      },

      /* ===================== MANCHE 2 : outil de suivi ===================== */
      {
        id: 2,
        titre: "Le nouvel outil de suivi",
        notesAnimateur: {
          decision: "Saisie quotidienne (environ 20 minutes) de l’activité dans un nouvel outil de suivi, pour préparer un audit client.",
          marge: "La direction maintient l’outil et la date de l’audit. Elle peut simplifier le format de saisie ou prévoir un bilan après un mois si le manager apporte des faits et une alternative (extraction automatique d’une partie des données)."
        },
        scene1: {
          manager: [
            { t: "p", text: "Vous managez une équipe de 10 personnes dans un service qui produit des dossiers clients. La direction (M. Delmas, directeur adjoint) prépare une décision qui n’est pas encore définitive : vous avez 3 minutes avec lui avant l’arbitrage." },
            { t: "h3", text: "Ce que demande la direction" },
            { t: "ul", items: [
              "chaque collaborateur saisira chaque soir son activité dans un nouvel outil de suivi (environ 20 minutes par jour) ;",
              "objectif : disposer de preuves de traçabilité pour un audit client dans trois mois ;",
              "mise en service dans quatre semaines."
            ] },
            { t: "h3", text: "Ce que votre équipe attend (ce que vous en savez)" },
            { t: "ul", items: [
              "ne pas subir une charge supplémentaire sans contrepartie ;",
              "savoir à quoi serviront les données saisies ;",
              "ne pas être traitée comme une équipe que l’on contrôle."
            ] },
            { t: "h3", text: "Ce que vous constatez sur le terrain" },
            { t: "ul", items: [
              "les mêmes informations figurent déjà dans deux autres outils ;",
              "les fins de journée sont déjà les moments les plus chargés ;",
              "le service informatique pense qu’une extraction automatique est possible (à confirmer)."
            ] },
            { t: "h3", text: "Votre mission" },
            { t: "p", text: "Vous n’êtes pas d’accord avec la décision telle qu’elle est envisagée. Exercez votre devoir d’alerte :" },
            { t: "ul", items: [
              "questionner et demander les raisons de la décision ;",
              "apporter des informations du terrain ;",
              "présenter les conséquences prévisibles ;",
              "proposer une alternative ;",
              "signaler un risque."
            ] },
            { t: "desc" }
          ],
          interlocuteur: [
            { t: "p", text: "Vous jouez M. Delmas, directeur adjoint. Vous avez préparé une décision pour répondre à une exigence d’un client." },
            { t: "h3", text: "Vos raisons" },
            { t: "ul", items: [
              "l’audit client a une date fixe et conditionne un contrat important ;",
              "l’outil est déjà acheté et paramétré ;",
              "la traçabilité doit être prouvée par une saisie régulière."
            ] },
            { t: "h3", text: "Votre marge de manœuvre" },
            { t: "p", text: "Vous ne remettez pas en cause l’outil ni la date de l’audit. Vous pouvez simplifier le format de saisie ou prévoir un bilan après un mois si le manager vous apporte des faits précis et une alternative argumentée (par exemple une extraction automatique d’une partie des données)." },
            { t: "h3", text: "Comment jouer votre rôle" },
            { t: "alert", text: "Ne cédez pas tout de suite." },
            { t: "ul", items: [
              "Si le manager critique sans faits, restez sur vos raisons.",
              "S’il pose des questions, apporte des faits et propose une alternative, reconnaissez l’intérêt de ses informations.",
              "À la fin des 3 minutes, annoncez votre arbitrage : « La décision est maintenue. » et, seulement si l’alerte l’a justifié, l’ajustement que vous acceptez."
            ] }
          ],
          observateur: obs("l’entretien entre le manager et la direction", [
            "le manager demande-t-il à quoi serviront les données avant de contester ?",
            "s’appuie-t-il sur des faits (doublons entre outils, charge de fin de journée) plutôt que sur une opinion ?",
            "propose-t-il une alternative réaliste ?"
          ])
        },
        bascule: {
          texte: "La direction a entendu vos objections et rend son arbitrage : l’outil de suivi est maintenu. L’ajustement éventuel est annoncé par la direction.",
          manager: "Écoutez l’arbitrage annoncé : il est rendu. Prenez quelques instants pour réfléchir à la manière dont vous allez présenter la décision à votre équipe.",
          interlocuteur: "Vous avez annoncé l’arbitrage en tant que direction. Dans la scène suivante, vous jouez Karim, membre de l’équipe : votre fiche s’affichera au démarrage.",
          observateur: "La scène 2 va commencer : le manager retrouve son équipe. Poursuivez vos observations."
        },
        scene2: {
          manager: [
            { t: "p", text: "La direction a arbitré : l’outil de suivi est maintenu. Vous retrouvez votre équipe, représentée par Karim, qui a appris la décision et a des questions. Vous disposez de 3 minutes." },
            { t: "h3", text: "Votre mission" },
            { t: "p", text: "Échanger avec Karim et préparer la mise en œuvre de la décision :" },
            { t: "ul", items: [
              "écouter ses réactions ;",
              "répondre à ses questions ;",
              "préparer la suite : ce que la décision implique concrètement et les difficultés à anticiper."
            ] }
          ],
          interlocuteur: [
            { t: "p", text: "Vous jouez Karim, membre de l’équipe. Vous apprenez que l’outil de suivi est maintenu : encore de l’administratif pour rien, selon vous. Vous avez entendu votre manager émettre des réserves quand il a été évoqué." },
            { t: "h3", text: "Ce que vous attendez de votre manager" },
            { t: "ul", items: [
              "comprendre pourquoi et à quoi serviront les données ;",
              "que votre charge de travail soit prise en compte ;",
              "que votre expérience du terrain compte ;",
              "pouvoir compter sur un manager honnête, qui ne vous raconte pas d’histoires."
            ] },
            { t: "h3", text: "Comment jouer votre rôle" },
            { t: "alert", text: "Commencez par : « Encore un outil de plus… Franchement, vous trouvez ça utile, vous ? »" },
            { t: "ul", items: [
              "Si le manager se désolidarise (« moi non plus, mais ça vient d’en haut »), amplifiez : « Alors pourquoi on le ferait ? », « Ils ne savent pas ce qu’on vit. »",
              "S’il affirme tout approuver alors que vous l’avez entendu douter, doutez à votre tour : « Ah bon ? Pourtant vous n’aviez pas l’air convaincu. »",
              "S’il reconnaît votre réaction, dit avoir questionné avant l’arbitrage, explique la décision sans la renier et propose de regarder ce qu’elle implique concrètement, apaisez-vous et posez des questions pratiques."
            ] }
          ],
          observateur: obs("l’échange entre le manager et son équipe", [
            "comment le manager répond-il à la question « Vous trouvez ça utile ? »",
            "dit-il ce qu’il a fait avant l’arbitrage ?",
            "traduit-il la décision en conséquences concrètes pour l’équipe (temps de saisie, bilan) ?"
          ])
        }
      },

      /* ===================== MANCHE 3 : horaires ===================== */
      {
        id: 3,
        titre: "Les nouveaux horaires",
        notesAnimateur: {
          decision: "Deux jours par semaine, l’équipe commence à 7 h au lieu de 9 h, par roulement, pour répondre à l’exigence d’un client.",
          marge: "La direction maintient l’exigence client. Elle peut accorder la priorité aux volontaires, les échanges entre collègues et un bilan après deux mois si le manager apporte des faits et une alternative."
        },
        scene1: {
          manager: [
            { t: "p", text: "Vous managez une équipe de 9 personnes dans un service Support client. La direction (Mme Garnier, directrice d’exploitation) prépare une décision qui n’est pas encore définitive : vous avez 3 minutes avec elle avant l’arbitrage." },
            { t: "h3", text: "Ce que demande la direction" },
            { t: "ul", items: [
              "deux jours par semaine, l’équipe commencera à 7 h au lieu de 9 h, par roulement ;",
              "objectif : répondre à l’exigence d’un client majeur ;",
              "début dans un mois."
            ] },
            { t: "h3", text: "Ce que votre équipe attend (ce que vous en savez)" },
            { t: "ul", items: [
              "être prévenue longtemps à l’avance ;",
              "que la répartition soit juste ;",
              "que les contraintes personnelles soient prises en compte."
            ] },
            { t: "h3", text: "Ce que vous constatez sur le terrain" },
            { t: "ul", items: [
              "plusieurs collaborateurs ont des contraintes de garde d’enfants ou de transport ;",
              "un roulement perçu comme inéquitable risque de crisper l’équipe ;",
              "des absences ou des départs sont à craindre si rien n’est prévu en contrepartie."
            ] },
            { t: "h3", text: "Votre mission" },
            { t: "p", text: "Vous n’êtes pas d’accord avec la décision telle qu’elle est envisagée. Exercez votre devoir d’alerte :" },
            { t: "ul", items: [
              "questionner et demander les raisons de la décision ;",
              "apporter des informations du terrain ;",
              "présenter les conséquences prévisibles ;",
              "proposer une alternative ;",
              "signaler un risque."
            ] },
            { t: "desc" }
          ],
          interlocuteur: [
            { t: "p", text: "Vous jouez Mme Garnier, directrice d’exploitation. Vous avez préparé une décision pour respecter un engagement contractuel." },
            { t: "h3", text: "Vos raisons" },
            { t: "ul", items: [
              "le contrat avec un client majeur exige une disponibilité dès 7 h ;",
              "des pénalités sont prévues en cas de non-respect ;",
              "la date de démarrage est fixée contractuellement."
            ] },
            { t: "h3", text: "Votre marge de manœuvre" },
            { t: "p", text: "Vous ne remettez pas en cause l’exigence du client. Vous pouvez ajuster les modalités si le manager vous apporte des faits précis et une alternative argumentée (par exemple priorité aux volontaires, échanges possibles entre collègues, bilan après deux mois)." },
            { t: "h3", text: "Comment jouer votre rôle" },
            { t: "alert", text: "Ne cédez pas tout de suite." },
            { t: "ul", items: [
              "Si le manager critique sans faits, restez sur vos raisons.",
              "S’il pose des questions, apporte des faits et propose une alternative, reconnaissez l’intérêt de ses informations.",
              "À la fin des 3 minutes, annoncez votre arbitrage : « La décision est maintenue. » et, seulement si l’alerte l’a justifié, l’ajustement que vous acceptez."
            ] }
          ],
          observateur: obs("l’entretien entre le manager et la direction", [
            "le manager demande-t-il les raisons et les marges de manœuvre avant de contester ?",
            "s’appuie-t-il sur des faits (contraintes de garde ou de transport, équité du roulement) sans généraliser ?",
            "propose-t-il une alternative réaliste ?"
          ])
        },
        bascule: {
          texte: "La direction a entendu vos objections et rend son arbitrage : les nouveaux horaires sont maintenus. L’ajustement éventuel est annoncé par la direction.",
          manager: "Écoutez l’arbitrage annoncé : il est rendu. Prenez quelques instants pour réfléchir à la manière dont vous allez présenter la décision à votre équipe.",
          interlocuteur: "Vous avez annoncé l’arbitrage en tant que direction. Dans la scène suivante, vous jouez Inès, membre de l’équipe : votre fiche s’affichera au démarrage.",
          observateur: "La scène 2 va commencer : le manager retrouve son équipe. Poursuivez vos observations."
        },
        scene2: {
          manager: [
            { t: "p", text: "La direction a arbitré : les nouveaux horaires sont maintenus. Vous retrouvez votre équipe, représentée par Inès, qui a appris la décision et a des questions. Vous disposez de 3 minutes." },
            { t: "h3", text: "Votre mission" },
            { t: "p", text: "Échanger avec Inès et préparer la mise en œuvre de la décision :" },
            { t: "ul", items: [
              "écouter ses réactions ;",
              "répondre à ses questions ;",
              "préparer la suite : ce que la décision implique concrètement et les difficultés à anticiper."
            ] }
          ],
          interlocuteur: [
            { t: "p", text: "Vous jouez Inès, membre de l’équipe. Vous apprenez que les nouveaux horaires sont maintenus : vous les trouvez injustes et mal préparés. Vous avez entendu votre manager émettre des réserves quand ils ont été évoqués." },
            { t: "h3", text: "Ce que vous attendez de votre manager" },
            { t: "ul", items: [
              "une répartition juste et transparente ;",
              "d’être prévenue longtemps à l’avance ;",
              "que vos contraintes personnelles (transport) soient entendues, sans que vous ayez à vous justifier ;",
              "pouvoir compter sur un manager honnête, qui ne vous raconte pas d’histoires."
            ] },
            { t: "h3", text: "Comment jouer votre rôle" },
            { t: "alert", text: "Commencez par : « Ces horaires, c’est n’importe quoi. Vous, vous les auriez acceptés ? »" },
            { t: "ul", items: [
              "Si le manager se désolidarise (« moi non plus, mais ça vient d’en haut »), amplifiez : « Alors pourquoi on devrait s’y plier ? », « Ils ne se rendent pas compte de ce que ça change pour nous. »",
              "S’il affirme tout approuver alors que vous l’avez entendu douter, doutez à votre tour : « Ah bon ? Pourtant vous n’aviez pas l’air convaincu. »",
              "S’il reconnaît votre réaction, dit avoir questionné avant l’arbitrage, explique la décision sans la renier et propose de regarder ce qu’elle implique concrètement, apaisez-vous et posez des questions pratiques."
            ] }
          ],
          observateur: obs("l’échange entre le manager et son équipe", [
            "comment le manager répond-il à la question « Vous, vous les auriez acceptés ? »",
            "dit-il ce qu’il a fait avant l’arbitrage ?",
            "traduit-il la décision en conséquences concrètes pour l’équipe (prévenance, répartition) ?"
          ])
        }
      }
    ],

    /* ----------------------------------------------------------------------
       GRILLE D'OBSERVATION (13 critères regroupés selon Contester → Arbitrer → Porter)
       ---------------------------------------------------------------------- */
    grille: {
      max: 5,
      amorce: "Le manager…",
      groupes: [
        { id: "contester", titre: "Contester : avant l’arbitrage", criteres: [
          { id: "c1", texte: "Demande les raisons de la décision" },
          { id: "c2", texte: "S’appuie sur des faits du terrain" },
          { id: "c3", texte: "Présente les conséquences prévisibles" },
          { id: "c4", texte: "Propose une alternative" },
          { id: "c5", texte: "Signale clairement un risque" },
          { id: "c6", texte: "Exprime son désaccord sur les faits, sans attaquer la personne" }
        ] },
        { id: "arbitrer", titre: "Arbitrer : changer de position", criteres: [
          { id: "a1", texte: "Reconnaît que l’arbitrage est rendu et cesse de contester" },
          { id: "a2", texte: "Distingue sa conviction personnelle de sa responsabilité de mise en œuvre" }
        ] },
        { id: "porter", titre: "Porter : devant l’équipe", criteres: [
          { id: "p1", texte: "Accueille les réactions de l’équipe sans les amplifier" },
          { id: "p2", texte: "Ne se désolidarise pas de la décision" },
          { id: "p3", texte: "Ne présente pas la direction comme un adversaire commun" },
          { id: "p4", texte: "Reste honnête : ne prétend pas approuver ce qu’il n’approuve pas" },
          { id: "p5", texte: "Traduit la décision en conséquences concrètes et anticipe les difficultés" }
        ] }
      ]
    },

    champsObservateur: [
      { id: "pro",     label: "Phrase la plus professionnelle entendue" },
      { id: "fragile", label: "Phrase fragile repérée" },
      { id: "replay",  label: "Suggestion pour le rejeu" }
    ],

    /* ----------------------------------------------------------------------
       DÉBRIEFING PAR RÔLE
       ---------------------------------------------------------------------- */
    debrief: {
      manager: [
        "Quel point d’alerte avez-vous formulé, et sur quels faits du terrain vous êtes-vous appuyé ?",
        "Quelle alternative avez-vous proposée à la direction ?",
        "À quel moment avez-vous changé de position, et comment l’avez-vous su ?",
        "Face à votre équipe, qu’avez-vous dit de votre propre position ? Était-ce honnête et solidaire ?",
        "Qu’avez-vous traduit concrètement pour l’équipe, et quelles difficultés avez-vous anticipées ?"
      ],
      interlocuteur: [
        "En direction : qu’est-ce qui a rendu l’alerte du manager utile, ou difficile à entendre ?",
        "En direction : qu’avez-vous maintenu, et qu’avez-vous ajusté après l’avoir entendu ?",
        "En équipe : à quel moment avez-vous eu le sentiment que votre manager portait vraiment la décision ?",
        "En équipe : quelle phrase du manager vous a rassuré, ou au contraire fragilisé ?",
        "Quelle attente de l’équipe est restée sans réponse ?"
      ],
      observateur: [
        "Quel point d’alerte était le mieux formulé ?",
        "À quel moment le manager a-t-il changé de position ?",
        "Quelle phrase était la plus professionnelle devant l’équipe ? Laquelle était fragile ?",
        "Dans le discours du manager, la direction est-elle restée un partenaire ou est-elle devenue un adversaire ?",
        "Quelle autre phrase aurait pu être dite ?"
      ]
    },

    /* ----------------------------------------------------------------------
       MOMENTS COLLECTIFS (console de l'animateur)
       ---------------------------------------------------------------------- */
    fil: {
      titre: "Contester → Arbitrer → Porter",
      message: "Loyauté ne signifie pas absence de désaccord.",
      etapes: [
        {
          nom: "Contester",
          quand: "AVANT la décision définitive : j’exerce mon devoir d’alerte",
          points: [
            "questionner ;",
            "demander les raisons ;",
            "apporter des informations du terrain ;",
            "présenter les conséquences prévisibles ;",
            "proposer une alternative ;",
            "signaler un risque."
          ]
        },
        {
          nom: "Arbitrer",
          quand: "Une fois l’arbitrage rendu : je change de position",
          points: [
            "la direction a entendu mes objections et maintient sa décision ;",
            "je ne suis plus dans la contestation : que fais-je maintenant ?"
          ]
        },
        {
          nom: "Porter",
          quand: "Devant l’équipe : je porte la décision comme manager",
          points: [
            "j’accueille les réactions sans les amplifier ;",
            "je traduis la décision en conséquences concrètes ;",
            "j’anticipe avec l’équipe les difficultés à traiter."
          ]
        }
      ]
    },

    vote: {
      question: "Votre direction maintient sa décision après avoir entendu vos objections. Que faites-vous maintenant ?",
      options: [
        { id: "A", texte: "Je continue à contester.",
          lecture: "Le désaccord a son moment : avant l’arbitrage. Après, que devient la décision, et que devient la direction, aux yeux de l’équipe ?" },
        { id: "B", texte: "J’applique, mais je précise à l’équipe que ce n’est pas ma décision.",
          lecture: "C’est la réponse fragile du piège : le manager se désolidarise, renforce le mécontentement, fait de la direction un adversaire commun et affaiblit sa propre légitimité." },
        { id: "C", texte: "Je porte la décision comme manager.",
          lecture: "C’est la posture visée. Porter n’est pas approuver : on peut ne pas être convaincu et rester professionnel." },
        { id: "D", texte: "Cela dépend.",
          lecture: "À explorer avec le groupe : de quoi cela dépend-il ? (la zone de décision, la nature de la décision, les limites légales ou de sécurité)" }
      ],
      relances: [
        "Qu’est-ce qui distingue A de C ?",
        "Qu’est-ce que B risque de produire dans l’équipe ?",
        "De quoi dépend D ? Qu’est-ce qui rendrait la réponse C impossible ?"
      ],
      principes: [
        "Je peux ne pas être personnellement convaincu d’une décision et avoir néanmoins la responsabilité professionnelle de la mettre en œuvre.",
        "Porter une décision ne signifie pas mentir en disant qu’on l’approuve."
      ]
    },

    piege: {
      phrase: "Franchement, cette nouvelle organisation n’a aucun sens. Vous êtes d’accord avec ça, vous ?",
      qui: "Un collaborateur",
      fragile: {
        reponse: "Moi non plus, mais ça vient d’en haut. Je n’ai pas le choix.",
        consequences: [
          "le manager se désolidarise de la décision ;",
          "il renforce le mécontentement ;",
          "il transforme la direction en adversaire commun ;",
          "il affaiblit sa propre légitimité."
        ]
      },
      pro: {
        reponse: "Je comprends vos interrogations. J’ai moi-même questionné certains aspects avant que la décision soit prise. La décision est maintenant arbitrée et notre responsabilité est de la mettre en œuvre. Regardons ensemble ce qu’elle implique concrètement pour l’équipe et les difficultés que nous devons anticiper."
      },
      conclusion: "Ni soumis, ni déloyal, ni hypocrite : c’est une posture managériale."
    },

    zones: {
      liste: [
        { id: "1", nom: "Je décide", def: "Je prends la décision et j’en assume la responsabilité." },
        { id: "2", nom: "J’influence", def: "Je peux questionner, alerter, argumenter, négocier, proposer." },
        { id: "3", nom: "J’applique", def: "La décision dépasse mon périmètre. Après arbitrage, mon rôle consiste à la traduire opérationnellement." }
      ],
      situations: [
        { id: "s1", zone: "1", texte: "Vous fixez le planning de la semaine prochaine entre les membres de votre équipe, dans le respect des règles en vigueur.",
          pourquoi: "L’organisation du travail au quotidien relève de votre périmètre." },
        { id: "s2", zone: "2", texte: "La direction envisage de changer les horaires de votre équipe. Rien n’est encore arbitré.",
          pourquoi: "Avant l’arbitrage, vous pouvez questionner, alerter et proposer : c’est votre devoir d’alerte.",
          nuance: "Une fois l’arbitrage rendu, la même décision passe en zone « J’applique »." },
        { id: "s3", zone: "3", texte: "La direction a arbitré : un nouvel outil informatique devra être utilisé par tous les services dès le mois prochain.",
          pourquoi: "Après arbitrage, la décision dépasse votre périmètre : vous la traduisez opérationnellement.",
          nuance: "Vous pouvez encore influencer certaines modalités (formation, calendrier d’accompagnement), mais plus le principe." },
        { id: "s4", zone: "1", texte: "Vous choisissez qui, dans l’équipe, formera le nouvel arrivant.",
          pourquoi: "Le choix des personnes sur une mission d’équipe vous appartient." },
        { id: "s5", zone: "2", texte: "Un collaborateur demande une revalorisation de salaire. Les grilles sont fixées par la direction des ressources humaines.",
          pourquoi: "Vous ne décidez pas, mais vous pouvez appuyer, argumenter et proposer auprès de ceux qui décident." },
        { id: "s6", zone: "3", texte: "Votre équipe doit appliquer une nouvelle règle de sécurité issue d’un audit. Elle ajoute une étape que vos collaborateurs jugent inutile.",
          pourquoi: "La règle dépasse votre périmètre : vous la traduisez opérationnellement.",
          nuance: "Vous pouvez faire remonter les difficultés d’application, mais la règle s’applique." },
        { id: "s7", zone: "2", texte: "Un client important réclame un délai que votre équipe juge irréaliste. C’est la direction commerciale qui lui répond.",
          pourquoi: "Vous ne répondez pas au client, mais vous pouvez alerter sur la faisabilité et proposer une alternative." },
        { id: "s8", zone: "3", texte: "La direction a tranché : l’objectif de votre équipe augmente de 10 % pour l’année, après avoir entendu vos objections.",
          pourquoi: "L’arbitrage est rendu et dépasse votre périmètre.",
          nuance: "La façon de répartir l’effort au sein de l’équipe, elle, relève de la zone « Je décide »." },
        { id: "s9", zone: "1", texte: "Vous organisez la réunion d’équipe de la semaine : jour, durée et ordre du jour.",
          pourquoi: "L’animation de votre équipe relève de votre périmètre." },
        { id: "s10", zone: "2", texte: "Le service achats choisit un nouveau fournisseur de matériel pour votre équipe. Vous préfériez l’ancien et vous n’avez pas encore été consulté.",
          pourquoi: "Le choix ne vous appartient pas, mais rien n’est arbitré avec vous : vous pouvez demander à être entendu et faire valoir l’usage terrain." }
      ],
      questionFinale: "Que faites-vous lorsqu’une situation que vous voulez contrôler appartient en réalité à votre zone d’influence ou d’application ?",
      relances: [
        "Comment reconnaît-on qu’on cherche à contrôler ce qui ne relève pas de sa zone ?",
        "Que peut-on faire, concrètement, quand une situation relève de la zone « J’influence » ?"
      ]
    },

    /* ----------------------------------------------------------------------
       SYNTHÈSE FINALE (participants)
       ---------------------------------------------------------------------- */
    synthese: {
      principe: "Loyauté ne signifie pas absence de désaccord.",
      demarche: "Contester → Arbitrer → Porter",
      vigilance: "Porter une décision ne dispense pas de s’interroger sur sa légalité ou sur la sécurité des personnes : dans ces cas, l’alerte emprunte les circuits prévus par votre organisation. À cadrer avec votre animateur.",
      zonesRappel: "Les zones évoluent avec le temps : une même décision est en zone « J’influence » avant l’arbitrage, puis en zone « J’applique » après."
    },

    /* Fiche de transfert */
    ficheZones: [
      { value: "decide",   label: "Je décide" },
      { value: "influence", label: "J’influence" },
      { value: "applique", label: "J’applique" }
    ],
    ficheMoments: [
      { value: "avant", label: "Pas encore arbitrée (je peux alerter)" },
      { value: "apres", label: "Déjà arbitrée (je la porte)" }
    ]
  };
})();
