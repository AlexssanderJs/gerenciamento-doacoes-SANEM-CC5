package com.sanem;

import com.sanem.model.dto.DonationFormDTO;
import com.sanem.model.dto.DonationFormDTO.DonationItemRequestDTO;
import com.sanem.model.enums.ConservationState;
import com.sanem.service.DonationService;
import org.junit.jupiter.api.Test;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;

class DonationServiceLinesTest {

    // A validação de linhas repetidas ocorre antes de qualquer acesso a dependências.
    private final DonationService service = new DonationService(null, null, null, null, null, null, null);

    @Test
    void rejectsSameItemWithSameConservationStateTwice() {
        DonationFormDTO form = new DonationFormDTO(new Date(), null, 1L, List.of(
                new DonationItemRequestDTO(10L, 3, null, 1L, ConservationState.NEW),
                new DonationItemRequestDTO(10L, 2, null, 1L, ConservationState.NEW)));

        assertThrows(IllegalArgumentException.class, () -> service.create(form, null, null));
    }
}
