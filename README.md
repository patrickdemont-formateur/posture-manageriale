# Posture managériale : entre la direction et l'équipe

Plateforme web statique (HTML, CSS, JavaScript natif) pour animer, en présentiel, la séquence :

> « Je ne suis pas d'accord avec la décision de ma direction »

Elle reprend l'architecture de la plateforme « Leviers de motivation » (accueil animateur avec liens et QR codes, parcours en trio avec rotation des rôles, grille d'observation à tuiles) et l'adapte à la tension entre **la demande de la direction** et **l'attente de l'équipe**.

Aucun serveur, aucun compte, aucune base de données, aucune bibliothèque externe, aucun cookie, aucun outil d'analyse. Les QR codes sont générés localement (`qr.js`).

---

## 1. Finalité pédagogique

La séquence repose sur une grille en trois temps, issue des notes préparatoires :

| Temps | Quand | Ce que fait le manager |
|---|---|---|
| **Contester** | AVANT la décision définitive | Il exerce son devoir d'alerte : questionner, demander les raisons, apporter des informations du terrain, présenter les conséquences prévisibles, proposer une alternative, signaler un risque (avec le DESC). |
| **Arbitrer** | Une fois l'arbitrage rendu | Il change de position. |
| **Porter** | Devant l'équipe | Il porte la décision comme manager : ni soumis, ni déloyal, ni hypocrite. |

Messages à construire avec le groupe :

- *Loyauté ne signifie pas absence de désaccord.*
- *Je peux ne pas être personnellement convaincu d'une décision et avoir néanmoins la responsabilité professionnelle de la mettre en œuvre.*
- *Porter une décision ne signifie pas mentir en disant qu'on l'approuve.*

Les **trois zones** (Je décide / J'influence / J'applique) prolongent cette grille : une même décision est en zone « J'influence » avant l'arbitrage, puis en zone « J'applique » après.

---

## 2. Structure d'une manche (parcours en trio)

Chaque manche traite une décision différente et comporte **deux scènes** séparées par une **bascule** :

