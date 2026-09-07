import { useState } from "react";
import { Icon } from "./Icon";
export function CourseArtwork({ image, title, index = 0 }: { image?: string | null; title: string; index?: number }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const tone = ["emerald", "blue", "violet"][index % 3];
  const icon = /back|java|python|server/i.test(title) ? "terminal" : /full|stack/i.test(title) ? "layers" : "code";
  return <div className={"course-artwork course-artwork--" + tone}>
    {image && failedImage !== image ? <img src={image} alt="" loading="lazy" onError={() => setFailedImage(image)} /> : <>
      <span className="artwork-grid" /><span className="artwork-orb" />
      <div className="artwork-window"><div className="artwork-dots"><i /><i /><i /></div><Icon name={icon} size={52} /><div className="artwork-lines"><i /><i /><i /></div></div>
      <span className="artwork-sticker"><Icon name="spark" size={14} /> BUILD SOMETHING REAL</span>
    </>}
  </div>;
}
