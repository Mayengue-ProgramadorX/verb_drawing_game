Verb Drawing Game – CS50 Final Project
Video Demo: https://youtu.be/CRkd9K4rp_8?si=FjP1hNMs3fToFqd6
Description:


1. Overview

The Verb Drawing Game is a Progressive Web App (PWA) built using Flask (Python), HTML, CSS, and JavaScript, created as my Final Project for CS50.

Its purpose is to help English learners practice verb conjugation in a fun and interactive way. The system works like a small slot machine: the user clicks Spin, the game randomly selects a verb and a tense, and then the user clicks Conjugate to hear the full spoken conjugation.

The game is fully responsive and works on:

Android phones

iPhones and iPads

Windows and Mac

Tablets

ChromeOS

As an installed PWA (offline support)

The application uses:

Flask for routing and backend logic

SQLite (via Python services) for verb and tense storage

PWA technologies for installation support

Web Speech API for voice assistant

Custom navigation blocking to prevent accidental exits during voice reading


2. Motivation

I wanted a project that was:

Educational

Fun

Technically challenging

Useful for real English learners

A great demonstration of full-stack skills

Many apps teach verbs, but not in a dynamic game-like experience with voice reading and real-time conjugation.
This project merges language learning, UI/UX design, web APIs, and Flask backend engineering in a cohesive experience.


3. How the Game Works
Step 1: User opens the main menu (index.html)

They can choose:

Start Game

About

Close Game (with PWA logic)

Step 2: User enters the Game Screen

The game shows:

A verb slot

A tense slot

"Spin" button

Hidden "Conjugate" button

Step 3: Random verb and tense appear

Data is fetched from the backend API:
/api/randomverbs

Step 4: User clicks Conjugate

The page loads:
/api/conjugations?verb=${verb}&tense=${tense}

Step 5: Speech starts automatically

The Web Speech API:

Speaks all conjugations in English

Slows down pace for clarity

Blocks navigation during reading

Only shows return button when finished


4. Backend Structure
app.py (Controller layer)

Handles:

Home page

Game page

About page

Conjugation page

API endpoints

JSON responses

services.py (Service layer)

Contains:

DB connection

SQL queries

Random verb generator

Conjugation fetch functions

templates folder

Includes:

index.html

about.html

roleta.html

conjugations.html

static folder

Contains:

CSS

JavaScript

Icons

Audio


5. PWA Features

This project includes complete PWA support:

✔ manifest.json
✔ multiple icon sizes
✔ Apple splash compatibility
✔ theme-color
✔ Web App mode
✔ "Add to Home Screen" support
✔ Offline support structure ready


6. Design Decisions
Why Flask?

Lightweight

Easy routing

Simple templating

Great for small–medium apps

Why PWA?

Runs like a native app

Works offline

Full-screen mode

Better experience for language learners

Why Web Speech API?

Helps with pronunciation

More interactive

Works across modern browsers

Why block browser navigation?

Prevents voice continuation on wrong page

Keeps flow consistent

Provides better user experience


7. Complete File Documentation

Below I include all files in the project.


init_tables.sql

--tables for the verbs
CREATE TABLE IF NOT EXISTS verbs(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verb TEXT NOT NULL,
    type TEXT NOT NULL
);

--tables for verb tenses
CREATE TABLE IF NOT EXISTS tenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);


-- tables for conjugations verbs
CREATE TABLE IF NOT EXISTS conjugations (
id INTEGER PRIMARY KEY AUTOINCREMENT,
verb_id INTEGER NOT NULL,
tense_id INTEGER NOT NULL,
conjugation TEXT NOT NULL,
FOREIGN KEY (verb_id) REFERENCES verbs(id),
FOREIGN KEY (tense_id) REFERENCES tenses(id)
);


app.py

from flask import Flask, jsonify, render_template, request
from services import get_random_verb_tense, get_conjugations

app = Flask(__name__)

# HOME PAGE
@app.route("/")
def index():
    return render_template("index.html")


# ABOUT PAGE
@app.route("/about")
def about():
    return render_template("about.html")


# VERB SPINNING PAGE
@app.route("/roleta")
def roleta():
    return render_template("roleta.html")


# CONJUGATION PAGE
@app.route("/conjugations")
def conjugations_page():
    verb = request.args.get("verb")
    tense = request.args.get("tense")

    rows = get_conjugations(verb, tense)
    final_list = []

    for r in rows:
        try:
            pronoun, conj = r.split(" ", 1)
        except ValueError:
            pronoun = ""
            conj = r
        final_list.append({
            "pronoun": pronoun,
            "conjugation": conj
        })

    return render_template(
        "conjugations.html",
        verb=verb,
        tense=tense,
        conjugations=final_list
    )


# API — RANDOM VERB + TENSE
@app.route("/api/randomverbs", methods=["GET"])
def api_random_verb():
    result = get_random_verb_tense()
    if not result:
        return jsonify({"error": "No data found"}), 500

    verb_id, verb, verb_type, tense_id, tense_name = result
    return jsonify({
        "verb": verb,
        "type": verb_type,
        "tense": tense_name
    })


