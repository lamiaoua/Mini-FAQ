
# Mini FAQ - Projet Next.js avec Hugging Face

## Description

Mini FAQ est une application web permettant de poser des questions à un modèle d'IA et d'obtenir des réponses instantanées.  
Le projet utilise Next.js pour le frontend et le backend léger, et un modèle Hugging Face pour l'IA.




## Création du projet

- Créaction du projet Next.js avec : npx create-next-app mini-faq

- Hugging Face pour : créer un token sur https://huggingface.co lui donner les permissions Fine-grained  et le placer dans un fichier .env.local (HF_API_KEY=ton_token_ici).

⚡ Le fichier .env.local permet de cacher la clé API côté serveur pour ne pas l’exposer aux utilisateurs.

## Architecture du projet

Le projet contient 3 fichiers principaux côté frontend/backend :

- index.js:  Page principale de l'application qui importe le composant ChatComponent et gère l'affichage du chat

- ChatComponent.js: c'est composant React pour l’interface de chat qui permet de poser des questions et affiche l’historique des questions/réponses en utilisant des boutons pour : Supprimer l’historique, Exporter l’historique (JSON pour le client et serveur) et bouton Historique stocké dans localStorage pour persistance côté client

- ask.js (API route) est un backend léger pour appeler le modèle MiniMaxAI/MiniMax-M2 sur Hugging Face, il Reçoit la question depuis le frontend, renvoie la réponse générée et il protège la clé API côté serveur

```
projet/
├── pages/
│   ├── api/
│   │   └── ask.js                 ← Backend (API Hugging Face + logs serveur)
│   └── index.js                   ← Page principale (juste l'import)
├── components/
│   └── ChatComponent.js           ← Interface + localStorage
├── logs/
│   └── conversations.json         ← Créé automatiquement par le serveur
├── .env.local                     ← Clé API
│   HF_API_KEY=hf_xxxxxxxxxxxxx
└── package.json
```


## Technologies utilisées: 

-Visual Studio Code : éditeur de code principal

-Next.js : framework React pour frontend et backend

-React : création des composants interactifs

-Node.js / npm : exécution côté serveur et gestion des packages

-Hugging Face API : modèle MiniMaxAI pour générer les réponses

### Historique des questions/réponses
- **localStorage** : stocke l’historique côté **client** pour une persistance dans le navigateur.  
- **JSON** : stocke l’historique côté **serveur**, ce fichier contient par exemple :

```json
[
  {
    "timestamp": "2025-11-05T08:42:08.282Z",
    "date": "05/11/2025",
    "time": "09:42:08,282",
    "question": "hi",
    "answer": "Salut.",
    "model": "MiniMaxAI/MiniMax-M2"
  }
]

```

## Problèmes rencontrés et solutions

### 1️⃣ Conflit App Router / Pages Router
**Problème :**
```
App Router and Pages Router both match path: /
Next.js does not support having both App Router and Pages Router routes matching the same path.
```

**Explication :**
- Next.js 13+ propose deux systèmes de routage :
  1. Pages Router → classique (`pages/index.js`, `pages/api/ask.js`)  
  2. App Router → nouveau (`app/page.js`, `app/layout.js`, etc.)
- On ne peut pas avoir les deux définissant la même route `/`.
- Si vous avez créé le projet avec App Router par défaut et que vous avez aussi `pages/index.js`, cela crée un conflit.

**Solution :**
- Choisir un seul système de routage (Pages Router ou App Router) et supprimer l’autre dossier. (ici j'ai choisi Pages Router) 

### 2️⃣ Fallback `"Sorry, I don’t have an answer for that."`
**Problème :**
- Arrive quand le token Hugging Face n’est pas valide ou n’a pas les permissions.
- Modèle trop lourd ou non accessible.
- Problème réseau ou code côté serveur
  
**Solution :** 
Ici j'ai oublié de cocher `"Make calls to Inference Providers"`  et  `"Make calls to your Inference Endpoints"` lors de la génération du token. 

### 3️⃣ Ancienne API endpoint Hugging Face: 
**Problème :**
```
{
  "error": "https://api-inference.huggingface.co is no longer supported. Please use https://router.huggingface.co/hf-inference instead."
}

```


**Explication :**
- L’ancienne URL n’est plus supportée → Status 410.
- Hugging Face a adopté le format compatible OpenAI pour leur nouvelle API  parce que :

       - Standard de l'industrie : Beaucoup d'outils utilisent déjà ce format
       - Compatibilité : le code peut facilement basculer entre différents providers (Hugging Face, OpenAI, Groq, etc.)


**Solution :**
- ``` https://router.huggingface.co/v1/chat/completions ``` (format OpenAI-compatible)
- Format chat moderne avec la nouvelle API : 
```
javascript{
  model: "MiniMaxAI/MiniMax-M2",
  messages: [
    { role: "system", content: "..." },
    { role: "user", content: question }
  ],
  max_tokens: 2000,
  temperature: 0.7
}

```
-L'ancien format simple tilise :
```
javascript{ inputs: question }
```

## Points bonus réalisés

Enregistrement de l’historique des questions/réponses côté client (localStorage)

Possibilité de supprimer l’historique via un bouton

Possibilité d’exporter l’historique pour le client et serveur en JSON

Backend sécurisé pour cacher la clé Hugging Face et gérer les appels au modèle

## Aperçu de l'interface Mini FAQ:
![Image](https://github.com/user-attachments/assets/d62ce83c-bb3d-4d23-bfbe-7f3ca722207b)

![Image](https://github.com/user-attachments/assets/7ce0cc82-6174-4a11-92ca-d7853b0addce)

## Authors

- [Lamia Oualili](https://github.com/lamiaoua)