1. **Scène 1 (3 min)** : le manager rencontre **la direction** avant l'arbitrage et exerce son devoir d'alerte.
2. **Bascule (1 min)** : la direction annonce son arbitrage. Le manager doit changer de position.
3. **Scène 2 (3 min)** : le manager retrouve **son équipe**, qui lui pose la question piège (« Vous êtes d'accord avec ça, vous ? »).
4. **Débriefing (3 min)** par rôle.

Rôles : **Manager**, **Interlocuteur** (joue la direction en scène 1, puis un membre de l'équipe en scène 2) et **Observateur**.

| Manche | Décision | Participant A | Participant B | Participant C |
|---|---|---|---|---|
| 1 | La nouvelle organisation du service (guichet unique) | Manager | Interlocuteur | Observateur |
| 2 | Le nouvel outil de suivi | Observateur | Manager | Interlocuteur |
| 3 | Les nouveaux horaires | Interlocuteur | Observateur | Manager |

Chaque participant joue une fois chaque rôle. Les fiches de la scène 2 ne s'affichent qu'à son démarrage : le manager ne connaît pas la fiche de l'équipe, et l'interlocuteur ne lit sa fiche d'équipe qu'après avoir joué la direction.

La direction n'ajuste la décision que si l'alerte du manager l'a justifié (faits précis, alternative argumentée) : la qualité de l'alerte a un effet visible.

**Plusieurs trios ?** Tous utilisent les mêmes trois liens, chacun sur son propre appareil. A, B et C se répartissent à l'intérieur de chaque trio.

---

## 3. Déroulé conseillé (60 minutes)

| Moment | Durée | Où |
|---|---|---|
| Fil rouge | 3 min | Console animateur |
| Question provocatrice (vote à main levée) | 5 min | Console animateur |
| Le piège (réponse fragile / professionnelle) | 4 min | Console animateur |
| Trois manches | 33 min | Appareils des participants (11 min chacune) |
| Jeu des trois zones (dix situations) | 12 min | Console animateur |
| Synthèse et fiche de transfert | 3 min | Appareils des participants |

Variante : placer « Le piège » après les manches pour que chacun s'y confronte avant d'en parler. Les durées des scènes se règlent dans `data.js`.

---

## 4. Structure des fichiers

```
posture-manageriale/
├── index.html   Page unique (structure, accessibilité, roue crantée, confirmation)
├── styles.css   Mise en forme responsive (couleurs modifiables en tête de fichier)
├── app.js       Routage + parcours des participants (scènes, bascule, chronomètre, grille, synthèse)
├── admin.js     Espace animateur : accueil, moments collectifs, administration, aide
├── qr.js        Générateur de QR codes autonome (norme QR Code, niveau de correction M)
├── data.js      Contenus : scénarios, grille, débriefing, moments collectifs, synthèse
└── README.md    Ce document
```

| Adresse | Affichage |
|---|---|
| `index.html` (sans paramètre) | Accueil animateur : tuiles des 3 participants, QR codes, animation collective |
| `index.html#fil`, `#vote`, `#piege`, `#zones` | Moments collectifs à projeter |
| `index.html#admin`, `#aide` | Administration, aide |
| `index.html?p=A` (ou `B`, `C`) | Parcours du participant |
| `index.html?p=Z`, `?p=` | Message « lien invalide » |

---

## 5. Espace animateur

### Accueil : trois tuiles
Une tuile par participant : prénom (si renseigné), **QR code** (avec **Agrandir le QR code** pour la projection), **adresse du lien** à copier ou à saisir, **Copier l'adresse**, **Préparer un e-mail**. Un tableau rappelle qui joue quel rôle à chaque manche.

### Animation collective (quatre pages à projeter)
- **Fil rouge** : Contester → Arbitrer → Porter, le DESC (« Je constate que… », « Mon point d'alerte concerne… », « Je propose que… », « L'intérêt serait de… ») et le message sur la loyauté. Le principe sur le fait de porter n'est volontairement pas affiché.
- **Question provocatrice** : « Votre direction maintient sa décision après avoir entendu vos objections. Que faites-vous maintenant ? » avec les réponses A, B, C, D. Vous comptez les mains avec **+** et **−** ; des barres affichent la répartition. Les **pistes de lecture** et le **principe à construire** restent masqués jusqu'à ce que vous les affichiez.
- **Le piège** : la phrase du collaborateur, puis, à la demande, la réponse fragile (avec ses conséquences), puis la réponse professionnelle.
- **Jeu des trois zones** : dix situations, une à la fois. Les participants se placent **physiquement** dans la zone de leur choix ; vous comptez les personnes de chaque zone, puis affichez la **zone de référence** et son explication. Le **bilan** rassemble les comptages et pose la question finale : « Que faites-vous lorsqu'une situation que vous voulez contrôler appartient en réalité à votre zone d'influence ou d'application ? »

Les comptages restent sur l'appareil de l'animateur. Chaque page propose sa remise à zéro.

### Roue crantée : administration et aide
En haut à gauche, sans mot de passe : **prénoms** des participants, **adresse du site** (facultative), **remises à zéro**, et accès à l'**aide**.

### Prénoms
Un site statique n'a pas de serveur pour mémoriser les prénoms. Ils sont **intégrés dans chaque lien et QR code** :

```
https://compte.github.io/posture-manageriale/index.html?p=B&n=Claire~Marc~Julie
```

- après toute modification d'un prénom, les liens changent : renvoyez-les ou faites rescanner ; la progression déjà enregistrée est conservée ;
- les prénoms apparaissent dans l'adresse, donc **dans les journaux de l'hébergeur** (GitHub) : préférez des prénoms d'usage ou des initiales si cela pose problème ;
- avec plusieurs trios, les prénoms sont peu utiles : laissez les champs vides.

---

## 6. Le rôle d'observateur

Les 13 critères sont regroupés selon la grille de la séquence, sous l'amorce unique « Le manager… » :

| Thème | Critères |
|---|---|
| Contester : avant l'arbitrage | Demande les raisons de la décision ; S'appuie sur des faits du terrain ; Présente les conséquences prévisibles ; Propose une alternative ; Signale clairement un risque ; Exprime son désaccord sur les faits, sans attaquer la personne |
| Arbitrer : changer de position | Reconnaît que l'arbitrage est rendu et cesse de contester ; Distingue sa conviction personnelle de sa responsabilité de mise en œuvre |
| Porter : devant l'équipe | Accueille les réactions de l'équipe sans les amplifier ; Ne se désolidarise pas de la décision ; Ne présente pas la direction comme un adversaire commun ; Reste honnête : ne prétend pas approuver ce qu'il n'approuve pas ; Traduit la décision en conséquences concrètes et anticipe les difficultés |

Chaque tuile a un **+** et un **−** : 1 clic = comportement observé 1 fois, puis renforcement jusqu'à 5 (jauge et compteur « ×n »). **Rien n'oblige à tout renseigner.** La grille reste accessible pendant les deux scènes et le débriefing, et les notes sont conservées d'une scène à l'autre.

---

## 7. Test local

**Option 1 : double-clic.** Ouvrez `index.html` ; ajoutez `?p=A` pour tester un participant. Depuis un fichier local, les QR codes pointent vers `file://…` et ne fonctionnent pas sur les autres appareils (l'accueil le signale).

**Option 2 : petit serveur local.** Dans le dossier du projet :

```
python3 -m http.server 8000
```

puis ouvrez `http://localhost:8000/` (animateur) ou `http://localhost:8000/index.html?p=A`.

---

## 8. Déploiement sur GitHub Pages

1. Créez un dépôt **public** (nom conseillé : `posture-manageriale`). Les dépôts privés exigent une offre payante pour GitHub Pages.
2. Déposez les sept fichiers à la **racine** du dépôt (Add file → Upload files), puis **Commit changes**.
3. **Settings → Pages** : *Deploy from a branch*, branche `main`, dossier `/ (root)`, **Save**.
4. Après une à deux minutes, le site est disponible sur `https://<compte>.github.io/posture-manageriale/`.
5. Ouvrez cette adresse : l'accueil fabrique les trois liens et les QR codes pour vous.

Ce site est **indépendant** de celui des leviers de motivation. Si les deux sont sur le même compte GitHub, ils partagent le même domaine : les clés de stockage sont distinctes (`posture-manageriale-…`), il n'y a aucune interférence.

---

## 9. Modifier les contenus (`data.js`)

- **Durée d'une scène** : `dureeSimulation` (en secondes, 180 par défaut) et `alerteSecondes`. Le déroulé affiché : `rythme`.
- **Scénarios** : `scenarios[n]` contient `scene1`, `bascule` et `scene2`, chacun avec `manager`, `interlocuteur`, `observateur`. Les blocs : `p`, `h3`, `ul`, `quote`, `alert`, et `desc` (repères D-E-S-C).
- **Titres** : gardez-les neutres. Les décisions et marges de manœuvre sont dans `notesAnimateur` (jamais affichées aux participants).
- **Grille** : `grille.groupes` (thèmes) et `criteres` (`id` stable + `texte`). Changer un `id` perd les observations déjà enregistrées.
- **Débriefing** : `debrief.manager`, `.interlocuteur`, `.observateur`.
- **Moments collectifs** : `fil`, `vote` (question, options, pistes de lecture, principes), `piege`, `zones` (zones, **dix situations** avec `zone` de référence, `pourquoi`, `nuance`, question finale).
- **Synthèse et fiche** : `synthese`, `ficheZones`, `ficheMoments`.
- **Rotation** : `rotation` (un participant par rôle dans chaque manche, chaque rôle une fois par participant).

Respectez la syntaxe JavaScript (guillemets, virgules) et testez en local après chaque modification.

---

## 10. Couleurs

Variables en tête de `styles.css` (bloc `:root`). Les zones utilisent le bleu (zone 1), l'orange (zone 2) et un gris à bordure pointillée (zone 3), **toujours accompagnés d'un numéro et d'un nom** : l'information ne repose jamais sur la seule couleur. Les QR codes restent noir sur blanc.

---

## 11. Remise à zéro

- **Participant** : bouton **Recommencer l'exercice** (bas de chaque page), avec confirmation.
- **Animateur** : Administration → effacer les paramètres ou la progression des participants ; chaque page collective propose sa remise à zéro.
- **En développement** (F12, onglet *Application*, *Local Storage*) : clés `posture-manageriale-v1:A|B|C`, `posture-manageriale-admin-v1`, `posture-manageriale-collectif-v1`.

---

## 12. Limites de confidentialité d'un site statique

- **Le cloisonnement est pédagogique, pas informatique.** L'interface n'affiche que le contenu du rôle actif et de la scène en cours, mais tous les fichiers sont envoyés au navigateur : le code source, l'adresse (`?p=B`) ou le stockage local donnent accès au reste. L'accueil animateur n'est pas protégé. L'exercice repose sur la bonne foi des participants.
- **Pas de synchronisation entre appareils.** L'animateur rythme les étapes à voix haute ; chacun clique sur son propre bouton. Les boutons « Revenir… » corrigent un faux clic sans rien perdre.
- **Progression liée à l'appareil et au navigateur** (navigation privée ou données du site vidées : retour à zéro).
- **Prénoms dans l'adresse** : visibles dans les journaux de l'hébergeur.
- **Les votes et comptages** restent sur l'appareil de l'animateur : ce ne sont pas des votes en ligne.
- **Le chronomètre** est local, facultatif, sans son, et repart à zéro si la page est actualisée.
- **Aucune donnée personnelle réelle** : scénarios fictifs ; la fiche de transfert demande de ne saisir ni nom ni information sensible. Rien n'est envoyé vers un serveur applicatif.
- **Limite de la posture « Porter »** : une décision illégale ou mettant des personnes en danger relève d'un autre traitement (alerte par les circuits de l'organisation). Le point est signalé dans la synthèse et dans l'aide ; cadrez-le avec le groupe.

---

## Checklist de test

**Espace animateur**
- [ ] L'accueil affiche trois tuiles avec QR code et adresse ; chaque QR scanné ouvre le bon participant.
- [ ] « Copier l'adresse », « Préparer un e-mail » et « Agrandir le QR code » fonctionnent.
- [ ] Les prénoms saisis dans l'Administration apparaissent sur les tuiles, dans les liens, puis chez le participant.
- [ ] Fil rouge, question provocatrice, piège et jeu des zones s'affichent correctement en projection.
- [ ] Question provocatrice : + / − et barres ; pistes et principe masqués jusqu'à leur affichage.
- [ ] Jeu des zones : comptages, zone de référence, navigation, bilan, remise à zéro.

**Parcours participants**
- [ ] Trois liens, plus un lien invalide.
- [ ] À chaque manche : un manager, un interlocuteur, un observateur ; chacun joue une fois chaque rôle.
- [ ] Scène 1, bascule, scène 2, débriefing : le bon contenu pour le bon rôle, et aucune fiche d'un autre rôle.
- [ ] L'interlocuteur voit la fiche « Direction » en scène 1, puis la fiche « Équipe » en scène 2 seulement.
- [ ] Chronomètre (3 min, alerte à 1 min, sans son, sans démarrage automatique).
- [ ] Progression conservée après actualisation ; boutons « Revenir… ».

**Observateur**
- [ ] 13 tuiles en 3 thèmes ; + / − ; plafond 5 ; notes conservées d'une scène à l'autre ; effacement avec confirmation.
- [ ] Sur smartphone : tuiles sur deux colonnes, boutons faciles à toucher.

**Général**
- [ ] Synthèse, fiche de transfert, copie et effacement.
- [ ] Chrome, Edge, Safari mobile, console ouverte : aucune erreur.
- [ ] Parcours au clavier seul : le focus reste visible.
