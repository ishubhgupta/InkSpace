import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function TestAuthPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Session Error</h1>
        <p>{sessionError.message}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">No Session Found</h1>
        <p>You need to log in first</p>
        <a href="/login" className="text-blue-600 underline">
          Go to Login
        </a>
      </div>
    );
  }

  // Try to get user profile
  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (profileError) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Profile Error</h1>
        <p>{profileError.message}</p>
        <div className="mt-4">
          <h3 className="font-bold">Session Info:</h3>
          <pre className="text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(session.user, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-green-600">
        ✅ Authentication Working!
      </h1>

      <div className="mt-6 space-y-4">
        <div>
          <h3 className="font-bold">Session User:</h3>
          <pre className="text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(session.user, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-bold">User Profile:</h3>
          <pre className="text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(userProfile, null, 2)}
          </pre>
        </div>

        <div className="flex gap-4">
          <a
            href="/dashboard"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go to Dashboard
          </a>
          <a href="/login" className="bg-gray-600 text-white px-4 py-2 rounded">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
