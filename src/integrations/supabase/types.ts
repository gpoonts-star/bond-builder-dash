export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          answer_text: string
          created_at: string | null
          daily_question_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          answer_text: string
          created_at?: string | null
          daily_question_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          answer_text?: string
          created_at?: string | null
          daily_question_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_daily_question_id_fkey"
            columns: ["daily_question_id"]
            isOneToOne: false
            referencedRelation: "daily_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          alarmable: boolean | null
          couple_id: string
          created_at: string | null
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          place: string | null
          title: string
        }
        Insert: {
          alarmable?: boolean | null
          couple_id: string
          created_at?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          place?: string | null
          title: string
        }
        Update: {
          alarmable?: boolean | null
          couple_id?: string
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          place?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_souvenirs: {
        Row: {
          couple_id: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          memory_date: string
          memory_time: string | null
          place: string | null
          title: string
        }
        Insert: {
          couple_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          memory_date: string
          memory_time?: string | null
          place?: string | null
          title: string
        }
        Update: {
          couple_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          memory_date?: string
          memory_time?: string | null
          place?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_souvenirs_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_todos: {
        Row: {
          couple_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
        }
        Insert: {
          couple_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority: string
          status?: string
          title: string
        }
        Update: {
          couple_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_todos_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message_text: string
          sender_id: string | null
          thread_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_text: string
          sender_id?: string | null
          thread_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message_text?: string
          sender_id?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          couple_id: string | null
          created_at: string | null
          daily_question_id: string | null
          id: string
        }
        Insert: {
          couple_id?: string | null
          created_at?: string | null
          daily_question_id?: string | null
          id?: string
        }
        Update: {
          couple_id?: string | null
          created_at?: string | null
          daily_question_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_daily_question_id_fkey"
            columns: ["daily_question_id"]
            isOneToOne: false
            referencedRelation: "daily_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          created_at: string | null
          id: string
          user1_id: string
          user2_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          user1_id: string
          user2_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          user1_id?: string
          user2_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couples_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couples_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_questions: {
        Row: {
          couple_id: string | null
          created_at: string | null
          id: string
          question_id: string | null
          scheduled_for: string
        }
        Insert: {
          couple_id?: string | null
          created_at?: string | null
          id?: string
          question_id?: string | null
          scheduled_for: string
        }
        Update: {
          couple_id?: string | null
          created_at?: string | null
          id?: string
          question_id?: string | null
          scheduled_for?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_questions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          couple_updates_enabled: boolean | null
          created_at: string | null
          daily_questions_enabled: boolean | null
          email_enabled: boolean | null
          events_enabled: boolean | null
          general_notifications_enabled: boolean | null
          id: string
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          quiz_invites_enabled: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          couple_updates_enabled?: boolean | null
          created_at?: string | null
          daily_questions_enabled?: boolean | null
          email_enabled?: boolean | null
          events_enabled?: boolean | null
          general_notifications_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          quiz_invites_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          couple_updates_enabled?: boolean | null
          created_at?: string | null
          daily_questions_enabled?: boolean | null
          email_enabled?: boolean | null
          events_enabled?: boolean | null
          general_notifications_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          quiz_invites_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_deleted: boolean | null
          is_read: boolean | null
          message: string
          priority: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_read?: boolean | null
          message: string
          priority?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_read?: boolean | null
          message?: string
          priority?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          completed: boolean | null
          country: string | null
          created_at: string | null
          gender: string | null
          id: string
          interests: string[] | null
          invite_code: string | null
          mood: string | null
          name: string
          profile_picture: string | null
        }
        Insert: {
          birth_date?: string | null
          completed?: boolean | null
          country?: string | null
          created_at?: string | null
          gender?: string | null
          id: string
          interests?: string[] | null
          invite_code?: string | null
          mood?: string | null
          name: string
          profile_picture?: string | null
        }
        Update: {
          birth_date?: string | null
          completed?: boolean | null
          country?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          invite_code?: string | null
          mood?: string | null
          name?: string
          profile_picture?: string | null
        }
        Relationships: []
      }
      pulses: {
        Row: {
          created_at: string | null
          emoji: string
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          content: string
          created_at: string | null
          id: string
          scheduled_time: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          scheduled_time?: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          scheduled_time?: string
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answer_value: number
          answered_at: string | null
          couple_id: string
          created_at: string | null
          id: string
          question_id: string
          quiz_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answer_value: number
          answered_at?: string | null
          couple_id: string
          created_at?: string | null
          id?: string
          question_id: string
          quiz_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answer_value?: number
          answered_at?: string | null
          couple_id?: string
          created_at?: string | null
          id?: string
          question_id?: string
          quiz_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_invites: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          message: string | null
          quiz_id: string | null
          receiver_id: string | null
          sender_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          quiz_id?: string | null
          receiver_id?: string | null
          sender_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          quiz_id?: string | null
          receiver_id?: string | null
          sender_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          content: string
          created_at: string | null
          id: string
          ord: number
          quiz_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          ord?: number
          quiz_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          ord?: number
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          computed_at: string | null
          couple_id: string
          first_answered_by: string | null
          id: string
          quiz_id: string
          score: number
          strengths: Json
          user1_percent: number
          user2_percent: number
          weaknesses: Json
        }
        Insert: {
          computed_at?: string | null
          couple_id: string
          first_answered_by?: string | null
          id?: string
          quiz_id: string
          score: number
          strengths?: Json
          user1_percent: number
          user2_percent: number
          weaknesses?: Json
        }
        Update: {
          computed_at?: string | null
          couple_id?: string
          first_answered_by?: string | null
          id?: string
          quiz_id?: string
          score?: number
          strengths?: Json
          user1_percent?: number
          user2_percent?: number
          weaknesses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_results_first_answered_by_fkey"
            columns: ["first_answered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_results_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_themes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          theme_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          theme_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          theme_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "quiz_themes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
