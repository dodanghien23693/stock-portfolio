import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MUI Test - Vietnam Stock Platform",
  description: "Testing MUI components for Vietnam Stock Platform",
};

export default function MUITestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
