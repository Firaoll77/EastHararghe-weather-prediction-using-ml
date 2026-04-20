export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'resident' | 'farmer' | 'official' | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'resident' | 'farmer' | 'official' | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'resident' | 'farmer' | 'official' | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          location: string
          rainfall_prediction: number
          confidence_score: number
          weather_input: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          location: string
          rainfall_prediction: number
          confidence_score: number
          weather_input?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          location?: string
          rainfall_prediction?: number
          confidence_score?: number
          weather_input?: Json | null
          created_at?: string
        }
      }
      weather_history: {
        Row: {
          id: string
          location: string
          raw_weather_data: Json
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          location: string
          raw_weather_data: Json
          timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          location?: string
          raw_weather_data?: Json
          timestamp?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'resident' | 'farmer' | 'official'
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Prediction = Database['public']['Tables']['predictions']['Row']
export type WeatherHistory = Database['public']['Tables']['weather_history']['Row']
