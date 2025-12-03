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

import citedocs.Entity.ClaimSlipEntity;
import citedocs.Service.ClaimSlipService;

@RestController
@RequestMapping("/api/claim-slips")
@CrossOrigin(origins = "http://localhost:3000")
public class ClaimSlipController {

    private final ClaimSlipService claimSlipService;

    public ClaimSlipController(ClaimSlipService claimSlipService) {
        this.claimSlipService = claimSlipService;
    }

    @PostMapping
    public ClaimSlipEntity create(@RequestBody ClaimSlipEntity payload) {
        return claimSlipService.create(payload);
    }

    @GetMapping
    public List<ClaimSlipEntity> findAll() {
        return claimSlipService.findAll();
    }

    @GetMapping("/{id}")
    public ClaimSlipEntity findById(@PathVariable int id) {
        return claimSlipService.findById(id);
    }

    @PutMapping("/{id}")
    public ClaimSlipEntity update(@PathVariable int id, @RequestBody ClaimSlipEntity payload) {
        return claimSlipService.update(id, payload);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int id) {
        claimSlipService.delete(id);
    }
}

