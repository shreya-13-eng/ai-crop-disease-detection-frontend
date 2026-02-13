package com.metaminds.aicropdiseasedetection.genAi;

import com.google.genai.Client;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {
    @Bean
    public Client getGeminiClient(){
        return new Client();
    }
}
