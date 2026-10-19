# Pêche & Merveilles

Jeu mobile Android hors-ligne de pêche, de patience et de collection.

Boucle principale : **observer et pêcher → vendre → économiser → utiliser le gacha → débloquer une nouvelle créature → compléter la collection**.

## Fonctionnalités de base — itération 1.1

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

## État du code et démarrage

La configuration source `app/build.gradle` déclare actuellement `versionName '2.0.13'` et `versionCode 37`. La liste des fonctionnalités ci-dessus décrit l'itération de base 1.1 ; des modules et tests d'itérations ultérieures sont aussi conservés dans le dépôt. Le jeu utilise une activité Android Java qui charge l'interface HTML/JavaScript locale dans une WebView.

Le dépôt est un projet de jeu en développement. Une version déclarée dans Gradle ne prouve pas à elle seule la disponibilité d'une version signée distribuée ni une validation sur tous les appareils.

Pour préparer un build local, ouvrir le projet dans Android Studio avec JDK 17, Android SDK 35 et Build Tools 35.0.0 configurés. Le wrapper Gradle n'est pas versionné dans cet état du dépôt ; le workflow le génère avec Gradle 8.11.1. Depuis la racine, dans un environnement où Gradle est disponible :

```powershell
gradle wrapper --gradle-version 8.11.1
.\gradlew.bat :app:assembleRelease --no-daemon
```

Cette commande prépare l'APK release non signé ; la signature reste extérieure au dépôt. Pour parcourir la logique sans construire Android : `node tests/core.test.js`. Le workflow `.github/workflows/android-build.yml` contient la liste complète des contrôles de logique et de syntaxe. Aucun build ni essai sur appareil n'a été exécuté pendant cette revue documentaire.
