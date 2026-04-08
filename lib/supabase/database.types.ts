export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          actor_user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      leads: {
        Row: {
          id: string
          full_name: string
          whatsapp_number: string
          role: string
          child_name: string | null
          level: string
          subject: string
          exam_board: string
          availability: string
          city_timezone: string
          goals: string | null
          preferred_package: string | null
          status: string
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          whatsapp_number: string
          role: string
          child_name?: string | null
          level: string
          subject: string
          exam_board?: string
          availability: string
          city_timezone: string
          goals?: string | null
          preferred_package?: string | null
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          whatsapp_number?: string
          role?: string
          child_name?: string | null
          level?: string
          subject?: string
          exam_board?: string
          availability?: string
          city_timezone?: string
          goals?: string | null
          preferred_package?: string | null
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          request_id: string
          tutor_user_id: string
          status: Database["public"]["Enums"]["match_status_enum"]
          meet_link: string | null
          schedule_pattern: Json | null
          assigned_by_user_id: string | null
          assigned_at: string
          created_at: string
          updated_at: string
          admin_notes: string | null
        }
        Insert: {
          id?: string
          request_id: string
          tutor_user_id: string
          status?: Database["public"]["Enums"]["match_status_enum"]
          meet_link?: string | null
          schedule_pattern?: Json | null
          assigned_by_user_id?: string | null
          assigned_at?: string
          created_at?: string
          updated_at?: string
          admin_notes?: string | null
        }
        Update: {
          id?: string
          request_id?: string
          tutor_user_id?: string
          status?: Database["public"]["Enums"]["match_status_enum"]
          meet_link?: string | null
          schedule_pattern?: Json | null
          assigned_by_user_id?: string | null
          assigned_at?: string
          created_at?: string
          updated_at?: string
          admin_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_assigned_by_user_id_fkey"
            columns: ["assigned_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tutor_user_id_fkey"
            columns: ["tutor_user_id"]
            isOneToOne: false
            referencedRelation: "tutor_profiles"
            referencedColumns: ["tutor_user_id"]
          },
        ]
      }
      packages: {
        Row: {
          id: string
          request_id: string
          tier_sessions: number
          start_date: string
          end_date: string
          sessions_total: number
          sessions_used: number
          status: Database["public"]["Enums"]["package_status_enum"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id: string
          tier_sessions: number
          start_date: string
          end_date: string
          sessions_total: number
          sessions_used?: number
          status?: Database["public"]["Enums"]["package_status_enum"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          tier_sessions?: number
          start_date?: string
          end_date?: string
          sessions_total?: number
          sessions_used?: number
          status?: Database["public"]["Enums"]["package_status_enum"]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          package_id: string
          payer_user_id: string
          amount_pkr: number
          method: string
          reference: string | null
          proof_path: string | null
          status: Database["public"]["Enums"]["payment_status_enum"]
          rejection_note: string | null
          verified_by_user_id: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          package_id: string
          payer_user_id: string
          amount_pkr: number
          method?: string
          reference?: string | null
          proof_path?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"]
          rejection_note?: string | null
          verified_by_user_id?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          package_id?: string
          payer_user_id?: string
          amount_pkr?: number
          method?: string
          reference?: string | null
          proof_path?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"]
          rejection_note?: string | null
          verified_by_user_id?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payer_user_id_fkey"
            columns: ["payer_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payments_verified_by_user_id_fkey"
            columns: ["verified_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      requests: {
        Row: {
          id: string
          created_by_user_id: string
          requester_role: Database["public"]["Enums"]["role_enum"]
          for_student_name: string | null
          level: Database["public"]["Enums"]["level_enum"]
          subject_id: number
          exam_board: Database["public"]["Enums"]["exam_board_enum"]
          goals: string | null
          timezone: string
          availability_windows: Json
          preferred_start_date: string | null
          status: Database["public"]["Enums"]["request_status_enum"]
          preferred_package_tier: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_by_user_id: string
          requester_role?: Database["public"]["Enums"]["role_enum"]
          for_student_name?: string | null
          level: Database["public"]["Enums"]["level_enum"]
          subject_id: number
          exam_board?: Database["public"]["Enums"]["exam_board_enum"]
          goals?: string | null
          timezone?: string
          availability_windows?: Json
          preferred_start_date?: string | null
          status?: Database["public"]["Enums"]["request_status_enum"]
          preferred_package_tier?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_by_user_id?: string
          requester_role?: Database["public"]["Enums"]["role_enum"]
          for_student_name?: string | null
          level?: Database["public"]["Enums"]["level_enum"]
          subject_id?: number
          exam_board?: Database["public"]["Enums"]["exam_board_enum"]
          goals?: string | null
          timezone?: string
          availability_windows?: Json
          preferred_start_date?: string | null
          status?: Database["public"]["Enums"]["request_status_enum"]
          preferred_package_tier?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "requests_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          id: string
          match_id: string
          scheduled_start_utc: string
          scheduled_end_utc: string
          status: Database["public"]["Enums"]["session_status_enum"]
          tutor_notes: string | null
          updated_by_user_id: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          scheduled_start_utc: string
          scheduled_end_utc: string
          status?: Database["public"]["Enums"]["session_status_enum"]
          tutor_notes?: string | null
          updated_by_user_id?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          scheduled_start_utc?: string
          scheduled_end_utc?: string
          status?: Database["public"]["Enums"]["session_status_enum"]
          tutor_notes?: string | null
          updated_by_user_id?: string | null
          updated_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_updated_by_user_id_fkey"
            columns: ["updated_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subjects: {
        Row: {
          id: number
          code: string
          name: string
          active: boolean
          sort_order: number
        }
        Insert: {
          id?: number
          code: string
          name: string
          active?: boolean
          sort_order?: number
        }
        Update: {
          id?: number
          code?: string
          name?: string
          active?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      tutor_availability: {
        Row: {
          tutor_user_id: string
          windows: Json
          updated_at: string
        }
        Insert: {
          tutor_user_id: string
          windows?: Json
          updated_at?: string
        }
        Update: {
          tutor_user_id?: string
          windows?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_availability_tutor_user_id_fkey"
            columns: ["tutor_user_id"]
            isOneToOne: true
            referencedRelation: "tutor_profiles"
            referencedColumns: ["tutor_user_id"]
          },
        ]
      }
      tutor_profiles: {
        Row: {
          tutor_user_id: string
          approved: boolean
          bio: string | null
          timezone: string
          experience_years: number | null
          education: string | null
          teaching_approach: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          tutor_user_id: string
          approved?: boolean
          bio?: string | null
          timezone?: string
          experience_years?: number | null
          education?: string | null
          teaching_approach?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          tutor_user_id?: string
          approved?: boolean
          bio?: string | null
          timezone?: string
          experience_years?: number | null
          education?: string | null
          teaching_approach?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_profiles_tutor_user_id_fkey"
            columns: ["tutor_user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tutor_subjects: {
        Row: {
          tutor_user_id: string
          subject_id: number
          level: Database["public"]["Enums"]["level_enum"]
        }
        Insert: {
          tutor_user_id: string
          subject_id: number
          level: Database["public"]["Enums"]["level_enum"]
        }
        Update: {
          tutor_user_id?: string
          subject_id?: number
          level?: Database["public"]["Enums"]["level_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "tutor_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_subjects_tutor_user_id_fkey"
            columns: ["tutor_user_id"]
            isOneToOne: false
            referencedRelation: "tutor_profiles"
            referencedColumns: ["tutor_user_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          user_id: string
          display_name: string
          whatsapp_number: string | null
          timezone: string
          primary_role: Database["public"]["Enums"]["role_enum"]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          display_name: string
          whatsapp_number?: string | null
          timezone?: string
          primary_role?: Database["public"]["Enums"]["role_enum"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          display_name?: string
          whatsapp_number?: string | null
          timezone?: string
          primary_role?: Database["public"]["Enums"]["role_enum"]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          user_id: string
          role: Database["public"]["Enums"]["role_enum"]
          created_at: string
        }
        Insert: {
          user_id: string
          role: Database["public"]["Enums"]["role_enum"]
          created_at?: string
        }
        Update: {
          user_id?: string
          role?: Database["public"]["Enums"]["role_enum"]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          p_uid: string
          p_role: Database["public"]["Enums"]["role_enum"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          p_uid: string
        }
        Returns: boolean
      }
      is_tutor: {
        Args: {
          p_uid: string
        }
        Returns: boolean
      }
      increment_sessions_used: {
        Args: {
          p_request_id: string
        }
        Returns: undefined
      }
      decrement_sessions_used: {
        Args: {
          p_request_id: string
        }
        Returns: undefined
      }
      checkout_package: {
        Args: {
          p_request_id: string
          p_tier_sessions: number
        }
        Returns: string
      }
      tutor_update_session: {
        Args: {
          p_session_id: string
          p_status: Database["public"]["Enums"]["session_status_enum"]
          p_notes: string
        }
        Returns: undefined
      }
    }
    Enums: {
      exam_board_enum: "cambridge" | "edexcel" | "other" | "unspecified"
      level_enum: "o_levels" | "a_levels"
      match_status_enum: "matched" | "active" | "paused" | "ended"
      package_status_enum: "pending" | "active" | "expired"
      payment_status_enum: "pending" | "paid" | "rejected" | "refunded"
      request_status_enum:
        | "new"
        | "payment_pending"
        | "ready_to_match"
        | "matched"
        | "active"
        | "paused"
        | "ended"
      role_enum: "student" | "parent" | "tutor" | "admin"
      session_status_enum:
        | "scheduled"
        | "done"
        | "rescheduled"
        | "no_show_student"
        | "no_show_tutor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
