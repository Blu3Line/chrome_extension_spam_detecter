#backend yapısı
from flask import Flask, request, jsonify
from flask_cors import CORS
from dbComm import insert_feedback
from model_funcs import check_spam_func, clean_data

app = Flask(__name__)
CORS(app)

#glove modelimizi yükleyelim
from gensim.models import KeyedVectors
print("glove modeli yükleniyor...")
glove_model = KeyedVectors.load_word2vec_format("glove.6B.300d.txt.word2vec", binary=False)
print("glove modeli yüklendi.")

@app.route('/check_spam', methods=['POST'])
def check_spam():
    print("PY DEBUG: popup için python fonksiyonu çalıştı (check_spam func)")
    data = request.json
    cleaned_data = clean_data(data['content'])
    prediction = check_spam_func(cleaned_data, glove_model)
    return jsonify({'is_spam': prediction})

@app.route('/check_spam2', methods=['POST'])
def check_spam2():
    print("PY DEBUG: diğer python fonksiyonu çalıştı (check_spam2 func)")

    data = request.json
    #şimdilik sadece contenti alsın normalde diğer bilgiler de var belki işine yarar
    #print(data['content'])
    #print("\n---------------------\n")
    cleaned_data = clean_data(data['content'])
    #print(transform_text(cleaned_data))
    
    prediction = check_spam_func(cleaned_data, glove_model)
    print("PY DEBUG: prediction=>", prediction)
    #content = data['content']
    return jsonify({'is_spam': prediction})

@app.route('/feedback', methods=['POST'])
def feedback():
    print("PY DEBUG: feedback fonksiyonu çalıştı")
    data = request.json
    
    result = insert_feedback(data['mail_id'], data['content'], data['label'], data['lang'])
    return jsonify({'is_success': result})


#realtime detection ile ilgili backend tarafı
import json
import os

# JSON dosyasının yolu
JSON_FILE = 'switch_state.json'

# JSON dosyası var mı kontrol et, yoksa oluştur
if not os.path.exists(JSON_FILE):
    with open(JSON_FILE, 'w') as f:
        json.dump({'state': False}, f)

# Switch durumunu alma
@app.route('/switch', methods=['GET'])
def get_switch_state():
    with open(JSON_FILE, 'r') as f:
        data = json.load(f)
    return jsonify(data)

# Switch durumunu güncelleme
@app.route('/switch', methods=['POST'])
def set_switch_state():
    new_state = request.json.get('state')
    with open(JSON_FILE, 'w') as f:
        json.dump({'state': new_state}, f)
    return jsonify({'state': new_state})

"""
#switch durumunu güncelleme
@app.route('switch', methods = ['POST'])
def set_switch_state():
    #veri almamıza gerek yok jsondaki neyse tersini alsın
    with open(json_path, 'r') as f:
        data = json.load(f)
    data['realTimeState'] = not data['realTimeState']
    with open(json_path, 'w') as f:
        json.dump(data, f)
    return jsonify(data)
"""

if __name__ == '__main__':
    app.run(port=5000, debug=False) #debug kaldırdım çünkü iki defa execute yapıyor app.py dosyasını
