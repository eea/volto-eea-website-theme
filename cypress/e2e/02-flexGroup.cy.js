import { slateBeforeEach, slateAfterEach } from '../support/e2e';

describe('Flex Group Variation Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Add a Group block variation:Empty', () => {
    // Change page title
    cy.clearSlateTitle();
    cy.getSlateTitle().type('My Add-on Page');

    cy.get('.documentFirstHeading').contains('My Add-on Page');

    cy.getSlate().click();

    //add a block
    cy.getSlate().click();
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get('.blocks-chooser .title').contains('Common').click();
    cy.get('.content.active.common .button.group')
      .contains('Section')
      .should('be.visible')
      .click();

    // Save
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // then the page view should contain our changes
    cy.contains('My Add-on Page');
  });

  it('Add a Group block variation with some texts', () => {
    // Change page title
    cy.clearSlateTitle();
    cy.getSlateTitle().type('My Add-on Page');

    cy.get('.documentFirstHeading').contains('My Add-on Page');

    cy.getSlate().click();

    //add a block
    cy.getSlate().click();
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get('.blocks-chooser .title').contains('Common').click();
    cy.get('.content.active.common .button.group')
      .contains('Section (Group)')
      .should('be.visible')
      .click();

    cy.contains('Section').click();

    cy.get(
      '.sidebar-container .field-wrapper-variation .react-select__value-container',
    ).click();
    cy.get('.react-select__option')
      .contains('Flex Group')
      .click({ force: true });

    cy.get('.block-editor-group .block-editor-slate')
      .click()
      .type('test{enter}');
    cy.get('.block-editor-group div[contenteditable*=true]')
      .eq(1)
      .focus()
      .click()
      .type('test2{enter}');
    cy.get('.block-editor-group div[contenteditable*=true]')
      .eq(1)
      .focus()
      .click()
      .type('test3');

    cy.get('.block-toolbar svg')
      .first()
      .trigger('mousedown', { button: 0 })
      .trigger('mousemove', 10, -40, { force: true })
      .trigger('mouseup', 10, -40, { force: true });

    // Save
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // then the page view should contain our changes

    cy.contains('My Add-on Page');
    cy.contains('test2');
  });
});
