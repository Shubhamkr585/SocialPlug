// app/page.tsx
import { redirect } from "next/navigation";
import { auth, clerkMiddleware,createRouteMatcher } from '@clerk/nextjs/server'

export default function Page() {

  const  userId  =  auth();
  if (!userId) {
    redirect("/sign-in");
  }
  redirect("/home"); 
}
