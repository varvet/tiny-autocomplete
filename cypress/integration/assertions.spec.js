context("Assertions", function() {
  beforeEach(function() {
    cy.visit("http://localhost:8080/index.html");
  });

  describe("Interactions", function() {
    it("should be initialized", function() {
      cy.get("#autocomplete-0").should("have.class", "autocomplete-field");
    });

    it("finds the correct amount of matches in flat list", function() {
      cy.get("#autocomplete-0").type("sou");
      cy.get(".autocomplete-item").should("have.length", 5);
    });

    it("marks hits as <strong>", function() {
      cy.get("#autocomplete-0").type("blå");

      cy.get(".autocomplete-item:last").should("have.descendants", "strong");
      cy.get(".autocomplete-item:first").should(
        "not.have.descendants",
        "strong"
      );
    });

    it("runs the supplied function when an item is clicked", function() {
      cy.get("#autocomplete-0").type("blå");
      cy.get(".autocomplete-item:last").click();
      cy.get(".results").should("contain", "Blåmes");
    });

    it("can navigate with keyboard and closes the list on escape", function() {
      cy.get("#autocomplete-0").type("blå");
      cy.wait(400);
      cy.get("#autocomplete-0").type("{downarrow}{downarrow}{uparrow}");
      cy.get(".autocomplete-item.active").should(
        "contain",
        "Southern Screamer"
      );
      cy.get("#autocomplete-0").type("{esc}");
      cy.get(".autocomplete-item").should("not.exist");
    });

    it("can select an item using keyboard", function() {
      cy.get("#autocomplete-0").type("blå");
      cy.wait(400);
      cy.get("#autocomplete-0").type("{downarrow}{downarrow}{enter}");
      cy.get(".results").should("contain", "Horned Screamer");
      cy.get(".autocomplete-item").should("not.exist");
    });

    it("closes the list on blur", function() {
      cy.get("#autocomplete-0").type("sou");
      cy.get(".autocomplete-item").should("have.length", 5);

      // Pre-blur
      cy.get(".autocomplete").should("have.descendants", ".autocomplete-item");

      // Post-blur
      cy.get("#autocomplete-0").blur();
      cy.get(".autocomplete").should(
        "not.have.descendants",
        ".autocomplete-item"
      );
    });

    it("can change settings on the fly", function() {
      cy.get("#autocomplete-0").then(function(el) {
        el.tinyAutocomplete({
          maxItems: 2
        });
      });
    });
  });
});
