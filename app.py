#backend yapısı
from flask import Flask, request, jsonify
from flask_cors import CORS
from model_funcs import check_spam_func, clean_data, transform_text

app = Flask(__name__)
CORS(app)

@app.route('/check_spam', methods=['POST'])
def check_spam():
    data = request.json
    content = data['content']
    print("kral")
    prediction = check_spam_func(content)
    return jsonify({'is_spam': prediction})

@app.route('/check_spam2', methods=['POST'])
def check_spam2():
    data = request.json
    print(data['content'])
    print("\n---------------------\n")
    cleaned_data = clean_data(data['content'])
    print(transform_text(cleaned_data))
    #content = data['content']
    return jsonify({'return value': True})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
