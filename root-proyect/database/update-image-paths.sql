-- Script para actualizar las rutas de imágenes de las actividades existentes
-- Este script establece image_url a NULL para que se use la imagen placeholder por defecto

USE moveos;

-- Actualizar todas las actividades con rutas de imagen que no existen
UPDATE activities 
SET image_url = NULL 
WHERE image_url IN ('ruta.jpg', 'yoga.jpg', 'fotografia.jpg', 'vinos.jpg', 'cocina.jpg', 'bicicleta.jpg');

-- Verificar los resultados
SELECT id, title, image_url, state FROM activities;
