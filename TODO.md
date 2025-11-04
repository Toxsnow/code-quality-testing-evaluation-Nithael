# TODO (extrait du README)

Ce fichier regroupe la TODO list principale (priorisée) pour améliorer la qualité et le processus du projet.

## Tâches prioritaires

- Branch strategy & commit convention
  - Créer les branches obligatoires et appliquer la convention Conventional Commits.

- Prettier
  - Configurer Prettier : singleQuote: true, trailingComma: 'none', tabWidth: 2, printWidth: 120.

- ESLint
  - Frontend : eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-perfectionist, eslint-plugin-jsx-a11y.
  - Backend : eslint-plugin-n, eslint-plugin-unicorn, eslint-plugin-perfectionist.
  - Faire cohabiter Prettier et ESLint.

- Husky & lint-staged
  - pre-commit : eslint, prettier, jest --onlyChanged
  - pre-push : exécuter la suite de tests complète + vérification des seuils de couverture

- Tests (Jest)
  - Configurer Jest pour frontend et backend.
  - Seuils de couverture : statements 80%, branches 60%, functions 70%, lines 80%.
  - Ajouter tests unitaires initiaux pour utils/composants et controllers.

- Lighthouse CI
  - Ajouter configuration et script npm.
  - Seuils : Performance 80, Accessibility 100, Best Practices 90, SEO 80.

## Sécurité & stabilité

- Extraire secrets dans des variables d'environnement (`.env.example`).
- Rendre l'initialisation DB résiliente aux doublons (éviter `SQLITE_CONSTRAINT` qui stoppe le serveur).

## Améliorations optionnelles

- Ajouter Tailwind CSS et plugin ESLint pour Tailwind.
- Envisager migration progressive vers TypeScript.
- Ajouter tests d'accessibilité (axe) et rapport dans CI.

## Actions immédiates recommandées

1. Rendre l'init DB tolérant aux doublons (small patch) ou supprimer `database.sqlite` local si les données peuvent être perdues.
2. Ajouter `.env.example` et remplacer secrets codés en dur.
3. Initialiser Prettier + ESLint de base.

---

Fait automatiquement : cette TODO a été ajoutée et synchronisée avec l'outil de suivi de tâches.