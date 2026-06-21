import React from "react";
import { Heart } from "lucide-react";

interface Story {
  id: number;
  couple: string;
  date: string;
  malePhoto: string;
  femalePhoto: string;
  image: string;
  story: string;
}

interface SuccessStoriesProps {
  onSelectStory: (story: Story) => void;
}

const stories: Story[] = [
  {
    id: 1,
    couple: "Amit & Smita (Mumbai)",
    date: "12-Nov-2025",
    malePhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop",
    femalePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop",
    image: "https://images.unsplash.com/photo-1621616875450-79f22448040e?w=500&fit=crop",
    story: "We registered in August 2025 and matched within 3 weeks. Our families met and immediately finalized the marriage. Truly grateful!"
  },
  {
    id: 2,
    couple: "Rajesh & Aarti (Pune)",
    date: "04-Jan-2026",
    malePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    femalePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500&fit=crop",
    story: "Finding a software engineer within the Panchal sub-caste seemed hard, but this portal made filtering effortless. We are happily married now."
  },
  {
    id: 3,
    couple: "Neha & Suresh (Nashik)",
    date: "18-Feb-2026",
    malePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
    femalePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop",
    image: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=500&fit=crop",
    story: "It was love at first interest request! Sending direct chats using the Gold membership premium credit was definitely worth it."
  },
  {
    id: 4,
    couple: "Anjali & Manoj (Nagpur)",
    date: "10-Mar-2026",
    malePhoto: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&h=300&fit=crop",
    femalePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&fit=crop",
    story: "Aadhaar verification badges gave us the security and trust we needed. Very clean interface and helpful relationship managers."
  }
];

const SuccessStories: React.FC<SuccessStoriesProps> = ({ onSelectStory }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">Success Stories</h2>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Read about couples who found their perfect companion through Lohar Matrimony</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stories.map(story => (
          <div
            key={story.id}
            onClick={() => onSelectStory(story)}
            className="bg-white dark:bg-dark-900 border border-slate-150 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col sm:flex-row h-full"
          >
            <div className="sm:w-1/3 relative h-40 sm:h-auto min-h-[120px]">
              <img src={story.image} alt={story.couple} className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="p-4 sm:w-2/3 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <Heart className="h-4 w-4 text-maroon-700 fill-maroon-700" /> {story.couple}
                </h4>
                <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Marriage fixed on {story.date}</span>
                <p className="text-[11px] text-slate-655 dark:text-slate-350 italic mt-2.5 leading-relaxed">"{story.story}"</p>
              </div>
              <span className="text-[9px] font-bold text-maroon-700 dark:text-gold-400 uppercase tracking-widest block">Verified Couple</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuccessStories;
