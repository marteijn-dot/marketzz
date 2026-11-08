"""Start Marketzz on this laptop only, using Python 3."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import webbrowser

root = Path(__file__).resolve().parent
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
try:
    server = ThreadingHTTPServer(("127.0.0.1", 8765), handler)
except OSError as error:
    print("Kan poort 8765 niet openen. Sluit een eerder gestart servervenster.")
    print(error)
    raise SystemExit(1)
url = "http://127.0.0.1:8765"
print("Marketzz draait op " + url)
print("Laat dit venster open. Stop met Ctrl+C.")
threading.Timer(0.5, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
