// Stores the selected verb so it can be used on the next page
let selectedVerb = null;

// Stores the selected tense (time) so it can be used on the next page
let selectedTense = null;

// Stores whether the verb is regular or irregular
let selectedType = null;


/**
 * Fetches the random verb + tense from the backend API
 * This function is called AFTER the spinning animation ends
 */
async function fetchRandomVerbAfterSpin() {

    // Request verb + tense data from Flask API
    const res = await fetch("/api/randomverbs");

    // Convert response to JSON object
    const data = await res.json();

    // Save the values so they can be used later
    selectedVerb = data.verb;
    selectedTense = data.tense;
    selectedType = data.type;

    // Display the results on the screen
    document.getElementById("slotVerb").textContent = data.verb;
    document.getElementById("slotTense").textContent = data.tense;

    // Show the type (regular / irregular)
    document.getElementById("typeOutput").textContent = "Type: " + data.type;

    // Reveal the button to go to the conjugation page
    document.getElementById("btnConjugar").style.display = "block";
}


/**
 * Redirects the user to the conjugation page
 * It passes the selected verb and tense in the URL
 */
document.getElementById("btnConjugar").onclick = () => {
    window.location.href = `/conjugations?verb=${selectedVerb}&tense=${selectedTense}`;
};
