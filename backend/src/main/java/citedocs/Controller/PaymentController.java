package citedocs.Controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import org.springframework.web.multipart.MultipartFile;

import citedocs.Entity.PaymentEntity;
import citedocs.Service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public PaymentEntity create(@RequestBody PaymentEntity payload) {
        return paymentService.create(payload);
    }

    @PostMapping("/upload")
    public PaymentEntity uploadPayment(
        @RequestParam("requestId") Long requestId,
        @RequestParam("proofFile") MultipartFile proofFile,
        @RequestParam(value = "remarks", required = false) String remarks) {
    try {
        // Create uploads directory if not exists
        String uploadDir = "uploads/payments/";
        java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
        if (!java.nio.file.Files.exists(uploadPath)) {
            java.nio.file.Files.createDirectories(uploadPath);
        }

        // Generate stored filename
        String originalName = proofFile.getOriginalFilename();
        String storedName = System.currentTimeMillis() + "_" + originalName;
        java.nio.file.Path filePath = uploadPath.resolve(storedName);

        // Save file to disk
        java.nio.file.Files.copy(proofFile.getInputStream(), filePath);

        // Save ONLY filename to DB
        PaymentEntity payment = new PaymentEntity();
        payment.setRequestId(requestId);
        payment.setProofOfPayment(storedName);
        payment.setRemarks(remarks);

        return paymentService.create(payment);

    } catch (IOException e) {
        throw new RuntimeException("File upload failed", e);
    }
}

    @GetMapping("/file/{filename}")
    public ResponseEntity<?> getFile(@PathVariable String filename) {
    try {
        Path filePath = Paths.get("uploads/payments/").resolve(filename);
        byte[] fileBytes = Files.readAllBytes(filePath);

        return ResponseEntity.ok()
                .header("Content-Type", "image/jpeg")
                .body(fileBytes);

    } catch (IOException e) {
        return ResponseEntity.notFound().build();
    }
}


    @GetMapping
    public List<PaymentEntity> findAll() {
        return paymentService.findAll();
    }

    @GetMapping("/{id}")
    public PaymentEntity findById(@PathVariable int id) {
        return paymentService.findById(id);
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<?> findByRequestId(@PathVariable Long requestId) {
        PaymentEntity payment = paymentService.findByRequestId(requestId);
        if (payment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(payment);
    }

    @PutMapping("/{id}")
    public PaymentEntity update(@PathVariable int id, @RequestBody PaymentEntity payload) {
        return paymentService.update(id, payload);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable int id) {
        paymentService.delete(id);
    }
}

