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