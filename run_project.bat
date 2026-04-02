@echo off
SETLOCAL
cls
echo ==========================================================
echo       LANCEMENT DU PROJET DE GESTION DE TICKETS
echo ==========================================================

:: Vérification de Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Docker n'est pas installe ou n'est pas lance.
    pause
    exit /b
)

echo [1/4] Construction et demarrage des conteneurs...
docker-compose up -d --build

echo [2/4] Attente du demarrage de la base de donnees (10s)...
timeout /t 10 /nobreak >nul

echo [3/4] Application des migrations Django...
docker-compose exec backend python manage.py migrate

echo [4/4] Chargement des donnees initiales (utilisateurs et tickets)...
docker-compose exec backend python manage.py seed_data

echo ==========================================================
echo   PROJET PRET !
echo   - Frontend : http://localhost:5173
echo   - Backend (API) : http://localhost:8000
echo   - Admin Django : http://localhost:8000/admin
echo ==========================================================
echo Appuyez sur une touche pour voir les logs (Ctrl+C pour quitter)...
pause
docker-compose logs -f
