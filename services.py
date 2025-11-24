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
