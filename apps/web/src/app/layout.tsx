import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Duo Experience | 비공식 풍자 시뮬레이터",
  description: "접고, 펼치고, 직접 체험하는 가상 폴더블폰 인터랙션. 실제 기기나 공식 서비스가 아닙니다.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
