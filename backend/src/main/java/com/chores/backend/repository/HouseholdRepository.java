package com.chores.backend.repository;

import com.chores.backend.model.Household;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface HouseholdRepository extends MongoRepository<Household, String> {
    Optional<Household> findByInviteCode(String inviteCode);
}
