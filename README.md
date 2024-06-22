# Simulation de Propagation de fluide

Ce projet est une simulation interactive de propagation de fluide basée sur les équations de ***Navier-Stokes*** pour la dynamique des fluides. Il utilise la bibliothèque **p5.js** pour le rendu graphique dans le navigateur et a été réalisé avec l'aide la vidéo de CodingTrain : https://youtu.be/alhpH6ECFvQ

## Description

La simulation permet d'observer la propagation d'un fluide dans un espace défini, en tenant compte de la viscosité, de la diffusion et des forces appliquées. L'utilisateur peut interagir avec la simulation pour ajouter de la densité ou de la vitesse au fluide.

## Configuration

Le projet est configuré avec des valeurs par défaut dans le fichier `script.js`, mais peuvent être ajustées selon les besoins :

- `FRAME_RATE`: Taux de rafraîchissement de la simulation.
- `VISCOSITY`: Viscosité du fluide.
- `SCALE`: Échelle des cellules de la grille pour le rendu.
- `N`: Taille de la grille.
- `ITER`: Nombre d'itérations pour les calculs de diffusion et de projection.

## Installation

Pour lancer la simulation, suivez ces étapes :

1. Clonez ce dépôt sur votre machine locale.
2. Ouvrez le fichier `index.html` dans votre navigateur web.

Aucune installation de dépendances n'est nécessaire, car le projet utilise p5.js à partir d'un CDN.