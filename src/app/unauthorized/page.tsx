export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-gray-300">You are not authorized to view this page.</p>
      </div>
    </main>
  );
}
