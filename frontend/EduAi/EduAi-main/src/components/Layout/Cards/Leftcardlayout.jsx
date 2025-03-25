import React from "react";
import Topleftcard from "./leftcards/Topleftcard";
import Middleleftcard from "./leftcards/Middleleftcard";
import Bottomleftcard from "./leftcards/Bottomleftcard";

const Leftcardlayout = () => {
  return (
    <div className="grid  gap-2">
      <Topleftcard />
      <Middleleftcard/>
      <Bottomleftcard />
       
    </div>
  );
};

export default Leftcardlayout;
