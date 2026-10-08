package com.apartment.apartmentsalessystembackend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.sql.Connection;

@SpringBootApplication
public class ApartmentSalesSystemBackendApplication implements CommandLineRunner {

    private final Environment environment;
    private final DataSource dataSource;

    public ApartmentSalesSystemBackendApplication(
            Environment environment,
            DataSource dataSource
    ) {
        this.environment = environment;
        this.dataSource = dataSource;
    }

    public static void main(String[] args) {
        SpringApplication.run(ApartmentSalesSystemBackendApplication.class, args);
    }

    @Override
    public void run(String... args) {

        String backendPort = environment.getProperty("local.server.port");

        // If local.server.port is not available, use configured port
        if (backendPort == null) {
            backendPort = environment.getProperty("server.port", "8080");
        }

        String frontendPort = "5173"; // Change if your frontend uses another port

        boolean databaseConnected = false;
        String databaseUrl = "Unknown";

        try (Connection connection = dataSource.getConnection()) {

            databaseConnected = connection.isValid(2);
            databaseUrl = connection.getMetaData().getURL();

        } catch (Exception e) {
            databaseConnected = false;
        }

        System.out.println();
        System.out.println("=================================================");
        System.out.println(" Backend Status  : RUNNING");
        System.out.println(" Backend Port    : " + backendPort);
        System.out.println(" Backend URL     : http://localhost:" + backendPort);
        System.out.println("-------------------------------------------------");
        System.out.println(" Frontend Port   : " + frontendPort);
        System.out.println(" Frontend URL    : http://localhost:" + frontendPort);
        System.out.println("-------------------------------------------------");
        System.out.println(" Database Status : "
                + (databaseConnected ? "CONNECTED" : "NOT CONNECTED"));
        System.out.println(" Database URL    : " + databaseUrl);
        System.out.println("=================================================");
        System.out.println();
    }
}
