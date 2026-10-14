# TECH'AUTO Kourou · Le parcours client connecté

> De la vitrine à la facture, en 11 étapes.
> Document de présentation · Automatisation Consciente

Une landing page sert de vitrine au garage. L'application qui lui est jumelée ouvre une communication privilégiée avec chaque client : il réserve, il est prévenu, il sait ce qui a été fait et ce qui l'attend. L'atelier, lui, travaille avec un seul outil, du premier clic jusqu'au paiement.

---

## Le principe en une image

Trois pièces qui travaillent ensemble, comme un garage bien organisé.

| | Pièce | Rôle |
|---|---|---|
| 🏪 | **La vitrine** | La landing page. Elle présente le garage, ses prestations, ses horaires, et donne deux portes d'entrée : réserver en ligne ou appeler la secrétaire. |
| 🛎️ | **Le comptoir qui ne ferme jamais** | L'application. Elle prend les rendez-vous, envoie les SMS, guide l'accueil du véhicule, le planning des mécaniciens et la facture. |
| 📒 | **Le carnet partagé** | La base de données (aujourd'hui une feuille Google Sheets). Rendez-vous, stock de pièces, SMS : tout le monde lit et écrit dans le même carnet, au même moment. |

---

## Vue d'ensemble

Le parcours se lit en trois temps. Chaque étape passe le relais à la suivante sans ressaisie.

| Avant · le client réserve | Pendant · le véhicule est réparé | Après · le client repart informé |
|---|---|---|
| 1. RDV en ligne | 6. Accueil du véhicule | 9. SMS « véhicule prêt » |
| 2. RDV par téléphone | 7. Planning et ordre de réparation | 10. Compte rendu et travaux à prévoir |
| 3. Contrôle pièces et délai | 8. Fin d'intervention | 11. Paiement et envoi en comptabilité |
| 4. Confirmation par SMS | | |
| 5. Rappel la veille | | |
| *Client · secrétaire · responsable pièces* | *Secrétaire · chef d'atelier · mécaniciens* | *Secrétaire · client · PDG* |

**Légende de l'avancement :**
- 🟢 **Testé en réel** : fonctionne déjà avec de vrais SMS
- 🔵 **Visible dans la démo** : présenté dans l'application de démonstration
- 🟠 **À développer** : à chiffrer après l'audit

---

## Avant · le client réserve (étapes 1 à 5)

### 1. Rendez-vous en ligne, aux dates libres · 🔵 Démo

- **Qui :** le client, depuis la vitrine
- **Quand :** 24 h/24, 7 j/7

Le client :
- choisit la prestation (vidange, clim, freins…), puis renseigne son véhicule et ses coordonnées ;
- ne voit que les créneaux réellement libres, c'est-à-dire avec un mécanicien disponible pendant toute la durée de l'intervention ;
- peut taper une date précise, demander « le plus tôt possible » ou ouvrir le calendrier sur 3 mois ;
- peut s'inscrire sur une liste d'attente pour être prévenu si un autre client se désiste.

> **Gain :** chaque réservation en ligne est un appel de moins pour la secrétaire, même le soir et le dimanche.

### 2. Un numéro pour appeler la secrétaire · 🟢 Testé

- **Qui :** la secrétaire, au téléphone
- **Outil :** le même formulaire que le client

Déroulé :
- Le numéro est affiché sur la vitrine pour les clients qui préfèrent parler à quelqu'un.
- La secrétaire retrouve le client par son nom ou sa plaque : le véhicule et les coordonnées se remplissent seuls.
- Un script d'appel en 5 questions guide la conversation : plaque, besoin, symptôme, créneau, portable.
- Dès l'enregistrement, un SMS de confirmation part directement au client.

> 📱 *TECH'AUTO Kourou : RDV confirmé le mardi 20 octobre à 08h00 pour Vidange + filtre (AB-123-CD). Réf. TA-1020-14. Pour décaler, appelez l'atelier.*

### 3. ⚠️ Point de vigilance : pièces en stock et délai d'attente · 🔵 Démo + module Sheet

- **Qui :** automatique, suivi par le responsable pièces
- **Où :** la base de données (Google Sheets)

Avant de confirmer un rendez-vous, l'application interroge la base de données pour vérifier que la réparation est faisable à cette date : les pièces sont-elles en stock, déjà réservées pour un autre client, ou faut-il les commander ? Pour un garage en Guyane, c'est le point le plus sensible : une pièce venue de métropole met environ 15 jours, plus la douane.

**Ce que la connexion doit garantir :**

| Situation | Conséquence |
|---|---|
| ✓ **En stock** | La pièce est réservée pour ce rendez-vous. Elle n'est plus proposée aux autres clients. |
| 🚚 **En commande** | La livraison arrive avant le rendez-vous : on peut confirmer. |
| ⏳ **Délai trop court** | Le client se voit proposer une date plus tardive, ou le magasin lance un dépannage chez un confrère. |

> **Analogie :** le stock fonctionne comme un compte bancaire. Chaque rendez-vous signe un chèque (la réservation). Le « disponible », c'est le solde moins les chèques signés. Le délai métropole, c'est la durée d'un virement : on commande avant d'être à découvert.

À retenir :
- **À valider avec le garage :** la liste des pièces par prestation, les délais réels des fournisseurs et les seuils minimum.
- **Condition de fiabilité :** chaque entrée et sortie de pièce doit être enregistrée, par scan ou par saisie. Un stock mal tenu donne une réponse fausse au client.
- **Limite connue :** Google Sheets convient pour démarrer et valider le fonctionnement. Si le volume grandit, la même logique passera sur une vraie base de données sans changer les habitudes de l'équipe.

### 4. Rendez-vous confirmé par la secrétaire · 🟢 Testé

- **Qui :** la secrétaire
- **Déclencheur :** passage au statut « Confirmé »

Fonctionnement :
- Les demandes « à confirmer » apparaissent dans un onglet dédié.
- Un clic sur « Confirmé » envoie le SMS automatiquement, depuis le téléphone du garage.
- Anti-doublon : le client ne reçoit jamais deux fois la même confirmation.

### 5. SMS de rappel la veille · 🟢 Testé

- **Qui :** automatique
- **Quand :** chaque soir à 17h ; le vendredi prépare les rappels du lundi

> 📱 *TECH'AUTO Kourou : rappel de votre RDV mardi à 08h00 pour Vidange + filtre (AB-123-CD). Répondez OUI pour confirmer ou appelez-nous pour décaler.*

> **Gain :** moins de places vides le lendemain. Un créneau libéré la veille peut être proposé à un client en liste d'attente.

---

## Pendant · le véhicule à l'atelier (étapes 6 à 8)

### 6. Bouton « Accueil du véhicule » · 🔵 Démo

- **Qui :** la secrétaire ou le chef d'atelier
- **Durée :** environ 2 minutes

Le rendez-vous passe en « Arrivé » et une checklist s'affiche :
- kilométrage et niveau de carburant ;
- tour du véhicule, avec photos des chocs ;
- objets de valeur ;
- clés étiquetées ;
- accord du client sur le montant estimé.

Le mécanicien voit aussitôt la voiture apparaître comme arrivée sur son planning.

> **Analogie :** c'est l'état des lieux d'une location. Deux minutes à l'arrivée évitent un litige au départ.

### 7. Planning de chaque mécanicien, avec l'ordre de réparation et les pièces · 🔵 Démo · 🟠 ordre de réparation à développer

- **Qui :** le chef d'atelier et les 5 mécaniciens
- **Support :** écran d'atelier ou tablette

Fonctionnement :
- Une colonne par mécanicien, selon sa spécialité. La hauteur d'un bloc correspond à la durée de l'intervention.
- Chaque bloc ouvre l'ordre de réparation : travaux demandés, symptômes notés avec les mots du client, pièces réservées et leur emplacement en rayon.
- Un ⚠️ signale une pièce qui ne sera pas là à temps, avant que le véhicule ne soit sur le pont.
- Le chef d'atelier réaffecte un véhicule à un autre mécanicien en un clic.

> **Gain :** le mécanicien ne va plus chercher l'information. Elle vient à lui, avec les pièces déjà prêtes.

### 8. Bouton « Fin d'intervention » · 🔵 Démo · 🟠 facture complète à développer

- **Qui :** le mécanicien ou le chef d'atelier
- **Déclencheur :** passage au statut « Terminé »

Ce qui se passe :
- La facture est créée automatiquement à partir des prestations et des pièces utilisées.
- Les pièces réservées sortent du stock toutes seules. Le stock reste juste sans ressaisie.
- La secrétaire vérifie et ajuste les lignes avant l'envoi, si nécessaire.

---

## Après · le client repart informé (étapes 9 à 11)

### 9. SMS « véhicule prêt » · 🟢 Testé

- **Qui :** automatique
- **Déclencheur :** fin d'intervention

> 📱 *TECH'AUTO Kourou : votre Toyota Hilux (AB-123-CD) est prête. Montant : 89 €. Retrait jusqu'à 17h. Merci de votre confiance.*

> **Gain :** plus d'appels « c'est prêt ? ». Le client vient au bon moment, et le parking se libère plus vite.

### 10. Compte rendu des travaux et réparations à prévoir · 🟠 À développer

- **Qui :** le mécanicien rédige, la secrétaire présente
- **Support :** fiche remise au client et envoyée par lien

Le compte rendu contient :
- ce qui a été fait, en langage clair, avec les photos prises pendant l'intervention ;
- ce qu'il faudra prévoir, classé par urgence : à faire maintenant, dans 3 mois, à la prochaine révision. Par exemple : « Plaquettes arrière usées à 30 % ».

Chaque travail à prévoir devient un rappel automatique le moment venu, avec un lien pour réserver.

> **Gain :** le client comprend ce qu'il paie et fait confiance. Les travaux à prévoir deviennent le chiffre d'affaires des mois suivants.

### 11. Paiement de la facture et envoi au logiciel comptable · 🟠 À développer

- **Qui :** la secrétaire, puis automatique
- **Déclencheur :** passage au statut « Facturé / payé »

Déroulé :
- Le client règle au comptoir (carte, espèces, virement) ou par un lien de paiement reçu par SMS.
- La facture payée part automatiquement vers le logiciel comptable du garage. Le format sera adapté au logiciel utilisé.
- Le tableau de bord du PDG se met à jour : chiffre d'affaires du jour et factures en attente de paiement.
- La facture doit porter la mention « TVA non applicable, art. 294 du CGI ». À faire valider par l'expert-comptable du garage.

---

## Qui fait quoi

Chaque personne du garage n'a que son morceau du parcours à gérer. L'application fait les transmissions.

| Rôle | Ses étapes | Ce que l'application lui évite |
|---|---|---|
| Client | 1 · 9 · 10 · 11 | Attendre au téléphone, rappeler pour savoir si c'est prêt, oublier son rendez-vous |
| Secrétaire | 2 · 4 · 6 · 10 · 11 | Le double cahier, les rappels à la main, la facture ressaisie |
| Responsable pièces | 3 · 7 | Découvrir qu'une pièce manque le matin même |
| Chef d'atelier | 6 · 7 · 8 | Distribuer le travail de vive voix, chercher qui est libre |
| Mécaniciens (×5) | 7 · 8 · 10 | Chercher l'ordre de réparation et les pièces |
| PDG | Vue d'ensemble | Attendre la fin du mois pour connaître le remplissage et le chiffre d'affaires |

---

## La base de données au centre

### Aujourd'hui : Google Sheets
- **Onglets :** rendez-vous, SMS, modèles de messages, pièces, réservations, commandes, mouvements de stock, contacts confrères.
- **Envoi des SMS :** depuis un téléphone Android du garage, avec sa carte SIM et son numéro. Aucun SMS ne part avant 7h ni après 20h.
- **Accès :** l'équipe peut tout consulter et corriger dans un outil qu'elle connaît déjà.

### Demain, si le garage grandit
- La même logique et les mêmes écrans passent sur une base de données dédiée.
- Chaque rôle n'a accès qu'à ce qui le concerne.
- Chaque véhicule garde son historique complet sur plusieurs années.

---

*Les étapes « À développer » sont à chiffrer après l'audit du garage.*
