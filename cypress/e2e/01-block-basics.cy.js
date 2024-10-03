import { slateBeforeEach, slateAfterEach } from '../support/e2e';

describe('Blocks Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Add Block: Empty', () => {
    // Change page title
    cy.clearSlateTitle();
    cy.getSlateTitle().type('My Add-on Page');

    cy.get('.documentFirstHeading').contains('My Add-on Page');

    cy.getSlate().click();

    // test rss link
    cy.get('.documentFirstHeading').click();
    cy.get('a').contains('Block').click();
    cy.get(`[aria-label="Add RSS Link"]`).click();
    cy.get('#field-title-0-rssLinks-0').type('RSS');
    cy.get('#field-href-2-rssLinks-0').type('/cypress/my-page/rss');

    //add image block
    cy.getSlate().click();
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get('.blocks-chooser .title').contains('Media').click();
    cy.get('.content.active.media .button.image').contains('Image').click();
    cy.get('.block.image .ui.input input[type="text"]').type(
      'https://eea.github.io/volto-eea-design-system/img/eea_icon.png{enter}',
    );

    cy.get('.align-buttons .ui.basic.icon.button').first().click();
    cy.get('#blockform-fieldset-styling').click();
    cy.get('#field-objectPosition-0-styles').click().type('top');

    // Save
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // check banner rss link
    cy.get('.button.rssfeed').should(
      'have.attr',
      'href',
      '/cypress/my-page/rss',
    );
    cy.get('.button.rssfeed').contains('RSS');

    // then the page view should contain our changes
    cy.contains('My Add-on Page');
    cy.get('.block.image.align.left img.top').should(
      'have.attr',
      'src',
      'https://eea.github.io/volto-eea-design-system/img/eea_icon.png',
    );
  });

  it('Add Navigation Block', () => {
    // Change page title
    cy.clearSlateTitle();
    cy.getSlateTitle().type('My Add-on Page');

    cy.get('.documentFirstHeading').contains('My Add-on Page');

    cy.getSlate().click();

    // Add Navigation block
    cy.get('.ui.basic.icon.button.block-add-button').first().click();
    cy.get('.blocks-chooser .contextNavigation').click();
    cy.get('#field-name').type('Nav title');
    cy.get(
      '.field-wrapper-includeTop > .grid > :nth-child(1) > .twelve > .wrapper > .ui > label',
    ).click();
    // cy.get(
    //   '.field-wrapper-currentFolderOnly > .grid > :nth-child(1) > .twelve > .wrapper > .ui > label',
    // ).click();
    cy.get(
      '.field-wrapper-no_icons > .grid > :nth-child(1) > .twelve > .wrapper > .ui > label',
    ).click();
    cy.get(
      '.field-wrapper-no_thumbs > .grid > :nth-child(1) > .twelve > .wrapper > .ui > label',
    ).click();

    // Save
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // // then the page view should contain our changes
    cy.get('.context-navigation-header').contains('Nav title');

    // Edit to select Accordion variation
    cy.get('.toolbar-actions .edit').click();
    cy.get('.block-editor-contextNavigation').click();
    cy.get(
      '#sidebar-properties .field-wrapper-variation .react-select__value-container',
    ).click();
    cy.get('.field-wrapper-variation .react-select__option')
      .contains('Accordion')
      .click();

    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // then the page view should contain our changes
    cy.get('.accordion-header').contains('Nav title');
    cy.get('.accordion-header').click();
  });
});
