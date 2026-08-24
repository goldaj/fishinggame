# Pêche & Merveilles

Jeu mobile Android hors-ligne de pêche et de collection.

Boucle principale : **pêcher → vendre → utiliser le gacha → débloquer une nouvelle créature → compléter la collection**.

## Contenu du prototype

- 100 créatures configurées.
- 6 niveaux de rareté : Commune, Inhabituelle, Rare, Épique, Légendaire et Mythique.
- 3 cartes communes débloquées au démarrage.
- Les espèces gagnées au gacha deviennent immédiatement pêchables.
- Le gacha ne donne pas de doublon tant qu'une nouvelle créature accessible reste à débloquer.
- 10 rangs de progression : certaines créatures restent absentes du gacha tant que le rang requis n'est pas atteint.
- Pêche active avec fenêtre de ferrage et série de réussites.
- Marché pour vendre les prises contre la monnaie du jeu.
- Collection de cartes avec présentation différente selon la rareté.
- Sauvegarde locale sur l'appareil.

## Build Android

Pile volontairement simple et documentée :

- Android Gradle Plugin 8.9.2
- Gradle 8.11.1
- JDK 17
- compileSdk / targetSdk 35
- Android Build Tools 35.0.0

La CI GitHub exécute les tests de logique, construit `app-debug.apk`, vérifie que l'archive APK est valide et publie l'APK comme artefact.
