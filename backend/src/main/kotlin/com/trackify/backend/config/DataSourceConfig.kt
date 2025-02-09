package com.trackify.backend.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.jdbc.DataSourceBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.net.URI
import javax.sql.DataSource

@Configuration
class DataSourceConfig {

    @Bean
    fun dataSource(@Value ("\${DATABASE_URL}") url: String): DataSource {
        val uri = URI(url)
        val (username, password) = uri.userInfo.split(":")
        val jdbcUrl = "jdbc:postgresql://${uri.host}:${uri.port}${uri.path}?sslmode=require"

        return DataSourceBuilder.create()
            .url(jdbcUrl)
            .username(username)
            .password(password)
            .build()

    }

}