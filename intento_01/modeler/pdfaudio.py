import PyPDF2
from gtts import gTTS
from io import BytesIO

def func(value):
    return ''.join(value.splitlines())
    
def extract_text(file):
  if file != None:
    pdfReader = PyPDF2.PdfFileReader(file)
    global mytext
    mytext = ""
    for pageNum in range(pdfReader.numPages):
      pageObj = pdfReader.getPage(pageNum)
      mytext += pageObj.extractText()
    file.close()
    mytext = func(mytext)
    return mytext
    

def speak_text(mytex, path):

  mytex = gTTS(text = str(mytext),lang='es',slow = False)
  mytex.save(path)

#
def speaks(mytext):
    mp3_fp = BytesIO()
    tts = gTTS(text = str(mytext),lang='es',slow = False)
    tts.write_to_fp(mp3_fp)
    mp3_fp.read()
    return mp3_fp.getbuffer().tobytes()


