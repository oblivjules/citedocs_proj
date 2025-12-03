package citedocs.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import citedocs.Entity.DocumentsEntity;
import citedocs.Exception.ResourceNotFoundException;
import citedocs.Repository.DocumentsRepository;

@Service
@Transactional
public class DocumentsService {

    private final DocumentsRepository documentsRepository;

    public DocumentsService(DocumentsRepository documentsRepository) {
        this.documentsRepository = documentsRepository;
    }

    public DocumentsEntity create(DocumentsEntity doc) {
        return documentsRepository.save(doc);
    }

    @Transactional(readOnly = true)
    public List<DocumentsEntity> findAll() {
        return documentsRepository.findAll();
    }

    @Transactional(readOnly = true)
    public DocumentsEntity findById(Long id) {
        return documentsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));
    }

    public DocumentsEntity update(Long id, DocumentsEntity payload) {
        DocumentsEntity existing = findById(id);
        existing.setName(payload.getName());
        existing.setDescription(payload.getDescription());
        return documentsRepository.save(existing);
    }

    public void delete(Long id) {
        DocumentsEntity existing = findById(id);
        documentsRepository.delete(existing);
    }
}