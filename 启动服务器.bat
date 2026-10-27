@echo off
chcp 65001 >nul
title 启动海南官网服务器
echo ================================
echo   ISLA HAINAN - 启动本地服务
echo ================================
echo.

echo [1/3] 启动接口服务 (端口 5175)...
cd /d "%~dp0"
start "hainan-api 5175" cmd /k "node server\index.mjs"

echo [2/3] 启动官网前端 (端口 5173)...
start "hainan-web 5173" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort"

echo [3/3] 启动露营地图 (端口 3210)...
cd /d "C:\Users\cwjon\Documents\Trae-CN\default\beisu-visitor"
start "beisu 3210" cmd /k "node server.js"

echo.
echo 全部启动完成，浏览器打开：
echo   http://localhost:5173/
echo   http://localhost:3210/island
echo.
echo 关闭弹出的三个窗口即可停止对应服务。
pause
