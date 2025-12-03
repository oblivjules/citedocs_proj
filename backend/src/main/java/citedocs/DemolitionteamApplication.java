package citedocs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"citedocs"})
public class DemolitionteamApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemolitionteamApplication.class, args);
	}

}
