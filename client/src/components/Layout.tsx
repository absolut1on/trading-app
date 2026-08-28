import { ReactNode } from "react";
import Header from "./Header";
import "../styles/layout.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="layout__content">{children}</main>
    </>
  );
}
