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

import citedocs.Entity.RequestStatusLogEntity;
import citedocs.Service.RequestStatusLogService;

@RestController
@RequestMapping("/api/request-status-logs")
@CrossOrigin(origins = "http://localhost:3000")
public class RequestStatusLogController {

    private final RequestStatusLogService requestStatusLogService;

    public RequestStatusLogController(RequestStatusLogService requestStatusLogService) {
        this.requestStatusLogService = requestStatusLogService;
    }

    @PostMapping
    public RequestStatusLogEntity create(@RequestBody RequestStatusLogEntity payload) {
        return requestStatusLogService.create(payload);
    }

    @GetMapping
    public List<RequestStatusLogEntity> findAll(@RequestParam(required = false) Long userId) {
        if (userId != null) {
            return requestStatusLogService.findByUserId(userId);
        }
        return requestStatusLogService.findAll();
    }

    @GetMapping("/{id}")
    public RequestStatusLogEntity findById(@PathVariable int id) {
        return requestStatusLogService.findById(id);
    }

    @PutMapping("/{id}")
    public RequestStatusLogEntity update(@PathVariable int id, @RequestBody RequestStatusLogEntity payload) {
        return requestStatusLogService.update(id, payload);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int id) {
        requestStatusLogService.delete(id);
    }
}

