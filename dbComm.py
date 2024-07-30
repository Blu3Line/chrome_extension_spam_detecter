from pymongo import MongoClient, errors
from datetime import datetime
client = MongoClient('mongodb://localhost:27017/')
db = client['email_spam_detecter']
collection = db['feedbacks']
collection.create_index([('mail_id', 1)], unique=True)

# Yeni veri girişini veritabanına ekler
def insert_feedback(mail_id, email, label, lang):
    try:
        collection.insert_one({'mail_id': mail_id, 'email': email, 'label': label, 'lang': lang, 'insert_date': datetime.now()})
        return True
    except errors.DuplicateKeyError:
        print("DEBUG: Hata: Bu mail_id zaten mevcut.")
        return False


