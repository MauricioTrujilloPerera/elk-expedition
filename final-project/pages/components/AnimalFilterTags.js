import React from "react";

// List of animals with display name and image URL (use public/animalname.png or .svg for now)
export const ANIMALS = [
  { value: "whitetail", label: "Whitetail Deer", img: "/animals/whitetail.png" },
  { value: "muledeer", label: "Mule Deer", img: "/animals/muledeer.png" },
  { value: "elk", label: "Elk", img: "/animals/elk.png" },
  { value: "moose", label: "Moose", img: "/animals/moose.png" },
  { value: "blackbear", label: "Black Bear", img: "/animals/blackbear.png" },
  { value: "grizzlybear", label: "Grizzly Bear", img: "/animals/grizzlybear.png" },
  { value: "caribou", label: "Caribou", img: "/animals/caribou.png" },
  { value: "bighorn", label: "Bighorn Sheep", img: "/animals/bighorn.png" },
  { value: "dallsheep", label: "Dall Sheep", img: "/animals/dallsheep.png" },
  { value: "mountaingoat", label: "Mountain Goat", img: "/animals/mountaingoat.png" },
  { value: "wolf", label: "Wolf", img: "/animals/wolf.png" },
  { value: "coyote", label: "Coyote", img: "/animals/coyote.png" },
  { value: "cougar", label: "Cougar", img: "/animals/cougar.png" },
  { value: "lynx", label: "Lynx", img: "/animals/lynx.png" },
  { value: "bobcat", label: "Bobcat", img: "/animals/bobcat.png" },
  { value: "wildturkey", label: "Wild Turkey", img: "/animals/wildturkey.png" },
  { value: "ptarmigan", label: "Ptarmigan", img: "/animals/ptarmigan.png" },
  { value: "grouse", label: "Grouse", img: "/animals/grouse.png" },
  { value: "duck", label: "Duck", img: "/animals/duck.png" },
  { value: "goose", label: "Goose", img: "/animals/goose.png" },
  { value: "pheasant", label: "Pheasant", img: "/animals/pheasant.png" },
  { value: "rabbit", label: "Rabbit", img: "/animals/rabbit.png" },
  { value: "snowshoehare", label: "Snowshoe Hare", img: "/animals/snowshoehare.png" },
  { value: "squirrel", label: "Squirrel", img: "/animals/squirrel.png" },
];

export default function AnimalFilterTags({ selected, onRemove }) {
  if (!selected || selected.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {selected.map((tag) => {
        // If tag matches an animal, show image, else just label
        const info = ANIMALS.find((a) => a.value === tag);
        return (
          <span key={tag} className="flex items-center bg-gray-800 text-cream px-3 py-1 rounded-full shadow border border-amber-400 gap-2">
            {info && info.img && (
              <img src={info.img} alt={info.label} className="w-6 h-6 rounded-full object-cover bg-gray-700" />
            )}
            <span className="mr-1">{info ? info.label : tag}</span>
            <button type="button" onClick={() => onRemove(tag)} className="ml-1 text-amber-400 hover:text-red-500 font-bold text-lg leading-none">&times;</button>
          </span>
        );
      })}
    </div>
  );
} 