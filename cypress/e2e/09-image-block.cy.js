/**
 * Cypress tests for the Image block shadow customizations.
 *
 * EEA shadows three files in the Image block family:
 *  - Edit.jsx   — adds copyright overlay, `image-block-container` wrapper,
 *                 `data: data` in the image item prop, exports getImageBlockSizes
 *  - View.jsx   — same EEA additions for the public view, plus the
 *                 `item={hrefItem}` fix that preserves hash anchors in links
 *                 (tested separately in 08-object-browser-widget.cy.js)
 *  - schema.js  — adds the Copyright fieldset (copyright text, icon, position)
 *                 and sets align/size defaults
 *
 * All three shadows are compatible with both Volto 17 and Volto 18:
 *  - V17 and V18 upstream Edit.jsx / View.jsx / schema.js are byte-for-byte
 *    identical, so the EEA additions are purely additive.
 *  - The barrel imports (ImageSidebar, SidebarPortal, withBlockExtensions,
 *    UniversalLink) remain stable across both versions.
 *
 * Tests use the `/image` slash command to add blocks so they work on both
 * Volto 17 (old block chooser button) and Volto 18 (new UI).
 */
import { slateBeforeEach, slateAfterEach } from '../support/e2e';

const imageUrl =
  'https://eea.github.io/volto-eea-design-system/img/eea_icon.png';

/**
 * Add an Image block via the slash command and set its URL via the inline
 * toolbar input — this avoids object browser navigation which is already
 * covered by 08-object-browser-widget.cy.js.
 */
const addImageBlockWithUrl = () => {
  cy.getSlate().click().type('/image{enter}');
  cy.get('.block-editor-image').should('exist');

  cy.get('.block.image .toolbar-inner .ui.input input')
    .type(imageUrl)
    .type('{enter}');

  // Wait for the image to be accepted and the block to update
  cy.get('.block.image .image-block-container').should('exist');
};

describe('Image block shadow — Edit.jsx / View.jsx / schema.js', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  // -------------------------------------------------------------------------
  // EEA structural wrapper (image-block-container)
  // -------------------------------------------------------------------------

  it('wraps the image in an EEA image-block-container in edit mode', () => {
    addImageBlockWithUrl();

    // EEA Edit.jsx: outer alignment wrapper
    cy.get('.block.image.align').should('exist');
    // EEA Edit.jsx: inner container div (not in upstream Volto)
    cy.get('.image-block-container').should('exist');
    // EEA Edit.jsx: copyright-wrapper is always rendered when a URL is set
    cy.get('.copyright-wrapper').should('exist');
  });

  it('renders the image-block-container in view mode after save', () => {
    addImageBlockWithUrl();

    cy.get('#toolbar-save').click();
    cy.waitForResourceToLoad('@navigation');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // EEA View.jsx: same wrapper structure in public view
    cy.get('.block.image.align').should('exist');
    cy.get('.image-block-container').should('exist');
    // The image itself should be rendered
    cy.get('.block.image img').should('have.attr', 'src', imageUrl);
  });

  // -------------------------------------------------------------------------
  // Copyright fieldset (schema.js EEA addition)
  // -------------------------------------------------------------------------

  it('shows the Copyright fieldset in the sidebar when the image has a URL', () => {
    addImageBlockWithUrl();

    // Click the block to select it and open the sidebar
    cy.get('.block.image .image-block-container').click({ force: true });

    // EEA schema.js: "Copyright" tab should appear in the sidebar
    cy.get('.sidebar-container').contains('Copyright').should('exist');
    cy.get('.sidebar-container').contains('Copyright').click({ force: true });

    // Copyright fieldset fields
    cy.get('.field-wrapper-copyright').should('exist');
    cy.get('.field-wrapper-copyrightIcon').should('exist');
    cy.get('.field-wrapper-copyrightPosition').should('exist');
  });

  it('renders copyright overlay in edit mode and persists it in view mode', () => {
    addImageBlockWithUrl();

    // Open the Copyright sidebar tab
    cy.get('.block.image .image-block-container').click({ force: true });
    cy.get('.sidebar-container').contains('Copyright').click({ force: true });

    // Enter copyright text
    cy.get('.field-wrapper-copyright input').type('© EEA');

    // EEA Edit.jsx: copyright overlay should appear immediately
    cy.get('.copyright-wrapper').should('be.visible');
    cy.get('.copyright-wrapper').contains('© EEA');

    // Save
    cy.get('#toolbar-save').click();
    cy.waitForResourceToLoad('@navigation');
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // EEA View.jsx: copyright overlay must survive the save/view cycle
    cy.get('.copyright-wrapper').should('exist');
    cy.get('.copyright-wrapper').contains('© EEA');
  });

  // -------------------------------------------------------------------------
  // Copyright visibility rules (showCopyright logic)
  // showCopyright = size === 'l' OR size is undefined (defaults to showing)
  // -------------------------------------------------------------------------

  it('hides the copyright overlay when image size is set to Medium (m)', () => {
    addImageBlockWithUrl();

    // Open sidebar — Default section (alt / align / size) is at the top.
    cy.get('.block.image .image-block-container').click({ force: true });

    // ① Navigate to the Copyright section and enter copyright text.
    //    The Copyright fieldset is only present in the schema when
    //    size is 'l' or undefined (schema.js EEA conditional), so we must
    //    enter the text BEFORE changing the size.
    cy.get('.sidebar-container').contains('Copyright').click({ force: true });
    cy.get('.field-wrapper-copyright input').type('© EEA');

    // Copyright overlay must be visible now (size still undefined → showCopyright=true).
    cy.get('.copyright-wrapper .eea.copyright').should('exist');

    // ② Scroll back up to the Default section to reach the image-size widget.
    //    All fieldsets are rendered in the DOM by BlockDataForm; scrollIntoView
    //    brings the element back into the viewport.
    cy.get('.field-image_size').scrollIntoView();
    cy.get('.field-image_size button[aria-label="Medium"]').click();

    // After switching to Medium: showCopyright = (size === 'l' || !size) = false.
    // The Copyright fieldset also disappears from the schema for size 'm',
    // but data.copyright is still in the block data. The EEA render logic
    // checks showCopyright, so the .eea.copyright div must NOT exist.
    cy.get('.copyright-wrapper').should('exist');
    cy.get('.copyright-wrapper .eea.copyright').should('not.exist');
  });

  // -------------------------------------------------------------------------
  // Alignment defaults (schema.js sets align default to 'center')
  // -------------------------------------------------------------------------

  it('defaults to center alignment (EEA schema.js default)', () => {
    addImageBlockWithUrl();

    // The outer block element should have the 'center' class by default
    cy.get('.block.image.align.center').should('exist');
  });
});
