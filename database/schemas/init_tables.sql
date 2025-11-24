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