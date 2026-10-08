package com.apartment.apartmentsalessystembackend.util;

import com.apartment.apartmentsalessystembackend.exception.AgentListingForbiddenException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AgentListingRulesTest {
    @Test
    void extractsEmailFromLoginToken() {
        assertEquals("agent@example.com", AgentListingRules.extractEmail(
                "Bearer JWT-123e4567-e89b-12d3-a456-426614174000-agent@example.com"));
    }

    @Test
    void rejectsMissingOrMalformedLoginToken() {
        assertThrows(AgentListingForbiddenException.class, () -> AgentListingRules.extractEmail(null));
        assertThrows(AgentListingForbiddenException.class,
                () -> AgentListingRules.extractEmail("Bearer JWT-not-a-valid-token"));
    }

    @Test
    void rejectsUidAndListingOwnerMismatches() {
        assertThrows(AgentListingForbiddenException.class,
                () -> AgentListingRules.assertAgentUid("AGENT-1", "AGENT-2"));
        assertThrows(AgentListingForbiddenException.class,
                () -> AgentListingRules.assertListingOwner("AGENT-1", "AGENT-2"));
    }
}