package com.metaminds.aicropdiseasedetection.genAi;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {
    private final Client geminiClient;

    public GeminiService(Client geminiClient) {
        this.geminiClient = geminiClient;
    }

    public String predictDisease(
            byte[] imageByte
    ){
        Content content = Content.fromParts(
                Part.fromBytes(imageByte,"image/png"),
                Part.fromText("Can you describe the disease from which this plant is " +
                        "suffering from, and the detailed cure for that. Note if you can't predict just say no." +
                        "And write the response in pure html. " +
                        "You can use tables and other attributes as much as you can.")
        );
        try{
            GenerateContentResponse response  = geminiClient
                    .models.generateContent(
                            "gemini-3-flash-preview",
                            content,
                            null
                    );
            return response.text();
        }catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    public String generateResponse(
            String prompt
    ){
        Content content = Content.fromParts(
                Part.fromText(prompt)
        );
        try{
            GenerateContentResponse response  = geminiClient
                    .models.generateContent(
                            "gemini-3-flash-preview",
                            content,
                            null
                    );
            return response.text();
        }catch (Exception e){
            throw new RuntimeException(e);
        }
    }
}
