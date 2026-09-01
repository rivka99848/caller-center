import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: "agent" | "admin";
  }
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      role?: "agent" | "admin";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "agent" | "admin";
  }
}
