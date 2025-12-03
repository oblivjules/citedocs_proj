package citedocs.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import citedocs.Entity.DocumentsEntity;
import citedocs.Service.DocumentsService;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:3000")
public class DocumentsController {

    private final DocumentsService documentsService;

    public DocumentsController(DocumentsService documentsService) {
        this.documentsService = documentsService;
    }

    @PostMapping
    public DocumentsEntity create(@RequestBody DocumentsEntity payload) {
        return documentsService.create(payload);
    }

    @GetMapping
    public List<DocumentsEntity> findAll() {
        return documentsService.findAll();
    }

    @GetMapping("/{id}")
    public DocumentsEntity findById(@PathVariable Long id) {
        return documentsService.findById(id);
    }

    @PutMapping("/{id}")
    public DocumentsEntity update(@PathVariable Long id, @RequestBody DocumentsEntity payload) {
        return documentsService.update(id, payload);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        documentsService.delete(id);
    }
}

