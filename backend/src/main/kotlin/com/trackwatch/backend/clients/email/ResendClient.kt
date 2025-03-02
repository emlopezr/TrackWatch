package com.trackwatch.backend.clients.email

import com.resend.Resend
import com.resend.services.emails.model.CreateEmailOptions
import com.trackwatch.backend.model.Track
import com.trackwatch.backend.model.User
import com.trackwatch.backend.utils.service.MetricService
import com.trackwatch.backend.utils.values.Constants
import com.trackwatch.backend.utils.values.Metrics
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Component
class ResendClient(private val metricService: MetricService) {

    private val log = LoggerFactory.getLogger(ResendClient::class.java)
    private val resend = Resend(System.getenv("RESEND_API_KEY"))

    fun sendEmail(user: User, addedTracks: List<Track>) {
        val emailSubject = generateEmailSubject(addedTracks)
        val emailBody = generateEmailBody(addedTracks)

        val recipientEmail = user.email

        val params = CreateEmailOptions.builder()
            .from("TrackWatch <trackwatch@emlopezr.com>")
            .to(recipientEmail)
            .subject(emailSubject)
            .html(emailBody)
            .build()

        try {
            sendMetricEmail()
            resend.emails().send(params)
        } catch (e: Exception) {
            log.error("Failed to send email: ${e.message}")
            throw RuntimeException("Failed to send email: ${e.message}")
        }
    }

    private fun generateEmailSubject(userAddedTracks: List<Track>): String {
        return if (userAddedTracks.size == 1) {
            "\uD83C\uDFB6 Nueva canción añadida a tu playlist"
        } else {
            "\uD83C\uDFB6 ${userAddedTracks.size} nuevas canciones añadidas a tu playlist"
        }
    }

    fun generateEmailBody(userAddedTracks: List<Track>): String {
        val today = LocalDate.now().format(DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", Locale("es", "ES")))

        val tracksHtml = userAddedTracks.joinToString(separator = "") { track ->
            val image = track.albumImages.firstOrNull()?.url ?: Constants.DEFAULT_IMAGE_URL

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
                body { font-family: Arial, sans-serif; background-color: #f7f7f7; color: #333; }
                .email-container { max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
                .header { background-color: #1db954; color: #fff; text-align: center; padding: 20px; font-size: 20px; font-weight: bold; }
                .header-subtitle { font-size: 12px; font-weight: normal; }
                .content { padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 10px; border: 1px solid #ddd; }
                th { background-color: #f4f4f4; text-align: center; }
                .footer { background-color: #f4f4f4; color: #666; text-align: center; padding: 10px; font-size: 12px; }
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
                    © ${LocalDate.now().year} - TrackWatch - Desarrollado por <a href="https://github.com/emlopezr" style="color: #1db954; text-decoration: none;">@emlopezr</a>
                </div>
            </div>
        </body>
        </html>
        """
    }

    private fun sendMetricEmail() {
        metricService.incrementCounter(
            Metrics.EMAIL_SENT,
            "provider", "resend"
        )
    }
}
