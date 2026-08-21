const micBtn = document.getElementById('micBtn');
const speakBtn = document.getElementById('speakBtn');
const statusText = document.getElementById('status');
const originalTextEl = document.getElementById('originalText');
const translatedTextEl = document.getElementById('translatedText');
const sourceLangSelect = document.getElementById('sourceLang');
const targetLangSelect = document.getElementById('targetLang');

let recognition;
let isRecording = false;
let currentTranslation = "";


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    isRecording = true;
    micBtn.textContent = "⏹️ थांबवा...";
    micBtn.classList.add("recording");
    statusText.textContent = "ऐकत आहे, बोला...";
  };

  recognition.onresult = async (event) => {
    const spokenText = event.results[0][0].transcript;
    originalTextEl.textContent = spokenText;
    statusText.textContent = "भाषांतर होत आहे...";

    await translateText(spokenText);
  };

  recognition.onerror = (event) => {
    statusText.textContent = "त्रुटी: " + event.error;
    resetMicButton();
  };

  recognition.onend = () => {
    resetMicButton();
  };
} else {
  alert("तुमचा ब्राऊझर Web Speech API ला सपोर्ट करत नाही. कृपया Google Chrome वापरा.");
}

function resetMicButton() {
  isRecording = false;
  micBtn.textContent = "🔴 बोलायला सुरुवात करा";
  micBtn.classList.remove("recording");
}


micBtn.addEventListener('click', () => {
  if (!recognition) return;

  if (!isRecording) {
    recognition.lang = sourceLangSelect.value;
    recognition.start();
  } else {
    recognition.stop();
  }
});


async function translateText(text) {
  const src = sourceLangSelect.value.split('-')[0];
  const tgt = targetLangSelect.value;

  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${src}|${tgt}`);
    const data = await res.json();
    
    currentTranslation = data.responseData.translatedText;
    translatedTextEl.textContent = currentTranslation;
    statusText.textContent = "पूर्ण झाले!";
    speakBtn.disabled = false;

    
    speakTranslation(currentTranslation, tgt);
  } catch (error) {
    statusText.textContent = "भाषांतर करताना अडचण आली.";
    console.error(error);
  }
}


function speakTranslation(text, lang) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }
}

speakBtn.addEventListener('click', () => {
  if (currentTranslation) {
    speakTranslation(currentTranslation, targetLangSelect.value);
  }
});


document.addEventListener('contextmenu', (e) => e.preventDefault());

document.onkeydown = function(e) {
  if (e.keyCode == 123) { return false; } // F12
  if (e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'J'.charCodeAt(0))) { return false; }
  if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { return false; }
};