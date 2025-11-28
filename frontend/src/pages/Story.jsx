import { Mic, MicOff, Pause, Play, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScanningAnimation } from "../components/ui/ScanningAnimation";
import "./css/Story.css";
import { useUserContext } from "../context/UserContext";

const Story = () => {
  const [pageState, setPageState] = useState("AUDIO_INPUT");
  const [story, setStory] = useState({ title: "", text: "" });
  const [displayedText, setDisplayedText] = useState([]);
  const [typewriterIndex, setTypewriterIndex] = useState(0);

  const [stream, setStream] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [message, setMessage] = useState("Click start to begin capturing");
  const [imageBlob, setImageBlob] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const [question, setQuestion] = useState("How was your day today?");
  const audioChunks = useRef([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Path to the file saved in frontend/public/
  const audioSrc = "/audio_0.mp3";

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        await audio.pause();
      } else {
        await audio.play();
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error("Audio play/pause error:", err);
    }
  };

  const { userId } = useUserContext();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((mediaStream) => setStream(mediaStream))
      .catch(console.error);
  }, []);


  const handleMicClick = async () => {
    if (!isListening) {
      // Start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/wav" });
        setAudioBlob(blob);
        // proceed to scanning
        startCapture();
        setPageState("SCANNING");
      };

      mediaRecorder.start();
      setIsListening(true);

      // auto stop after 4 seconds
      setTimeout(() => {
        mediaRecorder.stop();
        setIsListening(false);
      }, 4000);
    }
  };

  async function startCapture() {
    setMessage("Starting webcam...");
    setIsCapturing(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setMessage("Capturing frame...");
      captureFrames(stream);
    } catch (err) {
      console.error("Camera error:", err);
      setMessage("Error: Unable to access webcam");
      setIsCapturing(false);
    }
  }

  async function captureFrames(stream) {
    const delay = 3000;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!canvas || !video) {
      console.error("Canvas or video not ready");
      return;
    }

    const ctx = canvas.getContext("2d");
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error("Video not ready to capture frame");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.9));
    if (!blob) return;

    setImageBlob(blob);
    setMessage("✅ Captured image and stopped webcam");
    setIsCapturing(false);
  }

  // -----------------------------
  // 📤 Handle Story Generation
  // -----------------------------
  useEffect(() => {
    if (pageState === "STORY_GENERATION") {
      const generateStory = async () => {
        try {
          const result = await handleSubmit();
          console.log("result", result)
          // ✅ Only proceed if backend returned success and story data
          if (result && result.status === "true") {
            // Prepare story data for saving
            const storyData = {
              userId: result.userId,
              mood: result.mood,
              audioMood: result.audioMood,
              imageMood: result.imageMood,
              words: result.words,
              title: result.title,
              body: result.body,
              genre: result.genre || "any",
            };

            try {
              const saveResponse = await fetch("http://localhost:8000/save-story", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(storyData),
              });

              if (!saveResponse.ok) {
                console.error("Save story response not OK:", saveResponse.status);
                const text = await saveResponse.text();
                console.error("Save story raw response:", text);
              }

              const saveResult = await saveResponse.json();
              console.log("Story saved:", saveResult);
            } catch (error) {
              console.error("❌ Network fetch error:", error);
            }


            // ✅ Show story on UI
            setStory({
              title: result.title || "Untitled Story",
              text: result.body || "",
            });
            setDisplayedText([]);
            setTypewriterIndex(0);
            setPageState("STORY_DISPLAY");
          } else {
            console.error("Story generation failed:", result);
            setPageState("AUDIO_INPUT");
          }
        } catch (err) {
          console.error("Error generating story:", err);
          setPageState("AUDIO_INPUT");
        }
      };

      generateStory();
    }
  }, [pageState]);




  useEffect(() => {
    if (pageState !== "STORY_DISPLAY" || !story.text) return;

    console.log("RAW STORY TEXT >>>", JSON.stringify(story.text.slice(0, 50)));

    const cleanedText = story.text
      .replace(/<UNK>/g, "")
      .replace(/^[^A-Za-z0-9]+/, "")
      .trim();

    // Split into paragraphs (preserve double newlines)
    const paragraphs = cleanedText.split(/\n\s*\n/).filter(Boolean);
    console.log("PARAGRAPHS FOUND >>>", paragraphs.length);

    let allWords = [];
    let paragraphBreaks = [];

    paragraphs.forEach((p, i) => {
      const startIndex = allWords.length;
      const words = p.split(/\s+/).filter(Boolean);
      allWords = [...allWords, ...words];
      if (i < paragraphs.length - 1) {
        paragraphBreaks.push(startIndex + words.length - 1);
      }
    });

    if (allWords.length === 0) return;

    // show first word instantly
    setDisplayedText([{ word: allWords[0], id: 0 }]);
    let index = 1;

    const typeNext = () => {
      setDisplayedText((prev) => {
        const newText = [...prev, { word: allWords[index], id: index }];
        // when reaching paragraph end, insert a special marker
        if (paragraphBreaks.includes(index)) {
          newText.push({ word: "\n\n", id: `break-${index}` });
        }
        return newText;
      });
      index++;
      if (index < allWords.length) {
        setTimeout(typeNext, 160 + Math.random() * 60);
      }
    };

    const timeout = setTimeout(() => typeNext(), 150);

    return () => clearTimeout(timeout);
  }, [pageState, story.text]);


  const handleSubmit = async () => {
    if (!imageBlob || !audioBlob) {
      console.error("Missing blobs:", { imageBlob, audioBlob });
      return null;
    }

    const formData = new FormData();
    formData.append("image", imageBlob, "face1.jpg");
    formData.append("audio", audioBlob, "input.wav");
    formData.append("userId", userId);
    console.log(formData);


    try {
      const response = await fetch("http://127.0.0.1:8000/generate-story", {
        method: "POST",
        body: formData,
      });

      console.log("Response received:", response);

      if (response.ok) {
        const result = await response.json();
        setStory({
          title: result.title || "Untitled Story",
          text: result.body || "No story content available.",
        });
        // if (result.audio_path) setAudioPath(result.audio_path);
        console.log(result);
        return result;
      }
      else {
        console.error("Upload failed:", response.status);
        return null;
      }
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  };

  // -----------------------------
  // 🎨 UI Rendering
  // -----------------------------
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black font-sans">
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* 🎤 AUDIO INPUT PAGE */}
      {pageState === "AUDIO_INPUT" && (
        <div className="bg-gradient-to-br from-purple-900 to-black w-full h-full flex flex-col items-center justify-center text-white text-center p-4">
          <h1 className="text-3xl md:text-4xl mb-32 font-semibold tracking-wider">
            {question}
          </h1>
          <div
            className={`relative flex items-center justify-center w-48 h-48 rounded-full transition-all duration-300 ${isListening ? "animate-pulse-mic bg-pink-600/30" : "bg-pink-600/10"
              }`}
          >
            <button
              onClick={handleMicClick}
              className="p-8 bg-pink-600 rounded-full hover:bg-pink-700 transition-all"
            >
              <Mic className="w-16 h-16 text-white" />
            </button>
            {isListening && (
              <div className="absolute animate-speak-wave rounded-full border-4 border-pink-500 w-64 h-64 opacity-70" />
            )}
          </div>
          <p className="mt-30 text-lg text-gray-300">
            {isListening ? "Listening..." : "Tap the mic to start speaking"}
          </p>
        </div>
      )}

      {/* 📸 SCANNING PAGE */}
      {pageState === "SCANNING" && (
        <div className="w-full h-full flex items-center justify-center relative">
          <video
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            ref={(videoEl) => {
              videoRef.current = videoEl;
              if (videoEl && stream) videoEl.srcObject = stream;
            }}
          />
          <div className="absolute inset-0">
            <ScanningAnimation onComplete={() => setPageState("STORY_GENERATION")} />
          </div>
        </div>
      )}

      {/* 🧠 STORY GENERATION PAGE */}
      {pageState === "STORY_GENERATION" && (
        // <div className="bg-gradient-to-br from-pink-900 to-purple-700 w-full h-full flex flex-col items-center justify-center text-white">
        //   <h2 className="text-3xl mb-12 animate-pulse">
        //     Generating your story...
        //   </h2>
        //   <div className="flex items-center justify-center h-24 w-64 space-x-2">
        //     {[...Array(7)].map((_, i) => (
        //       <div key={i} className="siri-wave-bar" style={{ animationDelay: `${-0.2 * i}s` }}></div>
        //     ))}
        //   </div>
        // </div>

        <div className="bg-gradient-to-b from-[#050316] via-[#090019] to-[#14002b] w-full h-full flex flex-col items-center justify-center text-white relative overflow-hidden">

          {/* Internal Styles for the Slimy Animation to avoid external CSS */}
          <style>{`
  .goo-filter {
    filter: url(#goo);
    /* keep or remove this if you feel overall spin adds too much motion */
    animation: spinRing 18s linear infinite;
  }

  .blob {
    position: absolute;
    background: linear-gradient(135deg, #ec4899, #8b5cf6);
    border-radius: 50%;
    opacity: 0.9;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: alternate; /* prevents hard jump 100% → 0% */
  }

  .blob:nth-child(1) {
    width: 90px;
    height: 90px;
    left: 10%;
    top: 15%;
    animation-name: blobPath1;
    animation-duration: 5.2s;
    animation-delay: 0s;
  }

  .blob:nth-child(2) {
    width: 65px;
    height: 65px;
    right: 5%;
    top: 10%;
    animation-name: blobPath2;
    animation-duration: 4.6s;
    animation-delay: 0.4s;
  }

  .blob:nth-child(3) {
    width: 55px;
    height: 55px;
    left: 5%;
    bottom: 5%;
    animation-name: blobPath3;
    animation-duration: 4.9s;
    animation-delay: 0.8s;
  }

  .blob:nth-child(4) {
    width: 75px;
    height: 75px;
    right: 12%;
    bottom: 8%;
    animation-name: blobPath4;
    animation-duration: 5.6s;
    animation-delay: 1.2s;
  }

  /* Curvy, continuous paths (no harsh teleports) */

  @keyframes blobPath1 {
    0%   { transform: translate(0px,   0px)   scale(1); }
    20%  { transform: translate(24px, -8px)   scale(1.08); }
    40%  { transform: translate(40px, 18px)   scale(0.97); }
    60%  { transform: translate(14px, 34px)   scale(1.12); }
    80%  { transform: translate(-18px, 12px)  scale(1.03); }
    100% { transform: translate(-8px, -10px)  scale(1); }
  }

  @keyframes blobPath2 {
    0%   { transform: translate(0px,   0px)   scale(1); }
    20%  { transform: translate(-18px, 18px)  scale(1.06); }
    40%  { transform: translate(-34px, 2px)   scale(0.96); }
    60%  { transform: translate(-8px, -26px)  scale(1.13); }
    80%  { transform: translate(18px, -8px)   scale(1.02); }
    100% { transform: translate(6px, 10px)    scale(1); }
  }

  @keyframes blobPath3 {
    0%   { transform: translate(0px,   0px)   scale(1); }
    20%  { transform: translate(16px, 22px)   scale(1.09); }
    40%  { transform: translate(32px, 4px)    scale(0.95); }
    60%  { transform: translate(10px, -22px)  scale(1.14); }
    80%  { transform: translate(-20px, -6px)  scale(1.01); }
    100% { transform: translate(-8px, 8px)    scale(1); }
  }

  @keyframes blobPath4 {
    0%   { transform: translate(0px,   0px)   scale(1); }
    20%  { transform: translate(-22px, 8px)   scale(1.04); }
    40%  { transform: translate(-6px, 30px)   scale(1.16); }
    60%  { transform: translate(24px, 12px)   scale(0.94); }
    80%  { transform: translate(8px, -18px)   scale(1.1); }
    100% { transform: translate(-4px, -4px)   scale(1); }
  }

  @keyframes spinRing {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }
`}</style>


          {/* SVG Filter Definition (Hidden) - Creates the 'Goo' effect */}
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
              <filter id="goo">
                <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                  result="goo"
                />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
              </filter>
            </defs>
          </svg>

          {/* The Slimy Loader */}
          <div className="relative w-48 h-48 goo-filter mb-8">
            {/* Spinning/Moving Blobs */}
            <div className="blob"></div>
            <div className="blob"></div>
            <div className="blob"></div>
            <div className="blob"></div>
          </div>

          <h2 className="text-2xl mt-14 font-medium tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 animate-pulse">
            Generating your Story . . .
          </h2>

          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-600/20 rounded-full blur-[100px] animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
        </div>

      )}

      {/* 📖 STORY DISPLAY PAGE */}
      {pageState === "STORY_DISPLAY" && (
        <div className="bg-gradient-to-br from-black to-purple-900 w-full h-full text-white flex flex-col items-center relative p-6 pt-24 overflow-y-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
            {story.title}
          </h1>
          <div style={{ textAlign: "center", marginTop: "10px", marginBottom: "20px" }}>
            {/* hidden audio element */}
            <audio ref={audioRef} src={audioSrc} preload="auto" />

            <button
              onClick={toggleAudio}
              style={{
                padding: "10px 20px",
                fontSize: "18px",
                cursor: "pointer",
                borderRadius: "8px",
                backgroundColor: "#4A148c",
                color: "white",
                border: "none",
              }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}{" "}
              {/* {isPlaying ? "Pause Audio" : "Play Audio"} */}
            </button>
          </div>

          <p className="max-w-4xl text-lg text-justify leading-relaxed whitespace-pre-wrap">
            {displayedText.map(({ word, id }) => (
              <span key={id} className="ai-word">
                {word === "\n\n" ? "\n\n" : `${word} `}
              </span>
            ))}
          </p>


          {previewVisible && stream && (
            <video
              autoPlay
              playsInline
              muted
              className="fixed bottom-24 right-6 w-48 h-32 rounded-lg border-2 border-pink-500 shadow-lg object-cover"
              ref={(videoEl) => {
                if (videoEl) videoEl.srcObject = stream;
              }}
            />
          )}

          <div className="fixed bottom-6 right-6 flex gap-4">
            <button
              onClick={() => {
                if (stream)
                  stream
                    .getAudioTracks()
                    .forEach((track) => (track.enabled = !micEnabled));
                setMicEnabled(!micEnabled);
              }}
              className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition"
            >
              {micEnabled ? (
                <Mic className="w-6 h-6 text-green-400" />
              ) : (
                <MicOff className="w-6 h-6 text-red-500" />
              )}
            </button>
            <button
              onClick={() => setPreviewVisible(!previewVisible)}
              className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition"
            >
              <Video className="w-6 h-6 text-pink-500 animate-slow-glow" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Story;

