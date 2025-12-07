package citedocs.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import citedocs.Entity.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Integer> {
    UserEntity findByEmail(String email);
    UserEntity findBySid(String sid);
    UserEntity findByAid(String aid);

    // ⭐ Added for registrar lookup
    List<UserEntity> findByRole(UserEntity.Role role);
}
