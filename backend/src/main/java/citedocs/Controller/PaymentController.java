package citedocs.Controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import citedocs.Entity.PaymentEntity;
import citedocs.Entity.RequestsEntity;
import citedocs.Entity.UserEntity;
import citedocs.Service.PaymentService;
import citedocs.Service.RequestsService;
import citedocs.Service.UserService;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private final PaymentService paymentService;
    private final RequestsService requestsService;
    private final UserService userService;

    public PaymentController(PaymentService paymentService, RequestsService requestsService, UserService userService) {
        this.paymentService = paymentService;
        this.requestsService = requestsService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody PaymentEntity payload, HttpServletRequest request) {
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        int authenticatedUserId = Integer.parseInt(userIdAttr.toString());
        
        // Verify the user owns the request associated with this payment
        if (payload.getRequestId() != null) {
            RequestsEntity requestEntity = requestsService.findById(payload.getRequestId());
            if (requestEntity.getUserId().intValue() != authenticatedUserId) {
                return ResponseEntity.status(403).body(Map.of("message", "Forbidden: You can only create payments for your own requests"));
            }
        }

        PaymentEntity created = paymentService.create(payload);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPayment(
        @RequestParam("requestId") Long requestId,
        @RequestParam("proofFile") MultipartFile proofFile,
        @RequestParam(value = "remarks", required = false) String remarks,
        HttpServletRequest request) {
        
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        int authenticatedUserId = Integer.parseInt(userIdAttr.toString());
        
        // Verify the user owns the request
        RequestsEntity requestEntity = requestsService.findById(requestId);
        if (requestEntity.getUserId().intValue() != authenticatedUserId) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: You can only upload payments for your own requests"));
        }
    try {
        // Create uploads directory if not exists
        String uploadDir = "uploads/payments/";
        Path uploadPath = Paths.get(uploadDir);

        try {
            Files.createDirectories(uploadPath);  // safe even if folder already exists
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize payment upload directory", e);
        }


        // Generate stored filename
        String originalName = proofFile.getOriginalFilename();
        String storedName = System.currentTimeMillis() + "_" + originalName;

        // Save file to disk
        Files.copy(
                proofFile.getInputStream(),
                uploadPath.resolve(storedName),
                StandardCopyOption.REPLACE_EXISTING
            );
        // Save ONLY filename to DB
        PaymentEntity payment = new PaymentEntity();
        payment.setRequestId(requestId);
        payment.setProofOfPayment(storedName);
        payment.setRemarks(remarks);

        PaymentEntity created = paymentService.create(payment);
        return ResponseEntity.ok(created);

    } catch (IOException e) {
        return ResponseEntity.status(500).body(Map.of("error", "File upload failed: " + e.getMessage()));
    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", "An error occurred: " + e.getMessage()));
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
    public ResponseEntity<?> findAll(HttpServletRequest request) {
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        int authenticatedUserId = Integer.parseInt(userIdAttr.toString());
        UserEntity authenticatedUser = userService.findById(authenticatedUserId);
        
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        // Only registrars can see all payments
        if (authenticatedUser.getRole() != UserEntity.Role.REGISTRAR) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: Only registrars can view all payments"));
        }

        return ResponseEntity.ok(paymentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable int id, HttpServletRequest request) {
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        int authenticatedUserId = Integer.parseInt(userIdAttr.toString());
        UserEntity authenticatedUser = userService.findById(authenticatedUserId);
        
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        PaymentEntity payment = paymentService.findById(id);
        if (payment == null) {
            return ResponseEntity.notFound().build();
        }

        // Check if user owns the request associated with this payment
        RequestsEntity requestEntity = requestsService.findById(payment.getRequestId());
        if (requestEntity.getUserId().intValue() != authenticatedUserId && 
            authenticatedUser.getRole() != UserEntity.Role.REGISTRAR) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: You can only view payments for your own requests"));
        }

        return ResponseEntity.ok(payment);
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<?> findByRequestId(@PathVariable Long requestId, HttpServletRequest request) {
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        int authenticatedUserId = Integer.parseInt(userIdAttr.toString());
        UserEntity authenticatedUser = userService.findById(authenticatedUserId);
        
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        // Verify the user owns the request
        RequestsEntity requestEntity = requestsService.findById(requestId);
        if (requestEntity.getUserId().intValue() != authenticatedUserId && 
            authenticatedUser.getRole() != UserEntity.Role.REGISTRAR) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: You can only view payments for your own requests"));
        }

        PaymentEntity payment = paymentService.findByRequestId(requestId);
        if (payment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(payment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody PaymentEntity payload, HttpServletRequest request) {
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        int authenticatedUserId = Integer.parseInt(userIdAttr.toString());
        
        PaymentEntity existingPayment = paymentService.findById(id);
        if (existingPayment == null) {
            return ResponseEntity.notFound().build();
        }

        // Verify the user owns the request associated with this payment
        RequestsEntity requestEntity = requestsService.findById(existingPayment.getRequestId());
        if (requestEntity.getUserId().intValue() != authenticatedUserId) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: You can only update payments for your own requests"));
        }

        // Don't allow changing requestId
        payload.setRequestId(existingPayment.getRequestId());

        PaymentEntity updated = paymentService.update(id, payload);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id, HttpServletRequest request) {
        // Verify user is authenticated
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        int authenticatedUserId = Integer.parseInt(userIdAttr.toString());
        
        PaymentEntity existingPayment = paymentService.findById(id);
        if (existingPayment == null) {
            return ResponseEntity.notFound().build();
        }

        // Verify the user owns the request associated with this payment
        RequestsEntity requestEntity = requestsService.findById(existingPayment.getRequestId());
        if (requestEntity.getUserId().intValue() != authenticatedUserId) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden: You can only delete payments for your own requests"));
        }

        paymentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

