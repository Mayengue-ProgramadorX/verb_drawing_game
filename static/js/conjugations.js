/**
 * Loads all conjugations from backend and inserts them into the HTML list
 */
async function loadConjugations() {

    // Fetch conjugations for the selected verb & tense
    const res = await fetch(`/api/conjugations?verb=${verb}&tense=${tense}`);
    const data = await res.json();

     
    const list = document.getElementById("listaConjugacoes");
    list.innerHTML = ""; // Clear previous content

    /**
     * 'data.conjugations' must contain objects like:
     * { pronoun: "I", conjugation: "I help" }
     *
     * We will separate the pronoun and the verb for better styling.
     */
    data.conjugations.forEach(item => {

        // Create a new list element
        const li = document.createElement("li");

        // Build HTML with pronoun + conjugation text
        li.innerHTML = `
            <b class="pronoun">${item.pronoun}:</b>
            <span class="conj">${item.conjugation}</span>
        `;

        // Add to the list
        list.appendChild(li);
    });
}

// Load the conjugations immediately when script runs
loadConjugations();
