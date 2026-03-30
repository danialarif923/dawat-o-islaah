export function parseTafseerText(text) {
  // Split text by all bracket patterns while keeping the brackets
  const parts = text.split(
    /(\{[^}]*\}|\[[^\]]*\]|«[^»]*»|[➊➋➌➍➎➏➐➑➒➓⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿])/
  );

  return parts.map((part, index) => {
    // Check if this part matches any bracket pattern
    if (part.startsWith("«") && part.endsWith("»")) {
      return (
        <span key={index} className="text-red-600 font-quran text-2xl">
          {part}
        </span>
      );
    } else if (part.startsWith("{") && part.endsWith("}")) {
      // Quran verse - remove brackets and apply green + font-quran

      return (
        <span key={index} className="text-green-600 font-quran text-2xl">
          {part}
        </span>
      );
    } else if (part.startsWith("[") && part.endsWith("]")) {
      return (
        <span key={index} className="text-blue-600 font-hadith text-2xl">
          {part}
        </span>
      );
    } else if (
      /[➊➋➌➍➎➏➐➑➒➓⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿]/.test(
        part
      )
    ) {
      return (
        <span key={index} className="text-[#C9A227] text-2xl">
          {part}
        </span>
      );
    } else {
      // Regular text - no styling
      return <span key={index}>{part}</span>;
    }
  });
}
