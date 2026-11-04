import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Duo Experience | 접힘선·크랙·앱 최적화 시뮬레이터", description: "가상의 폴더블폰에서 크랙과 앱 최적화 문제를 시각적으로 체험하는 비공식 데모입니다." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body>{children}</body></html>; }
