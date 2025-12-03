package citedocs.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import citedocs.Entity.RequestStatusLogEntity;

@Repository
public interface RequestStatusLogRepository extends JpaRepository<RequestStatusLogEntity, Integer>{
    
    @Query("SELECT log FROM RequestStatusLogEntity log " +
           "JOIN RequestsEntity req ON log.requestId = req.requestId " +
           "WHERE req.userId = :userId " +
           "ORDER BY log.changedAt DESC")
    List<RequestStatusLogEntity> findByUserId(@Param("userId") Long userId);
}