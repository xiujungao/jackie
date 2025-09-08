package com.mkyong.k8;

import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientBuilder;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KubernetesClientConfig {

    @Bean(destroyMethod = "close")
    public KubernetesClient kubernetesClient() {
        // DefaultKubernetesClient auto-detects in-cluster config (service account token
        // + CA cert)
        // or falls back to ~/.kube/config if running locally
        return new KubernetesClientBuilder().build();
    }
}