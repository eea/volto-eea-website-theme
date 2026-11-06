import { slateBeforeEach, slateAfterEach } from '../support/e2e';

const getRoleField = (label) => cy.contains('label', label).parents('.field').first();

const selectRoleOption = (label, option) => {
  getRoleField(label).find('.react-select__control').click();
  getRoleField(label).find('input').type(option, { force: true });
  cy.get('.react-select__menu').should('be.visible');
  cy.get('.react-select__option').contains(option).click({ force: true });
};

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
      .click({ force: true });

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
      .click({ force: true });

    cy.contains('Section').click();

    // Click on the restricted block checkbox in the Security fieldset
    cy.contains('label', 'Restricted block').click();

    // Select roles without Enter key submits
    selectRoleOption('Allow View', 'Administrators');
    selectRoleOption('Deny View', 'Administrators');

    cy.get(
      '.sidebar-container .field-wrapper-variation .react-select__value-container',
    ).click();
    cy.get('.react-select__option').contains('Flex Group').click({ force: true });

    // Type text in the group slate using beforeinput events (no keyboard Enter)
    cy.get('.block-editor-group .block-editor-slate')
      .first()
      .find('[contenteditable=true]')
      .first()
      .click()
      .typeInSlate('test2');

    // Save
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // then the page view should contain our changes

    cy.contains('My Add-on Page');
    cy.contains('test2');
  });
});
