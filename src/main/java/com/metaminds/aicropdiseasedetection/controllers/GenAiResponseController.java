package com.metaminds.aicropdiseasedetection.controllers;

import com.metaminds.aicropdiseasedetection.services.GenAiResponseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
public class GenAiResponseController {

    final GenAiResponseService genAiResponseService;

    public GenAiResponseController(GenAiResponseService genAiResponseService) {
        this.genAiResponseService = genAiResponseService;
    }

    @GetMapping("/hello/{prompt}")
    public ResponseEntity<?> hello(
            @PathVariable String prompt
    ) {
        return new ResponseEntity<>(genAiResponseService.getGeminiResponse(prompt), HttpStatus.OK);
    }

    @PostMapping(value = "/predict", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> predictDisease(
            @RequestPart("image") MultipartFile image
    ) {
        try {
            return new ResponseEntity<>(genAiResponseService.predictDisease(image), HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> map = new HashMap<>();
            map.put("message", e.getMessage());
            return new ResponseEntity<>(map, HttpStatus.BAD_REQUEST);
        }
    }
}
