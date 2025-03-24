import speech_recognition as sr
import keyboard
import time

def main():
    recognizer = sr.Recognizer()
    microphone = sr.Microphone()
    
    def callback(recognizer, audio):
        try:
            text = recognizer.recognize_google(audio)
            print("You said:", text)
        except sr.UnknownValueError:
            print("Could not understand audio.")
        except sr.RequestError as e:
            print("Error with the API; {0}".format(e))
    
    print("Listening in background... Press 's' to stop listening.")
    stop_listening = recognizer.listen_in_background(microphone, callback)
    
    # Wait until the user presses 's'
    while True:
        if keyboard.is_pressed('s'):
            stop_listening(wait_for_stop=False)
            print("Stopped listening.")
            break
        time.sleep(0.1)

if __name__ == "__main__":
    main()
