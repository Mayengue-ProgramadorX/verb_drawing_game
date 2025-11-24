//listen any event and loaded
document.addEventListener("DOMContentLoaded", () => {

   //get class inside de document(html)
    const slotVerb = document.getElementById("slotVerb");
    const slotTense = document.getElementById("slotTense");
    const spinBtn = document.getElementById("spin");
    const message = document.getElementById("spinMessage");
    const sound = document.getElementById("sound");

    /*This fake data is just to create that loop effect; when it's finished, 
    it retrieves the data coming from the backend. */
    const fakeVerbs = ["run", "eat", "go", "play", "study", "write"];
    const fakeTenses = ["simple present", "simple past", "future", "continuous"];

    //when click button spin call event click and arrow function
    spinBtn.addEventListener("click", () => {

        // The sound starts at the same time as when it is clicked button spin.
        sound.currentTime = 0;
        sound.play();

        message.textContent = "🎡Spinning..."; //show this messagem after click button spin
        spinBtn.disabled = true; //disabled the button spin
        document.getElementById("btnConjugar").style.display = "none"; //hidden btn conjugate
    
        let counter = 0;
        const maxCycles = 20; // max cycles
    
        //The animation begins on the same line as the sound.
        const interval = setInterval(() => {
            counter++;
            //This will make the data random during animation to avoid repeating false data in the animation.
            slotVerb.textContent = fakeVerbs[Math.floor(Math.random() * fakeVerbs.length)];
            slotTense.textContent = fakeTenses[Math.floor(Math.random() * fakeTenses.length)];
    
            if (counter >= maxCycles) {
                clearInterval(interval);
            }
        }, 100);
    
        setTimeout(async () => {
    
            message.textContent = "";
            await fetchRandomVerbAfterSpin();
    
            sound.pause();
            sound.currentTime = 0;
    
            spinBtn.style.display = "none";
    
        }, 2500);
    });
    

});
