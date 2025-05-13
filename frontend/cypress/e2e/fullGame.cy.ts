describe("Anti-Rummikub Full Game Flow", () => {
  // Test user data
  const user1 = {
    username: `player1_${Date.now()}`,
    password: "test123456",
  };

  const gameData = {
    name: `Game_${Date.now()}`,
    maxPlayers: 4,
  };

  before(() => {
    // Clear local storage before tests
    cy.clearLocalStorage();
  });

  it("should allow a user to sign up, create a game, and wait for opponents", () => {
    // Visit the auth page
    cy.visit("/auth");

    // Go to signup form
    cy.contains("회원가입").click();

    // Fill and submit signup form
    cy.get("#username").type(user1.username);
    cy.get("#password").type(user1.password);
    cy.get("#confirmPassword").type(user1.password);
    cy.get('button[type="submit"]').click();

    // Should redirect to lobby
    cy.url().should("include", "/lobby");
    cy.contains(user1.username).should("be.visible");

    // Create a new game
    cy.contains("방 만들기").click();
    cy.get('input[name="name"]').type(gameData.name);
    cy.get('button[type="submit"]').click();

    // Should now be in game lobby
    cy.url().should("include", "/game/");

    // Mark as ready
    cy.contains("준비하기").click();
    cy.contains("준비 완료").should("be.visible");

    // Verify game details are displayed
    cy.contains(gameData.name).should("be.visible");
    cy.contains("최대 인원").should("be.visible");
    cy.contains("4명").should("be.visible");

    // Check if current player is in the list
    cy.contains(user1.username).should("be.visible");
    cy.contains("(나)").should("be.visible");

    // Verify game cannot start without other players
    cy.get("button").contains("게임 시작").should("not.exist");
  });

  it("should allow a user to login and join an existing game", () => {
    // This test would need a second browser/tab or a way to simulate a second user
    // For demonstration purposes, we're showing what the code would look like

    // Create second user data
    const user2 = {
      username: `player2_${Date.now()}`,
      password: "test123456",
    };

    // Visit the auth page in a second browser
    cy.visit("/auth");

    // Go to signup form
    cy.contains("회원가입").click();

    // Fill and submit signup form for second user
    cy.get("#username").type(user2.username);
    cy.get("#password").type(user2.password);
    cy.get("#confirmPassword").type(user2.password);
    cy.get('button[type="submit"]').click();

    // Should redirect to lobby
    cy.url().should("include", "/lobby");

    // Find and join the game created by user1
    cy.contains(gameData.name).parent().contains("참가").click();

    // Should now be in game lobby
    cy.url().should("include", "/game/");

    // Mark as ready
    cy.contains("준비하기").click();
    cy.contains("준비 완료").should("be.visible");

    // Check if both players are in the list
    cy.contains(user1.username).should("be.visible");
    cy.contains(user2.username).should("be.visible");
    cy.contains("(나)").should("be.visible");
  });

  it("should start the game and handle basic game flow", () => {
    // This is mock code to demonstrate the full flow
    // In reality, you'd need multiple browser sessions or special test setup

    // Game starts (would be initiated by the creator)
    cy.contains("게임 시작").click({ force: true });

    // Game board should now be visible
    cy.get(".game-board").should("be.visible");

    // If user is the explainer
    cy.get("body").then(($body) => {
      if ($body.find(".explainer-area").length > 0) {
        // Start the explanation
        cy.contains("설명 시작하기").click();

        // Timer should be visible
        cy.get(".timer").should("be.visible");

        // Wait for explanation time to end (in a real test, you'd use cy.clock)
        cy.wait(5000); // Just for demonstration
      } else {
        // If user is a voter
        cy.contains("투표").should("exist");

        // Wait for explanation to finish
        cy.get(".vote-buttons").should("be.visible");

        // Cast a vote
        cy.contains("찬성").click();

        // Should show vote confirmed
        cy.contains("투표가 완료되었습니다").should("be.visible");
      }
    });

    // Chat functionality
    cy.get(".chat-panel").should("be.visible");
    cy.get(".chat-panel input").type("Hello everyone!{enter}");
    cy.contains("Hello everyone!").should("be.visible");
  });

  it("should handle game ending and return to lobby", () => {
    // This is a stub for demonstration purposes

    // Leave the game
    cy.contains("나가기").click();

    // Should redirect back to lobby
    cy.url().should("include", "/lobby");

    // Logout
    cy.contains("로그아웃").click();

    // Should redirect to auth page
    cy.url().should("include", "/auth");
  });
});
