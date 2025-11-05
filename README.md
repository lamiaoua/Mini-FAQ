
# Mini FAQ - Projet Next.js avec Hugging Face

## Description

Mini FAQ est une application web permettant de poser des questions à un modèle d'IA et d'obtenir des réponses instantanées.  
Le projet utilise Next.js pour le frontend et le backend léger, et un modèle Hugging Face pour l'IA.

---


## Création du projet

- créaction du projet Next.js avec :

npx create-next-app mini-faq

- Pour utiliser Hugging Face :

Créer un token sur https://huggingface.co

Donner les permissions Fine-grained au token

Placer le token dans un fichier .env.local à la racine :

HF_API_KEY=ton_token_ici


⚡ Le fichier .env.local permet de cacher la clé API côté serveur pour ne pas l’exposer aux utilisateurs.

## Architecture du projet

Le projet contient 3 fichiers principaux côté frontend/backend :

- index.js:  Page principale de l'application qui importe le composant ChatComponent et gère l'affichage du chat

- ChatComponent.js: c'est composant React pour l’interface de chat qui permet de poser des questions et affiche l’historique des questions/réponses en utilisant des boutons pour :

Supprimer l’historique

Exporter l’historique (JSON pour le client et serveur)

Historique stocké dans localStorage pour persistance côté client

- ask.js (API route) est un backend léger pour appeler le modèle MiniMaxAI/MiniMax-M2 sur Hugging Face, il Reçoit la question depuis le frontend, renvoie la réponse générée et il protège la clé API côté serveur

## Technologies utilisées: 

Visual Studio Code : éditeur de code principal

Next.js : framework React pour frontend et backend

React : création des composants interactifs

Node.js / npm : exécution côté serveur et gestion des packages

Hugging Face API : modèle MiniMaxAI pour générer les réponses

localStorage & JSON : pour stocker et exporter l’historique des questions/réponses

## Points bonus réalisés

Enregistrement de l’historique des questions/réponses côté client (localStorage)

Possibilité de supprimer l’historique via un bouton

Possibilité d’exporter l’historique pour le client et serveur en JSON

Backend sécurisé pour cacher la clé Hugging Face et gérer les appels au modèle
