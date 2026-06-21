import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../../config/firebase";

interface Story {
  id: string;
  couple: string;
  date: string;
  image: string;
  story: string;
}

interface SuccessStoriesProps {
  onSelectStory: (story: Story) => void;
}

const SuccessStories: React.FC<SuccessStoriesProps> = ({ onSelectStory }) => {
  const [liveStories, setLiveStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "successStories"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          couple: `${d.partner1Name?.split(' ')[0] || "User"} & ${d.partner2Name?.split(' ')[0] || "User"}`,
          date: d.weddingDate || "Recently",
          image: d.photo || "https://images.unsplash.com/photo-1621616875450-79f22448040e?w=500&fit=crop",
          story: d.story || "We found our perfect match on Lohar Matrimony and are happily married now!"
        };
      });
      setLiveStories(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">Success Stories</h2>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Read about couples who found their perfect companion through Lohar Matrimony</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-maroon-700"></div>
        </div>
      ) : liveStories.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 rounded-3xl p-6 shadow-sm">
          <Heart className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No stories yet</p>
          <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">
            The first success stories from our new marriage request feature will appear here soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {liveStories.map(story => (
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
                  <p className="text-[11px] text-slate-655 dark:text-slate-350 italic mt-2.5 leading-relaxed line-clamp-3">"{story.story}"</p>
                </div>
                <span className="text-[9px] font-bold text-maroon-700 dark:text-gold-400 uppercase tracking-widest block">Verified Couple</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuccessStories;
