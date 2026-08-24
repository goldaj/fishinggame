# Pêche & Merveilles

Jeu mobile Android hors-ligne de pêche, de patience et de collection.

Boucle principale : **observer et pêcher → vendre → économiser → utiliser le gacha → débloquer une nouvelle créature → compléter la collection**.

## Version 1.1

- 100 créatures configurées.
- 6 niveaux de rareté : Commune, Inhabituelle, Rare, Épique, Légendaire et Mythique.
- **1 seule espèce commune** débloquée au démarrage.
- Les espèces gagnées au gacha deviennent immédiatement pêchables.
- Le gacha ne donne pas de doublon tant qu'une nouvelle créature accessible reste à débloquer.
- 10 rangs de progression avec un rythme volontairement lent ; certaines créatures restent absentes du gacha tant que le rang requis n'est pas atteint.
- Pêche active anti-spam : relever la ligne sans poisson, rater en ferrant trop tôt ou trop tard, réussir uniquement dans la bonne fenêtre.
- Fenêtres de ferrage variables et de plus en plus courtes avec la rareté.
- Marché pour vendre les prises contre la monnaie du jeu.
- Collection de cartes avec présentation différente selon la rareté et indication du rang requis.
- Sauvegarde locale sur l'appareil.
- Interface mobile retravaillée et prise en compte des `WindowInsets` Android pour les barres système.

## Build Android

Pile :

- Android Gradle Plugin 8.9.2
- Gradle 8.11.1
- JDK 17
- compileSdk / targetSdk 35
- Android Build Tools 35.0.0

La CI GitHub exécute les tests de logique, vérifie la syntaxe JavaScript, construit un **APK release non signé**, contrôle l'archive et son alignement puis publie un candidat de release. La signature de distribution est appliquée hors du dépôt public avec une clé privée durable. Voir `SIGNING.md`.
