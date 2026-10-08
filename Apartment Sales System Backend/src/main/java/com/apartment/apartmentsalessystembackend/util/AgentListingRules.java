package com.apartment.apartmentsalessystembackend.util;

import com.apartment.apartmentsalessystembackend.exception.AgentListingForbiddenException;
import java.util.regex.Pattern;

public final class AgentListingRules {
    private static final Pattern TOKEN_PATTERN = Pattern.compile(
            "^JWT-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}-(.+)$");

    private AgentListingRules() {}

    public static String extractEmail(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new AgentListingForbiddenException("A valid Sales Agent login is required");
        }

        var matcher = TOKEN_PATTERN.matcher(authorization.substring("Bearer ".length()));
        if (!matcher.matches() || matcher.group(1).isBlank()) {
            throw new AgentListingForbiddenException("A valid Sales Agent login is required");
        }
        return matcher.group(1);
    }

    public static void assertAgentUid(String authenticatedUid, String claimedUid) {
        if (authenticatedUid == null || authenticatedUid.isBlank()
                || (claimedUid != null && !claimedUid.isBlank() && !authenticatedUid.equals(claimedUid))) {
            throw new AgentListingForbiddenException("You can only manage your own resale listings");
        }
    }

    public static void assertListingOwner(String authenticatedUid, String listingOwnerUid) {
        if (authenticatedUid == null || !authenticatedUid.equals(listingOwnerUid)) {
            throw new AgentListingForbiddenException("You can only manage your own resale listings");
        }
    }
}