context("Assertions", function() {
  var urls = ["zepto-1.html", "jquery-2.html", "jquery-3.html"];
  describe("Interactions", function() {
    urls.forEach(function(page) {
      var url = "http://localhost:8080/testfiles/" + page;

      it("should be initialized on " + page, function() {
        cy.visit(url);
        cy.get("#autocomplete-0").should("have.class", "autocomplete-field");
      });

      it(
        "finds the correct amount of matches in flat list on " + page,
        function() {
          cy.visit(url);
          cy.get("#autocomplete-0").type("sou");
          cy.get(".autocomplete-item").should("have.length", 5);
        }
      );

      it("marks hits as <strong> on " + page, function() {
        cy.visit(url);
        cy.get("#autocomplete-0").type("blå");

        cy.get(".autocomplete-item:last").should("have.descendants", "strong");
        cy.get(".autocomplete-item:first").should(
          "not.have.descendants",
          "strong"
        );
      });

      it(
        "runs the supplied function when an item is clicked on " + page,
        function() {
          cy.visit(url);
          cy.get("#autocomplete-0").type("blå");
          cy.get(".autocomplete-item:last").click();
          cy.get(".results").should("contain", "Blåmes");
        }
      );

      it(
        "can navigate with keyboard and closes the list on escape on " + page,
        function() {
          cy.visit(url);
          cy.get("#autocomplete-0").type("blå");
          cy.wait(400);
          cy.get("#autocomplete-0").type("{downarrow}{downarrow}{uparrow}");
          cy.get(".autocomplete-item.active").should(
            "contain",
            "Southern Screamer"
          );
          cy.get("#autocomplete-0").type("{esc}");
          cy.get(".autocomplete-item").should("not.exist");
        }
      );

      it("can select an item using keyboard on " + page, function() {
        cy.visit(url);
        cy.get("#autocomplete-0").type("blå");
        cy.wait(400);
        cy.get("#autocomplete-0").type("{downarrow}{downarrow}{enter}");
        cy.get(".results").should("contain", "Horned Screamer");
        cy.get(".autocomplete-item").should("not.exist");
      });

      it("closes the list on blur on " + page, function() {
        cy.visit(url);
        cy.get("#autocomplete-0").type("sou");
        cy.get(".autocomplete-item").should("have.length", 5);

        // Pre-blur
        cy.get(".autocomplete").should(
          "have.descendants",
          ".autocomplete-item"
        );

        // Post-blur
        cy.get("#autocomplete-0").blur();
        cy.get(".autocomplete").should(
          "not.have.descendants",
          ".autocomplete-item"
        );
      });
    });
  });
});
