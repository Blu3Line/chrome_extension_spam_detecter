#backend yapısı
from flask import Flask, request, jsonify
from flask_cors import CORS
from model_funcs import check_spam_func

app = Flask(__name__)
CORS(app)

@app.route('/check_spam', methods=['POST'])
def check_spam():
    data = request.json
    content = data['content']
    print("kral")
    prediction = check_spam_func(content)
    return jsonify({'is_spam': prediction})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
