/**
 * Cypress test for the LeadImage block shadow customizations.
 *
 * EEA shadows three files in the LeadImage family:
 *  - Edit.jsx   — adds copyright display, `image-block-container` wrapper, objectPosition class
 *  - View.jsx   — same EEA additions for the public view
 *  - LeadImageSidebar.jsx — uses BlockDataForm + LeadImageSchema (copyright fieldset)
 *
 * All shadows are compatible with both Volto 17 and Volto 18 — the barrel
 * imports for LeadImageSidebar, SidebarPortal, BlockDataForm, Icon are
 * present in both versions.
 *
 * When no image is set on the content object the block shows a placeholder
 * message in edit mode and renders nothing in view mode (no errors).
 */
import { slateBeforeEach, slateAfterEach } from '../support/e2e';

describe('LeadImage block shadow', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('adds a LeadImage block and renders the no-image placeholder in edit mode', () => {
    // Add a Lead Image Field block
    cy.getSlate().click();
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get('.blocks-chooser input').type('Lead Image');
    cy.get('.blocks-chooser .leadimage').first().click();

    // EEA Edit.jsx: outer wrapper div should exist
    cy.get('.block-editor-leadimage').should('exist');

    // EEA Edit.jsx: when no image is set, shows the placeholder message
    cy.contains("Upload a lead image in the 'Lead Image' content field").should(
      'exist',
    );

    // EEA LeadImageSidebar.jsx: sidebar renders the "no image" notice
    cy.get('.sidebar-metadata-container').contains(
      'No image set in Lead Image content field',
    );

    // Save succeeds without error
    cy.get('#toolbar-save').click();
    cy.waitForResourceToLoad('@navigation');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // View mode: EEA View.jsx renders the image-block-container wrapper even with no image
    // (the outer <p> has class "block image align", not "block leadimage")
    cy.get('.image-block-container').should('exist');
  });
});
