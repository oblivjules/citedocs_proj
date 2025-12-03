package citedocs.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import citedocs.Entity.DocumentsEntity;
import citedocs.Entity.RequestsEntity;
import citedocs.Exception.ResourceNotFoundException;
import citedocs.Repository.DocumentsRepository;
import citedocs.Repository.RequestsRepository;

@Service
@Transactional
public class RequestsService {

    private final RequestsRepository requestsRepository;
    private final DocumentsRepository documentsRepository;

    public RequestsService(RequestsRepository requestsRepository, DocumentsRepository documentsRepository) {
        this.requestsRepository = requestsRepository;
        this.documentsRepository = documentsRepository;
}

    public RequestsEntity create(RequestsEntity request) {
        request.setDocument(resolveDocument(request.getDocument()));
        return requestsRepository.save(request);
}

    @Transactional(readOnly = true)
    public List<RequestsEntity> findAll() {
        return requestsRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<RequestsEntity> findByUserId(Long userId) {
        return requestsRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public RequestsEntity findById(Long id) {
        return requestsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "id", id));
    }

    public RequestsEntity update(Long id, RequestsEntity payload) {
        RequestsEntity existing = findById(id);
        existing.setUserId(payload.getUserId());
        existing.setStatus(payload.getStatus());
        existing.setCopies(payload.getCopies());
        existing.setDateNeeded(payload.getDateNeeded());
        if (payload.getDocument() != null) {
            existing.setDocument(resolveDocument(payload.getDocument()));
        }
        return requestsRepository.save(existing);
}

    public void delete(Long id) {
        RequestsEntity existing = findById(id);
        requestsRepository.delete(existing);
    }

    private DocumentsEntity resolveDocument(DocumentsEntity documentPayload) {
        if (documentPayload == null || documentPayload.getDocumentId() == null) {
            throw new ResourceNotFoundException("Document", "id", "missing");
        }
        Long documentId = documentPayload.getDocumentId();
        return documentsRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id",
                        documentId));
}
}

