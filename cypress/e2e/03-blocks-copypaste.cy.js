import { slateBeforeEach, slateAfterEach } from '../support/e2e';

describe('Blocks copy/paste', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Copy/paste multiple blocks', () => {
    // GIVEN: A page with multiple blocks
    cy.getSlate().click().type('/image{enter}');

    cy.get(`.block.image .toolbar-inner .ui.input input`)
      .type(
        'https://eea.github.io/volto-eea-design-system/img/eea_icon.png',
      )
      .type('{enter}');

    cy.getSlateEditorAndType('Noam Avram Chomsky').contains(
      'Noam Avram Chomsky',
    );

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

    cy.getSlate().click().type('/image{enter}');
    cy.get(`.block.image .toolbar-inner .ui.input input`)
      .type(
        'https://eea.github.io/volto-eea-design-system/img/eea_icon.png',
      )
      .type('{enter}');

    cy.getSlateEditorAndType('Noam Avram Chomsky').contains(
      'Noam Avram Chomsky',
    );

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
    cy.getSlate().click().type('/image{enter}');
    cy.get(`.block.image .toolbar-inner .ui.input input`)
      .type(
        'https://eea.github.io/volto-eea-design-system/img/eea_icon.png',
      )
      .type('{enter}');

    cy.getSlateEditorAndType('Noam Avram Chomsky').contains(
      'Noam Avram Chomsky',
    );

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
