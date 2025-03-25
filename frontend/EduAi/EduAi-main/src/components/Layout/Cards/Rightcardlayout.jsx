import Bottomrightcard from "./rightcards/Bottomrightcard";
import Middlerightcard from "./rightcards/Middlerightcard";
import Toprightcard from "./rightcards/Toprightcard";

const Rightcardlayout = () => {
  return (
    <div className="grid  gap-2">
      <Toprightcard />
      <Middlerightcard/>
      <Bottomrightcard/>
    </div>
  );
};

export default Rightcardlayout;
