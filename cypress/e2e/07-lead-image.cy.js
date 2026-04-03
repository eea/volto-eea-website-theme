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

  cy.get('#toolbar-save').click();
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
    cy.visit('/cypress/my-page');
    cy.navigate('/cypress/my-page/edit');
    cy.get('#field-image').should('exist');

    // Add a Lead Image Field block using the slash command, which is stable
    // across Volto 17/18 and avoids the toolbar add-button differences.
    cy.getSlate().click().type('/lead{enter}');

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
