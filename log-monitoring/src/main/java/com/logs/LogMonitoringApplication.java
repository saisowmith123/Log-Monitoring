package com.logs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.logs")
public class LogMonitoringApplication {

	public static void main(String[] args) {
		SpringApplication.run(LogMonitoringApplication.class, args);
	}

}
