from flask import Flask
import subprocess

app = Flask(__name__)

@app.route('/run-inventory', methods=['GET'])
def run_inventory():
    subprocess.Popen(['python', 'run_inventory.py'])
    return {"status": "Inventory script started"}, 200

if __name__ == '__main__':
    app.run(port=5001)
