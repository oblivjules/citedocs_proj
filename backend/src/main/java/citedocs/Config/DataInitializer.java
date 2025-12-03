package citedocs.Config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import citedocs.Entity.DocumentsEntity;
import citedocs.Repository.DocumentsRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DocumentsRepository documentsRepository;

    public DataInitializer(DocumentsRepository documentsRepository) {
        this.documentsRepository = documentsRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if documents already exist
        if (documentsRepository.count() > 0) {
            System.out.println("Documents already exist. Skipping initialization.");
            return;
        }

        // Initialize documents
        String[] documentNames = {
            "Transcript of Records",
            "Certificate of Enrollment",
            "Good Moral Certificate",
            "Diploma Copy",
            "True Copy of Grades (TCG)",
            "Transfer Credential",
            "Student Clearance",
            "Study Load",
            "Authentication/CAV/Apostille"
        };

        String[] descriptions = {
            "Official transcript containing all academic records and grades",
            "Certificate confirming current enrollment status",
            "Certificate attesting to good moral character",
            "Copy of the official diploma",
            "True copy of academic grades",
            "Credential for transferring to another institution",
            "Clearance document for students",
            "Document showing current study load",
            "Authentication, CAV, or Apostille services"
        };

        for (int i = 0; i < documentNames.length; i++) {
            DocumentsEntity document = new DocumentsEntity();
            document.setName(documentNames[i]);
            document.setDescription(descriptions[i]);
            documentsRepository.save(document);
            System.out.println("Initialized document: " + documentNames[i]);
        }

        System.out.println("Document initialization completed. Total documents: " + documentsRepository.count());
    }
}

