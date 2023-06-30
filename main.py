from fastapi import FastAPI, Request, File, UploadFile
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from werkzeug.utils import secure_filename
from pydantic import BaseModel
from modeler.pdfaudio import extract_text, speaks
import base64
import os
import uvicorn
import tempfile

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

tmp_dir = tempfile.gettempdir()

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/convert", response_class=HTMLResponse)
async def convert(request: Request):
    return templates.TemplateResponse("intento.html", {"request": request})

@app.get("/downland", response_class=HTMLResponse)
async def convert(request: Request):
    return templates.TemplateResponse("content.html", {"request": request})

@app.post('/display')
async def display_file(request: Request, file: UploadFile = File(...)):
    contents = await file.read()
    filename = secure_filename(file.filename)
    books = os.path.join(tmp_dir, filename)
    with open(books, "wb") as f:
        f.write(contents)
    with open(books, "rb") as f:
        mytext = extract_text(f)
        audio = speaks(mytext)
        encoded = base64.b64encode(audio)
    return templates.TemplateResponse("layout.html", {"request": request, "value": encoded, "books": filename})

@app.get('/send_doc/{filename}')
async def send_doc(filename: str):
    filepath = os.path.join(tmp_dir, filename)
    return FileResponse(filepath, media_type="application/pdf", filename=filename, headers={"Content-Disposition": "inline"})

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=80)
