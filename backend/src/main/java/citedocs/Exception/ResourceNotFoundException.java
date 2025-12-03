package citedocs.Exception;

/**
 * Simple runtime exception that we can reuse across services whenever an entity
 * cannot be located. Centralizing the message format keeps controller logic
 * lean and produces consistent API responses.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, String field, Object value) {
        super(String.format("%s with %s '%s' was not found.", resource, field, value));
    }
}


