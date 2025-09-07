package com.mkyong;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    private static final Logger log = LoggerFactory.getLogger(HelloController.class);

    @RequestMapping("/")
    String hello() {
        return "Hello World, Spring Boot!";
    }

    @RequestMapping("/abc")
    String hello_abc() {
        return "Hello World, Spring Boot abc!";
    }

    @RequestMapping("/file")
    String readFile() throws IOException {
        // PVC is mounted at /data
        try {
            String content = Files.readString(Paths.get("/data/file1.txt"));
            return "File content: " + content;
        } catch (IOException e) {
            log.error("Failed to read file1.txt from /data", e);
            return "Error reading file: " + e.getMessage();
        }
    }

}