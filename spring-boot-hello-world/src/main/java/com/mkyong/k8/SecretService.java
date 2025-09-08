package com.mkyong.k8;

import io.fabric8.kubernetes.api.model.Secret;
import io.fabric8.kubernetes.client.KubernetesClient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class SecretService {
    private static final Logger log = LoggerFactory.getLogger(SecretService.class);

    private final KubernetesClient client;
    private final String namespace;
    private final String secretName = "db-secret";
    private final AtomicReference<Creds> cache = new AtomicReference<>(new Creds("", ""));

    public record Creds(String username, String password) {
    }

    public SecretService(KubernetesClient client) {
        this.client = client;
        this.namespace = detectNamespace();
        log.info("Detected namespace: {}", namespace);
        // initial load
        reload();
    }

    /** Read current creds (cached). Call reload() if you need to force-refresh. */
    public Creds current() {
        return cache.get();
    }

    /** Force-refresh now (blocking). */
    public synchronized void reload() {
        Secret sec = client.secrets()
                .inNamespace(namespace)
                .withName(secretName)
                .get();

        if (sec == null) {
            // keep old cache; you may want to throw instead
            return;
        }
        Map<String, String> data = sec.getData(); // base64-encoded values
        String user = decode(data.get("username"));
        String pass = decode(data.get("password"));
        cache.set(new Creds(user, pass));
    }

    private static String decode(String b64) {
        if (b64 == null)
            return "";
        return new String(Base64.getDecoder().decode(b64), StandardCharsets.UTF_8).trim();
    }

    /** Periodic refresh (e.g., every 30s). Tune as needed. */
    @Scheduled(fixedDelayString = "30000")
    public void scheduledRefresh() {
        log.info("scheduled refresh at {}", LocalDateTime.now());
        try {
            reload();
        } catch (Exception ignored) {
            // optional: log a warning
        }
    }

    /** Detect the running namespace (Downward API preferred; fallback to file). */
    private static String detectNamespace() {
        String ns = System.getenv("POD_NAMESPACE");
        if (ns != null && !ns.isBlank()) {
            log.info("detected namespace from env: {}", ns);
            return ns;
        }
        try {
            log.info("read namespace from file: {}", ns);
            return Files.readString(Path.of("/var/run/secrets/kubernetes.io/serviceaccount/namespace"))
                    .trim();
        } catch (Exception e) {
            log.info("default namespace from file: {}", ns);
            // local dev fallback; set your namespace here when running outside cluster
            return "jackie";
        }
    }
}