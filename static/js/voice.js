
// Get the "BACK TO VERB DRAW" button
// It will stay hidden until the voice finishes
const backBtn = document.getElementById("backBtn");


// Flag that indicates if the voice assistant
// is currently speaking
let speaking = false;


// Object that will hold the SpeechSynthesisUtterance
let utter = null;



//  BLOCK REFRESH WHILE SPEAKING
//  If the user tries to refresh the page while the voice is active,
//  the speech is cancelled and the user is redirected back to /roleta.
window.addEventListener("beforeunload", (event) => {
    if (speaking) {
        // Stop the voice instantly
        speechSynthesis.cancel();
        speaking = false;

        // Prevent staying on the same page during refresh
        history.pushState(null, "", location.href);

        // Force redirect to the verb draw (roleta)
        window.location.href = "/roleta";
    }
});



//  BLOCK BROWSER BACK BUTTON WHILE SPEAKING
//  If the user presses the BACK arrow on the browser or mobile device,
//  the speech stops and the page redirects cleanly back to /roleta.

// Create a history checkpoint so BACK button triggers popstate
history.pushState(null, "", location.href);

window.addEventListener("popstate", () => {
    // Always stop the speech immediately
    speechSynthesis.cancel();
    speaking = false;

    // Redirect back to roleta WITHOUT keeping old data
    window.location.href = "/roleta";
});



//  AUTO-START VOICE READING ON PAGE LOAD
window.addEventListener("DOMContentLoaded", () => {

    // Mark that speech is active
    speaking = true;

    // Build a natural sentence list: "I go. You go. He goes..."
    const text = conjugations
        .map(item => `${item.pronoun} ${item.conjugation}`)
        .join(". ");

    // Configure voice parameters
    utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";      // Professional English voice
    utter.pitch = 1.0;         // Natural pitch
    utter.rate = 0.70;         // Slightly slower for clarity
    utter.volume = 1.0;        // Full volume

    // When the voice finishes normally
    utter.onend = () => {
        speaking = false;

        // Now the back button can appear
        backBtn.style.display = "block";
    };

    // Start speaking
    speechSynthesis.speak(utter);
});



//  MANUAL BACK BUTTON — ONLY WORKS AFTER SPEAKING ENDS
backBtn.onclick = () => {
    if (!speaking) {
        // Stop any pending speech (extra safety)
        speechSynthesis.cancel();

        // Navigate back to roleta
        window.location.href = "/roleta";
    }
};
