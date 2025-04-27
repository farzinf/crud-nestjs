Feature: Customer Management
  As a user of the system
  I want to be able to manage customer information
  So that I can maintain customer records

  Scenario: Create a customer with valid data
    Given valid customer data
    When a customer is created
    Then the customer should be stored

  Scenario: Create a customer with an invalid phone number
    Given an invalid phone number
    When a customer is created
    Then an error should be returned

  Scenario: Create a customer with a duplicate email
    Given a customer with email "duplicate.email.cucumber@example.com" exists
    And valid customer data with email "duplicate.email.cucumber@example.com"
    When a customer is created
    Then an error indicating a duplicate email should be returned

  Scenario: Retrieve a customer by ID
    Given a customer with ID "existing-customer-id" exists
    When a request is made to retrieve the customer by ID "existing-customer-id"
    Then the customer details should be returned

  Scenario: Attempt to retrieve a customer with an invalid ID
    When a request is made to retrieve a customer with ID "invalid-customer-id"
    Then a not found error should be returned

  Scenario: Get all customers
    Given that at least 2 customer exists
    When a request is made to get all customers
    Then all customers should be returned



  Scenario: Update customer with valid customer data
    Given a customer with ID "existing-customer-id" exists
    And valid customer update data
    When the customer "existing-customer-id" is updated
    Then the customer information should be updated



  Scenario: Update customer with invalid phone number
      Given a customer with ID "existing-customer-id" exists
      And invalid phone number in update data
      When the customer "existing-customer-id" is updated
      Then an error indicating invalid phone number should be returned

  Scenario: Delete customer by ID
    Given a customer with ID "existing-customer-id" exists
    When a request is made to delete the customer "existing-customer-id"
    Then the customer should be removed

