# Trackify

![Spotify](https://img.shields.io/badge/Spotify-1ED760?style=for-the-badge&logo=spotify&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-B125EA?style=for-the-badge&logo=kotlin&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=000000)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)

Trackify es una aplicación que ayuda a los usuarios a descubrir y agregar nuevas canciones de artistas específicos a una lista de reproducción de Spotify.

## To-Do

### Backend

- **Métricas:** Responses de Spotify
- **Métricas:** En casos de Excepciones
- **Métricas:** En Responses Controllers
- **Métricas:** De tiempos de ejecución
- **Logs**: Implementar Loki para logs en Grafana

- **Funcionalidad:** Notificaciones Email en servicio Core

- **Optimizaciones:** Migrar la DB de MongoDB a PostgreSQL
- **Optimizaciones:** Paralelizar la tarea core (Por usuario)

### Frontend

- Más botones para la paginación
- Poder cerrar la sesión del usuario
- **Mejoras:** Diseño de la UI de la App
- **Optimizaciones:** Paralelizar y reducir las API Calls

### Deploy

- Desplegar en la nube (Investigar)
- ¿Cómo centralizar las métricas?
- Monitorear costos y proteger la app con RL
- Monitorear si no se rompe el RL de Spotify

### Funcionalidades v2

- Historial de canciones agregadas
- Poder organizar los seguidos del usuario
- Poder generar una playlist de X artista

### App

- Implementar React native para tener la app móvil
