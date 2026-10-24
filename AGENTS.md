# AGENTS.md — Pêche & Merveilles (Fishinggame)

## Avant de travailler
1. Lire `README.md` et les documents techniques pertinents, puis **`docs/CHATGPT_PROJECT_HISTORY.md`** pour les demandes, décisions et lacunes du contexte.
2. Jeu de pêche Android hors-ligne avec captures actives, vente, économie, gacha, collection et progression par rang, code Java/HTML/JS en WebView.
3. Respecter le déroulé de progression et la sauvegarde locale, ne pas introduire d'économie payante sans décision explicite. Ne jamais versionner les clés de signature. Préserver toutes les branches/versions déjà travaillées.

## Exécution et vérification
- `node tests/core.test.js` pour la logique ; build release Android JDK 17, SDK 35, Gradle 8.11.1, APK non signé ; vérifier CI et ne pas prétendre avoir produit un APK signé.
- Utiliser de petites modifications contrôlables. Ne pas écraser ni supprimer des fichiers ou anciennes versions sans demande explicite.
- Distinguer hypothèses, code présent, essais effectivement exécutés et éléments encore à valider.

## Passation à Codex et archivage permanent
- **Document de référence de la conversation :** `docs/CHATGPT_PROJECT_HISTORY.md` ; il peut être incomplet et le dit explicitement.
- Après chaque intervention, mettre à jour ce document si une décision, une contrainte, une étape ou un nouveau contexte pertinent change. Référencer les nouveaux messages de l'utilisateur et de l'assistant lorsque leur texte exact est accessible.
- Format : date ISO et fuseau si connus, rôle `Utilisateur` ou `Assistant`, mention `verbatim` seulement pour un texte exact. Sinon `résumé reconstruit, non verbatim`. Ne pas inventer d'heure ni de citation.
- Si l'historique intégral n'est pas disponible, le signaler et demander un export réel plutôt que fabriquer une transcription. Préserver les exports existants sans les réécrire.
- Exclure secrets, identifiants, données personnelles et contenus non destinés à la publication. Le niveau de visibilité de ce dépôt s'applique aussi aux documents ajoutés.
