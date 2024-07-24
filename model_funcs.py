import pickle
import re
import string
TfidfVectorCelo = pickle.load(open('tfidfVectorCelo.pkl', 'rb'))  
model = pickle.load(open('mnbModelim.pkl', 'rb'))  
'''
Modelin yapması gerekenler sırayla:
1) preprocess işlemini yap (alınan text verisini)
2) tfidf vector dönüşümü yap (preprocess edilmiş text verisini)
3) model.predict işlemi yap (tfidf vector dönüşümü yapılmış text verisini)
4) predicti artık nasıl kullanmak istiyorsan ona göre kullanabilirsin
'''

from nltk.corpus import stopwords
import nltk
from nltk.stem import PorterStemmer
nltk.download('stopwords')
nltk.download('punkt')
ps = PorterStemmer()

import string
# Lowercase transformation and text preprocessing function
def transform_text(text):
    # Transform the text to lowercase
    text = text.lower()
    
    # Tokenization using NLTK
    text = nltk.word_tokenize(text)
    
    # Removing special characters
    y = []
    for i in text:
        if i.isalnum():
            y.append(i)
            
    # Removing stop words and punctuation
    text = y[:]
    y.clear()
    
    # Loop through the tokens and remove stopwords and punctuation
    for i in text:
        if i not in stopwords.words('english') and i not in string.punctuation:
            y.append(i)
        
    # Stemming using Porter Stemmer
    text = y[:]
    y.clear()
    for i in text:
        y.append(ps.stem(i))
    
    # Join the processed tokens back into a single string
    return " ".join(y)    

def clean_data(text):
    '''Make text lowercase, remove text in square brackets, remove punctuation and remove words containing numbers.'''
    '''remove links and put URL keyword instead of it'''
    '''remove html tags'''
    "sıraları önemli bu arada"
    text = re.sub('<.*?>', '', text)
    text = re.sub(r'https?://\S+|www\.\S+', 'URL', text)
    text = re.sub('\n | \r', '', text)
    text = re.sub('\[.*?\]', '', text)
    text = text.lower()
    text = re.sub('\w*\d\w*', '', text)
    text = re.sub('[%s]' % re.escape(string.punctuation), '', text)
    
    #aralarda boşluklar vs. oluyor benim spacy haklarından gelir  bunların merak etme sonra düzeltiriz onları
    return text


def check_spam_func(text):
    text = transform_text(text)
    text = TfidfVectorCelo.transform([text])
    pred = model.predict(text)[0]
    print(pred)
    if pred == 1:
        return True
    else:
        return False
