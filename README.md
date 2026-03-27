# 🎫 HelpDesk — Système de Ticketing

Application complète de gestion de tickets avec React TypeScript (frontend) et Django REST Framework (backend), avec PostgreSQL sous Docker.

---

## 🏗️ Architecture

```
ticketing/
├── docker-compose.yml          # Orchestration des services
├── backend/                    # Django + DRF
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── config/                 # Settings, URLs, WSGI
│   ├── accounts/               # Auth, Users (JWT)
│   └── tickets/                # Tickets, Comments, Categories
└── frontend/                   # React TypeScript + Vite + Tailwind
    ├── Dockerfile
    ├── src/
    │   ├── pages/              # LoginPage, Dashboard, TicketList, etc.
    │   ├── components/         # Layout, Sidebar
    │   ├── contexts/           # AuthContext (JWT)
    │   ├── lib/                # api.ts (Axios), utils.ts
    │   └── types/              # TypeScript interfaces
```

---

## 🚀 Démarrage rapide

### Prérequis
- Docker & Docker Compose installés
- Ports libres : `5432`, `8000`, `5173`

### 1. Lancer tous les services

```bash
cd ticketing
docker-compose up --build
```

### 2. Créer les données initiales (dans un autre terminal)

```bash
docker-compose exec backend python manage.py seed_data
```

### 3. Accéder à l'application

| Service     | URL                          |
|-------------|------------------------------|
| Frontend    | http://localhost:5173         |
| Backend API | http://localhost:8000/api     |
| API Docs    | http://localhost:8000/api/docs|
| Django Admin| http://localhost:8000/admin   |

---

## 👥 Comptes de démonstration

| Rôle         | Email                        | Mot de passe |
|--------------|------------------------------|--------------|
| Admin        | admin@ticketing.mg           | admin123     |
| Responsable  | responsable@ticketing.mg     | resp123      |
| Utilisateur  | user@ticketing.mg            | user123      |

---

## ✨ Fonctionnalités

### Utilisateur
- ✅ Inscription / Connexion (JWT)
- ✅ Créer une demande/réclamation avec formulaire détaillé
- ✅ Choisir le responsable destinataire
- ✅ Joindre un fichier
- ✅ Voir l'historique de ses tickets
- ✅ Suivre le statut en temps réel
- ✅ Chat intégré pour les échanges

### Administrateur / Responsable
- ✅ Voir tous les tickets du système
- ✅ Accepter, assigner ou rejeter une demande
- ✅ Réassigner à un autre responsable
- ✅ Répondre via chat (comme Facebook/Messenger)
- ✅ Ajouter des **étapes de résolution** numérotées (guide step-by-step)
- ✅ Notes internes (visibles admin seulement)
- ✅ Tableau de bord avec statistiques
- ✅ Historique des modifications

---

## 🔧 Commandes utiles

```bash
# Logs en temps réel
docker-compose logs -f

# Accéder au shell Django
docker-compose exec backend python manage.py shell

# Créer un superuser manuellement
docker-compose exec backend python manage.py createsuperuser

# Migrations
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Arrêter et supprimer les volumes (reset DB)
docker-compose down -v
```

---

## 🌐 API Endpoints principaux

```
POST   /api/auth/login/              → Connexion (retourne JWT)
POST   /api/auth/register/           → Inscription
GET    /api/auth/me/                 → Profil utilisateur
GET    /api/auth/responsables/       → Liste des responsables

GET    /api/tickets/                 → Liste des tickets (filtrés par rôle)
POST   /api/tickets/                 → Créer un ticket
GET    /api/tickets/{id}/            → Détail d'un ticket
PATCH  /api/tickets/{id}/            → Modifier un ticket
POST   /api/tickets/{id}/assign/     → Assigner un responsable
POST   /api/tickets/{id}/resolve/    → Marquer résolu
POST   /api/tickets/{id}/reject/     → Rejeter
GET    /api/tickets/stats/           → Statistiques (admin/resp)

GET    /api/tickets/{id}/comments/   → Commentaires d'un ticket
POST   /api/tickets/{id}/comments/   → Ajouter un commentaire

GET    /api/categories/              → Catégories
```

---

## 🎨 Design

- **Thème** : Dark mode professionnel (bleu nuit + accents bleus)
- **Police** : Sora (sans-serif) + JetBrains Mono
- **Chat** : Style Messenger avec bulles colorées
- **Étapes** : Guide de résolution step-by-step visuel en vert
- **Responsive** : Mobile + Desktop

---

## 🔐 Sécurité

- Authentification JWT (access 24h + refresh 7 jours)
- Permissions par rôle (`user`, `responsable`, `admin`)
- Les utilisateurs ne voient que leurs propres tickets
- Les responsables voient uniquement les tickets qui leur sont assignés
- Les admins voient tout
