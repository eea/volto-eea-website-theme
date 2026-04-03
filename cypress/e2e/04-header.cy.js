describe('Header shadow', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Not Found')) {
        return false;
      }
    });
    cy.visit('/login');
  });

  it('renders the EEA header shell and partner navigation trigger', () => {
    cy.get('header.eea.header').should('be.visible');
    cy.get('#eea-side-menu-host').should('exist');

    cy.get('header.eea.header .official-union [role="listbox"]')
      .should('be.visible')
      .and(
        'have.attr',
        'aria-label',
        'An official website of the European Union | How do you know?',
      );

    cy.get('#theme-sites[role="listbox"]')
      .should('be.visible')
      .and('have.attr', 'aria-label', 'Environmental information systems');
    cy.contains('#theme-sites', 'Environmental information systems').should(
      'be.visible',
    );
  });
});
