/**
 * Cypress test for the Grid block shadow customizations.
 *
 * Grid/Edit.jsx and Grid/View.jsx provide backward compatibility with legacy
 * @kitconcept/volto-blocks-grid content: they convert the old teaserGrid schema
 * and normalise blocks missing a @type to slate, so no "Unknown block" errors appear.
 *
 * These shadows are compatible with both Volto 17 and Volto 18 — the imports
 * (RenderBlocks, withBlockExtensions, ContainerEdit) are still available in both.
 */
import { slateBeforeEach, slateAfterEach } from '../support/e2e';

describe('Grid block shadow', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('adds a Grid block and renders it in view mode', () => {
    cy.getSlate().click();
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get('.blocks-chooser input').type('Grid');
    cy.get('.blocks-chooser .gridBlock').first().click();

    // Grid block editor appears in edit mode
    cy.get('.block-editor-gridBlock').should('exist');

    // Save
    cy.get('#toolbar-save').click();
    cy.waitForResourceToLoad('@navigation');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // Grid block container is visible in view mode
    cy.get('.block.gridBlock').should('exist');
  });
});
