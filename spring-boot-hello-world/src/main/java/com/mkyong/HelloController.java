package com.mkyong;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mkyong.k8.SecretService;
import java.util.Map;

@RestController
public class HelloController {
    private static final Logger log = LoggerFactory.getLogger(HelloController.class);

    private static final Path FILE_PATH = Paths.get("/data/file1.txt");

    // read from application.properties
    @Value("${app.message}")
    private String message;

    // read from environment variables from secret
    @Value("${DB_USERNAME}")
    private String username;
    @Value("${DB_PASSWORD}")
    private String password;
    @Value("${GREETING}")
    private String greeting;

    // read from application.properties - configmap mounted as file
    @Value("${app.name}")
    private String appName;
    @Value("${app.version}")
    private String appVersion;

    private static final Path USER_PATH = Path.of("/etc/creds/username");
    private static final Path PASS_PATH = Path.of("/etc/creds/password");

    private static final Path GREETING_PATH = Path.of("/etc/config/greeting");

    private final SecretService secretService;

    public HelloController(SecretService secretService) {
        this.secretService = secretService;
    }

    @RequestMapping("/")
    String hello() {
        log.info("Accessed root endpoint");
        return "Hello World, Spring Boot--username: " + username + ", password: " + password + ", greeting: "
                + greeting + ", appName: " + appName + ", appVersion: " + appVersion;
    }

    @GetMapping("/kubesecret")
    public Map<String, String> kubesecret() {
        log.info("Accessed kubesecret endpoint");
        Map<String, String> c = secretService.current();
        // mask values; never log real secrets
        return c;
    }

    @GetMapping("/kubesecret/new")
    public Map<String, String> addNewSecret() {
        log.info("Accessed addNewSecret endpoint");
        String newKey = "url";
        String newValue = "https://example.com/";
        secretService.addKeyValueToSecret(newKey, newValue);
        Map<String, String> c = secretService.current();
        return c;
    }

    private static String mask(String s) {
        if (s == null || s.isEmpty())
            return "";
        int keep = Math.min(2, s.length());
        return s.substring(0, keep) + "******";
    }

    @RequestMapping("/filesecret")
    String filesecret() {
        log.info("Accessed filesecret endpoint");
        try {
            String fileUsername = Files.readString(USER_PATH).trim();
            String filePassword = Files.readString(PASS_PATH).trim();
            return "Hello World, Spring Boot--username: " + fileUsername + ", password: " + filePassword;
        } catch (IOException e) {
            log.error("Failed to read secrets from files", e);
            return "Error reading secrets: " + e.getMessage();
        }
    }

    @RequestMapping("/fileconfigmap")
    String fileconfigmap() {
        log.info("Accessed fileconfigmap endpoint");
        try {
            String fileGreeting = Files.readString(GREETING_PATH).trim();
            return "Read configmap from file: " + fileGreeting;
        } catch (IOException e) {
            log.error("Failed to read configmap from files", e);
            return "Error reading configmaps: " + e.getMessage();
        }
    }

    @GetMapping("/application.properties")
    public String getMessage() {
        log.info("Accessed application.properties endpoint");
        return "Message: " + message;
    }

    @RequestMapping("/persistent")
    String readFile() throws IOException {
        log.info("Accessed persistent endpoint");
        // PVC is mounted at /data
        try {
            String content = "Hello, this is some text written at " + java.time.LocalDateTime.now();
            Files.writeString(FILE_PATH, content);

            content = Files.readString(FILE_PATH);
            return "File content--: " + content;
        } catch (IOException e) {
            log.error("Failed to read file1.txt from /data", e);
            return "Error reading file: " + e.getMessage();
        }
    }

}