// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col p-4 md:p-0">
      {children}
    </div>
  );
}
