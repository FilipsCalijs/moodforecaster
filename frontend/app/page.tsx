'use client';
import LogoutButton from "@/components/LogoutButton";
import GPTStreamer from "@/components/GPTStreamer";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        {/* Верхняя панель с кнопкой выхода */}
        <div className="flex justify-end p-4 bg-gray-100 shadow">
          <LogoutButton />
        </div>

        {/* Основной контент */}
        <div className="flex-1 p-4">
          <GPTStreamer delay={100} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
