import React from "react";
import Image from "next/image";

interface BillComIconProps {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

export default function BillComIcon({ width = 96, height = 24, className, alt = "Bill.com" }: BillComIconProps) {
  return (
    <Image
      src="/icons/billcom.svg"
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}


