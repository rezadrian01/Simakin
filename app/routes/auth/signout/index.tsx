import { signout } from "~/services/auth/auth.server";

export async function action({ request }: { request: Request }) {
  return signout(request);
}

// Redirect if accessed via GET
export async function loader() {
  throw new Response(null, {
    status: 404,
    statusText: "Not Found"
  });
}
