describe('Header shadow', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Not Found')) {
        return false;
      }
    });
    cy.visit('/login');
  });

  it('renders the EEA header shell and partner navigation', () => {
    cy.get('header.eea.header').should('be.visible');
    cy.get('#eea-side-menu-host').should('exist');

    cy.get('header.eea.header .official-union .ui.dropdown')
      .should('be.visible')
      .click({ force: true });

    cy.get('header.eea.header .official-union .menu.transition.visible')
      .should('be.visible')
      .and('contain', 'All official European Union website addresses are in');
    cy.get('header.eea.header .official-union .menu.transition.visible')
      .contains('See all EU institutions and bodies')
      .should(
        'have.attr',
        'href',
        'https://europa.eu/european-union/contact/institutions-bodies_en',
      )
      .and('have.attr', 'target', '_blank');

    cy.get('#theme-sites').should('be.visible').click({ force: true });
    cy.get('#theme-sites .menu.transition.visible')
      .contains('European Environment Agency website')
      .should('be.visible')
      .closest('a')
      .should('have.attr', 'href', 'https://www.eea.europa.eu');
    cy.get('#theme-sites .menu.transition.visible')
      .contains('WISE marine - Marine information system for Europe')
      .should('be.visible')
      .closest('a')
      .should('have.attr', 'href', 'https://water.europa.eu/marine');
  });
});
