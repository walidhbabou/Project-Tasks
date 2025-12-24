package com.JwtSetup.JwtSetup;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class JwtSetupApplication {
    private static final Logger log = LoggerFactory.getLogger(JwtSetupApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(JwtSetupApplication.class, args);
		log.info("Application JwtSetup démarrée.");
	}

}
