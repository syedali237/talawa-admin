/* eslint-disable */

/// <reference types="cypress" />

describe('Login Functionality', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4321/');
  });

  it('Login', () => {
    cy.get('[data-cy="loginEmail"]').type('testsuperadmin@example.com');
    cy.get('[data-cy="loginPassword"]').type('Pass@123');
    cy.get('[data-cy="loginBtn"]').click();

    // Check if login was successful
    cy.url().should('include', '/user/organizations');
    // cy.contains('Welcome, testuser').should('be.visible')
  });
});
