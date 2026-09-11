/**
 * Cypress tests for two shadow customizations exercised through the Image
 * block, added with the slash command to avoid the version-specific block
 * chooser button differences between Volto 17 and 18.
 *
 * 1. ObjectBrowserWidget — hash anchor preservation
 *    EEA patches `onSubmitManualLink` so a URL like
 *    `http://localhost:3000/cypress/my-page#section` is stored as
 *    `linkWithHash` on the selected item. EEA Image/View now passes the full
 *    selected item into UniversalLink, so the rendered image link keeps the
 *    `#section` fragment in view mode.
 *
 * 2. SidebarPopup — ESC key closes the object browser
 *    The browse button in ObjectBrowserWidget opens an ObjectBrowser rendered
 *    inside a SidebarPopup. Pressing Escape must dismiss `.sidebar-container`.
 */
import { slateBeforeEach, slateAfterEach } from '../support/e2e';

const imageUrl =
  'https://eea.github.io/volto-eea-design-system/img/eea_icon.png';
const imageLinkField = '.field-wrapper-href .objectbrowser-field';
const imageUrlSubmitButton = '.block.image .toolbar-inner .ui.basic.primary.button';
const linkSubmitButton = `${imageLinkField} .ui.basic.primary.button`;

const addImageBlockWithLinkField = () => {
  cy.addNewBlock('image');
  cy.get('.block-editor-image').should('exist');

  cy.get('.block.image .toolbar-inner .ui.input input').type(imageUrl);
  cy.get(imageUrlSubmitButton).should('not.be.disabled').click({ force: true });

  cy.get('.block-editor-image').click({ force: true });
  cy.get('.field-wrapper-href').scrollIntoView();
  cy.get(imageLinkField).should('exist');
};

describe('ObjectBrowserWidget & SidebarPopup shadows', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('preserves hash anchors in the rendered image link', () => {
    addImageBlockWithLinkField();

    const urlWithHash = `${Cypress.config().baseUrl}/cypress/my-page#section`;
    cy.get('.field-wrapper-href').scrollIntoView();
    cy.get(`${imageLinkField} input:visible`).first().type(urlWithHash);
    cy.get(linkSubmitButton)
      .first()
      .should('not.be.disabled')
      .click({ force: true });

    cy.get(`${imageLinkField} .ui.label`).first().should('contain', 'My Page');

    cy.get('#toolbar-save').click();
    cy.waitForResourceToLoad('@navigation');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');
    cy.get('.block.image a')
      .should('have.attr', 'href')
      .and('include', '#section');
  });

  it('closes the ObjectBrowser popup with the ESC key (SidebarPopup)', () => {
    addImageBlockWithLinkField();

    cy.get('.field-wrapper-href').scrollIntoView();
    cy.get(`${imageLinkField} button[aria-label="Open object browser"]`)
      .first()
      .click({ force: true });

    cy.contains('.sidebar-container', 'Choose Target').should('exist');
    cy.document().trigger('keyup', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
    });
    cy.contains('.sidebar-container', 'Choose Target').should('not.exist');
  });
});
