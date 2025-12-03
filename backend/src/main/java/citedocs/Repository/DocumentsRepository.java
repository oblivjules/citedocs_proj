package citedocs.Repository;


import citedocs.Entity.DocumentsEntity;
import org.springframework.data.jpa.repository.JpaRepository;


public interface DocumentsRepository extends JpaRepository<DocumentsEntity, Long> {}