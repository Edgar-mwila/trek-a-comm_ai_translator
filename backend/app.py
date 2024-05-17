from flask import Flask, request, jsonify, send_file
import speech_recognition as sr
from translate import Translator
from gtts import gTTS
import time
from pydub import AudioSegment
from pydub.utils import which
import io
import os

app = Flask(__name__)

def translate_text(text, dest_language):
    translator = Translator(to_lang=dest_language)
    translated = translator.translate(text)
    return translated

AudioSegment.converter = which("ffmpeg")

@app.route('/speak', methods=['POST'])
def speak():
    data = request.get_json()
    if not data or 'text' not in data or 'dest_language' not in data:
        return jsonify({"error": "Invalid request"}), 400

    text = data['text']
    dest_language = data['dest_language']

    tts = gTTS(text=text, lang=dest_language)
    timestamp = str(int(time.time()))
    filename = f"output_{timestamp}.mp3"
    filepath = os.path.join('/tmp', filename)  # Use the /tmp directory

    try:
        tts.save(filepath)
        return send_file(filepath, as_attachment=True)
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)


@app.route('/speech-to-text', methods=['POST'])
def speech_to_text():
    if 'audio_file' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio_file']

    try:
        audio_data = AudioSegment.from_file(io.BytesIO(audio_file.read()))

        audio_path = "temp_audio.wav"
        audio_data.export(audio_path, format="wav")

        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_path) as source:
            audio = recognizer.record(source)
            text = recognizer.recognize_google(audio)

        os.remove(audio_path)

        return jsonify({"text": text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    if not data or 'text' not in data or 'source_language' not in data or 'dest_language' not in data:
        return jsonify({"error": "Invalid request"}), 400

    text = data['text']
    source_language = data['source_language']
    dest_language = data['dest_language']

    try:
        translator = Translator(to_lang=dest_language, from_lang=source_language)
        translated_text = translator.translate(text)
        return jsonify({"translated_text": translated_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
