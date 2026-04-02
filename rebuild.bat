@echo off
SETLOCAL
cls
echo ==========================================================
echo          RECONSTRUCTION DU PROJET (UPDATE)
echo ==========================================================

echo [1/2] Arret des conteneurs actuels...
docker-compose down

echo [2/2] Reconstruction et demarrage avec les nouveaux fichiers...
docker-compose up -d --build

echo ==========================================================
echo   MISE A JOUR TERMINEE !
echo   - Frontend : http://localhost:5173
echo ==========================================================
pause
