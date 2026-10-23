// Character art from the official Fireboy & Watergirl wiki (resized to 320px tall in /public).
import Image from "next/image";
import fireboy from "../public/fireboy.png";
import watergirl from "../public/watergirl.png";

type IconProps = { className?: string };

export function FireboyIcon({ className }: IconProps) {
  return <Image src={fireboy} alt="Fireboy" className={className} />;
}

export function WatergirlIcon({ className }: IconProps) {
  return <Image src={watergirl} alt="Watergirl" className={className} />;
}
