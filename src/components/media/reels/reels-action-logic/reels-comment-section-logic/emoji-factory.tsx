"use client"

// =========================================================
// UG-CONNECT - EMOJI FACTORY - PRO GENRE DETECTION
// =========================================================

export type GenreType = 
  | "horror" 
  | "comedy" 
  | "romance" 
  | "action" 
  | "thriller" 
  | "drama" 
  | "scifi" 
  | "crime"
  | "default"

export type EmojiPack = {
  genre: GenreType
  label: string
  emojis: string[] // each is 3x like 🔥🔥🔥
}

// PRO PRESETS - 3 in a row as you wanted
export const EMOJI_FACTORY: Record<GenreType, EmojiPack> = {
  horror: {
    genre: "horror",
    label: "Horror Vibes",
    emojis: ["😱😱😱", "🥶🥶🥶", "😭😭💀", "💀💀💀", "🤯🤯🤯"]
  },
  comedy: {
    genre: "comedy",
    label: "Funny Vibes",
    emojis: ["🤣🤣🤣", "😭😭💀", "💀💀💀", "🤣💀🤣", "😂😂😂"]
  },
  romance: {
    genre: "romance",
    label: "Love Vibes",
    emojis: ["😍😍😍", "🥰🥰🥰", "😘😘😘", "❤️❤️❤️", "😭❤️😭"]
  },
  action: {
    genre: "action",
    label: "Action Vibes",
    emojis: ["🔥🔥🔥", "💥💥💥", "🫡🫡🫡", "😤😤😤", "💪💪💪"]
  },
  thriller: {
    genre: "thriller",
    label: "Thriller Vibes",
    emojis: ["🤯🤯🤯", "😱😱😱", "🥶🥶🥶", "😳😳😳", "👀👀👀"]
  },
  drama: {
    genre: "drama",
    label: "Drama Vibes",
    emojis: ["😭😭💀", "🥺🥺🥺", "😢😢😢", "💔💔💔", "🫡🫡🫡"]
  },
  scifi: {
    genre: "scifi",
    label: "SciFi Vibes",
    emojis: ["🤯🤯🤯", "👽👽👽", "🚀🚀🚀", "🔥🔥🔥", "🫡🫡🫡"]
  },
  crime: {
    genre: "crime",
    label: "Crime Vibes",
    emojis: ["💀💀💀", "🥶🥶🥶", "🫡🫡🫡", "😤😤😤", "🔥🔥🔥"]
  },
  default: {
    genre: "default",
    label: "Trending",
    emojis: ["🔥🔥🔥", "🤣🤣🤣", "😭😭💀", "😍😍😍", "🤯🤯🤯", "💀💀💀", "🥶🥶🥶", "🫡🫡🫡", "😱😱😱"]
  }
}

// =========================================================
// GENRE DETECTOR - Handles your movie object from API
// =========================================================
export function detectMovieGenre(movie: any): GenreType {
  if (!movie) return "default"
  
  // Your API can have genre in many places - check all
  const rawGenre = (
    movie.genre ||
    movie.genres?.[0] ||
    movie.category ||
    movie.categories?.[0] ||
    movie.type ||
    movie.tags?.join(" ") ||
    movie.description ||
    ""
  ).toString().toLowerCase()

  if (rawGenre.includes("horror") || rawGenre.includes("scary") || rawGenre.includes("terror") || rawGenre.includes("ghost") || rawGenre.includes("zombie")) return "horror"
  if (rawGenre.includes("comedy") || rawGenre.includes("funny") || rawGenre.includes("humor") || rawGenre.includes("laugh")) return "comedy"
  if (rawGenre.includes("romance") || rawGenre.includes("love") || rawGenre.includes("romantic") || rawGenre.includes("kiss")) return "romance"
  if (rawGenre.includes("action") || rawGenre.includes("fight") || rawGenre.includes("war") || rawGenre.includes("adventure") || rawGenre.includes("superhero")) return "action"
  if (rawGenre.includes("thrill") || rawGenre.includes("mystery") || rawGenre.includes("suspense") || rawGenre.includes("psycho")) return "thriller"
  if (rawGenre.includes("drama") || rawGenre.includes("emotional") || rawGenre.includes("family")) return "drama"
  if (rawGenre.includes("sci") || rawGenre.includes("fantasy") || rawGenre.includes("alien") || rawGenre.includes("space") || rawGenre.includes("future")) return "scifi"
  if (rawGenre.includes("crime") || rawGenre.includes("mafia") || rawGenre.includes("gang") || rawGenre.includes("detective") || rawGenre.includes("murder")) return "crime"

  return "default"
}

// =========================================================
// FACTORY METHOD - GET EMOJIS
// =========================================================
export function getEmojisForMovie(movie: any): EmojiPack {
  const genre = detectMovieGenre(movie)
  return EMOJI_FACTORY[genre] || EMOJI_FACTORY.default
}

// =========================================================
// COMPONENT - READY TO IMPORT INTO COMMENT BODY
// =========================================================
export function EmojiFactoryBar({
  movie,
  onPick,
}: {
  movie: any
  onPick: (emoji: string) => void
}) {
  const pack = getEmojisForMovie(movie)

  return (
    <div className="emoji-factory-bar">
      <div className="emoji-factory-scroll">
        {pack.emojis.map((emojiSet, idx) => (
          <button
            key={`${pack.genre}-${idx}`}
            type="button"
            className="emoji-factory-chip"
            onClick={() => onPick(emojiSet)}
            aria-label={`Add ${emojiSet}`}
          >
            {emojiSet}
          </button>
        ))}
      </div>
    </div>
  )
}

