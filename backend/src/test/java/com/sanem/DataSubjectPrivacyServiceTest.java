package com.sanem;

import com.sanem.model.entity.Donor;
import com.sanem.model.enums.LegalBasis;
import com.sanem.service.DataSubjectPrivacyService;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class DataSubjectPrivacyServiceTest {

    // apply() e markAnonymized() não usam repositório nem usuário autenticado.
    private final DataSubjectPrivacyService service = new DataSubjectPrivacyService(null, null);

    @Test
    void rejectsMissingLegalBasis() {
        assertThrows(IllegalArgumentException.class,
                () -> service.apply(new Donor(), null, "doações", true));
    }

    @Test
    void consentBasisRequiresConsent() {
        assertThrows(IllegalArgumentException.class,
                () -> service.apply(new Donor(), LegalBasis.CONSENT, null, false));
        assertThrows(IllegalArgumentException.class,
                () -> service.apply(new Donor(), LegalBasis.CONSENT, null, null));
    }

    @Test
    void consentIsRecordedWithTimestampAndVersion() {
        Donor donor = new Donor();
        service.apply(donor, LegalBasis.CONSENT, "  registrar doações  ", true);

        assertEquals(LegalBasis.CONSENT, donor.getLegalBasis());
        assertEquals("registrar doações", donor.getPrivacyPurpose());
        assertTrue(donor.isPrivacyConsent());
        assertNotNull(donor.getPrivacyConsentAt());
        assertNotNull(donor.getPrivacyConsentVersion());
    }

    @Test
    void consentTimestampIsKeptWhenAlreadyConsenting() {
        Donor donor = new Donor();
        service.apply(donor, LegalBasis.CONSENT, null, true);
        LocalDateTime first = donor.getPrivacyConsentAt();

        service.apply(donor, LegalBasis.CONSENT, "nova finalidade", true);

        assertEquals(first, donor.getPrivacyConsentAt());
    }

    @Test
    void nonConsentBasisClearsConsentData() {
        Donor donor = new Donor();
        service.apply(donor, LegalBasis.CONSENT, null, true);

        service.apply(donor, LegalBasis.PUBLIC_POLICY, null, false);

        assertFalse(donor.isPrivacyConsent());
        assertNull(donor.getPrivacyConsentAt());
        assertNull(donor.getPrivacyConsentVersion());
        assertEquals(LegalBasis.PUBLIC_POLICY, donor.getLegalBasis());
    }

    @Test
    void anonymizedRecordCannotBeChanged() {
        Donor donor = new Donor();
        service.markAnonymized(donor);

        assertNotNull(donor.getAnonymizedAt());
        assertThrows(IllegalArgumentException.class,
                () -> service.apply(donor, LegalBasis.LEGAL_OBLIGATION, null, false));
    }
}
