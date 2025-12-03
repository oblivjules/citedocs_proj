package citedocs.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import citedocs.Entity.PaymentEntity;
import citedocs.Exception.ResourceNotFoundException;
import citedocs.Repository.PaymentRepository;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public PaymentEntity create(PaymentEntity payment) {
        return paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentEntity> findAll() {
        return paymentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public PaymentEntity findById(int id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
    }

    @Transactional(readOnly = true)
    public PaymentEntity findByRequestId(Long requestId) {
        return paymentRepository.findByRequestId(requestId)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<PaymentEntity> findAllByRequestId(Long requestId) {
        return paymentRepository.findAllByRequestId(requestId);
    }

    public PaymentEntity update(int id, PaymentEntity payload) {
        PaymentEntity existing = findById(id);
        existing.setRequestId(payload.getRequestId());
        existing.setProofOfPayment(payload.getProofOfPayment());
        existing.setRemarks(payload.getRemarks());
        return paymentRepository.save(existing);
    }

    public void delete(int id) {
        PaymentEntity existing = findById(id);
        paymentRepository.delete(existing);
    }
}

