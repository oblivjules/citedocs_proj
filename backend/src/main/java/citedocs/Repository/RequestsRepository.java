package citedocs.Repository;


import citedocs.Entity.RequestsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface RequestsRepository extends JpaRepository<RequestsEntity, Long> {
    List<RequestsEntity> findByUserId(Long userId);
}