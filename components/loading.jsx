import Image from "next/image";
import React from "react";

const Loading = () => {
  return (
    <Image
      src="/logo.png"
      alt="...Loading"
      width={200}
      height={200}
      className="animate-bounce"
    />
  );
};

export default Loading;