# API — CONJUGATIONS FOR VOICE
@app.route("/api/conjugations", methods=["GET"])
def api_conjugations():
    verb = request.args.get("verb")
    tense = request.args.get("tense")

    rows = get_conjugations(verb, tense)
    final = []

    for r in rows:
        try:
            pronoun, conj = r.split(" ", 1)
        except ValueError:
            pronoun = ""
            conj = r
        final.append({
            "pronoun": pronoun,
            "conjugation": conj
        })

    return jsonify({"conjugations": final})


# START SERVER
if __name__ == "__main__":
    app.run(debug=True)


services.py


import sqlite3
from db import connect_DB


# GET RANDOM VERB + TENSE
def get_random_verb_tense():
    """
    Returns a tuple with:
    (verb_id, verb, verb_type, tense_id, tense_name)
    """
    try:
        conn = connect_DB()
        cur = conn.cursor()

        # Get random verb
        cur.execute("SELECT id, verb, type FROM verbs ORDER BY RANDOM() LIMIT 1")
        verb_row = cur.fetchone()
        if not verb_row:
            return None

        # Get random tense
        cur.execute("SELECT id, name FROM tenses ORDER BY RANDOM() LIMIT 1")
        tense_row = cur.fetchone()
        if not tense_row:
            return None

        return (
            verb_row["id"],
            verb_row["verb"],
            verb_row["type"],
            tense_row["id"],
            tense_row["name"]
        )

    except sqlite3.Error as e:
        print("Error fetching random verb/tense:", e)
        return None

    finally:
        try:
            conn.close()
        except:
            pass


# GET CONJUGATIONS
def get_conjugations(verb_name, tense_name):
    """
    Returns a list of conjugations for a given verb and tense.
    Ensures:
        - No duplicates
        - Correct order (by id)
    """
    try:
        conn = connect_DB()
        cur = conn.cursor()

        cur.execute("""
            SELECT DISTINCT c.conjugation
            FROM conjugations c
            JOIN verbs v ON c.verb_id = v.id
            JOIN tenses t ON c.tense_id = t.id
            WHERE v.verb = ? AND t.name = ?
            ORDER BY c.id
        """, (verb_name, tense_name))

        rows = cur.fetchall()

        # Remove duplicates safely (in case DB has issues)
        seen = set()
        result = []
        for row in rows:
            conj = row["conjugation"]
            if conj not in seen:
                seen.add(conj)
                result.append(conj)

        return result

    except sqlite3.Error as e:
        print("Error fetching conjugations:", e)
        return []

    finally:
        try:
            conn.close()
        except:
            pass



'''# TEST: RANDOM VERB + RANDOM TENSE + CONJUGATIONS

result = get_random_verb_tense()

if result:
    verb_id, verb, verb_type, tense_id, tense_name = result

    print("\n=== RANDOM VERB SELECTED ===")
    print("Verb:", verb)
    print("Type:", verb_type)
    print("Tense:", tense_name)

    print("\n=== CONJUGATIONS ===")
    conjugations = get_conjugations(verb, tense_name)

    for c in conjugations:
        print(c)
else:
    print("Error: No verb returned.") '''


db.py

#this part for connect database with servidor
import sqlite3

DB_PATH = "./database/basedados.db"

#criar conexao
def connect_DB():
    try: #try connect
       conn = sqlite3.connect(DB_PATH)
       conn.row_factory = sqlite3.Row #return row like in dictionary
       print("Successfully connected to the bank!")
       return conn

    except sqlite3.Error as e:
        print("Error connecting to the database:",e)
        return None

#connect_DB() #I only called the function to show me if it connects or not.
#print("\n")


index.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verb drawing game</title>
  <link rel="icon" type="image/png" href="/static/icons/favicon.png">


  <!-- PWA Meta Tags -->
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="theme-color" content="#0073ff">

  <!-- Icons -->
  <link rel="apple-touch-icon" href="/static/icons/icon-192.png">
  <link rel="icon" sizes="192x192" href="/static/icons/icon-192.png">
  <link rel="manifest" href="{{ url_for('static', filename='manifest.json') }}">


  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

  <link rel="stylesheet" href="/static/css/index.css">
</head>

<body class="menu-body">

  <!-- MAIN MENU -->
  <div class="menu-container">
    <h1>📚🎰Verbs Drawing Game</h1>

    <button onclick="window.location.href='{{ url_for('roleta') }}'">Start Game</button>
    <button onclick="window.location.href='{{ url_for('about') }}'">About</button>
    <button onclick="exitApp()" data-key="exit">Close game</button>
  </div>

  <script>
    /**
     * exitApp()
     * Safely closes the game depending on the platform:
     * - PWA installed → closes the app
     * - Mobile browser → tries to close the tab
     * - Desktop browser → tries to close the tab
     */
    function exitApp() {

      // ✔ If running as a PWA app
      if (window.matchMedia("(display-mode: standalone)").matches) {
          // iOS, Android, Desktop PWA
          console.log("Closing PWA...");
          window.close();
          return;
      }

      // ✔ Normal browser fallback
      console.log("Trying to close browser tab...");
      window.open('', '_self');  // required for some browsers
      window.close();

      // If window did not close (Chrome blocks sometimes)
      alert("Cannot close automatically.\nPlease close the tab manually.");
    }
  </script>

  <script>
    // Register the Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/static/service-worker.js")
        .then(() => console.log("Service Worker Registered!"))
        .catch(err => console.log("Service Worker failed:", err));
    }
  </script>

