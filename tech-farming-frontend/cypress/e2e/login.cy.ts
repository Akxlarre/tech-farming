// cypress/e2e/login.cy.ts

describe('Login - Tech Farming', () => {
  // Antes de cada test vamos directamente a la ruta de login
  beforeEach(() => {
    cy.visit('/auth/login');

    // Limpiamos los inputs
    cy.get('[data-cy="login-email"]').clear();
    cy.get('[data-cy="login-password"]').clear();
  });

  it('Muestra el formulario de login correctamente', () => {
    cy.get('[data-cy="login-email"]').should('be.visible');
    cy.get('[data-cy="login-password"]').should('be.visible');
    cy.get('[data-cy="login-submit"]').should('be.enabled');
  });

  it('Permite hacer login con credenciales válidas', () => {
    // Rellenamos con tus vars de entorno
    cy.log('USER:', Cypress.env('USERNAME_TEST'))
    cy.log('PASS:', Cypress.env('PASSWORD_TEST'))
    cy.get('[data-cy="login-email"]').type(Cypress.env('USERNAME_TEST'));
    cy.get('[data-cy="login-password"]').type(
      Cypress.env('PASSWORD_TEST'),
      { log: false }
    );
    cy.get('[data-cy="login-submit"]').click();

    // Comprobamos que ya no estamos en /auth/login
    cy.location('pathname').should((path) => {
      expect(path).not.to.eq('/auth/login');
    });

    // Opcional: comprueba que el loading overlay desaparece
    cy.get('[data-cy="login-loading-overlay"]').should('not.exist');

    // Opcional: valida algún elemento del dashboard
    // cy.contains('h1', 'Tu tablero').should('be.visible');
  });

  it('Muestra mensaje de error con credenciales inválidas', () => {
    cy.get('[data-cy="login-email"]').type('invalido@ejemplo.cl');
    cy.get('[data-cy="login-password"]').type('wrongpass');
    cy.get('[data-cy="login-submit"]').click();

    cy.get('[data-cy="login-error"]')
      .should('be.visible')
      .and('contain.text', 'Correo o contraseña incorrectos.');
  });
});
