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
