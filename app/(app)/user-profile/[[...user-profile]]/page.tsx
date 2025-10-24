import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
  return (
    <div className="flex justify-center">
      <UserProfile path="/user-profile" />
    </div>
  );
}