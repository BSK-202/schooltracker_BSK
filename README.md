<div align="center">

# 🚌 SchoolTracker

### Plateforme de gestion et de suivi intelligent du transport scolaire

**Web Dashboard · Mobile Application · REST API · Real-Time Tracking**

<br>

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge\&logo=nestjs\&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge\&logo=next.js\&logoColor=white)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-4169E1?style=for-the-badge\&logo=postgresql\&logoColor=white)](https://www.postgresql.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=for-the-badge\&logo=socket.io\&logoColor=white)](https://socket.io/)
[![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge\&logo=expo\&logoColor=white)](https://expo.dev/)

<br>

**Une solution full-stack permettant de centraliser la gestion du transport scolaire,
le suivi des bus en temps réel et la communication avec les parents.**

</div>

---

# 📌 Présentation

**SchoolTracker** est une plateforme full-stack conçue pour digitaliser la gestion du transport scolaire.

Le système regroupe trois interfaces principales :

* 🖥️ **Dashboard Web** — destiné à l'administration
* 📱 **Application mobile** — destinée aux parents et aux chauffeurs
* ⚙️ **Backend centralisé** — API REST, authentification, données, WebSocket et notifications

L'objectif est de fournir une vision centralisée du transport scolaire tout en permettant aux parents de suivre le trajet de leur enfant en temps réel.

---

# 🎯 Problématique

La gestion traditionnelle du transport scolaire peut nécessiter plusieurs outils séparés pour :

* gérer les élèves et leurs responsables ;
* affecter les chauffeurs et les bus ;
* organiser les arrêts et les trajets ;
* suivre les véhicules ;
* informer les parents des changements ;
* gérer les retards et les événements du trajet.

**SchoolTracker** regroupe ces fonctionnalités dans une même plateforme.

---

# ✨ Fonctionnalités principales

## 🏫 Administration — Dashboard Web

Le dashboard permet aux administrateurs de gérer l'ensemble du système.

### Gestion des données

* Gestion des écoles
* Gestion des bus
* Gestion des chauffeurs
* Gestion des parents
* Gestion des élèves
* Gestion des arrêts
* Gestion des trajets

### Gestion des trajets

* Création de trajets
* Définition de l'ordre des arrêts
* Affectation des élèves
* Association bus / chauffeur / trajet
* Visualisation des itinéraires
* Géolocalisation des arrêts

### Administration

* Recherche
* Filtres
* Pagination
* Tableaux de données
* Statistiques
* Génération de QR codes pour les élèves

---

# 📱 Application mobile

L'application mobile est développée avec **React Native + Expo**.

Elle propose des interfaces adaptées aux deux profils :

### 👨‍👩‍👧 Parent

Le parent peut :

* consulter ses enfants ;
* consulter leur trajet ;
* suivre le bus en temps réel ;
* visualiser les arrêts ;
* recevoir des notifications ;
* consulter les informations du trajet.

### 🚌 Chauffeur

Le chauffeur peut :

* consulter son bus ;
* consulter les élèves affectés ;
* consulter son itinéraire ;
* participer à la simulation du trajet ;
* visualiser les informations nécessaires à son parcours.

L'interface et les fonctionnalités disponibles sont déterminées dynamiquement selon le rôle de l'utilisateur.

---

# 🗺️ Suivi GPS en temps réel

Le système intègre un mécanisme de suivi temps réel basé sur **Socket.IO**.

Le flux principal est le suivant :

```text
                ┌──────────────────────┐
                │      Dashboard       │
                │        Admin         │
                └──────────┬───────────┘
                           │
                    Start Simulation
                           │
                           ▼
                ┌──────────────────────┐
                │     NestJS Backend    │
                │                      │
                │  SimulationService   │
                └──────────┬───────────┘
                           │
                     Socket.IO
                           │
                ┌──────────┴───────────┐
                │                      │
                ▼                      ▼
        Bus Position             Notifications
                │                      │
                ▼                      ▼
       Application mobile        Parent
```

Le backend peut simuler le déplacement d'un bus sur un itinéraire réel.

La position est régulièrement mise à jour puis diffusée aux clients connectés.

---

# ⚡ Moteur de simulation

Le backend contient un moteur de simulation permettant de reproduire un trajet de bus.

### Fonctionnalités

* Génération d'itinéraires
* Simulation GPS
* Mise à jour périodique de la position
* Calcul des distances
* Calcul du cap du véhicule
* Détection des arrêts
* Calcul d'ETA
* Détection des retards
* Pause / reprise
* Modification de la vitesse de simulation
* Diffusion WebSocket

### Vitesse de simulation

La simulation peut être accélérée afin de faciliter les tests :

```text
0.5x
1x
2x
5x
10x
```

Cela permet notamment de tester rapidement les différents scénarios de notification.

---

# 🔔 Système de notifications

SchoolTracker intègre un système de notifications push basé sur **Expo Push Notifications**.

Des notifications peuvent être déclenchées lors d'événements importants du trajet.

Exemples :

```text
🚌 Départ du bus

📍 Bus en approche de votre arrêt

⏱️ Arrivée prévue dans quelques minutes

🚏 Bus arrivé à l'arrêt

🏫 Arrivée à l'école

⚠️ Retard détecté
```

Le système utilise la position du véhicule et les informations du trajet pour déterminer les événements à notifier.

---

# 🧠 Calculs géographiques

Le backend utilise notamment :

### Distance

Calcul de la distance entre deux coordonnées GPS grâce à la formule de **Haversine**.

```text
Point A ───────────────► Point B
(lat, lon)               (lat, lon)

          Distance
```

### Bearing

Calcul de la direction du déplacement du véhicule afin de permettre une représentation plus réaliste de son orientation sur la carte.

---

# 🏗️ Architecture

SchoolTracker suit une architecture séparant clairement les responsabilités :

```text
                    SCHOOLTRACKER
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
     Web Dashboard    Mobile App       Backend API
       Next.js       React Native       NestJS
          │               │                │
          │               │                │
          └───────────────┼────────────────┘
                          │
                          ▼
                    PostgreSQL
                     + PostGIS
                          │
                          │
                    External Services
                    ┌─────┴─────┐
                    │           │
                    ▼           ▼
             OpenRouteService  Expo
```

---

# 📁 Structure du projet

```text
schooltracker/
│
├── back-end/
│   │
│   └── src/
│       ├── auth/
│       │   ├── guards/
│       │   ├── strategies/
│       │   └── dto/
│       │
│       ├── admin/
│       │   ├── schools/
│       │   ├── buses/
│       │   ├── drivers/
│       │   ├── parents/
│       │   ├── students/
│       │   ├── stops/
│       │   └── trajets/
│       │
│       ├── tracking/
│       │
│       ├── simulation/
│       │
│       └── notifications/
│
├── admin_interface/
│   │
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── services/
│
├── front-end/
│   │
│   └── src/
│       ├── screens/
│       ├── components/
│       ├── redux/
│       ├── hooks/
│       └── services/
│
└── docs/
    └── screenshots/
```

---

# 🛠️ Stack technique

## Backend

| Technologie         | Utilisation                   |
| ------------------- | ----------------------------- |
| **NestJS 11**       | Architecture backend          |
| **TypeScript**      | Langage                       |
| **TypeORM**         | Accès aux données             |
| **PostgreSQL**      | Base de données               |
| **PostGIS**         | Données géographiques         |
| **JWT**             | Authentification              |
| **Passport**        | Stratégies d'authentification |
| **Socket.IO**       | Communication temps réel      |
| **class-validator** | Validation des données        |
| **bcrypt**          | Hashage des mots de passe     |
| **QRCode**          | Génération des QR codes       |
| **Expo Server SDK** | Notifications push            |
| **Jest**            | Tests                         |

## Dashboard Web

| Technologie      | Utilisation           |
| ---------------- | --------------------- |
| **Next.js 16**   | Application Web       |
| **React 19**     | Interface utilisateur |
| **TypeScript**   | Typage                |
| **Tailwind CSS** | Styling               |
| **shadcn/ui**    | Composants UI         |
| **Leaflet**      | Cartographie          |
| **Axios**        | Communication HTTP    |
| **Lucide React** | Icônes                |

## Mobile

| Technologie            | Utilisation        |
| ---------------------- | ------------------ |
| **React Native**       | Application mobile |
| **Expo SDK 54**        | Toolchain mobile   |
| **Redux Toolkit**      | Gestion d'état     |
| **React Navigation**   | Navigation         |
| **react-native-maps**  | Cartographie       |
| **Socket.IO Client**   | Temps réel         |
| **Expo Notifications** | Notifications      |
| **Expo Secure Store**  | Stockage sécurisé  |
| **Axios**              | Communication HTTP |

## Services externes

| Service               | Utilisation          |
| --------------------- | -------------------- |
| **OpenRouteService**  | Calcul d'itinéraires |
| **OpenStreetMap**     | Données/cartographie |
| **Expo Push Service** | Notifications        |

---

# 🔐 Authentification & sécurité

L'application utilise une authentification basée sur **JWT**.

Le système distingue notamment les utilisateurs selon leur rôle.

```text
                Login
                  │
                  ▼
            Authentication
                  │
                  ▼
             JWT Tokens
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
      Parent             Chauffeur
        │                   │
        ▼                   ▼
   Parent APIs        Driver APIs
```

Les mots de passe sont stockés sous forme de hash avec **bcrypt**.

Les tokens sont stockés côté mobile avec **Expo Secure Store**.

Les variables sensibles sont externalisées dans des fichiers `.env`.

---

# 🗄️ Modèle de données

La plateforme repose sur **PostgreSQL avec PostGIS**.

Les principales entités sont :

```text
School
  │
  ├── Bus
  │     │
  │     └── Driver
  │
  ├── Student
  │     │
  │     └── Parent
  │
  └── Trip
         │
         ├── Stop
         │
         ├── Bus
         │
         └── Driver
```

Les coordonnées géographiques sont stockées avec le support spatial de **PostGIS**.

---

# 📡 API REST

## Authentication

| Méthode | Endpoint        | Description         |
| ------- | --------------- | ------------------- |
| POST    | `/auth/login`   | Authentification    |
| POST    | `/auth/refresh` | Rafraîchir le token |
| GET     | `/auth/profile` | Profil utilisateur  |

## Administration

| Méthode             | Endpoint          | Description |
| ------------------- | ----------------- | ----------- |
| GET/POST/PUT/DELETE | `/admin/schools`  | Écoles      |
| GET/POST/PUT/DELETE | `/admin/buses`    | Bus         |
| GET/POST/PUT/DELETE | `/admin/drivers`  | Chauffeurs  |
| GET/POST/PUT/DELETE | `/admin/parents`  | Parents     |
| GET/POST/PUT/DELETE | `/admin/students` | Élèves      |
| GET/POST/PUT/DELETE | `/admin/stops`    | Arrêts      |
| GET/POST/PUT/DELETE | `/admin/trajets`  | Trajets     |

## Tracking

| Méthode | Endpoint              | Description              |
| ------- | --------------------- | ------------------------ |
| GET     | `/tracking/schools`   | Écoles liées au parent   |
| GET     | `/tracking/children`  | Enfants du parent        |
| GET     | `/tracking/child/:id` | Informations d'un enfant |
| GET     | `/tracking/summary`   | Résumé du suivi          |

## Notifications

| Méthode | Endpoint                          | Description             |
| ------- | --------------------------------- | ----------------------- |
| POST    | `/notifications/register-token`   | Enregistrer un token    |
| DELETE  | `/notifications/unregister-token` | Supprimer un token      |
| POST    | `/notifications/test`             | Tester une notification |

---

# 🔌 Communication WebSocket

Namespace :

```text
/simulation
```

### Client → serveur

```text
join-bus
start-simulation-with-route
stop-simulation
change-simulation-speed
toggle-simulation-pause
```

### Serveur → client

```text
bus-position
bus-stop
bus-arrived
time-status
scheduled-notification
```

Cette communication permet de mettre à jour la position du bus sans avoir à effectuer continuellement des requêtes HTTP classiques.

---

# 📸 Aperçu de l'application

> Ajouter les captures réelles dans `docs/screenshots/`.

### Dashboard Administration

![Dashboard](docs/screenshots/admin-dashboard.png)

### Gestion des trajets

![Routes](docs/screenshots/admin-routes.png)

### Carte et suivi

![Tracking](docs/screenshots/admin-map.png)

### Application mobile

| Connexion                                   | Suivi temps réel                                  | Profil                                          |
| ------------------------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| ![Login](docs/screenshots/mobile-login.png) | ![Tracking](docs/screenshots/mobile-tracking.png) | ![Profile](docs/screenshots/mobile-profile.png) |

---

# 🚀 Installation

## Prérequis

Avant de lancer le projet, installer :

* **Node.js ≥ 20**
* **PostgreSQL ≥ 14**
* **PostGIS**
* **npm**
* **Expo**
* Un compte Expo pour les notifications
* Une clé API OpenRouteService

---

## 1. Cloner le projet

```bash
git clone https://github.com/BSK-202/schooltracker.git

cd schooltracker
```

---

## 2. Configurer PostgreSQL

Créer la base de données :

```bash
createdb db_schoolTracker
```

Activer PostGIS :

```bash
psql -d db_schoolTracker \
  -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

---

## 3. Configurer le Backend

```bash
cd back-end

npm install
```

Créer :

```text
.env
```

à partir de :

```text
.env.example
```

Puis lancer :

```bash
npm run start:dev
```

API :

```text
http://localhost:3000
```

---

## 4. Lancer le Dashboard

```bash
cd ../admin_interface

npm install
```

Créer :

```text
.env.local
```

avec :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Puis :

```bash
npm run dev
```

Dashboard :

```text
http://localhost:3001
```

---

## 5. Lancer l'application mobile

```bash
cd ../front-end

npm install

npx expo start
```

Configurer l'URL du backend dans la configuration de l'application.

Pour un appareil physique, utiliser l'adresse IP locale de la machine exécutant le backend :

```env
EXPO_PUBLIC_API_URL=http://192.168.1.X:3000
```

---

# 🔑 Variables d'environnement

## Backend

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=db_schoolTracker

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

## Dashboard

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Mobile

```env
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_ORS_API_KEY=
```

> ⚠️ Les fichiers `.env` ne doivent jamais être commités dans Git.

Utiliser les fichiers :

```text
.env.example
```

pour documenter les variables nécessaires sans exposer les secrets.

---

# 🧪 Tests

Les tests backend peuvent être exécutés avec :

```bash
cd back-end
```

### Tests unitaires

```bash
npm run test
```

### Mode Watch

```bash
npm run test:watch
```

### Couverture

```bash
npm run test:cov
```

### Tests E2E

```bash
npm run test:e2e
```

---

# 🧪 Scénarios de test principaux

Le projet peut notamment être testé sur les scénarios suivants :

### Authentification

* Connexion parent
* Connexion chauffeur
* Rafraîchissement du token
* Accès selon le rôle

### Administration

* Création d'une école
* Création d'un bus
* Affectation d'un chauffeur
* Création d'un élève
* Création d'un arrêt
* Création d'un trajet

### Tracking

* Connexion du parent
* Sélection d'un enfant
* Connexion à la room WebSocket
* Réception des positions
* Mise à jour de la carte

### Simulation

* Démarrage
* Pause
* Reprise
* Modification de vitesse
* Arrivée à un arrêt
* Arrivée à destination

### Notifications

* Enregistrement du token
* Notification de test
* Notification d'approche
* Notification d'arrivée
* Notification de retard

---

# 🗺️ Roadmap

Les évolutions envisagées comprennent notamment :

* [ ] RBAC plus granulaire
* [ ] Migrations TypeORM
* [ ] Suppression de `synchronize: true` en environnement de production
* [ ] CI/CD avec GitHub Actions
* [ ] Tests E2E complets
* [ ] Historique des trajets
* [ ] Export de rapports
* [ ] Internationalisation FR / AR / EN
* [ ] Mode hors-ligne mobile
* [ ] Gestion avancée des permissions
* [ ] Monitoring et observabilité
* [ ] Déploiement cloud

---

# 🧩 Architecture technique en résumé

```text
┌───────────────────────────────────────────────────────┐
│                    SCHOOLTRACKER                      │
└───────────────────────────────────────────────────────┘

                       USERS
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
       Web Dashboard            Mobile App
         Next.js             React Native / Expo
             │                       │
             └───────────┬───────────┘
                         │
                    HTTP / WebSocket
                         │
                         ▼
                ┌─────────────────┐
                │     NestJS      │
                │      API        │
                ├─────────────────┤
                │ Authentication  │
                │ Administration  │
                │ Tracking        │
                │ Simulation      │
                │ Notifications   │
                └────────┬────────┘
                         │
                         ▼
                PostgreSQL + PostGIS
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       OpenRouteService          Expo Push
```

---

# 💡 Points techniques intéressants

SchoolTracker met en œuvre plusieurs problématiques courantes du développement logiciel moderne :

### Architecture full-stack

Séparation entre :

```text
Frontend
Backend
Database
External Services
```

### Communication temps réel

Utilisation de WebSocket / Socket.IO pour diffuser les positions du véhicule.

### Géolocalisation

Utilisation de coordonnées géographiques et de calculs de distance.

### Gestion des rôles

Différenciation des fonctionnalités selon le type d'utilisateur.

### Notifications événementielles

Déclenchement de notifications à partir d'événements calculés par le backend.

### Gestion d'état mobile

Utilisation de Redux Toolkit pour centraliser l'état de l'application.

### Base de données spatiale

Utilisation de PostgreSQL + PostGIS pour les données géographiques.

---

# 📚 Objectifs du projet

Le projet a été réalisé afin de mettre en pratique :

* la conception d'une architecture full-stack ;
* le développement d'API REST ;
* la programmation temps réel ;
* la géolocalisation ;
* la conception de bases de données relationnelles ;
* le développement web moderne ;
* le développement mobile cross-platform ;
* l'authentification sécurisée ;
* la communication événementielle ;
* l'intégration de services externes.

---

# 📄 Licence

Projet réalisé dans un cadre **académique et personnel**.

Tous droits réservés © 2026 **BSK-202**.
---

# 👥 Équipe

<div align="center">

### BSK-202

[![GitHub](https://img.shields.io/badge/GitHub-BSK--202-181717?style=for-the-badge\&logo=github)](https://github.com/BSK-202)

### fadmajadda

[![GitHub](https://img.shields.io/badge/GitHub-fadmajadda-181717?style=for-the-badge\&logo=github)](https://github.com/fadmajadda)


</div>

---

<div align="center">
---

# 👩‍💻 Auteure

<div align="center">

### Ikrame BASKANE

**Ingénieure en Génie Logiciel & Intégration des Systèmes Informatiques**

Développement Full-Stack · Backend · Applications mobiles · Systèmes distribués

<br>

[![GitHub](https://img.shields.io/badge/GitHub-BSK--202-181717?style=for-the-badge\&logo=github)](https://github.com/BSK-202)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ikrame_BASKANE-0A66C2?style=for-the-badge\&logo=linkedin)](https://www.linkedin.com/in/ikrame-baskane-781629279/)

</div>

---

<div align="center">

**SchoolTracker — Gestion · Géolocalisation · Temps réel**

</div>
