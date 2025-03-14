package com.trackwatch.backend.utils.helper

import com.trackwatch.backend.model.Track
import com.trackwatch.backend.model.User
import com.trackwatch.backend.utils.values.Constants
import org.springframework.stereotype.Component
import java.util.*

@Component
class EmailHelper {

    fun generateWelcomeEmailSubject(): String =
        "\uD83C\uDFB6 ¡Bienvenido a ${Constants.APP_NAME}! ❤\uFE0F"

    fun generateAddedTracksEmailSubject(userAddedTracks: List<Track>): String =
        if (userAddedTracks.size == 1) "\uD83C\uDFB6 Nueva canción añadida a tu playlist"
        else "\uD83C\uDFB6 ${userAddedTracks.size} nuevas canciones añadidas a tu playlist"

    fun generateWelcomeEmailBody(user: User): String {
        val year = generateCurrentYear()

        return """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background-color: ${Constants.COLOR_LIGHT_GRAY_1}; color: ${Constants.COLOR_DARK_GRAY}; }
                .email-container { max-width: 600px; margin: 20px auto; background-color: ${Constants.COLOR_WHITE}; border-radius: 8px; border: 1px solid ${Constants.COLOR_LIGHT_GRAY_3}; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
                .header { background-color: ${Constants.COLOR_GREEN}; color: ${Constants.COLOR_WHITE}; text-align: center; padding: 20px; font-size: 20px; font-weight: bold; }
                .header-subtitle { font-size: 12px; font-weight: normal; }
                .content { padding: 20px; }
                .footer { background-color: ${Constants.COLOR_LIGHT_GRAY_2}; color: #666; text-align: center; padding: 10px; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    🎶 ¡Bienvenido a ${Constants.APP_NAME}! ❤️
                    <div class="header-subtitle">Gracias por unirte a nosotros</div>
                </div>
                <div class="content">
                    <p>Hola ${user.name}, ¡Gracias por registrarte en ${Constants.APP_NAME}! 🎉</p>
                    <p>Ahora podrás estar al tanto de los nuevos lanzamientos de tus artistas favoritos sin esforzarte.</p>
                    <p>¡No olvides seguir a tus artistas favoritos para día a día tener sus últimas canciones en tu playlist y recibir notificaciones!</p>
                    <p>¡Que disfrutes de la música! 🎧</p>
                </div>
                <div class="footer">
                    © $year - ${Constants.APP_NAME} - Desarrollado por <a href="${Constants.GITHUB_USER_PROFILE}" style="color: ${Constants.COLOR_GREEN}; text-decoration: none;">@${Constants.DEVELOPER}</a>
                </div>
            </div>
        </body>
        </html>
        """
    }

    fun generateAddedTracksEmailBody(userAddedTracks: List<Track>): String {
        val today = generateTodayDate()
        val year = generateCurrentYear()

        val tracksHtml = userAddedTracks.joinToString(separator = "") { track ->
            val image = track.albumImages.firstOrNull()?.url ?: Constants.DEFAULT_TRACK_IMAGE_URL

            """
            <tr>
                <td style="text-align: center;">
                    <img src="$image" alt="${track.name}" style="border-radius: 8px; width: 50px; height: 50px;">
                </td>
                <td>
                    <strong>${track.name}</strong><br>
                    <small>${track.artists.joinToString(", ") { it.name }}</small>
                </td>
            </tr>
            """
        }

        return """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background-color: ${Constants.COLOR_LIGHT_GRAY_1}; color: ${Constants.COLOR_DARK_GRAY}; }
                .email-container { max-width: 600px; margin: 20px auto; background-color: ${Constants.COLOR_WHITE}; border-radius: 8px; border: 1px solid ${Constants.COLOR_LIGHT_GRAY_3}; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
                .header { background-color: ${Constants.COLOR_GREEN}; color: ${Constants.COLOR_WHITE}; text-align: center; padding: 20px; font-size: 20px; font-weight: bold; }
                .header-subtitle { font-size: 12px; font-weight: normal; }
                .content { padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 10px; border: 1px solid ${Constants.COLOR_LIGHT_GRAY_3}; }
                th { background-color: ${Constants.COLOR_LIGHT_GRAY_2}; text-align: center; }
                .footer { background-color: ${Constants.COLOR_LIGHT_GRAY_2}; color: #666; text-align: center; padding: 10px; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    ${if (userAddedTracks.size == 1) "\uD83D\uDCE1 Nuevo lanzamiento! \uD83C\uDFB5" else "\uD83D\uDCE1 ${userAddedTracks.size} Nuevos lanzamientos! \uD83C\uDFB5"}
                    <div class="header-subtitle">$today</div>
                </div>
                <div class="content">
                    ${if (userAddedTracks.size == 1) "<p>Se ha añadido <strong>una nueva canción</strong> a tu playlist:</p>" else "<p>Se han añadido <strong>${userAddedTracks.size}</strong> nuevas canciones a tu playlist:</p>"}
                    <table>
                        <tbody>
                            $tracksHtml
                        </tbody>
                    </table>
                    <p style="margin-top: 20px;">Disfruta de los nuevos lanzamientos! 🎧</p>
                </div>
                <div class="footer">
                    © $year - ${Constants.APP_NAME} - Desarrollado por <a href="${Constants.GITHUB_USER_PROFILE}" style="color: ${Constants.COLOR_GREEN}; text-decoration: none;">@${Constants.DEVELOPER}</a>
                </div>
            </div>
        </body>
        </html>
        """
    }

    private fun generateTodayDate(): String {
        val calendar = Calendar.getInstance(TimeZone.getTimeZone(Constants.SERVER_TIMEZONE))
        val locale = Locale("es", "ES")

        val dayOfWeek = generateLocaleDayOfWeek(calendar, locale)
        val dayOfMonth = calendar.get(Calendar.DAY_OF_MONTH).toString()
        val month = calendar.getDisplayName(Calendar.MONTH, Calendar.LONG, locale)
        val year = calendar.get(Calendar.YEAR).toString()

        return "$dayOfWeek $dayOfMonth de $month de $year"
    }

    private fun generateLocaleDayOfWeek(calendar: Calendar, locale: Locale): String {
        return calendar.getDisplayName(
            Calendar.DAY_OF_WEEK,
            Calendar.LONG,
            locale
        )!!.replaceFirstChar { if (it.isLowerCase()) it.titlecase(locale) else it.toString() }
    }

    private fun generateCurrentYear(): String {
        val calendar = Calendar.getInstance(TimeZone.getTimeZone(Constants.SERVER_TIMEZONE))
        return calendar.get(Calendar.YEAR).toString()
    }
}