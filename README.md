# Trackify

![Spotify](https://img.shields.io/badge/Spotify-1ED760?style=for-the-badge&logo=spotify&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-B125EA?style=for-the-badge&logo=kotlin&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Spring Boot](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=000000)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)

Trackify es una aplicación que ayuda a los usuarios a descubrir y agregar nuevas canciones de artistas específicos a una lista de reproducción de Spotify.

## To-Do

### Backend

- **Métricas:** Responses Spotify y Controllers
- **Métricas:** Tiempos de ejecución (Annotation)
- **Logs**: Implementar Loki para logs en Grafana
- **Optimizaciones:** Paralelizar tarea core (Por usuario)

### Frontend

- Más botones para la paginación (Inicio - Final)
- Arreglar el Responsive Design
- Poder cerrar la sesión del usuario
- Spinners de carga y deshabilitar botones
- **Métricas:** Si es posible, conectar el Frontend a Prometheus
- **Métricas:** API Calls y Responses Spotify
- **Optimizaciones:** Paralelizar y a poder ser, reducir API Calls hechas

### Seguridad

- Proteger la app (Front y Backend) con un Rate Limit
- Verificar si Prometheus es público y como protegerlo

### Versión 2

- Poder organizar los seguidos del usuario
- Poder generar una playlist de X artista
- Hacer una landing Page de Frontend
- Mejoras en el diseño del Frontend
- Implementar funcionalidades Pro (Límites)
