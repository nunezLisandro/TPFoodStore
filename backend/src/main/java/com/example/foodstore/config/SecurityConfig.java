package com.example.foodstore.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // allow h2 console and auth endpoints
                .requestMatchers("/h2-console/**", "/api/auth/**").permitAll()
                // allow common static/frontend resources so visiting / doesn't trigger Spring Security login
                .requestMatchers(
                    "/", "/index.html", "/favicon.ico",
                    "/src/**", "/public/**", "/img/**",
                    "/*.html", "/*.js", "/*.css", "/**/*.html", "/**/*.js", "/**/*.css"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
