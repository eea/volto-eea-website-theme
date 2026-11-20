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

const setPageLeadImageBehavior = (enabled) => {
  cy.autologin();
  cy.visit('/controlpanel/dexterity-types/Document');
  cy.contains('#page-controlpanel .menu .item', 'Behaviors').click();

  cy.get('#field-plone\\.leadimage').then(($checkbox) => {
    const isChecked = $checkbox.prop('checked');

    if (isChecked !== enabled) {
      cy.get('label[for="field-plone\\.leadimage"]').click({ force: true });
    }
  });

  cy.get('#field-plone\\.leadimage').should(
    enabled ? 'be.checked' : 'not.be.checked',
  );

  // Wait for the control panel PATCH before navigating away: the edit page
  // reads the behaviour from the registry this save writes.
  cy.intercept('PATCH', '**/@controlpanels/**').as('saveLeadImageBehavior');
  cy.get('#toolbar-save').click();
  cy.wait('@saveLeadImageBehavior');
};

describe('LeadImage block shadow', () => {
  beforeEach(slateBeforeEach);
  afterEach(() => {
    slateAfterEach();
    setPageLeadImageBehavior(false);
  });

  it('adds a LeadImage block and renders the no-image placeholder in edit mode', () => {
    // The Lead Image block is only available when the content type has the
    // Lead Image behavior enabled.
    setPageLeadImageBehavior(true);

    // Load the edit route directly instead of pushing it through the SPA
    // history right after a cy.visit: that push can race with the client
    // hydration, which then settles back on the view page, so the edit form
    // and #field-image never mount (same fix as in slateBeforeEach). Then
    // wait for the schema the edit form loads, so a schema still missing the
    // Lead Image field fails here with a clear message.
    cy.intercept('GET', '**/@types/Document').as('documentSchema');
    cy.visit('/cypress/my-page/edit');
    cy.wait('@documentSchema')
      .its('response.body.properties')
      .should('have.property', 'image');
    cy.get('#field-image').should('exist');

    // Add a Lead Image Field block using the slash command, which is stable
    // across Volto 17/18 and avoids the toolbar add-button differences.
    cy.addNewBlock('lead');

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
