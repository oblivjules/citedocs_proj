package citedocs.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import citedocs.Entity.ClaimSlipEntity;

@Repository
public interface ClaimSlipRepository extends JpaRepository<ClaimSlipEntity, Integer>{
    Optional<ClaimSlipEntity> findByRequestId(Long requestId);
}
