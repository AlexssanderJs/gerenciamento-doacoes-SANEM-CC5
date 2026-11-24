package com.sanem.config;

import com.sanem.security.JwtFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CharacterEncodingFilter;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {
    private final CharacterEncodingFilter characterEncodingFilter;
    private final JwtFilter jwtFilter;

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000}")
    private String allowedOrigins;

    public SecurityConfig(CharacterEncodingFilter characterEncodingFilter, JwtFilter jwtFilter) {
        this.characterEncodingFilter = characterEncodingFilter;
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .addFilterBefore(characterEncodingFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/user/me", "/user/me/**").authenticated()
                .requestMatchers("/user/**", "/profile/**").hasRole("ADMINISTRATOR")

                .requestMatchers(HttpMethod.PATCH, "/beneficiary/*/approve", "/beneficiary/*/reject",
                    "/beneficiary/*/inactivate", "/beneficiary/*/reactivate")
                    .hasAnyRole("ADMINISTRATOR", "EVALUATOR")
                .requestMatchers(HttpMethod.GET, "/beneficiary/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT", "EVALUATOR")
                .requestMatchers(HttpMethod.POST, "/beneficiary/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT")
                .requestMatchers(HttpMethod.PUT, "/beneficiary/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT")
                .requestMatchers(HttpMethod.DELETE, "/beneficiary/**").hasRole("ADMINISTRATOR")

                .requestMatchers(HttpMethod.GET, "/collection-point/**", "/category/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT", "EVALUATOR")
                .requestMatchers(HttpMethod.POST, "/collection-point/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT")
                .requestMatchers(HttpMethod.PUT, "/collection-point/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT")
                .requestMatchers(HttpMethod.DELETE, "/collection-point/**").hasRole("ADMINISTRATOR")
                .requestMatchers(HttpMethod.POST, "/category/**").hasRole("ADMINISTRATOR")
                .requestMatchers(HttpMethod.PUT, "/category/**").hasRole("ADMINISTRATOR")
                .requestMatchers(HttpMethod.DELETE, "/category/**").hasRole("ADMINISTRATOR")

                .requestMatchers(HttpMethod.GET, "/donor/**", "/item/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT", "EVALUATOR")
                .requestMatchers(HttpMethod.POST, "/donor/**", "/item/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT")
                .requestMatchers(HttpMethod.PUT, "/donor/**", "/item/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT")
                .requestMatchers(HttpMethod.DELETE, "/donor/**", "/item/**").hasRole("ADMINISTRATOR")

                .requestMatchers(HttpMethod.GET, "/donation/**", "/withdrawal/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT", "EVALUATOR")
                .requestMatchers(HttpMethod.POST, "/donation/**", "/withdrawal/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT")
                .requestMatchers(HttpMethod.PUT, "/withdrawal/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT")
                .requestMatchers(HttpMethod.DELETE, "/donation/**", "/withdrawal/**").hasRole("ADMINISTRATOR")
                .requestMatchers(HttpMethod.PATCH, "/withdrawal/beneficiary/*/reset-limit").hasRole("ADMINISTRATOR")

                .requestMatchers(HttpMethod.GET, "/card/**", "/report/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT", "EVALUATOR")
                .requestMatchers(HttpMethod.POST, "/card/generate/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT", "EVALUATOR")
                .requestMatchers(HttpMethod.POST, "/card/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT")
                .requestMatchers(HttpMethod.PUT, "/card/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT")
                .requestMatchers(HttpMethod.DELETE, "/card/**").hasRole("ADMINISTRATOR")

                .requestMatchers("/notification/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT", "EVALUATOR")
                .requestMatchers(HttpMethod.GET, "/priority-demand/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT", "EVALUATOR")
                .requestMatchers("/priority-demand/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT")
                .requestMatchers(HttpMethod.GET, "/withdrawal-limit-config/**")
                    .hasAnyRole("ADMINISTRATOR", "ATTENDANT", "EVALUATOR")
                .requestMatchers(HttpMethod.PUT, "/withdrawal-limit-config/**").hasRole("ADMINISTRATOR")
                .anyRequest().denyAll()
            );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
            .map(String::trim).filter(value -> !value.isEmpty()).toList();
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type", "Content-Disposition", "X-Total-Count"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
