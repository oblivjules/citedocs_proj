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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import citedocs.Entity.RequestsEntity;
import citedocs.Service.RequestsService;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:3000")
public class RequestsController {

    private final RequestsService requestsService;

    public RequestsController(RequestsService requestsService) {
        this.requestsService = requestsService;
    }

    @PostMapping
    public RequestsEntity create(@RequestBody RequestsEntity payload) {
        return requestsService.create(payload);
    }

    @GetMapping
    public List<RequestsEntity> findAll(@RequestParam(required = false) Long userId) {
        if (userId != null) {
            return requestsService.findByUserId(userId);
        }
        return requestsService.findAll();
    }

    @GetMapping("/{id}")
    public RequestsEntity findById(@PathVariable Long id) {
        return requestsService.findById(id);
    }

    @PutMapping("/{id}")
    public RequestsEntity update(@PathVariable Long id, @RequestBody RequestsEntity payload) {
        return requestsService.update(id, payload);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        requestsService.delete(id);
    }
}

