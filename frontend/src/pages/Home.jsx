import { SignInButton, useUser } from "@clerk/clerk-react";
import video from "../assets/video.mp4";
import { Smile, Brain, Film, Music, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom"
const Home = () => {
  const { isSignedIn, user } = useUser();
  return (
    <div>
      <section className="relative pt-20 h-screen  text-white min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 md:px-20 overflow-hidden w-full">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        >
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Text Content */}
        <div className="max-w-3xl text-center md:text-left space-y-6 bg-gradient-to-tr from-black/5 to-black/0 backdrop-blur-xl p-6 sm:p-8 border border-white/30 rounded-2xl shadow-[inset_1px_1px_0px_rgba(255,255,255,0.2),0_4px_30px_rgba(0,0,0,0.1)] relative z-10">
          <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-b from-white/40/10 to-transparent" />
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
            Experience Storytelling, <br />
            Powered by Emotion & Sound.
          </h1>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto md:mx-0">
            Meet your AI storytelling companion — it listens to your mood, reacts in real-time,
            and brings tales to life with immersive audio and visuals.
            Stories that don’t just talk <span className="text-purple-400">— they feel.</span>
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {
              (isSignedIn) ?
                <>
                  <Link to={"/generate-story"}>
                    <button className="px-6 py-3 rounded-full text-white font-medium
                   bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500
                   bg-[length:200%_200%] animate-gradient-slow
                   hover:scale-101 transition-transform duration-300 shadow-lg shadow-purple-500/30 cursor-pointer">
                      Generate Story
                    </button>
                  </Link>
                </> :
                <>
                  <SignInButton>
                    <button className="px-6 py-3 rounded-full text-white font-medium
                   bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500
                   bg-[length:200%_200%] animate-gradient-slow
                   hover:scale-101 transition-transform duration-300 shadow-lg shadow-purple-500/30 cursor-pointer">
                      Generate Story
                    </button>
                  </SignInButton>
                </>
            }

            <Link to={"/dashboard"}> 
              <button
                className="px-6 py-3 border cursor-pointer border-gray-700 rounded-full hover:border-white transition"
              >
                Dashboard 
              </button>
            </Link>
          </div>
        </div>

        {/* 3D Gradient Blob */}
        <div className="absolute bottom-0 right-0 md:right-10 flex items-center justify-center pointer-events-none">
          <div className="w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-3xl opacity-30" />
        </div>

        {/* Floating Cards */}
        <div className="absolute bottom-10 left-4 sm:left-10">
          <div className="bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-purple-900/10 
                      backdrop-blur-xl border border-purple-500/40 shadow-lg shadow-purple-500/20
                      p-4 sm:p-5 rounded-2xl max-w-[240px] group transition-all duration-300 hover:scale-105">

            {/* Top row with icon + title */}
            <div className="flex items-center gap-2 mb-2">
              <Smile className="w-5 h-5 text-purple-300 group-hover:text-purple-200 transition-colors" />
              <p className="font-semibold text-white text-sm sm:text-base">Mood Detection</p>
            </div>

            {/* Description with subtle accent */}
            <div className="flex items-start gap-2 text-gray-300 text-xs sm:text-sm leading-snug">
              <Brain className="w-4 h-4 mt-0.5 text-purple-400/80" />
              <p>Understands tone & expressions in real-time with smart analysis.</p>
            </div>

            {/* Subtle glowing accent line */}
            <div className="mt-3 h-1 w-full rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient-flow" />
          </div>
        </div>

        <div className="absolute top-30 right-4 sm:right-10">
          <div className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-900/20 
                      backdrop-blur-xl border border-purple-500/40 shadow-lg shadow-purple-500/20
                      p-4 sm:p-5 rounded-2xl max-w-[240px] group transition-all duration-300 hover:scale-105">

            {/* Top row with icon + title */}
            <div className="flex items-center gap-2 mb-2">
              <Film className="w-5 h-5 text-purple-300 group-hover:text-purple-200 transition-colors" />
              <p className="font-semibold text-white text-sm sm:text-base">Audio Narration</p>
            </div>

            {/* Description with subtle accent */}
            <div className="flex items-start gap-2 text-gray-300 text-xs sm:text-sm leading-snug">
              <Music className="w-4 h-4 mt-0.5 text-purple-400/80" />
              <p>Dynamic Audio Narration for deeper immersion.</p>
            </div>

            {/* Animated AI-like glowing bottom line */}
            <div className="mt-3 h-1 w-full rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient-flow" />
          </div>
        </div>

      </section>

      <section className="w-full bg-black text-white py-20 px-6 md:px-16 relative">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* Left content */}
          <div>
            {/* Tag */}
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full 
                       bg-purple-600/20 text-purple-400 text-sm font-medium">
              About Us
            </span>

            {/* Text */}
            <h2 className="text-xl sm:text-2xl font-light leading-relaxed text-gray-200">
              Our project is a <strong>multimodal adaptive story generation system</strong>
              that uses audio and visual inputs to craft personalized narratives.
              Leveraging CNNs, LSTMs, and audio processing models like Librosa,
              our system learns and adapts to generate engaging stories for every user.
            </h2>

            {/* Arrows */}
            <div className="flex gap-4 mt-8">
              <button className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:border-purple-500 hover:text-purple-400 transition">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:border-purple-500 hover:text-purple-400 transition">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right image */}
          <div className="flex justify-center md:justify-end">
            <img
              src="/aboutModel.png"
              alt="AI 3D Shape"
              className="w-72 md:w-96"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 text-center mt-16 gap-8">
          <div>
            <h3 className="text-3xl font-bold">8+</h3>
            <p className="uppercase text-gray-400 tracking-wider text-sm mt-2">Emotions Detectable</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">500+</h3>
            <p className="uppercase text-gray-400 tracking-wider text-sm mt-2">Users Tested</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">92%</h3>
            <p className="uppercase text-gray-400 tracking-wider text-sm mt-2">User Satisfaction</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold">1.2k+</h3>
            <p className="uppercase text-gray-400 tracking-wider text-sm mt-2">Stories Generated</p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;