</body>
</html>


roleta.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verb Drawing Game</title>
  <link rel="icon" type="image/png" href="/static/icons/favicon.png">

  <!-- PWA Meta Tags -->
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="theme-color" content="#0073ff">

  <link rel="apple-touch-icon" href="/static/icons/icon-192.png">
  <link rel="manifest" href="{{ url_for('static', filename='manifest.json') }}">


  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <link rel="stylesheet" href="/static/css/roleta.css">
</head>

<body>

  <div class="container" id="roleta-container">

    <h1>🎰 Verb Drawing Game</h1>

    <div class="roletas">
      <div id="slotVerb" class="roleta">?</div>
      <div id="slotTense" class="roleta">?</div>
    </div>

    <p id="spinMessage"></p>

    <button id="spin">Spin 🎲</button>

    <div id="typeOutput"></div>

    <button id="btnConjugar" style="display:none;">Conjugate</button>

    <button id="btnback" onclick="window.location.href='{{ url_for('index') }}'">⬅ Menu</button>

  </div>

  <audio id="sound" src="/static/sound/spin.mp3"></audio>

  <script src="/static/js/animation.js"></script>
  <script src="/static/js/roleta.js"></script>
</body>
</html>


conjugations.html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Conjugations</title>
    <link rel="icon" type="image/png" href="/static/icons/favicon.png">

    <!-- PWA Meta -->
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="theme-color" content="#0073ff">

    <link rel="apple-touch-icon" href="/static/icons/icon-192.png">
    <link rel="manifest" href="{{ url_for('static', filename='manifest.json') }}">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="/static/css/conjugations.css">
</head>

<body>

<div class="card">
    <p class="label">Verb: <span class="verb">{{ verb }}</span></p>
    <p class="label">State: <span class="tense">{{ tense }}</span></p>

    <h2>Conjugations:</h2>

    <ul id="listaConjugacoes" class="conj-list"></ul>

    <button class="btn back" id="backBtn" style="display:none;">
        BACK TO VERB DRAW
    </button>
</div>

<script>
    const verb = "{{ verb }}";
    const tense = "{{ tense }}";
    const conjugations = {{ conjugations|tojson }};
</script>

<script src="/static/js/conjugations.js"></script>
<script src="/static/js/voice.js"></script>

</body>
</html>


static/js/roleta.js

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


static/js/voice.js


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


static/js/conjugations.js

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


static/service-worker.js

// CACHE NAME
const CACHE_NAME = "verb-game-cache-v1";

// FILES TO CACHE OFFLINE
const FILES_TO_CACHE = [
  "/",
  "/roleta",
  "/about",
  "/static/css/index.css",
  "/static/css/about.css",
  "/static/css/roleta.css",
  "/static/css/conjugations.css",
  "/static/js/animation.js",
  "/static/js/roleta.js",
  "/static/js/conjugations.js",
  "/static/js/voice.js",
  "/static/icons/icon-192.png",
  "/static/icons/icon-512.png",
  "/static/sound/spin.mp3"
];

// INSTALL SW
self.addEventListener("install", (event) => {
  console.log("Service Worker installed!");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// ACTIVATE SW
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated!");
  event.waitUntil(self.clients.claim());
});

// FETCH (offline support)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cache OR fetch from internet
      return cached || fetch(event.request);
    })
  );
});


static/manifest.json

{
    "name": "Verb Drawing Game",
    "short_name": "VerbGame",
    "description": "A fun English verb conjugation learning game!",
    "start_url": "/",
    "scope": "/",
    "display": "standalone",
    "background_color": "#1b1f25",
    "theme_color": "#0073ff",
    "orientation": "portrait-primary",

    "icons": [
      {
        "src": "/static/icons/favicon.png",
        "sizes": "48x48",
        "type": "image/png"
      },
      {
        "src": "/static/icons/icon-72.png",
        "sizes": "72x72",
        "type": "image/png"
      },
      {
        "src": "/static/icons/icon-96.png",
        "sizes": "96x96",
        "type": "image/png"
      },
      {
        "src": "/static/icons/icon-128.png",
        "sizes": "128x128",
        "type": "image/png"
      },
      {
        "src": "/static/icons/icon-192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/static/icons/icon-256.png",
        "sizes": "256x256",
        "type": "image/png"
      },
      {
        "src": "/static/icons/icon-384.png",
        "sizes": "384x384",
        "type": "image/png"
      },
      {
        "src": "/static/icons/icon-512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }


  8. Conclusion

This project represents everything I learned in CS50:

Python

HTML

JavaScript

Backend/API logic

UI/UX

Browser APIs

Web application architecture

PWA technology

I am proud of this final result and hope it can help others learn English more effectively.
Thank you for reviewing my CS50 Final Project!
