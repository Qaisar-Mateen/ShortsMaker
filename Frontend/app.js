const videoSubject = document.querySelector("#videoSubject");
const aiModel = document.querySelector("#aiModel");
const voice = document.querySelector("#voice");
const zipUrl = document.querySelector("#zipUrl");
const paragraphNumber = document.querySelector("#paragraphNumber");
const youtubeToggle = document.querySelector("#youtubeUploadToggle");
const useMusicToggle = document.querySelector("#useMusicToggle");
const customPrompt = document.querySelector("#customPrompt");
const generateButton = document.querySelector("#generateButton");
const cancelButton = document.querySelector("#cancelButton");
const advancedOptionsToggle = document.querySelector("#advancedOptionsToggle");
const musicType = document.querySelector("#musicType");


function checkMusicToggle() {
  const useMusicToggle = document.querySelector("#useMusicToggle");
  const musicOptions = document.querySelector("#musicOptions");

  if (useMusicToggle.checked) {
    musicOptions.classList.remove("hidden");
  } else {
    musicOptions.classList.add("hidden");
  }
}
setInterval(checkMusicToggle, 350);


function checkTYToggle() {
  const youtubeOptions = document.querySelector("#youtubeOptions");
  
  if (youtubeToggle.checked) {
    youtubeOptions.classList.remove("hidden");
  } else {
    youtubeOptions.classList.add("hidden");
  }
}
setInterval(checkTYToggle, 350);


advancedOptionsToggle.addEventListener("click", () => {
  // Change Emoji, from ▼ to ▲ and vice versa
  const emoji = advancedOptionsToggle.textContent;
  advancedOptionsToggle.textContent = emoji.includes("▼")
    ? "Hide Advance Options ▲"
    : "Show Advance Options ▼";
  const advancedOptions = document.querySelector("#advancedOptions");
  advancedOptions.classList.toggle("hidden");
});




const cancelGeneration = () => {
  console.log("Canceling generation...");
  if (window.progressSource) {
    window.progressSource.close();
  }
  // Send request to /cancel
  fetch("http://localhost:8080/api/cancel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      console.log(data);
    })
    .catch((error) => {
      alert("An error occurred. Please try again later.");
      console.log(error);
    });

  // Hide cancel button
  cancelButton.classList.add("hidden");

  // Enable generate button
  generateButton.disabled = false;
  generateButton.classList.remove("hidden");
};

function startProgressListener() {
  // Close any existing connection
  if (window.progressSource) {
    window.progressSource.close();
  }

  window.progressSource = new EventSource("http://localhost:8080/api/progress");
  window.progressSource.onmessage = (event) => {
    console.log("Progress:", event.data);
    cancelButton.textContent = `Cancel [${event.data}]`;
  };
}

const generateVideo = () => {
  console.log("Generating video...");
  

  // Disable button and change text
  generateButton.disabled = true;
  generateButton.classList.add("hidden");

  // Show cancel button
  cancelButton.classList.remove("hidden");

  // Get values from input fields
  const videoSubjectValue = videoSubject.value;
  const aiModelValue = aiModel.value;
  const voiceValue = voice.value;
  const musicTypeValue = musicType.value;
  const paragraphNumberValue = paragraphNumber.value;
  const youtubeUpload = youtubeToggle.checked;
  const useMusicToggleState = useMusicToggle.checked;
  const threads = document.querySelector("#threads").value;
  const zipUrlValue = zipUrl.value;
  const customPromptValue = customPrompt.value;
  const subtitlesPosition = document.querySelector("#subtitlesPosition").value;
  const colorHexCode = document.querySelector("#subtitlesColor").value;
  const visibility = document.querySelector("#videoStatus").value;
  const category = document.querySelector("#videoCategory").value;


  const url = "http://localhost:8080/api/generate";

  // Construct data to be sent to the server
  const data = {
    videoSubject: videoSubjectValue,
    aiModel: aiModelValue,
    voice: voiceValue,
    musicType: musicTypeValue,
    paragraphNumber: paragraphNumberValue,
    automateYoutubeUpload: youtubeUpload,
    useMusic: useMusicToggleState,
    zipUrl: zipUrlValue,
    threads: threads,
    subtitlesPosition: subtitlesPosition,
    customPrompt: customPromptValue,
    color: colorHexCode,
    visibility: visibility,
    vidCategory: category
  };
  startProgressListener();
  // Send the actual request to the server
  fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      alert(data.message);
      // Hide cancel button after generation is complete
      generateButton.disabled = false;
      generateButton.classList.remove("hidden");
      cancelButton.classList.add("hidden");
    })
    .catch((error) => {
      alert("An error occurred. Please try again later.");
      console.log(error);
    });
};

generateButton.addEventListener("click", generateVideo);
cancelButton.addEventListener("click", cancelGeneration);

videoSubject.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    generateVideo();
  }
});

// Load the data from localStorage on page load
document.addEventListener("DOMContentLoaded", (event) => {
  const voiceSelect = document.getElementById("voice");
  const storedVoiceValue = localStorage.getItem("voiceValue");

  if (storedVoiceValue) {
    voiceSelect.value = storedVoiceValue;
  }

  fetch("http://localhost:8080/api/songs").then(response => response.json())
    .then(songs => {
      // Clear existing options
      musicType.innerHTML = '';

      // Add a default option
      const defaultOption = document.createElement('option');
      defaultOption.value = 'random';
      defaultOption.textContent = 'Random';
      musicType.appendChild(defaultOption);

      // Add options for each song
      songs.forEach(song => {
        const option = document.createElement('option');
        option.value = song;
        option.textContent = song.replace('.mp3', '');
        musicType.appendChild(option);
      });
    })
    .catch(error => console.error('Error fetching songs:', error));

});

// Save the data to localStorage when the user changes the value
toggles = ["youtubeUploadToggle", "useMusicToggle", "reuseChoicesToggle"];
fields = ["aiModel", "voice", "musicType", "videoStatus", "paragraphNumber", "videoSubject", "customPrompt", "threads", "subtitlesPosition", "subtitlesColor"];

document.addEventListener("DOMContentLoaded", () => {
  toggles.forEach((id) => {
    const toggle = document.getElementById(id);
    const storedValue = localStorage.getItem(`${id}Value`);
    const storedReuseValue = localStorage.getItem("reuseChoicesToggleValue");

    if (toggle && storedValue !== null && storedReuseValue === "true") {
        toggle.checked = storedValue === "true";
    }
    // Attach change listener to update localStorage
    toggle.addEventListener("change", (event) => {
        localStorage.setItem(`${id}Value`, event.target.checked);
    });
  });

  fields.forEach((id) => {
    const select = document.getElementById(id);
    const storedValue = localStorage.getItem(`${id}Value`);
    const storedReuseValue = localStorage.getItem("reuseChoicesToggleValue");

    if (storedValue && storedReuseValue === "true") {
      select.value = storedValue;
    }
    // Attach change listener to update localStorage
    select.addEventListener("change", (event) => {
      localStorage.setItem(`${id}Value`, event.target.value);
    });
  });
});
