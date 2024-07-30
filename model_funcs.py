import joblib
import re
import numpy as np

model = joblib.load(open('LR_ML_modelim.pkl', 'rb'))  
'''
Modelin yapması gerekenler sırayla:
1) preprocess işlemini yap (alınan text verisini)
2) tfidf vector dönüşümü yap (preprocess edilmiş text verisini)
3) model.predict işlemi yap (tfidf vector dönüşümü yapılmış text verisini)
4) predicti artık nasıl kullanmak istiyorsan ona göre kullanabilirsin
'''

import spacy
nlp = spacy.load('en_core_web_sm')

from nltk.corpus import stopwords
stop_words = stopwords.words('english')
stop_words.extend(['fw', 'mw', 'enron', 'ect', 'hou', 'e', 'cc', 'de', 'j', 'l','b', 'c', '>', '|'])


def text_preprocess_vectorize(text, prmt_glove):

    tokens = []
    text = nlp(text)
    for token in text:
        if token.text.lower() in stop_words:
            continue
        if token.is_punct : 
            continue
        if token.is_space: #yeni eklendi lets go 
            continue
        if token.is_digit: 
            continue
        
        tokens.append(token.lemma_.lower())
    print("debug tokenları görek:", tokens)
    return prmt_glove.get_mean_vector(tokens)

def clean_data(text):
    '''Make text lowercase, remove text in square brackets, remove punctuation and remove words containing numbers.'''
    '''remove links and put URL keyword instead of it'''
    '''remove html tags'''
    "sıraları önemli bu arada"
    text = re.sub('<.*?>', ' ', text)
    text = re.sub(r'https?://\S+|www\.\S+', 'URL', text)
    text = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', 'email', text)
    text = re.sub('[\r\n\xa0]', ' ', text)
    text = re.sub('\w*\d\w*', ' ', text)
    
    #aralarda boşluklar vs. oluyor benim spacy haklarından gelir  bunların merak etme sonra düzeltiriz onları
    return text


def check_spam_func(text, prmt_glove):
    text = text_preprocess_vectorize(text, prmt_glove)
    text_2d = np.stack([text])
    pred = model.predict(text_2d)[0]
    print(pred, ": pythondaki prediction değeri")
    if pred == 1:
        return True
    else:
        return False
