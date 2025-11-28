import { Smile, Frown, Meh, Laugh } from "lucide-react";
import { useEffect, useState } from "react";

export const MoodIcon = () => {
  const moods = [
    <Smile key="smile" className="w-10 h-10 text-purple-500 absolute" strokeWidth={1.5} />,
    <Frown key="frown" className="w-10 h-10 text-purple-500 absolute" strokeWidth={1.5} />,
    <Meh key="meh" className="w-10 h-10 text-purple-500 absolute" strokeWidth={1.5} />,
    <Laugh key="laugh" className="w-10 h-10 text-purple-500 absolute" strokeWidth={1.5} />,
  ];
  const [moodIndex, setMoodIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMoodIndex(prev => (prev + 1) % moods.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [moods.length]);

  return (
    <div className="relative w-10 h-10">
      {moods.map((mood, index) => (
        <div
          key={index}
          className={`transition-opacity duration-500 absolute ${index === moodIndex ? "opacity-100" : "opacity-0"
            }`}
        >
          {mood}
        </div>
      ))}
    </div>
  );
};