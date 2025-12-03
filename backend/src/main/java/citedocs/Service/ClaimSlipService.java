package citedocs.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import citedocs.Entity.ClaimSlipEntity;
import citedocs.Exception.ResourceNotFoundException;
import citedocs.Repository.ClaimSlipRepository;

@Service
@Transactional
public class ClaimSlipService {

    private final ClaimSlipRepository claimSlipRepository;

    public ClaimSlipService(ClaimSlipRepository claimSlipRepository) {
        this.claimSlipRepository = claimSlipRepository;
    }

    public ClaimSlipEntity create(ClaimSlipEntity entity) {
        return claimSlipRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<ClaimSlipEntity> findAll() {
        return claimSlipRepository.findAll();
    }

    @Transactional(readOnly = true)
    public ClaimSlipEntity findById(int id) {
        return claimSlipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClaimSlip", "id", id));
    }

    public ClaimSlipEntity update(int id, ClaimSlipEntity payload) {
        ClaimSlipEntity existing = findById(id);
        existing.setClaimNumber(payload.getClaimNumber());
        existing.setDateReady(payload.getDateReady());
        existing.setIssuedBy(payload.getIssuedBy());
        existing.setIssuedAt(payload.getIssuedAt());
        return claimSlipRepository.save(existing);
    }

    public void delete(int id) {
        ClaimSlipEntity existing = findById(id);
        claimSlipRepository.delete(existing);
    }
}
