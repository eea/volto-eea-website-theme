import { slateBeforeEach, slateAfterEach } from '../support/e2e';

describe('Blocks copy/paste', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Copy/paste multiple blocks', () => {
    // GIVEN: A page with multiple blocks
    cy.getSlate().click();
    cy.get('.ui.basic.icon.button.block-add-button').click();
    cy.get('.ui.basic.icon.button.image').contains('Image').click();
    cy.get('.block.image .ui.input input[type="text"]').type(
      `https://github.com/plone/volto/raw/main/logos/volto-colorful.png{enter}`,
    );
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/my-page');

    // then the page view should contain the image block
    cy.get('#page-document img').should(
      'have.attr',
      'src',
      'https://github.com/plone/volto/raw/main/logos/volto-colorful.png',
    );

    cy.get('#page-document img')
      .should('be.visible')
      .and(($img) => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });

    cy.getSlate().click();

    // WHEN: I copy paste them
    cy.getSlateTitle().focus().click().type('{shift}', { release: false });
    cy.get('.block-editor-image').click();
    cy.get('#toolbar-copy-blocks').click();

    cy.getSlateEditorAndType('{shift}').click();
    cy.get('#toolbar-paste-blocks').should('be.visible');
    cy.get('#toolbar-paste-blocks').click();

    // THEN: the page will contain duplicated blocks
    cy.get('.documentFirstHeading').should(($blocks) => {
      expect($blocks).to.have.length(2);
    });

    cy.get('.block-editor-image').should(($blocks) => {
      expect($blocks).to.have.length(2);
    });
  });

  it('Cut/paste multiple blocks', () => {
    // GIVEN: A page with multiple blocks

    cy.getSlate().click();
    cy.get('.ui.basic.icon.button.block-add-button').click();
    cy.get('.ui.basic.icon.button.image').contains('Image').click();
    cy.get('.block.image .ui.input input[type="text"]').type(
      `https://github.com/plone/volto/raw/main/logos/volto-colorful.png{enter}`,
    );
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/my-page');

    // then the page view should contain the image block
    cy.get('#page-document img').should(
      'have.attr',
      'src',
      'https://github.com/plone/volto/raw/main/logos/volto-colorful.png',
    );

    cy.get('#page-document img')
      .should('be.visible')
      .and(($img) => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });

    cy.getSlate().click();

    cy.getSlateTitle().focus().click().type('{shift}', { release: false });
    cy.get('.block-editor-image').click();
    cy.get('#toolbar-cut-blocks').click();

    cy.getSlateEditorAndType('{shift}').click();

    cy.get('#toolbar-paste-blocks').should('be.visible');
    cy.get('#toolbar-paste-blocks').click();

    // THEN: the page will contain only one of each blocks
    cy.get('.documentFirstHeading').should(($blocks) => {
      expect($blocks).to.have.length(1);
    });

    cy.get('.block-editor-image').should(($blocks) => {
      expect($blocks).to.have.length(1);
    });
  });

  it('Delete multiple blocks', () => {
    // GIVEN: A page with multiple blocks
    cy.getSlate().click();
    cy.get('.ui.basic.icon.button.block-add-button').click();
    cy.get('.ui.basic.icon.button.image').contains('Image').click();
    cy.get('.block.image .ui.input input[type="text"]').type(
      `https://github.com/plone/volto/raw/main/logos/volto-colorful.png{enter}`,
    );
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/my-page');

    // then the page view should contain the image block
    cy.get('#page-document img').should(
      'have.attr',
      'src',
      'https://github.com/plone/volto/raw/main/logos/volto-colorful.png',
    );

    cy.get('#page-document img')
      .should('be.visible')
      .and(($img) => {
        // "naturalWidth" and "naturalHeight" are set when the image loads
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });

    cy.getSlate().click();

    cy.getSlateTitle().focus().type('{shift}', { release: false });
    cy.get('.block-editor-image').click();
    cy.get('#toolbar-delete-blocks').should('be.visible');
    cy.get('#toolbar-delete-blocks').click();

    // THEN: the page will contain none of the blocks
    cy.get('.documentFirstHeading').should(($blocks) => {
      expect($blocks).to.have.length(0);
    });

    cy.get('.block-editor-image').should(($blocks) => {
      expect($blocks).to.have.length(0);
    });
  });
});
