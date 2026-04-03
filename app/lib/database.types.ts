export type Database = {
  public: {
    Tables: {
      staff: {
        Row: {
          id: string
          email: string
          display_name: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          client_name: string
          phone: string
          service: string | null
          preferred_datetime: string | null
          notes: string | null
          request_type: 'new_booking' | 'change_time' | 'change_therapist' | 'other'
          status: 'open' | 'in_progress' | 'done'
          created_by: string
          last_updated_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name: string
          phone: string
          service?: string | null
          preferred_datetime?: string | null
          notes?: string | null
          request_type: 'new_booking' | 'change_time' | 'change_therapist' | 'other'
          status?: 'open' | 'in_progress' | 'done'
          created_by: string
          last_updated_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          phone?: string
          service?: string | null
          preferred_datetime?: string | null
          notes?: string | null
          request_type?: 'new_booking' | 'change_time' | 'change_therapist' | 'other'
          status?: 'open' | 'in_progress' | 'done'
          created_by?: string
          last_updated_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      push_subscriptions: {
        Row: {
          id: string
          staff_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          endpoint?: string
          p256dh?: string
          auth?: string
          created_at?: string
        }
      }
    }
    Enums: {
      task_status: 'open' | 'in_progress' | 'done'
      request_type: 'new_booking' | 'change_time' | 'change_therapist' | 'other'
    }
  }
}

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type Staff = Database['public']['Tables']['staff']['Row']
