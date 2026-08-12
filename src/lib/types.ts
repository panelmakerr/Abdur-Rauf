export type Profile = {
  id: string;
  full_name: string;
  role: "admin" | "applicant";
  created_at: string;
};

export type Job = {
  id: string;
  title: string;
  department: string;
  description: string;
  status: "draft" | "active" | "archived";
  created_by: string | null;
  created_at: string;
};

export type Application = {
  id: string;
  job_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  cover_note: string;
  resume_storage_path: string;
  status: "received" | "reviewing" | "shortlisted" | "rejected";
  applied_at: string;
};

export type ApplicationStatus = Application["status"];

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "received",
  "reviewing",
  "shortlisted",
  "rejected",
];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  received: "Received",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      jobs: {
        Row: Job;
        Insert: Partial<Job>;
        Update: Partial<Job>;
        Relationships: [];
      };
      applications: {
        Row: Application;
        Insert: Partial<Application>;
        Update: Partial<Application>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      set_admin: { Args: { target_email: string }; Returns: undefined };
    };
    Enums: {};
    CompositeTypes: {};
  };
};