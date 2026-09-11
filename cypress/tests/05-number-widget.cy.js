/**
 * Cypress test for the NumberWidget shadow customization.
 *
 * The EEA NumberWidget overrides the upstream widget so that onChange/onBlur
 * always call parseInt() before passing the value to Redux, ensuring form
 * state holds a number rather than a string.
 *
 * We exercise it through the ContextNavigation block sidebar whose
 * `topLevel` (Start level) and `bottomLevel` (Navigation tree depth) fields
 * are declared as `type: 'number'` in the block schema.
 */
import { slateBeforeEach, slateAfterEach } from '../support/e2e';

describe('NumberWidget shadow', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('renders number inputs and accepts integer values in ContextNavigation sidebar', () => {
    // Add a ContextNavigation block (has topLevel + bottomLevel number fields in its schema)
    cy.getSlate().click();
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get('.blocks-chooser input').type('Navigation');
    cy.get('.blocks-chooser .contextNavigation').click();

    // The sidebar should expose both number fields
    cy.get('#field-topLevel')
      .should('exist')
      .and('have.attr', 'type', 'number');
    cy.get('#field-bottomLevel')
      .should('exist')
      .and('have.attr', 'type', 'number');

    // Type values — the NumberWidget calls parseInt() internally
    cy.get('#field-topLevel').focus().clear().type('2');
    cy.get('#field-topLevel').should('have.value', '2');

    cy.get('#field-bottomLevel').focus().clear().type('3');
    cy.get('#field-bottomLevel').should('have.value', '3');

    // Save succeeds without error
    cy.get('#toolbar-save').click();
    cy.waitForResourceToLoad('@navigation');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');
  });
});
