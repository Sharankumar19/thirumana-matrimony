// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 bg-gradient-to-b from-rose-50/30 to-white w-full">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
